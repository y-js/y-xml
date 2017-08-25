import { applyChangesFromDom } from './utils.js'

export default function extendYXmlFragment (Y, _document, _MutationObserver) {
  Y.requestModules(['Array']).then(function () {
    class YXmlFragment extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content, args) {
        super(os, _model, _content)
        this.dom = null
        this._domObserver = null
        this._domObserverListener = null
      }

      bindToDom (dom) {
        if (this.dom != null || dom.__yxml != null) {
          throw new Error('Already bound to a dom element!')
        }
        if (_MutationObserver == null) {
          throw new Error('Not able to bind to a DOM element, because MutationObserver is not available!')
        }
        var token = true
        function mutualExcluse (f) {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              token = true
              throw new Error(e)
            }
            token = true
          }
        }
        this.observe(event => {
          mutualExcluse(() => {
            if (event.type === 'insert') {
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
            } else if (event.type === 'delete') {
              event.values.forEach(function (yxml) {
                yxml.dom.remove()
              })
            }
          })
        })
        this.dom = dom
        dom.__yxml = this
        this._domObserverListener = () => {
          mutualExcluse(applyChangesFromDom.bind(this))
        }
        this._domObserver = new _MutationObserver(this._domObserverListener)
        this._domObserver.observe(this.dom, { attributes: true, childList: true })
      }

      toString () {
        return this._content
          .map(c => this.os.getType(c.type).toString())
          .join('')
      }

      * _changed (transaction, op) {
        if (this._domObserver != null) {
          this._domObserverListener(this._domObserver.takeRecords())
        }
        yield * super._changed(transaction, op)
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
    Y.extend('XmlFragment', new Y.utils.CustomTypeDefinition({
      name: 'XmlFragment',
      class: YXmlFragment,
      struct: 'List',
      initType: function * YXmlFragmentInitializer (os, model) {
        var _content = []
        yield * Y.Struct.List.map.call(this, model, function (op) {
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
        return new YXmlFragment(os, model.id, _content, {})
      },
      createType: function YXmlTextCreator (os, model) {
        return new YXmlFragment(os, model.id, [])
      }
    }))
  })
}
