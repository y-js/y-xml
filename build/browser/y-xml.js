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
      this._setModel(this._model);
    }
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
          if (children != null) {
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
      svg = this._model.val("tagname").match(/g|svg|rect|line|path|ellipse|text|tspan|defs|symbol|use|linearGradient|pattern/g);
      if (svg != null) {
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
            deleted = that._model.val("children").val(event.position)._dom;
            _results.push(dont_proxy(function() {
              return that._dom.removeChild(deleted);
            }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rtb25hZC9naXQveS14bWwvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZG1vbmFkL2dpdC95LXhtbC9saWIveS14bWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSxrRkFBQTtFQUFBO2lTQUFBOztBQUFBLElBQUEsR0FBTyxFQUFQLENBQUE7O0FBQUEsSUFFVSxDQUFDO0FBQ0ksRUFBQSxjQUFBLEdBQUE7O01BQ1gsSUFBQyxDQUFBLE9BQVE7S0FERTtFQUFBLENBQWI7O0FBQUEsaUJBR0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxJQUFBLElBQU8sbUJBQVA7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLHdCQUFBLEdBQXlCLElBQUMsQ0FBQSxLQUExQixHQUFnQyxzRkFBaEMsR0FBdUgsSUFBQyxDQUFBLEtBQXhILEdBQThILEtBQTlILEdBQW9JLElBQUMsQ0FBQSxLQUFySSxHQUEySSxHQUFqSixDQUFWLENBREY7S0FEYztFQUFBLENBSGhCLENBQUE7O0FBQUEsaUJBT0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULElBQUEsSUFBRyx3QkFBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksUUFBWixFQUFzQixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTVCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsTUFBWixDQURBLENBREY7S0FBQTtBQUdBLElBQUEsSUFBRyxpQkFBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBREY7S0FIQTtXQUtBLElBQUMsQ0FBQSxPQU5RO0VBQUEsQ0FQWCxDQUFBOztBQUFBLGlCQWVBLFNBQUEsR0FBVyxTQUFFLE1BQUYsR0FBQTtBQUNULElB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dXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuWVhtbCA9IHt9XG5cbmNsYXNzIFlYbWwuTm9kZVxuICBjb25zdHJ1Y3RvcjogKCktPlxuICAgIEBfeG1sID89IHt9XG5cbiAgX2NoZWNrRm9yTW9kZWw6ICgpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIllvdSBoYXZlIHRvIHB1dCB0aGUgWS5cIitAX25hbWUrJyBpbnN0YW5jZSBvbiBhIHNoYXJlZCBlbGVtZW50IGJlZm9yZSB5b3UgY2FuIHVzZSBpdCEgRS5nLiBvbiB0aGUgeSBvYmplY3QgeS52YWwoXCJteS0nK0BfbmFtZSsnXCIseScrQF9uYW1lKycpJ1xuXG4gIF9nZXRNb2RlbDogKCktPlxuICAgIGlmIEBfeG1sLnBhcmVudD9cbiAgICAgIEBfbW9kZWwudmFsKFwicGFyZW50XCIsIEBfeG1sLnBhcmVudClcbiAgICAgIEBfc2V0TW9kZWwgQF9tb2RlbFxuICAgIGlmIEBfZG9tP1xuICAgICAgQGdldERvbSgpXG4gICAgQF9tb2RlbFxuXG4gIF9zZXRNb2RlbDogKEBfbW9kZWwpLT5cbiAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICBpZiBldmVudC5uYW1lIGlzIFwicGFyZW50XCIgYW5kIGV2ZW50LnR5cGUgaXNudCBcImFkZFwiXG4gICAgICAgICAgcGFyZW50ID0gZXZlbnQub2xkVmFsdWVcbiAgICAgICAgICBjaGlsZHJlbiA9IHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIik/LnZhbCgpXG4gICAgICAgICAgaWYgY2hpbGRyZW4/XG4gICAgICAgICAgICBmb3IgYyxpIGluIGNoaWxkcmVuXG4gICAgICAgICAgICAgIGlmIGMgaXMgQFxuICAgICAgICAgICAgICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuZGVsZXRlIGlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgIGRlbGV0ZSBAX3htbFxuXG4gIF9zZXRQYXJlbnQ6IChwYXJlbnQpLT5cbiAgICBpZiBwYXJlbnQgaW5zdGFuY2VvZiBZWG1sLkVsZW1lbnRcbiAgICAgIGlmIEBfbW9kZWw/XG4gICAgICAgIEByZW1vdmUoKVxuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBwYXJlbnQpXG4gICAgICBlbHNlXG4gICAgICAgIEBfeG1sLnBhcmVudCA9IHBhcmVudFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcInBhcmVudCBtdXN0IGJlIG9mIHR5cGUgWS5YbWwhXCJcblxuI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgYWZ0ZXIgdGhpcyBlbGVtZW50XG4gICMgLmFmdGVyKGNvbnRlbnQgWywgY29udGVudF0pXG4gICNcbiAgYWZ0ZXI6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHBhcmVudCA9IEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgaWYgbm90IHBhcmVudD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgWG1sIEVsZW1lbnQgbXVzdCBub3QgaGF2ZSBzaWJsaW5ncyEgKGZvciBpdCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50KVwiXG5cbiAgICAjIGZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgZWxlbWVudFxuICAgIGZvciBjLHBvc2l0aW9uIGluIHBhcmVudC5nZXRDaGlsZHJlbigpXG4gICAgICBpZiBjIGlzIEBcbiAgICAgICAgYnJlYWtcblxuICAgIGNvbnRlbnRzID0gW11cbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sLkVsZW1lbnRcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEBfbW9kZWwudmFsKFwicGFyZW50XCIpKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwuRWxlbWVudCBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgY29udGVudHMucHVzaCBjb250ZW50XG5cbiAgICBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzKHBvc2l0aW9uKzEsIGNvbnRlbnRzKVxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIGFmdGVyIHRoaXMgZWxlbWVudFxuICAjIC5hZnRlcihjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGJlZm9yZTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBub3QgcGFyZW50P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBYbWwgRWxlbWVudCBtdXN0IG5vdCBoYXZlIHNpYmxpbmdzISAoZm9yIGl0IGRvZXMgbm90IGhhdmUgYSBwYXJlbnQpXCJcblxuICAgICMgZmluZCB0aGUgcG9zaXRpb24gb2YgdGhpcyBlbGVtZW50XG4gICAgZm9yIGMscG9zaXRpb24gaW4gcGFyZW50LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMgaXMgQFxuICAgICAgICBicmVha1xuXG4gICAgY29udGVudHMgPSBbXVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWwuRWxlbWVudFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQF9tb2RlbC52YWwoXCJwYXJlbnRcIikpXG4gICAgICBlbHNlIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5FbGVtZW50IG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBjb250ZW50cy5wdXNoIGNvbnRlbnRcblxuICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMocG9zaXRpb24sIGNvbnRlbnRzKVxuXG5cbiAgI1xuICAjIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSB0aGUgRE9NXG4gICMgLnJlbW92ZSgpXG4gICNcbiAgcmVtb3ZlOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcInBhcmVudFwiKT9cbiAgICAgIHBhcmVudCA9IEBfbW9kZWwuZGVsZXRlKFwicGFyZW50XCIpXG4gICAgQFxuXG4gICNcbiAgIyBHZXQgdGhlIHBhcmVudCBvZiB0aGlzIEVsZW1lbnRcbiAgIyBATm90ZTogRXZlcnkgWE1MIGVsZW1lbnQgY2FuIG9ubHkgaGF2ZSBvbmUgcGFyZW50XG4gICMgLmdldFBhcmVudCgpXG4gICNcbiAgZ2V0UGFyZW50OiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuXG4gIGdldFBvc2l0aW9uOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIHBhcmVudD9cbiAgICAgIGZvciBjLGkgaW4gcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgICBpZiBjIGlzIEBcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBpcyBub3QgYSBjaGlsZCBvZiBpdHMgcGFyZW50IChzaG91bGQgbm90IGhhcHBlbiBpbiBZLlhtbCEpXCJcbiAgICBlbHNlXG4gICAgICBudWxsXG5cbmNsYXNzIFlYbWwuVGV4dCBleHRlbmRzIFlYbWwuTm9kZVxuICBjb25zdHJ1Y3RvcjogKHRleHQgPSBcIlwiKS0+XG4gICAgc3VwZXIoKVxuICAgIGlmIHRleHQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICBAX3htbC50ZXh0ID0gdGV4dFxuICAgIGVsc2UgaWYgdGV4dCBpbnN0YW5jZW9mIHdpbmRvdy5UZXh0XG4gICAgICBAX2RvbSA9IHRleHRcbiAgICBlbHNlIGlmIHRleHQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgY29uc3RydWN0b3Igb2YgWS5YbWwuVGV4dCBleHBlY3RzIGVpdGhlciBTdHJpbmcgb3IgYW4gRG9tIFRleHQgZWxlbWVudCFcIlxuXG4gIF9nZXRNb2RlbDogKFksIG9wcyktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgaWYgQF9kb20/XG4gICAgICAgIEBfeG1sLnRleHQgPSBAX2RvbS50ZXh0Q29udGVudFxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwidGV4dFwiLCBAX3htbC50ZXh0KVxuICAgICAgc3VwZXJcbiAgICBAX21vZGVsXG5cbiAgX25hbWU6IFwiWG1sLlRleHRcIlxuXG4gIHRvU3RyaW5nOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcInRleHRcIilcblxuICBnZXREb206ICgpLT5cbiAgICBpZiBub3QgQF9kb20/XG4gICAgICBAX2RvbSA9IG5ldyB3aW5kb3cuVGV4dChAX21vZGVsLnZhbChcInRleHRcIikpXG4gICAgaWYgbm90IEBfZG9tLl95X3htbD9cbiAgICAgIHRoYXQgPSBAXG4gICAgICBpbml0aWFsaXplX3Byb3hpZXMuY2FsbCBAXG4gICAgICBAX2RvbS5feV94bWwgPSBAXG4gICAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQubmFtZSBpcyBcInRleHRcIiBhbmQgKGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCIpXG4gICAgICAgICAgICBuZXdfdGV4dCA9IHRoYXQuX21vZGVsLnZhbChcInRleHRcIilcbiAgICAgICAgICAgIGlmIHRoYXQuX2RvbS5kYXRhIGlzbnQgbmV3X3RleHRcbiAgICAgICAgICAgICAgdGhhdC5fZG9tLmRhdGEgPSBuZXdfdGV4dFxuICAgIEBfZG9tXG5cbiAgdXBkYXRlOiAoKS0+XG4gICAgdGhhdCA9IEBcbiAgICBpZiB0aGF0Ll9tb2RlbC52YWwoXCJ0ZXh0XCIpIGlzbnQgdGhhdC5fZG9tLmRhdGFcbiAgICAgIHRoYXQuX21vZGVsLnZhbChcInRleHRcIiwgdGhhdC5fZG9tLmRhdGEpXG4gICAgdW5kZWZpbmVkXG5cbmNsYXNzIFlYbWwuRWxlbWVudCBleHRlbmRzIFlYbWwuTm9kZVxuXG4gIGNvbnN0cnVjdG9yOiAodGFnX29yX2RvbSwgYXR0cmlidXRlcyA9IHt9KS0+XG4gICAgc3VwZXIoKVxuICAgIGlmIG5vdCB0YWdfb3JfZG9tP1xuICAgICAgIyBub3BcbiAgICBlbHNlIGlmIHRhZ19vcl9kb20uY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICB0YWduYW1lID0gdGFnX29yX2RvbVxuICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgI1RPRE86IEhvdyB0byBmb3JjZSB0aGUgdXNlciB0byBzcGVjaWZ5IHBhcmFtZXRlcnM/XG4gICAgICAjaWYgbm90IHRhZ25hbWU/XG4gICAgICAjICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBzcGVjaWZ5IGEgdGFnbmFtZVwiXG4gICAgICBAX3htbC50YWduYW1lID0gdGFnbmFtZVxuICAgICAgaWYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciBpc250IE9iamVjdFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIHNwZWNpZmllZCBhcyBhIE9iamVjdFwiXG4gICAgICBmb3IgYV9uYW1lLCBhIG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgaWYgYS5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgb2YgdHlwZSBTdHJpbmchXCJcbiAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzXG4gICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgIF9jbGFzc2VzID0gQF94bWwuYXR0cmlidXRlcy5jbGFzc1xuICAgICAgZGVsZXRlIEBfeG1sLmF0dHJpYnV0ZXMuY2xhc3NcbiAgICAgIGlmIF9jbGFzc2VzP1xuICAgICAgICBmb3IgY19uYW1lLCBjIGluIF9jbGFzc2VzLnNwbGl0KFwiIFwiKVxuICAgICAgICAgIGlmIGMubGVuZ3RoID4gMFxuICAgICAgICAgICAgQF94bWwuY2xhc3Nlc1tjX25hbWVdID0gY1xuICAgICAgdW5kZWZpbmVkXG4gICAgZWxzZSBpZiB0YWdfb3JfZG9tIGluc3RhbmNlb2Ygd2luZG93Py5FbGVtZW50XG4gICAgICBAX2RvbSA9IHRhZ19vcl9kb21cblxuXG4gIF9uYW1lOiBcIlhtbC5FbGVtZW50XCJcblxuICBfZ2V0TW9kZWw6IChZLCBvcHMpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAX3htbC50YWduYW1lID0gQF9kb20udGFnTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSB7fVxuICAgICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgICAgZm9yIGF0dHJpYnV0ZSBpbiBAX2RvbS5hdHRyaWJ1dGVzXG4gICAgICAgICAgaWYgYXR0cmlidXRlLm5hbWUgaXMgXCJjbGFzc1wiXG4gICAgICAgICAgICBmb3IgYyBpbiBhdHRyaWJ1dGUudmFsdWUuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgICAgIEBfeG1sLmNsYXNzZXNbY10gPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQF94bWwuYXR0cmlidXRlc1thdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUudmFsdWVcbiAgICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgICBmb3IgY2hpbGQgaW4gQF9kb20uY2hpbGROb2Rlc1xuICAgICAgICAgIGlmIGNoaWxkLm5vZGVUeXBlIGlzIGNoaWxkLlRFWFRfTk9ERVxuICAgICAgICAgICAgQF94bWwuY2hpbGRyZW4ucHVzaCBuZXcgWVhtbC5UZXh0KGNoaWxkKVxuICAgICAgICAgIGVsc2UgaWYgY2hpbGQubm9kZVR5cGUgaXMgY2hpbGQuRUxFTUVOVF9OT0RFXG4gICAgICAgICAgICBuZXdfeXhtbCA9IG5ldyBZWG1sLkVsZW1lbnQoY2hpbGQpXG4gICAgICAgICAgICBuZXdfeXhtbC5fc2V0UGFyZW50IEBcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2gobmV3X3l4bWwpXG4gICAgICAgICAgIyBlbHNlIG5vcFxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiLCBuZXcgWS5PYmplY3QoQF94bWwuYXR0cmlidXRlcykpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IFkuT2JqZWN0KEBfeG1sLmNsYXNzZXMpKVxuICAgICAgQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIsIEBfeG1sLnRhZ25hbWUpXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIsIG5ldyBZLkxpc3QoQF94bWwuY2hpbGRyZW4pKVxuICAgICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBAX3htbC5wYXJlbnQpXG5cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAZ2V0RG9tKCkgIyB0d28gd2F5IGJpbmQgZG9tIHRvIHRoaXMgeG1sIHR5cGVcblxuICAgICAgc3VwZXJcblxuICAgIEBfbW9kZWxcblxuICB0b1N0cmluZzogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgeG1sID0gXCI8XCIrQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpXG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIEBhdHRyKClcbiAgICAgIHhtbCArPSBcIiBcIituYW1lKyc9XCInK3ZhbHVlKydcIidcbiAgICB4bWwgKz0gXCI+XCJcbiAgICBmb3IgY2hpbGQgaW4gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgeG1sICs9IGNoaWxkLnRvU3RyaW5nKClcbiAgICB4bWwgKz0gJzwvJytAX21vZGVsLnZhbChcInRhZ25hbWVcIikrJz4nXG4gICAgeG1sXG5cbiAgI1xuICAjIEdldC9zZXQgdGhlIGF0dHJpYnV0ZShzKSBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLmF0dHIoKVxuICAjIC5hdHRyKG5hbWUpXG4gICMgLmF0dHIobmFtZSwgdmFsdWUpXG4gICNcbiAgYXR0cjogKG5hbWUsIHZhbHVlKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgaWYgdmFsdWUuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBvZiB0eXBlIFN0cmluZyFcIlxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgY2xhc3NlcyA9IHZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICBjcyA9IHt9XG4gICAgICAgIGZvciBjIGluIGNsYXNzZXNcbiAgICAgICAgICBjc1tjXSA9IHRydWVcblxuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IEBfbW9kZWwuY3VzdG9tX3R5cGVzLk9iamVjdChjcykpXG4gICAgICBlbHNlXG4gICAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwobmFtZSwgdmFsdWUpXG4gICAgICBAXG4gICAgZWxzZSBpZiBhcmd1bWVudHMubGVuZ3RoID4gMFxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgT2JqZWN0LmtleXMoQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbCgpKS5qb2luKFwiIFwiKVxuICAgICAgZWxzZVxuICAgICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKG5hbWUpXG4gICAgZWxzZVxuICAgICAgYXR0cnMgPSBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKClcbiAgICAgIGNsYXNzZXMgPSBPYmplY3Qua2V5cyhAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKCkpLmpvaW4oXCIgXCIpXG4gICAgICBpZiBjbGFzc2VzLmxlbmd0aCA+IDBcbiAgICAgICAgYXR0cnNbXCJjbGFzc1wiXSA9IGNsYXNzZXNcbiAgICAgIGF0dHJzXG5cbiAgI1xuICAjIEFkZHMgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgdG8gdGhpcyBlbGVtZW50XG4gICNcbiAgYWRkQ2xhc3M6IChuYW1lcyktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIG5hbWUgaW4gbmFtZXMuc3BsaXQoXCIgXCIpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKG5hbWUsIHRydWUpXG4gICAgQFxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIHRvIHRoZSBlbmQgb2YgdGhpcyBlbGVtZW50XG4gICMgLmFwcGVuZChjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFwcGVuZDogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICBjb250ZW50ID0gbmV3IFlYbWwuVGV4dChjb250ZW50KVxuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWwuTm9kZVxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQClcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5Ob2RlIChlLmcuIEVsZW1lbnQsIFRleHQpIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnB1c2goY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLnByZXBlbmQoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBwcmVwZW5kOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNvbnRlbnQgPSBuZXcgWVhtbC5UZXh0KGNvbnRlbnQpXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbC5Ob2RlXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5wcmVwZW5kIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwuTm9kZSAoZS5nLiBFbGVtZW50LCBUZXh0KSBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnQoMCwgY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhbGwgY2hpbGQgbm9kZXMgb2YgdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzIGZyb20gdGhlIERPTS5cbiAgIyAuZW1wdHkoKVxuICAjXG4gIGVtcHR5OiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICAjIFRPRE86IGRvIGl0IGxpa2UgdGhpcyA6IEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIiwgbmV3IFkuTGlzdCgpKVxuICAgIGNoaWxkcmVuID0gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKVxuICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlbi52YWwoKVxuICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNoaWxkcmVuLmRlbGV0ZSgwKVxuICAgICAgZWxzZVxuICAgICAgICBjaGlsZC5yZW1vdmUoKVxuXG4gICNcbiAgIyBEZXRlcm1pbmUgd2hldGhlciBhbnkgb2YgdGhlIG1hdGNoZWQgZWxlbWVudHMgYXJlIGFzc2lnbmVkIHRoZSBnaXZlbiBjbGFzcy5cbiAgIyAuaGFzQ2xhc3MoY2xhc3NOYW1lKVxuICAjXG4gIGhhc0NsYXNzOiAoY2xhc3NOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKGNsYXNzTmFtZSk/XG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuXG4gICNcbiAgIyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhpcyBlbGVtZW50XG4gICMgLnJlbW92ZUF0dHIoYXR0ck5hbWUpXG4gICNcbiAgcmVtb3ZlQXR0cjogKGF0dHJOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhdHRyTmFtZSBpcyBcImNsYXNzXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgQF9tb2RlbC5jdXN0b21fdHlwZXMuT2JqZWN0KCkpXG4gICAgZWxzZVxuICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLmRlbGV0ZShhdHRyTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhIHNpbmdsZSBjbGFzcywgbXVsdGlwbGUgY2xhc3Nlcywgb3IgYWxsIGNsYXNzZXMgZnJvbSB0aGlzIGVsZW1lbnRcbiAgIyAucmVtb3ZlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgcmVtb3ZlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggaXMgMFxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBmb3IgY2xhc3NOYW1lIGluIGFyZ3VtZW50c1xuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIEFkZCBvciByZW1vdmUgb25lIG9yIG1vcmUgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudCxcbiAgIyBkZXBlbmRpbmcgb24gZWl0aGVyIHRoZSBjbGFzc+KAmXMgcHJlc2VuY2Ugb3IgdGhlIHZhbHVlIG9mIHRoZSBzdGF0ZSBhcmd1bWVudC5cbiAgIyAudG9nZ2xlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgdG9nZ2xlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBjbGFzc05hbWUgaW4gYXJndW1lbnRzXG4gICAgICBjbGFzc2VzID0gQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpXG4gICAgICBpZiBjbGFzc2VzLnZhbChjbGFzc05hbWUpP1xuICAgICAgICBjbGFzc2VzLmRlbGV0ZShjbGFzc05hbWUpXG4gICAgICBlbHNlXG4gICAgICAgIGNsYXNzZXMudmFsKGNsYXNzTmFtZSwgdHJ1ZSlcbiAgICBAXG5cbiAgI1xuICAjIEdldCBhbGwgdGhlIGNoaWxkcmVuIG9mIHRoaXMgWE1MIEVsZW1lbnQgYXMgYW4gQXJyYXlcbiAgIyBATm90ZTogVGhlIGNoaWxkcmVuIGFyZSBlaXRoZXIgb2YgdHlwZSBZLlhtbCBvciBTdHJpbmdcbiAgIyAuZ2V0Q2hpbGRyZW4oKVxuICAjXG4gIGdldENoaWxkcmVuOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG5cblxuICBnZXREb206ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIG5vdCBAX2RvbT9cbiAgICAgIHN2ZyA9IHRoaXMuX21vZGVsXG4gICAgICAgIC52YWwoXCJ0YWduYW1lXCIpXG4gICAgICAgIC5tYXRjaCgvZ3xzdmd8cmVjdHxsaW5lfHBhdGh8ZWxsaXBzZXx0ZXh0fHRzcGFufGRlZnN8c3ltYm9sfHVzZXxsaW5lYXJHcmFkaWVudHxwYXR0ZXJuL2cpXG4gICAgICBpZiBzdmc/XG4gICAgICAgIEBfZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgdGhpcy5fbW9kZWwudmFsKFwidGFnbmFtZVwiKSlcbiAgICAgIGVsc2VcbiAgICAgICAgQF9kb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KEBfbW9kZWwudmFsKFwidGFnbmFtZVwiKSlcbiAgICAgICMgc2V0IHRoZSBhdHRyaWJ1dGVzIF9hbmRfIHRoZSBjbGFzc2VzIChAc2VlIC5hdHRyKCkpXG4gICAgICBmb3IgYXR0cl9uYW1lLCBhdHRyX3ZhbHVlIG9mIEBhdHRyKClcbiAgICAgICAgQF9kb20uc2V0QXR0cmlidXRlIGF0dHJfbmFtZSwgYXR0cl92YWx1ZVxuICAgICAgZm9yIGNoaWxkLGkgaW4gQGdldENoaWxkcmVuKClcbiAgICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgICAgZG9tID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUgY2hpbGRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRvbSA9IGNoaWxkLmdldERvbSgpXG4gICAgICAgIEBfZG9tLmluc2VydEJlZm9yZSBkb20sIG51bGxcblxuICAgIHRoYXQgPSBAXG5cbiAgICBpZiAobm90IEBfZG9tLl95X3htbD8pXG4gICAgICBAX2RvbS5feV94bWwgPSBAXG4gICAgICBpbml0aWFsaXplX3Byb3hpZXMuY2FsbCBAXG5cbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiaW5zZXJ0XCJcbiAgICAgICAgICAgIG5ld05vZGUgPSBldmVudC52YWx1ZS5nZXREb20oKVxuICAgICAgICAgICAgcmlnaHRFbGVtZW50ID0gZXZlbnQucmVmZXJlbmNlLmdldE5leHQoKVxuICAgICAgICAgICAgaWYgcmlnaHRFbGVtZW50LnR5cGUgaXMgXCJEZWxpbWl0ZXJcIlxuICAgICAgICAgICAgICByaWdodE5vZGUgPSBudWxsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJpZ2h0Tm9kZSA9IHJpZ2h0RWxlbWVudC5nZXRDb250ZW50KCkuX2RvbVxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5pbnNlcnRCZWZvcmUgbmV3Tm9kZSwgcmlnaHROb2RlXG4gICAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICAgIGRlbGV0ZWQgPSB0aGF0Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoZXZlbnQucG9zaXRpb24pLl9kb21cblxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVDaGlsZCBkZWxldGVkXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICBuZXd2YWwgPSBldmVudC5vYmplY3QudmFsKGV2ZW50Lm5hbWUpXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnNldEF0dHJpYnV0ZSBldmVudC5uYW1lLCBuZXd2YWxcbiAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVBdHRyaWJ1dGUgZXZlbnQubmFtZVxuICAgICAgc2V0Q2xhc3NlcyA9ICgpLT5cbiAgICAgICAgdGhhdC5fbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QuYWRkIGV2ZW50Lm5hbWUgIyBjbGFzc2VzIGFyZSBzdG9yZWQgYXMgdGhlIGtleXNcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QucmVtb3ZlIGV2ZW50Lm5hbWVcbiAgICAgIHNldENsYXNzZXMoKVxuICAgICAgQF9tb2RlbC5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICBjbGFzc2VzID0gdGhhdC5hdHRyKFwiY2xhc3NcIilcbiAgICAgICAgICAgICAgaWYgKG5vdCBjbGFzc2VzPykgb3IgY2xhc3NlcyBpcyBcIlwiXG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUF0dHJpYnV0ZSBcImNsYXNzXCJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5zZXRBdHRyaWJ1dGUgXCJjbGFzc1wiLCB0aGF0LmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgc2V0Q2xhc3NlcygpXG5cbiAgICBAX2RvbVxuXG5wcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IGZhbHNlXG4jIHNvbWUgZG9tIGltcGxlbWVudGF0aW9ucyBtYXkgY2FsbCBhbm90aGVyIGRvbS5tZXRob2QgdGhhdCBzaW11bGF0ZXMgdGhlIGJlaGF2aW9yIG9mIGFub3RoZXIuXG4jIEZvciBleGFtcGxlIHhtbC5pbnNlcnRDaGlsZChkb20pICwgd2ljaCBpbnNlcnRzIGFuIGVsZW1lbnQgYXQgdGhlIGVuZCwgYW5kIHhtbC5pbnNlcnRBZnRlcihkb20sbnVsbCkgd2ljaCBkb2VzIHRoZSBzYW1lXG4jIEJ1dCBZJ3MgcHJveHkgbWF5IGJlIGNhbGxlZCBvbmx5IG9uY2UhXG5wcm94eV90b2tlbiA9IGZhbHNlXG5kb250X3Byb3h5ID0gKGYpLT5cbiAgcHJveHlfdG9rZW4gPSB0cnVlXG4gIHRyeVxuICAgIGYoKVxuICBjYXRjaCBlXG4gICAgcHJveHlfdG9rZW4gPSBmYWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBlXG4gIHByb3h5X3Rva2VuID0gZmFsc2VcblxuX3Byb3h5ID0gKGZfbmFtZSwgZiwgc291cmNlID0gRWxlbWVudC5wcm90b3R5cGUsIHkpLT5cbiAgb2xkX2YgPSBzb3VyY2VbZl9uYW1lXVxuICBzb3VyY2VbZl9uYW1lXSA9ICgpLT5cbiAgICBpZiAobm90ICh5PyBvciBAX3lfeG1sPykpIG9yIHByb3h5X3Rva2VuXG4gICAgICBvbGRfZi5hcHBseSB0aGlzLCBhcmd1bWVudHNcbiAgICBlbHNlIGlmIEBfeV94bWw/XG4gICAgICBmLmFwcGx5IEBfeV94bWwsIGFyZ3VtZW50c1xuICAgIGVsc2VcbiAgICAgIGYuYXBwbHkgeSwgYXJndW1lbnRzXG5cbmluaXRpYWxpemVfcHJveGllcyA9ICgpLT5cblxuICB0aGF0ID0gQFxuXG4gIGlmIEBfbmFtZSBpcyBcIlhtbC5FbGVtZW50XCJcbiAgICBmX2FkZCA9IChjKS0+XG4gICAgICB0aGF0LmFkZENsYXNzIGNcbiAgICBfcHJveHkgXCJhZGRcIiwgZl9hZGQsIEBfZG9tLmNsYXNzTGlzdCwgQFxuXG4gICAgZl9yZW1vdmUgPSAoYyktPlxuICAgICAgdGhhdC5yZW1vdmVDbGFzcyBjXG5cbiAgICBfcHJveHkgXCJyZW1vdmVcIiwgZl9yZW1vdmUsIEBfZG9tLmNsYXNzTGlzdCwgQFxuXG4gICAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAnY2xhc3NOYW1lJywgKHZhbCktPlxuICAgICAgdGhhdC5hdHRyKCdjbGFzcycsIHZhbClcbiAgICBAX2RvbS5fX2RlZmluZUdldHRlcl9fICdjbGFzc05hbWUnLCAoKS0+XG4gICAgICB0aGF0LmF0dHIoJ2NsYXNzJylcbiAgICBAX2RvbS5fX2RlZmluZVNldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAgICMgcmVtb3ZlIGFsbCBub2Rlc1xuICAgICAgdGhhdC5lbXB0eSgpXG5cbiAgICAgICMgaW5zZXJ0IHdvcmQgY29udGVudFxuICAgICAgaWYgdmFsIGlzbnQgXCJcIlxuICAgICAgICB0aGF0LmFwcGVuZCB2YWxcblxuICAgIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgICAgcmVzID0gXCJcIlxuICAgICAgZm9yIGMgaW4gdGhhdC5nZXRDaGlsZHJlbigpXG4gICAgICAgIGlmIGMuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgICAgcmVzICs9IGNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlcyArPSBjLl9kb20udGV4dENvbnRlbnRcbiAgICAgIHJlc1xuXG4gIGVsc2UgaWYgQF9uYW1lIGlzIFwiWG1sLlRleHRcIlxuICAgIEBfZG9tLl9fZGVmaW5lU2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgICAgdGhhdC5fbW9kZWwudmFsKFwidGV4dFwiLCB2YWwpXG5cbiAgICBAX2RvbS5fX2RlZmluZUdldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAgIHRoYXQuX21vZGVsLnZhbChcInRleHRcIilcblxuICBpZiBwcm94aWVzX2FyZV9pbml0aWFsaXplZFxuICAgIHJldHVyblxuICBwcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IHRydWVcblxuICAjIHRoZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgaW5pdGlhbGl6ZWQgb24gcHJvdG90eXBlcyBhbmQgdGhlcmVmb3JlIHRoZXkgbmVlZCB0byBiZSB3cml0dGVuIG9ubHkgb25jZSFcblxuICBpbnNlcnRCZWZvcmUgPSAoaW5zZXJ0ZWROb2RlX3MsIGFkamFjZW50Tm9kZSktPlxuICAgIGlmIGFkamFjZW50Tm9kZT9cbiAgICAgIGZvciBuLGkgaW4gQGdldENoaWxkcmVuKClcbiAgICAgICAgaWYgbi5nZXREb20oKSBpcyBhZGphY2VudE5vZGVcbiAgICAgICAgICBwb3MgPSBpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIG5vdCBwb3M/XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhZGphY2VudE5vZGUgaXMgbm90IGEgY2hpbGQgZWxlbWVudCBvZiB0aGlzIG5vZGUhXCJcbiAgICBlbHNlXG4gICAgICBwb3MgPSBAZ2V0Q2hpbGRyZW4oKS5sZW5ndGhcblxuICAgIG5ld19jaGlsZHMgPSBbXVxuICAgIGlmIGluc2VydGVkTm9kZV9zLm5vZGVUeXBlIGlzIGluc2VydGVkTm9kZV9zLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREVcbiAgICAgIGNoaWxkID0gaW5zZXJ0ZWROb2RlX3MuZmlyc3RDaGlsZFxuICAgICAgd2hpbGUgY2hpbGQ/XG4gICAgICAgIG5ld19jaGlsZHMucHVzaCBjaGlsZFxuICAgICAgICBjaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nXG4gICAgZWxzZVxuICAgICAgbmV3X2NoaWxkcy5wdXNoIGluc2VydGVkTm9kZV9zXG5cbiAgICB5cGFyZW50ID0gdGhpc1xuICAgIG5ld19jaGlsZHMgPSBuZXdfY2hpbGRzLm1hcCAoY2hpbGQpLT5cbiAgICAgIGlmIGNoaWxkLl95X3htbD9cbiAgICAgICAgY2hpbGQuX3lfeG1sXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGNoaWxkLm5vZGVUeXBlID09IGNoaWxkLlRFWFRfTk9ERVxuICAgICAgICAgIHljaGlsZCA9IG5ldyBZWG1sLlRleHQoY2hpbGQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB5Y2hpbGQgPSBuZXcgWVhtbC5FbGVtZW50KGNoaWxkKVxuICAgICAgICB5Y2hpbGQuX3NldFBhcmVudCB5cGFyZW50XG4gICAgICAgIHljaGlsZFxuICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMgcG9zLCBuZXdfY2hpbGRzXG5cbiAgX3Byb3h5ICdpbnNlcnRCZWZvcmUnLCBpbnNlcnRCZWZvcmVcbiAgX3Byb3h5ICdhcHBlbmRDaGlsZCcsIGluc2VydEJlZm9yZVxuICBfcHJveHkgJ3JlbW92ZUF0dHJpYnV0ZScsIChuYW1lKS0+XG4gICAgQHJlbW92ZUF0dHIgbmFtZVxuICBfcHJveHkgJ3NldEF0dHJpYnV0ZScsIChuYW1lLCB2YWx1ZSktPlxuICAgIEBhdHRyIG5hbWUsIHZhbHVlXG5cbiAgcmVtb3ZlQ2hpbGQgPSAobm9kZSktPlxuICAgIG5vZGUuX3lfeG1sLnJlbW92ZSgpXG5cbiAgX3Byb3h5ICdyZW1vdmVDaGlsZCcsIHJlbW92ZUNoaWxkXG5cbiAgcmVwbGFjZUNoaWxkID0gKGluc2VydGVkTm9kZSwgcmVwbGFjZWROb2RlKS0+ICMgVE9ETzogaGFuZGxlIHJlcGxhY2Ugd2l0aCByZXBsYWNlIGJlaGF2aW9yLi4uXG4gICAgaW5zZXJ0QmVmb3JlLmNhbGwgdGhpcywgaW5zZXJ0ZWROb2RlLCByZXBsYWNlZE5vZGVcbiAgICByZW1vdmVDaGlsZC5jYWxsIHRoaXMsIHJlcGxhY2VkTm9kZVxuXG4gIF9wcm94eSAncmVwbGFjZUNoaWxkJywgcmVwbGFjZUNoaWxkXG5cbiAgcmVtb3ZlID0gKCktPlxuICAgIGlmIEBfbW9kZWwudmFsKFwicGFyZW50XCIpP1xuICAgICAgQHJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgdGhpc19kb20gPSB0aGlzLl9kb21cbiAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICB0aGlzX2RvbS5yZW1vdmUoKVxuXG4gIF9wcm94eSAncmVtb3ZlJywgcmVtb3ZlXG5cbmlmIHdpbmRvdz9cbiAgaWYgd2luZG93Llk/XG4gICAgaWYgd2luZG93LlkuTGlzdD9cbiAgICAgIHdpbmRvdy5ZLlhtbCA9IFlYbWxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWS5MaXN0IVwiXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWVhtbFxuIl19
