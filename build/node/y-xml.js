var YXml, dont_proxy, initialize_proxies, proxies_are_initialized, proxy_token;

YXml = (function() {
  function YXml(tag_or_dom, attributes) {
    var _classes, a, a_name, c, c_name, j, len, ref, tagname;
    if (attributes == null) {
      attributes = {};
    }
    if (tag_or_dom == null) {

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
        ref = _classes.split(" ");
        for (c = j = 0, len = ref.length; j < len; c = ++j) {
          c_name = ref[c];
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

  YXml.prototype._name = "Xml";

  YXml.prototype._getModel = function(Y, ops) {
    var attribute, c, child, j, k, l, len, len1, len2, ref, ref1, ref2;
    if (this._model == null) {
      if (this._dom != null) {
        this._xml.tagname = this._dom.tagName.toLowerCase();
        this._xml.attributes = {};
        this._xml.classes = {};
        ref = this._dom.attributes;
        for (j = 0, len = ref.length; j < len; j++) {
          attribute = ref[j];
          if (attribute.name === "class") {
            ref1 = attribute.value.split(" ");
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              c = ref1[k];
              this._xml.classes[c] = true;
            }
          } else {
            this._xml.attributes[attribute.name] = attribute.value;
          }
        }
        this._xml.children = [];
        ref2 = this._dom.childNodes;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          child = ref2[l];
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
      var c, children, event, i, j, len, parent, ref, results;
      results = [];
      for (j = 0, len = events.length; j < len; j++) {
        event = events[j];
        if (event.name === "parent" && event.type !== "add") {
          parent = event.oldValue;
          children = (ref = parent._model.val("children")) != null ? ref.val() : void 0;
          if (children != null) {
            results.push((function() {
              var k, len1, results1;
              results1 = [];
              for (i = k = 0, len1 = children.length; k < len1; i = ++k) {
                c = children[i];
                if (c === this) {
                  parent._model.val("children")["delete"](i);
                  break;
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            }).call(this));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
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
    var child, j, len, name, ref, ref1, value, xml;
    xml = "<" + this._model.val("tagname");
    ref = this.attr();
    for (name in ref) {
      value = ref[name];
      xml += " " + name + '="' + value + '"';
    }
    xml += ">";
    ref1 = this._model.val("children").val();
    for (j = 0, len = ref1.length; j < len; j++) {
      child = ref1[j];
      xml += child.toString();
    }
    xml += '</' + this._model.val("tagname") + '>';
    return xml;
  };

  YXml.prototype.attr = function(name, value) {
    var attrs, c, classes, cs, j, len;
    if (arguments.length > 1) {
      if (value.constructor !== String) {
        throw new Error("The attributes must be of type String!");
      }
      if (name === "class") {
        classes = value.split(" ");
        cs = {};
        for (j = 0, len = classes.length; j < len; j++) {
          c = classes[j];
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
    var j, len, name, ref;
    ref = names.split(" ");
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      this._model.val("classes").val(name, true);
    }
    return this;
  };

  YXml.prototype.after = function() {
    var c, content, contents, j, k, len, len1, parent, position, ref;
    parent = this._model.val("parent");
    if (parent == null) {
      throw new Error("This Xml Element must not have siblings! (for it does not have a parent)");
    }
    ref = parent.getChildren();
    for (position = j = 0, len = ref.length; j < len; position = ++j) {
      c = ref[position];
      if (c === this) {
        break;
      }
    }
    contents = [];
    for (k = 0, len1 = arguments.length; k < len1; k++) {
      content = arguments[k];
      if (content instanceof YXml) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position + 1, contents);
  };

  YXml.prototype.append = function() {
    var content, j, len;
    for (j = 0, len = arguments.length; j < len; j++) {
      content = arguments[j];
      if (content instanceof YXml) {
        content._setParent(this);
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      this._model.val("children").push(content);
    }
    return this;
  };

  YXml.prototype.before = function() {
    var c, content, contents, j, k, len, len1, parent, position, ref;
    parent = this._model.val("parent");
    if (parent == null) {
      throw new Error("This Xml Element must not have siblings! (for it does not have a parent)");
    }
    ref = parent.getChildren();
    for (position = j = 0, len = ref.length; j < len; position = ++j) {
      c = ref[position];
      if (c === this) {
        break;
      }
    }
    contents = [];
    for (k = 0, len1 = arguments.length; k < len1; k++) {
      content = arguments[k];
      if (content instanceof YXml) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position, contents);
  };

  YXml.prototype.empty = function() {
    var child, children, j, len, ref, results;
    children = this._model.val("children");
    ref = children.val();
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      child = ref[j];
      if (child.constructor === String) {
        results.push(children["delete"](0));
      } else {
        results.push(child.remove());
      }
    }
    return results;
  };

  YXml.prototype.hasClass = function(className) {
    if (this._model.val("classes").val(className) != null) {
      return true;
    } else {
      return false;
    }
  };

  YXml.prototype.prepend = function() {
    var content, j, len;
    for (j = 0, len = arguments.length; j < len; j++) {
      content = arguments[j];
      if (content instanceof YXml) {
        content._setParent(this);
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      this._model.val("children").insert(0, content);
    }
    return this;
  };

  YXml.prototype.remove = function() {
    var parent;
    parent = this._model["delete"]("parent");
    return this;
  };

  YXml.prototype.removeAttr = function(attrName) {
    if (attrName === "class") {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      this._model.val("attributes")["delete"](attrName);
    }
    return this;
  };

  YXml.prototype.removeClass = function() {
    var className, j, len;
    if (arguments.length === 0) {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      for (j = 0, len = arguments.length; j < len; j++) {
        className = arguments[j];
        this._model.val("classes")["delete"](className);
      }
    }
    return this;
  };

  YXml.prototype.toggleClass = function() {
    var className, classes, j, len;
    for (j = 0, len = arguments.length; j < len; j++) {
      className = arguments[j];
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
    return this._model.val("parent");
  };

  YXml.prototype.getChildren = function() {
    return this._model.val("children").val();
  };

  YXml.prototype.getPosition = function() {
    var c, i, j, len, parent, ref;
    parent = this._model.val("parent");
    if (parent != null) {
      ref = parent._model.val("children").val();
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        c = ref[i];
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
    var attr_name, attr_value, child, dom, i, j, len, ref, ref1, setClasses, that;
    if (this._dom == null) {
      this._dom = document.createElement(this._model.val("tagname"));
      ref = this.attr();
      for (attr_name in ref) {
        attr_value = ref[attr_name];
        this._dom.setAttribute(attr_name, attr_value);
      }
      ref1 = this.getChildren();
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        child = ref1[i];
        if (child.constructor === String) {
          dom = document.createTextNode(child);
        } else {
          dom = child.getDom();
        }
        this._dom.insertBefore(dom);
      }
    }
    that = this;
    if (this._dom._y_xml == null) {
      this._dom._y_xml = this;
      initialize_proxies.call(this);
      this._model.val("children").observe(function(events) {
        var children, deleted, event, k, len1, newNode, results, rightNode;
        results = [];
        for (k = 0, len1 = events.length; k < len1; k++) {
          event = events[k];
          if (event.type === "insert") {
            if (event.value.constructor === String) {
              newNode = document.createTextNode(event.value);
            } else {
              newNode = event.value.getDom();
              event.value._setParent(that);
            }
            children = that._dom.childNodes;
            if (children.length === event.position) {
              rightNode = null;
            } else {
              rightNode = children[event.position];
            }
            results.push(dont_proxy(function() {
              return that._dom.insertBefore(newNode, rightNode);
            }));
          } else if (event.type === "delete") {
            deleted = event.oldValue.getDom();
            results.push(dont_proxy(function() {
              return that._dom.removeChild(deleted);
            }));
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
      this._model.val("attributes").observe(function(events) {
        var event, k, len1, newval, results;
        results = [];
        for (k = 0, len1 = events.length; k < len1; k++) {
          event = events[k];
          if (event.type === "add" || event.type === "update") {
            newval = event.object.val(event.name);
            results.push(dont_proxy(function() {
              return that._dom.setAttribute(event.name, newval);
            }));
          } else if (event.type === "delete") {
            results.push(dont_proxy(function() {
              return that._dom.removeAttribute(event.name);
            }));
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
      setClasses = function() {
        return that._model.val("classes").observe(function(events) {
          var event, k, len1, results;
          results = [];
          for (k = 0, len1 = events.length; k < len1; k++) {
            event = events[k];
            if (event.type === "add" || event.type === "update") {
              results.push(dont_proxy(function() {
                return that._dom.classList.add(event.name);
              }));
            } else if (event.type === "delete") {
              results.push(dont_proxy(function() {
                return that._dom.classList.remove(event.name);
              }));
            } else {
              results.push(void 0);
            }
          }
          return results;
        });
      };
      setClasses();
      this._model.observe(function(events) {
        var event, k, len1, results;
        results = [];
        for (k = 0, len1 = events.length; k < len1; k++) {
          event = events[k];
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
            results.push(setClasses());
          } else {
            results.push(void 0);
          }
        }
        return results;
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

initialize_proxies = function() {
  var _proxy, f_add, f_remove, insertBefore, removeChild, replaceChild, that;
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
    var child, new_childs, pos;
    if (adjacentNode != null) {
      pos = adjacentNode._y_xml.getPosition();
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
    new_childs = new_childs.map(function(child) {
      if (child._y_xml != null) {
        return child._y_xml;
      } else if (child.nodeType === child.TEXT_NODE) {
        return child.textContent;
      } else {
        return new YXml(child);
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
  return _proxy('replaceChild', replaceChild);
};

if (typeof window !== "undefined" && window !== null) {
  if (window.Y != null) {
    window.Y.Xml = YXml;
  } else {
    throw new Error("You must first import Y!");
  }
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = YXml;
}
