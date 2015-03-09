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
    if (text instanceof window.Text) {
      this._dom = text;
    } else if (text.constructor === String) {
      this._xml.text = text;
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
    var attr_name, attr_value, child, dom, i, setClasses, that, _i, _len, _ref, _ref1;
    this._checkForModel();
    if (this._dom == null) {
      this._dom = document.createElement(this._model.val("tagname"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NvZGlvL3dvcmtzcGFjZS95LXhtbC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jb2Rpby93b3Jrc3BhY2UveS14bWwvbGliL3kteG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUEsa0ZBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQUFBLEdBQU8sRUFBUCxDQUFBOztBQUFBLElBRVUsQ0FBQztBQUNJLEVBQUEsY0FBQSxHQUFBOztNQUNYLElBQUMsQ0FBQSxPQUFRO0tBREU7RUFBQSxDQUFiOztBQUFBLGlCQUdBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFPLG1CQUFQO0FBQ0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSx3QkFBQSxHQUF5QixJQUFDLENBQUEsS0FBMUIsR0FBZ0Msc0ZBQWhDLEdBQXVILElBQUMsQ0FBQSxLQUF4SCxHQUE4SCxLQUE5SCxHQUFvSSxJQUFDLENBQUEsS0FBckksR0FBMkksR0FBakosQ0FBVixDQURGO0tBRGM7RUFBQSxDQUhoQixDQUFBOztBQUFBLGlCQU9BLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxJQUFBLElBQUcsd0JBQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUE1QixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE1BQVosQ0FEQSxDQURGO0tBQUE7QUFHQSxJQUFBLElBQUcsaUJBQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQURGO0tBSEE7V0FLQSxJQUFDLENBQUEsT0FOUTtFQUFBLENBUFgsQ0FBQTs7QUFBQSxpQkFlQSxTQUFBLEdBQVcsU0FBRSxNQUFGLEdB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O0FBQUEsSUFBQSxJQUFHLGlDQUFIO2FBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFoQixDQUFBO2FBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULFFBQVEsQ0FBQyxNQUFULENBQUEsRUFEUztNQUFBLENBQVgsRUFKRjtLQURPO0VBQUEsQ0FqR1QsQ0FBQTtTQXlHQSxNQUFBLENBQU8sUUFBUCxFQUFpQixNQUFqQixFQTNHbUI7QUFBQSxDQTVlckIsQ0FBQTs7QUF5bEJBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLElBQUcsZ0JBQUg7QUFDRSxJQUFBLElBQUcscUJBQUg7QUFDRSxNQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBVCxHQUFlLElBQWYsQ0FERjtLQUFBLE1BQUE7QUFHRSxZQUFVLElBQUEsS0FBQSxDQUFNLCtCQUFOLENBQVYsQ0FIRjtLQURGO0dBQUEsTUFBQTtBQU1FLFVBQVUsSUFBQSxLQUFBLENBQU0sMEJBQU4sQ0FBVixDQU5GO0dBREY7Q0F6bEJBOztBQWttQkEsSUFBRyxnREFBSDtBQUNFLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBakIsQ0FERjtDQWxtQkEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5ZWG1sID0ge31cblxuY2xhc3MgWVhtbC5Ob2RlXG4gIGNvbnN0cnVjdG9yOiAoKS0+XG4gICAgQF94bWwgPz0ge31cblxuICBfY2hlY2tGb3JNb2RlbDogKCktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IGhhdmUgdG8gcHV0IHRoZSBZLlwiK0BfbmFtZSsnIGluc3RhbmNlIG9uIGEgc2hhcmVkIGVsZW1lbnQgYmVmb3JlIHlvdSBjYW4gdXNlIGl0ISBFLmcuIG9uIHRoZSB5IG9iamVjdCB5LnZhbChcIm15LScrQF9uYW1lKydcIix5JytAX25hbWUrJyknXG5cbiAgX2dldE1vZGVsOiAoKS0+XG4gICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIiwgQF94bWwucGFyZW50KVxuICAgICAgQF9zZXRNb2RlbCBAX21vZGVsXG4gICAgaWYgQF9kb20/XG4gICAgICBAZ2V0RG9tKClcbiAgICBAX21vZGVsXG5cbiAgX3NldE1vZGVsOiAoQF9tb2RlbCktPlxuICAgIEBfbW9kZWwub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgIGlmIGV2ZW50Lm5hbWUgaXMgXCJwYXJlbnRcIiBhbmQgZXZlbnQudHlwZSBpc250IFwiYWRkXCJcbiAgICAgICAgICBwYXJlbnQgPSBldmVudC5vbGRWYWx1ZVxuICAgICAgICAgIGNoaWxkcmVuID0gcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKT8udmFsKClcbiAgICAgICAgICBpZiBjaGlsZHJlbj9cbiAgICAgICAgICAgIGZvciBjLGkgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgICAgaWYgYyBpcyBAXG4gICAgICAgICAgICAgICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5kZWxldGUgaVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgZGVsZXRlIEBfeG1sXG5cbiAgX3NldFBhcmVudDogKHBhcmVudCktPlxuICAgIGlmIHBhcmVudCBpbnN0YW5jZW9mIFlYbWwuRWxlbWVudFxuICAgICAgaWYgQF9tb2RlbD9cbiAgICAgICAgQHJlbW92ZSgpXG4gICAgICAgIEBfbW9kZWwudmFsKFwicGFyZW50XCIsIHBhcmVudClcbiAgICAgIGVsc2VcbiAgICAgICAgQF94bWwucGFyZW50ID0gcGFyZW50XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwicGFyZW50IG11c3QgYmUgb2YgdHlwZSBZLlhtbCFcIlxuXG4jXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCBhZnRlciB0aGlzIGVsZW1lbnRcbiAgIyAuYWZ0ZXIoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBhZnRlcjogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBub3QgcGFyZW50P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBYbWwgRWxlbWVudCBtdXN0IG5vdCBoYXZlIHNpYmxpbmdzISAoZm9yIGl0IGRvZXMgbm90IGhhdmUgYSBwYXJlbnQpXCJcblxuICAgICMgZmluZCB0aGUgcG9zaXRpb24gb2YgdGhpcyBlbGVtZW50XG4gICAgZm9yIGMscG9zaXRpb24gaW4gcGFyZW50LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMgaXMgQFxuICAgICAgICBicmVha1xuXG4gICAgY29udGVudHMgPSBbXVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWwuRWxlbWVudFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQF9tb2RlbC52YWwoXCJwYXJlbnRcIikpXG4gICAgICBlbHNlIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5FbGVtZW50IG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBjb250ZW50cy5wdXNoIGNvbnRlbnRcblxuICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMocG9zaXRpb24rMSwgY29udGVudHMpXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgYWZ0ZXIgdGhpcyBlbGVtZW50XG4gICMgLmFmdGVyKGNvbnRlbnQgWywgY29udGVudF0pXG4gICNcbiAgYmVmb3JlOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIG5vdCBwYXJlbnQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIFhtbCBFbGVtZW50IG11c3Qgbm90IGhhdmUgc2libGluZ3MhIChmb3IgaXQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudClcIlxuXG4gICAgIyBmaW5kIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGVsZW1lbnRcbiAgICBmb3IgYyxwb3NpdGlvbiBpbiBwYXJlbnQuZ2V0Q2hpbGRyZW4oKVxuICAgICAgaWYgYyBpcyBAXG4gICAgICAgIGJyZWFrXG5cbiAgICBjb250ZW50cyA9IFtdXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbC5FbGVtZW50XG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAX21vZGVsLnZhbChcInBhcmVudFwiKSlcbiAgICAgIGVsc2UgaWYgY29udGVudC5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5hZnRlciBleHBlY3RzIGluc3RhbmNlcyBvZiBZWG1sLkVsZW1lbnQgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIGNvbnRlbnRzLnB1c2ggY29udGVudFxuXG4gICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnRDb250ZW50cyhwb3NpdGlvbiwgY29udGVudHMpXG5cblxuICAjXG4gICMgUmVtb3ZlIHRoaXMgZWxlbWVudCBmcm9tIHRoZSBET01cbiAgIyAucmVtb3ZlKClcbiAgI1xuICByZW1vdmU6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIEBfbW9kZWwudmFsKFwicGFyZW50XCIpP1xuICAgICAgcGFyZW50ID0gQF9tb2RlbC5kZWxldGUoXCJwYXJlbnRcIilcbiAgICBAXG5cbiAgI1xuICAjIEdldCB0aGUgcGFyZW50IG9mIHRoaXMgRWxlbWVudFxuICAjIEBOb3RlOiBFdmVyeSBYTUwgZWxlbWVudCBjYW4gb25seSBoYXZlIG9uZSBwYXJlbnRcbiAgIyAuZ2V0UGFyZW50KClcbiAgI1xuICBnZXRQYXJlbnQ6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG5cbiAgZ2V0UG9zaXRpb246ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHBhcmVudCA9IEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgaWYgcGFyZW50P1xuICAgICAgZm9yIGMsaSBpbiBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG4gICAgICAgIGlmIGMgaXMgQFxuICAgICAgICAgIHJldHVybiBpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIGlzIG5vdCBhIGNoaWxkIG9mIGl0cyBwYXJlbnQgKHNob3VsZCBub3QgaGFwcGVuIGluIFkuWG1sISlcIlxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuY2xhc3MgWVhtbC5UZXh0IGV4dGVuZHMgWVhtbC5Ob2RlXG4gIGNvbnN0cnVjdG9yOiAodGV4dCA9IFwiXCIpLT5cbiAgICBzdXBlcigpXG4gICAgaWYgdGV4dCBpbnN0YW5jZW9mIHdpbmRvdy5UZXh0XG4gICAgICBAX2RvbSA9IHRleHRcbiAgICBlbHNlIGlmIHRleHQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICBAX3htbC50ZXh0ID0gdGV4dFxuICAgIGVsc2UgaWYgdGV4dD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBjb25zdHJ1Y3RvciBvZiBZLlhtbC5UZXh0IGV4cGVjdHMgZWl0aGVyIFN0cmluZyBvciBhbiBEb20gVGV4dCBlbGVtZW50IVwiXG5cbiAgX2dldE1vZGVsOiAoWSwgb3BzKS0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBpZiBAX2RvbT9cbiAgICAgICAgQF94bWwudGV4dCA9IEBfZG9tLnRleHRDb250ZW50XG4gICAgICBAX21vZGVsID0gbmV3IG9wcy5NYXBNYW5hZ2VyKEApLmV4ZWN1dGUoKVxuICAgICAgQF9tb2RlbC52YWwoXCJ0ZXh0XCIsIEBfeG1sLnRleHQpXG4gICAgICBzdXBlclxuICAgIEBfbW9kZWxcblxuICBfbmFtZTogXCJYbWwuVGV4dFwiXG5cbiAgdG9TdHJpbmc6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIEBfbW9kZWwudmFsKFwidGV4dFwiKVxuXG4gIGdldERvbTogKCktPlxuICAgIGlmIG5vdCBAX2RvbT9cbiAgICAgIEBfZG9tID0gbmV3IHdpbmRvdy5UZXh0KEBfbW9kZWwudmFsKFwidGV4dFwiKSlcbiAgICBpZiBub3QgQF9kb20uX3lfeG1sP1xuICAgICAgdGhhdCA9IEBcbiAgICAgIGluaXRpYWxpemVfcHJveGllcy5jYWxsIEBcbiAgICAgIEBfZG9tLl95X3htbCA9IEBcbiAgICAgIEBfbW9kZWwub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC5uYW1lIGlzIFwidGV4dFwiIGFuZCAoZXZlbnQudHlwZSBpcyBcImFkZFwiIG9yIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIilcbiAgICAgICAgICAgIG5ld190ZXh0ID0gdGhhdC5fbW9kZWwudmFsKFwidGV4dFwiKVxuICAgICAgICAgICAgaWYgdGhhdC5fZG9tLmRhdGEgaXNudCBuZXdfdGV4dFxuICAgICAgICAgICAgICB0aGF0Ll9kb20uZGF0YSA9IG5ld190ZXh0XG4gICAgQF9kb21cblxuICB1cGRhdGU6ICgpLT5cbiAgICB0aGF0ID0gQFxuICAgIGlmIHRoYXQuX21vZGVsLnZhbChcInRleHRcIikgaXNudCB0aGF0Ll9kb20uZGF0YVxuICAgICAgdGhhdC5fbW9kZWwudmFsKFwidGV4dFwiLCB0aGF0Ll9kb20uZGF0YSlcbiAgICB1bmRlZmluZWRcblxuY2xhc3MgWVhtbC5FbGVtZW50IGV4dGVuZHMgWVhtbC5Ob2RlXG5cbiAgY29uc3RydWN0b3I6ICh0YWdfb3JfZG9tLCBhdHRyaWJ1dGVzID0ge30pLT5cbiAgICBzdXBlcigpXG4gICAgaWYgbm90IHRhZ19vcl9kb20/XG4gICAgICAjIG5vcFxuICAgIGVsc2UgaWYgdGFnX29yX2RvbS5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgIHRhZ25hbWUgPSB0YWdfb3JfZG9tXG4gICAgICBAX3htbC5jaGlsZHJlbiA9IFtdXG4gICAgICAjVE9ETzogSG93IHRvIGZvcmNlIHRoZSB1c2VyIHRvIHNwZWNpZnkgcGFyYW1ldGVycz9cbiAgICAgICNpZiBub3QgdGFnbmFtZT9cbiAgICAgICMgIHRocm93IG5ldyBFcnJvciBcIllvdSBtdXN0IHNwZWNpZnkgYSB0YWduYW1lXCJcbiAgICAgIEBfeG1sLnRhZ25hbWUgPSB0YWduYW1lXG4gICAgICBpZiBhdHRyaWJ1dGVzLmNvbnN0cnVjdG9yIGlzbnQgT2JqZWN0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgc3BlY2lmaWVkIGFzIGEgT2JqZWN0XCJcbiAgICAgIGZvciBhX25hbWUsIGEgb2YgYXR0cmlidXRlc1xuICAgICAgICBpZiBhLmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBvZiB0eXBlIFN0cmluZyFcIlxuICAgICAgQF94bWwuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXNcbiAgICAgIEBfeG1sLmNsYXNzZXMgPSB7fVxuICAgICAgX2NsYXNzZXMgPSBAX3htbC5hdHRyaWJ1dGVzLmNsYXNzXG4gICAgICBkZWxldGUgQF94bWwuYXR0cmlidXRlcy5jbGFzc1xuICAgICAgaWYgX2NsYXNzZXM/XG4gICAgICAgIGZvciBjX25hbWUsIGMgaW4gX2NsYXNzZXMuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgaWYgYy5sZW5ndGggPiAwXG4gICAgICAgICAgICBAX3htbC5jbGFzc2VzW2NfbmFtZV0gPSBjXG4gICAgICB1bmRlZmluZWRcbiAgICBlbHNlIGlmIHRhZ19vcl9kb20gaW5zdGFuY2VvZiB3aW5kb3c/LkVsZW1lbnRcbiAgICAgIEBfZG9tID0gdGFnX29yX2RvbVxuXG5cbiAgX25hbWU6IFwiWG1sLkVsZW1lbnRcIlxuXG4gIF9nZXRNb2RlbDogKFksIG9wcyktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgaWYgQF9kb20/XG4gICAgICAgIEBfeG1sLnRhZ25hbWUgPSBAX2RvbS50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgQF94bWwuYXR0cmlidXRlcyA9IHt9XG4gICAgICAgIEBfeG1sLmNsYXNzZXMgPSB7fVxuICAgICAgICBmb3IgYXR0cmlidXRlIGluIEBfZG9tLmF0dHJpYnV0ZXNcbiAgICAgICAgICBpZiBhdHRyaWJ1dGUubmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgICAgIGZvciBjIGluIGF0dHJpYnV0ZS52YWx1ZS5zcGxpdChcIiBcIilcbiAgICAgICAgICAgICAgQF94bWwuY2xhc3Nlc1tjXSA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAX3htbC5hdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZVxuICAgICAgICBAX3htbC5jaGlsZHJlbiA9IFtdXG4gICAgICAgIGZvciBjaGlsZCBpbiBAX2RvbS5jaGlsZE5vZGVzXG4gICAgICAgICAgaWYgY2hpbGQubm9kZVR5cGUgaXMgY2hpbGQuVEVYVF9OT0RFXG4gICAgICAgICAgICBAX3htbC5jaGlsZHJlbi5wdXNoIG5ldyBZWG1sLlRleHQoY2hpbGQpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbmV3X3l4bWwgPSBuZXcgWVhtbC5FbGVtZW50KGNoaWxkKVxuICAgICAgICAgICAgbmV3X3l4bWwuX3NldFBhcmVudCBAXG4gICAgICAgICAgICBAX3htbC5jaGlsZHJlbi5wdXNoKG5ld195eG1sKVxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiLCBuZXcgWS5PYmplY3QoQF94bWwuYXR0cmlidXRlcykpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IFkuT2JqZWN0KEBfeG1sLmNsYXNzZXMpKVxuICAgICAgQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIsIEBfeG1sLnRhZ25hbWUpXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIsIG5ldyBZLkxpc3QoQF94bWwuY2hpbGRyZW4pKVxuICAgICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBAX3htbC5wYXJlbnQpXG5cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAZ2V0RG9tKCkgIyB0d28gd2F5IGJpbmQgZG9tIHRvIHRoaXMgeG1sIHR5cGVcblxuICAgICAgc3VwZXJcblxuICAgIEBfbW9kZWxcblxuICB0b1N0cmluZzogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgeG1sID0gXCI8XCIrQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpXG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIEBhdHRyKClcbiAgICAgIHhtbCArPSBcIiBcIituYW1lKyc9XCInK3ZhbHVlKydcIidcbiAgICB4bWwgKz0gXCI+XCJcbiAgICBmb3IgY2hpbGQgaW4gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgeG1sICs9IGNoaWxkLnRvU3RyaW5nKClcbiAgICB4bWwgKz0gJzwvJytAX21vZGVsLnZhbChcInRhZ25hbWVcIikrJz4nXG4gICAgeG1sXG5cbiAgI1xuICAjIEdldC9zZXQgdGhlIGF0dHJpYnV0ZShzKSBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLmF0dHIoKVxuICAjIC5hdHRyKG5hbWUpXG4gICMgLmF0dHIobmFtZSwgdmFsdWUpXG4gICNcbiAgYXR0cjogKG5hbWUsIHZhbHVlKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgaWYgdmFsdWUuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBvZiB0eXBlIFN0cmluZyFcIlxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgY2xhc3NlcyA9IHZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICBjcyA9IHt9XG4gICAgICAgIGZvciBjIGluIGNsYXNzZXNcbiAgICAgICAgICBjc1tjXSA9IHRydWVcblxuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IEBfbW9kZWwuY3VzdG9tX3R5cGVzLk9iamVjdChjcykpXG4gICAgICBlbHNlXG4gICAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwobmFtZSwgdmFsdWUpXG4gICAgICBAXG4gICAgZWxzZSBpZiBhcmd1bWVudHMubGVuZ3RoID4gMFxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgT2JqZWN0LmtleXMoQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbCgpKS5qb2luKFwiIFwiKVxuICAgICAgZWxzZVxuICAgICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKG5hbWUpXG4gICAgZWxzZVxuICAgICAgYXR0cnMgPSBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKClcbiAgICAgIGNsYXNzZXMgPSBPYmplY3Qua2V5cyhAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKCkpLmpvaW4oXCIgXCIpXG4gICAgICBpZiBjbGFzc2VzLmxlbmd0aCA+IDBcbiAgICAgICAgYXR0cnNbXCJjbGFzc1wiXSA9IGNsYXNzZXNcbiAgICAgIGF0dHJzXG5cbiAgI1xuICAjIEFkZHMgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgdG8gdGhpcyBlbGVtZW50XG4gICNcbiAgYWRkQ2xhc3M6IChuYW1lcyktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIG5hbWUgaW4gbmFtZXMuc3BsaXQoXCIgXCIpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKG5hbWUsIHRydWUpXG4gICAgQFxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIHRvIHRoZSBlbmQgb2YgdGhpcyBlbGVtZW50XG4gICMgLmFwcGVuZChjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFwcGVuZDogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICBjb250ZW50ID0gbmV3IFlYbWwuVGV4dChjb250ZW50KVxuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWwuTm9kZVxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQClcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbC5Ob2RlIChlLmcuIEVsZW1lbnQsIFRleHQpIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnB1c2goY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLnByZXBlbmQoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBwcmVwZW5kOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNvbnRlbnQgPSBuZXcgWVhtbC5UZXh0KGNvbnRlbnQpXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbC5Ob2RlXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5wcmVwZW5kIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwuTm9kZSAoZS5nLiBFbGVtZW50LCBUZXh0KSBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnQoMCwgY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhbGwgY2hpbGQgbm9kZXMgb2YgdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzIGZyb20gdGhlIERPTS5cbiAgIyAuZW1wdHkoKVxuICAjXG4gIGVtcHR5OiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICAjIFRPRE86IGRvIGl0IGxpa2UgdGhpcyA6IEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIiwgbmV3IFkuTGlzdCgpKVxuICAgIGNoaWxkcmVuID0gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKVxuICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlbi52YWwoKVxuICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNoaWxkcmVuLmRlbGV0ZSgwKVxuICAgICAgZWxzZVxuICAgICAgICBjaGlsZC5yZW1vdmUoKVxuXG4gICNcbiAgIyBEZXRlcm1pbmUgd2hldGhlciBhbnkgb2YgdGhlIG1hdGNoZWQgZWxlbWVudHMgYXJlIGFzc2lnbmVkIHRoZSBnaXZlbiBjbGFzcy5cbiAgIyAuaGFzQ2xhc3MoY2xhc3NOYW1lKVxuICAjXG4gIGhhc0NsYXNzOiAoY2xhc3NOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKGNsYXNzTmFtZSk/XG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuXG4gICNcbiAgIyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhpcyBlbGVtZW50XG4gICMgLnJlbW92ZUF0dHIoYXR0ck5hbWUpXG4gICNcbiAgcmVtb3ZlQXR0cjogKGF0dHJOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhdHRyTmFtZSBpcyBcImNsYXNzXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgQF9tb2RlbC5jdXN0b21fdHlwZXMuT2JqZWN0KCkpXG4gICAgZWxzZVxuICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLmRlbGV0ZShhdHRyTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhIHNpbmdsZSBjbGFzcywgbXVsdGlwbGUgY2xhc3Nlcywgb3IgYWxsIGNsYXNzZXMgZnJvbSB0aGlzIGVsZW1lbnRcbiAgIyAucmVtb3ZlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgcmVtb3ZlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggaXMgMFxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBmb3IgY2xhc3NOYW1lIGluIGFyZ3VtZW50c1xuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIEFkZCBvciByZW1vdmUgb25lIG9yIG1vcmUgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudCxcbiAgIyBkZXBlbmRpbmcgb24gZWl0aGVyIHRoZSBjbGFzc+KAmXMgcHJlc2VuY2Ugb3IgdGhlIHZhbHVlIG9mIHRoZSBzdGF0ZSBhcmd1bWVudC5cbiAgIyAudG9nZ2xlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgdG9nZ2xlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBjbGFzc05hbWUgaW4gYXJndW1lbnRzXG4gICAgICBjbGFzc2VzID0gQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpXG4gICAgICBpZiBjbGFzc2VzLnZhbChjbGFzc05hbWUpP1xuICAgICAgICBjbGFzc2VzLmRlbGV0ZShjbGFzc05hbWUpXG4gICAgICBlbHNlXG4gICAgICAgIGNsYXNzZXMudmFsKGNsYXNzTmFtZSwgdHJ1ZSlcbiAgICBAXG5cbiAgI1xuICAjIEdldCBhbGwgdGhlIGNoaWxkcmVuIG9mIHRoaXMgWE1MIEVsZW1lbnQgYXMgYW4gQXJyYXlcbiAgIyBATm90ZTogVGhlIGNoaWxkcmVuIGFyZSBlaXRoZXIgb2YgdHlwZSBZLlhtbCBvciBTdHJpbmdcbiAgIyAuZ2V0Q2hpbGRyZW4oKVxuICAjXG4gIGdldENoaWxkcmVuOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG5cblxuICBnZXREb206ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIG5vdCBAX2RvbT9cbiAgICAgIEBfZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAX21vZGVsLnZhbChcInRhZ25hbWVcIikpXG5cbiAgICAgICMgc2V0IHRoZSBhdHRyaWJ1dGVzIF9hbmRfIHRoZSBjbGFzc2VzIChAc2VlIC5hdHRyKCkpXG4gICAgICBmb3IgYXR0cl9uYW1lLCBhdHRyX3ZhbHVlIG9mIEBhdHRyKClcbiAgICAgICAgQF9kb20uc2V0QXR0cmlidXRlIGF0dHJfbmFtZSwgYXR0cl92YWx1ZVxuICAgICAgZm9yIGNoaWxkLGkgaW4gQGdldENoaWxkcmVuKClcbiAgICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgICAgZG9tID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUgY2hpbGRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRvbSA9IGNoaWxkLmdldERvbSgpXG4gICAgICAgIEBfZG9tLmluc2VydEJlZm9yZSBkb20sIG51bGxcblxuICAgIHRoYXQgPSBAXG5cbiAgICBpZiAobm90IEBfZG9tLl95X3htbD8pXG4gICAgICBAX2RvbS5feV94bWwgPSBAXG4gICAgICBpbml0aWFsaXplX3Byb3hpZXMuY2FsbCBAXG5cbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiaW5zZXJ0XCJcbiAgICAgICAgICAgIG5ld05vZGUgPSBldmVudC52YWx1ZS5nZXREb20oKVxuICAgICAgICAgICAgIyBldmVudC52YWx1ZS5fc2V0UGFyZW50IHRoYXRcbiAgICAgICAgICAgIGNoaWxkcmVuID0gdGhhdC5fZG9tLmNoaWxkTm9kZXNcbiAgICAgICAgICAgIGlmIGNoaWxkcmVuLmxlbmd0aCA8PSBldmVudC5wb3NpdGlvblxuICAgICAgICAgICAgICByaWdodE5vZGUgPSBudWxsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJpZ2h0Tm9kZSA9IGNoaWxkcmVuW2V2ZW50LnBvc2l0aW9uXVxuXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLmluc2VydEJlZm9yZSBuZXdOb2RlLCByaWdodE5vZGVcbiAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgZGVsZXRlZCA9IHRoYXQuX2RvbS5jaGlsZE5vZGVzW2V2ZW50LnBvc2l0aW9uXVxuXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUNoaWxkIGRlbGV0ZWRcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgIG5ld3ZhbCA9IGV2ZW50Lm9iamVjdC52YWwoZXZlbnQubmFtZSlcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICB0aGF0Ll9kb20uc2V0QXR0cmlidXRlIGV2ZW50Lm5hbWUsIG5ld3ZhbFxuICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUF0dHJpYnV0ZSBldmVudC5uYW1lXG4gICAgICBzZXRDbGFzc2VzID0gKCktPlxuICAgICAgICB0aGF0Ll9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLmNsYXNzTGlzdC5hZGQgZXZlbnQubmFtZSAjIGNsYXNzZXMgYXJlIHN0b3JlZCBhcyB0aGUga2V5c1xuICAgICAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLmNsYXNzTGlzdC5yZW1vdmUgZXZlbnQubmFtZVxuICAgICAgc2V0Q2xhc3NlcygpXG4gICAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImFkZFwiIG9yIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIlxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIGNsYXNzZXMgPSB0aGF0LmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgICBpZiAobm90IGNsYXNzZXM/KSBvciBjbGFzc2VzIGlzIFwiXCJcbiAgICAgICAgICAgICAgICB0aGF0Ll9kb20ucmVtb3ZlQXR0cmlidXRlIFwiY2xhc3NcIlxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLnNldEF0dHJpYnV0ZSBcImNsYXNzXCIsIHRoYXQuYXR0cihcImNsYXNzXCIpXG4gICAgICAgICAgICBzZXRDbGFzc2VzKClcblxuICAgIEBfZG9tXG5cbnByb3hpZXNfYXJlX2luaXRpYWxpemVkID0gZmFsc2VcbiMgc29tZSBkb20gaW1wbGVtZW50YXRpb25zIG1heSBjYWxsIGFub3RoZXIgZG9tLm1ldGhvZCB0aGF0IHNpbXVsYXRlcyB0aGUgYmVoYXZpb3Igb2YgYW5vdGhlci5cbiMgRm9yIGV4YW1wbGUgeG1sLmluc2VydENoaWxkKGRvbSkgLCB3aWNoIGluc2VydHMgYW4gZWxlbWVudCBhdCB0aGUgZW5kLCBhbmQgeG1sLmluc2VydEFmdGVyKGRvbSxudWxsKSB3aWNoIGRvZXMgdGhlIHNhbWVcbiMgQnV0IFkncyBwcm94eSBtYXkgYmUgY2FsbGVkIG9ubHkgb25jZSFcbnByb3h5X3Rva2VuID0gZmFsc2VcbmRvbnRfcHJveHkgPSAoZiktPlxuICBwcm94eV90b2tlbiA9IHRydWVcbiAgdHJ5XG4gICAgZigpXG4gIGNhdGNoIGVcbiAgICBwcm94eV90b2tlbiA9IGZhbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yIGVcbiAgcHJveHlfdG9rZW4gPSBmYWxzZVxuXG5fcHJveHkgPSAoZl9uYW1lLCBmLCBzb3VyY2UgPSBFbGVtZW50LnByb3RvdHlwZSwgeSktPlxuICBvbGRfZiA9IHNvdXJjZVtmX25hbWVdXG4gIHNvdXJjZVtmX25hbWVdID0gKCktPlxuICAgIGlmIChub3QgKHk/IG9yIEBfeV94bWw/KSkgb3IgcHJveHlfdG9rZW5cbiAgICAgIG9sZF9mLmFwcGx5IHRoaXMsIGFyZ3VtZW50c1xuICAgIGVsc2UgaWYgQF95X3htbD9cbiAgICAgIGYuYXBwbHkgQF95X3htbCwgYXJndW1lbnRzXG4gICAgZWxzZVxuICAgICAgZi5hcHBseSB5LCBhcmd1bWVudHNcblxuaW5pdGlhbGl6ZV9wcm94aWVzID0gKCktPlxuXG4gIHRoYXQgPSBAXG5cbiAgaWYgQF9uYW1lIGlzIFwiWG1sLkVsZW1lbnRcIlxuICAgIGZfYWRkID0gKGMpLT5cbiAgICAgIHRoYXQuYWRkQ2xhc3MgY1xuICAgIF9wcm94eSBcImFkZFwiLCBmX2FkZCwgQF9kb20uY2xhc3NMaXN0LCBAXG5cbiAgICBmX3JlbW92ZSA9IChjKS0+XG4gICAgICB0aGF0LnJlbW92ZUNsYXNzIGNcblxuICAgIF9wcm94eSBcInJlbW92ZVwiLCBmX3JlbW92ZSwgQF9kb20uY2xhc3NMaXN0LCBAXG5cbiAgICBAX2RvbS5fX2RlZmluZVNldHRlcl9fICdjbGFzc05hbWUnLCAodmFsKS0+XG4gICAgICB0aGF0LmF0dHIoJ2NsYXNzJywgdmFsKVxuICAgIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ2NsYXNzTmFtZScsICgpLT5cbiAgICAgIHRoYXQuYXR0cignY2xhc3MnKVxuICAgIEBfZG9tLl9fZGVmaW5lU2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgICAgIyByZW1vdmUgYWxsIG5vZGVzXG4gICAgICB0aGF0LmVtcHR5KClcblxuICAgICAgIyBpbnNlcnQgd29yZCBjb250ZW50XG4gICAgICBpZiB2YWwgaXNudCBcIlwiXG4gICAgICAgIHRoYXQuYXBwZW5kIHZhbFxuXG4gICAgQF9kb20uX19kZWZpbmVHZXR0ZXJfXyAndGV4dENvbnRlbnQnLCAodmFsKS0+XG4gICAgICByZXMgPSBcIlwiXG4gICAgICBmb3IgYyBpbiB0aGF0LmdldENoaWxkcmVuKClcbiAgICAgICAgaWYgYy5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgICByZXMgKz0gY1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzICs9IGMuX2RvbS50ZXh0Q29udGVudFxuICAgICAgcmVzXG5cbiAgZWxzZSBpZiBAX25hbWUgaXMgXCJYbWwuVGV4dFwiXG4gICAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAndGV4dENvbnRlbnQnLCAodmFsKS0+XG4gICAgICB0aGF0Ll9tb2RlbC52YWwoXCJ0ZXh0XCIsIHZhbClcblxuICAgIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgICAgdGhhdC5fbW9kZWwudmFsKFwidGV4dFwiKVxuXG4gIGlmIHByb3hpZXNfYXJlX2luaXRpYWxpemVkXG4gICAgcmV0dXJuXG4gIHByb3hpZXNfYXJlX2luaXRpYWxpemVkID0gdHJ1ZVxuXG4gICMgdGhlIGZvbGxvd2luZyBtZXRob2RzIGFyZSBpbml0aWFsaXplZCBvbiBwcm90b3R5cGVzIGFuZCB0aGVyZWZvcmUgdGhleSBuZWVkIHRvIGJlIHdyaXR0ZW4gb25seSBvbmNlIVxuXG4gIGluc2VydEJlZm9yZSA9IChpbnNlcnRlZE5vZGVfcywgYWRqYWNlbnROb2RlKS0+XG4gICAgaWYgYWRqYWNlbnROb2RlP1xuICAgICAgZm9yIG4saSBpbiBAZ2V0Q2hpbGRyZW4oKVxuICAgICAgICBpZiBuLmdldERvbSgpIGlzIGFkamFjZW50Tm9kZVxuICAgICAgICAgIHBvcyA9IGlcbiAgICAgICAgICBicmVha1xuICAgICAgaWYgbm90IHBvcz9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGFkamFjZW50Tm9kZSBpcyBub3QgYSBjaGlsZCBlbGVtZW50IG9mIHRoaXMgbm9kZSFcIlxuICAgIGVsc2VcbiAgICAgIHBvcyA9IEBnZXRDaGlsZHJlbigpLmxlbmd0aFxuXG4gICAgbmV3X2NoaWxkcyA9IFtdXG4gICAgaWYgaW5zZXJ0ZWROb2RlX3Mubm9kZVR5cGUgaXMgaW5zZXJ0ZWROb2RlX3MuRE9DVU1FTlRfRlJBR01FTlRfTk9ERVxuICAgICAgY2hpbGQgPSBpbnNlcnRlZE5vZGVfcy5maXJzdENoaWxkXG4gICAgICB3aGlsZSBjaGlsZD9cbiAgICAgICAgbmV3X2NoaWxkcy5wdXNoIGNoaWxkXG4gICAgICAgIGNoaWxkID0gY2hpbGQubmV4dFNpYmxpbmdcbiAgICBlbHNlXG4gICAgICBuZXdfY2hpbGRzLnB1c2ggaW5zZXJ0ZWROb2RlX3NcblxuICAgIHlwYXJlbnQgPSB0aGlzXG4gICAgbmV3X2NoaWxkcyA9IG5ld19jaGlsZHMubWFwIChjaGlsZCktPlxuICAgICAgaWYgY2hpbGQuX3lfeG1sP1xuICAgICAgICBjaGlsZC5feV94bWxcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgY2hpbGQubm9kZVR5cGUgPT0gY2hpbGQuVEVYVF9OT0RFXG4gICAgICAgICAgeWNoaWxkID0gbmV3IFlYbWwuVGV4dChjaGlsZClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHljaGlsZCA9IG5ldyBZWG1sLkVsZW1lbnQoY2hpbGQpXG4gICAgICAgIHljaGlsZC5fc2V0UGFyZW50IHlwYXJlbnRcbiAgICAgICAgeWNoaWxkXG4gICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnRDb250ZW50cyBwb3MsIG5ld19jaGlsZHNcblxuICBfcHJveHkgJ2luc2VydEJlZm9yZScsIGluc2VydEJlZm9yZVxuICBfcHJveHkgJ2FwcGVuZENoaWxkJywgaW5zZXJ0QmVmb3JlXG4gIF9wcm94eSAncmVtb3ZlQXR0cmlidXRlJywgKG5hbWUpLT5cbiAgICBAcmVtb3ZlQXR0ciBuYW1lXG4gIF9wcm94eSAnc2V0QXR0cmlidXRlJywgKG5hbWUsIHZhbHVlKS0+XG4gICAgQGF0dHIgbmFtZSwgdmFsdWVcblxuICByZW1vdmVDaGlsZCA9IChub2RlKS0+XG4gICAgbm9kZS5feV94bWwucmVtb3ZlKClcblxuICBfcHJveHkgJ3JlbW92ZUNoaWxkJywgcmVtb3ZlQ2hpbGRcblxuICByZXBsYWNlQ2hpbGQgPSAoaW5zZXJ0ZWROb2RlLCByZXBsYWNlZE5vZGUpLT4gIyBUT0RPOiBoYW5kbGUgcmVwbGFjZSB3aXRoIHJlcGxhY2UgYmVoYXZpb3IuLi5cbiAgICBpbnNlcnRCZWZvcmUuY2FsbCB0aGlzLCBpbnNlcnRlZE5vZGUsIHJlcGxhY2VkTm9kZVxuICAgIHJlbW92ZUNoaWxkLmNhbGwgdGhpcywgcmVwbGFjZWROb2RlXG5cbiAgX3Byb3h5ICdyZXBsYWNlQ2hpbGQnLCByZXBsYWNlQ2hpbGRcblxuICByZW1vdmUgPSAoKS0+XG4gICAgaWYgQF9tb2RlbC52YWwoXCJwYXJlbnRcIik/XG4gICAgICBAcmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICB0aGlzX2RvbSA9IHRoaXMuX2RvbVxuICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgIHRoaXNfZG9tLnJlbW92ZSgpXG5cbiAgX3Byb3h5ICdyZW1vdmUnLCByZW1vdmVcblxuaWYgd2luZG93P1xuICBpZiB3aW5kb3cuWT9cbiAgICBpZiB3aW5kb3cuWS5MaXN0P1xuICAgICAgd2luZG93LlkuWG1sID0gWVhtbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIllvdSBtdXN0IGZpcnN0IGltcG9ydCBZLkxpc3QhXCJcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBcIllvdSBtdXN0IGZpcnN0IGltcG9ydCBZIVwiXG5cbmlmIG1vZHVsZT9cbiAgbW9kdWxlLmV4cG9ydHMgPSBZWG1sXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
