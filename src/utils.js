
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
  let undeletedKnownChildren = Array.prototype.map.call(yxml.dom.childNodes, child => child.__yxml)
                                    .filter(id => id !== undefined)
  // 1. Check if any of the nodes was deleted
  for (let i = yxml._content.length - 1; i >= 0; i--) {
    let childType = yxml.get(i)
    if (!undeletedKnownChildren.some(undel => undel === childType)) {
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
