"use strict";

var OperatorEnum = {
    Eq: '=',
    Neq: '<>',
    GT: '>',
    GTEq: '>=',
    LT: '<',
    LTEq: '<=',
    Contain: 'contains'
}

var AbiHtml = function(obj) {
    var abi

    if (typeof obj === 'string') {
        if (obj.trim().substring(0, 1) == '[') {
            // looks like ABI string
            abi = JSON.parse(obj)
        } else {
            // otherwise regex
            abi = this.FromRegex(obj)
            this.source = obj
        }
    } else if (typeof abiString === 'object') {
        // assume is completed ABI object
        abi = obj
    }

    if (abi) this.constructor(abi)
}

AbiHtml.prototype.constructor = function(abi) {
    // sanity check
    if (abi == null || !abi instanceof Array) return null

    // set properties
    this.abi = abi
    this.contract = web3.eth.contract(abi)
    this.functions = []
    this.events = []

    // loop through abi and create according functions and events
    for (var i = 0; i < abi.length; i++) {
        var abiItem = abi[i]

        if (typeof abiItem !== "object") continue
        if (!("name" in abiItem)) continue
        if (!("type" in abiItem)) continue

        // it's not currently possible to store a subset of the contract so we store the whole thing
        var item
        switch (abiItem.type) {
            case 'function':
                item = new Web3Function(abiItem)
                item.contract = this.contract
                this.functions[abiItem.name] = item
                break
            case 'event':
                item = new Web3Event(abiItem)
                item.contract = this.contract
                this.events[abiItem.name] = item
                break
            case 'constructor':
                item = new Web3Function(abiItem)
                item.contract = this.contract
                this.init = item
                break
            default:
                console.log('Unknown field type', abiItem.name, abiItem.type)
        }

    }
}

AbiHtml.prototype.inArray = function(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === id) return true
    }
    return false
}

AbiHtml.prototype.FromRegex = function(str) {
    var re = /(?:(function|event)\s*)(\w+)\s*\((|(?:(?:,|\s*)?\w+(?:\[\])? \w+\s*)+)\)((?:\s+(?!returns\s*?)(?:\w+(?:\(.+\))?))*)(?:\s+returns\s*?\((|(?:(?:,|\s*)?(?:\w+(?:\[\])? )?\w+\s*)+)\))?/g

    var abi = []
    var match
    while (match = re.exec(str)) {
        var abiItem = {
            type: match[1],
            name: match[2]
        }

        var modifiers = match[4].split(' ')
        if (abiItem.type === 'event') abiItem.anonymous = this.inArray(modifiers, 'anonymous')
        if (abiItem.type === 'function') abiItem.constant = this.inArray(modifiers, 'constant')

        abiItem.inputs = this.makeInputs(match[3])
        abiItem.outputs = this.makeOutputs(match[5])

        abi.push(abiItem)
    }

    this.constructor(abi)
    return abi
}

AbiHtml.prototype.RenderTree = function() {
    var fdiv = document.createElement('div')
    fdiv.innerHTML = 'Functions: '
    var ful = document.createElement('ul')
    for (name in this.functions) {
        var func = this.functions[name]
        var f = document.createElement('li')
        var fspan = document.createElement('span')
        fspan.classList.add('abi', 'function')
        fspan.innerHTML = func.name
        if (func.func.constant) {
            var icon = document.createElement('span')
            icon.innerHTML = ' <dfn title="Constant">&#8594;</dfn>'
            icon.className = 'indexed'
            fspan.appendChild(icon)
        }
        f.appendChild(fspan)


        var fi = document.createElement('ul')
        fi.classList.add('abi', 'function', 'input')
        func.func.inputs.forEach(function(field) {
            var fil = document.createElement('li')
            fil.classList.add('abi', 'function', 'input', field.type)
            fil.innerHTML = field.type + ' ' + field.name
            fi.appendChild(fil)
        })
        f.appendChild(fi)

        var fo = document.createElement('ul')
        fo.classList.add('abi', 'function', 'output')
        func.func.outputs.forEach(function(field) {
            var fol = document.createElement('li')
            fol.classList.add('abi', 'function', 'output')
            fol.innerHTML = field.type + ' ' + field.name
            fo.appendChild(fol)
        })
        f.appendChild(fo)

        ful.appendChild(f)
    }
    fdiv.appendChild(ful)

    var ediv = document.createElement('div')
    ediv.innerHTML = 'Events: '
    var eul = document.createElement('ul')
    for (name in this.events) {
        var ev = this.events[name]
        var e = document.createElement('li')
        var espan = document.createElement('span')
        espan.classList.add('abi', 'event')
        espan.innerHTML = ev.name
        e.appendChild(espan)

        var ei = document.createElement('ul')
        ei.classList.add('abi', 'event', 'input')
        ev.ev.inputs.forEach(function(field) {
            var eil = document.createElement('li')
            eil.classList.add('abi', 'event', 'input', field.type)
            eil.innerHTML = field.type + ' ' + field.name
            if (field.indexed) {
                var icon = document.createElement('span')
                icon.innerHTML = ' <dfn title="Indexed">&#8623;</dfn>'
                icon.className = 'indexed'
                eil.appendChild(icon)
            }
            ei.appendChild(eil)
        })
        e.appendChild(ei)

        eul.appendChild(e)
    }

    ediv.appendChild(eul)

    var div = document.createElement('div')
    div.appendChild(fdiv)
    div.appendChild(ediv)
    return div
}

AbiHtml.prototype.makeInputs = function(inputSig) {
    if (!inputSig || typeof inputSig !== 'string' || inputSig.trim().length === 0) return []

    var result = []
    var inputs = inputSig.split(',')
    inputs.forEach(function(v) {
        var words = v.trim().split(' ')
        var field = {
            type: null,
            name: null
        }
        switch (words.length) {
            case 1:
                field.type = words[0]
                field.name = ''
                break
            case 2:
                field.type = words[0]
                field.name = words[1]
                break
            case 3:
                field.type = words[0]
                field.name = words[2]
                if (words[1] === 'indexed') field.indexed = true
                else field.indexed = false
        }
        result.push(field)
    })
    return result
}

AbiHtml.prototype.makeOutputs = function(outputSig) {
    if (!outputSig || typeof outputSig !== 'string' || outputSig.trim().length === 0) return []

    var result = []
    var outputs = outputSig.split(',')
    outputs.forEach(function(v) {
        var words = v.trim().split(' ')
        var field = {
            type: null,
            name: null
        }
        switch (words.length) {
            case 1:
                field.type = words[0]
                field.name = ''
                break
            case 2:
                field.type = words[0]
                field.name = words[1]
        }
        result.push(field)
    })
    return result
}

AbiHtml.prototype.GetAllEvents = function(options, filterFields, cb) {
    var that = this
    this.contract.at(options.address).allEvents({
        fromBlock: 'earliest',
        toBlock: 'latest'
    }, function(err, results) {
        var evmEvent = that.events[results.event]
        evmEvent.err = err
        evmEvent.results = results
        for (var i = 0; i < evmEvent.inputs.length; i++) {
            var field = evmEvent.inputs[i]

            // if we have a value for a given field, store it
            if (results && "args" in results && field.getName() in results.args)
                field.setValue(results.args[field.getName()])
        }
        if (typeof cb == "function") cb(evmEvent)
    })
}

AbiHtml.prototype.GetEventLogs = function(options, shouldWatch, callback) {
    for (var name in this.events) {
        var ev = this.events[name]

        if (shouldWatch)
            ev.Watch({
                address: options.to
            }, {}, callback)
        else
            ev.Get({
                address: options.to
            }, {}, callback)

    }

}

AbiHtml.prototype.GetEventLogsByName = function(name, options, filterFields, cb) {
    this.events[name].Get(options, filterFields, cb)
}

AbiHtml.prototype.WatchAllEvents = function(options, filterFields, cb) {
    for (var name in this.events) {
        var item = this.events[name]

        item.StopWatching()
        item.Watch(options, filterFields, cb)
    }
}

AbiHtml.prototype.GetEventByName = function(name) {
    if (name in this.events)
        return this.events[name]
}

// AbiHtml.prototype.GetFunctionsRendered = function(options, cb) {
//     for (var name in this.functions) {
//         this.functions[name].DefaultRenderer(options, cb)
//     }
// }

AbiHtml.prototype.GetFunction = function(name) {
    if (name in this.functions)
        return this.functions[name]
}

AbiHtml.prototype.GetFunctionsSorted = function() {
    // put functions into a sorted collection
    var funcs = []
    for (var name in this.functions) {
        funcs.push(this.functions[name])
    }
    // sort alphanumerically
    funcs.sort(function(a, b) {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
    })

    return funcs
}

AbiHtml.prototype.GetEventsSorted = function() {
    // put functions into a sorted collection
    var evs = []
    for (var name in this.events) {
        evs.push(this.events[name])
    }
    // sort alphanumerically
    evs.sort(function(a, b) {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
    })

    return evs
}

AbiHtml.prototype.GetInitFunction = function() {
    return this.init
}

AbiHtml.prototype.checkReceipt = function(txhash, callback) {
    var receipt = web3.eth.getTransactionReceipt(txhash)
    if (!receipt) {
        var that = this
        setTimeout(function(txhash, callback) {
            that.checkReceipt(txhash, callback)
        }, 3000, txhash, callback)
    } else {
        callback(null, receipt)
    }

}
AbiHtml.prototype.checkTransaction = function(txhash, callback) {
    var tx = web3.eth.getTransaction(txhash)
    if (!tx.blockHash) {
        var that = this
        setTimeout(function(txhash, callback) {
            that.checkTransaction(txhash, callback)
        }, 3000, txhash, callback)
    } else {
        callback(null, tx)
    }

}

AbiHtml.prototype.sendTransaction = function(options, callback) {
    web3.eth.sendTransaction(options, function(error, txhash) {
        if (!error) checkReceipt(txhash, callback)
        else callback(error, null)
    })
}
