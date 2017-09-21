
/**
 * y-xml - Xml Type for Yjs
 * @version v11.0.0-6
 * @license MIT
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var diff = _interopDefault(require('fast-diff'));

function reflectChangesOnDom (yxml) {
  yxml.observe(event => {
    if (yxml.dom != null) {
      yxml._mutualExclude(() => {
        let anchorViewPosition = getAnchorViewPosition(yxml._scrollElement);
        if (event.type === 'attributeChanged') {
          yxml.dom.setAttribute(event.name, event.value);
        } else if (event.type === 'attributeRemoved') {
          yxml.dom.removeAttribute(event.name);
        } else if (event.type === 'childInserted' || event.type === 'insert') {
          let nodes = event.values;
          for (let i = nodes.length - 1; i >= 0; i--) {
            let node = nodes[i];
            node.setDomFilter(yxml._domFilter);
            node.enableSmartScrolling(yxml._scrollElement);
            let dom = node.getDom();
            let fixPosition;
            if (anchorViewPosition.anchor !== null || getBoundingClientRect(dom).top <= 0) {
              fixPosition = anchorViewPosition;
            } else {
              fixPosition = null;
            }
            let nextDom = null;
            if (yxml._content.length > event.index + i + 1) {
              nextDom = yxml.get(event.index + i + 1).getDom();
            }
            yxml.dom.insertBefore(dom, nextDom);
            fixScrollPosition(yxml._scrollElement, fixPosition);
          }
        } else if (event.type === 'childRemoved' || event.type === 'delete') {
          for (let i = event.values.length - 1; i >= 0; i--) {
            let dom = event.values[i].dom;
            let fixPosition;
            if (anchorViewPosition.anchor !== null || getBoundingClientRect(dom).top <= 0) {
              fixPosition = anchorViewPosition;
            } else {
              fixPosition = null;
            }
            dom.remove();
            fixScrollPosition(yxml._scrollElement, fixPosition);
          }
        }
      });
    }
  });
}

function getAnchorViewPosition (scrollElement) {
  if (scrollElement === null) {
    return null
  }
  let anchor = document.getSelection().anchorNode;
  if (anchor != null) {
    let top = getBoundingClientRect(anchor).top;
    if (top >= 0 && top <= document.documentElement.clientHeight) {
      return {
        anchor: anchor,
        top: top
      }
    }
  }
  return {
    anchor: null,
    scrollTop: scrollElement.scrollTop,
    scrollHeight: scrollElement.scrollHeight
  }
}

// get BoundingClientRect that works on text nodes
function getBoundingClientRect (element) {
  if (element.getBoundingClientRect != null) {
    // is element node
    return element.getBoundingClientRect()
  } else {
    // is text node
    if (element.parentNode == null) {
      // range requires that text nodes have a parent
      let span = document.createElement('span');
      span.appendChild(element);
    }
    let range = document.createRange();
    range.selectNode(element);
    return range.getBoundingClientRect()
  }
}

function fixScrollPosition (scrollElement, fix) {
  if (scrollElement !== null && fix !== null) {
    if (fix.anchor === null) {
      if (scrollElement.scrollTop === fix.scrollTop) {
        scrollElement.scrollTop += scrollElement.scrollHeight - fix.scrollHeight;
      }
    } else {
      scrollElement.scrollTop += getBoundingClientRect(fix.anchor).top - fix.top;
    }
  }
}

function defaultDomFilter (node, attributes) {
  return attributes
}

/*
 * 1. Check if any of the nodes was deleted
 * 2. Iterate over the children.
 *    2.1 If a node exists without __yxml property, insert a new node
 *    2.2 If _contents.length < dom.childNodes.length, fill the
 *        rest of _content with childNodes
 *    2.3 If a node was moved, delete it and
 *       recreate a new yxml element that is bound to that node.
 *       You can detect that a node was moved because expectedId
 *       !== actualId in the list
 */
function applyChangesFromDom (yxml) {
  // list of known children. anything else should be deleted
  let knownChildren =
    new Set(
      Array.prototype.map.call(yxml.dom.childNodes, child => child.__yxml)
      .filter(id => id !== undefined)
    );
  // 1. Check if any of the nodes was deleted
  for (let i = yxml._content.length - 1; i >= 0; i--) {
    let childType = yxml.get(i);
    if (!knownChildren.has(childType)) {
      yxml.delete(i, 1);
    }
  }
  // 2. iterate
  let childNodes = yxml.dom.childNodes;
  let len = childNodes.length;
  for (let domCnt = 0, yCnt = 0; domCnt < len; domCnt++) {
    let child = childNodes[domCnt];
    if (child.__yxml != null) {
      if (child.__yxml === false) {
        // should be ignored or is going to be deleted
        continue
      }
      if (yCnt < yxml.length) {
        let expectedNode = yxml.get(yCnt);
        if (expectedNode !== child.__yxml) {
          // 2.3 Not expected node
          let index = yxml._content.findIndex(c => c.type[0] === child.__yxml._model[0] && c.type[1] === child.__yxml._model[1]);
          if (index < 0) {
            // element is going to be deleted by its previous parent
            child.__yxml = null;
          } else {
            yxml.delete(index, 1);
          }
          yCnt += yxml.insertDomElements(yCnt, [child]);
        } else {
          yCnt++;
        }
        // if this is the expected node id, just continue
      } else {
        // 2.2 fill _conten with child nodes
        yCnt += yxml.insertDomElements(yCnt, [child]);
      }
    } else {
      // 2.1 A new node was found
      yCnt += yxml.insertDomElements(yCnt, [child]);
    }
  }
}

/* global getSelection */

function fixPosition (event, pos) {
  if (event.index <= pos) {
    if (event.type === 'delete') {
      return pos - Math.min(pos - event.index, event.length)
    } else {
      return pos + 1
    }
  } else {
    return pos
  }
}

function extendYXmlText (Y, _document, _MutationObserver) {
  Y.requestModules(['Array']).then(function () {
    class YXmlText extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content, args) {
        super(os, _model, _content);
        if (args != null && args.content != null && _model[0] !== '_') {
          this.insert(0, args.content);
        }
        this.dom = null;
        this._domObserver = null;
        this._domObserverListener = null;
        if (args != null && args.dom != null) {
          this._setDom(args.dom);
        }
        var token = true;
        this._mutualExcluse = f => {
          if (token) {
            token = false;
            try {
              f();
            } catch (e) {
              console.error(e);
            }
            this._domObserver.takeRecords();
            token = true;
          }
        };
        this.observe(event => {
          if (this.dom != null) {
            this._mutualExcluse(() => {
              let selection = null;
              let shouldUpdateSelection = false;
              let anchorNode = null;
              let anchorOffset = null;
              let focusNode = null;
              let focusOffset = null;
              if (typeof getSelection !== 'undefined') {
                selection = getSelection();
                if (selection.anchorNode === this.dom) {
                  anchorNode = selection.anchorNode;
                  anchorOffset = fixPosition(event, selection.anchorOffset);
                  shouldUpdateSelection = true;
                }
                if (selection.focusNode === this.dom) {
                  focusNode = selection.focusNode;
                  focusOffset = fixPosition(event, selection.focusOffset);
                  shouldUpdateSelection = true;
                }
              }
              let anchorViewPosition = getAnchorViewPosition(this._scrollElement);
              let anchorViewFix;
              if (anchorViewPosition.anchor !== null || getBoundingClientRect(this.dom).top <= 0) {
                anchorViewFix = anchorViewPosition;
              } else {
                anchorViewFix = null;
              }
              this.dom.nodeValue = this.toString();
              fixScrollPosition(this._scrollElement, anchorViewFix);
              if (shouldUpdateSelection) {
                selection.setBaseAndExtent(
                  anchorNode || selection.anchorNode,
                  anchorOffset || selection.anchorOffset,
                  focusNode || selection.focusNode,
                  focusOffset || selection.focusOffset
                );
              }
            });
          }
        });
      }

      setDomFilter () {}

      enableSmartScrolling (scrollElement) {
        this._scrollElement = scrollElement;
      }

      _setDom (dom) {
        if (this.dom != null) {
          this._unbindFromDom();
        }
        if (dom.__yxml != null) {
          dom.__yxml._unbindFromDom();
        }
        if (_MutationObserver == null) {
          return
        }
        this.dom = dom;
        dom.__yxml = this;
        this._domObserverListener = () => {
          this._mutualExcluse(() => {
            var diffs = diff(this.toString(), this.dom.nodeValue);
            var pos = 0;
            for (var i = 0; i < diffs.length; i++) {
              var d = diffs[i];
              if (d[0] === 0) { // EQUAL
                pos += d[1].length;
              } else if (d[0] === -1) { // DELETE
                this.delete(pos, d[1].length);
              } else { // INSERT
                this.insert(pos, d[1]);
                pos += d[1].length;
              }
            }
          });
        };
        this._domObserver = new _MutationObserver(this._domObserverListener);
        this._domObserver.observe(this.dom, { characterData: true });
      }

      getDom () {
        if (this.dom == null) {
          let dom = _document.createTextNode(this.toString());
          if (_MutationObserver !== null) {
            this._setDom(dom);
          }
          return dom
        } else {
          return this.dom
        }
      }

      toString () {
        return this._content.map(function (c) {
          return c.val
        }).join('')
      }

      insert (pos, content) {
        super.insert(pos, content.split(''));
      }

      _changed (transaction, op) {
        if (this._domObserver != null) {
          this._domObserverListener(this._domObserver.takeRecords());
        }
        super._changed(transaction, op);
      }

      _unbindFromDom () {
        if (this._domObserver != null) {
          this._domObserver.disconnect();
          this._domObserver = null;
        }
        if (this.dom != null) {
          this.dom.__yxml = null;
          this.dom = null;
        }
      }

      _destroy () {
        if (this._eventListenerHandler != null) {
          this._eventListenerHandler.destroy();
        }
        this._unbindFromDom();
        super._destroy();
      }
    }
    Y.extend('XmlText', new Y.utils.CustomTypeDefinition({
      name: 'XmlText',
      class: YXmlText,
      struct: 'List',
      parseArguments: function (arg) {
        if (typeof arg === 'string') {
          return [this, { content: arg }]
        } else if (arg.nodeType === _document.TEXT_NODE) {
          return [this, { content: arg.nodeValue, dom: arg }]
        } else {
          return [this, {}]
        }
      },
      initType: function YXmlTextInitializer (os, model, init) {
        var _content = [];
        Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            throw new Error('Text must not contain types!')
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              });
            });
          }
        });
        return new YXmlText(os, model.id, _content, {}, init || {})
      },
      createType: function YXmlTextCreator (os, model, args) {
        return new YXmlText(os, model.id, [], args || {})
      }
    }));
  });
}

function extendYXmlFragment (Y, _document, _MutationObserver) {
  Y.requestModules(['Array']).then(function () {
    class YXmlFragment extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content, args) {
        super(os, _model, _content);
        this.dom = null;
        this._domObserver = null;
        this._domObserverListener = null;
        this._domFilter = defaultDomFilter;
        this._scrollElement = null;
        var token = true;
        this._mutualExclude = f => {
          if (token) {
            token = false;
            try {
              f();
            } catch (e) {
              console.error(e);
            }
            this._domObserver.takeRecords();
            token = true;
          }
        };
        reflectChangesOnDom(this);
      }

      setDomFilter () {
        return Y.XmlElement.typeDefinition.class.prototype
          .setDomFilter.apply(this, arguments)
      }
      enableSmartScrolling () {
        return Y.XmlElement.typeDefinition.class.prototype
          .enableSmartScrolling.apply(this, arguments)
      }

      insertDomElements () {
        return Y.XmlElement.typeDefinition.class.prototype.insertDomElements.apply(this, arguments)
      }

      bindToDom (dom) {
        if (this.dom != null) {
          this._unbindFromDom();
        }
        if (dom.__yxml != null) {
          dom.__yxml._unbindFromDom();
        }
        if (_MutationObserver == null) {
          throw new Error('Not able to bind to a DOM element, because MutationObserver is not available!')
        }
        dom.innerHTML = '';
        for (let i = 0; i < this._content.length; i++) {
          dom.insertBefore(this.get(i).getDom(), null);
        }
        this.dom = dom;
        dom.__yxml = this;
        this._domObserverListener = () => {
          this._mutualExclude(() => applyChangesFromDom(this));
        };
        this._domObserver = new _MutationObserver(this._domObserverListener);
        this._domObserver.takeRecords(); // discard made changes
        this._domObserver.observe(this.dom, { childList: true });
      }

      toString () {
        return this._content
          .map(c => this.os.getType(c.type).toString())
          .join('')
      }

      _changed (transaction, op) {
        if (this._domObserver != null) {
          this._domObserverListener(this._domObserver.takeRecords());
        }
        super._changed(transaction, op);
      }

      _unbindFromDom () {
        if (this._domObserver != null) {
          this._domObserver.disconnect();
          this._domObserver = null;
        }
        if (this.dom != null) {
          this.dom.__yxml = null;
          this.dom = null;
        }
      }

      _destroy () {
        if (this._eventListenerHandler != null) {
          this._eventListenerHandler.destroy();
        }
        this._unbindFromDom();
        super._destroy();
      }
    }
    Y.extend('XmlFragment', new Y.utils.CustomTypeDefinition({
      name: 'XmlFragment',
      class: YXmlFragment,
      struct: 'List',
      initType: function YXmlFragmentInitializer (os, model) {
        var _content = [];
        var _types = [];
        Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            _content.push({
              id: op.id,
              type: op.opContent
            });
            _types.push(op.opContent);
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              });
            });
          }
        });
        for (var i = 0; i < _types.length; i++) {
          var type = this.store.initType.call(this, _types[i]);
          type._parent = model.id;
        }
        return new YXmlFragment(os, model.id, _content)
      },
      createType: function YXmlTextCreator (os, model) {
        return new YXmlFragment(os, model.id, [])
      }
    }));
  });
}

// import diff from 'fast-diff'
function extendXmlElement (Y, _document, _MutationObserver) {
  function yarrayEventHandler (op) {
    if (op.struct === 'Insert') {
      // when using indexeddb db adapter, the op could already exist (see y-js/y-indexeddb#2)
      if (this._content.some(function (c) { return Y.utils.compareIds(c.id, op.id) })) {
        // op exists
        return
      }
      let pos;
      // we check op.left only!,
      // because op.right might not be defined when this is called
      if (op.left === null) {
        pos = 0;
      } else {
        pos = 1 + this._content.findIndex(function (c) {
          return Y.utils.compareIds(c.id, op.left)
        });
        if (pos <= 0) {
          throw new Error('Unexpected operation!')
        }
      }
      /*
      (see above for new approach)
      var _e = this._content[pos]
      // when using indexeddb db adapter, the op could already exist (see y-js/y-indexeddb#2)
      // If the algorithm works correctly, the double should always exist on the correct position (pos - the computed destination)
      if (_e != null && Y.utils.compareIds(_e.id, op.id)) {
        // is already defined
        return
      }
      */
      var values;
      var length;
      if (op.hasOwnProperty('opContent')) {
        this._content.splice(pos, 0, {
          id: op.id,
          type: op.opContent
        });
        length = 1;
        let type = this.os.getType(op.opContent);
        type._parent = this._model;
        values = [type];
      } else {
        var contents = op.content.map(function (c, i) {
          return {
            id: [op.id[0], op.id[1] + i],
            val: c
          }
        });
        // insert value in _content
        // It is not possible to insert more than ~2^16 elements in an Array (see #5). We handle this case explicitly
        if (contents.length < 30000) {
          this._content.splice.apply(this._content, [pos, 0].concat(contents));
        } else {
          this._content = this._content.slice(0, pos).concat(contents).concat(this._content.slice(pos));
        }
        values = op.content;
        length = op.content.length;
      }
      Y.utils.bubbleEvent(this, {
        type: 'insert',
        object: this,
        index: pos,
        values: values,
        length: length
      });
    } else if (op.struct === 'Delete') {
      var i = 0; // current position in _content
      for (; i < this._content.length && op.length > 0; i++) {
        var c = this._content[i];
        if (Y.utils.inDeletionRange(op, c.id)) {
          // is in deletion range!
          var delLength;
          // check how many character to delete in one flush
          for (delLength = 1;
                delLength < op.length && i + delLength < this._content.length && Y.utils.inDeletionRange(op, this._content[i + delLength].id);
                delLength++) {}
          // last operation that will be deleted
          c = this._content[i + delLength - 1];
          // update delete operation
          op.length -= c.id[1] - op.target[1] + 1;
          op.target = [c.id[0], c.id[1] + 1];
          // apply deletion & find send event
          let content = this._content.splice(i, delLength);
          let values = content.map((c) => {
            if (c.val != null) {
              return c.val
            } else {
              return this.os.getType(c.type)
            }
          });
          Y.utils.bubbleEvent(this, {
            type: 'delete',
            object: this,
            index: i,
            values: values,
            _content: content,
            length: delLength
          });
          // with the fresh delete op, we can continue
          // note: we don't have to increment i, because the i-th content was deleted
          // but on the other had, the (i+delLength)-th was not in deletion range
          // So we don't do i--
        }
      }
    } else {
      throw new Error('Unexpected struct!')
    }
  }

  function ymapEventHandler (op) {
    var oldValue;
    // key is the name to use to access (op)content
    var key = op.struct === 'Delete' ? op.key : op.parentSub;
    // compute oldValue
    if (this.opContents[key] != null) {
      oldValue = this.os.getType(this.opContents[key]);
    } else {
      oldValue = this.contents[key];
    }
    // compute op event
    if (op.struct === 'Insert') {
      if (op.left === null && !Y.utils.compareIds(op.id, this.map[key])) {
        var value;
        // TODO: what if op.deleted??? I partially handles this case here.. but need to send delete event instead. somehow related to #4
        if (op.opContent != null) {
          value = this.os.getType(op.opContent);
          value._parent = this._model;
          delete this.contents[key];
          if (op.deleted) {
            delete this.opContents[key];
          } else {
            this.opContents[key] = op.opContent;
          }
        } else {
          value = op.content[0];
          delete this.opContents[key];
          if (op.deleted) {
            delete this.contents[key];
          } else {
            this.contents[key] = op.content[0];
          }
        }
        this.map[key] = op.id;
        if (oldValue === undefined) {
          Y.utils.bubbleEvent(this, {
            name: key,
            object: this,
            type: 'add',
            value: value
          });
        } else {
          Y.utils.bubbleEvent(this, {
            name: key,
            object: this,
            oldValue: oldValue,
            type: 'update',
            value: value
          });
        }
      }
    } else if (op.struct === 'Delete') {
      if (Y.utils.compareIds(this.map[key], op.target)) {
        delete this.opContents[key];
        delete this.contents[key];
        Y.utils.bubbleEvent(this, {
          name: key,
          object: this,
          oldValue: oldValue,
          type: 'delete'
        });
      }
    } else {
      throw new Error('Unexpected Operation!')
    }
  }

  class YXmlElement extends Y.utils.CustomType {
    constructor (os, model, arrayContent, contents, opContents, dom, domFilter) {
      super();
      this._os = os;
      this.os = os;
      this._model = model.id;
      this._parent = null;
      // map is the map of attributes (y-map convention)
      this.map = Y.utils.copyObject(model.map);
      this.contents = contents;
      this.opContents = opContents;
      // _content is the list of childnotes (y-array convention)
      this._content = arrayContent;
      this.nodeName = model.nodeName;
      let mapEventHandler = ymapEventHandler.bind(this);
      let arrayEventHandler = yarrayEventHandler.bind(this);
      let eventHandler = new Y.utils.EventHandler(function (op) {
        if (op.parentSub !== undefined || op.key !== undefined) {
          mapEventHandler(op);
        } else {
          arrayEventHandler(op);
        }
      });
      this.eventHandler = eventHandler;
      this._deepEventHandler = new Y.utils.EventListenerHandler();
      this._eventListenerHandler = eventHandler;
      this._domObserver = null;
      this._scrollElement = null;
      this.dom = null;
      this._domFilter = domFilter;
      if (dom != null) {
        this._setDom(dom);
      }
      // this function makes sure that either the
      // dom event is executed, or the yjs observer is executed
      var token = true;
      this._mutualExclude = f => {
        if (token) {
          token = false;
          try {
            f();
          } catch (e) {
            console.error(e);
          }
          this._domObserver.takeRecords();
          token = true;
        }
      };
      // Apply Y.Xml events to dom
      reflectChangesOnDom(this);
    }

    enableSmartScrolling (scrollElement) {
      this._scrollElement = scrollElement;
      let len = this._content.length;
      for (let i = 0; i < len; i++) {
        this.get(i).enableSmartScrolling(scrollElement);
      }
    }

    setDomFilter (f) {
      this._domFilter = f;
      let len = this._content.length;
      for (let i = 0; i < len; i++) {
        this.get(i).setDomFilter(f);
      }
    }

    get length () {
      return this._content.length
    }

    toString () {
      let nodeName = this.nodeName.toLowerCase();
      let children = this._content
        .map(c => this.os.getType(c.type).toString())
        .join('');
      if (children.length === 0) {
        return `<${nodeName}/>`
      } else {
        return `<${nodeName}>${children}</${nodeName}>`
      }
    }

    _getPathToChild (childId) {
      return this._content.findIndex(c =>
        c.type != null && Y.utils.compareIds(c.type, childId)
      )
    }

    _unbindFromDom () {
      if (this._domObserver != null) {
        this._domObserver.disconnect();
        this._domObserver = null;
      }
      if (this.dom != null) {
        this.dom.__yxml = null;
        this.dom = null;
      }
    }

    _destroy () {
      this._unbindFromDom();
      if (this._eventListenerHandler != null) {
        this._eventListenerHandler.destroy();
        this._eventListenerHandler = null;
      }
      this.nodeName = null;
      // y-array destroy
      this._content = null;
      // y-map destroy
      this.contents = null;
      this.opContents = null;
      this.map = null;
    }

    insertDomElements (pos, doms) {
      let types = [];
      doms.forEach(d => {
        if (d.__yxml != null && d.__yxml !== false) {
          d.__yxml._unbindFromDom();
        }
        if (this._domFilter(d, []) !== null) {
          let type;
          if (d.nodeType === _document.TEXT_NODE) {
            type = Y.XmlText(d);
          } else if (d.nodeType === _document.ELEMENT_NODE) {
            type = Y.XmlElement(d);
          } else {
            throw new Error('Unsupported node!')
          }
          types.push(type);
        } else {
          d.__yxml = false;
        }
      });
      this.insert(pos, types);
      let len = types.length;
      for (let i = pos; i < pos + len; i++) {
        let type = this.get(i);
        type.setDomFilter(this._domFilter);
        type.enableSmartScrolling(this._scrollElement);
      }
      return len
    }

    insert (pos, types) {
      if (!Array.isArray(types)) {
        throw new Error('Expected an Array of content!')
      }
      for (var i = 0; i < types.length; i++) {
        var v = types[i];
        var t = Y.utils.isTypeDefinition(v);
        if (t == null || (t[0].name !== 'XmlElement' && t[0].name !== 'XmlText')) {
          throw new Error('Expected Y.Xml type or String!')
        }
      }
      Y.Array.typeDefinition.class.prototype.insert.call(this, pos, types);
    }

    delete () {
      return Y.Array.typeDefinition.class.prototype.delete.apply(this, arguments)
    }

    get () {
      return Y.Array.typeDefinition.class.prototype.get.apply(this, arguments)
    }

    removeAttribute () {
      return Y.Map.typeDefinition.class.prototype.delete.apply(this, arguments)
    }

    setAttribute () {
      return Y.Map.typeDefinition.class.prototype.set.apply(this, arguments)
    }

    getAttribute () {
      return Y.Map.typeDefinition.class.prototype.get.apply(this, arguments)
    }

    getAttributes () {
      let keys = Y.Map.typeDefinition.class.prototype.keys.apply(this);
      let obj = {};
      keys.forEach(key => {
        let val = Y.Map.typeDefinition.class.prototype.get.call(this, key);
        if (val != null) {
          obj[key] = val;
        }
      });
      return obj
    }

    // binds to a dom element
    // Only call if dom and YXml are isomorph
    _bindToDom (dom) {
      this._domObserverListener = mutations => {
        this._mutualExclude(() => {
          let diffChildren = false;
          mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
              let name = mutation.attributeName;
              // check if filter accepts attribute
              if (this._domFilter(this.dom, [name]).length > 0) {
                var val = mutation.target.getAttribute(name);
                if (this.getAttribute(name) !== val) {
                  if (val == null) {
                    this.removeAttribute(name);
                  } else {
                    this.setAttribute(name, val);
                  }
                }
              }
            } else if (mutation.type === 'childList') {
              diffChildren = true;
            }
          });
          if (diffChildren) {
            applyChangesFromDom(this);
          }
        });
      };
      this._domObserver = new _MutationObserver(this._domObserverListener);
      this._domObserver.observe(dom, { attributes: true, childList: true });
      return dom
    }

    _setDom (dom) {
      if (this.dom != null) {
        throw new Error('Only call this method if you know what you are doing ;)')
      } else if (dom.__yxml != null) { // TODO do i need to check this? - no.. but for dev purps..
        throw new Error('Already bound to an YXml type')
      } else {
        dom.__yxml = this;
        // tag is already set in constructor
        // set attributes
        let attrNames = [];
        for (let i = 0; i < dom.attributes.length; i++) {
          attrNames.push(dom.attributes[i].name);
        }
        attrNames = this._domFilter(dom, attrNames);
        for (let i = 0; i < attrNames.length; i++) {
          let attrName = attrNames[i];
          let attrValue = dom.getAttribute(attrName);
          this.setAttribute(attrName, attrValue);
        }
        this.insertDomElements(0, Array.prototype.slice.call(dom.childNodes));
        if (_MutationObserver != null) {
          this.dom = this._bindToDom(dom);
        }
        return dom
      }
    }

    getDom () {
      let dom = this.dom;
      if (dom == null) {
        dom = _document.createElement(this.nodeName);
        dom.__yxml = this;
        let attrs = this.getAttributes();
        for (let key in attrs) {
          dom.setAttribute(key, attrs[key]);
        }
        for (var i = 0; i < this._content.length; i++) {
          let c = this._content[i];
          let type = this.os.getType(c.type);
          dom.appendChild(type.getDom());
        }
        if (_MutationObserver !== null) {
          this.dom = this._bindToDom(dom);
        }
      }
      return dom
    }

    observe (f) {
      function observeWrapper (event) {
        if (event.type === 'insert') {
          f({
            type: 'childInserted',
            index: event.index,
            values: event.values
          });
        } else if (event.type === 'delete') {
          if (event.index !== undefined) {
            f({
              type: 'childRemoved',
              index: event.index,
              values: event.values,
              _content: event._content
            });
          } else {
            f({
              type: 'attributeRemoved',
              name: event.name
            });
          }
        } else if (event.type === 'update' || event.type === 'add') {
          f({
            type: 'attributeChanged',
            name: event.name,
            value: event.value
          });
        } else {
          throw new Error('Unexpected event')
        }
      }
      this._eventListenerHandler.addEventListener(observeWrapper);
      return observeWrapper
    }

    unobserve (f) {
      this._eventListenerHandler.removeEventListener(f);
    }
    observeDeep (f) {
      this._deepEventHandler.addEventListener(f);
    }
    unobserveDeep (f) {
      this._deepEventHandler.removeEventListener(f);
    }

    _changed (transaction, op) {
      if (this._domObserver != null) {
        this._domObserverListener(this._domObserver.takeRecords());
      }
      if (op.parentSub !== undefined || op.targetParent !== undefined) {
        Y.Map.typeDefinition['class'].prototype._changed.apply(this, arguments);
      } else {
        Y.Array.typeDefinition['class'].prototype._changed.apply(this, arguments);
      }
    }
  }

  Y.extend('XmlElement', new Y.utils.CustomTypeDefinition({
    name: 'XmlElement',
    class: YXmlElement,
    struct: 'Xml',
    parseArguments: function (arg, arg2) {
      let domFilter;
      if (typeof arg2 === 'function') {
        domFilter = arg2;
      } else {
        domFilter = defaultDomFilter;
      }
      if (typeof arg === 'string') {
        return [this, {
          nodeName: arg.toUpperCase(),
          dom: null,
          domFilter
        }]
      } else if (arg.nodeType === _document.ELEMENT_NODE) {
        return [this, {
          nodeName: arg.nodeName,
          dom: arg,
          domFilter
        }]
      } else {
        throw new Error('Y.XmlElement requires an argument which is a string!')
      }
    },
    initType: function YXmlElementInitializer (os, model, init) {
      // here begins the modified y-array init
      var _content = [];
      var _types = [];
      Y.Struct.Xml.map.call(this, model, function (op) {
        if (op.hasOwnProperty('opContent')) {
          _content.push({
            id: op.id,
            type: op.opContent
          });
          _types.push(op.opContent);
        } else {
          op.content.forEach(function (c, i) {
            _content.push({
              id: [op.id[0], op.id[1] + i],
              val: op.content[i]
            });
          });
        }
      });
      for (var i = 0; i < _types.length; i++) {
        let type = this.store.initType.call(this, _types[i], init);
        type._parent = model.id;
      }
      // here begins the modified y-map init
      var contents = {};
      var opContents = {};
      var map = model.map;
      for (var name in map) {
        var op = this.getOperation(map[name]);
        if (op.deleted) continue
        if (op.opContent != null) {
          opContents[name] = op.opContent;
          this.store.initType.call(this, op.opContent);
        } else {
          contents[name] = op.content[0];
        }
      }
      return new YXmlElement(os, model, _content, contents, opContents, init != null ? init.dom : null, init != null ? init.domFilter : defaultDomFilter)
    },
    createType: function YXmlElementCreator (os, model, args) {
      return new YXmlElement(os, model, [], {}, {}, args.dom, args.domFilter)
    }
  }));
}

/* global Y, MutationObserver */

function extendXml (Y, _document, _MutationObserver) {
  if (_document == null && typeof document !== 'undefined') {
    _document = document;
  }
  if (typeof MutationObserver !== 'undefined') {
    _MutationObserver = MutationObserver;
  } else {
    _MutationObserver = null;
  }
  extendXmlElement(Y, _document, _MutationObserver);
  extendYXmlText(Y, _document, _MutationObserver);
  extendYXmlFragment(Y, _document, _MutationObserver);
}

if (typeof Y !== 'undefined') {
  extendXml(Y);
}

module.exports = extendXml;
//# sourceMappingURL=y-xml.node.js.map
