(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var YXml, dont_proxy, initialize_proxies, proxies_are_initialized, proxy_token, _proxy,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

YXml = {};

YXml.Node = (function() {
  function Node() {
    if (this._xml == null) {
      this._xml = {};
    }
  }

  Node.prototype._checkForModel = function() {
    if (this._model == null) {
      throw new Error("You have to put the Y." + this._name + ' instance on a shared element before you can use it! E.g. on the y object y.val("my-' + this._name + '",y' + this._name + ')');
    }
  };

  Node.prototype._getModel = function() {
    if (this._xml.parent != null) {
      this._model.val("parent", this._xml.parent);
    }
    this._setModel(this._model);
    if (this._dom != null) {
      this.getDom();
    }
    return this._model;
  };

  Node.prototype._setModel = function(_model) {
    this._model = _model;
    this._model.observe(function(events) {
      var c, children, event, i, parent, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        if (event.name === "parent" && event.type !== "add") {
          parent = event.oldValue;
          children = (_ref = parent._model.val("children")) != null ? _ref.val() : void 0;
          if ((children != null) && event.oldValue !== event.object._model.val("parent")) {
            _results.push((function() {
              var _j, _len1, _results1;
              _results1 = [];
              for (i = _j = 0, _len1 = children.length; _j < _len1; i = ++_j) {
                c = children[i];
                if (c === this) {
                  parent._model.val("children")["delete"](i);
                  break;
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
    return delete this._xml;
  };

  Node.prototype._setParent = function(parent) {
    if (parent instanceof YXml.Element) {
      if (this._model != null) {
        this.remove();
        return this._model.val("parent", parent);
      } else {
        return this._xml.parent = parent;
      }
    } else {
      throw new Error("parent must be of type Y.Xml!");
    }
  };

  Node.prototype.after = function() {
    var c, content, contents, parent, position, _i, _j, _len, _len1, _ref;
    this._checkForModel();
    parent = this._model.val("parent");
    if (parent == null) {
      throw new Error("This Xml Element must not have siblings! (for it does not have a parent)");
    }
    _ref = parent.getChildren();
    for (position = _i = 0, _len = _ref.length; _i < _len; position = ++_i) {
      c = _ref[position];
      if (c === this) {
        break;
      }
    }
    contents = [];
    for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
      content = arguments[_j];
      if (content instanceof YXml.Element) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml.Element or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position + 1, contents);
  };

  Node.prototype.before = function() {
    var c, content, contents, parent, position, _i, _j, _len, _len1, _ref;
    this._checkForModel();
    parent = this._model.val("parent");
    if (parent == null) {
      throw new Error("This Xml Element must not have siblings! (for it does not have a parent)");
    }
    _ref = parent.getChildren();
    for (position = _i = 0, _len = _ref.length; _i < _len; position = ++_i) {
      c = _ref[position];
      if (c === this) {
        break;
      }
    }
    contents = [];
    for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
      content = arguments[_j];
      if (content instanceof YXml.Element) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml.Element or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position, contents);
  };

  Node.prototype.remove = function() {
    var parent;
    this._checkForModel();
    if (this._model.val("parent") != null) {
      parent = this._model["delete"]("parent");
    }
    return this;
  };

  Node.prototype.getParent = function() {
    this._checkForModel();
    return this._model.val("parent");
  };

  Node.prototype.getPosition = function() {
    var c, i, parent, _i, _len, _ref;
    this._checkForModel();
    parent = this._model.val("parent");
    if (parent != null) {
      _ref = parent._model.val("children").val();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        c = _ref[i];
        if (c === this) {
          return i;
        }
      }
      throw new Error("This is not a child of its parent (should not happen in Y.Xml!)");
    } else {
      return null;
    }
  };

  return Node;

})();

YXml.Text = (function(_super) {
  __extends(Text, _super);

  function Text(text) {
    if (text == null) {
      text = "";
    }
    Text.__super__.constructor.call(this);
    if (text.constructor === String) {
      this._xml.text = text;
    } else if (text instanceof window.Text) {
      this._dom = text;
    } else if (text != null) {
      throw new Error("The constructor of Y.Xml.Text expects either String or an Dom Text element!");
    }
  }

  Text.prototype._getModel = function(Y, ops) {
    if (this._model == null) {
      if (this._dom != null) {
        this._xml.text = this._dom.textContent;
      }
      this._model = new ops.MapManager(this).execute();
      this._model.val("text", this._xml.text);
      Text.__super__._getModel.apply(this, arguments);
    }
    return this._model;
  };

  Text.prototype._name = "Xml.Text";

  Text.prototype.toString = function() {
    this._checkForModel();
    return this._model.val("text");
  };

  Text.prototype.getDom = function() {
    var that;
    if (this._dom == null) {
      this._dom = new window.Text(this._model.val("text"));
    }
    if (this._dom._y_xml == null) {
      that = this;
      initialize_proxies.call(this);
      this._dom._y_xml = this;
      this._model.observe(function(events) {
        var event, new_text, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          event = events[_i];
          if (event.name === "text" && (event.type === "add" || event.type === "update")) {
            new_text = that._model.val("text");
            if (that._dom.data !== new_text) {
              _results.push(that._dom.data = new_text);
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
    return this._dom;
  };

  Text.prototype.update = function() {
    var that;
    that = this;
    if (that._model.val("text") !== that._dom.data) {
      that._model.val("text", that._dom.data);
    }
    return void 0;
  };

  return Text;

})(YXml.Node);

YXml.Element = (function(_super) {
  __extends(Element, _super);

  function Element(tag_or_dom, attributes) {
    var a, a_name, c, c_name, tagname, _classes, _i, _len, _ref;
    if (attributes == null) {
      attributes = {};
    }
    Element.__super__.constructor.call(this);
    if (tag_or_dom == null) {

    } else if (tag_or_dom.constructor === String) {
      tagname = tag_or_dom;
      this._xml.children = [];
      this._xml.tagname = tagname;
      if (attributes.constructor !== Object) {
        throw new Error("The attributes must be specified as a Object");
      }
      for (a_name in attributes) {
        a = attributes[a_name];
        if (a.constructor !== String) {
          throw new Error("The attributes must be of type String!");
        }
      }
      this._xml.attributes = attributes;
      this._xml.classes = {};
      _classes = this._xml.attributes["class"];
      delete this._xml.attributes["class"];
      if (_classes != null) {
        _ref = _classes.split(" ");
        for (c = _i = 0, _len = _ref.length; _i < _len; c = ++_i) {
          c_name = _ref[c];
          if (c.length > 0) {
            this._xml.classes[c_name] = c;
          }
        }
      }
      void 0;
    } else if (tag_or_dom instanceof (typeof window !== "undefined" && window !== null ? window.Element : void 0)) {
      this._dom = tag_or_dom;
    }
  }

  Element.prototype._name = "Xml.Element";

  Element.prototype._getModel = function(Y, ops) {
    var attribute, c, child, new_yxml, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    if (this._model == null) {
      if (this._dom != null) {
        this._xml.tagname = this._dom.tagName.toLowerCase();
        this._xml.attributes = {};
        this._xml.classes = {};
        _ref = this._dom.attributes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attribute = _ref[_i];
          if (attribute.name === "class") {
            _ref1 = attribute.value.split(" ");
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              this._xml.classes[c] = true;
            }
          } else {
            this._xml.attributes[attribute.name] = attribute.value;
          }
        }
        this._xml.children = [];
        _ref2 = this._dom.childNodes;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          child = _ref2[_k];
          if (child.nodeType === child.TEXT_NODE) {
            this._xml.children.push(new YXml.Text(child));
          } else if (child.nodeType === child.ELEMENT_NODE) {
            new_yxml = new YXml.Element(child);
            new_yxml._setParent(this);
            this._xml.children.push(new_yxml);
          }
        }
      }
      this._model = new ops.MapManager(this).execute();
      this._model.val("attributes", new Y.Object(this._xml.attributes));
      this._model.val("classes", new Y.Object(this._xml.classes));
      this._model.val("tagname", this._xml.tagname);
      this._model.val("children", new Y.List(this._xml.children));
      if (this._xml.parent != null) {
        this._model.val("parent", this._xml.parent);
      }
      if (this._dom != null) {
        this.getDom();
      }
      Element.__super__._getModel.apply(this, arguments);
    }
    return this._model;
  };

  Element.prototype.toString = function() {
    var child, name, value, xml, _i, _len, _ref, _ref1;
    this._checkForModel();
    xml = "<" + this._model.val("tagname");
    _ref = this.attr();
    for (name in _ref) {
      value = _ref[name];
      xml += " " + name + '="' + value + '"';
    }
    xml += ">";
    _ref1 = this._model.val("children").val();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      xml += child.toString();
    }
    xml += '</' + this._model.val("tagname") + '>';
    return xml;
  };

  Element.prototype.attr = function(name, value) {
    var attrs, c, classes, cs, _i, _len;
    this._checkForModel();
    if (arguments.length > 1) {
      if (value.constructor !== String) {
        throw new Error("The attributes must be of type String!");
      }
      if (name === "class") {
        classes = value.split(" ");
        cs = {};
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
          c = classes[_i];
          cs[c] = true;
        }
        this._model.val("classes", new this._model.custom_types.Object(cs));
      } else {
        this._model.val("attributes").val(name, value);
      }
      return this;
    } else if (arguments.length > 0) {
      if (name === "class") {
        return Object.keys(this._model.val("classes").val()).join(" ");
      } else {
        return this._model.val("attributes").val(name);
      }
    } else {
      attrs = this._model.val("attributes").val();
      classes = Object.keys(this._model.val("classes").val()).join(" ");
      if (classes.length > 0) {
        attrs["class"] = classes;
      }
      return attrs;
    }
  };

  Element.prototype.addClass = function(names) {
    var name, _i, _len, _ref;
    this._checkForModel();
    _ref = names.split(" ");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      this._model.val("classes").val(name, true);
    }
    return this;
  };

  Element.prototype.append = function() {
    var content, _i, _len;
    this._checkForModel();
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      content = arguments[_i];
      if (content.constructor === String) {
        content = new YXml.Text(content);
      }
      if (content instanceof YXml.Node) {
        content._setParent(this);
      } else {
        throw new Error("Y.Xml.after expects instances of YXml.Node (e.g. Element, Text) or String as a parameter");
      }
      this._model.val("children").push(content);
    }
    return this;
  };

  Element.prototype.prepend = function() {
    var content, _i, _len;
    this._checkForModel();
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      content = arguments[_i];
      if (content.constructor === String) {
        content = new YXml.Text(content);
      }
      if (content instanceof YXml.Node) {
        content._setParent(this);
      } else {
        throw new Error("Y.Xml.prepend expects instances of YXml.Node (e.g. Element, Text) or String as a parameter");
      }
      this._model.val("children").insert(0, content);
    }
    return this;
  };

  Element.prototype.empty = function() {
    var child, children, _i, _len, _ref, _results;
    this._checkForModel();
    children = this._model.val("children");
    _ref = children.val();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.constructor === String) {
        _results.push(children["delete"](0));
      } else {
        _results.push(child.remove());
      }
    }
    return _results;
  };

  Element.prototype.hasClass = function(className) {
    this._checkForModel();
    if (this._model.val("classes").val(className) != null) {
      return true;
    } else {
      return false;
    }
  };

  Element.prototype.removeAttr = function(attrName) {
    this._checkForModel();
    if (attrName === "class") {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      this._model.val("attributes")["delete"](attrName);
    }
    return this;
  };

  Element.prototype.removeClass = function() {
    var className, _i, _len;
    this._checkForModel();
    if (arguments.length === 0) {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        className = arguments[_i];
        this._model.val("classes")["delete"](className);
      }
    }
    return this;
  };

  Element.prototype.toggleClass = function() {
    var className, classes, _i, _len;
    this._checkForModel();
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      className = arguments[_i];
      classes = this._model.val("classes");
      if (classes.val(className) != null) {
        classes["delete"](className);
      } else {
        classes.val(className, true);
      }
    }
    return this;
  };

  Element.prototype.getChildren = function() {
    this._checkForModel();
    return this._model.val("children").val();
  };

  Element.prototype.getDom = function() {
    var attr_name, attr_value, child, dom, i, setClasses, svg, that, _i, _len, _ref, _ref1;
    this._checkForModel();
    if (this._dom == null) {
      svg = this._model.val("tagname").search(/^(g|svg|rect|line|path|ellipse|text|tspan|defs|symbol|use|linearGradient|pattern)$/gi);
      if (svg >= 0) {
        this._dom = document.createElementNS("http://www.w3.org/2000/svg", this._model.val("tagname"));
      } else {
        this._dom = document.createElement(this._model.val("tagname"));
      }
      _ref = this.attr();
      for (attr_name in _ref) {
        attr_value = _ref[attr_name];
        this._dom.setAttribute(attr_name, attr_value);
      }
      _ref1 = this.getChildren();
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        child = _ref1[i];
        if (child.constructor === String) {
          dom = document.createTextNode(child);
        } else {
          dom = child.getDom();
        }
        this._dom.insertBefore(dom, null);
      }
    }
    that = this;
    if (this._dom._y_xml == null) {
      this._dom._y_xml = this;
      initialize_proxies.call(this);
      this._model.val("children").observe(function(events) {
        var deleted, event, newNode, rightElement, rightNode, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "insert") {
            newNode = event.value.getDom();
            rightElement = event.reference.getNext();
            if (rightElement.type === "Delimiter") {
              rightNode = null;
            } else {
              rightNode = rightElement.getContent()._dom;
            }
            _results.push(dont_proxy(function() {
              return that._dom.insertBefore(newNode, rightNode);
            }));
          } else if (event.type === "delete") {
            deleted = event.reference.val()._dom;
            if (deleted !== null) {
              _results.push(dont_proxy(function() {
                return that._dom.removeChild(deleted);
              }));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      this._model.val("attributes").observe(function(events) {
        var event, newval, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "add" || event.type === "update") {
            newval = event.object.val(event.name);
            _results.push(dont_proxy(function() {
              return that._dom.setAttribute(event.name, newval);
            }));
          } else if (event.type === "delete") {
            _results.push(dont_proxy(function() {
              return that._dom.removeAttribute(event.name);
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      setClasses = function() {
        return that._model.val("classes").observe(function(events) {
          var event, _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
            event = events[_j];
            if (event.type === "add" || event.type === "update") {
              _results.push(dont_proxy(function() {
                return that._dom.classList.add(event.name);
              }));
            } else if (event.type === "delete") {
              _results.push(dont_proxy(function() {
                return that._dom.classList.remove(event.name);
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
      };
      setClasses();
      this._model.observe(function(events) {
        var event, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "add" || event.type === "update") {
            dont_proxy(function() {
              var classes;
              classes = that.attr("class");
              if ((classes == null) || classes === "") {
                return that._dom.removeAttribute("class");
              } else {
                return that._dom.setAttribute("class", that.attr("class"));
              }
            });
            _results.push(setClasses());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
    return this._dom;
  };

  return Element;

})(YXml.Node);

proxies_are_initialized = false;

proxy_token = false;

dont_proxy = function(f) {
  var e;
  proxy_token = true;
  try {
    f();
  } catch (_error) {
    e = _error;
    proxy_token = false;
    throw new Error(e);
  }
  return proxy_token = false;
};

_proxy = function(f_name, f, source, y) {
  var old_f;
  if (source == null) {
    source = Element.prototype;
  }
  old_f = source[f_name];
  return source[f_name] = function() {
    if ((!((y != null) || (this._y_xml != null))) || proxy_token) {
      return old_f.apply(this, arguments);
    } else if (this._y_xml != null) {
      return f.apply(this._y_xml, arguments);
    } else {
      return f.apply(y, arguments);
    }
  };
};

initialize_proxies = function() {
  var f_add, f_remove, insertBefore, remove, removeChild, replaceChild, that;
  that = this;
  if (this._name === "Xml.Element") {
    f_add = function(c) {
      return that.addClass(c);
    };
    _proxy("add", f_add, this._dom.classList, this);
    f_remove = function(c) {
      return that.removeClass(c);
    };
    _proxy("remove", f_remove, this._dom.classList, this);
    this._dom.__defineSetter__('className', function(val) {
      return that.attr('class', val);
    });
    this._dom.__defineGetter__('className', function() {
      return that.attr('class');
    });
    this._dom.__defineSetter__('textContent', function(val) {
      that.empty();
      if (val !== "") {
        return that.append(val);
      }
    });
    this._dom.__defineGetter__('textContent', function(val) {
      var c, res, _i, _len, _ref;
      res = "";
      _ref = that.getChildren();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c.constructor === String) {
          res += c;
        } else {
          res += c._dom.textContent;
        }
      }
      return res;
    });
  } else if (this._name === "Xml.Text") {
    this._dom.__defineSetter__('textContent', function(val) {
      return that._model.val("text", val);
    });
    this._dom.__defineGetter__('textContent', function(val) {
      return that._model.val("text");
    });
  }
  if (proxies_are_initialized) {
    return;
  }
  proxies_are_initialized = true;
  insertBefore = function(insertedNode_s, adjacentNode) {
    var child, i, n, new_childs, pos, yparent, _i, _len, _ref;
    if (adjacentNode != null) {
      _ref = this.getChildren();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        n = _ref[i];
        if (n.getDom() === adjacentNode) {
          pos = i;
          break;
        }
      }
      if (pos == null) {
        throw new Error("The adjacentNode is not a child element of this node!");
      }
    } else {
      pos = this.getChildren().length;
    }
    new_childs = [];
    if (insertedNode_s.nodeType === insertedNode_s.DOCUMENT_FRAGMENT_NODE) {
      child = insertedNode_s.firstChild;
      while (child != null) {
        new_childs.push(child);
        child = child.nextSibling;
      }
    } else {
      new_childs.push(insertedNode_s);
    }
    yparent = this;
    new_childs = new_childs.map(function(child) {
      var ychild;
      if (child._y_xml != null) {
        return child._y_xml;
      } else {
        if (child.nodeType === child.TEXT_NODE) {
          ychild = new YXml.Text(child);
        } else {
          ychild = new YXml.Element(child);
        }
        ychild._setParent(yparent);
        return ychild;
      }
    });
    return this._model.val("children").insertContents(pos, new_childs);
  };
  _proxy('insertBefore', insertBefore);
  _proxy('appendChild', insertBefore);
  _proxy('removeAttribute', function(name) {
    return this.removeAttr(name);
  });
  _proxy('setAttribute', function(name, value) {
    return this.attr(name, value);
  });
  removeChild = function(node) {
    return node._y_xml.remove();
  };
  _proxy('removeChild', removeChild);
  replaceChild = function(insertedNode, replacedNode) {
    insertBefore.call(this, insertedNode, replacedNode);
    return removeChild.call(this, replacedNode);
  };
  _proxy('replaceChild', replaceChild);
  remove = function() {
    var this_dom;
    if (this._model.val("parent") != null) {
      return this.remove();
    } else {
      this_dom = this._dom;
      return dont_proxy(function() {
        return this_dom.remove();
      });
    }
  };
  return _proxy('remove', remove);
};

if (typeof window !== "undefined" && window !== null) {
  if (window.Y != null) {
    if (window.Y.List != null) {
      window.Y.Xml = YXml;
    } else {
      throw new Error("You must first import Y.List!");
    }
  } else {
    throw new Error("You must first import Y!");
  }
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = YXml;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rtb25hZC9naXQveS14bWwvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZG1vbmFkL2dpdC95LXhtbC9saWIveS14bWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSxrRkFBQTtFQUFBO2lTQUFBOztBQUFBLElBQUEsR0FBTyxFQUFQLENBQUE7O0FBQUEsSUFFVSxDQUFDO0FBQ0ksRUFBQSxjQUFBLEdBQUE7O01BQ1gsSUFBQyxDQUFBLE9BQVE7S0FERTtFQUFBLENBQWI7O0FBQUEsaUJBR0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxJQUFBLElBQU8sbUJBQVA7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLHdCQUFBLEdBQXlCLElBQUMsQ0FBQSxLQUExQixHQUFnQyxzRkFBaEMsR0FBdUgsSUFBQyxDQUFBLEtBQXhILEdBQThILEtBQTlILEdBQW9JLElBQUMsQ0FBQSxLQUFySSxHQUEySSxHQUFqSixDQUFWLENBREY7S0FEYztFQUFBLENBSGhCLENBQUE7O0FBQUEsaUJBT0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULElBQUEsSUFBRyx3QkFBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksUUFBWixFQUFzQixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTVCLENBQUEsQ0FERjtLQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBRkEsQ0FBQTtBQUdBLElBQUEsSUFBRyxpQkFBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBREY7S0FIQTtXQUtBLElBQUMsQ0FBQSxPQU5RO0VBQUEsQ0FQWCxDQUFBOztBQUFBLGlCQWVBLFNBQUEsR0FBVyxTQUFFLE1BQUYsR0FBQTtBQUNULElB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SUFBRyxnREFBSDtBQUNFLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBakIsQ0FERjtDQXRtQkEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5ZWG1sID0ge31cblxuY2xhc3MgWVhtbC5Ob2RlXG4gIGNvbnN0cnVjdG9yOiAoKS0+XG4gICAgQF94bWwgPz0ge31cblxuICBfY2hlY2tGb3JNb2RlbDogKCktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IGhhdmUgdG8gcHV0IHRoZSBZLlwiK0BfbmFtZSsnIGluc3RhbmNlIG9uIGEgc2hhcmVkIGVsZW1lbnQgYmVmb3JlIHlvdSBjYW4gdXNlIGl0ISBFLmcuIG9uIHRoZSB5IG9iamVjdCB5LnZhbChcIm15LScrQF9uYW1lKydcIix5JytAX25hbWUrJyknXG5cbiAgX2dldE1vZGVsOiAoKS0+XG4gICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIiwgQF94bWwucGFyZW50KVxuICAgIEBfc2V0TW9kZWwgQF9tb2RlbFxuICAgIGlmIEBfZG9tP1xuICAgICAgQGdldERvbSgpXG4gICAgQF9tb2RlbFxuXG4gIF9zZXRNb2RlbDogKEBfbW9kZWwpLT5cbiAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICBpZiBldmVudC5uYW1lIGlzIFwicGFyZW50XCIgYW5kIGV2ZW50LnR5cGUgaXNudCBcImFkZFwiXG4gICAgICAgICAgcGFyZW50ID0gZXZlbnQub2xkVmFsdWVcbiAgICAgICAgICBjaGlsZHJlbiA9IHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIik/LnZhbCgpXG4gICAgICAgICAgaWYgY2hpbGRyZW4/IGFuZCBldmVudC5vbGRWYWx1ZSBpc250IGV2ZW50Lm9iamVjdC5fbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgICAgICAgICBmb3IgYyxpIGluIGNoaWxkcmVuXG4gICAgICAgICAgICAgIGlmIGMgaXMgQFxuICAgICAgICAgICAgICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuZGVsZXRlIGlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgIGRlbGV0ZSBAX3htbFxuXG4gIF9zZXRQYXJlbnQ6IChwYXJlbnQpLT5cbiAgICBpZiBwYXJlbnQgaW5zdGFuY2VvZiBZWG1sLkVsZW1lbnRcbiAgICAgIGlmIEBfbW9kZWw/XG4gICAgICAgIEByZW1vdmUoKVxuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBwYXJlbnQpXG4gICAgICBlbHNlXG4gICAgICAgIEBfeG1sLnBhcmVudCA9IHBhcmVudFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcInBhcmVudCBtdXN0IGJlIG9mIHR5cGUgWS5YbWwhXCJcblxuI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgYWZ0ZXIgdGhpcyBlbGVtZW50XG4gICMgLmFmdGVyKGNvbnRlbnQgWywgY29udGVudF0pXG4gICNcbiAgYWZ0ZXI6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHBhcmVudCA9IEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgaWYgbm90IHBhcmVudD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgWG1sIEVsZW1lbnQgbXVzdCBub3QgaGF2ZSBzaWJsaW5ncyEgKGZvciBpdCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50KVwiXG5cbiAgICAjIGZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgZWxlbWVudFxuICAgIGZvciBjLHBvc2l0aW9uIGluIHBhcmVudC5nZXRDaGlsZHJlbigpXG4gICAgICBpZiBjIGlzIEBcbiAgICAgICAgYnJlYWtcblxuICAgIGNvbnRlbnRzID0gW11cbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sLkVsZW1lbnRcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEBfbW9kZWwudmFsKFwicGFyZW50XCIpKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwuRWxlbWVudCBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgY29udGVudHMucHVzaCBjb250ZW50XG5cbiAgICBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzKHBvc2l0aW9uKzEsIGNvbnRlbnRzKVxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIGFmdGVyIHRoaXMgZWxlbWVudFxuICAjIC5hZnRlcihjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGJlZm9yZTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBub3QgcGFyZW50P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBYbWwgRWxlbWVudCBtdXN0IG5vdCBoYXZlIHNpYmxpbmdzISAoZm9yIGl0IGRvZXMgbm90IGhhdmUgYSBwYXJlbnQpXCJcblxuICAgICMgZmluZCB0aGUgcG9zaXRpb24gb2YgdGhpcyBlbGVtZW50XG4gICAgZm9yIGMscG9zaXRpb24gaW4gcGFyZW50LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMgaXMgQFxuICAgICAgICBicmVha1xuXG4gICAgY29udGVudHMgPSBbXVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWwuRWxlbWVudFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQF9tb2RlbC52YWwoXCJwYXJlbnRcIikpXG4gICAgICBlbHNlIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5FbGVtZW50IG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBjb250ZW50cy5wdXNoIGNvbnRlbnRcblxuICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMocG9zaXRpb24sIGNvbnRlbnRzKVxuXG5cbiAgI1xuICAjIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSB0aGUgRE9NXG4gICMgLnJlbW92ZSgpXG4gICNcbiAgcmVtb3ZlOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcInBhcmVudFwiKT9cbiAgICAgIHBhcmVudCA9IEBfbW9kZWwuZGVsZXRlKFwicGFyZW50XCIpXG4gICAgQFxuXG4gICNcbiAgIyBHZXQgdGhlIHBhcmVudCBvZiB0aGlzIEVsZW1lbnRcbiAgIyBATm90ZTogRXZlcnkgWE1MIGVsZW1lbnQgY2FuIG9ubHkgaGF2ZSBvbmUgcGFyZW50XG4gICMgLmdldFBhcmVudCgpXG4gICNcbiAgZ2V0UGFyZW50OiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuXG4gIGdldFBvc2l0aW9uOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIHBhcmVudD9cbiAgICAgIGZvciBjLGkgaW4gcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgICBpZiBjIGlzIEBcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBpcyBub3QgYSBjaGlsZCBvZiBpdHMgcGFyZW50IChzaG91bGQgbm90IGhhcHBlbiBpbiBZLlhtbCEpXCJcbiAgICBlbHNlXG4gICAgICBudWxsXG5cbmNsYXNzIFlYbWwuVGV4dCBleHRlbmRzIFlYbWwuTm9kZVxuICBjb25zdHJ1Y3RvcjogKHRleHQgPSBcIlwiKS0+XG4gICAgc3VwZXIoKVxuICAgIGlmIHRleHQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICBAX3htbC50ZXh0ID0gdGV4dFxuICAgIGVsc2UgaWYgdGV4dCBpbnN0YW5jZW9mIHdpbmRvdy5UZXh0XG4gICAgICBAX2RvbSA9IHRleHRcbiAgICBlbHNlIGlmIHRleHQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgY29uc3RydWN0b3Igb2YgWS5YbWwuVGV4dCBleHBlY3RzIGVpdGhlciBTdHJpbmcgb3IgYW4gRG9tIFRleHQgZWxlbWVudCFcIlxuXG4gIF9nZXRNb2RlbDogKFksIG9wcyktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgaWYgQF9kb20/XG4gICAgICAgIEBfeG1sLnRleHQgPSBAX2RvbS50ZXh0Q29udGVudFxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwidGV4dFwiLCBAX3htbC50ZXh0KVxuICAgICAgc3VwZXJcbiAgICBAX21vZGVsXG5cbiAgX25hbWU6IFwiWG1sLlRleHRcIlxuXG4gIHRvU3RyaW5nOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcInRleHRcIilcblxuICBnZXREb206ICgpLT5cbiAgICBpZiBub3QgQF9kb20/XG4gICAgICBAX2RvbSA9IG5ldyB3aW5kb3cuVGV4dChAX21vZGVsLnZhbChcInRleHRcIikpXG4gICAgaWYgbm90IEBfZG9tLl95X3htbD9cbiAgICAgIHRoYXQgPSBAXG4gICAgICBpbml0aWFsaXplX3Byb3hpZXMuY2FsbCBAXG4gICAgICBAX2RvbS5feV94bWwgPSBAXG4gICAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQubmFtZSBpcyBcInRleHRcIiBhbmQgKGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCIpXG4gICAgICAgICAgICBuZXdfdGV4dCA9IHRoYXQuX21vZGVsLnZhbChcInRleHRcIilcbiAgICAgICAgICAgIGlmIHRoYXQuX2RvbS5kYXRhIGlzbnQgbmV3X3RleHRcbiAgICAgICAgICAgICAgdGhhdC5fZG9tLmRhdGEgPSBuZXdfdGV4dFxuICAgIEBfZG9tXG5cbiAgdXBkYXRlOiAoKS0+XG4gICAgdGhhdCA9IEBcbiAgICBpZiB0aGF0Ll9tb2RlbC52YWwoXCJ0ZXh0XCIpIGlzbnQgdGhhdC5fZG9tLmRhdGFcbiAgICAgIHRoYXQuX21vZGVsLnZhbChcInRleHRcIiwgdGhhdC5fZG9tLmRhdGEpXG4gICAgdW5kZWZpbmVkXG5cbmNsYXNzIFlYbWwuRWxlbWVudCBleHRlbmRzIFlYbWwuTm9kZVxuXG4gIGNvbnN0cnVjdG9yOiAodGFnX29yX2RvbSwgYXR0cmlidXRlcyA9IHt9KS0+XG4gICAgc3VwZXIoKVxuICAgIGlmIG5vdCB0YWdfb3JfZG9tP1xuICAgICAgIyBub3BcbiAgICBlbHNlIGlmIHRhZ19vcl9kb20uY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICB0YWduYW1lID0gdGFnX29yX2RvbVxuICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgI1RPRE86IEhvdyB0byBmb3JjZSB0aGUgdXNlciB0byBzcGVjaWZ5IHBhcmFtZXRlcnM/XG4gICAgICAjaWYgbm90IHRhZ25hbWU/XG4gICAgICAjICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBzcGVjaWZ5IGEgdGFnbmFtZVwiXG4gICAgICBAX3htbC50YWduYW1lID0gdGFnbmFtZVxuICAgICAgaWYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciBpc250IE9iamVjdFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIHNwZWNpZmllZCBhcyBhIE9iamVjdFwiXG4gICAgICBmb3IgYV9uYW1lLCBhIG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgaWYgYS5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgb2YgdHlwZSBTdHJpbmchXCJcbiAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzXG4gICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgIF9jbGFzc2VzID0gQF94bWwuYXR0cmlidXRlcy5jbGFzc1xuICAgICAgZGVsZXRlIEBfeG1sLmF0dHJpYnV0ZXMuY2xhc3NcbiAgICAgIGlmIF9jbGFzc2VzP1xuICAgICAgICBmb3IgY19uYW1lLCBjIGluIF9jbGFzc2VzLnNwbGl0KFwiIFwiKVxuICAgICAgICAgIGlmIGMubGVuZ3RoID4gMFxuICAgICAgICAgICAgQF94bWwuY2xhc3Nlc1tjX25hbWVdID0gY1xuICAgICAgdW5kZWZpbmVkXG4gICAgZWxzZSBpZiB0YWdfb3JfZG9tIGluc3RhbmNlb2Ygd2luZG93Py5FbGVtZW50XG4gICAgICBAX2RvbSA9IHRhZ19vcl9kb21cblxuXG4gIF9uYW1lOiBcIlhtbC5FbGVtZW50XCJcblxuICBfZ2V0TW9kZWw6IChZLCBvcHMpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAX3htbC50YWduYW1lID0gQF9kb20udGFnTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSB7fVxuICAgICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgICAgZm9yIGF0dHJpYnV0ZSBpbiBAX2RvbS5hdHRyaWJ1dGVzXG4gICAgICAgICAgaWYgYXR0cmlidXRlLm5hbWUgaXMgXCJjbGFzc1wiXG4gICAgICAgICAgICBmb3IgYyBpbiBhdHRyaWJ1dGUudmFsdWUuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgICAgIEBfeG1sLmNsYXNzZXNbY10gPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQF94bWwuYXR0cmlidXRlc1thdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUudmFsdWVcbiAgICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgICBmb3IgY2hpbGQgaW4gQF9kb20uY2hpbGROb2Rlc1xuICAgICAgICAgIGlmIGNoaWxkLm5vZGVUeXBlIGlzIGNoaWxkLlRFWFRfTk9ERVxuICAgICAgICAgICAgQF94bWwuY2hpbGRyZW4ucHVzaCBuZXcgWVhtbC5UZXh0KGNoaWxkKVxuICAgICAgICAgIGVsc2UgaWYgY2hpbGQubm9kZVR5cGUgaXMgY2hpbGQuRUxFTUVOVF9OT0RFXG4gICAgICAgICAgICBuZXdfeXhtbCA9IG5ldyBZWG1sLkVsZW1lbnQoY2hpbGQpXG4gICAgICAgICAgICBuZXdfeXhtbC5fc2V0UGFyZW50IEBcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2gobmV3X3l4bWwpXG4gICAgICAgICAgIyBlbHNlIG5vcFxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiLCBuZXcgWS5PYmplY3QoQF94bWwuYXR0cmlidXRlcykpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IFkuT2JqZWN0KEBfeG1sLmNsYXNzZXMpKVxuICAgICAgQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIsIEBfeG1sLnRhZ25hbWUpXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIsIG5ldyBZLkxpc3QoQF94bWwuY2hpbGRyZW4pKVxuICAgICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBAX3htbC5wYXJlbnQpXG5cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAZ2V0RG9tKCkgIyB0d28gd2F5IGJpbmQgZG9tIHRvIHRoaXMgeG1sIHR5cGVcblxuICAgICAgc3VwZXJcblxuICAgIEBfbW9kZWxcblxuICB0b1N0cmluZzogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgeG1sID0gXCI8XCIrQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpXG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIEBhdHRyKClcbiAgICAgIHhtbCArPSBcIiBcIituYW1lKyc9XCInK3ZhbHVlKydcIidcbiAgICB4bWwgKz0gXCI+XCJcbiAgICBmb3IgY2hpbGQgaW4gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgeG1sICs9IGNoaWxkLnRvU3RyaW5nKClcbiAgICB4bWwgKz0gJzwvJytAX21vZGVsLnZhbChcInRhZ25hbWVcIikrJz4nXG4gICAgeG1sXG5cbiAgI1xuICAjIEdldC9zZXQgdGhlIGF0dHJpYnV0ZShzKSBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLmF0dHIoKVxuICAjIC5hdHRyKG5hbWUpXG4gICMgLmF0dHIobmFtZSwgdmFsdWUpXG4gICNcbiAgYXR0cjogKG5hbWUsIHZhbHVlKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgaWYgdmFsdWUuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBvZiB0eXBlIFN0cmluZyFcIlxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgY2xhc3NlcyA9IHZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICBjcyA9IHt9XG4gICAgICAgIGZvciBjIGluIGNsYXNzZXNcbiAgICAgICAgICBjc1tjXSA9IHRydWVcblxuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IEBfbW9kZWwuY3VzdG9tX3R5cGVzLk9iamVjdChjcykpXG4gICAgICBlbHNlXG4gICAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwobmFtZSwgdmFsdWUpXG4gICAgICBAXG4gICAgZWxzZSBpZiBhcmd1bWVudHMubGVuZ3RoID4gMFxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgT2JqZWN0LmtleXMoQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbCgpKS5qb2luKFwiIFwiKVxuICAgICAgZWxzZVxuICAgICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKG5hbWUpXG4gICAgZWxzZVxuICAgICAgYXR0cnMgPSBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKClcbiAgICAgIGNsYXNzZXMgPSBPYmplY3Qua2V5cyhAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKCkpLmpvaW4oXCIgXCIpXG4gICAgICBpZiBjbGFzc2VzLmxlbmd0aCA+IDBcbiAgICAgICAgYXR0cnNbXCJjbGFzc1wiXSA9IGNsYXNzZXNcbiAgICAgIGF0dHJzXG5cbiAgI1xuICAjIEFkZHMgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgdG8gdGhpcyBlbGVtZW50XG4gICNcbiAgYWRkQ2xhc3M6IChuYW1lcyktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIG5hbWUgaW4gbmFtZXMuc3BsaXQoXCIgXCIpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKG5hbWUsIHRydWUpXG4gICAgQFxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIHRvIHRoZSBlbmQgb2YgdGhpcyBlbGVtZW50XG4gICMgLmFwcGVuZChjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFwcGVuZDogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICBjb250ZW50ID0gbmV3IFlYbWwuVGV4dChjb250ZW50KVxuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWwuTm9kZVxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQClcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5Ob2RlIChlLmcuIEVsZW1lbnQsIFRleHQpIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnB1c2goY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLnByZXBlbmQoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBwcmVwZW5kOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNvbnRlbnQgPSBuZXcgWVhtbC5UZXh0KGNvbnRlbnQpXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbC5Ob2RlXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5wcmVwZW5kIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwuTm9kZSAoZS5nLiBFbGVtZW50LCBUZXh0KSBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnQoMCwgY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhbGwgY2hpbGQgbm9kZXMgb2YgdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzIGZyb20gdGhlIERPTS5cbiAgIyAuZW1wdHkoKVxuICAjXG4gIGVtcHR5OiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICAjIFRPRE86IGRvIGl0IGxpa2UgdGhpcyA6IEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIiwgbmV3IFkuTGlzdCgpKVxuICAgIGNoaWxkcmVuID0gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKVxuICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlbi52YWwoKVxuICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNoaWxkcmVuLmRlbGV0ZSgwKVxuICAgICAgZWxzZVxuICAgICAgICBjaGlsZC5yZW1vdmUoKVxuXG4gICNcbiAgIyBEZXRlcm1pbmUgd2hldGhlciBhbnkgb2YgdGhlIG1hdGNoZWQgZWxlbWVudHMgYXJlIGFzc2lnbmVkIHRoZSBnaXZlbiBjbGFzcy5cbiAgIyAuaGFzQ2xhc3MoY2xhc3NOYW1lKVxuICAjXG4gIGhhc0NsYXNzOiAoY2xhc3NOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKGNsYXNzTmFtZSk/XG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuXG4gICNcbiAgIyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhpcyBlbGVtZW50XG4gICMgLnJlbW92ZUF0dHIoYXR0ck5hbWUpXG4gICNcbiAgcmVtb3ZlQXR0cjogKGF0dHJOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhdHRyTmFtZSBpcyBcImNsYXNzXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgQF9tb2RlbC5jdXN0b21fdHlwZXMuT2JqZWN0KCkpXG4gICAgZWxzZVxuICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLmRlbGV0ZShhdHRyTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhIHNpbmdsZSBjbGFzcywgbXVsdGlwbGUgY2xhc3Nlcywgb3IgYWxsIGNsYXNzZXMgZnJvbSB0aGlzIGVsZW1lbnRcbiAgIyAucmVtb3ZlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgcmVtb3ZlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggaXMgMFxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBmb3IgY2xhc3NOYW1lIGluIGFyZ3VtZW50c1xuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIEFkZCBvciByZW1vdmUgb25lIG9yIG1vcmUgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudCxcbiAgIyBkZXBlbmRpbmcgb24gZWl0aGVyIHRoZSBjbGFzc+KAmXMgcHJlc2VuY2Ugb3IgdGhlIHZhbHVlIG9mIHRoZSBzdGF0ZSBhcmd1bWVudC5cbiAgIyAudG9nZ2xlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgdG9nZ2xlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBjbGFzc05hbWUgaW4gYXJndW1lbnRzXG4gICAgICBjbGFzc2VzID0gQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpXG4gICAgICBpZiBjbGFzc2VzLnZhbChjbGFzc05hbWUpP1xuICAgICAgICBjbGFzc2VzLmRlbGV0ZShjbGFzc05hbWUpXG4gICAgICBlbHNlXG4gICAgICAgIGNsYXNzZXMudmFsKGNsYXNzTmFtZSwgdHJ1ZSlcbiAgICBAXG5cbiAgI1xuICAjIEdldCBhbGwgdGhlIGNoaWxkcmVuIG9mIHRoaXMgWE1MIEVsZW1lbnQgYXMgYW4gQXJyYXlcbiAgIyBATm90ZTogVGhlIGNoaWxkcmVuIGFyZSBlaXRoZXIgb2YgdHlwZSBZLlhtbCBvciBTdHJpbmdcbiAgIyAuZ2V0Q2hpbGRyZW4oKVxuICAjXG4gIGdldENoaWxkcmVuOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG5cblxuICBnZXREb206ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIG5vdCBAX2RvbT9cbiAgICAgIHN2ZyA9IHRoaXMuX21vZGVsXG4gICAgICAgIC52YWwoXCJ0YWduYW1lXCIpXG4gICAgICAgIC5zZWFyY2goL14oZ3xzdmd8cmVjdHxsaW5lfHBhdGh8ZWxsaXBzZXx0ZXh0fHRzcGFufGRlZnN8c3ltYm9sfHVzZXxsaW5lYXJHcmFkaWVudHxwYXR0ZXJuKSQvZ2kpXG4gICAgICBpZiBzdmcgPj0gMFxuICAgICAgICBAX2RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHRoaXMuX21vZGVsLnZhbChcInRhZ25hbWVcIikpXG4gICAgICBlbHNlXG4gICAgICAgIEBfZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAX21vZGVsLnZhbChcInRhZ25hbWVcIikpXG4gICAgICAjIHNldCB0aGUgYXR0cmlidXRlcyBfYW5kXyB0aGUgY2xhc3NlcyAoQHNlZSAuYXR0cigpKVxuICAgICAgZm9yIGF0dHJfbmFtZSwgYXR0cl92YWx1ZSBvZiBAYXR0cigpXG4gICAgICAgIEBfZG9tLnNldEF0dHJpYnV0ZSBhdHRyX25hbWUsIGF0dHJfdmFsdWVcbiAgICAgIGZvciBjaGlsZCxpIGluIEBnZXRDaGlsZHJlbigpXG4gICAgICAgIGlmIGNoaWxkLmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlIGNoaWxkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkb20gPSBjaGlsZC5nZXREb20oKVxuICAgICAgICBAX2RvbS5pbnNlcnRCZWZvcmUgZG9tLCBudWxsXG5cbiAgICB0aGF0ID0gQFxuXG4gICAgaWYgKG5vdCBAX2RvbS5feV94bWw/KVxuICAgICAgQF9kb20uX3lfeG1sID0gQFxuICAgICAgaW5pdGlhbGl6ZV9wcm94aWVzLmNhbGwgQFxuXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImluc2VydFwiXG4gICAgICAgICAgICBuZXdOb2RlID0gZXZlbnQudmFsdWUuZ2V0RG9tKClcbiAgICAgICAgICAgIHJpZ2h0RWxlbWVudCA9IGV2ZW50LnJlZmVyZW5jZS5nZXROZXh0KClcbiAgICAgICAgICAgIGlmIHJpZ2h0RWxlbWVudC50eXBlIGlzIFwiRGVsaW1pdGVyXCJcbiAgICAgICAgICAgICAgcmlnaHROb2RlID0gbnVsbFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByaWdodE5vZGUgPSByaWdodEVsZW1lbnQuZ2V0Q29udGVudCgpLl9kb21cbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICB0aGF0Ll9kb20uaW5zZXJ0QmVmb3JlIG5ld05vZGUsIHJpZ2h0Tm9kZVxuICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICBkZWxldGVkID0gZXZlbnQucmVmZXJlbmNlLnZhbCgpLl9kb21cbiAgICAgICAgICAgIGlmIChkZWxldGVkICE9IG51bGwpXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVDaGlsZCBkZWxldGVkXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICBuZXd2YWwgPSBldmVudC5vYmplY3QudmFsKGV2ZW50Lm5hbWUpXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnNldEF0dHJpYnV0ZSBldmVudC5uYW1lLCBuZXd2YWxcbiAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVBdHRyaWJ1dGUgZXZlbnQubmFtZVxuICAgICAgc2V0Q2xhc3NlcyA9ICgpLT5cbiAgICAgICAgdGhhdC5fbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QuYWRkIGV2ZW50Lm5hbWUgIyBjbGFzc2VzIGFyZSBzdG9yZWQgYXMgdGhlIGtleXNcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QucmVtb3ZlIGV2ZW50Lm5hbWVcbiAgICAgIHNldENsYXNzZXMoKVxuICAgICAgQF9tb2RlbC5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICBjbGFzc2VzID0gdGhhdC5hdHRyKFwiY2xhc3NcIilcbiAgICAgICAgICAgICAgaWYgKG5vdCBjbGFzc2VzPykgb3IgY2xhc3NlcyBpcyBcIlwiXG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUF0dHJpYnV0ZSBcImNsYXNzXCJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5zZXRBdHRyaWJ1dGUgXCJjbGFzc1wiLCB0aGF0LmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgc2V0Q2xhc3NlcygpXG5cbiAgICBAX2RvbVxuXG5wcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IGZhbHNlXG4jIHNvbWUgZG9tIGltcGxlbWVudGF0aW9ucyBtYXkgY2FsbCBhbm90aGVyIGRvbS5tZXRob2QgdGhhdCBzaW11bGF0ZXMgdGhlIGJlaGF2aW9yIG9mIGFub3RoZXIuXG4jIEZvciBleGFtcGxlIHhtbC5pbnNlcnRDaGlsZChkb20pICwgd2ljaCBpbnNlcnRzIGFuIGVsZW1lbnQgYXQgdGhlIGVuZCwgYW5kIHhtbC5pbnNlcnRBZnRlcihkb20sbnVsbCkgd2ljaCBkb2VzIHRoZSBzYW1lXG4jIEJ1dCBZJ3MgcHJveHkgbWF5IGJlIGNhbGxlZCBvbmx5IG9uY2UhXG5wcm94eV90b2tlbiA9IGZhbHNlXG5kb250X3Byb3h5ID0gKGYpLT5cbiAgcHJveHlfdG9rZW4gPSB0cnVlXG4gIHRyeVxuICAgIGYoKVxuICBjYXRjaCBlXG4gICAgcHJveHlfdG9rZW4gPSBmYWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBlXG4gIHByb3h5X3Rva2VuID0gZmFsc2VcblxuX3Byb3h5ID0gKGZfbmFtZSwgZiwgc291cmNlID0gRWxlbWVudC5wcm90b3R5cGUsIHkpLT5cbiAgb2xkX2YgPSBzb3VyY2VbZl9uYW1lXVxuICBzb3VyY2VbZl9uYW1lXSA9ICgpLT5cbiAgICBpZiAobm90ICh5PyBvciBAX3lfeG1sPykpIG9yIHByb3h5X3Rva2VuXG4gICAgICBvbGRfZi5hcHBseSB0aGlzLCBhcmd1bWVudHNcbiAgICBlbHNlIGlmIEBfeV94bWw/XG4gICAgICBmLmFwcGx5IEBfeV94bWwsIGFyZ3VtZW50c1xuICAgIGVsc2VcbiAgICAgIGYuYXBwbHkgeSwgYXJndW1lbnRzXG5cbmluaXRpYWxpemVfcHJveGllcyA9ICgpLT5cblxuICB0aGF0ID0gQFxuXG4gIGlmIEBfbmFtZSBpcyBcIlhtbC5FbGVtZW50XCJcbiAgICBmX2FkZCA9IChjKS0+XG4gICAgICB0aGF0LmFkZENsYXNzIGNcbiAgICBfcHJveHkgXCJhZGRcIiwgZl9hZGQsIEBfZG9tLmNsYXNzTGlzdCwgQFxuXG4gICAgZl9yZW1vdmUgPSAoYyktPlxuICAgICAgdGhhdC5yZW1vdmVDbGFzcyBjXG5cbiAgICBfcHJveHkgXCJyZW1vdmVcIiwgZl9yZW1vdmUsIEBfZG9tLmNsYXNzTGlzdCwgQFxuXG4gICAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAnY2xhc3NOYW1lJywgKHZhbCktPlxuICAgICAgdGhhdC5hdHRyKCdjbGFzcycsIHZhbClcbiAgICBAX2RvbS5fX2RlZmluZUdldHRlcl9fICdjbGFzc05hbWUnLCAoKS0+XG4gICAgICB0aGF0LmF0dHIoJ2NsYXNzJylcbiAgICBAX2RvbS5fX2RlZmluZVNldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAgICMgcmVtb3ZlIGFsbCBub2Rlc1xuICAgICAgdGhhdC5lbXB0eSgpXG5cbiAgICAgICMgaW5zZXJ0IHdvcmQgY29udGVudFxuICAgICAgaWYgdmFsIGlzbnQgXCJcIlxuICAgICAgICB0aGF0LmFwcGVuZCB2YWxcblxuICAgIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgICAgcmVzID0gXCJcIlxuICAgICAgZm9yIGMgaW4gdGhhdC5nZXRDaGlsZHJlbigpXG4gICAgICAgIGlmIGMuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgICAgcmVzICs9IGNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlcyArPSBjLl9kb20udGV4dENvbnRlbnRcbiAgICAgIHJlc1xuXG4gIGVsc2UgaWYgQF9uYW1lIGlzIFwiWG1sLlRleHRcIlxuICAgIEBfZG9tLl9fZGVmaW5lU2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgICAgdGhhdC5fbW9kZWwudmFsKFwidGV4dFwiLCB2YWwpXG5cbiAgICBAX2RvbS5fX2RlZmluZUdldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAgIHRoYXQuX21vZGVsLnZhbChcInRleHRcIilcblxuICBpZiBwcm94aWVzX2FyZV9pbml0aWFsaXplZFxuICAgIHJldHVyblxuICBwcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IHRydWVcblxuICAjIHRoZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgaW5pdGlhbGl6ZWQgb24gcHJvdG90eXBlcyBhbmQgdGhlcmVmb3JlIHRoZXkgbmVlZCB0byBiZSB3cml0dGVuIG9ubHkgb25jZSFcblxuICBpbnNlcnRCZWZvcmUgPSAoaW5zZXJ0ZWROb2RlX3MsIGFkamFjZW50Tm9kZSktPlxuICAgIGlmIGFkamFjZW50Tm9kZT9cbiAgICAgIGZvciBuLGkgaW4gQGdldENoaWxkcmVuKClcbiAgICAgICAgaWYgbi5nZXREb20oKSBpcyBhZGphY2VudE5vZGVcbiAgICAgICAgICBwb3MgPSBpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIG5vdCBwb3M/XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhZGphY2VudE5vZGUgaXMgbm90IGEgY2hpbGQgZWxlbWVudCBvZiB0aGlzIG5vZGUhXCJcbiAgICBlbHNlXG4gICAgICBwb3MgPSBAZ2V0Q2hpbGRyZW4oKS5sZW5ndGhcblxuICAgIG5ld19jaGlsZHMgPSBbXVxuICAgIGlmIGluc2VydGVkTm9kZV9zLm5vZGVUeXBlIGlzIGluc2VydGVkTm9kZV9zLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREVcbiAgICAgIGNoaWxkID0gaW5zZXJ0ZWROb2RlX3MuZmlyc3RDaGlsZFxuICAgICAgd2hpbGUgY2hpbGQ/XG4gICAgICAgIG5ld19jaGlsZHMucHVzaCBjaGlsZFxuICAgICAgICBjaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nXG4gICAgZWxzZVxuICAgICAgbmV3X2NoaWxkcy5wdXNoIGluc2VydGVkTm9kZV9zXG5cbiAgICB5cGFyZW50ID0gdGhpc1xuICAgIG5ld19jaGlsZHMgPSBuZXdfY2hpbGRzLm1hcCAoY2hpbGQpLT5cbiAgICAgIGlmIGNoaWxkLl95X3htbD9cbiAgICAgICAgY2hpbGQuX3lfeG1sXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGNoaWxkLm5vZGVUeXBlID09IGNoaWxkLlRFWFRfTk9ERVxuICAgICAgICAgIHljaGlsZCA9IG5ldyBZWG1sLlRleHQoY2hpbGQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB5Y2hpbGQgPSBuZXcgWVhtbC5FbGVtZW50KGNoaWxkKVxuICAgICAgICB5Y2hpbGQuX3NldFBhcmVudCB5cGFyZW50XG4gICAgICAgIHljaGlsZFxuICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMgcG9zLCBuZXdfY2hpbGRzXG5cbiAgX3Byb3h5ICdpbnNlcnRCZWZvcmUnLCBpbnNlcnRCZWZvcmVcbiAgX3Byb3h5ICdhcHBlbmRDaGlsZCcsIGluc2VydEJlZm9yZVxuICBfcHJveHkgJ3JlbW92ZUF0dHJpYnV0ZScsIChuYW1lKS0+XG4gICAgQHJlbW92ZUF0dHIgbmFtZVxuICBfcHJveHkgJ3NldEF0dHJpYnV0ZScsIChuYW1lLCB2YWx1ZSktPlxuICAgIEBhdHRyIG5hbWUsIHZhbHVlXG5cbiAgcmVtb3ZlQ2hpbGQgPSAobm9kZSktPlxuICAgIG5vZGUuX3lfeG1sLnJlbW92ZSgpXG5cbiAgX3Byb3h5ICdyZW1vdmVDaGlsZCcsIHJlbW92ZUNoaWxkXG5cbiAgcmVwbGFjZUNoaWxkID0gKGluc2VydGVkTm9kZSwgcmVwbGFjZWROb2RlKS0+ICMgVE9ETzogaGFuZGxlIHJlcGxhY2Ugd2l0aCByZXBsYWNlIGJlaGF2aW9yLi4uXG4gICAgaW5zZXJ0QmVmb3JlLmNhbGwgdGhpcywgaW5zZXJ0ZWROb2RlLCByZXBsYWNlZE5vZGVcbiAgICByZW1vdmVDaGlsZC5jYWxsIHRoaXMsIHJlcGxhY2VkTm9kZVxuXG4gIF9wcm94eSAncmVwbGFjZUNoaWxkJywgcmVwbGFjZUNoaWxkXG5cbiAgcmVtb3ZlID0gKCktPlxuICAgIGlmIEBfbW9kZWwudmFsKFwicGFyZW50XCIpP1xuICAgICAgQHJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgdGhpc19kb20gPSB0aGlzLl9kb21cbiAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICB0aGlzX2RvbS5yZW1vdmUoKVxuXG4gIF9wcm94eSAncmVtb3ZlJywgcmVtb3ZlXG5cbmlmIHdpbmRvdz9cbiAgaWYgd2luZG93Llk/XG4gICAgaWYgd2luZG93LlkuTGlzdD9cbiAgICAgIHdpbmRvdy5ZLlhtbCA9IFlYbWxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWS5MaXN0IVwiXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWVhtbFxuIl19
