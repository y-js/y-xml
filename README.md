
# XML Type for [Yjs](https://github.com/rwth-acis/yjs)

Manage XML Elements with this type. You can create a two-way binding to a DOM Element and manipulate the DOM directly while everybody will end up with the same DOM Element.

## Use it!
Retrieve this with bower or npm. Note: You also have to import [Y.Xml](https://github.com/rwth-acis/y-list)!

##### Bower
```
bower install y-xml --save
```

and include the js library.

```
<script src="./bower_components/y-xml/y-xml.js"></script>
```

##### NPM
```
npm install y-xml --save
```
and put it on the `Y` object.

```
Y.Xml = require("y-xml");
```


### Xml Element

##### Reference
* Create
```
var yxml = new Y.Xml()
```
* Create with existing DOM Element
```
var yxml = new Y.Xml(dom)
```
* .toString()
  * Transform this Element to a String
* .attr()
  * Retrieve all the attributes as a JSON object
* .attr(attrName)
  * Retrieve the value of an attribute
* .attr(attrName, newValue)
  * Set/Update an attribute
* .addClass(className)
  * Add a class to this Element
* .after(yxml)
  * Insert an Y.Xml Element after this Element
* .before(yxml)
  * Insert an Y.Xml Element before this Element
* .append(yxml)
  * Insert an Y.Xml Element as the last child of this Element
* .prepend(yxml)
  * Insert an Y.Xml Element as the first child of this Element
* .empty()
  * Remove all the child elements
* .hasClass(className)
  * True if this Element has the specified class
* .remove()
  * Remove this Element from the parent
* .removeAttr(attrName)
  * Remove an attribute from this Element
* .removeClass(className)
  * Remove a class from this Element
* .toggleClass(className)
  * Toggle a class of this Element
* .getParent()
  * Get the parent of this Element
* .getChildren()
  * Get all the children of this Element as an Array
* .getDom()
  * Transform this Element to a DOM Element and create a two-way binding. All changes that are applied on the DOM Element will be reflected in the Y.Xml Element and vice versa.

##### DOM Reference
The following methods are supported on the dom (for two way binding)

* .insertBefore
* .appendChild
* .setAttribute
* .removeAttribute
* .removeChild
* .replaceChild
* .classList.add
* .classList.remove
* .textContent (set and get)

##### Jquery
For convenience you can also use jquery to manipulate the DOM. This works because the respective DOM methods are implemented. Other libraries may also work. The following methods are tested:

* .addClass
* .after
* .append
* .appendTo
* .before
* .detach
* .empty
* .insertAfter
* .insertBefore
* .prepend
* .prependTo
* .remove
* .removeAttr
* .removeClass
* .attr
* .replaceAll
* .replaceWith

# A note on consistency, validation, and intention preservation
We ensure that the XML is always well formed. Yjs does not (yet) support validation of shared types via, for example, DTDs. There are, however, some ways how we ensure the semantic meaning of some methods is preserved:
* When two users toggle/add a class (e.g. via `.toggleClass(className)`), the class will be toggled/added only once
* When user1 overwrites/deletes all the classes (e.g. `.removeAttr("class")`), and another user adds/toggles a class, the changes of user1 will prevail and the changes of the other user are be ignored
* The DOM specification does not support that an Element has multiple parents. Y.Xml does not support this either. So, when two users move a DOM Element to different places, only one change will prevail

If two users insert something at the same position concurrently, the content that was inserted by the user with the higher user-id will be to the right of the other content. In the OT world we often speak of *intention preservation*, which is very loosely defined in most cases. This type has the following notion of intention preservation: When a user inserts content *c* after a set of content *C_left*, and before a set of content *C_right*, then *C_left* will be always to the left of c, and *C_right* will be always to the right of *c*. This property will also hold when content is deleted or when a deletion is undone.

# Issues
* Throw errors when a user creates invalid attribute/tag names

## License
Yjs is licensed under the [MIT License](./LICENSE.txt).

<kevin.jahns@rwth-aachen.de>