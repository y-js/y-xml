export function reflectChangesOnDom (yxml) {
  yxml.observe(event => {
    if (yxml.dom != null) {
      yxml._mutualExclude(() => {
        let anchorViewPosition = getAnchorViewPosition(yxml._scrollElement)
        if (event.type === 'attributeChanged') {
          yxml.dom.setAttribute(event.name, event.value)
        } else if (event.type === 'attributeRemoved') {
          yxml.dom.removeAttribute(event.name)
        } else if (event.type === 'childInserted' || event.type === 'insert') {
          let nodes = event.values
          for (let i = nodes.length - 1; i >= 0; i--) {
            let node = nodes[i]
            node.setDomFilter(yxml._domFilter)
            node.enableSmartScrolling(yxml._scrollElement)
            let dom = node.getDom()
            let fixPosition
            let nextDom = null
            if (yxml._content.length > event.index + i + 1) {
              nextDom = yxml.get(event.index + i + 1).getDom()
            }
            yxml.dom.insertBefore(dom, nextDom)
            if (anchorViewPosition === null) {
              // nop
            } else if (anchorViewPosition.anchor !== null) {
              // no scrolling when current selection
              if (!dom.contains(anchorViewPosition.anchor) && !anchorViewPosition.anchor.contains(dom)) {
                fixPosition = anchorViewPosition
              }
            } else if (getBoundingClientRect(dom).top <= 0) {
              // adjust scrolling if modified element is out of view,
              // there is no anchor element, and the browser did not adjust scrollTop (this is checked later)
              fixPosition = anchorViewPosition
            }
            fixScrollPosition(yxml._scrollElement, fixPosition)
          }
        } else if (event.type === 'childRemoved' || event.type === 'delete') {
          for (let i = event.values.length - 1; i >= 0; i--) {
            let dom = event.values[i].dom
            let fixPosition = null
            if (anchorViewPosition === null) {
              // nop
            } else if (anchorViewPosition.anchor !== null) {
              // no scrolling when current selection
              if (!dom.contains(anchorViewPosition.anchor) && !anchorViewPosition.anchor.contains(dom)) {
                fixPosition = anchorViewPosition
              }
            } else if (getBoundingClientRect(dom).top <= 0) {
              // adjust scrolling if modified element is out of view,
              // there is no anchor element, and the browser did not adjust scrollTop (this is checked later)
              fixPosition = anchorViewPosition
            }
            dom.remove()
            fixScrollPosition(yxml._scrollElement, fixPosition)
          }
        }
      })
    }
  })
}

export function getAnchorViewPosition (scrollElement) {
  if (scrollElement == null) {
    return null
  }
  let anchor = document.getSelection().anchorNode
  if (anchor != null) {
    let top = getBoundingClientRect(anchor).top
    if (top >= 0 && top <= document.documentElement.clientHeight) {
      return {
        anchor: anchor,
        top: top
      }
    }
  }
  return {
    anchor: null,
    scrollTop: scrollElement.scrollTop,
    scrollHeight: scrollElement.scrollHeight
  }
}

// get BoundingClientRect that works on text nodes
export function getBoundingClientRect (element) {
  if (element.getBoundingClientRect != null) {
    // is element node
    return element.getBoundingClientRect()
  } else {
    // is text node
    if (element.parentNode == null) {
      // range requires that text nodes have a parent
      let span = document.createElement('span')
      span.appendChild(element)
    }
    let range = document.createRange()
    range.selectNode(element)
    return range.getBoundingClientRect()
  }
}

export function fixScrollPosition (scrollElement, fix) {
  if (scrollElement !== null && fix !== null) {
    if (fix.anchor === null) {
      if (scrollElement.scrollTop === fix.scrollTop) {
        scrollElement.scrollTop += scrollElement.scrollHeight - fix.scrollHeight
      }
    } else {
      scrollElement.scrollTop += getBoundingClientRect(fix.anchor).top - fix.top
    }
  }
}

export function defaultDomFilter (node, attributes) {
  return attributes
}

/*
 * 1. Check if any of the nodes was deleted
 * 2. Iterate over the children.
 *    2.1 If a node exists without __yxml property, insert a new node
 *    2.2 If _contents.length < dom.childNodes.length, fill the
 *        rest of _content with childNodes
 *    2.3 If a node was moved, delete it and
 *       recreate a new yxml element that is bound to that node.
 *       You can detect that a node was moved because expectedId
 *       !== actualId in the list
 */
export function applyChangesFromDom (yxml) {
  // list of known children. anything else should be deleted
  let knownChildren =
    new Set(
      Array.prototype.map.call(yxml.dom.childNodes, child => child.__yxml)
      .filter(id => id !== undefined)
    )
  // 1. Check if any of the nodes was deleted
  for (let i = yxml._content.length - 1; i >= 0; i--) {
    let childType = yxml.get(i)
    if (!knownChildren.has(childType)) {
      yxml.delete(i, 1)
    }
  }
  // 2. iterate
  let childNodes = yxml.dom.childNodes
  let len = childNodes.length
  for (let domCnt = 0, yCnt = 0; domCnt < len; domCnt++) {
    let child = childNodes[domCnt]
    if (child.__yxml != null) {
      if (child.__yxml === false) {
        // should be ignored or is going to be deleted
        continue
      }
      if (yCnt < yxml.length) {
        let expectedNode = yxml.get(yCnt)
        if (expectedNode !== child.__yxml) {
          // 2.3 Not expected node
          let index = yxml._content.findIndex(c => c.type[0] === child.__yxml._model[0] && c.type[1] === child.__yxml._model[1])
          if (index < 0) {
            // element is going to be deleted by its previous parent
            child.__yxml = null
          } else {
            yxml.delete(index, 1)
          }
          yCnt += yxml.insertDomElements(yCnt, [child])
        } else {
          yCnt++
        }
        // if this is the expected node id, just continue
      } else {
        // 2.2 fill _conten with child nodes
        yCnt += yxml.insertDomElements(yCnt, [child])
      }
    } else {
      // 2.1 A new node was found
      yCnt += yxml.insertDomElements(yCnt, [child])
    }
  }
}
