"use strict";

var AppStatus = function() {
    this.gasLimit = null
    this.difficulty = null
    this.pendingTransactions = []
    this.blockFilter = null
    this.loadedDocs = []
    this.selectedDocIndex = null
}

AppStatus.prototype.addTransaction = function(txhash) {
    this.pendingTransactions.push(txhash)
}

AppStatus.prototype.removeTransaction = function(txhash) {
  var index = inArrayIndex(this.pendingTransactions, txhash)
  if (index > -1) {
    delete this.pendingTransactions[index]
  }
}

AppStatus.prototype.isTransactionPending = function(txhash) {
  var j = inArrayIndex(this.pendingTransactions, txhash)
  if (j > -1) return true
  return false
}

AppStatus.prototype.composeStatus = function(block) {
  var msgTot = ''
  msgTot  = 'Pending block #' + block.number + '<br>'
  msgTot += 'Gas limit: ' + block.gasLimit + '<br>'

  document.getElementById('pending-status').innerHTML = msgTot
}

AppStatus.prototype.displayPending = function() {
  var msgTot = ''
  for (var index in this.pendingTransactions) {
    var txhash = this.pendingTransactions[index]
    var foo = txhash.substring(0, 8) + '...' + txhash.substring(txhash.length - 6)
    var msg = '<li><a href="#tx/' + txhash + '">' + foo + '</a></li>'
    msgTot += msg
  }
  document.getElementById('pending-tx').innerHTML = msgTot

  this.composeStatus(web3.eth.getBlock('pending'))
}

AppStatus.prototype.stopWatching = function() {
  if (this.blockFilter) this.blockFilter.stopWatching()
}

AppStatus.prototype.watchBlocks = function(cb) {
  this.stopWatching()

  // create filter for new blocks
  var filter = web3.eth.filter('latest')
  var _this = this
  filter.watch(function(err, hash) {
    // get new block
    var latest = web3.eth.getBlock(hash)

    // loop through transactions
    for (var i = 0; i < latest.transactions.length; i++) {
      // get transaction hash
      var txhash = latest.transactions[i]
      if (_this.isTransactionPending(txhash)) {
        // callback
        cb(txhash, latest)

        // remove the transaction 
        _this.removeTransaction(txhash)
      }
    }

    appStatus.displayPending()
  })

  this.blockFilter = filter
}

AppStatus.prototype.watchEvents = function(address) {
  var ah = appStatus.loadedDocs[this.selectedDocIndex]
  if (!ah) return
  ah.WatchAllEvents({
    address: address,
    fromBlock: 'latest',
    toBlock: 'latest'
  }, null, function(evmEvent) {
    var link = evmEvent.name + '/' + evmEvent.result.blockNumber + '/' + evmEvent.result.transactionIndex + '/' + evmEvent.result.logIndex
    var foo = '<a href="#' + link + '">' + evmEvent.name + '</a>'
    // when we send a transaction, this is getting loaded another time. why?
    displayBlock(evmEvent.result.blockNumber, foo, 'success')
  })
  // var el = document.getElementById('notification-anchor').querySelector('.notification')
}

AppStatus.prototype.getDocAtIndex = function(i) {
  if (i in this.loadedDocs) return this.loadedDocs[i]
}

AppStatus.prototype.updateDoc = function() {
  // this whole function should be cleaned up
  var source = document.getElementById('source-code').value
  var abi = document.getElementById('abi-code').value

  var ah
  if (source) ah = new AbiHtml(source)
  else if (abi) ah = new AbiHtml(abi)

  if (this.loadedDocs && this.selectedDocIndex in this.loadedDocs && 'name' in this.loadedDocs[this.selectedDocIndex]) ah.name = this.loadedDocs[this.selectedDocIndex].name
  if (!('name' in ah)) ah.name = 'Untitled' + this.selectedDocIndex

  if (ah) this.loadedDocs[this.selectedDocIndex] = ah
}

AppStatus.prototype.renderInterface = function(index) {
  this.renderCodeView()
  this.displayUi()

  if (web3.isConnected()) {
      // display inital state
      this.displayPending()

      var _this = this
      this.watchBlocks(function(txhash, latest){
        // if the block transaction is in the local cache
        var foo = txhash.substring(0, 8) + '...' + txhash.substring(txhash.length - 6)
        var link = 'tx/' + txhash
        var msg = '<a href="#' + link + '">' + foo + '</a>'
        displayBlock(latest.number, msg, 'success')

        _this.displayPending()
      })


      var address = document.getElementById('option-address').value
      _this.watchEvents(address)
  }
}

AppStatus.prototype.renderCodeView = function() {
  var _this = this
  // draw all docs
  var ul = document.createElement('ul')

  if (this.selectedDocIndex in this.loadedDocs)
    for (var i = 0; i < this.loadedDocs.length; i++) {
      var ah = this.loadedDocs[i]
      console.log('drawing', ah.name)
      var li = document.createElement('li')
      var a = document.createElement('a')
      a.loadDoc = i
      var _this = this
      a.addEventListener('click', function(ev) {
          _this.selectedDocIndex = ev.srcElement.loadDoc
          _this.renderCodeView()
      }, false)
      if (!('name' in ah)) ah.name = 'Untitled' + i.toString()
      a.innerHTML = ah.name
      if (this.selectedDocIndex === i) li.classList.add('selected')
      li.appendChild(a)
      ul.appendChild(li)
    }

  // add a trailing tab for adding new documents
  var addTab = document.createElement('li')
  var a = document.createElement('a')
  a.innerHTML = "+"
  a.addEventListener('click', function(ev) {
      var ah = new AbiHtml()
      ah.name = filename
      _this.selectedDocIndex = _this.loadedDocs.length
      _this.loadedDocs.push(ah)
      _this.renderCodeView()
  }, false)

  addTab.appendChild(a)
  ul.appendChild(addTab)

  // display loaded doc
  var target = document.getElementById('docnav')
  target.innerHTML = ''
  target.appendChild(ul)

  var ah = this.loadedDocs[this.selectedDocIndex]
  if (ah) {
    document.getElementById('abi-code').value = (ah.abi ? JSON.stringify(ah.abi, null, "  ") : '')
    document.getElementById('source-code').value = (ah.source ? ah.source : '')
    document.getElementById('btnDeploy').disabled = ('source' in ah ? false : true)

    if (ah.abi) {
        var dom = ah.RenderTree()
        var el = document.getElementById('abi-tree')
        el.innerHTML = ''
        el.appendChild(dom)
    }
  }
}

// this need serious refactoring
AppStatus.prototype.displayUi = function() {
    var ah = this.loadedDocs[this.selectedDocIndex]
    if (!ah) return

    document.getElementById('main-container').innerHTML = ''
    ah.GetFunctionsSorted().forEach(function(f) {
        var section = document.createElement('section')
        section.classList.add('ac-container')
        var div = document.createElement('div')
        var input = document.createElement('input')
        input.type = 'checkbox'
        input.id = 'acc-function' + f.name
        input.name = 'acc-functions'
        var label = document.createElement('label')
        label.htmlFor = input.id
        label.innerHTML = f.name
        var article = document.createElement('article')
        article.appendChild(f.makeFieldForm(
            function(web3Function) {
                var foo = function() {
                        try {
                            web3Function.Call(getTransactionOptions(), function(evmFunction) {
                                if (evmFunction.error) {
                                    displayNotification(evmFunction.error.toString(), 'error')
                                } else {
                                    for (var i = 0; i < evmFunction.outputs.length; i++) {
                                        var field = evmFunction.outputs[i]
                                        var el = document.getElementById(field.htmlId)
                                        var val = field.value.toString()
                                        if (el) el.value = val
                                    }
                                }
                            })
                        } catch (e) {
                            displayNotification(e.toString(), 'error')
                        }
                    }
                    
                if (!connectInstance()) {
                    // try to connect if not connected
                    displayModal(makeConnectionDialog(function() {
                        document.getElementsByTagName("body")[0].classList.remove('dialogIsOpen')
                        foo()
                    }))
                } else
                    foo()

            },
            function(web3Function) {
                var foo = function(options) {
                    displayModal(makeTransactionDialog('Function: ' + f.name, function(transactionOptions) {
                        try {
                            web3Function.Transact(transactionOptions, function(evmFunction) {
                                if (evmFunction.error) {
                                    document.getElementById('tx-message').innerHTML = evmFunction.error.toString()
                                } else {
                                    _this.watchEvents(transactionOptions.to)
                                    // displayNotification('Sent transaction: <pre><a href="#tx/' + evmFunction.transactionHash + '">' + evmFunction.transactionHash.substring(0, 8) + '...' + evmFunction.transactionHash.substring(evmFunction.transactionHash.length - 6) + '</a></pre>', 'warning')


                                    // waitingTxs.push(evmFunction.transactionHash)
                                    appStatus.addTransaction(evmFunction.transactionHash)
                                    appStatus.displayPending()

                                    document.getElementsByTagName("body")[0].classList.remove('dialogIsOpen')
                                }
                            })

                        } catch (e) {
                            document.getElementById('tx-message').innerHTML = e.toString()
                        }
                    }, options))
                }
                if (!connectInstance()) {
                    displayModal(makeConnectionDialog(function() {
                        foo({
                            to: document.getElementById('option-address').value,
                            data: null,
                            gas: 300000,
                            gasPrice: web3.eth.gasPrice,
                            value: 0
                        })
                    }))
                } else
                    foo({
                        to: document.getElementById('option-address').value,
                        data: null,
                        gas: 300000,
                        gasPrice: web3.eth.gasPrice,
                        value: 0
                    })
            }))
        article.classList.add('ac-large')
        div.appendChild(input)
        div.appendChild(label)
        div.appendChild(article)
        section.appendChild(div)

        document.getElementById('main-container').appendChild(section)
    })

    document.getElementById('log-search').innerHTML = ''
    ah.GetEventsSorted().forEach(function(e) {
        var section = document.createElement('section')
        section.classList.add('ac-container')
        var div = document.createElement('div')
        var input = document.createElement('input')
        input.type = 'checkbox'
        input.id = 'acc-event' + e.name
        input.name = 'acc-events'
        var label = document.createElement('label')
        label.htmlFor = input.id
        label.innerHTML = e.name
        var article = document.createElement('article')
        var button = document.createElement('input')
        button.type = 'button'
        button.value = 'Search'
        button.addEventListener('click', function() {
            var bar = function(e, callback) {
                var filterFields = e.getFieldFilterValues()
                e.GetLogsFiltered(filterFields, function(ev) {
                    var div = document.createElement('div')
                    var dom = composeReceipt(ev)
                    var p = document.createElement('p')
                    var log = ev.result.blockNumber + '/' + ev.result.transactionIndex + '/' + ev.result.logIndex
                    var link = ev.name + '/' + ev.result.blockNumber + '/' + ev.result.transactionIndex + '/' + ev.result.logIndex
                    // p.innerHTML = '<a href="#' + link + '">Event permalink</a> <a href="#log/' + log + '">Raw log</a>'
                    p.innerHTML = '<a href="#log/' + log + '">Raw JSON</a>'
                    div.appendChild(p)
                    div.appendChild(dom)
                    if (typeof callback === 'function') callback(div)
                })
            }
            var foo = function(searchOptions, filterOptions) {
                var wrap = document.createElement('div')
                var h3 = document.createElement('h3')
                h3.innerHTML = 'Log search: ' + e.name
                var search = document.createElement('div')
                search.id = 'search-logsearch'
                var searchDom = e.makeFieldFilter('livesearch')
                var results = searchDom.querySelectorAll('input, select, textarea') // TODO fill in selector
                for (var i = 0; i < results.length; i++) {
                    var result = results[i]
                    result.addEventListener('change', function() {
                        var el = document.getElementById('contents-logsearch')
                        el.innerHTML = ''
                        bar(e, function(dom) {
                            el.insertBefore(dom, el.children[0])
                        })
                    }, false)
                    result.addEventListener('keyup', function() {
                        var el = document.getElementById('contents-logsearch')
                        el.innerHTML = ''
                        bar(e, function(dom) {
                            el.insertBefore(dom, el.children[0])
                        })
                    }, false)
                }
                search.appendChild(searchDom)
                var contents = document.createElement('div')
                contents.id = 'contents-logsearch'
                contents.innerHTML = '<p>Loading...</p>'


                wrap.appendChild(h3)
                wrap.appendChild(search)
                wrap.appendChild(contents)
                displayModal(wrap)


                // buffer logs from client
                e.FetchLogs(searchOptions, filterOptions, function(loadedLogs) {
                    // set values from caller
                    for (key in filterOptions) {
                        var filterVals = filterOptions[key]

                        var field = e.ev.GetInputByName(key)
                        document.getElementById(field.htmlId).value = filterVals.value

                        var select = document.getElementById(field.htmlId + '-operator')
                        for (var i = 0; i < select.options.length; i++) {
                            var option = select.options[i]
                            if (option.value == filterVals.operator)
                                select.selectedIndex = i
                        }
                    }

                    // insert the results
                    var el = document.getElementById('contents-logsearch')
                    if (loadedLogs.length === 0) {
                        el.innerHTML = '<p>No logs founds</p>'
                        return
                    } else {
                        el.innerHTML = ''
                        bar(e, function(dom) {
                            el.insertBefore(dom, el.children[0])
                        })
                    }

                })


            }

            var searchOptions = {
                fromBlock: document.getElementById('search-' + e.name + '-blockfrom').value,
                toBlock: document.getElementById('search-' + e.name + '-blockto').value,
                address: document.getElementById('option-address').value
            }

            var filterOptions = e.getFieldFilterValues()
                // var filterOptions = e.getIndexedFilterValues()

            if (connectInstance())
                foo(searchOptions, filterOptions)
            else {
                displayModal(makeConnectionDialog(function() {
                    foo(searchOptions, filterOptions)
                }))
            }
        })


        var wrap = document.createElement('div')

        var labFromBlock = document.createElement('label')
        labFromBlock.htmlFor = 'search-' + e.name + '-blockfrom'
        labFromBlock.innerHTML = 'Earliest block:'

        var inputFromBlock = document.createElement('input')
        inputFromBlock.id = labFromBlock.htmlFor
        inputFromBlock.value = '0'

        var labToBlock = document.createElement('label')
        labToBlock.htmlFor = 'search-' + e.name + '-blockto'
        labToBlock.innerHTML = 'Latest block:'

        var inputToBlock = document.createElement('input')
        inputToBlock.id = labToBlock.htmlFor
        inputToBlock.value = 'latest'

        wrap.appendChild(labFromBlock)
        wrap.appendChild(inputFromBlock)
        wrap.appendChild(labToBlock)
        wrap.appendChild(inputToBlock)
        wrap.appendChild(button)

        article.appendChild(wrap)
        article.appendChild(e.makeFieldFilter())
        article.classList.add('ac-medium')
        div.appendChild(input)
        div.appendChild(label)
        div.appendChild(article)
        section.appendChild(div)

        document.getElementById('log-search').appendChild(section)
    })
}

AppStatus.prototype.routeApp = function() {
  var hash = (window.location.hash.substring(0, 1) === '#' ? window.location.hash.substring(1, window.location.hash.length) : window.location.hash)

  var parts = hash.split('/')
  if (parts.length > 0)
    switch (parts[0]) {
      case 'event':
        // this should link to prettified form
        break
      case 'log':
        if (parts.length > 3) {
          var block = web3.eth.getBlock(parts[1])
          var txhash = block.transactions[parts[2]]
          var receipt = web3.eth.getTransactionReceipt(txhash)
          var pre = document.createElement('pre')
          var log = receipt.logs[parts[3]]
          log.blockHash = '<a href=#block/' + log.blockHash + '>' + log.blockHash + '</a>'
          log.transactionHash = '<a href=#tx/' + log.transactionHash + '>' + log.transactionHash + '</a>'

          pre.innerHTML = JSON.stringify(log, null, '  ')
          displayModal(pre)
        }
        break
      case 'block':
        if (parts.length > 1) {
          var pre = document.createElement('pre')
          var block = web3.eth.getBlock(parts[1], false)
          block.parentHash = '<a href=#block/' + block.parentHash + '>' + block.parentHash + '</a>'
          for (var i = 0; i < block.transactions.length; i++) {
            var txhash = block.transactions[i]
            var link = '<a href=#tx/' + txhash + '>' + txhash + '</a>'
            block.transactions[i] = link
          }
          pre.innerHTML = JSON.stringify(block, null, '  ')
          displayModal(pre)
        }
        break
      case 'tx':
      case 'transaction':
        if (parts.length > 1) {
          var tx = document.createElement('div')
          var r = document.createElement('div')

          var txh3 = document.createElement('h3')
          txh3.innerHTML = 'Transaction'
          var txpre = document.createElement('pre')
          var transaction = web3.eth.getTransaction(parts[1])
          var blockhash = transaction.blockHash
          var link = '<a href=#block/' + blockhash + '>' + blockhash + '</a>'
          transaction.blockHash = link
          txpre.innerHTML = JSON.stringify(transaction, null, '  ')

          var rh3 = document.createElement('h3')
          rh3.innerHTML = 'Receipt'
          var rpre = document.createElement('pre')
          rpre.innerHTML = JSON.stringify(web3.eth.getTransactionReceipt(parts[1]), null, '  ')

          tx.appendChild(txh3)
          tx.appendChild(txpre)
          r.appendChild(rh3)
          r.appendChild(rpre)

          var div = document.createElement('div')
          div.appendChild(tx)
          div.appendChild(r)
          displayModal(div)

        }
        break
      default:
        var ah = this.loadedDocs[this.selectedDocIndex]
        if (!ah) break
        if (parts[0] in ah.functions)
          document.getElementById('acc-function' + parts[0]).checked = true
        else if (parts[0] in ah.events) {
          var e = ah.events[parts[0]]
          document.getElementById('acc-event' + parts[0]).checked = true
          if (parts.length > 3) {
            var wrap = document.createElement('div')
            var h3 = document.createElement('h3')
            h3.innerHTML = 'Log search: ' + e.name
            var contents = document.createElement('div')
            contents.id = 'contents-logsearch'

            wrap.appendChild(h3)
            wrap.appendChild(contents)
            displayModal(wrap)

            var block = web3.eth.getBlock(parts[1])
            var txhash = block.transactions[parts[2]]
            var receipt = web3.eth.getTransactionReceipt(txhash)
            var options = {
              toBlock: parts[1],
              fromBlock: parts[1],
              address: receipt.logs[parts[3]].address,
              logIndex: parts[3]
            }
            e.FetchLogs(options, {}, function(eventLogs) {
              var el = document.getElementById('contents-logsearch')
              el.innerHTML = ''
              eventLogs.forEach(function(ev) {
                if (ev.result.logIndex == options.logIndex) {

                  var div = document.createElement('div')
                  var dom = composeReceipt(ev)
                  var p = document.createElement('p')
                  var log = ev.result.blockNumber + '/' + ev.result.transactionIndex + '/' + ev.result.logIndex
                  var link = ev.name + '/' + ev.result.blockNumber + '/' + ev.result.transactionIndex + '/' + ev.result.logIndex
                  p.innerHTML = '<a href="#log/' + log + '">Raw JSON</a>'
                  div.appendChild(p)
                  div.appendChild(dom)
                  el.insertBefore(div, el.children[0])
                }

              })
            })
          }
        }
    }
}

AppStatus.prototype.setHandlers = function() {
  // watch for changes to href
  window.addEventListener('popstate', appStatus.routeApp);
  const pushUrl = (href) => {
    history.pushState({}, '', href);
    window.dispatchEvent(new Event('popstate'));
  }


  document.getElementById('btnSave').addEventListener('click', function(ev) {
    appStatus.updateDoc()
    appStatus.renderCodeView()
    appStatus.displayUi()
  }, false)
  document.getElementById('btnWatch').addEventListener('click', function(ev) {
    var func = function() {
      var contractAddress = document.getElementById('option-address').value
      try {
        var code = web3.eth.getCode(contractAddress)
      } catch (e) {
        displayNotification(e.toString(), 'error')
        return
      }

      // 2 for "0x" prefix
      if (code.length > 2) {
        var displayAllBlocks = document.getElementById('option-allblocks').checked
        watchBlocks(displayAllBlocks)
        var address = document.getElementById('option-address').checked
        watchEvents(address)
      } else {
        displayNotification('Address has no code', 'error')
      }
    }

    if (!connectInstance()) {
      displayModal(makeConnectionDialog(function() {
        func()
      }))
    } else
      func()

  }, false)
  document.getElementById('btnViewInterface').addEventListener('click', function(ev) {
    appStatus.displayUi()
    document.getElementById('main').classList.toggle('flip')
  }, false)
  document.getElementById('btnSend').addEventListener('click', function(ev) {
    var func = function() {
      displayModal(makeTransactionDialog('New transaction', function(transactionOptions) {
        watchEvents(transactionOptions.to)
        try {

          web3.eth.sendTransaction(transactionOptions, function(error, transactionHash) {
            // if error, display and return
            if (error) {
              document.getElementById('tx-message').innerHTML = error.toString()
              return
            }

            // display transaction and close dialog
            document.getElementsByTagName("body")[0].classList.remove('dialogIsOpen')
            appStatus.addTransaction(transactionHash)
            appStatus.displayPending()
          })
        } catch (e) {
          document.getElementById('tx-message').innerHTML = e.toString()
        }
      }, {
        gas: 90000,
        gasPrice: web3.eth.gasPrice,
        to: document.getElementById('option-address').value
      }))
    }
    if (!connectInstance()) {
      displayModal(makeConnectionDialog(function() {
        func()
      }))
    } else
      func()

  }, false)
  document.getElementById('btnDeploy').addEventListener('click', function(ev) {
    var func = function() {

      var txdia = makeTransactionDialog('Deploy: ' + this.loadedDocs[this.selectedDocIndex].name, function(transactionOptions) {
        watchEvents(transactionOptions.to)
        try {
          web3Function.Transact(transactionOptions, function(evmFunction) {
            if (evmFunction.error) {
              document.getElementById('tx-message').innerHTML = evmFunction.error.toString()
                // displayNotification(evmFunction.error.toString(), 'error')
            } else {
              document.getElementsByTagName("body")[0].classList.remove('dialogIsOpen')
              appStatus.addTransaction(evmFunction.transactionHash)
              appStatus.displayPending()
            }
          })

        } catch (e) {
          document.getElementById('tx-message').innerHTML = e.toString()
        }
      }, {
        to: null,
        data: null,
        gas: 3000000,
        gasPrice: web3.eth.gasPrice
      })

      var div = document.createElement('div')
      var p = document.createElement('p')
      p.classList.add('error')
      p.innerHTML = 'Constructor fields not implemented'
      div.appendChild(p)
      div.appendChild(txdia)
      displayModal(div)
    }

    if (!connectInstance()) {
      displayModal(makeConnectionDialog(function() {
        func()
      }))
    } else
      func()

  }, false)
}
