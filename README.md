
# XML Type for [Yjs](https://github.com/y-js/yjs)

Share XML documents with this type. You can also get a DOM representation of this shared Y.Xml type. Y.Xml does not yet support the full DOM specification. 

## Use it!
Retrieve this with bower or npm.

##### Bower
```
bower install y-xml --save
```

##### NPM
```
npm install y-xml y-array y-map --save
```

This type depends on [y-array](https://github.com/y-js/y-array), and [y-map](https://github.com/y-js/y-map). So you have to extend Yjs in the right order:

```js
var Y = require('yjs')
require('y-array')(Y)
require('y-map')(Y)
require('y-xml')(Y)
```

### Xml Object

##### Create
Y.Xml expects a tagname, or a DOM Element as constructor argument. I.e.

```js
map.set('myXmlType', Y.XmlElement('div'))
map.set('myOtherXmlType', Y.XmlElement(document.querySelector('div')))
map.set('myXmlFragment', Y.XmlFragment)
```

When creating a Y.Xml type on y.share, you can specify the tagname like this:
```js
Y({
  ..
  share: {
    xml: 'XmlElement("div")'
  }
})
```

##### Reference

*Y.XmlFragment* - A collection of nodes

* bindToDom(dom)
  * Bind the children of a dom element to the nodes of this XmlFragment. Useful if you don't want to share the attributes of the root node

*Y.XmlElement*

* .setDomFilter((domElement, attributeNames) => filteredAttributes)
  * Filter out specific dom elements and attributes
  * If `filteredAttributes` is null, the node will not be shared
  * Attribute names that are in `attributeNames` but not in `filteredAttributes` will not be shared
* .getDom()
  * Returns a DOM Element
* .insert(position, contents)
  * Insert an array of children at a position
* .insertDomElements(position, domElements)
  * Insert an array of dom elements at a position
* .delete(position, length)
  * Delete children. The *length* parameter is optional and defaults to 1
* .get(position)
  * Retrieve a child at a position
  * Returns a promise if the content is a Y.Xml type
* .observe(function observer(events){..})
  * The `observer` is called synchronously when something changed
  * Throws *attributeChanged*, *attributeRemoved*, *childInserted*, and *childRemoved* events (`events[*].type`)
  * If value is a Y.Xml type, `events[*].value` is a function that returns a promise for the type
  * When employing the DOM binding, you may want to use DOM [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) instead of `.observe(..)`
* .getAttribute(name)
  * Get a specific attribute
* .setAttribute(name, value)
  * Set a attribute. `value` must be of type string
* .unobserve(f)
  * Delete an observer

## Changelog

### 11.0.0
* `contenteditable` is supported
* Relies on Yjs@^13.0.0

### 10.0.0
* Retrieving the dom is a synchronous operation now
* Relies on Yjs@^12.0.0

## License
Yjs is licensed under the [MIT License](./LICENSE).

<kevin.jahns@rwth-aachen.de>
