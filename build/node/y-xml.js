var YXml, _proxy, dont_proxy, initialize_proxies, proxies_are_initialized, proxy_token,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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
    var c, content, contents, j, k, len, len1, parent, position, ref;
    this._checkForModel();
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
    var c, content, contents, j, k, len, len1, parent, position, ref;
    this._checkForModel();
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
    var c, i, j, len, parent, ref;
    this._checkForModel();
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

  return Node;

})();

YXml.Text = (function(superClass) {
  extend(Text, superClass);

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
        var event, j, len, new_text, results;
        results = [];
        for (j = 0, len = events.length; j < len; j++) {
          event = events[j];
          if (event.name === "text" && (event.type === "add" || event.type === "update")) {
            new_text = that._model.val("text");
            if (that._dom.data !== new_text) {
              results.push(that._dom.data = new_text);
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
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

YXml.Element = (function(superClass) {
  extend(Element, superClass);

  function Element(tag_or_dom, attributes) {
    var _classes, a, a_name, c, c_name, j, len, ref, tagname;
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
        ref = _classes.split(" ");
        for (c = j = 0, len = ref.length; j < len; c = ++j) {
          c_name = ref[c];
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
    var attribute, c, child, j, k, l, len, len1, len2, new_yxml, ref, ref1, ref2;
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
    var child, j, len, name, ref, ref1, value, xml;
    this._checkForModel();
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

  Element.prototype.attr = function(name, value) {
    var attrs, c, classes, cs, j, len;
    this._checkForModel();
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

  Element.prototype.addClass = function(names) {
    var j, len, name, ref;
    this._checkForModel();
    ref = names.split(" ");
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      this._model.val("classes").val(name, true);
    }
    return this;
  };

  Element.prototype.append = function() {
    var content, j, len;
    this._checkForModel();
    for (j = 0, len = arguments.length; j < len; j++) {
      content = arguments[j];
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
    var content, j, len;
    this._checkForModel();
    for (j = 0, len = arguments.length; j < len; j++) {
      content = arguments[j];
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
    var child, children, j, len, ref, results;
    this._checkForModel();
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
    var className, j, len;
    this._checkForModel();
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

  Element.prototype.toggleClass = function() {
    var className, classes, j, len;
    this._checkForModel();
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

  Element.prototype.getChildren = function() {
    this._checkForModel();
    return this._model.val("children").val();
  };

  Element.prototype.getDom = function() {
    var attr_name, attr_value, child, dom, i, j, len, ref, ref1, setClasses, svg, that;
    this._checkForModel();
    if (this._dom == null) {
      svg = this._model.val("tagname").match(/g|svg|rect|line|path|ellipse|text|tspan|defs|symbol|use|linearGradient|pattern/g);
      if (svg != null) {
        this._dom = document.createElementNS("http://www.w3.org/2000/svg", this._model.val("tagname"));
      } else {
        this._dom = document.createElement(this._model.val("tagname"));
      }
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
        this._dom.insertBefore(dom, null);
      }
    }
    that = this;
    if (this._dom._y_xml == null) {
      this._dom._y_xml = this;
      initialize_proxies.call(this);
      this._model.val("children").observe(function(events) {
        var deleted, event, k, len1, newNode, results, rightElement, rightNode;
        results = [];
        for (k = 0, len1 = events.length; k < len1; k++) {
          event = events[k];
          if (event.type === "insert") {
            newNode = event.value.getDom();
            rightElement = event.reference.getNext();
            if (rightElement.type === "Delimiter") {
              rightNode = null;
            } else {
              rightNode = rightElement.getContent()._dom;
            }
            results.push(dont_proxy(function() {
              return that._dom.insertBefore(newNode, rightNode);
            }));
          } else if (event.type === "delete") {
            deleted = that._model.val("children").val(event.position)._dom;
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
      var c, j, len, ref, res;
      res = "";
      ref = that.getChildren();
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
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
    var child, i, j, len, n, new_childs, pos, ref, yparent;
    if (adjacentNode != null) {
      ref = this.getChildren();
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        n = ref[i];
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
