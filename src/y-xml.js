/* global Y, MutationObserver */

import yXmlText from './y-xml-text.js'
import yXmlFragment from './y-xml-fragment.js'
import yXmlElement from './y-xml-element.js'

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
  yXmlElement(Y, _document, _MutationObserver)
  yXmlText(Y, _document, _MutationObserver)
  yXmlFragment(Y, _document, _MutationObserver)
}

if (typeof Y !== 'undefined') {
  extendXml(Y)
}
