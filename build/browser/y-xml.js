(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var YXml, dont_proxy, initialize_proxies, proxies_are_initialized, proxy_token, _proxy;

YXml = (function() {
  function YXml(tag_or_dom, attributes) {
    var a, a_name, c, c_name, tagname, _classes, _i, _len, _ref;
    if (attributes == null) {
      attributes = {};
    }
    if (tag_or_dom == null) {
      this._xml = {};
    } else if (tag_or_dom.constructor === String) {
      tagname = tag_or_dom;
      this._xml = {};
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
    } else if (tag_or_dom instanceof Element) {
      this._dom = tag_or_dom;
      this._xml = {};
    }
  }

  YXml.prototype._checkForModel = function() {
    if (this._model == null) {
      throw new Error("You have to put the Y." + this._name + ' instance on a shared element before you can use it! E.g. on the y object y.val("my-' + this._name + '",y' + this._name + ')');
    }
  };

  YXml.prototype._name = "Xml";

  YXml.prototype._getModel = function(Y, ops) {
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
            this._xml.children.push(child.textContent);
          } else {
            new_yxml = new YXml(child);
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
      this._setModel(this._model);
    }
    return this._model;
  };

  YXml.prototype._setModel = function(_model) {
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

  YXml.prototype._setParent = function(parent) {
    if (parent instanceof YXml) {
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

  YXml.prototype.toString = function() {
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

  YXml.prototype.attr = function(name, value) {
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

  YXml.prototype.addClass = function(names) {
    var name, _i, _len, _ref;
    this._checkForModel();
    _ref = names.split(" ");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      this._model.val("classes").val(name, true);
    }
    return this;
  };

  YXml.prototype.after = function() {
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
      if (content instanceof YXml) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position + 1, contents);
  };

  YXml.prototype.before = function() {
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
      if (content instanceof YXml) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position, contents);
  };

  YXml.prototype.append = function() {
    var content, _i, _len;
    this._checkForModel();
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      content = arguments[_i];
      if (content instanceof YXml) {
        content._setParent(this);
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      this._model.val("children").push(content);
    }
    return this;
  };

  YXml.prototype.prepend = function() {
    var content, _i, _len;
    this._checkForModel();
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      content = arguments[_i];
      if (content instanceof YXml) {
        content._setParent(this);
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      this._model.val("children").insert(0, content);
    }
    return this;
  };

  YXml.prototype.empty = function() {
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

  YXml.prototype.hasClass = function(className) {
    this._checkForModel();
    if (this._model.val("classes").val(className) != null) {
      return true;
    } else {
      return false;
    }
  };

  YXml.prototype.remove = function() {
    var parent;
    this._checkForModel();
    if (this._model.val("parent") != null) {
      parent = this._model["delete"]("parent");
    }
    return this;
  };

  YXml.prototype.removeAttr = function(attrName) {
    this._checkForModel();
    if (attrName === "class") {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      this._model.val("attributes")["delete"](attrName);
    }
    return this;
  };

  YXml.prototype.removeClass = function() {
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

  YXml.prototype.toggleClass = function() {
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

  YXml.prototype.getParent = function() {
    this._checkForModel();
    return this._model.val("parent");
  };

  YXml.prototype.getChildren = function() {
    this._checkForModel();
    return this._model.val("children").val();
  };

  YXml.prototype.getPosition = function() {
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

  YXml.prototype.getDom = function() {
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
            if (event.value.constructor === String) {
              newNode = document.createTextNode(event.value);
            } else {
              newNode = event.value.getDom();
            }
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

  return YXml;

})();

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
  if (proxies_are_initialized) {
    return;
  }
  proxies_are_initialized = true;
  insertBefore = function(insertedNode_s, adjacentNode) {
    var child, i, n, new_childs, pos, yparent, _i, _len, _ref;
    if (adjacentNode != null) {
      _ref = this._dom.childNodes;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        n = _ref[i];
        if (n === adjacentNode) {
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
      } else if (child.nodeType === child.TEXT_NODE) {
        return child.textContent;
      } else {
        ychild = new YXml(child);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NvZGlvL3dvcmtzcGFjZS95LXhtbC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jb2Rpby93b3Jrc3BhY2UveS14bWwvbGliL3kteG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0ZBQUE7O0FBQUE7QUFFZSxFQUFBLGNBQUMsVUFBRCxFQUFhLFVBQWIsR0FBQTtBQUNYLFFBQUEsdURBQUE7O01BRHdCLGFBQWE7S0FDckM7QUFBQSxJQUFBLElBQU8sa0JBQVA7QUFDRSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBUixDQURGO0tBQUEsTUFHSyxJQUFHLFVBQVUsQ0FBQyxXQUFYLEtBQTBCLE1BQTdCO0FBQ0gsTUFBQSxPQUFBLEdBQVUsVUFBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLEVBRFIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLEdBQWlCLEVBRmpCLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQixPQU5oQixDQUFBO0FBT0EsTUFBQSxJQUFHLFVBQVUsQ0FBQyxXQUFYLEtBQTRCLE1BQS9CO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSw4Q0FBTixDQUFWLENBREY7T0FQQTtBQVNBLFdBQUEsb0JBQUE7K0JBQUE7QUFDRSxRQUFBLElBQUcsQ0FBQyxDQUFDLFdBQUYsS0FBbUIsTUFBdEI7QUFDRSxnQkFBVSxJQUFBLEtBQUEsQ0FBTSx3Q0FBTixDQUFWLENBREY7U0FERjtBQUFBLE9BVEE7QUFBQSxNQVlBLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixHQUFtQixVQVpuQixDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0IsRUFiaEIsQ0FB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QSxJQUFHLHFCQUFIO0FBQ0UsTUFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQVQsR0FBZSxJQUFmLENBREY7S0FBQSxNQUFBO0FBR0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSwrQkFBTixDQUFWLENBSEY7S0FERjtHQUFBLE1BQUE7QUFNRSxVQUFVLElBQUEsS0FBQSxDQUFNLDBCQUFOLENBQVYsQ0FORjtHQURGO0NBOWdCQTs7QUF1aEJBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQWpCLENBREY7Q0F2aEJBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIFlYbWxcblxuICBjb25zdHJ1Y3RvcjogKHRhZ19vcl9kb20sIGF0dHJpYnV0ZXMgPSB7fSktPlxuICAgIGlmIG5vdCB0YWdfb3JfZG9tP1xuICAgICAgQF94bWwgPSB7fVxuICAgICAgIyBub3BcbiAgICBlbHNlIGlmIHRhZ19vcl9kb20uY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICB0YWduYW1lID0gdGFnX29yX2RvbVxuICAgICAgQF94bWwgPSB7fVxuICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgI1RPRE86IEhvdyB0byBmb3JjZSB0aGUgdXNlciB0byBzcGVjaWZ5IHBhcmFtZXRlcnM/XG4gICAgICAjaWYgbm90IHRhZ25hbWU/XG4gICAgICAjICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBzcGVjaWZ5IGEgdGFnbmFtZVwiXG4gICAgICBAX3htbC50YWduYW1lID0gdGFnbmFtZVxuICAgICAgaWYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciBpc250IE9iamVjdFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIHNwZWNpZmllZCBhcyBhIE9iamVjdFwiXG4gICAgICBmb3IgYV9uYW1lLCBhIG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgaWYgYS5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgb2YgdHlwZSBTdHJpbmchXCJcbiAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzXG4gICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgIF9jbGFzc2VzID0gQF94bWwuYXR0cmlidXRlcy5jbGFzc1xuICAgICAgZGVsZXRlIEBfeG1sLmF0dHJpYnV0ZXMuY2xhc3NcbiAgICAgIGlmIF9jbGFzc2VzP1xuICAgICAgICBmb3IgY19uYW1lLCBjIGluIF9jbGFzc2VzLnNwbGl0KFwiIFwiKVxuICAgICAgICAgIGlmIGMubGVuZ3RoID4gMFxuICAgICAgICAgICAgQF94bWwuY2xhc3Nlc1tjX25hbWVdID0gY1xuICAgICAgdW5kZWZpbmVkXG4gICAgZWxzZSBpZiB0YWdfb3JfZG9tIGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgQF9kb20gPSB0YWdfb3JfZG9tXG4gICAgICBAX3htbCA9IHt9XG5cbiAgX2NoZWNrRm9yTW9kZWw6ICgpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIllvdSBoYXZlIHRvIHB1dCB0aGUgWS5cIitAX25hbWUrJyBpbnN0YW5jZSBvbiBhIHNoYXJlZCBlbGVtZW50IGJlZm9yZSB5b3UgY2FuIHVzZSBpdCEgRS5nLiBvbiB0aGUgeSBvYmplY3QgeS52YWwoXCJteS0nK0BfbmFtZSsnXCIseScrQF9uYW1lKycpJ1xuXG4gIF9uYW1lOiBcIlhtbFwiXG5cbiAgX2dldE1vZGVsOiAoWSwgb3BzKS0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBpZiBAX2RvbT9cbiAgICAgICAgQF94bWwudGFnbmFtZSA9IEBfZG9tLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBAX3htbC5hdHRyaWJ1dGVzID0ge31cbiAgICAgICAgQF94bWwuY2xhc3NlcyA9IHt9XG4gICAgICAgIGZvciBhdHRyaWJ1dGUgaW4gQF9kb20uYXR0cmlidXRlc1xuICAgICAgICAgIGlmIGF0dHJpYnV0ZS5uYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICAgICAgZm9yIGMgaW4gYXR0cmlidXRlLnZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICAgICAgICBAX3htbC5jbGFzc2VzW2NdID0gdHJ1ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBfeG1sLmF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlXG4gICAgICAgIEBfeG1sLmNoaWxkcmVuID0gW11cbiAgICAgICAgZm9yIGNoaWxkIGluIEBfZG9tLmNoaWxkTm9kZXNcbiAgICAgICAgICBpZiBjaGlsZC5ub2RlVHlwZSBpcyBjaGlsZC5URVhUX05PREVcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2ggY2hpbGQudGV4dENvbnRlbnRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBuZXdfeXhtbCA9IG5ldyBZWG1sKGNoaWxkKVxuICAgICAgICAgICAgbmV3X3l4bWwuX3NldFBhcmVudCBAXG4gICAgICAgICAgICBAX3htbC5jaGlsZHJlbi5wdXNoKG5ld195eG1sKVxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiLCBuZXcgWS5PYmplY3QoQF94bWwuYXR0cmlidXRlcykpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IFkuT2JqZWN0KEBfeG1sLmNsYXNzZXMpKVxuICAgICAgQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIsIEBfeG1sLnRhZ25hbWUpXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIsIG5ldyBZLkxpc3QoQF94bWwuY2hpbGRyZW4pKVxuICAgICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBAX3htbC5wYXJlbnQpXG5cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAZ2V0RG9tKCkgIyB0d28gd2F5IGJpbmQgZG9tIHRvIHRoaXMgeG1sIHR5cGVcblxuICAgICAgQF9zZXRNb2RlbCBAX21vZGVsXG5cbiAgICBAX21vZGVsXG5cbiAgX3NldE1vZGVsOiAoQF9tb2RlbCktPlxuICAgIEBfbW9kZWwub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgIGlmIGV2ZW50Lm5hbWUgaXMgXCJwYXJlbnRcIiBhbmQgZXZlbnQudHlwZSBpc250IFwiYWRkXCJcbiAgICAgICAgICBwYXJlbnQgPSBldmVudC5vbGRWYWx1ZVxuICAgICAgICAgIGNoaWxkcmVuID0gcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKT8udmFsKClcbiAgICAgICAgICBpZiBjaGlsZHJlbj9cbiAgICAgICAgICAgIGZvciBjLGkgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgICAgaWYgYyBpcyBAXG4gICAgICAgICAgICAgICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5kZWxldGUgaVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgZGVsZXRlIEBfeG1sXG5cbiAgX3NldFBhcmVudDogKHBhcmVudCktPlxuICAgIGlmIHBhcmVudCBpbnN0YW5jZW9mIFlYbWxcbiAgICAgIGlmIEBfbW9kZWw/XG4gICAgICAgIEByZW1vdmUoKVxuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBwYXJlbnQpXG4gICAgICBlbHNlXG4gICAgICAgIEBfeG1sLnBhcmVudCA9IHBhcmVudFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcInBhcmVudCBtdXN0IGJlIG9mIHR5cGUgWS5YbWwhXCJcblxuICB0b1N0cmluZzogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgeG1sID0gXCI8XCIrQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpXG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIEBhdHRyKClcbiAgICAgIHhtbCArPSBcIiBcIituYW1lKyc9XCInK3ZhbHVlKydcIidcbiAgICB4bWwgKz0gXCI+XCJcbiAgICBmb3IgY2hpbGQgaW4gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgeG1sICs9IGNoaWxkLnRvU3RyaW5nKClcbiAgICB4bWwgKz0gJzwvJytAX21vZGVsLnZhbChcInRhZ25hbWVcIikrJz4nXG4gICAgeG1sXG5cbiAgI1xuICAjIEdldC9zZXQgdGhlIGF0dHJpYnV0ZShzKSBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLmF0dHIoKVxuICAjIC5hdHRyKG5hbWUpXG4gICMgLmF0dHIobmFtZSwgdmFsdWUpXG4gICNcbiAgYXR0cjogKG5hbWUsIHZhbHVlKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgaWYgdmFsdWUuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBvZiB0eXBlIFN0cmluZyFcIlxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgY2xhc3NlcyA9IHZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICBjcyA9IHt9XG4gICAgICAgIGZvciBjIGluIGNsYXNzZXNcbiAgICAgICAgICBjc1tjXSA9IHRydWVcblxuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IEBfbW9kZWwuY3VzdG9tX3R5cGVzLk9iamVjdChjcykpXG4gICAgICBlbHNlXG4gICAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwobmFtZSwgdmFsdWUpXG4gICAgICBAXG4gICAgZWxzZSBpZiBhcmd1bWVudHMubGVuZ3RoID4gMFxuICAgICAgaWYgbmFtZSBpcyBcImNsYXNzXCJcbiAgICAgICAgT2JqZWN0LmtleXMoQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbCgpKS5qb2luKFwiIFwiKVxuICAgICAgZWxzZVxuICAgICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKG5hbWUpXG4gICAgZWxzZVxuICAgICAgYXR0cnMgPSBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKClcbiAgICAgIGNsYXNzZXMgPSBPYmplY3Qua2V5cyhAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKCkpLmpvaW4oXCIgXCIpXG4gICAgICBpZiBjbGFzc2VzLmxlbmd0aCA+IDBcbiAgICAgICAgYXR0cnNbXCJjbGFzc1wiXSA9IGNsYXNzZXNcbiAgICAgIGF0dHJzXG5cbiAgI1xuICAjIEFkZHMgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgdG8gdGhpcyBlbGVtZW50XG4gICNcbiAgYWRkQ2xhc3M6IChuYW1lcyktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIG5hbWUgaW4gbmFtZXMuc3BsaXQoXCIgXCIpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKG5hbWUsIHRydWUpXG4gICAgQFxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIGFmdGVyIHRoaXMgZWxlbWVudFxuICAjIC5hZnRlcihjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFmdGVyOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIG5vdCBwYXJlbnQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIFhtbCBFbGVtZW50IG11c3Qgbm90IGhhdmUgc2libGluZ3MhIChmb3IgaXQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudClcIlxuXG4gICAgIyBmaW5kIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGVsZW1lbnRcbiAgICBmb3IgYyxwb3NpdGlvbiBpbiBwYXJlbnQuZ2V0Q2hpbGRyZW4oKVxuICAgICAgaWYgYyBpcyBAXG4gICAgICAgIGJyZWFrXG5cbiAgICBjb250ZW50cyA9IFtdXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQF9tb2RlbC52YWwoXCJwYXJlbnRcIikpXG4gICAgICBlbHNlIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbCBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgY29udGVudHMucHVzaCBjb250ZW50XG5cbiAgICBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzKHBvc2l0aW9uKzEsIGNvbnRlbnRzKVxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIGFmdGVyIHRoaXMgZWxlbWVudFxuICAjIC5hZnRlcihjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGJlZm9yZTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBub3QgcGFyZW50P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBYbWwgRWxlbWVudCBtdXN0IG5vdCBoYXZlIHNpYmxpbmdzISAoZm9yIGl0IGRvZXMgbm90IGhhdmUgYSBwYXJlbnQpXCJcblxuICAgICMgZmluZCB0aGUgcG9zaXRpb24gb2YgdGhpcyBlbGVtZW50XG4gICAgZm9yIGMscG9zaXRpb24gaW4gcGFyZW50LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMgaXMgQFxuICAgICAgICBicmVha1xuXG4gICAgY29udGVudHMgPSBbXVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWxcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEBfbW9kZWwudmFsKFwicGFyZW50XCIpKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIGNvbnRlbnRzLnB1c2ggY29udGVudFxuXG4gICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnRDb250ZW50cyhwb3NpdGlvbiwgY29udGVudHMpXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGVuZCBvZiB0aGlzIGVsZW1lbnRcbiAgIyAuYXBwZW5kKGNvbnRlbnQgWywgY29udGVudF0pXG4gICNcbiAgYXBwZW5kOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikucHVzaChjb250ZW50KVxuICAgIEBcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoaXMgZWxlbWVudC5cbiAgIyAucHJlcGVuZChjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIHByZXBlbmQ6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWxcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEApXG4gICAgICBlbHNlIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbCBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnQoMCwgY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhbGwgY2hpbGQgbm9kZXMgb2YgdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzIGZyb20gdGhlIERPTS5cbiAgIyAuZW1wdHkoKVxuICAjXG4gIGVtcHR5OiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICAjIFRPRE86IGRvIGl0IGxpa2UgdGhpcyA6IEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIiwgbmV3IFkuTGlzdCgpKVxuICAgIGNoaWxkcmVuID0gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKVxuICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlbi52YWwoKVxuICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNoaWxkcmVuLmRlbGV0ZSgwKVxuICAgICAgZWxzZVxuICAgICAgICBjaGlsZC5yZW1vdmUoKVxuXG4gICNcbiAgIyBEZXRlcm1pbmUgd2hldGhlciBhbnkgb2YgdGhlIG1hdGNoZWQgZWxlbWVudHMgYXJlIGFzc2lnbmVkIHRoZSBnaXZlbiBjbGFzcy5cbiAgIyAuaGFzQ2xhc3MoY2xhc3NOYW1lKVxuICAjXG4gIGhhc0NsYXNzOiAoY2xhc3NOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKGNsYXNzTmFtZSk/XG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjXG4gICMgUmVtb3ZlIHRoaXMgZWxlbWVudCBmcm9tIHRoZSBET01cbiAgIyAucmVtb3ZlKClcbiAgI1xuICByZW1vdmU6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIEBfbW9kZWwudmFsKFwicGFyZW50XCIpP1xuICAgICAgcGFyZW50ID0gQF9tb2RlbC5kZWxldGUoXCJwYXJlbnRcIilcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhbiBhdHRyaWJ1dGUgZnJvbSB0aGlzIGVsZW1lbnRcbiAgIyAucmVtb3ZlQXR0cihhdHRyTmFtZSlcbiAgI1xuICByZW1vdmVBdHRyOiAoYXR0ck5hbWUpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGF0dHJOYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikuZGVsZXRlKGF0dHJOYW1lKVxuICAgIEBcblxuICAjXG4gICMgUmVtb3ZlIGEgc2luZ2xlIGNsYXNzLCBtdWx0aXBsZSBjbGFzc2VzLCBvciBhbGwgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudFxuICAjIC5yZW1vdmVDbGFzcyhbY2xhc3NOYW1lXSlcbiAgI1xuICByZW1vdmVDbGFzczogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgYXJndW1lbnRzLmxlbmd0aCBpcyAwXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IEBfbW9kZWwuY3VzdG9tX3R5cGVzLk9iamVjdCgpKVxuICAgIGVsc2VcbiAgICAgIGZvciBjbGFzc05hbWUgaW4gYXJndW1lbnRzXG4gICAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS5kZWxldGUoY2xhc3NOYW1lKVxuICAgIEBcblxuICAjXG4gICMgQWRkIG9yIHJlbW92ZSBvbmUgb3IgbW9yZSBjbGFzc2VzIGZyb20gdGhpcyBlbGVtZW50LFxuICAjIGRlcGVuZGluZyBvbiBlaXRoZXIgdGhlIGNsYXNz4oCZcyBwcmVzZW5jZSBvciB0aGUgdmFsdWUgb2YgdGhlIHN0YXRlIGFyZ3VtZW50LlxuICAjIC50b2dnbGVDbGFzcyhbY2xhc3NOYW1lXSlcbiAgI1xuICB0b2dnbGVDbGFzczogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBhcmd1bWVudHNcbiAgICAgIGNsYXNzZXMgPSBAX21vZGVsLnZhbChcImNsYXNzZXNcIilcbiAgICAgIGlmIGNsYXNzZXMudmFsKGNsYXNzTmFtZSk/XG4gICAgICAgIGNsYXNzZXMuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICAgIGVsc2VcbiAgICAgICAgY2xhc3Nlcy52YWwoY2xhc3NOYW1lLCB0cnVlKVxuICAgIEBcblxuICAjXG4gICMgR2V0IHRoZSBwYXJlbnQgb2YgdGhpcyBFbGVtZW50XG4gICMgQE5vdGU6IEV2ZXJ5IFhNTCBlbGVtZW50IGNhbiBvbmx5IGhhdmUgb25lIHBhcmVudFxuICAjIC5nZXRQYXJlbnQoKVxuICAjXG4gIGdldFBhcmVudDogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcblxuICAjXG4gICMgR2V0IGFsbCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBYTUwgRWxlbWVudCBhcyBhbiBBcnJheVxuICAjIEBOb3RlOiBUaGUgY2hpbGRyZW4gYXJlIGVpdGhlciBvZiB0eXBlIFkuWG1sIG9yIFN0cmluZ1xuICAjIC5nZXRDaGlsZHJlbigpXG4gICNcbiAgZ2V0Q2hpbGRyZW46ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikudmFsKClcblxuICBnZXRQb3NpdGlvbjogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBwYXJlbnQ/XG4gICAgICBmb3IgYyxpIGluIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikudmFsKClcbiAgICAgICAgaWYgYyBpcyBAXG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgaXMgbm90IGEgY2hpbGQgb2YgaXRzIHBhcmVudCAoc2hvdWxkIG5vdCBoYXBwZW4gaW4gWS5YbWwhKVwiXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG5cbiAgZ2V0RG9tOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBub3QgQF9kb20/XG4gICAgICBAX2RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpKVxuXG4gICAgICAjIHNldCB0aGUgYXR0cmlidXRlcyBfYW5kXyB0aGUgY2xhc3NlcyAoQHNlZSAuYXR0cigpKVxuICAgICAgZm9yIGF0dHJfbmFtZSwgYXR0cl92YWx1ZSBvZiBAYXR0cigpXG4gICAgICAgIEBfZG9tLnNldEF0dHJpYnV0ZSBhdHRyX25hbWUsIGF0dHJfdmFsdWVcbiAgICAgIGZvciBjaGlsZCxpIGluIEBnZXRDaGlsZHJlbigpXG4gICAgICAgIGlmIGNoaWxkLmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlIGNoaWxkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkb20gPSBjaGlsZC5nZXREb20oKVxuICAgICAgICBAX2RvbS5pbnNlcnRCZWZvcmUgZG9tLCBudWxsXG5cbiAgICB0aGF0ID0gQFxuXG4gICAgaWYgKG5vdCBAX2RvbS5feV94bWw/KVxuICAgICAgQF9kb20uX3lfeG1sID0gQFxuICAgICAgaW5pdGlhbGl6ZV9wcm94aWVzLmNhbGwgQFxuXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImluc2VydFwiXG4gICAgICAgICAgICBpZiBldmVudC52YWx1ZS5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgICAgICAgbmV3Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGV2ZW50LnZhbHVlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBuZXdOb2RlID0gZXZlbnQudmFsdWUuZ2V0RG9tKClcbiAgICAgICAgICAgICAgIyBldmVudC52YWx1ZS5fc2V0UGFyZW50IHRoYXRcbiAgICAgICAgICAgIGNoaWxkcmVuID0gdGhhdC5fZG9tLmNoaWxkTm9kZXNcbiAgICAgICAgICAgIGlmIGNoaWxkcmVuLmxlbmd0aCA8PSBldmVudC5wb3NpdGlvblxuICAgICAgICAgICAgICByaWdodE5vZGUgPSBudWxsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJpZ2h0Tm9kZSA9IGNoaWxkcmVuW2V2ZW50LnBvc2l0aW9uXVxuXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLmluc2VydEJlZm9yZSBuZXdOb2RlLCByaWdodE5vZGVcbiAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgZGVsZXRlZCA9IHRoYXQuX2RvbS5jaGlsZE5vZGVzW2V2ZW50LnBvc2l0aW9uXVxuXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUNoaWxkIGRlbGV0ZWRcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgIG5ld3ZhbCA9IGV2ZW50Lm9iamVjdC52YWwoZXZlbnQubmFtZSlcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICB0aGF0Ll9kb20uc2V0QXR0cmlidXRlIGV2ZW50Lm5hbWUsIG5ld3ZhbFxuICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUF0dHJpYnV0ZSBldmVudC5uYW1lXG4gICAgICBzZXRDbGFzc2VzID0gKCktPlxuICAgICAgICB0aGF0Ll9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLmNsYXNzTGlzdC5hZGQgZXZlbnQubmFtZSAjIGNsYXNzZXMgYXJlIHN0b3JlZCBhcyB0aGUga2V5c1xuICAgICAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLmNsYXNzTGlzdC5yZW1vdmUgZXZlbnQubmFtZVxuICAgICAgc2V0Q2xhc3NlcygpXG4gICAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImFkZFwiIG9yIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIlxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIGNsYXNzZXMgPSB0aGF0LmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgICBpZiAobm90IGNsYXNzZXM/KSBvciBjbGFzc2VzIGlzIFwiXCJcbiAgICAgICAgICAgICAgICB0aGF0Ll9kb20ucmVtb3ZlQXR0cmlidXRlIFwiY2xhc3NcIlxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLnNldEF0dHJpYnV0ZSBcImNsYXNzXCIsIHRoYXQuYXR0cihcImNsYXNzXCIpXG4gICAgICAgICAgICBzZXRDbGFzc2VzKClcblxuICAgIEBfZG9tXG5cbnByb3hpZXNfYXJlX2luaXRpYWxpemVkID0gZmFsc2VcbiMgc29tZSBkb20gaW1wbGVtZW50YXRpb25zIG1heSBjYWxsIGFub3RoZXIgZG9tLm1ldGhvZCB0aGF0IHNpbXVsYXRlcyB0aGUgYmVoYXZpb3Igb2YgYW5vdGhlci5cbiMgRm9yIGV4YW1wbGUgeG1sLmluc2VydENoaWxkKGRvbSkgLCB3aWNoIGluc2VydHMgYW4gZWxlbWVudCBhdCB0aGUgZW5kLCBhbmQgeG1sLmluc2VydEFmdGVyKGRvbSxudWxsKSB3aWNoIGRvZXMgdGhlIHNhbWVcbiMgQnV0IFkncyBwcm94eSBtYXkgYmUgY2FsbGVkIG9ubHkgb25jZSFcbnByb3h5X3Rva2VuID0gZmFsc2VcbmRvbnRfcHJveHkgPSAoZiktPlxuICBwcm94eV90b2tlbiA9IHRydWVcbiAgdHJ5XG4gICAgZigpXG4gIGNhdGNoIGVcbiAgICBwcm94eV90b2tlbiA9IGZhbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yIGVcbiAgcHJveHlfdG9rZW4gPSBmYWxzZVxuXG5fcHJveHkgPSAoZl9uYW1lLCBmLCBzb3VyY2UgPSBFbGVtZW50LnByb3RvdHlwZSwgeSktPlxuICBvbGRfZiA9IHNvdXJjZVtmX25hbWVdXG4gIHNvdXJjZVtmX25hbWVdID0gKCktPlxuICAgIGlmIChub3QgKHk/IG9yIEBfeV94bWw/KSkgb3IgcHJveHlfdG9rZW5cbiAgICAgIG9sZF9mLmFwcGx5IHRoaXMsIGFyZ3VtZW50c1xuICAgIGVsc2UgaWYgQF95X3htbD9cbiAgICAgIGYuYXBwbHkgQF95X3htbCwgYXJndW1lbnRzXG4gICAgZWxzZVxuICAgICAgZi5hcHBseSB5LCBhcmd1bWVudHNcblxuaW5pdGlhbGl6ZV9wcm94aWVzID0gKCktPlxuXG4gIHRoYXQgPSB0aGlzXG4gIGZfYWRkID0gKGMpLT5cbiAgICB0aGF0LmFkZENsYXNzIGNcbiAgX3Byb3h5IFwiYWRkXCIsIGZfYWRkLCBAX2RvbS5jbGFzc0xpc3QsIEBcblxuICBmX3JlbW92ZSA9IChjKS0+XG4gICAgdGhhdC5yZW1vdmVDbGFzcyBjXG5cbiAgX3Byb3h5IFwicmVtb3ZlXCIsIGZfcmVtb3ZlLCBAX2RvbS5jbGFzc0xpc3QsIEBcblxuICBAX2RvbS5fX2RlZmluZVNldHRlcl9fICdjbGFzc05hbWUnLCAodmFsKS0+XG4gICAgdGhhdC5hdHRyKCdjbGFzcycsIHZhbClcbiAgQF9kb20uX19kZWZpbmVHZXR0ZXJfXyAnY2xhc3NOYW1lJywgKCktPlxuICAgIHRoYXQuYXR0cignY2xhc3MnKVxuICBAX2RvbS5fX2RlZmluZVNldHRlcl9fICd0ZXh0Q29udGVudCcsICh2YWwpLT5cbiAgICAjIHJlbW92ZSBhbGwgbm9kZXNcbiAgICB0aGF0LmVtcHR5KClcblxuICAgICMgaW5zZXJ0IHdvcmQgY29udGVudFxuICAgIGlmIHZhbCBpc250IFwiXCJcbiAgICAgIHRoYXQuYXBwZW5kIHZhbFxuXG4gIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ3RleHRDb250ZW50JywgKHZhbCktPlxuICAgIHJlcyA9IFwiXCJcbiAgICBmb3IgYyBpbiB0aGF0LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIHJlcyArPSBjXG4gICAgICBlbHNlXG4gICAgICAgIHJlcyArPSBjLl9kb20udGV4dENvbnRlbnRcbiAgICByZXNcblxuICBpZiBwcm94aWVzX2FyZV9pbml0aWFsaXplZFxuICAgIHJldHVyblxuICBwcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IHRydWVcblxuICAjIHRoZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgaW5pdGlhbGl6ZWQgb24gcHJvdG90eXBlcyBhbmQgdGhlcmVmb3JlIHRoZXkgbmVlZCB0byBiZSB3cml0dGVuIG9ubHkgb25jZSFcblxuICBpbnNlcnRCZWZvcmUgPSAoaW5zZXJ0ZWROb2RlX3MsIGFkamFjZW50Tm9kZSktPlxuICAgIGlmIGFkamFjZW50Tm9kZT9cbiAgICAgIGZvciBuLGkgaW4gQF9kb20uY2hpbGROb2Rlc1xuICAgICAgICBpZiBuIGlzIGFkamFjZW50Tm9kZVxuICAgICAgICAgIHBvcyA9IGlcbiAgICAgICAgICBicmVha1xuICAgICAgaWYgbm90IHBvcz9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGFkamFjZW50Tm9kZSBpcyBub3QgYSBjaGlsZCBlbGVtZW50IG9mIHRoaXMgbm9kZSFcIlxuICAgIGVsc2VcbiAgICAgIHBvcyA9IEBnZXRDaGlsZHJlbigpLmxlbmd0aFxuXG4gICAgbmV3X2NoaWxkcyA9IFtdXG4gICAgaWYgaW5zZXJ0ZWROb2RlX3Mubm9kZVR5cGUgaXMgaW5zZXJ0ZWROb2RlX3MuRE9DVU1FTlRfRlJBR01FTlRfTk9ERVxuICAgICAgY2hpbGQgPSBpbnNlcnRlZE5vZGVfcy5maXJzdENoaWxkXG4gICAgICB3aGlsZSBjaGlsZD9cbiAgICAgICAgbmV3X2NoaWxkcy5wdXNoIGNoaWxkXG4gICAgICAgIGNoaWxkID0gY2hpbGQubmV4dFNpYmxpbmdcbiAgICBlbHNlXG4gICAgICBuZXdfY2hpbGRzLnB1c2ggaW5zZXJ0ZWROb2RlX3NcblxuICAgIHlwYXJlbnQgPSB0aGlzXG4gICAgbmV3X2NoaWxkcyA9IG5ld19jaGlsZHMubWFwIChjaGlsZCktPlxuICAgICAgaWYgY2hpbGQuX3lfeG1sP1xuICAgICAgICBjaGlsZC5feV94bWxcbiAgICAgIGVsc2UgaWYgY2hpbGQubm9kZVR5cGUgPT0gY2hpbGQuVEVYVF9OT0RFXG4gICAgICAgIGNoaWxkLnRleHRDb250ZW50XG4gICAgICBlbHNlXG4gICAgICAgIHljaGlsZCA9IG5ldyBZWG1sKGNoaWxkKVxuICAgICAgICB5Y2hpbGQuX3NldFBhcmVudCB5cGFyZW50XG4gICAgICAgIHljaGlsZFxuICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMgcG9zLCBuZXdfY2hpbGRzXG5cbiAgX3Byb3h5ICdpbnNlcnRCZWZvcmUnLCBpbnNlcnRCZWZvcmVcbiAgX3Byb3h5ICdhcHBlbmRDaGlsZCcsIGluc2VydEJlZm9yZVxuICBfcHJveHkgJ3JlbW92ZUF0dHJpYnV0ZScsIChuYW1lKS0+XG4gICAgQHJlbW92ZUF0dHIgbmFtZVxuICBfcHJveHkgJ3NldEF0dHJpYnV0ZScsIChuYW1lLCB2YWx1ZSktPlxuICAgIEBhdHRyIG5hbWUsIHZhbHVlXG5cbiAgcmVtb3ZlQ2hpbGQgPSAobm9kZSktPlxuICAgIG5vZGUuX3lfeG1sLnJlbW92ZSgpXG4gIF9wcm94eSAncmVtb3ZlQ2hpbGQnLCByZW1vdmVDaGlsZFxuICByZXBsYWNlQ2hpbGQgPSAoaW5zZXJ0ZWROb2RlLCByZXBsYWNlZE5vZGUpLT4gIyBUT0RPOiBoYW5kbGUgcmVwbGFjZSB3aXRoIHJlcGxhY2UgYmVoYXZpb3IuLi5cbiAgICBpbnNlcnRCZWZvcmUuY2FsbCB0aGlzLCBpbnNlcnRlZE5vZGUsIHJlcGxhY2VkTm9kZVxuICAgIHJlbW92ZUNoaWxkLmNhbGwgdGhpcywgcmVwbGFjZWROb2RlXG4gIF9wcm94eSAncmVwbGFjZUNoaWxkJywgcmVwbGFjZUNoaWxkXG5cbiAgcmVtb3ZlID0gKCktPlxuICAgIGlmIEBfbW9kZWwudmFsKFwicGFyZW50XCIpP1xuICAgICAgQHJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgdGhpc19kb20gPSB0aGlzLl9kb21cbiAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICB0aGlzX2RvbS5yZW1vdmUoKVxuXG4gIF9wcm94eSAncmVtb3ZlJywgcmVtb3ZlXG5cbmlmIHdpbmRvdz9cbiAgaWYgd2luZG93Llk/XG4gICAgaWYgd2luZG93LlkuTGlzdD9cbiAgICAgIHdpbmRvdy5ZLlhtbCA9IFlYbWxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWS5MaXN0IVwiXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWVhtbFxuXG5cblxuXG5cblxuXG5cblxuIl19
