
/**
 * y-xml - Xml Type for Yjs
 * @version v10.0.0
 * @license MIT
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.yXml = global.yXml || {})));
}(this, (function (exports) { 'use strict';

/* global Y, MutationObserver, Element, Text */

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

function extendXml (Y) {
  class YXml extends Y.utils.CustomType {
    constructor (os, model, arrayContent, contents, opContents) {
      super();
      this._os = os;
      this._model = model;
      // map is the map of attributes (y-map convention)
      this.map = Y.utils.copyObject(model.map);
      this.contents = contents;
      this.opContents = opContents;
      // _content is the list of childnotes (y-array convention)
      this._content = arrayContent;
      this.nodeName = model.nodeName;
      this._domObserver = null;
      this._dom = null;
      let mapEventHandler = ymapEventHandler.bind(this);
      let arrayEventHandler = yarrayEventHandler.bind(this);
      this._eventListenerHandler = new Y.utils.EventListenerHandler(function (op) {
        if (op.parentSub !== undefined) {
          mapEventHandler(op);
        } else {
          arrayEventHandler(op);
        }
      });
    }

    _destroy () {
      if (this._domObserver != null) {
        this._domObserver.disconnect();
      }
      this._eventListenerHandler.destroy();
      this._eventListenerHandler = null;
      this._nodeName = null;
      this._dom = null;
      // y-array destroy
      this._content = null;
      // y-map destroy
      this.contents = null;
      this.opContents = null;
      this.map = null;
    }

    insert (pos, types) {
      var _types = [];
      if (!Array.isArray(types)) {
        throw new Error('Expected an Array of content!')
      }
      for (var i = 0; i < types.length; i++) {
        var v = types[i];
        var t = Y.utils.isTypeDefinition(v);
        if (!(v != null && (
                     typeof v === 'string' ||
                     (t && t[0].class === YXml)
           ))) {
          throw new Error('Expected Y.Xml type or String!')
        } else if (typeof v === 'string' && v.length === 0) {
          continue // if empty string
        }
        _types.push(v);
      }
      Y.Array.typeDefinition.class.prototype.insert.call(this, pos, types);
    }

    delete () {
      Y.Array.typeDefinition.class.prototype.delete.apply(this, arguments);
    }

    setAttribute () {
      Y.Map.typeDefinition.class.prototype.set.apply(this, arguments);
    }

    getAttribute () {
      Y.Map.typeDefinition.class.prototype.get.apply(this, arguments);
    }

    getAttributes () {
      let keys = Y.Map.typeDefinition.class.prototype.keys.apply(this);
      let obj = {};
      keys.forEach(key => {
        obj[key] = Y.Map.typeDefinition.class.prototype.get.call(this, key);
      });
      return obj
    }

    // binds to a dom element
    // Only call if dom and YXml are isomorph
    _bindToDom (dom) {
      // this function makes sure that either the
      // dom event is executed, or the yjs observer is executed
      var token = true;
      var mutualExclude = f => {
        // take and process current records
        var records = this._domObserver.takeRecords();
        if (records.length > 0) {
          this._domObserverListener(records);
        }
        if (token) {
          token = false;
          try {
            f();
          } catch (e) {
            // discard created records
            this._domObserver.takeRecords();
            token = true;
            throw e
          }
          this._domObserver.takeRecords();
          token = true;
        }
      };
      this._mutualExclude = mutualExclude;
      this._domObserverListener = mutations => {
        mutualExclude(() => {
          mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
              var name = mutation.attributeName;
              var val = mutation.target.getAttribute(mutation.attributeName);
              if (this.getAttribute(name) !== val) {
                this.setAttribute(name, val);
              }
            } else if (mutation.type === 'childList') {
              for (let i = 0; i < mutation.addedNodes.length; i++) {
                let n = mutation.addedNodes[i];
                if (this._content.some(function (c) { return c.dom === n })) {
                  // check if it already exists (since this method is called asynchronously)
                  continue
                }
                if (n instanceof Text && n.textContent === '') {
                  // check if textnode and empty content (sometime happens.. )
                  //   TODO - you could also check if the inserted node actually exists in the
                  //          dom (in order to cover more potential cases)
                  n.remove();
                  continue
                }
                // compute position
                // special case, n.nextSibling is not yet inserted. So we find the next inserted element!
                var pos = -1;
                var nextSibling = n.nextSibling;
                while (pos < 0) {
                  if (nextSibling == null) {
                    pos = this._content.length;
                  } else {
                    pos = this._content.findIndex(function (c) { return c.dom === nextSibling });
                    nextSibling = nextSibling.nextSibling;
                  }
                }
                var c;
                if (n instanceof Text) {
                  c = n.textContent;
                } else if (n instanceof Element) {
                  c = Y.Xml(n);
                } else {
                  throw new Error('Unsupported XML Element found. Synchronization will no longer work!')
                }
                this.insert(pos, [c]);
                var content = this._content[pos];
                content.dom = n;
              }
              Array.prototype.forEach.call(mutation.removedNodes, n => {
                var pos = this._content.findIndex(function (c) {
                  return c.dom === n
                });
                if (pos >= 0) {
                  this.delete(pos);
                } else {
                  throw new Error('An unexpected condition occured (deleted node does not exist in the model)!')
                }
              });
            }
          });
        });
      };
      this._domObserver = new MutationObserver(this._domObserverListener);
      this._domObserver.observe(dom, { attributes: true, childList: true });
      // In order to insert a new node, successor needs to be inserted
      // when c.dom can be inserted, try to insert the predecessors too
      var _tryInsertDom = (pos) => {
        var c = this._content[pos];
        var succ;
        if (pos + 1 < this._content.length) {
          succ = this._content[pos + 1];
          if (succ.dom == null) throw new Error('Unexpected behavior') // shouldn't happen anymore!
        } else {
          // pseudo successor
          succ = {
            dom: null
          };
        }
        dom.insertBefore(c.dom, succ.dom);
      };
      this._tryInsertDom = _tryInsertDom;
      this.observe(event => {
        mutualExclude(() => {
          if (event.type === 'attributeChanged') {
            dom.setAttribute(event.name, event.value);
          } else if (event.type === 'attributeRemoved') {
            dom.removeAttribute(event.name);
          } else if (event.type === 'childInserted') {
            if (event.nodes.length === 1 && event.nodes[0] instanceof YXml) {
              // a new xml node was inserted.
              // TODO: consider the case that nodes contains mixed text & types (currently not implemented in yjs)
              var valId = this._content[event.index].id;
              if (event.nodes.length > 1) { throw new Error('This case is not handled, you\'ll run into consistency issues. Contact the developer') }
              var newNode = event.nodes[0].getDom();
              // This is called async. So we have to compute the position again
              // also mutual excluse this
              var pos;
              if (event.index < this._content.length && Y.utils.compareIds(this._content[event.index].id, valId)) {
                pos = event.index;
              } else {
                pos = this._content.findIndex(function (c) {
                  return Y.utils.compareIds(c.id, valId)
                });
              }
              if (pos >= 0) {
                this._content[pos].dom = newNode;
                _tryInsertDom(pos);
              }
            } else {
              for (var i = event.nodes.length - 1; i >= 0; i--) {
                var n = event.nodes[i];
                var textNode = new Text(n);
                this._content[event.index + i].dom = textNode;
                _tryInsertDom(event.index + i);
              }
            }
          } else if (event.type === 'childRemoved') {
            event._content.forEach(function (c) {
              if (c.dom != null) {
                c.dom.remove();
              }
            });
          }
        });
      });
      return dom
    }

    getDom () {
      if (this.dom == null) {
        var dom = document.createElement(this.tagname);
        dom.__yxml = this;
        let attrs = this.getAttributes();
        for (let key in attrs) {
          dom.setAttribute(key, attrs[key]);
        }

        for (var i = 0; i < this._content.length; i++) {
          let c = this._content[i];
          if (c.hasOwnProperty('val')) {
            c.dom = new Text(c.val);
          } else {
            c.dom = this.os.getType(c.type).getDom();
          }
          dom.appendChild(c.dom);
        }
        this.dom = this._bindToDom(dom);
      }
      return this.dom
    }

    observe (f) {
      function observeWrapper (event) {
        if (event.type === 'insert') {
          f({
            type: 'childInserted',
            index: event.index,
            nodes: event.values
          });
        } else if (event.type === 'delete') {
          if (event.index !== undefined) {
            f({
              type: 'childRemoved',
              index: event.index,
              values: event.values
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

    * _changed (transaction, op) {
      if (this._domObserver != null) {
        this._domObserverListener(this._domObserver.takeRecords());
      }
      if (op.parentSub) {
        yield * Y.Map.typeDefinition['class'].prototype._changed.apply(this, arguments);
      } else {
        yield * Y.Array.typeDefinition['class'].prototype._changed.apply(this, arguments);
      }
    }
  }
  Y.extend('Xml', new Y.utils.CustomTypeDefinition({
    name: 'Xml',
    class: YXml,
    struct: 'Xml',
    parseArguments: function (tagname) {
      if (typeof tagname === 'string') {
        return [this, tagname]
      } else {
        throw new Error('Y.Xml requires an argument which is a string!')
      }
    },
    initType: function * YXmlInitializer (os, model, nodeName) {
      // here begins the modified y-array init
      var _content = [];
      var _types = [];
      yield * Y.Struct.Xml.map.call(this, model, function (op) {
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
        yield * os.initType.call(this, _types[i]);
      }
      // here begins the modified y-map init
      var contents = {};
      var opContents = {};
      var map = model.map;
      for (var name in map) {
        var op = yield * this.getOperation(map[name]);
        if (op.deleted) continue
        if (op.opContent != null) {
          opContents[name] = op.opContent;
          yield * this.store.initType.call(this, op.opContent);
        } else {
          contents[name] = op.content[0];
        }
      }
      return new YXml(os, model, _content, contents, opContents)
    },
    createType: function YXmlCreator (os, model, args) {
      return new YXml(os, model, [], {}, {})
    }
  }));
}

if (typeof Y !== 'undefined') {
  extendXml(Y);
}

exports.extendXml = extendXml;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=y-xml.node.js.map
