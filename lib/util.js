"use strict";

var AppStatus = function() {
    this.gasLimit = null
    this.difficulty = null
    this.pendingTransactions = []
    this.blockFilter = null
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

var routeApp = function() {
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
        var ah = loadedAbiHtml[selectedDocIndex]
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

var setHandlers = function() {
  // watch for changes to href
  window.addEventListener('popstate', routeApp);
  const pushUrl = (href) => {
    history.pushState({}, '', href);
    window.dispatchEvent(new Event('popstate'));
  }


  document.getElementById('btnSave').addEventListener('click', function(ev) {
    updateDoc(selectedDocIndex)
    displayCode(selectedDocIndex)
    displayUi(selectedDocIndex)
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
    displayUi(selectedDocIndex)
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

      var txdia = makeTransactionDialog('Deploy: ' + loadedAbiHtml[selectedDocIndex].name, function(transactionOptions) {
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

var updateDoc = function(index) {
  var source = document.getElementById('source-code').value
  var abi = document.getElementById('abi-code').value

  var ah
  if (source) ah = new AbiHtml(source)
  else if (abi) ah = new AbiHtml(abi)

  if (loadedAbiHtml && index in loadedAbiHtml && 'name' in loadedAbiHtml[index]) ah.name = loadedAbiHtml[index].name

  if (ah) loadedAbiHtml[index] = ah
}

var getParameterByName = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

var callAjax = function(url, callback) {
  var xmlhttp
  xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      callback(xmlhttp.responseText)
    }
  }
  xmlhttp.onerror = function() {
    callback(null)
  }
  xmlhttp.open("GET", url, true)
  xmlhttp.send()
}

var inArrayIndex = function(array, id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === id) return i
  }
  return -1
}

var connectInstance = function(providerString) {
  // try to connect if not connected
  if (!web3.currentProvider)
    web3.setProvider(new web3.providers.HttpProvider(providerString))

  // check if connected
  var isConnected = web3.isConnected()

  if (isConnected) {
    // fill in "from accounts"
    var fromInput = document.getElementById('option-from')
    fromInput.innerHTML = ''
    web3.eth.accounts.forEach(function(address) {
      var option = document.createElement('option')
      option.value = address
      option.innerHTML = address
      fromInput.options.add(option)
    })
    fromInput.disabled = false

    // enable watch target
    document.getElementById('option-address').disabled = false
    document.getElementById('btnWatch').disabled = false
  }

  return isConnected
}

