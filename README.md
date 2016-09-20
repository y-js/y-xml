
# XML Type for [Yjs](https://github.com/y-js/yjs)

Share XML documents with this type. You can also get a DOM representation of this shared Y.Xml type. Y.Xml does not yet support the full DOM specification - e.g. Shadow DOM, and contenteditable are not supported. 

## Use it!
Retrieve this with bower or npm.

##### Bower
```
bower install y-xml --save
```

##### NPM
```
npm install y-xml --save
```

### Xml Object

##### Create
Y.Xml expects a tagname, or a DOM Element as constructor argument. I.e.
```
map.set('myXmlType', Y.Xml('div'))
map.set('myOtherXmlType', Y.Xml(document.querySelector('div')))
```

When creating a Y.Xml type on y.share, you can specify the tagname like this:
```
Y({
  ..
  share: {
    xml: 'Xml("div")'
  }
})
```

##### Reference

* .getDom()
  * Returns a promise for a DOM Element
* .insert(position, contents)
  * Insert an array of children at a position
  * You can insert strings, and `Y.Xml('tagname')` types
* .push(content)
  * Insert a node as the last child
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
* .attributes.get(name) :: String
  * Get a specific attribute
* .attributes.get() :: Object
  * Get all attributes as a JSON object
* .attributes.set(name, value)
  * Set a attribute. `value` must be of type string
* .unobserve(f)
  * Delete an observer

# A note on time complexities
* .insert(position, content)
  * O(position + contents.length)
* .push(content)
  * O(1)
* .delete(position, length)
  * O(position)
* .get(i)
  * O(length)
* Apply a delete operation from another user
  * O(1)
* Apply an insert operation from another user
  * Yjs does not transform against operations that do not conflict with each other.
  * An operation conflicts with another operation if it intends to be inserted at the same position.
  * Overall worst case complexety: O(|conflicts|!)

## Changelog

### 10.0.0
* Retrieving the dom is a synchronous operation now
* Relies on Yjs@^12.0.0

## License
Yjs is licensed under the [MIT License](./LICENSE).

<kevin.jahns@rwth-aachen.de>