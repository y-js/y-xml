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
          } else {
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
        var children, deleted, event, newNode, rightNode, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "insert") {
            newNode = event.value.getDom();
            children = that._dom.childNodes;
            if (children.length <= event.position) {
              rightNode = null;
            } else {
              rightNode = children[event.position];
            }
            _results.push(dont_proxy(function() {
              return that._dom.insertBefore(newNode, rightNode);
            }));
          } else if (event.type === "delete") {
            deleted = that._dom.childNodes[event.position];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rtb25hZC9naXQveS0wNS95LXhtbC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kbW9uYWQvZ2l0L3ktMDUveS14bWwvbGliL3kteG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUEsa0ZBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQUFBLEdBQU8sRUFBUCxDQUFBOztBQUFBLElBRVUsQ0FBQztBQUNJLEVBQUEsY0FBQSxHQUFBOztNQUNYLElBQUMsQ0FBQSxPQUFRO0tBREU7RUFBQSxDQUFiOztBQUFBLGlCQUdBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFPLG1CQUFQO0FBQ0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSx3QkFBQSxHQUF5QixJQUFDLENBQUEsS0FBMUIsR0FBZ0Msc0ZBQWhDLEdBQXVILElBQUMsQ0FBQSxLQUF4SCxHQUE4SCxLQUE5SCxHQUFvSSxJQUFDLENBQUEsS0FBckksR0FBMkksR0FBakosQ0FBVixDQURGO0tBRGM7RUFBQSxDQUhoQixDQUFBOztBQUFBLGlCQU9BLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxJQUFBLElBQUcsd0JBQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUE1QixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE1BQVosQ0FEQSxDQURGO0tBQUE7QUFHQSxJQUFBLElBQUcsaUJBQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQURGO0tBSEE7V0FLQSxJQUFDLENBQUEsT0FOUTtFQUFBLENBUFgsQ0FBQTs7QUFBQSxpQkFlQSxTQUFBLEdBQVcsU0FBRSxNQUFGLEdBQUE7QUFDVCxJQURVLElBQUMsQ0FBQSxTQUFBLE1BQ1gsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLFNBQUMsTUFBRCxHQUFBO0FBQ2QsVUFBQSx1REFBQTtBQUFBO1dBQUEsNkNBQUE7MkJBQUE7QUFDRSxRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxRQUFkLElBQTJCLEtBQUssQ0FBQyxJQUFOLEtBQWdCLEtBQTlDO0FBQ0UsVUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBQTtBQUFBLFVBQ0EsUUFBQSx3REFBd0MsQ0FBRSxHQUEvQixDQUFBLFVBRFgsQ0FBQTtBQUVBLFVBQUEsSUFBRyxnQkFBSDs7O0FBQ0U7bUJBQUEseURBQUE7Z0NBQUE7QUFDRSxnQkFBQSxJQUFHLENBQUEsS0FBSyxJQUFSO0FBQ0Usa0JBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFkLENBQWtCLFVBQWxCLENBQTZCLENBQUMsUUFBRCxDQUE3QixDQUFxQyxDQUFyQyxDQUFBLENBQUE7QUFDQSx3QkFGRjtpQkFBQSxNQUFBO3lDQUFBO2lCQURGO0FBQUE7OzJCQURGO1dBQUEsTUFBQTtrQ0FBQTtXQUhGO1NBQUEsTUFBQTtnQ0FBQTtTQURGO0FBQUE7c0JBRGM7SUFBQSxDQUFoQixDQUFBLENBQUE7V0FVQSxNQUFBLENBQUEsSUFBUSxDQUFBLEtBWEM7RUFBQSxDQWZYLENBQUE7O0FBQUEsaUJBNEJBLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTtBQUNWLElBQUEsSUFBRyxNQUFBLFlBQWtCLElBQUksQ0FBQyxPQUExQjtBQUNFLE1BQUEsSUFBRyxtQkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCLE1BQXRCLEVBRkY7T0FBQSxNQUFBO2VBSUUsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsT0FKakI7T0FERjtLQUFBLE1BQUE7QUFPRSxZQUFVLElBQUEsS0FBQSxDQUFNLCtCQUFOLENBQVYsQ0FQRjtLQURVO0VBQUEsQ0E1QlosQ0FBQTs7QUFBQSxpQkEwQ0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFFBQUEsaUVBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksUUFBWixDQURULENBQUE7QUFFQSxJQUFBLElBQU8sY0FBUDtBQUNFLFlBQVUsSUFBQSxLQUFBLENBQU0sMEVBQU4sQ0FBVixDQURGO0tBRkE7QUFNQTtBQUFBLFNBQUEsaUVBQUE7eUJBQUE7QUFDRSxNQUFBLElBQUcsQ0FBQSxLQUFLLElBQVI7QUFDRSxjQURGO09BREY7QUFBQSxLQU5BO0FBQUEsSUFVQSxRQUFBLEdBQVcsRUFWWCxDQUFBO0FBV0EsU0FBQSxrREFBQTs4QkFBQTtBQUNFLE1BQUEsSUFBRyxPQUFBLFlBQW1CLElBQUksQ0FBQyxPQUEzQjtBQUNFLFFBQUEsT0FBTyxDQUFDLFVBQVIsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksUUFBWixDQUFuQixDQUFBLENBREY7T0FBQSxNQUVLLElBQUcsT0FBTyxDQUFDLFdBQVIsS0FBeUIsTUFBNUI7QUFDSCxjQUFVLElBQUEsS0FBQSxDQUFNLHdFQUFOLENBQVYsQ0FERztPQUZMO0FBQUEsTUFJQSxRQUFRLENBQUMsSUFBVCxDQUFjLE9BQWQsQ0FKQSxDQURGO0FBQUEsS0FYQTtXQWtCQSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQWQsQ0FBa0IsVUFBbEIsQ0FBNkIsQ0FBQyxjQUE5QixDQUE2QyxRQUFBLEdBQVMsQ0FBdEQsRUFBeUQsUUFBekQsRUFuQks7RUFBQSxDQTFDUCxDQUFBOztBQUFBLGlCQW1FQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sUUFBQSxpRUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxRQUFaLENBRFQsQ0FBQTtBQUVBLElBQUEsSUFBTyxjQUFQO0FBQ0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSwwRUFBTixDQUFWLENBREY7S0FGQTtBQU1BO0FBQUEsU0FBQSxpRUFBQTt5QkFBQTtBQUNFLE1BQUEsSUFBRyxDQUFBLEtBQUssSUFBUjtBQUNFLGNBREY7T0FERjtBQUFBLEtBTkE7QUFBQSxJQVVBLFFBQUEsR0FBVyxFQVZYLENBQUE7QUFXQSxTQUFBLGtEQUFBOzhCQUFBO0FBQ0UsTUFBQSxJQUFHLE9BQUEsWUFBbUIsSUFBSSxDQUFDLE9BQTNCO0FBQ0UsUUFBQSxPQUFPLENBQUMsVUFBUixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxRQUFaLENBQW5CLENBQUEsQ0FERjtPQUFBLE1BRUssSUFBRyxPQUFPLENBQUMsV0FBUixLQUF5QixNQUE1QjtBQUNILGNBQVUsSUFBQSxLQUFBLENBQU0sd0VBQU4sQ0FBVixDQURHO09BRkw7QUFBQSxNQUlBLFFBQVEsQ0FBQyxJQUFULENBQWMsT0FBZCxDQUpBLENBREY7QUFBQSxLQVhBO1dBa0JBLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBZCxDQUFrQixVQUFsQixDQUE2QixDQUFDLGNBQTlCLENBQTZDLFFBQTdDLEVBQXVELFFBQXZELEVBbkJNO0VBQUEsQ0FuRVIsQ0FBQTs7QUFBQSxpQkE2RkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFFBQUEsTUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLElBQUcsaUNBQUg7QUFDRSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQUQsQ0FBUCxDQUFlLFFBQWYsQ0FBVCxDQURGO0tBREE7V0FHQSxLQUpNO0VBQUEsQ0E3RlIsQ0FBQTs7QUFBQSxpQkF3R0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxRQUFaLEVBRlM7RUFBQSxDQXhHWCxDQUFBOztBQUFBLGlCQTRHQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsUUFBQSw0QkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxRQUFaLENBRFQsQ0FBQTtBQUVBLElBQUEsSUFBRyxjQUFIO0FBQ0U7QUFBQSxXQUFBLG1EQUFBO29CQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUEsS0FBSyxJQUFSO0FBQ0UsaUJBQU8sQ0FBUCxDQURGO1NBREY7QUFBQSxPQUFBO0FBR0EsWUFBVSxJQUFBLEtBQUEsQ0FBTSxpRUFBTixDQUFWLENBSkY7S0FBQSxNQUFBO2FBTUUsS0FORjtLQUhXO0VBQUEsQ0E1R2IsQ0FBQTs7Y0FBQTs7SUFIRixDQUFBOztBQUFBLElBMEhVLENBQUM7QUFDVCx5QkFBQSxDQUFBOztBQUFhLEVBQUEsY0FBQyxJQUFELEdBQUE7O01BQUMsT0FBTztLQUNuQjtBQUFBLElBQUEsb0NBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUksQ0FBQyxXQUFMLEtBQW9CLE1BQXZCO0FBQ0UsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sR0FBYSxJQUFiLENBREY7S0FBQSxNQUVLLElBQUcsSUFBQSxZQUFnQixNQUFNLENBQUMsSUFBMUI7QUFDSCxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBUixDQURHO0tBQUEsTUFFQSxJQUFHLFlBQUg7QUFDSCxZQUFVLElBQUEsS0FBQSxDQUFNLDZFQUFOLENBQVYsQ0FERztLQU5NO0VBQUEsQ0FBYjs7QUFBQSxpQkFTQSxTQUFBLEdBQVcsU0FBQyxDQUFELEVBQUksR0FBSixHQUFBO0FBQ1QsSUFBQSxJQUFPLG1CQUFQO0FBQ0UsTUFBQSxJQUFHLGlCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sR0FBYSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQW5CLENBREY7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEdBQUcsQ0FBQyxVQUFKLENBQWUsSUFBZixDQUFpQixDQUFDLE9BQWxCLENBQUEsQ0FGZCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBMUIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxxQ0FBQSxTQUFBLENBSkEsQ0FERjtLQUFBO1dBTUEsSUFBQyxDQUFBLE9BUFE7RUFBQSxDQVRYLENBQUE7O0FBQUEsaUJBa0JBLEtBQUEsR0FBTyxVQWxCUCxDQUFBOztBQUFBLGlCQW9CQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFGUTtFQUFBLENBcEJWLENBQUE7O0FBQUEsaUJBd0JBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixRQUFBLElBQUE7QUFBQSxJQUFBLElBQU8saUJBQVA7QUFDRSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosQ0FBWixDQUFaLENBREY7S0FBQTtBQUVBLElBQUEsSUFBTyx3QkFBUDtBQUNFLE1BQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUFBLE1BQ0Esa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxJQUZmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFlBQUEsbUNBQUE7QUFBQTthQUFBLDZDQUFBOzZCQUFBO0FBQ0UsVUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsTUFBZCxJQUF5QixDQUFDLEtBQUssQ0FBQyxJQUFOLEtBQWMsS0FBZCxJQUF1QixLQUFLLENBQUMsSUFBTixLQUFjLFFBQXRDLENBQTVCO0FBQ0UsWUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE1BQWhCLENBQVgsQ0FBQTtBQUNBLFlBQUEsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQVYsS0FBb0IsUUFBdkI7NEJBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFWLEdBQWlCLFVBRG5CO2FBQUEsTUFBQTtvQ0FBQTthQUZGO1dBQUEsTUFBQTtrQ0FBQTtXQURGO0FBQUE7d0JBRGM7TUFBQSxDQUFoQixDQUhBLENBREY7S0FGQTtXQVlBLElBQUMsQ0FBQSxLQWJLO0VBQUEsQ0F4QlIsQ0FBQTs7QUFBQSxpQkF1Q0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsTUFBaEIsQ0FBQSxLQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQTFDO0FBQ0UsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFsQyxDQUFBLENBREY7S0FEQTtXQUdBLE9BSk07RUFBQSxDQXZDUixDQUFBOztjQUFBOztHQURzQixJQUFJLENBQUMsS0ExSDdCLENBQUE7O0FBQUEsSUF3S1UsQ0FBQztBQUVULDRCQUFBLENBQUE7O0FBQWEsRUFBQSxpQkFBQyxVQUFELEVBQWEsVUFBYixHQUFBO0FBQ1gsUUFBQSx1REFBQTs7TUFEd0IsYUFBYTtLQUNyQztBQUFBLElBQUEsdUNBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFPLGtCQUFQO0FBQUE7S0FBQSxNQUVLLElBQUcsVUFBVSxDQUFDLFdBQVgsS0FBMEIsTUFBN0I7QUFDSCxNQUFBLE9BQUEsR0FBVSxVQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixHQUFpQixFQURqQixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0IsT0FMaEIsQ0FBQTtBQU1BLE1BQUEsSUFBRyxVQUFVLENBQUMsV0FBWCxLQUE0QixNQUEvQjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sOENBQU4sQ0FBVixDQURGO09BTkE7QUFRQSxXQUFBLG9CQUFBOytCQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsQ0FBQyxXQUFGLEtBQW1CLE1BQXRCO0FBQ0UsZ0JBQVUsSUFBQSxLQUFBLENBQU0sd0NBQU4sQ0FBVixDQURGO1NBREY7QUFBQSxPQVJBO0FBQUEsTUFXQSxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQU4sR0FBbUIsVUFYbkIsQ0FBQTtBQUFBLE1BWUEsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLEdBQWdCLEVBWmhCLENBQUE7QUFBQSxNQWFBLFFBQUEsR0FBVyxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFELENBYjNCLENBQUE7QUFBQSxNQWNBLE1BQUEsQ0FBQSxJQUFRLENBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFELENBZHZCLENBQUE7QUFlQSxNQUFBLElBQUcsZ0JBQUg7QUFDRTtBQUFBLGFBQUEsbURBQUE7MkJBQUE7QUFDRSxVQUFBLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFkO0FBQ0UsWUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQVEsQ0FBQSxNQUFBLENBQWQsR0FBd0IsQ0FBeEIsQ0FERjtXQURGO0FBQUEsU0FERjtPQWZBO0FBQUEsTUFtQkEsTUFuQkEsQ0FERztLQUFBLE1BcUJBLElBQUcsVUFBQSxnRUFBc0IsTUFBTSxDQUFFLGlCQUFqQztBQUNILE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxVQUFSLENBREc7S0F6Qk07RUFBQSxDQUFiOztBQUFBLG9CQTZCQSxLQUFBLEdBQU8sYUE3QlAsQ0FBQTs7QUFBQSxvQkErQkEsU0FBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLEdBQUosR0FBQTtBQUNULFFBQUEsaUZBQUE7QUFBQSxJQUFBLElBQU8sbUJBQVA7QUFDRSxNQUFBLElBQUcsaUJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFkLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLEdBQW1CLEVBRG5CLENBQUE7QUFBQSxRQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQixFQUZoQixDQUFBO0FBR0E7QUFBQSxhQUFBLDJDQUFBOytCQUFBO0FBQ0UsVUFBQSxJQUFHLFNBQVMsQ0FBQyxJQUFWLEtBQWtCLE9BQXJCO0FBQ0U7QUFBQSxpQkFBQSw4Q0FBQTs0QkFBQTtBQUNFLGNBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFkLEdBQW1CLElBQW5CLENBREY7QUFBQSxhQURGO1dBQUEsTUFBQTtBQUlFLFlBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFXLENBQUEsU0FBUyxDQUFDLElBQVYsQ0FBakIsR0FBbUMsU0FBUyxDQUFDLEtBQTdDLENBSkY7V0FERjtBQUFBLFNBSEE7QUFBQSxRQVNBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixHQUFpQixFQVRqQixDQUFBO0FBVUE7QUFBQSxhQUFBLDhDQUFBOzRCQUFBO0FBQ0UsVUFBQSxJQUFHLEtBQUssQ0FBQyxRQUFOLEtBQWtCLEtBQUssQ0FBQyxTQUEzQjtBQUNFLFlBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZixDQUF3QixJQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixDQUF4QixDQUFBLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxRQUFBLEdBQWUsSUFBQSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsQ0FBZixDQUFBO0FBQUEsWUFDQSxRQUFRLENBQUMsVUFBVCxDQUFvQixJQUFwQixDQURBLENBQUE7QUFBQSxZQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FGQSxDQUhGO1dBREY7QUFBQSxTQVhGO09BQUE7QUFBQSxNQWtCQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsR0FBRyxDQUFDLFVBQUosQ0FBZSxJQUFmLENBQWlCLENBQUMsT0FBbEIsQ0FBQSxDQWxCZCxDQUFBO0FBQUEsTUFtQkEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksWUFBWixFQUE4QixJQUFBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFmLENBQTlCLENBbkJBLENBQUE7QUFBQSxNQW9CQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQTJCLElBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQWYsQ0FBM0IsQ0FwQkEsQ0FBQTtBQUFBLE1BcUJBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUE3QixDQXJCQSxDQUFBO0FBQUEsTUFzQkEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksVUFBWixFQUE0QixJQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFiLENBQTVCLENBdEJBLENBQUE7QUF1QkEsTUFBQSxJQUFHLHdCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBNUIsQ0FBQSxDQURGO09BdkJBO0FBMEJBLE1BQUEsSUFBRyxpQkFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBREY7T0ExQkE7QUFBQSxNQTZCQSx3Q0FBQSxTQUFBLENBN0JBLENBREY7S0FBQTtXQWdDQSxJQUFDLENBQUEsT0FqQ1E7RUFBQSxDQS9CWCxDQUFBOztBQUFBLG9CQWtFQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSw4Q0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxHQUFBLEdBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksU0FBWixDQURWLENBQUE7QUFFQTtBQUFBLFNBQUEsWUFBQTt5QkFBQTtBQUNFLE1BQUEsR0FBQSxJQUFPLEdBQUEsR0FBSSxJQUFKLEdBQVMsSUFBVCxHQUFjLEtBQWQsR0FBb0IsR0FBM0IsQ0FERjtBQUFBLEtBRkE7QUFBQSxJQUlBLEdBQUEsSUFBTyxHQUpQLENBQUE7QUFLQTtBQUFBLFNBQUEsNENBQUE7d0JBQUE7QUFDRSxNQUFBLEdBQUEsSUFBTyxLQUFLLENBQUMsUUFBTixDQUFBLENBQVAsQ0FERjtBQUFBLEtBTEE7QUFBQSxJQU9BLEdBQUEsSUFBTyxJQUFBLEdBQUssSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksU0FBWixDQUFMLEdBQTRCLEdBUG5DLENBQUE7V0FRQSxJQVRRO0VBQUEsQ0FsRVYsQ0FBQTs7QUFBQSxvQkFtRkEsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNKLFFBQUEsK0JBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO0FBQ0UsTUFBQSxJQUFHLEtBQUssQ0FBQyxXQUFOLEtBQXVCLE1BQTFCO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSx3Q0FBTixDQUFWLENBREY7T0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFBLEtBQVEsT0FBWDtBQUNFLFFBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWixDQUFWLENBQUE7QUFBQSxRQUNBLEVBQUEsR0FBSyxFQURMLENBQUE7QUFFQSxhQUFBLDhDQUFBOzBCQUFBO0FBQ0UsVUFBQSxFQUFHLENBQUEsQ0FBQSxDQUFILEdBQVEsSUFBUixDQURGO0FBQUEsU0FGQTtBQUFBLFFBS0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksU0FBWixFQUEyQixJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQXJCLENBQTRCLEVBQTVCLENBQTNCLENBTEEsQ0FERjtPQUFBLE1BQUE7QUFRRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFlBQVosQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixJQUE5QixFQUFvQyxLQUFwQyxDQUFBLENBUkY7T0FGQTthQVdBLEtBWkY7S0FBQSxNQWFLLElBQUcsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7QUFDSCxNQUFBLElBQUcsSUFBQSxLQUFRLE9BQVg7ZUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFNBQVosQ0FBc0IsQ0FBQyxHQUF2QixDQUFBLENBQVosQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxHQUEvQyxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFlBQVosQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixJQUE5QixFQUhGO09BREc7S0FBQSxNQUFBO0FBTUgsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksWUFBWixDQUF5QixDQUFDLEdBQTFCLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxTQUFaLENBQXNCLENBQUMsR0FBdkIsQ0FBQSxDQUFaLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsR0FBL0MsQ0FEVixDQUFBO0FBRUEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBQ0UsUUFBQSxLQUFNLENBQUEsT0FBQSxDQUFOLEdBQWlCLE9BQWpCLENBREY7T0FGQTthQUlBLE1BVkc7S0FmRDtFQUFBLENBbkZOLENBQUE7O0FBQUEsb0JBaUhBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFFBQUEsb0JBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFBQSxTQUFBLDJDQUFBO3NCQUFBO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxTQUFaLENBQXNCLENBQUMsR0FBdkIsQ0FBMkIsSUFBM0IsRUFBaUMsSUFBakMsQ0FBQSxDQURGO0FBQUEsS0FEQTtXQUdBLEtBSlE7RUFBQSxDQWpIVixDQUFBOztBQUFBLG9CQTJIQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sUUFBQSxpQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxTQUFBLGdEQUFBOzhCQUFBO0FBQ0UsTUFBQSxJQUFHLE9BQU8sQ0FBQyxXQUFSLEtBQXVCLE1BQTFCO0FBQ0UsUUFBQSxPQUFBLEdBQWMsSUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBZCxDQURGO09BQUE7QUFFQSxNQUFBLElBQUcsT0FBQSxZQUFtQixJQUFJLENBQUMsSUFBM0I7QUFDRSxRQUFBLE9BQU8sQ0FBQyxVQUFSLENBQW1CLElBQW5CLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxjQUFVLElBQUEsS0FBQSxDQUFNLDBGQUFOLENBQVYsQ0FIRjtPQUZBO0FBQUEsTUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxVQUFaLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FOQSxDQURGO0FBQUEsS0FEQTtXQVNBLEtBVk07RUFBQSxDQTNIUixDQUFBOztBQUFBLG9CQTJJQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsUUFBQSxpQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxTQUFBLGdEQUFBOzhCQUFBO0FBQ0UsTUFBQSxJQUFHLE9BQU8sQ0FBQyxXQUFSLEtBQXVCLE1BQTFCO0FBQ0UsUUFBQSxPQUFBLEdBQWMsSUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBZCxDQURGO09BQUE7QUFFQSxNQUFBLElBQUcsT0FBQSxZQUFtQixJQUFJLENBQUMsSUFBM0I7QUFDRSxRQUFBLE9BQU8sQ0FBQyxVQUFSLENBQW1CLElBQW5CLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxjQUFVLElBQUEsS0FBQSxDQUFNLDRGQUFOLENBQVYsQ0FIRjtPQUZBO0FBQUEsTUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxVQUFaLENBQXVCLENBQUMsTUFBeEIsQ0FBK0IsQ0FBL0IsRUFBa0MsT0FBbEMsQ0FOQSxDQURGO0FBQUEsS0FEQTtXQVNBLEtBVk87RUFBQSxDQTNJVCxDQUFBOztBQUFBLG9CQTJKQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsUUFBQSx5Q0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxVQUFaLENBRlgsQ0FBQTtBQUdBO0FBQUE7U0FBQSwyQ0FBQTt1QkFBQTtBQUNFLE1BQUEsSUFBRyxLQUFLLENBQUMsV0FBTixLQUFxQixNQUF4QjtzQkFDRSxRQUFRLENBQUMsUUFBRCxDQUFSLENBQWdCLENBQWhCLEdBREY7T0FBQSxNQUFBO3NCQUdFLEtBQUssQ0FBQyxNQUFOLENBQUEsR0FIRjtPQURGO0FBQUE7b0JBSks7RUFBQSxDQTNKUCxDQUFBOztBQUFBLG9CQXlLQSxRQUFBLEdBQVUsU0FBQyxTQUFELEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLGlEQUFIO2FBQ0UsS0FERjtLQUFBLE1BQUE7YUFHRSxNQUhGO0tBRlE7RUFBQSxDQXpLVixDQUFBOztBQUFBLG9CQXFMQSxVQUFBLEdBQVksU0FBQyxRQUFELEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLFFBQUEsS0FBWSxPQUFmO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQTJCLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBckIsQ0FBQSxDQUEzQixDQUFBLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxZQUFaLENBQXlCLENBQUMsUUFBRCxDQUF6QixDQUFpQyxRQUFqQyxDQUFBLENBSEY7S0FEQTtXQUtBLEtBTlU7RUFBQSxDQXJMWixDQUFBOztBQUFBLG9CQWlNQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsUUFBQSxtQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBdkI7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFNBQVosRUFBMkIsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFyQixDQUFBLENBQTNCLENBQUEsQ0FERjtLQUFBLE1BQUE7QUFHRSxXQUFBLGdEQUFBO2tDQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxTQUFaLENBQXNCLENBQUMsUUFBRCxDQUF0QixDQUE4QixTQUE5QixDQUFBLENBREY7QUFBQSxPQUhGO0tBREE7V0FNQSxLQVBXO0VBQUEsQ0FqTWIsQ0FBQTs7QUFBQSxvQkErTUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsNEJBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsU0FBQSxnREFBQTtnQ0FBQTtBQUNFLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFNBQVosQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFHLDhCQUFIO0FBQ0UsUUFBQSxPQUFPLENBQUMsUUFBRCxDQUFQLENBQWUsU0FBZixDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0FBQSxDQUhGO09BRkY7QUFBQSxLQURBO1dBT0EsS0FSVztFQUFBLENBL01iLENBQUE7O0FBQUEsb0JBOE5BLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxDQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksVUFBWixDQUF1QixDQUFDLEdBQXhCLENBQUEsRUFGVztFQUFBLENBOU5iLENBQUE7O0FBQUEsb0JBbU9BLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixRQUFBLGtGQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsSUFBTyxpQkFBUDtBQUNFLE1BQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUNULENBQUMsR0FERyxDQUNDLFNBREQsQ0FFSixDQUFDLEtBRkcsQ0FFRyxpRkFGSCxDQUFOLENBQUE7QUFHQSxNQUFBLElBQUcsV0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBdUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLFNBQWhCLENBQXZELENBQVIsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksU0FBWixDQUF2QixDQUFSLENBSEY7T0FIQTtBQVFBO0FBQUEsV0FBQSxpQkFBQTtxQ0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFOLENBQW1CLFNBQW5CLEVBQThCLFVBQTlCLENBQUEsQ0FERjtBQUFBLE9BUkE7QUFVQTtBQUFBLFdBQUEsb0RBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUcsS0FBSyxDQUFDLFdBQU4sS0FBcUIsTUFBeEI7QUFDRSxVQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QixDQUFOLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLE1BQU4sQ0FBQSxDQUFOLENBSEY7U0FBQTtBQUFBLFFBSUEsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFOLENBQW1CLEdBQW5CLEVBQXdCLElBQXhCLENBSkEsQ0FERjtBQUFBLE9BWEY7S0FEQTtBQUFBLElBbUJBLElBQUEsR0FBTyxJQW5CUCxDQUFBO0FBcUJBLElBQUEsSUFBUSx3QkFBUjtBQUNFLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsSUFBZixDQUFBO0FBQUEsTUFDQSxrQkFBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixDQURBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFVBQVosQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxTQUFDLE1BQUQsR0FBQTtBQUM5QixZQUFBLGlFQUFBO0FBQUE7YUFBQSwrQ0FBQTs2QkFBQTtBQUNFLFVBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFFBQWpCO0FBQ0UsWUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFaLENBQUEsQ0FBVixDQUFBO0FBQUEsWUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUZyQixDQUFBO0FBR0EsWUFBQSxJQUFHLFFBQVEsQ0FBQyxNQUFULElBQW1CLEtBQUssQ0FBQyxRQUE1QjtBQUNFLGNBQUEsU0FBQSxHQUFZLElBQVosQ0FERjthQUFBLE1BQUE7QUFHRSxjQUFBLFNBQUEsR0FBWSxRQUFTLENBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBckIsQ0FIRjthQUhBO0FBQUEsMEJBUUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtxQkFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVYsQ0FBdUIsT0FBdkIsRUFBZ0MsU0FBaEMsRUFEUztZQUFBLENBQVgsRUFSQSxDQURGO1dBQUEsTUFXSyxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsUUFBakI7QUFDSCxZQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQSxLQUFLLENBQUMsUUFBTixDQUEvQixDQUFBO0FBQUEsMEJBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtxQkFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVYsQ0FBc0IsT0FBdEIsRUFEUztZQUFBLENBQVgsRUFGQSxDQURHO1dBQUEsTUFBQTtrQ0FBQTtXQVpQO0FBQUE7d0JBRDhCO01BQUEsQ0FBaEMsQ0FIQSxDQUFBO0FBQUEsTUFxQkEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksWUFBWixDQUF5QixDQUFDLE9BQTFCLENBQWtDLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLFlBQUEsa0NBQUE7QUFBQTthQUFBLCtDQUFBOzZCQUFBO0FBQ0UsVUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsS0FBZCxJQUF1QixLQUFLLENBQUMsSUFBTixLQUFjLFFBQXhDO0FBQ0UsWUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFiLENBQWlCLEtBQUssQ0FBQyxJQUF2QixDQUFULENBQUE7QUFBQSwwQkFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO3FCQUNULElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVixDQUF1QixLQUFLLENBQUMsSUFBN0IsRUFBbUMsTUFBbkMsRUFEUztZQUFBLENBQVgsRUFEQSxDQURGO1dBQUEsTUFJSyxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsUUFBakI7MEJBQ0gsVUFBQSxDQUFXLFNBQUEsR0FBQTtxQkFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQVYsQ0FBMEIsS0FBSyxDQUFDLElBQWhDLEVBRFM7WUFBQSxDQUFYLEdBREc7V0FBQSxNQUFBO2tDQUFBO1dBTFA7QUFBQTt3QkFEZ0M7TUFBQSxDQUFsQyxDQXJCQSxDQUFBO0FBQUEsTUE4QkEsVUFBQSxHQUFhLFNBQUEsR0FBQTtlQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixTQUFoQixDQUEwQixDQUFDLE9BQTNCLENBQW1DLFNBQUMsTUFBRCxHQUFBO0FBQ2pDLGNBQUEsMEJBQUE7QUFBQTtlQUFBLCtDQUFBOytCQUFBO0FBQ0UsWUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsS0FBZCxJQUF1QixLQUFLLENBQUMsSUFBTixLQUFjLFFBQXhDOzRCQUNFLFVBQUEsQ0FBVyxTQUFBLEdBQUE7dUJBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBcEIsQ0FBd0IsS0FBSyxDQUFDLElBQTlCLEVBRFM7Y0FBQSxDQUFYLEdBREY7YUFBQSxNQUdLLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxRQUFqQjs0QkFDSCxVQUFBLENBQVcsU0FBQSxHQUFBO3VCQUNULElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQXBCLENBQTJCLEtBQUssQ0FBQyxJQUFqQyxFQURTO2NBQUEsQ0FBWCxHQURHO2FBQUEsTUFBQTtvQ0FBQTthQUpQO0FBQUE7MEJBRGlDO1FBQUEsQ0FBbkMsRUFEVztNQUFBLENBOUJiLENBQUE7QUFBQSxNQXVDQSxVQUFBLENBQUEsQ0F2Q0EsQ0FBQTtBQUFBLE1Bd0NBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFlBQUEsMEJBQUE7QUFBQTthQUFBLCtDQUFBOzZCQUFBO0FBQ0UsVUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsS0FBZCxJQUF1QixLQUFLLENBQUMsSUFBTixLQUFjLFFBQXhDO0FBQ0UsWUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1Qsa0JBQUEsT0FBQTtBQUFBLGNBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFWLENBQUE7QUFDQSxjQUFBLElBQUcsQ0FBSyxlQUFMLENBQUEsSUFBa0IsT0FBQSxLQUFXLEVBQWhDO3VCQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBVixDQUEwQixPQUExQixFQURGO2VBQUEsTUFBQTt1QkFHRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVYsQ0FBdUIsT0FBdkIsRUFBZ0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQWhDLEVBSEY7ZUFGUztZQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsMEJBTUEsVUFBQSxDQUFBLEVBTkEsQ0FERjtXQUFBLE1BQUE7a0NBQUE7V0FERjtBQUFBO3dCQURjO01BQUEsQ0FBaEIsQ0F4Q0EsQ0FERjtLQXJCQTtXQXlFQSxJQUFDLENBQUEsS0ExRUs7RUFBQSxDQW5PUixDQUFBOztpQkFBQTs7R0FGeUIsSUFBSSxDQUFDLEtBeEtoQyxDQUFBOztBQUFBLHVCQXlkQSxHQUEwQixLQXpkMUIsQ0FBQTs7QUFBQSxXQTZkQSxHQUFjLEtBN2RkLENBQUE7O0FBQUEsVUE4ZEEsR0FBYSxTQUFDLENBQUQsR0FBQTtBQUNYLE1BQUEsQ0FBQTtBQUFBLEVBQUEsV0FBQSxHQUFjLElBQWQsQ0FBQTtBQUNBO0FBQ0UsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQURGO0dBQUEsY0FBQTtBQUdFLElBREksVUFDSixDQUFBO0FBQUEsSUFBQSxXQUFBLEdBQWMsS0FBZCxDQUFBO0FBQ0EsVUFBVSxJQUFBLEtBQUEsQ0FBTSxDQUFOLENBQVYsQ0FKRjtHQURBO1NBTUEsV0FBQSxHQUFjLE1BUEg7QUFBQSxDQTlkYixDQUFBOztBQUFBLE1BdWVBLEdBQVMsU0FBQyxNQUFELEVBQVMsQ0FBVCxFQUFZLE1BQVosRUFBd0MsQ0FBeEMsR0FBQTtBQUNQLE1BQUEsS0FBQTs7SUFEbUIsU0FBUyxPQUFPLENBQUM7R0FDcEM7QUFBQSxFQUFBLEtBQUEsR0FBUSxNQUFPLENBQUEsTUFBQSxDQUFmLENBQUE7U0FDQSxNQUFPLENBQUEsTUFBQSxDQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNmLElBQUEsSUFBRyxDQUFDLENBQUEsQ0FBSyxXQUFBLElBQU0scUJBQVAsQ0FBTCxDQUFBLElBQTBCLFdBQTdCO2FBQ0UsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLEVBQWtCLFNBQWxCLEVBREY7S0FBQSxNQUVLLElBQUcsbUJBQUg7YUFDSCxDQUFDLENBQUMsS0FBRixDQUFRLElBQUMsQ0FBQSxNQUFULEVBQWlCLFNBQWpCLEVBREc7S0FBQSxNQUFBO2FBR0gsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVcsU0FBWCxFQUhHO0tBSFU7RUFBQSxFQUZWO0FBQUEsQ0F2ZVQsQ0FBQTs7QUFBQSxrQkFpZkEsR0FBcUIsU0FBQSxHQUFBO0FBRW5CLE1BQUEsc0VBQUE7QUFBQSxFQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFFQSxFQUFBLElBQUcsSUFBQyxDQUFBLEtBQUQsS0FBVSxhQUFiO0FBQ0UsSUFBQSxLQUFBLEdBQVEsU0FBQyxDQUFELEdBQUE7YUFDTixJQUFJLENBQUMsUUFBTCxDQUFjLENBQWQsRUFETTtJQUFBLENBQVIsQ0FBQTtBQUFBLElBRUEsTUFBQSxDQUFPLEtBQVAsRUFBYyxLQUFkLEVBQXFCLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBM0IsRUFBc0MsSUFBdEMsQ0FGQSxDQUFBO0FBQUEsSUFJQSxRQUFBLEdBQVcsU0FBQyxDQUFELEdBQUE7YUFDVCxJQUFJLENBQUMsV0FBTCxDQUFpQixDQUFqQixFQURTO0lBQUEsQ0FKWCxDQUFBO0FBQUEsSUFPQSxNQUFBLENBQU8sUUFBUCxFQUFpQixRQUFqQixFQUEyQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQWpDLEVBQTRDLElBQTVDLENBUEEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFvQyxTQUFDLEdBQUQsR0FBQTthQUNsQyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsR0FBbkIsRUFEa0M7SUFBQSxDQUFwQyxDQVRBLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsV0FBdkIsRUFBb0MsU0FBQSxHQUFBO2FBQ2xDLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQURrQztJQUFBLENBQXBDLENBWEEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixhQUF2QixFQUFzQyxTQUFDLEdBQUQsR0FBQTtBQUVwQyxNQUFBLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FBQSxDQUFBO0FBR0EsTUFBQSxJQUFHLEdBQUEsS0FBUyxFQUFaO2VBQ0UsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUFaLEVBREY7T0FMb0M7SUFBQSxDQUF0QyxDQWJBLENBQUE7QUFBQSxJQXFCQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLGFBQXZCLEVBQXNDLFNBQUMsR0FBRCxHQUFBO0FBQ3BDLFVBQUEsc0JBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxFQUFOLENBQUE7QUFDQTtBQUFBLFdBQUEsMkNBQUE7cUJBQUE7QUFDRSxRQUFBLElBQUcsQ0FBQyxDQUFDLFdBQUYsS0FBaUIsTUFBcEI7QUFDRSxVQUFBLEdBQUEsSUFBTyxDQUFQLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxHQUFBLElBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFkLENBSEY7U0FERjtBQUFBLE9BREE7YUFNQSxJQVBvQztJQUFBLENBQXRDLENBckJBLENBREY7R0FBQSxNQStCSyxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsVUFBYjtBQUNILElBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixhQUF2QixFQUFzQyxTQUFDLEdBQUQsR0FBQTthQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsTUFBaEIsRUFBd0IsR0FBeEIsRUFEb0M7SUFBQSxDQUF0QyxDQUFBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsYUFBdkIsRUFBc0MsU0FBQyxHQUFELEdBQUE7YUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE1BQWhCLEVBRG9DO0lBQUEsQ0FBdEMsQ0FIQSxDQURHO0dBakNMO0FBd0NBLEVBQUEsSUFBRyx1QkFBSDtBQUNFLFVBQUEsQ0FERjtHQXhDQTtBQUFBLEVBMENBLHVCQUFBLEdBQTBCLElBMUMxQixDQUFBO0FBQUEsRUE4Q0EsWUFBQSxHQUFlLFNBQUMsY0FBRCxFQUFpQixZQUFqQixHQUFBO0FBQ2IsUUFBQSxxREFBQTtBQUFBLElBQUEsSUFBRyxvQkFBSDtBQUNFO0FBQUEsV0FBQSxtREFBQTtvQkFBQTtBQUNFLFFBQUEsSUFBRyxDQUFDLENBQUMsTUFBRixDQUFBLENBQUEsS0FBYyxZQUFqQjtBQUNFLFVBQUEsR0FBQSxHQUFNLENBQU4sQ0FBQTtBQUNBLGdCQUZGO1NBREY7QUFBQSxPQUFBO0FBSUEsTUFBQSxJQUFPLFdBQVA7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLHVEQUFOLENBQVYsQ0FERjtPQUxGO0tBQUEsTUFBQTtBQVFFLE1BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBYyxDQUFDLE1BQXJCLENBUkY7S0FBQTtBQUFBLElBVUEsVUFBQSxHQUFhLEVBVmIsQ0FBQTtBQVdBLElBQUEsSUFBRyxjQUFjLENBQUMsUUFBZixLQUEyQixjQUFjLENBQUMsc0JBQTdDO0FBQ0UsTUFBQSxLQUFBLEdBQVEsY0FBYyxDQUFDLFVBQXZCLENBQUE7QUFDQSxhQUFNLGFBQU4sR0FBQTtBQUNFLFFBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFdBRGQsQ0FERjtNQUFBLENBRkY7S0FBQSxNQUFBO0FBTUUsTUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixjQUFoQixDQUFBLENBTkY7S0FYQTtBQUFBLElBbUJBLE9BQUEsR0FBVSxJQW5CVixDQUFBO0FBQUEsSUFvQkEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxHQUFYLENBQWUsU0FBQyxLQUFELEdBQUE7QUFDMUIsVUFBQSxNQUFBO0FBQUEsTUFBQSxJQUFHLG9CQUFIO2VBQ0UsS0FBSyxDQUFDLE9BRFI7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFHLEtBQUssQ0FBQyxRQUFOLEtBQWtCLEtBQUssQ0FBQyxTQUEzQjtBQUNFLFVBQUEsTUFBQSxHQUFhLElBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLENBQWIsQ0FERjtTQUFBLE1BQUE7QUFHRSxVQUFBLE1BQUEsR0FBYSxJQUFBLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixDQUFiLENBSEY7U0FBQTtBQUFBLFFBSUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEIsQ0FKQSxDQUFBO2VBS0EsT0FSRjtPQUQwQjtJQUFBLENBQWYsQ0FwQmIsQ0FBQTtXQThCQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxVQUFaLENBQXVCLENBQUMsY0FBeEIsQ0FBdUMsR0FBdkMsRUFBNEMsVUFBNUMsRUEvQmE7RUFBQSxDQTlDZixDQUFBO0FBQUEsRUErRUEsTUFBQSxDQUFPLGNBQVAsRUFBdUIsWUFBdkIsQ0EvRUEsQ0FBQTtBQUFBLEVBZ0ZBLE1BQUEsQ0FBTyxhQUFQLEVBQXNCLFlBQXRCLENBaEZBLENBQUE7QUFBQSxFQWlGQSxNQUFBLENBQU8saUJBQVAsRUFBMEIsU0FBQyxJQUFELEdBQUE7V0FDeEIsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBRHdCO0VBQUEsQ0FBMUIsQ0FqRkEsQ0FBQTtBQUFBLEVBbUZBLE1BQUEsQ0FBTyxjQUFQLEVBQXVCLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtXQUNyQixJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBWSxLQUFaLEVBRHFCO0VBQUEsQ0FBdkIsQ0FuRkEsQ0FBQTtBQUFBLEVBc0ZBLFdBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtXQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBWixDQUFBLEVBRFk7RUFBQSxDQXRGZCxDQUFBO0FBQUEsRUF5RkEsTUFBQSxDQUFPLGFBQVAsRUFBc0IsV0FBdEIsQ0F6RkEsQ0FBQTtBQUFBLEVBMkZBLFlBQUEsR0FBZSxTQUFDLFlBQUQsRUFBZSxZQUFmLEdBQUE7QUFDYixJQUFBLFlBQVksQ0FBQyxJQUFiLENBQWtCLElBQWxCLEVBQXdCLFlBQXhCLEVBQXNDLFlBQXRDLENBQUEsQ0FBQTtXQUNBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQWpCLEVBQXVCLFlBQXZCLEVBRmE7RUFBQSxDQTNGZixDQUFBO0FBQUEsRUErRkEsTUFBQSxDQUFPLGNBQVAsRUFBdUIsWUFBdkIsQ0EvRkEsQ0FBQTtBQUFBLEVBaUdBLE1BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLFFBQUE7QUFBQSxJQUFBLElBQUcsaUNBQUg7YUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQWhCLENBQUE7YUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsUUFBUSxDQUFDLE1BQVQsQ0FBQSxFQURTO01BQUEsQ0FBWCxFQUpGO0tBRE87RUFBQSxDQWpHVCxDQUFBO1NBeUdBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCLE1BQWpCLEVBM0dtQjtBQUFBLENBamZyQixDQUFBOztBQThsQkEsSUFBRyxnREFBSDtBQUNFLEVBQUEsSUFBRyxnQkFBSDtBQUNFLElBQUEsSUFBRyxxQkFBSDtBQUNFLE1BQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFULEdBQWUsSUFBZixDQURGO0tBQUEsTUFBQTtBQUdFLFlBQVUsSUFBQSxLQUFBLENBQU0sK0JBQU4sQ0FBVixDQUhGO0tBREY7R0FBQSxNQUFBO0FBTUUsVUFBVSxJQUFBLEtBQUEsQ0FBTSwwQkFBTixDQUFWLENBTkY7R0FERjtDQTlsQkE7O0FBdW1CQSxJQUFHLGdEQUFIO0FBQ0UsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFqQixDQURGO0NBdm1CQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbllYbWwgPSB7fVxuXG5jbGFzcyBZWG1sLk5vZGVcbiAgY29uc3RydWN0b3I6ICgpLT5cbiAgICBAX3htbCA/PSB7fVxuXG4gIF9jaGVja0Zvck1vZGVsOiAoKS0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgaGF2ZSB0byBwdXQgdGhlIFkuXCIrQF9uYW1lKycgaW5zdGFuY2Ugb24gYSBzaGFyZWQgZWxlbWVudCBiZWZvcmUgeW91IGNhbiB1c2UgaXQhIEUuZy4gb24gdGhlIHkgb2JqZWN0IHkudmFsKFwibXktJytAX25hbWUrJ1wiLHknK0BfbmFtZSsnKSdcblxuICBfZ2V0TW9kZWw6ICgpLT5cbiAgICBpZiBAX3htbC5wYXJlbnQ/XG4gICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBAX3htbC5wYXJlbnQpXG4gICAgICBAX3NldE1vZGVsIEBfbW9kZWxcbiAgICBpZiBAX2RvbT9cbiAgICAgIEBnZXREb20oKVxuICAgIEBfbW9kZWxcblxuICBfc2V0TW9kZWw6IChAX21vZGVsKS0+XG4gICAgQF9tb2RlbC5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgaWYgZXZlbnQubmFtZSBpcyBcInBhcmVudFwiIGFuZCBldmVudC50eXBlIGlzbnQgXCJhZGRcIlxuICAgICAgICAgIHBhcmVudCA9IGV2ZW50Lm9sZFZhbHVlXG4gICAgICAgICAgY2hpbGRyZW4gPSBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpPy52YWwoKVxuICAgICAgICAgIGlmIGNoaWxkcmVuP1xuICAgICAgICAgICAgZm9yIGMsaSBpbiBjaGlsZHJlblxuICAgICAgICAgICAgICBpZiBjIGlzIEBcbiAgICAgICAgICAgICAgICBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmRlbGV0ZSBpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICBkZWxldGUgQF94bWxcblxuICBfc2V0UGFyZW50OiAocGFyZW50KS0+XG4gICAgaWYgcGFyZW50IGluc3RhbmNlb2YgWVhtbC5FbGVtZW50XG4gICAgICBpZiBAX21vZGVsP1xuICAgICAgICBAcmVtb3ZlKClcbiAgICAgICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIiwgcGFyZW50KVxuICAgICAgZWxzZVxuICAgICAgICBAX3htbC5wYXJlbnQgPSBwYXJlbnRcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJwYXJlbnQgbXVzdCBiZSBvZiB0eXBlIFkuWG1sIVwiXG5cbiNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIGFmdGVyIHRoaXMgZWxlbWVudFxuICAjIC5hZnRlcihjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFmdGVyOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIG5vdCBwYXJlbnQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIFhtbCBFbGVtZW50IG11c3Qgbm90IGhhdmUgc2libGluZ3MhIChmb3IgaXQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudClcIlxuXG4gICAgIyBmaW5kIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGVsZW1lbnRcbiAgICBmb3IgYyxwb3NpdGlvbiBpbiBwYXJlbnQuZ2V0Q2hpbGRyZW4oKVxuICAgICAgaWYgYyBpcyBAXG4gICAgICAgIGJyZWFrXG5cbiAgICBjb250ZW50cyA9IFtdXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbC5FbGVtZW50XG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAX21vZGVsLnZhbChcInBhcmVudFwiKSlcbiAgICAgIGVsc2UgaWYgY29udGVudC5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5hZnRlciBleHBlY3RzIGluc3RhbmNlcyBvZiBZWG1sLkVsZW1lbnQgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIGNvbnRlbnRzLnB1c2ggY29udGVudFxuXG4gICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnRDb250ZW50cyhwb3NpdGlvbisxLCBjb250ZW50cylcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCBhZnRlciB0aGlzIGVsZW1lbnRcbiAgIyAuYWZ0ZXIoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBiZWZvcmU6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHBhcmVudCA9IEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgaWYgbm90IHBhcmVudD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgWG1sIEVsZW1lbnQgbXVzdCBub3QgaGF2ZSBzaWJsaW5ncyEgKGZvciBpdCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50KVwiXG5cbiAgICAjIGZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgZWxlbWVudFxuICAgIGZvciBjLHBvc2l0aW9uIGluIHBhcmVudC5nZXRDaGlsZHJlbigpXG4gICAgICBpZiBjIGlzIEBcbiAgICAgICAgYnJlYWtcblxuICAgIGNvbnRlbnRzID0gW11cbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sLkVsZW1lbnRcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEBfbW9kZWwudmFsKFwicGFyZW50XCIpKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwuRWxlbWVudCBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgY29udGVudHMucHVzaCBjb250ZW50XG5cbiAgICBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzKHBvc2l0aW9uLCBjb250ZW50cylcblxuXG4gICNcbiAgIyBSZW1vdmUgdGhpcyBlbGVtZW50IGZyb20gdGhlIERPTVxuICAjIC5yZW1vdmUoKVxuICAjXG4gIHJlbW92ZTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgQF9tb2RlbC52YWwoXCJwYXJlbnRcIik/XG4gICAgICBwYXJlbnQgPSBAX21vZGVsLmRlbGV0ZShcInBhcmVudFwiKVxuICAgIEBcblxuICAjXG4gICMgR2V0IHRoZSBwYXJlbnQgb2YgdGhpcyBFbGVtZW50XG4gICMgQE5vdGU6IEV2ZXJ5IFhNTCBlbGVtZW50IGNhbiBvbmx5IGhhdmUgb25lIHBhcmVudFxuICAjIC5nZXRQYXJlbnQoKVxuICAjXG4gIGdldFBhcmVudDogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcblxuICBnZXRQb3NpdGlvbjogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBwYXJlbnQ/XG4gICAgICBmb3IgYyxpIGluIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikudmFsKClcbiAgICAgICAgaWYgYyBpcyBAXG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgaXMgbm90IGEgY2hpbGQgb2YgaXRzIHBhcmVudCAoc2hvdWxkIG5vdCBoYXBwZW4gaW4gWS5YbWwhKVwiXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG5jbGFzcyBZWG1sLlRleHQgZXh0ZW5kcyBZWG1sLk5vZGVcbiAgY29uc3RydWN0b3I6ICh0ZXh0ID0gXCJcIiktPlxuICAgIHN1cGVyKClcbiAgICBpZiB0ZXh0LmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgQF94bWwudGV4dCA9IHRleHRcbiAgICBlbHNlIGlmIHRleHQgaW5zdGFuY2VvZiB3aW5kb3cuVGV4dFxuICAgICAgQF9kb20gPSB0ZXh0XG4gICAgZWxzZSBpZiB0ZXh0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGNvbnN0cnVjdG9yIG9mIFkuWG1sLlRleHQgZXhwZWN0cyBlaXRoZXIgU3RyaW5nIG9yIGFuIERvbSBUZXh0IGVsZW1lbnQhXCJcblxuICBfZ2V0TW9kZWw6IChZLCBvcHMpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAX3htbC50ZXh0ID0gQF9kb20udGV4dENvbnRlbnRcbiAgICAgIEBfbW9kZWwgPSBuZXcgb3BzLk1hcE1hbmFnZXIoQCkuZXhlY3V0ZSgpXG4gICAgICBAX21vZGVsLnZhbChcInRleHRcIiwgQF94bWwudGV4dClcbiAgICAgIHN1cGVyXG4gICAgQF9tb2RlbFxuXG4gIF9uYW1lOiBcIlhtbC5UZXh0XCJcblxuICB0b1N0cmluZzogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgQF9tb2RlbC52YWwoXCJ0ZXh0XCIpXG5cbiAgZ2V0RG9tOiAoKS0+XG4gICAgaWYgbm90IEBfZG9tP1xuICAgICAgQF9kb20gPSBuZXcgd2luZG93LlRleHQoQF9tb2RlbC52YWwoXCJ0ZXh0XCIpKVxuICAgIGlmIG5vdCBAX2RvbS5feV94bWw/XG4gICAgICB0aGF0ID0gQFxuICAgICAgaW5pdGlhbGl6ZV9wcm94aWVzLmNhbGwgQFxuICAgICAgQF9kb20uX3lfeG1sID0gQFxuICAgICAgQF9tb2RlbC5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50Lm5hbWUgaXMgXCJ0ZXh0XCIgYW5kIChldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiKVxuICAgICAgICAgICAgbmV3X3RleHQgPSB0aGF0Ll9tb2RlbC52YWwoXCJ0ZXh0XCIpXG4gICAgICAgICAgICBpZiB0aGF0Ll9kb20uZGF0YSBpc250IG5ld190ZXh0XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5kYXRhID0gbmV3X3RleHRcbiAgICBAX2RvbVxuXG4gIHVwZGF0ZTogKCktPlxuICAgIHRoYXQgPSBAXG4gICAgaWYgdGhhdC5fbW9kZWwudmFsKFwidGV4dFwiKSBpc250IHRoYXQuX2RvbS5kYXRhXG4gICAgICB0aGF0Ll9tb2RlbC52YWwoXCJ0ZXh0XCIsIHRoYXQuX2RvbS5kYXRhKVxuICAgIHVuZGVmaW5lZFxuXG5jbGFzcyBZWG1sLkVsZW1lbnQgZXh0ZW5kcyBZWG1sLk5vZGVcblxuICBjb25zdHJ1Y3RvcjogKHRhZ19vcl9kb20sIGF0dHJpYnV0ZXMgPSB7fSktPlxuICAgIHN1cGVyKClcbiAgICBpZiBub3QgdGFnX29yX2RvbT9cbiAgICAgICMgbm9wXG4gICAgZWxzZSBpZiB0YWdfb3JfZG9tLmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgdGFnbmFtZSA9IHRhZ19vcl9kb21cbiAgICAgIEBfeG1sLmNoaWxkcmVuID0gW11cbiAgICAgICNUT0RPOiBIb3cgdG8gZm9yY2UgdGhlIHVzZXIgdG8gc3BlY2lmeSBwYXJhbWV0ZXJzP1xuICAgICAgI2lmIG5vdCB0YWduYW1lP1xuICAgICAgIyAgdGhyb3cgbmV3IEVycm9yIFwiWW91IG11c3Qgc3BlY2lmeSBhIHRhZ25hbWVcIlxuICAgICAgQF94bWwudGFnbmFtZSA9IHRhZ25hbWVcbiAgICAgIGlmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgaXNudCBPYmplY3RcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBzcGVjaWZpZWQgYXMgYSBPYmplY3RcIlxuICAgICAgZm9yIGFfbmFtZSwgYSBvZiBhdHRyaWJ1dGVzXG4gICAgICAgIGlmIGEuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIG9mIHR5cGUgU3RyaW5nIVwiXG4gICAgICBAX3htbC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlc1xuICAgICAgQF94bWwuY2xhc3NlcyA9IHt9XG4gICAgICBfY2xhc3NlcyA9IEBfeG1sLmF0dHJpYnV0ZXMuY2xhc3NcbiAgICAgIGRlbGV0ZSBAX3htbC5hdHRyaWJ1dGVzLmNsYXNzXG4gICAgICBpZiBfY2xhc3Nlcz9cbiAgICAgICAgZm9yIGNfbmFtZSwgYyBpbiBfY2xhc3Nlcy5zcGxpdChcIiBcIilcbiAgICAgICAgICBpZiBjLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEBfeG1sLmNsYXNzZXNbY19uYW1lXSA9IGNcbiAgICAgIHVuZGVmaW5lZFxuICAgIGVsc2UgaWYgdGFnX29yX2RvbSBpbnN0YW5jZW9mIHdpbmRvdz8uRWxlbWVudFxuICAgICAgQF9kb20gPSB0YWdfb3JfZG9tXG5cblxuICBfbmFtZTogXCJYbWwuRWxlbWVudFwiXG5cbiAgX2dldE1vZGVsOiAoWSwgb3BzKS0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBpZiBAX2RvbT9cbiAgICAgICAgQF94bWwudGFnbmFtZSA9IEBfZG9tLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBAX3htbC5hdHRyaWJ1dGVzID0ge31cbiAgICAgICAgQF94bWwuY2xhc3NlcyA9IHt9XG4gICAgICAgIGZvciBhdHRyaWJ1dGUgaW4gQF9kb20uYXR0cmlidXRlc1xuICAgICAgICAgIGlmIGF0dHJpYnV0ZS5uYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICAgICAgZm9yIGMgaW4gYXR0cmlidXRlLnZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICAgICAgICBAX3htbC5jbGFzc2VzW2NdID0gdHJ1ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBfeG1sLmF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlXG4gICAgICAgIEBfeG1sLmNoaWxkcmVuID0gW11cbiAgICAgICAgZm9yIGNoaWxkIGluIEBfZG9tLmNoaWxkTm9kZXNcbiAgICAgICAgICBpZiBjaGlsZC5ub2RlVHlwZSBpcyBjaGlsZC5URVhUX05PREVcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2ggbmV3IFlYbWwuVGV4dChjaGlsZClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBuZXdfeXhtbCA9IG5ldyBZWG1sLkVsZW1lbnQoY2hpbGQpXG4gICAgICAgICAgICBuZXdfeXhtbC5fc2V0UGFyZW50IEBcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2gobmV3X3l4bWwpXG4gICAgICBAX21vZGVsID0gbmV3IG9wcy5NYXBNYW5hZ2VyKEApLmV4ZWN1dGUoKVxuICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIsIG5ldyBZLk9iamVjdChAX3htbC5hdHRyaWJ1dGVzKSlcbiAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgWS5PYmplY3QoQF94bWwuY2xhc3NlcykpXG4gICAgICBAX21vZGVsLnZhbChcInRhZ25hbWVcIiwgQF94bWwudGFnbmFtZSlcbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIiwgbmV3IFkuTGlzdChAX3htbC5jaGlsZHJlbikpXG4gICAgICBpZiBAX3htbC5wYXJlbnQ/XG4gICAgICAgIEBfbW9kZWwudmFsKFwicGFyZW50XCIsIEBfeG1sLnBhcmVudClcblxuICAgICAgaWYgQF9kb20/XG4gICAgICAgIEBnZXREb20oKSAjIHR3byB3YXkgYmluZCBkb20gdG8gdGhpcyB4bWwgdHlwZVxuXG4gICAgICBzdXBlclxuXG4gICAgQF9tb2RlbFxuXG4gIHRvU3RyaW5nOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICB4bWwgPSBcIjxcIitAX21vZGVsLnZhbChcInRhZ25hbWVcIilcbiAgICBmb3IgbmFtZSwgdmFsdWUgb2YgQGF0dHIoKVxuICAgICAgeG1sICs9IFwiIFwiK25hbWUrJz1cIicrdmFsdWUrJ1wiJ1xuICAgIHhtbCArPSBcIj5cIlxuICAgIGZvciBjaGlsZCBpbiBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG4gICAgICB4bWwgKz0gY2hpbGQudG9TdHJpbmcoKVxuICAgIHhtbCArPSAnPC8nK0BfbW9kZWwudmFsKFwidGFnbmFtZVwiKSsnPidcbiAgICB4bWxcblxuICAjXG4gICMgR2V0L3NldCB0aGUgYXR0cmlidXRlKHMpIG9mIHRoaXMgZWxlbWVudC5cbiAgIyAuYXR0cigpXG4gICMgLmF0dHIobmFtZSlcbiAgIyAuYXR0cihuYW1lLCB2YWx1ZSlcbiAgI1xuICBhdHRyOiAobmFtZSwgdmFsdWUpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICBpZiB2YWx1ZS5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIG9mIHR5cGUgU3RyaW5nIVwiXG4gICAgICBpZiBuYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICBjbGFzc2VzID0gdmFsdWUuc3BsaXQoXCIgXCIpXG4gICAgICAgIGNzID0ge31cbiAgICAgICAgZm9yIGMgaW4gY2xhc3Nlc1xuICAgICAgICAgIGNzW2NdID0gdHJ1ZVxuXG4gICAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgQF9tb2RlbC5jdXN0b21fdHlwZXMuT2JqZWN0KGNzKSlcbiAgICAgIGVsc2VcbiAgICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLnZhbChuYW1lLCB2YWx1ZSlcbiAgICAgIEBcbiAgICBlbHNlIGlmIGFyZ3VtZW50cy5sZW5ndGggPiAwXG4gICAgICBpZiBuYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICBPYmplY3Qua2V5cyhAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKCkpLmpvaW4oXCIgXCIpXG4gICAgICBlbHNlXG4gICAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwobmFtZSlcbiAgICBlbHNlXG4gICAgICBhdHRycyA9IEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwoKVxuICAgICAgY2xhc3NlcyA9IE9iamVjdC5rZXlzKEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS52YWwoKSkuam9pbihcIiBcIilcbiAgICAgIGlmIGNsYXNzZXMubGVuZ3RoID4gMFxuICAgICAgICBhdHRyc1tcImNsYXNzXCJdID0gY2xhc3Nlc1xuICAgICAgYXR0cnNcblxuICAjXG4gICMgQWRkcyB0aGUgc3BlY2lmaWVkIGNsYXNzKGVzKSB0byB0aGlzIGVsZW1lbnRcbiAgI1xuICBhZGRDbGFzczogKG5hbWVzKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgbmFtZSBpbiBuYW1lcy5zcGxpdChcIiBcIilcbiAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS52YWwobmFtZSwgdHJ1ZSlcbiAgICBAXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGVuZCBvZiB0aGlzIGVsZW1lbnRcbiAgIyAuYXBwZW5kKGNvbnRlbnQgWywgY29udGVudF0pXG4gICNcbiAgYXBwZW5kOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNvbnRlbnQgPSBuZXcgWVhtbC5UZXh0KGNvbnRlbnQpXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbC5Ob2RlXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5hZnRlciBleHBlY3RzIGluc3RhbmNlcyBvZiBZWG1sLk5vZGUgKGUuZy4gRWxlbWVudCwgVGV4dCkgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikucHVzaChjb250ZW50KVxuICAgIEBcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoaXMgZWxlbWVudC5cbiAgIyAucHJlcGVuZChjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIHByZXBlbmQ6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudC5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgY29udGVudCA9IG5ldyBZWG1sLlRleHQoY29udGVudClcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sLk5vZGVcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEApXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLnByZXBlbmQgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5Ob2RlIChlLmcuIEVsZW1lbnQsIFRleHQpIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydCgwLCBjb250ZW50KVxuICAgIEBcblxuICAjXG4gICMgUmVtb3ZlIGFsbCBjaGlsZCBub2RlcyBvZiB0aGUgc2V0IG9mIG1hdGNoZWQgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxuICAjIC5lbXB0eSgpXG4gICNcbiAgZW1wdHk6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgICMgVE9ETzogZG8gaXQgbGlrZSB0aGlzIDogQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiLCBuZXcgWS5MaXN0KCkpXG4gICAgY2hpbGRyZW4gPSBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpXG4gICAgZm9yIGNoaWxkIGluIGNoaWxkcmVuLnZhbCgpXG4gICAgICBpZiBjaGlsZC5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgY2hpbGRyZW4uZGVsZXRlKDApXG4gICAgICBlbHNlXG4gICAgICAgIGNoaWxkLnJlbW92ZSgpXG5cbiAgI1xuICAjIERldGVybWluZSB3aGV0aGVyIGFueSBvZiB0aGUgbWF0Y2hlZCBlbGVtZW50cyBhcmUgYXNzaWduZWQgdGhlIGdpdmVuIGNsYXNzLlxuICAjIC5oYXNDbGFzcyhjbGFzc05hbWUpXG4gICNcbiAgaGFzQ2xhc3M6IChjbGFzc05hbWUpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS52YWwoY2xhc3NOYW1lKT9cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5cbiAgI1xuICAjIFJlbW92ZSBhbiBhdHRyaWJ1dGUgZnJvbSB0aGlzIGVsZW1lbnRcbiAgIyAucmVtb3ZlQXR0cihhdHRyTmFtZSlcbiAgI1xuICByZW1vdmVBdHRyOiAoYXR0ck5hbWUpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGF0dHJOYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikuZGVsZXRlKGF0dHJOYW1lKVxuICAgIEBcblxuICAjXG4gICMgUmVtb3ZlIGEgc2luZ2xlIGNsYXNzLCBtdWx0aXBsZSBjbGFzc2VzLCBvciBhbGwgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudFxuICAjIC5yZW1vdmVDbGFzcyhbY2xhc3NOYW1lXSlcbiAgI1xuICByZW1vdmVDbGFzczogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgYXJndW1lbnRzLmxlbmd0aCBpcyAwXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IEBfbW9kZWwuY3VzdG9tX3R5cGVzLk9iamVjdCgpKVxuICAgIGVsc2VcbiAgICAgIGZvciBjbGFzc05hbWUgaW4gYXJndW1lbnRzXG4gICAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS5kZWxldGUoY2xhc3NOYW1lKVxuICAgIEBcblxuICAjXG4gICMgQWRkIG9yIHJlbW92ZSBvbmUgb3IgbW9yZSBjbGFzc2VzIGZyb20gdGhpcyBlbGVtZW50LFxuICAjIGRlcGVuZGluZyBvbiBlaXRoZXIgdGhlIGNsYXNz4oCZcyBwcmVzZW5jZSBvciB0aGUgdmFsdWUgb2YgdGhlIHN0YXRlIGFyZ3VtZW50LlxuICAjIC50b2dnbGVDbGFzcyhbY2xhc3NOYW1lXSlcbiAgI1xuICB0b2dnbGVDbGFzczogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBhcmd1bWVudHNcbiAgICAgIGNsYXNzZXMgPSBAX21vZGVsLnZhbChcImNsYXNzZXNcIilcbiAgICAgIGlmIGNsYXNzZXMudmFsKGNsYXNzTmFtZSk/XG4gICAgICAgIGNsYXNzZXMuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICAgIGVsc2VcbiAgICAgICAgY2xhc3Nlcy52YWwoY2xhc3NOYW1lLCB0cnVlKVxuICAgIEBcblxuICAjXG4gICMgR2V0IGFsbCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBYTUwgRWxlbWVudCBhcyBhbiBBcnJheVxuICAjIEBOb3RlOiBUaGUgY2hpbGRyZW4gYXJlIGVpdGhlciBvZiB0eXBlIFkuWG1sIG9yIFN0cmluZ1xuICAjIC5nZXRDaGlsZHJlbigpXG4gICNcbiAgZ2V0Q2hpbGRyZW46ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikudmFsKClcblxuXG4gIGdldERvbTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgbm90IEBfZG9tP1xuICAgICAgc3ZnID0gdGhpcy5fbW9kZWxcbiAgICAgICAgLnZhbChcInRhZ25hbWVcIilcbiAgICAgICAgLm1hdGNoKC9nfHN2Z3xyZWN0fGxpbmV8cGF0aHxlbGxpcHNlfHRleHR8dHNwYW58ZGVmc3xzeW1ib2x8dXNlfGxpbmVhckdyYWRpZW50fHBhdHRlcm4vZylcbiAgICAgIGlmIHN2Zz9cbiAgICAgICAgQF9kb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB0aGlzLl9tb2RlbC52YWwoXCJ0YWduYW1lXCIpKVxuICAgICAgZWxzZVxuICAgICAgICBAX2RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpKVxuICAgICAgIyBzZXQgdGhlIGF0dHJpYnV0ZXMgX2FuZF8gdGhlIGNsYXNzZXMgKEBzZWUgLmF0dHIoKSlcbiAgICAgIGZvciBhdHRyX25hbWUsIGF0dHJfdmFsdWUgb2YgQGF0dHIoKVxuICAgICAgICBAX2RvbS5zZXRBdHRyaWJ1dGUgYXR0cl9uYW1lLCBhdHRyX3ZhbHVlXG4gICAgICBmb3IgY2hpbGQsaSBpbiBAZ2V0Q2hpbGRyZW4oKVxuICAgICAgICBpZiBjaGlsZC5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgICBkb20gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSBjaGlsZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZG9tID0gY2hpbGQuZ2V0RG9tKClcbiAgICAgICAgQF9kb20uaW5zZXJ0QmVmb3JlIGRvbSwgbnVsbFxuXG4gICAgdGhhdCA9IEBcblxuICAgIGlmIChub3QgQF9kb20uX3lfeG1sPylcbiAgICAgIEBfZG9tLl95X3htbCA9IEBcbiAgICAgIGluaXRpYWxpemVfcHJveGllcy5jYWxsIEBcblxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJpbnNlcnRcIlxuICAgICAgICAgICAgbmV3Tm9kZSA9IGV2ZW50LnZhbHVlLmdldERvbSgpXG4gICAgICAgICAgICAjIGV2ZW50LnZhbHVlLl9zZXRQYXJlbnQgdGhhdFxuICAgICAgICAgICAgY2hpbGRyZW4gPSB0aGF0Ll9kb20uY2hpbGROb2Rlc1xuICAgICAgICAgICAgaWYgY2hpbGRyZW4ubGVuZ3RoIDw9IGV2ZW50LnBvc2l0aW9uXG4gICAgICAgICAgICAgIHJpZ2h0Tm9kZSA9IG51bGxcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmlnaHROb2RlID0gY2hpbGRyZW5bZXZlbnQucG9zaXRpb25dXG5cbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICB0aGF0Ll9kb20uaW5zZXJ0QmVmb3JlIG5ld05vZGUsIHJpZ2h0Tm9kZVxuICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICBkZWxldGVkID0gdGhhdC5fZG9tLmNoaWxkTm9kZXNbZXZlbnQucG9zaXRpb25dXG5cbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICB0aGF0Ll9kb20ucmVtb3ZlQ2hpbGQgZGVsZXRlZFxuICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImFkZFwiIG9yIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIlxuICAgICAgICAgICAgbmV3dmFsID0gZXZlbnQub2JqZWN0LnZhbChldmVudC5uYW1lKVxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5zZXRBdHRyaWJ1dGUgZXZlbnQubmFtZSwgbmV3dmFsXG4gICAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICB0aGF0Ll9kb20ucmVtb3ZlQXR0cmlidXRlIGV2ZW50Lm5hbWVcbiAgICAgIHNldENsYXNzZXMgPSAoKS0+XG4gICAgICAgIHRoYXQuX21vZGVsLnZhbChcImNsYXNzZXNcIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImFkZFwiIG9yIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIlxuICAgICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgICB0aGF0Ll9kb20uY2xhc3NMaXN0LmFkZCBldmVudC5uYW1lICMgY2xhc3NlcyBhcmUgc3RvcmVkIGFzIHRoZSBrZXlzXG4gICAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgICB0aGF0Ll9kb20uY2xhc3NMaXN0LnJlbW92ZSBldmVudC5uYW1lXG4gICAgICBzZXRDbGFzc2VzKClcbiAgICAgIEBfbW9kZWwub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgY2xhc3NlcyA9IHRoYXQuYXR0cihcImNsYXNzXCIpXG4gICAgICAgICAgICAgIGlmIChub3QgY2xhc3Nlcz8pIG9yIGNsYXNzZXMgaXMgXCJcIlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVBdHRyaWJ1dGUgXCJjbGFzc1wiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGF0Ll9kb20uc2V0QXR0cmlidXRlIFwiY2xhc3NcIiwgdGhhdC5hdHRyKFwiY2xhc3NcIilcbiAgICAgICAgICAgIHNldENsYXNzZXMoKVxuXG4gICAgQF9kb21cblxucHJveGllc19hcmVfaW5pdGlhbGl6ZWQgPSBmYWxzZVxuIyBzb21lIGRvbSBpbXBsZW1lbnRhdGlvbnMgbWF5IGNhbGwgYW5vdGhlciBkb20ubWV0aG9kIHRoYXQgc2ltdWxhdGVzIHRoZSBiZWhhdmlvciBvZiBhbm90aGVyLlxuIyBGb3IgZXhhbXBsZSB4bWwuaW5zZXJ0Q2hpbGQoZG9tKSAsIHdpY2ggaW5zZXJ0cyBhbiBlbGVtZW50IGF0IHRoZSBlbmQsIGFuZCB4bWwuaW5zZXJ0QWZ0ZXIoZG9tLG51bGwpIHdpY2ggZG9lcyB0aGUgc2FtZVxuIyBCdXQgWSdzIHByb3h5IG1heSBiZSBjYWxsZWQgb25seSBvbmNlIVxucHJveHlfdG9rZW4gPSBmYWxzZVxuZG9udF9wcm94eSA9IChmKS0+XG4gIHByb3h5X3Rva2VuID0gdHJ1ZVxuICB0cnlcbiAgICBmKClcbiAgY2F0Y2ggZVxuICAgIHByb3h5X3Rva2VuID0gZmFsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgZVxuICBwcm94eV90b2tlbiA9IGZhbHNlXG5cbl9wcm94eSA9IChmX25hbWUsIGYsIHNvdXJjZSA9IEVsZW1lbnQucHJvdG90eXBlLCB5KS0+XG4gIG9sZF9mID0gc291cmNlW2ZfbmFtZV1cbiAgc291cmNlW2ZfbmFtZV0gPSAoKS0+XG4gICAgaWYgKG5vdCAoeT8gb3IgQF95X3htbD8pKSBvciBwcm94eV90b2tlblxuICAgICAgb2xkX2YuYXBwbHkgdGhpcywgYXJndW1lbnRzXG4gICAgZWxzZSBpZiBAX3lfeG1sP1xuICAgICAgZi5hcHBseSBAX3lfeG1sLCBhcmd1bWVudHNcbiAgICBlbHNlXG4gICAgICBmLmFwcGx5IHksIGFyZ3VtZW50c1xuXG5pbml0aWFsaXplX3Byb3hpZXMgPSAoKS0+XG5cbiAgdGhhdCA9IEBcblxuICBpZiBAX25hbWUgaXMgXCJYbWwuRWxlbWVudFwiXG4gICAgZl9hZGQgPSAoYyktPlxuICAgICAgdGhhdC5hZGRDbGFzcyBjXG4gICAgX3Byb3h5IFwiYWRkXCIsIGZfYWRkLCBAX2RvbS5jbGFzc0xpc3QsIEBcblxuICAgIGZfcmVtb3ZlID0gKGMpLT5cbiAgICAgIHRoYXQucmVtb3ZlQ2xhc3MgY1xuXG4gICAgX3Byb3h5IFwicmVtb3ZlXCIsIGZfcmVtb3ZlLCBAX2RvbS5jbGFzc0xpc3QsIEBcblxuICAgIEBfZG9tLl9fZGVmaW5lU2V0dGVyX18gJ2NsYXNzTmFtZScsICh2YWwpLT5cbiAgICAgIHRoYXQuYXR0cignY2xhc3MnLCB2YWwpXG4gICAgQF9kb20uX19kZWZpbmVHZXR0ZXJfXyAnY2xhc3NOYW1lJywgKCktPlxuICAgICAgdGhhdC5hdHRyKCdjbGFzcycpXG4gICAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAndGV4dENvbnRlbnQnLCAodmFsKS0+XG4gICAgICAjIHJlbW92ZSBhbGwgbm9kZXNcbiAgICAgIHRoYXQuZW1wdHkoKVxuXG4gICAgICAjIGluc2VydCB3b3JkIGNvbnRlbnRcbiAgICAgIGlmIHZhbCBpc250IFwiXCJcbiAgICAgICAgdGhhdC5hcHBlbmQgdmFsXG5cbiAgICBAX2RvbS5fX2RlZmluZUdldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAgIHJlcyA9IFwiXCJcbiAgICAgIGZvciBjIGluIHRoYXQuZ2V0Q2hpbGRyZW4oKVxuICAgICAgICBpZiBjLmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICAgIHJlcyArPSBjXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXMgKz0gYy5fZG9tLnRleHRDb250ZW50XG4gICAgICByZXNcblxuICBlbHNlIGlmIEBfbmFtZSBpcyBcIlhtbC5UZXh0XCJcbiAgICBAX2RvbS5fX2RlZmluZVNldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAgIHRoYXQuX21vZGVsLnZhbChcInRleHRcIiwgdmFsKVxuXG4gICAgQF9kb20uX19kZWZpbmVHZXR0ZXJfXyAndGV4dENvbnRlbnQnLCAodmFsKS0+XG4gICAgICB0aGF0Ll9tb2RlbC52YWwoXCJ0ZXh0XCIpXG5cbiAgaWYgcHJveGllc19hcmVfaW5pdGlhbGl6ZWRcbiAgICByZXR1cm5cbiAgcHJveGllc19hcmVfaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgIyB0aGUgZm9sbG93aW5nIG1ldGhvZHMgYXJlIGluaXRpYWxpemVkIG9uIHByb3RvdHlwZXMgYW5kIHRoZXJlZm9yZSB0aGV5IG5lZWQgdG8gYmUgd3JpdHRlbiBvbmx5IG9uY2UhXG5cbiAgaW5zZXJ0QmVmb3JlID0gKGluc2VydGVkTm9kZV9zLCBhZGphY2VudE5vZGUpLT5cbiAgICBpZiBhZGphY2VudE5vZGU/XG4gICAgICBmb3IgbixpIGluIEBnZXRDaGlsZHJlbigpXG4gICAgICAgIGlmIG4uZ2V0RG9tKCkgaXMgYWRqYWNlbnROb2RlXG4gICAgICAgICAgcG9zID0gaVxuICAgICAgICAgIGJyZWFrXG4gICAgICBpZiBub3QgcG9zP1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYWRqYWNlbnROb2RlIGlzIG5vdCBhIGNoaWxkIGVsZW1lbnQgb2YgdGhpcyBub2RlIVwiXG4gICAgZWxzZVxuICAgICAgcG9zID0gQGdldENoaWxkcmVuKCkubGVuZ3RoXG5cbiAgICBuZXdfY2hpbGRzID0gW11cbiAgICBpZiBpbnNlcnRlZE5vZGVfcy5ub2RlVHlwZSBpcyBpbnNlcnRlZE5vZGVfcy5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFXG4gICAgICBjaGlsZCA9IGluc2VydGVkTm9kZV9zLmZpcnN0Q2hpbGRcbiAgICAgIHdoaWxlIGNoaWxkP1xuICAgICAgICBuZXdfY2hpbGRzLnB1c2ggY2hpbGRcbiAgICAgICAgY2hpbGQgPSBjaGlsZC5uZXh0U2libGluZ1xuICAgIGVsc2VcbiAgICAgIG5ld19jaGlsZHMucHVzaCBpbnNlcnRlZE5vZGVfc1xuXG4gICAgeXBhcmVudCA9IHRoaXNcbiAgICBuZXdfY2hpbGRzID0gbmV3X2NoaWxkcy5tYXAgKGNoaWxkKS0+XG4gICAgICBpZiBjaGlsZC5feV94bWw/XG4gICAgICAgIGNoaWxkLl95X3htbFxuICAgICAgZWxzZVxuICAgICAgICBpZiBjaGlsZC5ub2RlVHlwZSA9PSBjaGlsZC5URVhUX05PREVcbiAgICAgICAgICB5Y2hpbGQgPSBuZXcgWVhtbC5UZXh0KGNoaWxkKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgeWNoaWxkID0gbmV3IFlYbWwuRWxlbWVudChjaGlsZClcbiAgICAgICAgeWNoaWxkLl9zZXRQYXJlbnQgeXBhcmVudFxuICAgICAgICB5Y2hpbGRcbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzIHBvcywgbmV3X2NoaWxkc1xuXG4gIF9wcm94eSAnaW5zZXJ0QmVmb3JlJywgaW5zZXJ0QmVmb3JlXG4gIF9wcm94eSAnYXBwZW5kQ2hpbGQnLCBpbnNlcnRCZWZvcmVcbiAgX3Byb3h5ICdyZW1vdmVBdHRyaWJ1dGUnLCAobmFtZSktPlxuICAgIEByZW1vdmVBdHRyIG5hbWVcbiAgX3Byb3h5ICdzZXRBdHRyaWJ1dGUnLCAobmFtZSwgdmFsdWUpLT5cbiAgICBAYXR0ciBuYW1lLCB2YWx1ZVxuXG4gIHJlbW92ZUNoaWxkID0gKG5vZGUpLT5cbiAgICBub2RlLl95X3htbC5yZW1vdmUoKVxuXG4gIF9wcm94eSAncmVtb3ZlQ2hpbGQnLCByZW1vdmVDaGlsZFxuXG4gIHJlcGxhY2VDaGlsZCA9IChpbnNlcnRlZE5vZGUsIHJlcGxhY2VkTm9kZSktPiAjIFRPRE86IGhhbmRsZSByZXBsYWNlIHdpdGggcmVwbGFjZSBiZWhhdmlvci4uLlxuICAgIGluc2VydEJlZm9yZS5jYWxsIHRoaXMsIGluc2VydGVkTm9kZSwgcmVwbGFjZWROb2RlXG4gICAgcmVtb3ZlQ2hpbGQuY2FsbCB0aGlzLCByZXBsYWNlZE5vZGVcblxuICBfcHJveHkgJ3JlcGxhY2VDaGlsZCcsIHJlcGxhY2VDaGlsZFxuXG4gIHJlbW92ZSA9ICgpLT5cbiAgICBpZiBAX21vZGVsLnZhbChcInBhcmVudFwiKT9cbiAgICAgIEByZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgIHRoaXNfZG9tID0gdGhpcy5fZG9tXG4gICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgdGhpc19kb20ucmVtb3ZlKClcblxuICBfcHJveHkgJ3JlbW92ZScsIHJlbW92ZVxuXG5pZiB3aW5kb3c/XG4gIGlmIHdpbmRvdy5ZP1xuICAgIGlmIHdpbmRvdy5ZLkxpc3Q/XG4gICAgICB3aW5kb3cuWS5YbWwgPSBZWG1sXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IG11c3QgZmlyc3QgaW1wb3J0IFkuTGlzdCFcIlxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IG11c3QgZmlyc3QgaW1wb3J0IFkhXCJcblxuaWYgbW9kdWxlP1xuICBtb2R1bGUuZXhwb3J0cyA9IFlYbWxcbiJdfQ==
