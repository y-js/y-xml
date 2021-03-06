import { reflectChangesOnDom, defaultDomFilter, applyChangesFromDom } from './utils.js'

export default function extendYXmlFragment (Y, _document, _MutationObserver) {
  Y.requestModules(['Array']).then(function () {
    class YXmlFragment extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content, args) {
        super(os, _model, _content)
        this.dom = null
        this._domObserver = null
        this._domObserverListener = null
        this._domFilter = defaultDomFilter
        this._scrollElement = null
        var token = true
        this._mutualExclude = f => {
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
        reflectChangesOnDom(this)
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
          this._unbindFromDom()
        }
        if (dom.__yxml != null) {
          dom.__yxml._unbindFromDom()
        }
        if (_MutationObserver == null) {
          throw new Error('Not able to bind to a DOM element, because MutationObserver is not available!')
        }
        dom.innerHTML = ''
        for (let i = 0; i < this._content.length; i++) {
          dom.insertBefore(this.get(i).getDom(), null)
        }
        this.dom = dom
        dom.__yxml = this
        this._domObserverListener = () => {
          this._mutualExclude(() => applyChangesFromDom(this))
        }
        this._domObserver = new _MutationObserver(this._domObserverListener)
        this._domObserver.takeRecords() // discard made changes
        this._domObserver.observe(this.dom, { childList: true })
      }

      toString () {
        return this._content
          .map(c => this.os.getType(c.type).toString())
          .join('')
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
    Y.extend('XmlFragment', new Y.utils.CustomTypeDefinition({
      name: 'XmlFragment',
      class: YXmlFragment,
      struct: 'List',
      initType: function YXmlFragmentInitializer (os, model) {
        var _content = []
        var _types = []
        Y.Struct.List.map.call(this, model, function (op) {
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
          var type = this.store.initType.call(this, _types[i])
          type._parent = model.id
        }
        return new YXmlFragment(os, model.id, _content)
      },
      createType: function YXmlTextCreator (os, model) {
        return new YXmlFragment(os, model.id, [])
      }
    }))
  })
}
