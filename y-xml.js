
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

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/* global Y, MutationObserver, Element, Text */

function yarrayEventHandler(op) {
  var _this = this;

  if (op.struct === 'Insert') {
    // when using indexeddb db adapter, the op could already exist (see y-js/y-indexeddb#2)
    if (this._content.some(function (c) {
      return Y.utils.compareIds(c.id, op.id);
    })) {
      // op exists
      return;
    }
    var pos = void 0;
    // we check op.left only!,
    // because op.right might not be defined when this is called
    if (op.left === null) {
      pos = 0;
    } else {
      pos = 1 + this._content.findIndex(function (c) {
        return Y.utils.compareIds(c.id, op.left);
      });
      if (pos <= 0) {
        throw new Error('Unexpected operation!');
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
      var type = this.os.getType(op.opContent);
      type._parent = this._model;
      values = [type];
    } else {
      var contents = op.content.map(function (c, i) {
        return {
          id: [op.id[0], op.id[1] + i],
          val: c
        };
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
        for (delLength = 1; delLength < op.length && i + delLength < this._content.length && Y.utils.inDeletionRange(op, this._content[i + delLength].id); delLength++) {}
        // last operation that will be deleted
        c = this._content[i + delLength - 1];
        // update delete operation
        op.length -= c.id[1] - op.target[1] + 1;
        op.target = [c.id[0], c.id[1] + 1];
        // apply deletion & find send event
        var content = this._content.splice(i, delLength);
        var _values = content.map(function (c) {
          if (c.val != null) {
            return c.val;
          } else {
            return _this.os.getType(c.type);
          }
        });
        Y.utils.bubbleEvent(this, {
          type: 'delete',
          object: this,
          index: i,
          values: _values,
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
    throw new Error('Unexpected struct!');
  }
}

function ymapEventHandler(op) {
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
    throw new Error('Unexpected Operation!');
  }
}

function extendXml(Y) {
  var YXml = function (_Y$utils$CustomType) {
    inherits(YXml, _Y$utils$CustomType);

    function YXml(os, model, arrayContent, contents, opContents) {
      classCallCheck(this, YXml);

      var _this2 = possibleConstructorReturn(this, (YXml.__proto__ || Object.getPrototypeOf(YXml)).call(this));

      _this2._os = os;
      _this2._model = model;
      // map is the map of attributes (y-map convention)
      _this2.map = Y.utils.copyObject(model.map);
      _this2.contents = contents;
      _this2.opContents = opContents;
      // _content is the list of childnotes (y-array convention)
      _this2._content = arrayContent;
      _this2.nodeName = model.nodeName;
      _this2._domObserver = null;
      _this2._dom = null;
      var mapEventHandler = ymapEventHandler.bind(_this2);
      var arrayEventHandler = yarrayEventHandler.bind(_this2);
      _this2._eventListenerHandler = new Y.utils.EventListenerHandler(function (op) {
        if (op.parentSub !== undefined) {
          mapEventHandler(op);
        } else {
          arrayEventHandler(op);
        }
      });
      return _this2;
    }

    createClass(YXml, [{
      key: '_destroy',
      value: function _destroy() {
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
    }, {
      key: 'insert',
      value: function insert(pos, types) {
        var _types = [];
        if (!Array.isArray(types)) {
          throw new Error('Expected an Array of content!');
        }
        for (var i = 0; i < types.length; i++) {
          var v = types[i];
          var t = Y.utils.isTypeDefinition(v);
          if (!(v != null && (typeof v === 'string' || t && t[0].class === YXml))) {
            throw new Error('Expected Y.Xml type or String!');
          } else if (typeof v === 'string' && v.length === 0) {
            continue; // if empty string
          }
          _types.push(v);
        }
        Y.Array.typeDefinition.class.prototype.insert.call(this, pos, types);
      }
    }, {
      key: 'delete',
      value: function _delete() {
        Y.Array.typeDefinition.class.prototype.delete.apply(this, arguments);
      }
    }, {
      key: 'setAttribute',
      value: function setAttribute() {
        Y.Map.typeDefinition.class.prototype.set.apply(this, arguments);
      }
    }, {
      key: 'getAttribute',
      value: function getAttribute() {
        Y.Map.typeDefinition.class.prototype.get.apply(this, arguments);
      }
    }, {
      key: 'getAttributes',
      value: function getAttributes() {
        var _this3 = this;

        var keys = Y.Map.typeDefinition.class.prototype.keys.apply(this);
        var obj = {};
        keys.forEach(function (key) {
          obj[key] = Y.Map.typeDefinition.class.prototype.get.call(_this3, key);
        });
        return obj;
      }

      // binds to a dom element
      // Only call if dom and YXml are isomorph

    }, {
      key: '_bindToDom',
      value: function _bindToDom(dom) {
        var _this4 = this;

        // this function makes sure that either the
        // dom event is executed, or the yjs observer is executed
        var token = true;
        var mutualExclude = function mutualExclude(f) {
          // take and process current records
          var records = _this4._domObserver.takeRecords();
          if (records.length > 0) {
            _this4._domObserverListener(records);
          }
          if (token) {
            token = false;
            try {
              f();
            } catch (e) {
              // discard created records
              _this4._domObserver.takeRecords();
              token = true;
              throw e;
            }
            _this4._domObserver.takeRecords();
            token = true;
          }
        };
        this._mutualExclude = mutualExclude;
        this._domObserverListener = function (mutations) {
          mutualExclude(function () {
            mutations.forEach(function (mutation) {
              if (mutation.type === 'attributes') {
                var name = mutation.attributeName;
                var val = mutation.target.getAttribute(mutation.attributeName);
                if (_this4.getAttribute(name) !== val) {
                  _this4.setAttribute(name, val);
                }
              } else if (mutation.type === 'childList') {
                var _loop = function _loop(i) {
                  var n = mutation.addedNodes[i];
                  if (_this4._content.some(function (c) {
                    return c.dom === n;
                  })) {
                    // check if it already exists (since this method is called asynchronously)
                    return 'continue';
                  }
                  if (n instanceof Text && n.textContent === '') {
                    // check if textnode and empty content (sometime happens.. )
                    //   TODO - you could also check if the inserted node actually exists in the
                    //          dom (in order to cover more potential cases)
                    n.remove();
                    return 'continue';
                  }
                  // compute position
                  // special case, n.nextSibling is not yet inserted. So we find the next inserted element!
                  pos = -1;
                  nextSibling = n.nextSibling;

                  while (pos < 0) {
                    if (nextSibling == null) {
                      pos = _this4._content.length;
                    } else {
                      pos = _this4._content.findIndex(function (c) {
                        return c.dom === nextSibling;
                      });
                      nextSibling = nextSibling.nextSibling;
                    }
                  }

                  if (n instanceof Text) {
                    c = n.textContent;
                  } else if (n instanceof Element) {
                    c = Y.Xml(n);
                  } else {
                    throw new Error('Unsupported XML Element found. Synchronization will no longer work!');
                  }
                  _this4.insert(pos, [c]);
                  content = _this4._content[pos];

                  content.dom = n;
                };

                for (var i = 0; i < mutation.addedNodes.length; i++) {
                  var pos;
                  var nextSibling;
                  var c;
                  var content;

                  var _ret = _loop(i);

                  if (_ret === 'continue') continue;
                }
                Array.prototype.forEach.call(mutation.removedNodes, function (n) {
                  var pos = _this4._content.findIndex(function (c) {
                    return c.dom === n;
                  });
                  if (pos >= 0) {
                    _this4.delete(pos);
                  } else {
                    throw new Error('An unexpected condition occured (deleted node does not exist in the model)!');
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
        var _tryInsertDom = function _tryInsertDom(pos) {
          var c = _this4._content[pos];
          var succ;
          if (pos + 1 < _this4._content.length) {
            succ = _this4._content[pos + 1];
            if (succ.dom == null) throw new Error('Unexpected behavior'); // shouldn't happen anymore!
          } else {
            // pseudo successor
            succ = {
              dom: null
            };
          }
          dom.insertBefore(c.dom, succ.dom);
        };
        this._tryInsertDom = _tryInsertDom;
        this.observe(function (event) {
          mutualExclude(function () {
            if (event.type === 'attributeChanged') {
              dom.setAttribute(event.name, event.value);
            } else if (event.type === 'attributeRemoved') {
              dom.removeAttribute(event.name);
            } else if (event.type === 'childInserted') {
              if (event.nodes.length === 1 && event.nodes[0] instanceof YXml) {
                // a new xml node was inserted.
                // TODO: consider the case that nodes contains mixed text & types (currently not implemented in yjs)
                var valId = _this4._content[event.index].id;
                if (event.nodes.length > 1) {
                  throw new Error('This case is not handled, you\'ll run into consistency issues. Contact the developer');
                }
                var newNode = event.nodes[0].getDom();
                // This is called async. So we have to compute the position again
                // also mutual excluse this
                var pos;
                if (event.index < _this4._content.length && Y.utils.compareIds(_this4._content[event.index].id, valId)) {
                  pos = event.index;
                } else {
                  pos = _this4._content.findIndex(function (c) {
                    return Y.utils.compareIds(c.id, valId);
                  });
                }
                if (pos >= 0) {
                  _this4._content[pos].dom = newNode;
                  _tryInsertDom(pos);
                }
              } else {
                for (var i = event.nodes.length - 1; i >= 0; i--) {
                  var n = event.nodes[i];
                  var textNode = new Text(n);
                  _this4._content[event.index + i].dom = textNode;
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
        return dom;
      }
    }, {
      key: 'getDom',
      value: function getDom() {
        if (this.dom == null) {
          var dom = document.createElement(this.tagname);
          dom.__yxml = this;
          var attrs = this.getAttributes();
          for (var key in attrs) {
            dom.setAttribute(key, attrs[key]);
          }

          for (var i = 0; i < this._content.length; i++) {
            var c = this._content[i];
            if (c.hasOwnProperty('val')) {
              c.dom = new Text(c.val);
            } else {
              c.dom = this.os.getType(c.type).getDom();
            }
            dom.appendChild(c.dom);
          }
          this.dom = this._bindToDom(dom);
        }
        return this.dom;
      }
    }, {
      key: 'observe',
      value: function observe(f) {
        function observeWrapper(event) {
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
            throw new Error('Unexpected event');
          }
        }
        this._eventListenerHandler.addEventListener(observeWrapper);
        return observeWrapper;
      }
    }, {
      key: 'unobserve',
      value: function unobserve(f) {
        this._eventListenerHandler.removeEventListener(f);
      }
    }, {
      key: '_changed',
      value: /*#__PURE__*/regeneratorRuntime.mark(function _changed(transaction, op) {
        var _args = arguments;
        return regeneratorRuntime.wrap(function _changed$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this._domObserver != null) {
                  this._domObserverListener(this._domObserver.takeRecords());
                }

                if (!op.parentSub) {
                  _context.next = 5;
                  break;
                }

                return _context.delegateYield(Y.Map.typeDefinition['class'].prototype._changed.apply(this, _args), 't0', 3);

              case 3:
                _context.next = 6;
                break;

              case 5:
                return _context.delegateYield(Y.Array.typeDefinition['class'].prototype._changed.apply(this, _args), 't1', 6);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _changed, this);
      })
    }]);
    return YXml;
  }(Y.utils.CustomType);

  Y.extend('Xml', new Y.utils.CustomTypeDefinition({
    name: 'Xml',
    class: YXml,
    struct: 'Xml',
    parseArguments: function parseArguments(tagname) {
      if (typeof tagname === 'string') {
        return [this, tagname];
      } else {
        throw new Error('Y.Xml requires an argument which is a string!');
      }
    },
    initType: /*#__PURE__*/regeneratorRuntime.mark(function YXmlInitializer(os, model, nodeName) {
      var _content, _types, i, contents, opContents, map, name, op;

      return regeneratorRuntime.wrap(function YXmlInitializer$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // here begins the modified y-array init
              _content = [];
              _types = [];
              return _context2.delegateYield(Y.Struct.Xml.map.call(this, model, function (op) {
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
              }), 't0', 3);

            case 3:
              i = 0;

            case 4:
              if (!(i < _types.length)) {
                _context2.next = 9;
                break;
              }

              return _context2.delegateYield(os.initType.call(this, _types[i]), 't1', 6);

            case 6:
              i++;
              _context2.next = 4;
              break;

            case 9:
              // here begins the modified y-map init
              contents = {};
              opContents = {};
              map = model.map;
              _context2.t2 = regeneratorRuntime.keys(map);

            case 13:
              if ((_context2.t3 = _context2.t2()).done) {
                _context2.next = 27;
                break;
              }

              name = _context2.t3.value;
              return _context2.delegateYield(this.getOperation(map[name]), 't4', 16);

            case 16:
              op = _context2.t4;

              if (!op.deleted) {
                _context2.next = 19;
                break;
              }

              return _context2.abrupt('continue', 13);

            case 19:
              if (!(op.opContent != null)) {
                _context2.next = 24;
                break;
              }

              opContents[name] = op.opContent;
              return _context2.delegateYield(this.store.initType.call(this, op.opContent), 't5', 22);

            case 22:
              _context2.next = 25;
              break;

            case 24:
              contents[name] = op.content[0];

            case 25:
              _context2.next = 13;
              break;

            case 27:
              return _context2.abrupt('return', new YXml(os, model, _content, contents, opContents));

            case 28:
            case 'end':
              return _context2.stop();
          }
        }
      }, YXmlInitializer, this);
    }),
    createType: function YXmlCreator(os, model, args) {
      return new YXml(os, model, [], {}, {});
    }
  }));
}

if (typeof Y !== 'undefined') {
  extendXml(Y);
}

exports.extendXml = extendXml;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=y-xml.js.map
