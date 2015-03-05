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
    var attribute, c, child, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
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
            this._xml.children.push(new YXml(child));
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
            deleted = event.oldValue.getDom();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NvZGlvL3dvcmtzcGFjZS95LXhtbC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jb2Rpby93b3Jrc3BhY2UveS14bWwvbGliL3kteG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0ZBQUE7O0FBQUE7QUFFZSxFQUFBLGNBQUMsVUFBRCxFQUFhLFVBQWIsR0FBQTtBQUNYLFFBQUEsdURBQUE7O01BRHdCLGFBQWE7S0FDckM7QUFBQSxJQUFBLElBQU8sa0JBQVA7QUFDRSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBUixDQURGO0tBQUEsTUFHSyxJQUFHLFVBQVUsQ0FBQyxXQUFYLEtBQTBCLE1BQTdCO0FBQ0gsTUFBQSxPQUFBLEdBQVUsVUFBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLEVBRFIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLEdBQWlCLEVBRmpCLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixHQUFnQixPQU5oQixDQUFBO0FBT0EsTUFBQSxJQUFHLFVBQVUsQ0FBQyxXQUFYLEtBQTRCLE1BQS9CO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSw4Q0FBTixDQUFWLENBREY7T0FQQTtBQVNBLFdBQUEsb0JBQUE7K0JBQUE7QUFDRSxRQUFBLElBQUcsQ0FBQyxDQUFDLFdBQUYsS0FBbUIsTUFBdEI7QUFDRSxnQkFBVSxJQUFBLEtBQUEsQ0FBTSx3Q0FBTixDQUFWLENBREY7U0FERjtBQUFBLE9BVEE7QUFBQSxNQVlBLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixHQUFtQixVQVpuQixDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0IsRUFiaEIsQ0FB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eEIsRUFBc0MsWUFBdEMsQ0FBQSxDQUFBO1dBQ0EsV0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBakIsRUFBdUIsWUFBdkIsRUFGYTtFQUFBLENBdEVmLENBQUE7QUFBQSxFQXlFQSxNQUFBLENBQU8sY0FBUCxFQUF1QixZQUF2QixDQXpFQSxDQUFBO0FBQUEsRUEyRUEsTUFBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFFBQUEsUUFBQTtBQUFBLElBQUEsSUFBRyxpQ0FBSDthQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtLQUFBLE1BQUE7QUFHRSxNQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FBQTthQUNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxRQUFRLENBQUMsTUFBVCxDQUFBLEVBRFM7TUFBQSxDQUFYLEVBSkY7S0FETztFQUFBLENBM0VULENBQUE7U0FtRkEsTUFBQSxDQUFPLFFBQVAsRUFBaUIsTUFBakIsRUFyRm1CO0FBQUEsQ0EzYXJCLENBQUE7O0FBa2dCQSxJQUFHLGdEQUFIO0FBQ0UsRUFBQSxJQUFHLGdCQUFIO0FBQ0UsSUFBQSxJQUFHLHFCQUFIO0FBQ0UsTUFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQVQsR0FBZSxJQUFmLENBREY7S0FBQSxNQUFBO0FBR0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSwrQkFBTixDQUFWLENBSEY7S0FERjtHQUFBLE1BQUE7QUFNRSxVQUFVLElBQUEsS0FBQSxDQUFNLDBCQUFOLENBQVYsQ0FORjtHQURGO0NBbGdCQTs7QUEyZ0JBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQWpCLENBREY7Q0EzZ0JBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIFlYbWxcblxuICBjb25zdHJ1Y3RvcjogKHRhZ19vcl9kb20sIGF0dHJpYnV0ZXMgPSB7fSktPlxuICAgIGlmIG5vdCB0YWdfb3JfZG9tP1xuICAgICAgQF94bWwgPSB7fVxuICAgICAgIyBub3BcbiAgICBlbHNlIGlmIHRhZ19vcl9kb20uY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICB0YWduYW1lID0gdGFnX29yX2RvbVxuICAgICAgQF94bWwgPSB7fVxuICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgI1RPRE86IEhvdyB0byBmb3JjZSB0aGUgdXNlciB0byBzcGVjaWZ5IHBhcmFtZXRlcnM/XG4gICAgICAjaWYgbm90IHRhZ25hbWU/XG4gICAgICAjICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBzcGVjaWZ5IGEgdGFnbmFtZVwiXG4gICAgICBAX3htbC50YWduYW1lID0gdGFnbmFtZVxuICAgICAgaWYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciBpc250IE9iamVjdFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIHNwZWNpZmllZCBhcyBhIE9iamVjdFwiXG4gICAgICBmb3IgYV9uYW1lLCBhIG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgaWYgYS5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgb2YgdHlwZSBTdHJpbmchXCJcbiAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzXG4gICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgIF9jbGFzc2VzID0gQF94bWwuYXR0cmlidXRlcy5jbGFzc1xuICAgICAgZGVsZXRlIEBfeG1sLmF0dHJpYnV0ZXMuY2xhc3NcbiAgICAgIGlmIF9jbGFzc2VzP1xuICAgICAgICBmb3IgY19uYW1lLCBjIGluIF9jbGFzc2VzLnNwbGl0KFwiIFwiKVxuICAgICAgICAgIGlmIGMubGVuZ3RoID4gMFxuICAgICAgICAgICAgQF94bWwuY2xhc3Nlc1tjX25hbWVdID0gY1xuICAgICAgdW5kZWZpbmVkXG4gICAgZWxzZSBpZiB0YWdfb3JfZG9tIGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgQF9kb20gPSB0YWdfb3JfZG9tXG4gICAgICBAX3htbCA9IHt9XG5cbiAgX2NoZWNrRm9yTW9kZWw6ICgpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIllvdSBoYXZlIHRvIHB1dCB0aGUgWS5cIitAX25hbWUrJyBpbnN0YW5jZSBvbiBhIHNoYXJlZCBlbGVtZW50IGJlZm9yZSB5b3UgY2FuIHVzZSBpdCEgRS5nLiBvbiB0aGUgeSBvYmplY3QgeS52YWwoXCJteS0nK0BfbmFtZSsnXCIseScrQF9uYW1lKycpJ1xuXG4gIF9uYW1lOiBcIlhtbFwiXG5cbiAgX2dldE1vZGVsOiAoWSwgb3BzKS0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBpZiBAX2RvbT9cbiAgICAgICAgQF94bWwudGFnbmFtZSA9IEBfZG9tLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBAX3htbC5hdHRyaWJ1dGVzID0ge31cbiAgICAgICAgQF94bWwuY2xhc3NlcyA9IHt9XG4gICAgICAgIGZvciBhdHRyaWJ1dGUgaW4gQF9kb20uYXR0cmlidXRlc1xuICAgICAgICAgIGlmIGF0dHJpYnV0ZS5uYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICAgICAgZm9yIGMgaW4gYXR0cmlidXRlLnZhbHVlLnNwbGl0KFwiIFwiKVxuICAgICAgICAgICAgICBAX3htbC5jbGFzc2VzW2NdID0gdHJ1ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBfeG1sLmF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlXG4gICAgICAgIEBfeG1sLmNoaWxkcmVuID0gW11cbiAgICAgICAgZm9yIGNoaWxkIGluIEBfZG9tLmNoaWxkTm9kZXNcbiAgICAgICAgICBpZiBjaGlsZC5ub2RlVHlwZSBpcyBjaGlsZC5URVhUX05PREVcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2ggY2hpbGQudGV4dENvbnRlbnRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAX3htbC5jaGlsZHJlbi5wdXNoKG5ldyBZWG1sKGNoaWxkKSlcbiAgICAgIEBfbW9kZWwgPSBuZXcgb3BzLk1hcE1hbmFnZXIoQCkuZXhlY3V0ZSgpXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIiwgbmV3IFkuT2JqZWN0KEBfeG1sLmF0dHJpYnV0ZXMpKVxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBZLk9iamVjdChAX3htbC5jbGFzc2VzKSlcbiAgICAgIEBfbW9kZWwudmFsKFwidGFnbmFtZVwiLCBAX3htbC50YWduYW1lKVxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiLCBuZXcgWS5MaXN0KEBfeG1sLmNoaWxkcmVuKSlcbiAgICAgIGlmIEBfeG1sLnBhcmVudD9cbiAgICAgICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIiwgQF94bWwucGFyZW50KVxuXG4gICAgICBpZiBAX2RvbT9cbiAgICAgICAgQGdldERvbSgpICMgdHdvIHdheSBiaW5kIGRvbSB0byB0aGlzIHhtbCB0eXBlXG5cbiAgICAgIEBfc2V0TW9kZWwgQF9tb2RlbFxuXG4gICAgQF9tb2RlbFxuXG4gIF9zZXRNb2RlbDogKEBfbW9kZWwpLT5cbiAgICBAX21vZGVsLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICBpZiBldmVudC5uYW1lIGlzIFwicGFyZW50XCIgYW5kIGV2ZW50LnR5cGUgaXNudCBcImFkZFwiXG4gICAgICAgICAgcGFyZW50ID0gZXZlbnQub2xkVmFsdWVcbiAgICAgICAgICBjaGlsZHJlbiA9IHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIik/LnZhbCgpXG4gICAgICAgICAgaWYgY2hpbGRyZW4/XG4gICAgICAgICAgICBmb3IgYyxpIGluIGNoaWxkcmVuXG4gICAgICAgICAgICAgIGlmIGMgaXMgQFxuICAgICAgICAgICAgICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuZGVsZXRlIGlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgIGRlbGV0ZSBAX3htbFxuXG4gIF9zZXRQYXJlbnQ6IChwYXJlbnQpLT5cbiAgICBpZiBwYXJlbnQgaW5zdGFuY2VvZiBZWG1sXG4gICAgICBpZiBAX21vZGVsP1xuICAgICAgICBAcmVtb3ZlKClcbiAgICAgICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIiwgcGFyZW50KVxuICAgICAgZWxzZVxuICAgICAgICBAX3htbC5wYXJlbnQgPSBwYXJlbnRcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJwYXJlbnQgbXVzdCBiZSBvZiB0eXBlIFkuWG1sIVwiXG5cbiAgdG9TdHJpbmc6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHhtbCA9IFwiPFwiK0BfbW9kZWwudmFsKFwidGFnbmFtZVwiKVxuICAgIGZvciBuYW1lLCB2YWx1ZSBvZiBAYXR0cigpXG4gICAgICB4bWwgKz0gXCIgXCIrbmFtZSsnPVwiJyt2YWx1ZSsnXCInXG4gICAgeG1sICs9IFwiPlwiXG4gICAgZm9yIGNoaWxkIGluIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikudmFsKClcbiAgICAgIHhtbCArPSBjaGlsZC50b1N0cmluZygpXG4gICAgeG1sICs9ICc8LycrQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpKyc+J1xuICAgIHhtbFxuXG4gICNcbiAgIyBHZXQvc2V0IHRoZSBhdHRyaWJ1dGUocykgb2YgdGhpcyBlbGVtZW50LlxuICAjIC5hdHRyKClcbiAgIyAuYXR0cihuYW1lKVxuICAjIC5hdHRyKG5hbWUsIHZhbHVlKVxuICAjXG4gIGF0dHI6IChuYW1lLCB2YWx1ZSktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgIGlmIHZhbHVlLmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgb2YgdHlwZSBTdHJpbmchXCJcbiAgICAgIGlmIG5hbWUgaXMgXCJjbGFzc1wiXG4gICAgICAgIGNsYXNzZXMgPSB2YWx1ZS5zcGxpdChcIiBcIilcbiAgICAgICAgY3MgPSB7fVxuICAgICAgICBmb3IgYyBpbiBjbGFzc2VzXG4gICAgICAgICAgY3NbY10gPSB0cnVlXG5cbiAgICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoY3MpKVxuICAgICAgZWxzZVxuICAgICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikudmFsKG5hbWUsIHZhbHVlKVxuICAgICAgQFxuICAgIGVsc2UgaWYgYXJndW1lbnRzLmxlbmd0aCA+IDBcbiAgICAgIGlmIG5hbWUgaXMgXCJjbGFzc1wiXG4gICAgICAgIE9iamVjdC5rZXlzKEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS52YWwoKSkuam9pbihcIiBcIilcbiAgICAgIGVsc2VcbiAgICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLnZhbChuYW1lKVxuICAgIGVsc2VcbiAgICAgIGF0dHJzID0gQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLnZhbCgpXG4gICAgICBjbGFzc2VzID0gT2JqZWN0LmtleXMoQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbCgpKS5qb2luKFwiIFwiKVxuICAgICAgaWYgY2xhc3Nlcy5sZW5ndGggPiAwXG4gICAgICAgIGF0dHJzW1wiY2xhc3NcIl0gPSBjbGFzc2VzXG4gICAgICBhdHRyc1xuXG4gICNcbiAgIyBBZGRzIHRoZSBzcGVjaWZpZWQgY2xhc3MoZXMpIHRvIHRoaXMgZWxlbWVudFxuICAjXG4gIGFkZENsYXNzOiAobmFtZXMpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBuYW1lIGluIG5hbWVzLnNwbGl0KFwiIFwiKVxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbChuYW1lLCB0cnVlKVxuICAgIEBcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCBhZnRlciB0aGlzIGVsZW1lbnRcbiAgIyAuYWZ0ZXIoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBhZnRlcjogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBub3QgcGFyZW50P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBYbWwgRWxlbWVudCBtdXN0IG5vdCBoYXZlIHNpYmxpbmdzISAoZm9yIGl0IGRvZXMgbm90IGhhdmUgYSBwYXJlbnQpXCJcblxuICAgICMgZmluZCB0aGUgcG9zaXRpb24gb2YgdGhpcyBlbGVtZW50XG4gICAgZm9yIGMscG9zaXRpb24gaW4gcGFyZW50LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMgaXMgQFxuICAgICAgICBicmVha1xuXG4gICAgY29udGVudHMgPSBbXVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWxcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEBfbW9kZWwudmFsKFwicGFyZW50XCIpKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIGNvbnRlbnRzLnB1c2ggY29udGVudFxuXG4gICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnRDb250ZW50cyhwb3NpdGlvbisxLCBjb250ZW50cylcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCBhZnRlciB0aGlzIGVsZW1lbnRcbiAgIyAuYWZ0ZXIoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBiZWZvcmU6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHBhcmVudCA9IEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgaWYgbm90IHBhcmVudD9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgWG1sIEVsZW1lbnQgbXVzdCBub3QgaGF2ZSBzaWJsaW5ncyEgKGZvciBpdCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50KVwiXG5cbiAgICAjIGZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgZWxlbWVudFxuICAgIGZvciBjLHBvc2l0aW9uIGluIHBhcmVudC5nZXRDaGlsZHJlbigpXG4gICAgICBpZiBjIGlzIEBcbiAgICAgICAgYnJlYWtcblxuICAgIGNvbnRlbnRzID0gW11cbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAX21vZGVsLnZhbChcInBhcmVudFwiKSlcbiAgICAgIGVsc2UgaWYgY29udGVudC5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5hZnRlciBleHBlY3RzIGluc3RhbmNlcyBvZiBZWG1sIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBjb250ZW50cy5wdXNoIGNvbnRlbnRcblxuICAgIHBhcmVudC5fbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMocG9zaXRpb24sIGNvbnRlbnRzKVxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIHRvIHRoZSBlbmQgb2YgdGhpcyBlbGVtZW50XG4gICMgLmFwcGVuZChjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFwcGVuZDogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQClcbiAgICAgIGVsc2UgaWYgY29udGVudC5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5hZnRlciBleHBlY3RzIGluc3RhbmNlcyBvZiBZWG1sIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnB1c2goY29udGVudClcbiAgICBAXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLnByZXBlbmQoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBwcmVwZW5kOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0KDAsIGNvbnRlbnQpXG4gICAgQFxuXG4gICNcbiAgIyBSZW1vdmUgYWxsIGNoaWxkIG5vZGVzIG9mIHRoZSBzZXQgb2YgbWF0Y2hlZCBlbGVtZW50cyBmcm9tIHRoZSBET00uXG4gICMgLmVtcHR5KClcbiAgI1xuICBlbXB0eTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgIyBUT0RPOiBkbyBpdCBsaWtlIHRoaXMgOiBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIsIG5ldyBZLkxpc3QoKSlcbiAgICBjaGlsZHJlbiA9IEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIilcbiAgICBmb3IgY2hpbGQgaW4gY2hpbGRyZW4udmFsKClcbiAgICAgIGlmIGNoaWxkLmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICBjaGlsZHJlbi5kZWxldGUoMClcbiAgICAgIGVsc2VcbiAgICAgICAgY2hpbGQucmVtb3ZlKClcblxuICAjXG4gICMgRGV0ZXJtaW5lIHdoZXRoZXIgYW55IG9mIHRoZSBtYXRjaGVkIGVsZW1lbnRzIGFyZSBhc3NpZ25lZCB0aGUgZ2l2ZW4gY2xhc3MuXG4gICMgLmhhc0NsYXNzKGNsYXNzTmFtZSlcbiAgI1xuICBoYXNDbGFzczogKGNsYXNzTmFtZSktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbChjbGFzc05hbWUpP1xuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgI1xuICAjIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSB0aGUgRE9NXG4gICMgLnJlbW92ZSgpXG4gICNcbiAgcmVtb3ZlOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBAX21vZGVsLnZhbChcInBhcmVudFwiKT9cbiAgICAgIHBhcmVudCA9IEBfbW9kZWwuZGVsZXRlKFwicGFyZW50XCIpXG4gICAgQFxuXG4gICNcbiAgIyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhpcyBlbGVtZW50XG4gICMgLnJlbW92ZUF0dHIoYXR0ck5hbWUpXG4gICNcbiAgcmVtb3ZlQXR0cjogKGF0dHJOYW1lKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBpZiBhdHRyTmFtZSBpcyBcImNsYXNzXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgQF9tb2RlbC5jdXN0b21fdHlwZXMuT2JqZWN0KCkpXG4gICAgZWxzZVxuICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLmRlbGV0ZShhdHRyTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIFJlbW92ZSBhIHNpbmdsZSBjbGFzcywgbXVsdGlwbGUgY2xhc3Nlcywgb3IgYWxsIGNsYXNzZXMgZnJvbSB0aGlzIGVsZW1lbnRcbiAgIyAucmVtb3ZlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgcmVtb3ZlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggaXMgMFxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBmb3IgY2xhc3NOYW1lIGluIGFyZ3VtZW50c1xuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIEFkZCBvciByZW1vdmUgb25lIG9yIG1vcmUgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudCxcbiAgIyBkZXBlbmRpbmcgb24gZWl0aGVyIHRoZSBjbGFzc+KAmXMgcHJlc2VuY2Ugb3IgdGhlIHZhbHVlIG9mIHRoZSBzdGF0ZSBhcmd1bWVudC5cbiAgIyAudG9nZ2xlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgdG9nZ2xlQ2xhc3M6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIGZvciBjbGFzc05hbWUgaW4gYXJndW1lbnRzXG4gICAgICBjbGFzc2VzID0gQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpXG4gICAgICBpZiBjbGFzc2VzLnZhbChjbGFzc05hbWUpP1xuICAgICAgICBjbGFzc2VzLmRlbGV0ZShjbGFzc05hbWUpXG4gICAgICBlbHNlXG4gICAgICAgIGNsYXNzZXMudmFsKGNsYXNzTmFtZSwgdHJ1ZSlcbiAgICBAXG5cbiAgI1xuICAjIEdldCB0aGUgcGFyZW50IG9mIHRoaXMgRWxlbWVudFxuICAjIEBOb3RlOiBFdmVyeSBYTUwgZWxlbWVudCBjYW4gb25seSBoYXZlIG9uZSBwYXJlbnRcbiAgIyAuZ2V0UGFyZW50KClcbiAgI1xuICBnZXRQYXJlbnQ6ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG5cbiAgI1xuICAjIEdldCBhbGwgdGhlIGNoaWxkcmVuIG9mIHRoaXMgWE1MIEVsZW1lbnQgYXMgYW4gQXJyYXlcbiAgIyBATm90ZTogVGhlIGNoaWxkcmVuIGFyZSBlaXRoZXIgb2YgdHlwZSBZLlhtbCBvciBTdHJpbmdcbiAgIyAuZ2V0Q2hpbGRyZW4oKVxuICAjXG4gIGdldENoaWxkcmVuOiAoKS0+XG4gICAgQF9jaGVja0Zvck1vZGVsKClcbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG5cbiAgZ2V0UG9zaXRpb246ICgpLT5cbiAgICBAX2NoZWNrRm9yTW9kZWwoKVxuICAgIHBhcmVudCA9IEBfbW9kZWwudmFsKFwicGFyZW50XCIpXG4gICAgaWYgcGFyZW50P1xuICAgICAgZm9yIGMsaSBpbiBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG4gICAgICAgIGlmIGMgaXMgQFxuICAgICAgICAgIHJldHVybiBpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIGlzIG5vdCBhIGNoaWxkIG9mIGl0cyBwYXJlbnQgKHNob3VsZCBub3QgaGFwcGVuIGluIFkuWG1sISlcIlxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuXG4gIGdldERvbTogKCktPlxuICAgIEBfY2hlY2tGb3JNb2RlbCgpXG4gICAgaWYgbm90IEBfZG9tP1xuICAgICAgQF9kb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KEBfbW9kZWwudmFsKFwidGFnbmFtZVwiKSlcblxuICAgICAgIyBzZXQgdGhlIGF0dHJpYnV0ZXMgX2FuZF8gdGhlIGNsYXNzZXMgKEBzZWUgLmF0dHIoKSlcbiAgICAgIGZvciBhdHRyX25hbWUsIGF0dHJfdmFsdWUgb2YgQGF0dHIoKVxuICAgICAgICBAX2RvbS5zZXRBdHRyaWJ1dGUgYXR0cl9uYW1lLCBhdHRyX3ZhbHVlXG4gICAgICBmb3IgY2hpbGQsaSBpbiBAZ2V0Q2hpbGRyZW4oKVxuICAgICAgICBpZiBjaGlsZC5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgICBkb20gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSBjaGlsZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZG9tID0gY2hpbGQuZ2V0RG9tKClcbiAgICAgICAgQF9kb20uaW5zZXJ0QmVmb3JlIGRvbSwgbnVsbFxuXG4gICAgdGhhdCA9IEBcblxuICAgIGlmIChub3QgQF9kb20uX3lfeG1sPylcbiAgICAgIEBfZG9tLl95X3htbCA9IEBcbiAgICAgIGluaXRpYWxpemVfcHJveGllcy5jYWxsIEBcblxuICAgICAgQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJpbnNlcnRcIlxuICAgICAgICAgICAgaWYgZXZlbnQudmFsdWUuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgICAgICAgIG5ld05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShldmVudC52YWx1ZSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbmV3Tm9kZSA9IGV2ZW50LnZhbHVlLmdldERvbSgpXG4gICAgICAgICAgICAgICMgZXZlbnQudmFsdWUuX3NldFBhcmVudCB0aGF0XG4gICAgICAgICAgICBjaGlsZHJlbiA9IHRoYXQuX2RvbS5jaGlsZE5vZGVzXG4gICAgICAgICAgICBpZiBjaGlsZHJlbi5sZW5ndGggPD0gZXZlbnQucG9zaXRpb25cbiAgICAgICAgICAgICAgcmlnaHROb2RlID0gbnVsbFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByaWdodE5vZGUgPSBjaGlsZHJlbltldmVudC5wb3NpdGlvbl1cblxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5pbnNlcnRCZWZvcmUgbmV3Tm9kZSwgcmlnaHROb2RlXG4gICAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICAgIGRlbGV0ZWQgPSBldmVudC5vbGRWYWx1ZS5nZXREb20oKVxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVDaGlsZCBkZWxldGVkXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICBuZXd2YWwgPSBldmVudC5vYmplY3QudmFsKGV2ZW50Lm5hbWUpXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnNldEF0dHJpYnV0ZSBldmVudC5uYW1lLCBuZXd2YWxcbiAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVBdHRyaWJ1dGUgZXZlbnQubmFtZVxuICAgICAgc2V0Q2xhc3NlcyA9ICgpLT5cbiAgICAgICAgdGhhdC5fbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QuYWRkIGV2ZW50Lm5hbWUgIyBjbGFzc2VzIGFyZSBzdG9yZWQgYXMgdGhlIGtleXNcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QucmVtb3ZlIGV2ZW50Lm5hbWVcbiAgICAgIHNldENsYXNzZXMoKVxuICAgICAgQF9tb2RlbC5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICBjbGFzc2VzID0gdGhhdC5hdHRyKFwiY2xhc3NcIilcbiAgICAgICAgICAgICAgaWYgKG5vdCBjbGFzc2VzPykgb3IgY2xhc3NlcyBpcyBcIlwiXG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUF0dHJpYnV0ZSBcImNsYXNzXCJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5zZXRBdHRyaWJ1dGUgXCJjbGFzc1wiLCB0aGF0LmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgc2V0Q2xhc3NlcygpXG5cbiAgICBAX2RvbVxuXG5wcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IGZhbHNlXG4jIHNvbWUgZG9tIGltcGxlbWVudGF0aW9ucyBtYXkgY2FsbCBhbm90aGVyIGRvbS5tZXRob2QgdGhhdCBzaW11bGF0ZXMgdGhlIGJlaGF2aW9yIG9mIGFub3RoZXIuXG4jIEZvciBleGFtcGxlIHhtbC5pbnNlcnRDaGlsZChkb20pICwgd2ljaCBpbnNlcnRzIGFuIGVsZW1lbnQgYXQgdGhlIGVuZCwgYW5kIHhtbC5pbnNlcnRBZnRlcihkb20sbnVsbCkgd2ljaCBkb2VzIHRoZSBzYW1lXG4jIEJ1dCBZJ3MgcHJveHkgbWF5IGJlIGNhbGxlZCBvbmx5IG9uY2UhXG5wcm94eV90b2tlbiA9IGZhbHNlXG5kb250X3Byb3h5ID0gKGYpLT5cbiAgcHJveHlfdG9rZW4gPSB0cnVlXG4gIHRyeVxuICAgIGYoKVxuICBjYXRjaCBlXG4gICAgcHJveHlfdG9rZW4gPSBmYWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBlXG4gIHByb3h5X3Rva2VuID0gZmFsc2VcblxuX3Byb3h5ID0gKGZfbmFtZSwgZiwgc291cmNlID0gRWxlbWVudC5wcm90b3R5cGUsIHkpLT5cbiAgb2xkX2YgPSBzb3VyY2VbZl9uYW1lXVxuICBzb3VyY2VbZl9uYW1lXSA9ICgpLT5cbiAgICBpZiAobm90ICh5PyBvciBAX3lfeG1sPykpIG9yIHByb3h5X3Rva2VuXG4gICAgICBvbGRfZi5hcHBseSB0aGlzLCBhcmd1bWVudHNcbiAgICBlbHNlIGlmIEBfeV94bWw/XG4gICAgICBmLmFwcGx5IEBfeV94bWwsIGFyZ3VtZW50c1xuICAgIGVsc2VcbiAgICAgIGYuYXBwbHkgeSwgYXJndW1lbnRzXG5cbmluaXRpYWxpemVfcHJveGllcyA9ICgpLT5cblxuICB0aGF0ID0gdGhpc1xuICBmX2FkZCA9IChjKS0+XG4gICAgdGhhdC5hZGRDbGFzcyBjXG4gIF9wcm94eSBcImFkZFwiLCBmX2FkZCwgQF9kb20uY2xhc3NMaXN0LCBAXG5cbiAgZl9yZW1vdmUgPSAoYyktPlxuICAgIHRoYXQucmVtb3ZlQ2xhc3MgY1xuXG4gIF9wcm94eSBcInJlbW92ZVwiLCBmX3JlbW92ZSwgQF9kb20uY2xhc3NMaXN0LCBAXG5cbiAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAnY2xhc3NOYW1lJywgKHZhbCktPlxuICAgIHRoYXQuYXR0cignY2xhc3MnLCB2YWwpXG4gIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ2NsYXNzTmFtZScsICgpLT5cbiAgICB0aGF0LmF0dHIoJ2NsYXNzJylcbiAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAndGV4dENvbnRlbnQnLCAodmFsKS0+XG4gICAgIyByZW1vdmUgYWxsIG5vZGVzXG4gICAgdGhhdC5lbXB0eSgpXG5cbiAgICAjIGluc2VydCB3b3JkIGNvbnRlbnRcbiAgICBpZiB2YWwgaXNudCBcIlwiXG4gICAgICB0aGF0LmFwcGVuZCB2YWxcblxuICBpZiBwcm94aWVzX2FyZV9pbml0aWFsaXplZFxuICAgIHJldHVyblxuICBwcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IHRydWVcblxuICAjIHRoZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgaW5pdGlhbGl6ZWQgb24gcHJvdG90eXBlcyBhbmQgdGhlcmVmb3JlIHRoZXkgbmVlZCB0byBiZSB3cml0dGVuIG9ubHkgb25jZSFcblxuICBpbnNlcnRCZWZvcmUgPSAoaW5zZXJ0ZWROb2RlX3MsIGFkamFjZW50Tm9kZSktPlxuICAgIGlmIGFkamFjZW50Tm9kZT9cbiAgICAgIGZvciBuLGkgaW4gQF9kb20uY2hpbGROb2Rlc1xuICAgICAgICBpZiBuIGlzIGFkamFjZW50Tm9kZVxuICAgICAgICAgIHBvcyA9IGlcbiAgICAgICAgICBicmVha1xuICAgICAgaWYgbm90IHBvcz9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGFkamFjZW50Tm9kZSBpcyBub3QgYSBjaGlsZCBlbGVtZW50IG9mIHRoaXMgbm9kZSFcIlxuICAgIGVsc2VcbiAgICAgIHBvcyA9IEBnZXRDaGlsZHJlbigpLmxlbmd0aFxuXG4gICAgbmV3X2NoaWxkcyA9IFtdXG4gICAgaWYgaW5zZXJ0ZWROb2RlX3Mubm9kZVR5cGUgaXMgaW5zZXJ0ZWROb2RlX3MuRE9DVU1FTlRfRlJBR01FTlRfTk9ERVxuICAgICAgY2hpbGQgPSBpbnNlcnRlZE5vZGVfcy5maXJzdENoaWxkXG4gICAgICB3aGlsZSBjaGlsZD9cbiAgICAgICAgbmV3X2NoaWxkcy5wdXNoIGNoaWxkXG4gICAgICAgIGNoaWxkID0gY2hpbGQubmV4dFNpYmxpbmdcbiAgICBlbHNlXG4gICAgICBuZXdfY2hpbGRzLnB1c2ggaW5zZXJ0ZWROb2RlX3NcblxuICAgIHlwYXJlbnQgPSB0aGlzXG4gICAgbmV3X2NoaWxkcyA9IG5ld19jaGlsZHMubWFwIChjaGlsZCktPlxuICAgICAgaWYgY2hpbGQuX3lfeG1sP1xuICAgICAgICBjaGlsZC5feV94bWxcbiAgICAgIGVsc2UgaWYgY2hpbGQubm9kZVR5cGUgPT0gY2hpbGQuVEVYVF9OT0RFXG4gICAgICAgIGNoaWxkLnRleHRDb250ZW50XG4gICAgICBlbHNlXG4gICAgICAgIHljaGlsZCA9IG5ldyBZWG1sKGNoaWxkKVxuICAgICAgICB5Y2hpbGQuX3NldFBhcmVudCB5cGFyZW50XG4gICAgICAgIHljaGlsZFxuICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikuaW5zZXJ0Q29udGVudHMgcG9zLCBuZXdfY2hpbGRzXG5cbiAgX3Byb3h5ICdpbnNlcnRCZWZvcmUnLCBpbnNlcnRCZWZvcmVcbiAgX3Byb3h5ICdhcHBlbmRDaGlsZCcsIGluc2VydEJlZm9yZVxuICBfcHJveHkgJ3JlbW92ZUF0dHJpYnV0ZScsIChuYW1lKS0+XG4gICAgQHJlbW92ZUF0dHIgbmFtZVxuICBfcHJveHkgJ3NldEF0dHJpYnV0ZScsIChuYW1lLCB2YWx1ZSktPlxuICAgIEBhdHRyIG5hbWUsIHZhbHVlXG5cbiAgcmVtb3ZlQ2hpbGQgPSAobm9kZSktPlxuICAgIG5vZGUuX3lfeG1sLnJlbW92ZSgpXG4gIF9wcm94eSAncmVtb3ZlQ2hpbGQnLCByZW1vdmVDaGlsZFxuICByZXBsYWNlQ2hpbGQgPSAoaW5zZXJ0ZWROb2RlLCByZXBsYWNlZE5vZGUpLT4gIyBUT0RPOiBoYW5kbGUgcmVwbGFjZSB3aXRoIHJlcGxhY2UgYmVoYXZpb3IuLi5cbiAgICBpbnNlcnRCZWZvcmUuY2FsbCB0aGlzLCBpbnNlcnRlZE5vZGUsIHJlcGxhY2VkTm9kZVxuICAgIHJlbW92ZUNoaWxkLmNhbGwgdGhpcywgcmVwbGFjZWROb2RlXG4gIF9wcm94eSAncmVwbGFjZUNoaWxkJywgcmVwbGFjZUNoaWxkXG5cbiAgcmVtb3ZlID0gKCktPlxuICAgIGlmIEBfbW9kZWwudmFsKFwicGFyZW50XCIpP1xuICAgICAgQHJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgdGhpc19kb20gPSB0aGlzLl9kb21cbiAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICB0aGlzX2RvbS5yZW1vdmUoKVxuXG4gIF9wcm94eSAncmVtb3ZlJywgcmVtb3ZlXG5cbmlmIHdpbmRvdz9cbiAgaWYgd2luZG93Llk/XG4gICAgaWYgd2luZG93LlkuTGlzdD9cbiAgICAgIHdpbmRvdy5ZLlhtbCA9IFlYbWxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWS5MaXN0IVwiXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWVhtbFxuXG5cblxuXG5cblxuXG5cblxuIl19
