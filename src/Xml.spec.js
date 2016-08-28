/* global createUsers, databases, wait, compareAllUsers, getRandomNumber, getRandomString, applyRandomTransactionsNoGCNoDisconnect, applyRandomTransactionsAllRejoinNoGC, applyRandomTransactionsWithGC, async, describeManyTimes */
/* eslint-env browser,jasmine */
'use strict'

var Y = require('../../yjs/src/SpecHelper.js')
require('./Xml.js')(Y)

var numberOfXmlTests = 100
var repeatXmlTests = 200

function compareXml (a, b) {
  if (a instanceof Text && b instanceof Text) {
    expect(a.textContent).toEqual(b.textContent)
  } else if (a instanceof Element && b instanceof Element) {
    expect(a.attributes.length).toEqual(b.attributes.length)
    var aAttrs = attrsToArray(a.attributes)
    var bAttrs = attrsToArray(b.attributes)
    expect(aAttrs).toEqual(bAttrs)
    expect(a.childNodes.length).toEqual(b.childNodes.length)
    Array.prototype.forEach.call(a.childNodes, function (v, i) {
      compareXml(v, b.childNodes[i])
    })
  } else {
    throw new Error('Unexpected value. cannot compare')
  }
}
function compareXmlValues (as) {
  var firstVal
  for (var a of as) {
    if (firstVal == null) {
      firstVal = a.dom
    } else {
      compareXml(a.dom, firstVal)
    }
  }
}
function attrsToArray (attrs) {
  return Array.prototype.map.call(attrs, function (a) {
    return {
      name: a.name,
      value: a.value
    }
  }).sort(function (a, b) {
    return a.name > b.name
  })
}

for (let database of databases) {
  describe(`Xml Type (DB: ${database})`, function () {
    var y1, y2, y3, yconfig1, yconfig2, yconfig3, flushAll, dom1, dom2, dom3 // eslint-disable-line

    beforeEach(async(function * (done) {
      yield createUsers(this, 3, database, 'Xml("p")')
      y1 = (yconfig1 = this.users[0]).share.root
      y2 = (yconfig2 = this.users[1]).share.root
      y3 = (yconfig3 = this.users[2]).share.root
      dom1 = yield y1.getDom()
      dom2 = yield y2.getDom()
      dom3 = yield y3.getDom()
      flushAll = Y.utils.globalRoom.flushAll
      yield wait(10)

      var promises = []
      for (var u = 0; u < this.users.length; u++) {
        promises.push(this.users[u].share.root.getDom())
      }
      var doms = yield Promise.all(promises)
      this.vals = doms.map((dom, i) => {
        return {
          dom: dom,
          y: this.users[i].share.root
        }
      })
      done()
    }))
    afterEach(async(function * (done) {
      // TODO: also make this work..
      yield compareAllUsers(this.users)
      done()
    }))

    describe('Basic tests', function () {
      it('set property', async(function * (done) {
        y1.attributes.set('height', 10)
        expect(y1.attributes.get('height')).toEqual(10)
        yield flushAll()
        expect(y2.attributes.get('height')).toEqual(y1.attributes.get('height'))
        expect(y3.attributes.get('height')).toEqual(y1.attributes.get('height'))
        done()
      }))
      it('throw insert & delete events for attributes', async(function * (done) {
        var event
        y1.observe(function (e) {
          event = e
        })
        y1.attributes.set('key', 'value')
        expect(event).toEqual({
          type: 'attributeChanged',
          value: 'value',
          name: 'key'
        })
        y1.attributes.delete('key')
        expect(event).toEqual({
          type: 'attributeRemoved',
          name: 'key'
        })
        yield wait(50)
        done()
      }))
      it('throw insert & delete events for elements', async(function * (done) {
        var event
        y1.observe(function (e) {
          event = e
          delete event.valueId // can't predict this..
          delete event._content
          delete event.values
        })
        y1.insert(0, ['some text'])
        expect(event).toEqual({
          type: 'childInserted',
          nodes: ['some text'],
          index: 0
        })
        y1.delete(0)
        expect(event).toEqual({
          type: 'childRemoved',
          index: 0
        })
        yield wait(50)
        done()
      }))
    })
    if (typeof window !== 'undefined') {
      describe('Dom Tests', function () {
        it('dom changes on y attribute change', async(function * (done) {
          var dom = yield y1.getDom()
          y1.attributes.set('height', '100px')
          expect(dom.getAttribute('height')).toEqual('100px')
          done()
        }))
        it('y changes on dom attribute change', async(function * (done) {
          var dom = yield y1.getDom()
          dom.setAttribute('height', '100px')
          yield wait()
          expect(y1.attributes.get('height')).toEqual('100px')
          done()
        }))
        it('dom changes on y attribute change (class)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.attributes.set('class', 'stuffy stuff')
          expect(dom.getAttribute('class')).toEqual('stuffy stuff')
          done()
        }))
        it('y changes on dom attribute change (class)', async(function * (done) {
          var dom = yield y1.getDom()
          dom.setAttribute('class', 'stuffy stuff')
          yield wait()
          expect(y1.attributes.get('class')).toEqual('stuffy stuff')
          done()
        }))
        it('y changes on dom element insert (Text)', async(function * (done) {
          var dom = yield y1.getDom()
          var newNode = new Text('text')
          dom.insertBefore(newNode, null)
          yield wait()
          expect(y1.get(0)).toEqual('text')
          done()
        }))
        it('dom changes on y element insert (Text)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, ['text'])
          yield wait()
          expect(dom.childNodes[0].textContent).toEqual('text')
          done()
        }))
        it('y changes on dom element insert & delete (Element)', async(function * (done) {
          var newNode = document.createElement('DIV')
          dom1.insertBefore(newNode, null)
          yield wait()
          var e = yield y1.get(0)
          var tagname = yield e.tagname
          expect(tagname).toEqual('DIV')
          expect(y1.length).toEqual(1)
          expect(dom1.childNodes.length).toEqual(1)
          dom1.childNodes[0].remove()
          yield wait()
          expect(y1.length).toEqual(0)
          expect(dom1.childNodes.length).toEqual(0)
          done()
        }))
        it('dom changes on y element insert & delete (Element)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, [Y.Xml('DIV')])
          yield wait(100)
          expect(dom.childNodes[0].tagName).toEqual('DIV')
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          y1.delete(0, 1)
          yield wait()
          expect(y1.length).toEqual(0)
          expect(dom.childNodes.length).toEqual(0)
          done()
        }))
        it('delete consecutive (Text)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, ['1', '2', '3'])
          yield wait()
          y1.delete(1, 2)
          yield wait()
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          expect(dom.childNodes[0].textContent).toEqual('1')
          done()
        }))
        it('delete non-consecutive (1) (Text)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, ['1', '2', '3'])
          yield wait()
          y1.delete(0, 1)
          y1.delete(1, 1)
          yield wait()
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          expect(dom.childNodes[0].textContent).toEqual('2')
          done()
        }))
        it('delete non-consecutive (2) (Text)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, ['1', '2', '3'])
          yield wait()
          y1.delete(0, 1)
          y1.delete(1, 1)
          yield wait()
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          expect(dom.childNodes[0].textContent).toEqual('2')
          done()
        }))
        it('delete consecutive (Element)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, [Y.Xml('A'), Y.Xml('B'), Y.Xml('C')])
          yield wait()
          y1.delete(1, 2)
          yield wait()
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          expect(dom.childNodes[0].tagName).toEqual('A')
          done()
        }))
        it('delete non-consecutive (1) (Element)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, [Y.Xml('A'), Y.Xml('B'), Y.Xml('C')])
          yield wait()
          y1.delete(0, 1)
          y1.delete(1, 1)
          yield wait()
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          expect(dom.childNodes[0].tagName).toEqual('B')
          done()
        }))
        it('delete non-consecutive (2) (Element)', async(function * (done) {
          var dom = yield y1.getDom()
          y1.insert(0, [Y.Xml('A'), Y.Xml('B'), Y.Xml('C')])
          yield wait()
          y1.delete(0, 1)
          y1.delete(1, 1)
          yield wait()
          expect(y1.length).toEqual(1)
          expect(dom.childNodes.length).toEqual(1)
          expect(dom.childNodes[0].tagName).toEqual('B')
          done()
        }))
        it('receive a bunch of elements inserts (with disconnect)', async(function * (done) {
          yield yconfig2.disconnect()
          yield wait()
          y1.insert(0, [Y.Xml('A'), Y.Xml('B'), Y.Xml('C')])
          yield wait(1000)
          yield yconfig2.reconnect()
          yield wait(1000)
          yield flushAll()
          yield wait(1000)
          expect(y1.length).toEqual(y2.length)
          expect(dom1.childNodes.length).toEqual(dom2.childNodes.length)

          done()
        }))
        it('handles bunch of dom inserts in different orders (1)', async(function * (done) {
          var dom = yield y1.getDom()
          var el1 = document.createElement('input')
          var el2 = new Text('some text')
          dom.appendChild(el1)
          dom.appendChild(el2)
          yield flushAll()
          yield compareXmlValues(this.vals)
          done()
        }))
        it('handles bunch of dom inserts in different orders (2)', async(function * (done) {
          var dom = yield y1.getDom()
          var el1 = document.createElement('input')
          var el2 = new Text('some text')
          dom.appendChild(el2) // diff is here!
          dom.appendChild(el1)
          yield flushAll()
          yield wait()
          yield compareXmlValues(this.vals)
          done()
        }))
      })
      describeManyTimes(repeatXmlTests, `Random tests`, function () {
        var randomXmlTransactions = [
          function attributeChange (a) {
            a.dom.setAttribute(getRandomString() + 'x', getRandomString())
          },
          function insertText (a) {
            var i = getRandomNumber(a.dom.childNodes.length + 1) // also expect succ to be undefined!
            var succ = a.dom.childNodes[i]
            a.dom.insertBefore(new Text(getRandomString()), succ)
          },
          function insertDom (a) {
            var i = getRandomNumber(a.dom.childNodes.length + 1) // also expect succ to be undefined!
            var succ = a.dom.childNodes[i]
            a.dom.insertBefore(document.createElement(getRandomString() + 'a'), succ)
          },
          function deleteChild (a) {
            var i = getRandomNumber(a.dom.childNodes.length)
            var d = a.dom.childNodes[i]
            if (d != null) {
              d.remove()
            }
          },
          function insertTextSecondLayer (a) {
            var dom = a.dom.children[getRandomNumber(a.dom.children.length)]
            if (dom != null) {
              var i = getRandomNumber(dom.childNodes.length + 1) // also expect succ to be undefined!
              var succ = dom.childNodes[i]
              dom.insertBefore(new Text(getRandomString()), succ)
            }
          },
          function insertDomSecondLayer (a) {
            var dom = a.dom.children[getRandomNumber(a.dom.children.length)]
            if (dom != null) {
              var i = getRandomNumber(dom.childNodes.length + 1) // also expect succ to be undefined!
              var succ = dom.childNodes[i]
              dom.insertBefore(document.createElement(getRandomString() + 'a'), succ)
            }
          },
          function deleteChildSecondLayer (a) {
            var dom = a.dom.children[getRandomNumber(a.dom.children.length)]
            if (dom != null) {
              var i = getRandomNumber(dom.childNodes.length)
              var d = dom.childNodes[i]
              if (d != null) {
                d.remove()
              }
            }
          }
        ]
        it('vals.length equals users.length', async(function * (done) {
          expect(this.vals.length).toEqual(this.users.length)
          done()
        }))
        it(`succeed after ${numberOfXmlTests} actions, no GC, no disconnect`, async(function * (done) {
          yield applyRandomTransactionsNoGCNoDisconnect(this.users, this.vals, randomXmlTransactions, numberOfXmlTests)
          yield flushAll()
          yield wait(1000)
          yield compareXmlValues(this.vals)
          // yield compareAllUsers(this.users)
          done()
        }))
        it(`succeed after ${numberOfXmlTests} actions, no GC, all users disconnecting/reconnecting`, async(function * (done) {
          yield applyRandomTransactionsAllRejoinNoGC(this.users, this.vals, randomXmlTransactions, numberOfXmlTests)
          yield flushAll()
          yield wait(1000)
          yield flushAll()
          yield wait(1000)
          yield compareXmlValues(this.vals)
          // yield compareAllUsers(this.users)
          done()
        }))
        it(`succeed after ${numberOfXmlTests} actions, GC, user[0] is not disconnecting`, async(function * (done) {
          yield applyRandomTransactionsWithGC(this.users, this.vals, randomXmlTransactions, numberOfXmlTests)
          yield wait()
          yield flushAll()
          yield wait()
          yield flushAll()
          yield wait()
          yield compareXmlValues(this.vals)
          // yield compareAllUsers(this.users)
          done()
        }))
      })
    }
  })
}
