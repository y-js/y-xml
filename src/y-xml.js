/* global Y, MutationObserver */

// import diff from 'fast-diff'
import yXmlText from './y-xml-text.js'
import yXmlFragment from './y-xml-fragment.js'
import { applyChangesFromDom } from './utils.js'

export default function extendXml (Y, _document, _MutationObserver) {
  if (_document == null && typeof document !== 'undefined') {
    _document = document
  }
  if (typeof MutationObserver !== 'undefined') {
    _MutationObserver = MutationObserver
  } else {
    console.warn('MutationObserver is not available. y-xml won\'t listen to changes on the DOM')
    _MutationObserver = null
  }
  yXmlText(Y, _document, _MutationObserver)
  yXmlFragment(Y, _document, _MutationObserver)

  function domToType (dom) {
    if (dom.nodeType === _document.TEXT_NODE) {
      return Y.XmlText(dom)
    } else if (dom.nodeType === _document.ELEMENT_NODE) {
      return Y.Xml(dom)
    } else {
      throw new Error('Unsupported node!')
    }
  }

  function yarrayEventHandler (op) {
    if (op.struct === 'Insert') {
      // when using indexeddb db adapter, the op could already exist (see y-js/y-indexeddb#2)
      if (this._content.some(function (c) { return Y.utils.compareIds(c.id, op.id) })) {
        // op exists
        return
      }
      let pos
      // we check op.left only!,
      // because op.right might not be defined when this is called
      if (op.left === null) {
        pos = 0
      } else {
        pos = 1 + this._content.findIndex(function (c) {
          return Y.utils.compareIds(c.id, op.left)
        })
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
      var values
      var length
      if (op.hasOwnProperty('opContent')) {
        this._content.splice(pos, 0, {
          id: op.id,
          type: op.opContent
        })
        length = 1
        let type = this.os.getType(op.opContent)
        type._parent = this._model
        values = [type]
      } else {
        var contents = op.content.map(function (c, i) {
          return {
            id: [op.id[0], op.id[1] + i],
            val: c
          }
        })
        // insert value in _content
        // It is not possible to insert more than ~2^16 elements in an Array (see #5). We handle this case explicitly
        if (contents.length < 30000) {
          this._content.splice.apply(this._content, [pos, 0].concat(contents))
        } else {
          this._content = this._content.slice(0, pos).concat(contents).concat(this._content.slice(pos))
        }
        values = op.content
        length = op.content.length
      }
      Y.utils.bubbleEvent(this, {
        type: 'insert',
        object: this,
        index: pos,
        values: values,
        length: length
      })
    } else if (op.struct === 'Delete') {
      var i = 0 // current position in _content
      for (; i < this._content.length && op.length > 0; i++) {
        var c = this._content[i]
        if (Y.utils.inDeletionRange(op, c.id)) {
          // is in deletion range!
          var delLength
          // check how many character to delete in one flush
          for (delLength = 1;
                delLength < op.length && i + delLength < this._content.length && Y.utils.inDeletionRange(op, this._content[i + delLength].id);
                delLength++) {}
          // last operation that will be deleted
          c = this._content[i + delLength - 1]
          // update delete operation
          op.length -= c.id[1] - op.target[1] + 1
          op.target = [c.id[0], c.id[1] + 1]
          // apply deletion & find send event
          let content = this._content.splice(i, delLength)
          let values = content.map((c) => {
            if (c.val != null) {
              return c.val
            } else {
              return this.os.getType(c.type)
            }
          })
          Y.utils.bubbleEvent(this, {
            type: 'delete',
            object: this,
            index: i,
            values: values,
            _content: content,
            length: delLength
          })
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
    var oldValue
    // key is the name to use to access (op)content
    var key = op.struct === 'Delete' ? op.key : op.parentSub
    // compute oldValue
    if (this.opContents[key] != null) {
      oldValue = this.os.getType(this.opContents[key])
    } else {
      oldValue = this.contents[key]
    }
    // compute op event
    if (op.struct === 'Insert') {
      if (op.left === null && !Y.utils.compareIds(op.id, this.map[key])) {
        var value
        // TODO: what if op.deleted??? I partially handles this case here.. but need to send delete event instead. somehow related to #4
        if (op.opContent != null) {
          value = this.os.getType(op.opContent)
          value._parent = this._model
          delete this.contents[key]
          if (op.deleted) {
            delete this.opContents[key]
          } else {
            this.opContents[key] = op.opContent
          }
        } else {
          value = op.content[0]
          delete this.opContents[key]
          if (op.deleted) {
            delete this.contents[key]
          } else {
            this.contents[key] = op.content[0]
          }
        }
        this.map[key] = op.id
        if (oldValue === undefined) {
          Y.utils.bubbleEvent(this, {
            name: key,
            object: this,
            type: 'add',
            value: value
          })
        } else {
          Y.utils.bubbleEvent(this, {
            name: key,
            object: this,
            oldValue: oldValue,
            type: 'update',
            value: value
          })
        }
      }
    } else if (op.struct === 'Delete') {
      if (Y.utils.compareIds(this.map[key], op.target)) {
        delete this.opContents[key]
        delete this.contents[key]
        Y.utils.bubbleEvent(this, {
          name: key,
          object: this,
          oldValue: oldValue,
          type: 'delete'
        })
      }
    } else {
      throw new Error('Unexpected Operation!')
    }
  }

  class YXml extends Y.utils.CustomType {
    constructor (os, model, arrayContent, contents, opContents, dom) {
      super()
      this._os = os
      this.os = os
      this._model = model.id
      // map is the map of attributes (y-map convention)
      this.map = Y.utils.copyObject(model.map)
      this.contents = contents
      this.opContents = opContents
      // _content is the list of childnotes (y-array convention)
      this._content = arrayContent
      this.nodeName = model.nodeName
      let mapEventHandler = ymapEventHandler.bind(this)
      let arrayEventHandler = yarrayEventHandler.bind(this)
      let eventHandler = new Y.utils.EventHandler(function (op) {
        if (op.parentSub !== undefined || op.key !== undefined) {
          mapEventHandler(op)
        } else {
          arrayEventHandler(op)
        }
      })
      this.eventHandler = eventHandler
      this._eventListenerHandler = eventHandler
      this._domObserver = null
      this._dom = null
      if (dom != null) {
        this._setDom(dom)
      }
    }

    get length () {
      return this._content.length
    }

    toString () {
      let nodeName = this.nodeName.toLowerCase()
      let children = this._content
        .map(c => this.os.getType(c.type).toString())
        .join('')
      return `<${nodeName}>${children}</${nodeName}>`
    }

    _unbindFromDom () {
      if (this._domObserver != null) {
        this._domObserver.disconnect()
        this._domObserver = null
      }
      if (this.dom != null) {
        this.dom.__yxml = null
        this.dom = null
      }
    }

    _destroy () {
      this._unbindFromDom()
      if (this._eventListenerHandler != null) {
        this._eventListenerHandler.destroy()
        this._eventListenerHandler = null
      }
      this.nodeName = null
      // y-array destroy
      this._content = null
      // y-map destroy
      this.contents = null
      this.opContents = null
      this.map = null
    }

    insertDomElements (pos, doms) {
      doms.forEach(d => {
        if (d.__yxml != null) {
          d.__yxml._unbindFromDom()
        }
      })
      let types = doms.map(domToType)
      this.insert(pos, types)
    }

    insert (pos, types) {
      if (!Array.isArray(types)) {
        throw new Error('Expected an Array of content!')
      }
      for (var i = 0; i < types.length; i++) {
        var v = types[i]
        var t = Y.utils.isTypeDefinition(v)
        if (t == null || (t[0].name !== 'Xml' && t[0].name !== 'XmlText')) {
          throw new Error('Expected Y.Xml type or String!')
        }
      }
      Y.Array.typeDefinition.class.prototype.insert.call(this, pos, types)
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
      let keys = Y.Map.typeDefinition.class.prototype.keys.apply(this)
      let obj = {}
      keys.forEach(key => {
        let val = Y.Map.typeDefinition.class.prototype.get.call(this, key)
        if (val != null) {
          obj[key] = val
        }
      })
      return obj
    }

    // binds to a dom element
    // Only call if dom and YXml are isomorph
    _bindToDom (dom) {
      // this function makes sure that either the
      // dom event is executed, or the yjs observer is executed
      var token = true
      var mutualExclude = f => {
        // take and process current records
        var records = this._domObserver.takeRecords()
        if (records.length > 0) {
          throw new Error('These changes should have been collected before!')
        }
        if (token) {
          token = false
          try {
            f()
          } catch (e) {
            // discard created records
            this._domObserver.takeRecords()
            token = true
            throw e
          }
          this._domObserver.takeRecords()
          token = true
        }
      }
      this._mutualExclude = mutualExclude
      this._domObserverListener = mutations => {
        mutualExclude(() => {
          let diffChildren = false
          mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
              var name = mutation.attributeName
              var val = mutation.target.getAttribute(mutation.attributeName)
              if (this.getAttribute(name) !== val) {
                if (val == null) {
                  this.removeAttribute(name)
                } else {
                  this.setAttribute(name, val)
                }
              }
            } else if (mutation.type === 'childList') {
              diffChildren = true
            }
          })
          if (diffChildren) {
            applyChangesFromDom(this)
          }
          if (this._content.length !== this.dom.childNodes.length) {
            debugger
          }
        })
      }
      this._domObserver = new _MutationObserver(this._domObserverListener)
      this._domObserver.observe(dom, { attributes: true, childList: true })
      // Apply Y.Xml events to dom
      this.observe(event => {
        mutualExclude(() => {
          if (event.type === 'attributeChanged') {
            dom.setAttribute(event.name, event.value)
          } else if (event.type === 'attributeRemoved') {
            dom.removeAttribute(event.name)
          } else if (event.type === 'childInserted') {
            let nodes = event.nodes
            for (let i = nodes.length - 1; i >= 0; i--) {
              let node = nodes[i]
              let dom = node.getDom()
              let nextDom = null
              if (this._content.length > event.index + i + 1) {
                nextDom = this.get(event.index + i + 1).getDom()
              }
              this.dom.insertBefore(dom, nextDom)
            }
          } else if (event.type === 'childRemoved') {
            event.values.forEach(function (yxml) {
              yxml.dom.remove()
            })
          }
          if (this._content.length !== this.dom.childNodes.length) {
            debugger // this shouldn't happen!
          }
        })
      })
      return dom
    }

    _setDom (dom) {
      if (this.dom != null) {
        throw new Error('Only call this method if you know what you are doing ;)')
      } else if (dom.__yxml != null) { // TODO do i need to check this? - no.. but for dev purps..
        throw new Error('Already bound to an YXml type')
      } else {
        dom.__yxml = this
        // tag is already set in constructor
        // set attributes
        for (var i = 0; i < dom.attributes.length; i++) {
          var attr = dom.attributes[i]
          this.setAttribute(attr.name, attr.value)
        }
        this.insert(0, Array.from(dom.childNodes.values()).map(dom => {
          if (dom.__yxml != null) {
            // it is ok to reset here. It was probably moved from another node, and will be removed by that node
            dom.__yxml._domObserver.disconnect()
            dom.__yxml = null
          }
          return domToType(dom)
        }))
        if (_MutationObserver != null) {
          this.dom = this._bindToDom(dom)
        }
        return dom
      }
    }

    getDom () {
      let dom = this.dom
      if (dom == null) {
        dom = _document.createElement(this.nodeName)
        dom.__yxml = this
        let attrs = this.getAttributes()
        for (let key in attrs) {
          dom.setAttribute(key, attrs[key])
        }
        for (var i = 0; i < this._content.length; i++) {
          let c = this._content[i]
          let type = this.os.getType(c.type)
          dom.appendChild(type.getDom())
        }
        if (_MutationObserver !== null) {
          this.dom = this._bindToDom(dom)
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
            nodes: event.values
          })
        } else if (event.type === 'delete') {
          if (event.index !== undefined) {
            f({
              type: 'childRemoved',
              index: event.index,
              values: event.values,
              _content: event._content
            })
          } else {
            f({
              type: 'attributeRemoved',
              name: event.name
            })
          }
        } else if (event.type === 'update' || event.type === 'add') {
          f({
            type: 'attributeChanged',
            name: event.name,
            value: event.value
          })
        } else {
          throw new Error('Unexpected event')
        }
      }
      this._eventListenerHandler.addEventListener(observeWrapper)
      return observeWrapper
    }

    unobserve (f) {
      this._eventListenerHandler.removeEventListener(f)
    }

    * _changed (transaction, op) {
      if (this._domObserver != null) {
        this._domObserverListener(this._domObserver.takeRecords())
      }
      if (op.parentSub !== undefined || op.targetParent !== undefined) {
        yield * Y.Map.typeDefinition['class'].prototype._changed.apply(this, arguments)
      } else {
        yield * Y.Array.typeDefinition['class'].prototype._changed.apply(this, arguments)
      }
    }
  }
  Y.extend('Xml', new Y.utils.CustomTypeDefinition({
    name: 'Xml',
    class: YXml,
    struct: 'Xml',
    parseArguments: function (arg) {
      if (typeof arg === 'string') {
        return [this, {
          nodeName: arg.toUpperCase(),
          dom: null
        }]
      } else if (arg.nodeType === _document.ELEMENT_NODE) {
        return [this, {
          nodeName: arg.nodeName,
          dom: arg
        }]
      } else {
        throw new Error('Y.Xml requires an argument which is a string!')
      }
    },
    initType: function * YXmlInitializer (os, model, init) {
      // here begins the modified y-array init
      var _content = []
      var _types = []
      yield * Y.Struct.Xml.map.call(this, model, function (op) {
        if (op.hasOwnProperty('opContent')) {
          _content.push({
            id: op.id,
            type: op.opContent
          })
          _types.push(op.opContent)
        } else {
          op.content.forEach(function (c, i) {
            _content.push({
              id: [op.id[0], op.id[1] + i],
              val: op.content[i]
            })
          })
        }
      })
      for (var i = 0; i < _types.length; i++) {
        yield * os.initType.call(this, _types[i], init)
      }
      // here begins the modified y-map init
      var contents = {}
      var opContents = {}
      var map = model.map
      for (var name in map) {
        var op = yield * this.getOperation(map[name])
        if (op.deleted) continue
        if (op.opContent != null) {
          opContents[name] = op.opContent
          yield * this.store.initType.call(this, op.opContent)
        } else {
          contents[name] = op.content[0]
        }
      }
      return new YXml(os, model, _content, contents, opContents, init != null ? init.dom : null)
    },
    createType: function YXmlCreator (os, model, args) {
      return new YXml(os, model, [], {}, {}, args.dom)
    }
  }))
}

if (typeof Y !== 'undefined') {
  extendXml(Y)
}
