(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global Y, MutationObserver */
'use strict'

function extend (Y) {
  Y.requestModules(['Array', 'Map']).then(function () {
    class YXml extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content, attributes, tagname, init) {
        super(os, _model, _content)
        this.attributes = attributes
        this.dom = null
        this._domObserver = null
        this._eventListenerHandler = new Y.utils.EventListenerHandler()
        this.tagname = tagname
        if (init != null && init.dom != null) {
          this._setDom(init.dom)
        }
        super.observe(event => {
          if (event.type === 'insert') {
            this._eventListenerHandler.callEventListeners({
              type: 'childInserted',
              index: event.index,
              nodes: event.values
            })
          } else if (event.type === 'delete') {
            this._eventListenerHandler.callEventListeners({
              type: 'childRemoved',
              index: event.index,
              _content: event._content,
              values: event.values
            })
          }
        })
        attributes.observe(event => {
          if (event.type === 'update' || event.type === 'add') {
            this._eventListenerHandler.callEventListeners({
              type: 'attributeChanged',
              name: event.name,
              value: event.value
            })
          } else if (event.type === 'delete') {
            this._eventListenerHandler.callEventListeners({
              type: 'attributeRemoved',
              name: event.name
            })
          }
        })
      }
      _destroy () {
        if (this._domObserver != null) {
          this._domObserver.disconnect()
        }
        this._eventListenerHandler.destroy()
        this._eventListenerHandler = null
        super._destroy()
      }
      insert (pos, types) {
        if (!Array.isArray(types)) {
          throw new Error('Expected an Array of content!')
        }
        types.forEach(function (v) {
          var t = Y.utils.isTypeDefinition(v)
          if (!(v != null && (
                       typeof v === 'string' ||
                       (t && t[0].class === YXml)
             ))) {
            throw new Error('Expected Y.Xml type or String!')
          }
        })
        super.insert(pos, types)
      }
      // binds to a dom element
      // Only call if dom and YXml are isomorph
      _bindToDom (dom) {
        return new Promise(resolve => {
          // this function makes sure that either the
          // dom event is executed, or the yjs observer is executed
          var token = true
          var mutualExclude = f => {
            // take and process current records
            var records = this._domObserver.takeRecords()
            if (records.length > 0) {
              this._domObserverListener(records)
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
              mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                  this.attributes.set(mutation.attributeName, mutation.target.getAttribute(mutation.attributeName))
                } else if (mutation.type === 'childList') {
                  for (let i = 0; i < mutation.addedNodes.length; i++) {
                    let n = mutation.addedNodes[i]
                    // compute position
                    // special case, n.nextSibling is not yet inserted. So we find the next inserted element!
                    var pos = -1
                    var nextSibling = n.nextSibling
                    while (pos < 0) {
                      if (nextSibling == null) {
                        pos = this._content.length
                      } else {
                        pos = this._content.findIndex(function (c) { return c.dom === nextSibling })
                        nextSibling = nextSibling.nextSibling
                      }
                    }
                    var c
                    if (n instanceof window.Text) {
                      c = n.textContent
                    } else if (n instanceof window.Element) {
                      c = Y.Xml(n)
                    } else {
                      throw new Error('Unsupported XML Element found. Synchronization will no longer work!')
                    }
                    this.insert(pos, [c])
                    var content = this._content[pos]
                    content.dom = n
                    content.isInserted = true
                    _tryInsertDom(pos - 1)
                  }
                  Array.prototype.forEach.call(mutation.removedNodes, n => {
                    var pos = this._content.findIndex(function (c) {
                      return c.dom === n
                    })
                    this.delete(pos)
                  })
                }
              })
            })
          }
          this._domObserver = new MutationObserver(this._domObserverListener)
          this._domObserver.observe(dom, { attributes: true, childList: true })
          // In order to insert a new node, successor needs to be inserted
          // when c.dom can be inserted, try to insert the predecessors too
          var _tryInsertDom = (pos) => {
            var c = this._content[pos]
            var succ
            if (pos + 1 < this._content.length) {
              succ = this._content[pos + 1]
            } else {
              // pseudo successor
              succ = {
                isInserted: true,
                dom: null
              }
            }
            while (pos >= 0 && succ.isInserted && c.dom != null && !c.isInserted) {
              dom.insertBefore(c.dom, succ.dom)
              c.isInserted = true
              succ = c
              c = this._content[--pos]
            }
          }
          this._tryInsertDom = _tryInsertDom
          this.observe(event => {
            mutualExclude(() => {
              if (event.type === 'attributeChanged') {
                dom.setAttribute(event.name, event.value)
              } else if (event.type === 'attributeRemoved') {
                dom.removeAttribute(event.name)
              } else if (event.type === 'childInserted') {
                if (typeof event.nodes !== 'function') { // its string
                  event.nodes.forEach((n, i) => {
                    var textNode = new window.Text(n)
                    this._content[event.index + i].dom = textNode
                    _tryInsertDom(event.index + i)
                  })
                } else {
                  var valId = this._content[event.index].id
                  event.nodes().then(xmls => {
                    return xmls[0].getDom()
                  }).then(newNode => {
                    mutualExclude(() => {
                      // This is called async. So we have to compute the position again
                      // also mutual excluse this
                      var pos
                      if (event.index < this._content.length && Y.utils.compareIds(this._content[event.index].id, valId)) {
                        pos = event.index
                      } else {
                        pos = this._content.findIndex(function (c) {
                          return Y.utils.compareIds(c.id, valId)
                        })
                      }
                      if (pos >= 0) {
                        this._content[pos].dom = newNode
                        _tryInsertDom(pos)
                      }
                    })
                  })
                }
              } else if (event.type === 'childRemoved') {
                event._content.forEach(function (c) {
                  if (c.dom != null) {
                    c.dom.remove()
                  }
                  _tryInsertDom(event.index - 1)
                })
              }
            })
          })
          resolve(dom)
        })
      }
      _setDom (dom) {
        if (this.dom != null) {
          throw new Error('Only call this method if you know what you are doing ;)')
        } else if (dom.__yxml != null) { // TODO do i need to check this? - no.. but for dev purps..
          throw new Error('Already bound to an YXml type')
        } else {
          dom.__yxml = this._model
          // tag is already set in constructor
          // set attributes
          for (var i = 0; i < dom.attributes.length; i++) {
            var attr = dom.attributes[i]
            this.attributes.set(attr.name, attr.value)
          }
          this.insert(0, Array.prototype.map.call(dom.childNodes, function (c, i) {
            if (c instanceof window.Element) {
              return Y.Xml(c)
            } else if (c instanceof window.Text) {
              return c.textContent
            } else {
              throw new Error('Unknown node type!')
            }
          }))
          Array.prototype.forEach.call(dom.childNodes, (dom, i) => {
            var c = this._content[i]
            c.dom = dom
            c.isInserted = true
          })
          this.dom = this._bindToDom(dom)
          return this.dom
        }
      }
      getDom () {
        if (this.dom == null) {
          var dom = document.createElement(this.tagname)
          dom.__yxml = this
          this.attributes.keysPrimitives().forEach(key => {
            dom.setAttribute(key, this.attributes.get(key))
          })
          return new Promise((resolve) => {
            var self = this
            this.os.requestTransaction(function *() {
              var children = [] // <Promise([dom, content_i])>
              for (var i = 0; i < self._content.length; i++) {
                let c = self._content[i]
                if (c.hasOwnProperty('val')) {
                  children.push([new window.Text(c.val), c])
                } else {
                  var type = yield* this.getType(c.type)
                  children.push(type.getDom().then(function (dom) {
                    return [dom, c]
                  }))
                }
              }
              self.dom = self._bindToDom(dom)
              Promise.all(children).then(function (inserts) {
                self._mutualExclude(function () {
                  inserts.forEach(function (ins, i) {
                    // need to find position again, because this could be deleted (though this is very unlikely)
                    var pos
                    if (self._content[i] === ins[1]) {
                      // likeliest case
                      pos = i
                    } else {
                      // find content again
                      pos = self._content.findIndex(function (c) {
                        return c === ins[1]
                      })
                    }
                    if (pos >= 0) {
                      // not deleted, insert dom
                      ins[1].dom = ins[0]
                      self._tryInsertDom(pos)
                    }
                  })
                  self.dom.then(resolve)
                })
              })
            })
          })
        }
        return this.dom
      }
      observe (f) {
        this._eventListenerHandler.addEventListener(f)
      }
      unobserve (f) {
        this._eventListenerHandler.removeEventListener(f)
      }
      * _changed () {
        if (this._domObserver != null) {
          this._domObserverListener(this._domObserver.takeRecords())
        }
        yield* Y.Array.typeDefinition['class'].prototype._changed.apply(this, arguments)
      }
    }
    Y.extend('Xml', new Y.utils.CustomType({
      name: 'Xml',
      class: YXml,
      struct: 'List',
      parseArguments: function (arg) {
        if (typeof arg === 'string') {
          return [this, {
            tagname: arg
          }]
        } else if (arg instanceof window.Element) {
          return [this, {
            tagname: arg.tagName,
            dom: arg
          }]
        } else {
          throw new Error('Y.Xml requires an argument which is a string!')
        }
      },
      appendAdditionalInfo: function * (op, init) {
        var id = null
        if (op.id[0] === '_') {
          var typestruct = Y.Map.typeDefinition.struct
          id = ['_', typestruct + '_' + 'Map_' + op.id[1]]
        }
        var properties = yield* this.createType(Y.Map(), id)
        op.info = {
          tagname: init.tagname
        }
        op.requires = [properties._model] // XML requires that 'properties' exists
      },
      initType: function * YXmlInitializer (os, model, init) {
        var _content = []
        yield* Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            _content.push({
              id: op.id,
              type: op.opContent
            })
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              })
            })
          }
        })
        var properties = yield* this.getType(model.requires[0]) // get the only required op
        return new YXml(os, model.id, _content, properties, model.info.tagname, init)
      }
    }))
  })
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}

},{}]},{},[1])

