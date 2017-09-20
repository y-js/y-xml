/* global getSelection */

import diff from 'fast-diff'

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

export default function extendYXmlText (Y, _document, _MutationObserver) {
  Y.requestModules(['Array']).then(function () {
    class YXmlText extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content, args) {
        super(os, _model, _content)
        if (args != null && args.content != null && _model[0] !== '_') {
          this.insert(0, args.content)
        }
        this.dom = null
        this._domObserver = null
        this._domObserverListener = null
        if (args != null && args.dom != null) {
          this._setDom(args.dom)
        }
        var token = true
        this._mutualExcluse = f => {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              console.error(e)
            }
            this._domObserver.takeRecords()
            token = true
          }
        }
        this.observe(event => {
          if (this.dom != null) {
            this._mutualExcluse(() => {
              let selection = null
              let shouldUpdateSelection = false
              let anchorNode = null
              let anchorOffset = null
              let focusNode = null
              let focusOffset = null
              if (typeof getSelection !== 'undefined') {
                selection = getSelection()
                if (selection.anchorNode === this.dom) {
                  anchorNode = selection.anchorNode
                  anchorOffset = fixPosition(event, selection.anchorOffset)
                  shouldUpdateSelection = true
                }
                if (selection.focusNode === this.dom) {
                  focusNode = selection.focusNode
                  focusOffset = fixPosition(event, selection.focusOffset)
                  shouldUpdateSelection = true
                }
              }
              this.dom.nodeValue = this.toString()
              if (shouldUpdateSelection) {
                selection.setBaseAndExtent(
                  anchorNode || selection.anchorNode,
                  anchorOffset || selection.anchorOffset,
                  focusNode || selection.focusNode,
                  focusOffset || selection.focusOffset
                )
              }
            })
          }
        })
      }

      setDomFilter () {}

      _setDom (dom) {
        if (this.dom != null) {
          this._unbindFromDom()
        }
        if (dom.__yxml != null) {
          dom.__yxml._unbindFromDom()
        }
        if (_MutationObserver == null) {
          return
        }
        this.dom = dom
        dom.__yxml = this
        this._domObserverListener = () => {
          this._mutualExcluse(() => {
            var diffs = diff(this.toString(), this.dom.nodeValue)
            var pos = 0
            for (var i = 0; i < diffs.length; i++) {
              var d = diffs[i]
              if (d[0] === 0) { // EQUAL
                pos += d[1].length
              } else if (d[0] === -1) { // DELETE
                this.delete(pos, d[1].length)
              } else { // INSERT
                this.insert(pos, d[1])
                pos += d[1].length
              }
            }
          })
        }
        this._domObserver = new _MutationObserver(this._domObserverListener)
        this._domObserver.observe(this.dom, { characterData: true })
      }

      getDom () {
        if (this.dom == null) {
          let dom = _document.createTextNode(this.toString())
          if (_MutationObserver !== null) {
            this._setDom(dom)
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
        super.insert(pos, content.split(''))
      }

      _changed (transaction, op) {
        if (this._domObserver != null) {
          this._domObserverListener(this._domObserver.takeRecords())
        }
        super._changed(transaction, op)
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
        if (this._eventListenerHandler != null) {
          this._eventListenerHandler.destroy()
        }
        this._unbindFromDom()
        super._destroy()
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
        var _content = []
        Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            throw new Error('Text must not contain types!')
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              })
            })
          }
        })
        return new YXmlText(os, model.id, _content, {}, init || {})
      },
      createType: function YXmlTextCreator (os, model, args) {
        return new YXmlText(os, model.id, [], args || {})
      }
    }))
  })
}
