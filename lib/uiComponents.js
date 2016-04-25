"use strict";

// detailed object for log search
var composeReceipt = function(evmEvent, cb) {
    var div = document.createElement('div')
    div.className = ['event'].join(' ')

    if (evmEvent.err) {
        var p = document.createElement('p')
        p.innerHTML = evmEvent.err.toString()
        div.appendChild(p)
    } else {
        var h3 = document.createElement('h3')
        h3.innerHTML = evmEvent.result.event
        div.appendChild(h3)

        var receipt = web3.eth.getTransactionReceipt(evmEvent.result.transactionHash)
        var dl = document.createElement('dl')

        var displayFields = [{
            dt: 'Contract:',
            dd: evmEvent.result.address
        }, {
            dt: 'Transaction:',
            dd: evmEvent.result.transactionHash
        }, {
            dt: 'Chain height:',
            dd: '<dfn title="Block number">' + receipt.blockNumber + '</dfn> . <dfn title="Transaction index">' + evmEvent.result.transactionIndex + '</dfn> . <dfn title="Log index">' + evmEvent.result.logIndex + '</dfn>'
        }, {
            dt: 'Gas used:',
            dd: '<dfn title="Gas used">' + receipt.gasUsed + '</dfn> / <dfn title="Cumulative gas used">' + receipt.cumulativeGasUsed + '</dfn>'
        }]

        for (var i = 0; i < displayFields.length; i++) {
            var field = displayFields[i]
            var dt = document.createElement('dt')
            var dd = document.createElement('dd')
            dt.innerHTML = field.dt
            dd.innerHTML = field.dd
            dl.appendChild(dt)
            dl.appendChild(dd)

        }
        div.appendChild(dl)

        // evmEvent.results.args.length > 0
        if (evmEvent.inputs.length > 0) {
            var fs = document.createElement('fieldset')
            fs.className = 'inputs'

            var leg = document.createElement('legend')
            leg.innerHTML = 'Logs'
            fs.appendChild(leg)


            // append the DOM for each field to the fieldset
            for (var i = 0; i < evmEvent.inputs.length; i++) {
                var field = evmEvent.inputs[i]
                fs.appendChild(field.DefaultRenderer(false))
            }
            div.appendChild(fs)
        }
    }

    if (typeof cb === "function")
        cb(div)

    return div


}


var displayModal = function(obj) {
    var htmlDom
    if (typeof obj === "object" && "nodeType" in obj) {
        // looks like HTML Element
        htmlDom = obj
    } else if (typeof obj === "string") {
        // looks like string
        var htmlDom = document.createElement('p')
        htmlDom.innerHTML = obj
    }

    var parElement = document.createElement('div')
    parElement.classList.add('modal')
    var button = document.createElement('input')
    button.type = 'button'
    button.value = 'Close'
    button.addEventListener('click', function() {
        document.getElementsByTagName('body')[0].classList.remove('dialogIsOpen')
        window.location.href = '#'
    }, false)
    parElement.appendChild(button)
    parElement.appendChild(htmlDom)

    // append the entry and the top
    var el = document.getElementById('modal')
    el.innerHTML = ''
    el.appendChild(parElement)

    document.getElementsByTagName("body")[0].classList.add('dialogIsOpen')
}

var displayNotification = function(obj, className) {
    var htmlDom
    if (typeof obj === "object" && "nodeType" in obj) {
        // looks like HTML Element
        htmlDom = obj
    } else if (typeof obj === "string") {
        // looks like string
        var htmlDom = document.createElement('p')
        htmlDom.innerHTML = obj
    }

    var parElement = document.createElement('div')
    parElement.className = 'notification'
    if (className) parElement.classList.add(className)
    parElement.appendChild(htmlDom)

    // append the entry and the top
    var el = document.getElementById('notifications')
    el.appendChild(parElement)
        // el.insertBefore(parElement, el.children[0])

}


var displayCode = function(index) {
    // draw all docs
    var ul = document.createElement('ul')

    if (index in loadedAbiHtml) {
      for (var i = 0; i < loadedAbiHtml.length; i++) {
          var ah = loadedAbiHtml[i]
          var li = document.createElement('li')
          var a = document.createElement('a')
          a.loadDoc = i
          a.addEventListener('click', function(ev) {
              selectedDocIndex = ev.srcElement.loadDoc
              displayCode(selectedDocIndex)
          }, false)
          if (!('name' in ah)) ah.name = 'Untitled' + i.toString()
          a.innerHTML = ah.name
          if (selectedDocIndex === i) li.classList.add('selected')
          li.appendChild(a)
          ul.appendChild(li)
      }



    }

    // add a trailing tab for adding new documents
    var addTab = document.createElement('li')
    var a = document.createElement('a')
    a.innerHTML = "+"
    a.addEventListener('click', function(ev) {
        var ah = new AbiHtml()
        selectedDocIndex = loadedAbiHtml.length
        loadedAbiHtml.push(ah)
        displayCode(selectedDocIndex)
    }, false)

    addTab.appendChild(a)
    ul.appendChild(addTab)

    // display loaded doc
    var target = document.getElementById('docnav')
    target.innerHTML = ''
    target.appendChild(ul)

    var ah = loadedAbiHtml[index]
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

var displayBlock = function(blockNumber, item, className) {
    var id = 'block-' + blockNumber.toString()
    var el = document.getElementById(id)
    
    if (el && item) {
        // if the display element could be found and the item is defined, append
        el.innerHTML += item.toString() + '<br>'
    } else if (el && !item) {
        // if the element is found, but an undefined item is passed, nothing to display
        // this shouldn't happen
        console.log('Unexpected condition:', el.innerHTML, item)
        alert('check console')
    } else {
        // block display element not found, so create a new one
        var div = document.createElement('div')
        div.id = id
        div.innerHTML = '<a href="#block/' + blockNumber.toString() + '">Block #' + blockNumber.toString() + '</a><hr>'
        if (item) div.innerHTML += item.toString() + '<br>'
        displayNotification(div, className)
    }
}

var makeConnectionDialog = function(callback) {
    var parent = document.createElement('div')
    var p = document.createElement('p')
    p.id = 'connect-message'

    var fieldset = document.createElement('fieldset')
    var legend = document.createElement('legend')
    legend.innerHTML = 'Connection'
    var ipLabel = document.createElement('label')
    ipLabel.htmlFor = 'connect-ip'
    ipLabel.innerHTML = 'IP:'
    var ip = document.createElement('input')
    ip.type = 'text'
    ip.value = '127.0.0.1'
    ip.id = ipLabel.htmlFor
    var portLabel = document.createElement('label')
    portLabel.htmlFor = 'connect-port'
    portLabel.innerHTML = 'Port:'
    var port = document.createElement('input')
    port.type = 'number'
    port.id = portLabel.htmlFor
    port.value = '8545'
    fieldset.appendChild(legend)
    fieldset.appendChild(ipLabel)
    fieldset.appendChild(ip)
    fieldset.appendChild(portLabel)
    fieldset.appendChild(port)

    var func = function(isConnected, element) {
        if (isConnected) {
            status.innerHTML = 'Connected to: ' + web3.version.node
            status.classList.remove('error')
            status.classList.add('warning')
            status.classList.remove('success')
        } else {
            status.innerHTML = 'Not connected'
            status.classList.add('error')
            status.classList.remove('warning')
            status.classList.remove('success')
        }
        status.innerHTML += '<br>Web3 version: ' + web3.version.api
    }

    var button = document.createElement('input')
    button.type = 'button'
    button.value = 'Connect'
    button.addEventListener('click', function() {
        var isConnected = connectInstance()
        if (!isConnected) {
            var ip = document.getElementById('connect-ip').value
            var port = document.getElementById('connect-port').value
            isConnected = connectInstance('http://' + ip + ':' + port)
        }

        isConnected = connectInstance()
        var status = document.getElementById('connect-status')
        func(isConnected, status)
        if (typeof callback === 'function' && isConnected) callback()
    }, false)

    var wrap = document.createElement('div')
    wrap.classList.add('wrapper')
    var status = document.createElement('p')
    status.id = 'connect-status'
    func(connectInstance(), status)
    wrap.appendChild(status)

    parent.appendChild(p)
    parent.appendChild(fieldset)
    parent.appendChild(wrap)
    parent.appendChild(button)
    return parent
}

var makeTransactionDialog = function(legendText, callback, txDefaults) {
    var makeUnitSelect = function(id, defaultUnit) {
        var units = ['ether', 'szabo', 'finney', 'wei']
        if (!defaultUnit) defaultUnit = 'ether'

        var unitSelect = document.createElement('select')
        if (id) unitSelect.id = id

        var i = 0
        var selectedIndex = 0
        for (var key in units) {
            var unit = units[key]
            if (unit == defaultUnit) selectedIndex = i
            var option = document.createElement('option')
            option.value = unit
            option.innerHTML = unit
            unitSelect.options.add(option)
            i++
        }
        unitSelect.selectedIndex = selectedIndex
        return unitSelect
    }

    if (!legendText) legendText = 'Create transaction'

    var fieldset = document.createElement('fieldset')
    fieldset.classList.add('tx-options')

    var legend = document.createElement('legend')
    legend.innerHTML = legendText

    var message = document.createElement('p')
    message.id = 'tx-message'

    // convert to select/option
    var fromLabel = document.createElement('label')
    fromLabel.innerHTML = 'From'
    fromLabel.htmlFor = 'txopt-from'
    var fromInput = document.createElement('select')
    fromInput.id = fromLabel.htmlFor
    web3.eth.accounts.forEach(function(address) {
        var option = document.createElement('option')
        option.value = address
        option.innerHTML = address
        fromInput.options.add(option)
    })
    if (txDefaults && 'from' in txDefaults)
        if (txDefaults.from === null) fromInput.disabled = true
        else if (txDefaults.from) fromInput.selectedIndex = inArrayIndex(web3.eth.accounts, txDefaults.from)

    var toLabel = document.createElement('label')
    toLabel.innerHTML = 'To'
    toLabel.htmlFor = 'txopt-to'
    var toInput = document.createElement('input')
    toInput.type = 'text'
    toInput.id = toLabel.htmlFor
    if (txDefaults && 'to' in txDefaults)
        if (txDefaults.to === null) toInput.disabled = true
        else if (txDefaults.to) toInput.value = txDefaults.to

    var gasLabel = document.createElement('label')
    gasLabel.innerHTML = 'Gas'
    gasLabel.htmlFor = 'txopt-gas'
    var gasInput = document.createElement('input')
    gasInput.type = 'number'
    gasInput.id = gasLabel.htmlFor
    if (txDefaults && 'gas' in txDefaults)
        if (txDefaults.gas === null) gasInput.disabled = true
        else gasInput.value = txDefaults.gas

    var gaspriceLabel = document.createElement('label')
    gaspriceLabel.innerHTML = 'Gas price'
    gaspriceLabel.htmlFor = 'txopt-gasprice'
    var gaspriceInput = document.createElement('input')
    gaspriceInput.type = 'number'
    gaspriceInput.id = gaspriceLabel.htmlFor
    var gaspriceUnit = makeUnitSelect('txopt-gaspriceunit', 'szabo')
    if (txDefaults && 'gasPrice' in txDefaults)
        if (txDefaults.gasPrice === null) gaspriceInput.disabled = true
        else gaspriceInput.value = web3.fromWei(txDefaults.gasPrice, 'szabo')

    var valueLabel = document.createElement('label')
    valueLabel.innerHTML = 'Value'
    valueLabel.htmlFor = 'txopt-value'
    var valueInput = document.createElement('input')
    valueInput.type = 'number'
    valueInput.id = valueLabel.htmlFor
    var valueUnit = makeUnitSelect('txopt-valueunit', 'ether')
    if (txDefaults && 'value' in txDefaults)
        if (txDefaults.value === null) valueInput.disabled = true
        else valueInput.value = web3.fromWei(txDefaults.value, 'ether')

    var dataLabel = document.createElement('label')
    dataLabel.innerHTML = 'Data'
    dataLabel.htmlFor = 'txopt-data'
    var dataInput = document.createElement('input')
    dataInput.type = 'text'
    dataInput.id = dataLabel.htmlFor
    if (txDefaults && 'data' in txDefaults)
        if (txDefaults.data === null) dataInput.disabled = true
        else dataInput.value = txDefaults.data

    var button = document.createElement('input')
    button.type = 'button'
    button.value = 'Transact'
    button.addEventListener('click', function() {
        var txOptions = {
            from: document.getElementById('txopt-from').value,
            to: document.getElementById('txopt-to').value,
            gas: document.getElementById('txopt-gas').value,
            gasPrice: web3.toWei(document.getElementById('txopt-gasprice').value, document.getElementById('txopt-gaspriceunit').value),
            data: document.getElementById('txopt-data').value,
            value: web3.toWei(document.getElementById('txopt-value').value, document.getElementById('txopt-valueunit').value)
        }
        callback(txOptions)
    }, false)

    var makeWrap = function(obj0, obj1, obj2) {
        var div = document.createElement('div')
        if (obj0) div.appendChild(obj0)
        if (obj1) div.appendChild(obj1)
        if (obj2) div.appendChild(obj2)
        return div
    }
    fieldset.appendChild(legend)
    fieldset.appendChild(message)
    fieldset.appendChild(makeWrap(fromLabel, fromInput))
    fieldset.appendChild(makeWrap(toLabel, toInput))
    fieldset.appendChild(makeWrap(gasLabel, gasInput))
    fieldset.appendChild(makeWrap(gaspriceLabel, gaspriceInput, gaspriceUnit))
    fieldset.appendChild(makeWrap(valueLabel, valueInput, valueUnit))
    fieldset.appendChild(makeWrap(dataLabel, dataInput))
    fieldset.appendChild(button)

    return fieldset
}


var getTransactionOptions = function() {
    return {
        from: document.getElementById('option-from').value,
        to: document.getElementById('option-address').value
    }
}

var displayUi = function(index) {
    var ah = loadedAbiHtml[index]
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
                                    watchEvents(transactionOptions.to)
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
