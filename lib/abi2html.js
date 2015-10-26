"use strict";

var AbiHtml = function(abiString, config) {
    if (!config) config = {
        functions: {},
        events: {}
    }
    this.config = config
    this.constructor(abiString)

    return this
}

AbiHtml.prototype.constructor = function(abiString) {
    this.functions = []
    this.events = []

    var abi

    // support multiple param types
    if (typeof abiString === 'string')
        abi = JSON.parse(abiString)
    else
        return

    // sanity check
    if (abi == null || !abi instanceof Array)
        return

    this.contract = web3.eth.contract(abi)

    var that = this
    abi.forEach(function(abiItem) {
        var item = new AbiItem(abiItem, that.config)

        // it's not currently possible to store a subset of the contract because
        //  it depends on a particular address as of web3.js 0.14.0
        item.contract = that.contract

        switch (item.type) {
            case 'function':
                that.functions[item.name] = item
                break
            case 'event':
                that.events[item.name] = item
                break
        }
    })

    // this.abi = abi
}

AbiHtml.prototype.GetEvents = function(options, filterFields, cb) {
    var that = this
    this.contract.at(options.address).allEvents({
        fromBlock: 'earliest',
        toBlock: 'latest'
    }, function(err, results) {
        that.events[results.event].renderDom(err, results, cb)
    })
}

AbiHtml.prototype.GetEventsByName = function(name, options, filterFields, cb) {
    this.events[name].Get(options, filterFields, cb)
}


AbiHtml.prototype.WatchEvents = function(options, filterFields, cb) {
    for (var name in this.events) {
        this.events[name].Watch(options, filterFields, cb)
    }
}


AbiHtml.prototype.RenderFunctions = function(options, cb) {
    for (var name in this.functions) {
        this.functions[name].RenderDom(options, cb)
    }
}

AbiHtml.prototype.GetFunction = function(name) {
    if (name in this.functions)
        return this.functions[name]
}

/*





*/


// This is something like "Event" or "Function"
var AbiItem = function(abiItem, config) {
    if (this.sanityCheck(abiItem)) {
        this.config = config
        return this.constructor(abiItem)
    }
}

AbiItem.prototype.sanityCheck = function(abiItem) {
    if (typeof abiItem !== "object")
        return false

    // required field
    if (!("name" in abiItem))
        return false

    // required field
    if (!("type" in abiItem))
        return false

    return true
}

AbiItem.prototype.constructor = function(abiItem) {
    switch (abiItem.type) {
        case 'function':
            return new EvmFunction(abiItem, this.config.functions)
        case 'event':
            return new EvmEvent(abiItem, this.config.events)
        case 'constructor':
            // contructors are not accessible
            break;
        default:
            console.log('Unknown field type', abiItem.name, abiItem.type)
    }
}


/* 





*/

var EvmFunction = function(abiItem, config) {
    // this.config = config // hack to resolve circular dependency
    this.name = abiItem.name
    this.type = abiItem.type
    this.inputs = []
    this.outputs = []

    if (this.sanityCheck(abiItem)) {
        this.config = this.applyMissingDefaults(config)
        this.constructor(abiItem)

    }

    // return this
}

EvmFunction.prototype.applyMissingDefaults = function(userConfig) {
    // define default values here
    var that = this
    var defaultConfig = {
        idJoinString: "-",
        functionIdPrefix: "function",
    }

    // safety check
    if (!userConfig) userConfig = {}

    // apply default properties to missing user properties
    for (var k in defaultConfig) {
        if (!userConfig.hasOwnProperty(k))
            userConfig[k] = defaultConfig[k]
    }

    return userConfig
}

EvmFunction.prototype.sanityCheck = function(abiItem) {
    if (typeof abiItem !== "object")
        return false

    // required field
    if (!("name" in abiItem))
        return false

    // required field
    if (!("type" in abiItem) || abiItem.type != "function")
        return false

    // initialize if empty
    if (!("inputs" in abiItem))
        abiItem.inputs = []

    // initialize if empty
    if (!("outputs" in abiItem))
        abiItem.outputs = []

    return true
}

EvmFunction.prototype.constructor = function(abiItem) {
    this.name = abiItem.name
    this.type = abiItem.type
    this.inputs = []
    this.outputs = []

    // assemble function parameters
    for (var i = 0; i < abiItem.inputs.length; i++) {
        var field = new SolField(abiItem.inputs[i])
        field.setHtmlId([this.config.functionIdPrefix, this.name, field.field.name].join(this.config.idJoinString))
        this.inputs[i] = field
    }

    // assemble return values
    for (var i = 0; i < abiItem.outputs.length; i++) {
        var field = new SolField(abiItem.outputs[i])
        field.setHtmlId([this.config.functionIdPrefix, this.name, field.field.name].join(this.config.idJoinString))
        this.outputs[i] = field
    }
}

EvmFunction.prototype.headerScaffolding = function() {
    var h3 = document.createElement('h3')
    h3.innerHTML = this.name
    return h3
}
EvmFunction.prototype.callButtonScaffolding = function(options) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = [this.name, "call"].join(this.config.idJoinString)
    btn.innerHTML = "Call"
    var that = this
    btn.addEventListener('click', function(ev) {
        that.Call(options)
    })
    return btn
}
EvmFunction.prototype.transactButtonScaffolding = function(options) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = [this.name, "transact"].join(this.config.idJoinString)
    btn.innerHTML = "Transact"
    var that = this
    btn.addEventListener('click', function(ev) {
        that.Transact(options)
    })
    return btn
}
EvmFunction.prototype.inputScaffolding = function() {
    var fs = document.createElement('fieldset')
    fs.className = 'inputs'

    var leg = document.createElement('legend')
    leg.innerHTML = 'Inputs'
    fs.appendChild(leg)

    this.inputs.forEach(function(field) {
        fs.appendChild(field.renderDom(true))
    })
    return fs
}

EvmFunction.prototype.outputScaffolding = function() {
    var fs = document.createElement('fieldset')
    fs.className = 'outputs'

    var leg = document.createElement('legend')
    leg.innerHTML = 'Outputs'
    fs.appendChild(leg)

    this.outputs.forEach(function(field) {
        fs.appendChild(field.renderDom(false))
    })
    return fs

}



EvmFunction.prototype.RenderDom = function(options, cb) {
    var div = document.createElement('div')
    div.className = ['function'].join(' ')
    div.id = 'function' + this.name

    div.appendChild(this.headerScaffolding())

    // Call button is only useful when there is a return value
    if (this.outputs.length > 0)
        div.appendChild(this.callButtonScaffolding(options))

    // Transact button available when not constant (constant functions cannot modify state)
    if (!this.constant)
        div.appendChild(this.transactButtonScaffolding(options))


    if (this.inputs.length > 0)
        div.appendChild(this.inputScaffolding())

    if (this.outputs.length > 0)
        div.appendChild(this.outputScaffolding())

    if (typeof cb === "function")
        cb(div)

    return div
}

EvmFunction.prototype.Call = function(userOptions, cb) {
    var kv = []
    for (var i = 0; i < this.inputs.length; i++) {
        var field = this.inputs[i]
        var val = document.getElementById(field.getHtmlId()).value
        kv.push(val)
    }

    // set transaction options
    var options = {
        from: userOptions.from,
        to: userOptions.to,
        gas: userOptions.gas,
        gasPrice: userOptions.gasPrice,
        data: userOptions.data,
        value: userOptions.value
    }
    kv.push(options)


    // set callback
    if (typeof cb !== "function") {
        var that = this
        cb = function(err, results) {
            if (err) {
                alert(err.toString())
            } else {
                for (var i = 0; i < that.outputs.length; i++) {
                    var field = that.outputs[i]
                    document.getElementById(field.getHtmlId()).value = results // only supports single argument
                }
            }
        }
    }

    kv.push(cb)

    // get instance of contract
    var contract = this.contract.at(options.to)
    var func = contract[this.name]
    func.call.apply(func, kv)
}


EvmFunction.prototype.Transact = function(userOptions, cb) {
    var kv = []
    for (var i = 0; i < this.inputs.length; i++) {
        var field = this.inputs[i]
        var val = document.getElementById(field.getHtmlId()).value
        kv.push(val)
    }

    // set transaction options
    var options = {
        from: userOptions.from,
        to: userOptions.to,
        gas: userOptions.gas,
        gasPrice: userOptions.gasPrice,
        data: userOptions.data,
        value: userOptions.value
    }
    kv.push(options);


    // set callback
    if (typeof cb !== "function") {
        cb = function(err, results) {
            if (results)
                alert("Transaction hash:\n" + results)
            else
                alert(err.toString())
        }
    }
    kv.push(cb)

    // get instance of contract
    var contract = this.contract.at(options.to)
    var func = contract[this.name]
    func.sendTransaction.apply(func, kv)
}


/*





*/

var EvmEvent = function(abiItem, config) {
    if (this.sanityCheck(abiItem)) {
        this.config = this.applyMissingDefaults(config)
        this.constructor(abiItem)
    }

    return this
}

EvmEvent.prototype.applyMissingDefaults = function(userConfig) {
    // define default values here
    var that = this
    var defaultConfig = {
        idJoinString: "-",
        eventIdPrefix: "event"
    }

    // safety check
    if (!userConfig) userConfig = {}

    // apply default properties to missing user properties
    for (var k in defaultConfig) {
        if (!userConfig.hasOwnProperty(k))
            userConfig[k] = defaultConfig[k]
    }

    return userConfig
}

EvmEvent.prototype.sanityCheck = function(abiItem) {
    if (typeof abiItem !== "object")
        return false

    // required field
    if (!("name" in abiItem))
        return false

    // required field
    if (!("type" in abiItem) || abiItem.type != "event")
        return false

    // initialize if empty
    if (!("inputs" in abiItem))
        abiItem.inputs = []

    // initialize if missing
    if (!("anonymous" in abiItem))
        abiItem.anonymous = false

    return true
}

EvmEvent.prototype.constructor = function(abiItem) {
    this.name = abiItem.name
    this.type = abiItem.type
    this.anonymous = abiItem.anonymous
    this.inputs = []

    // assemble inputs
    // Event values exist as inputs
    for (var i = 0; i < abiItem.inputs.length; i++) {
        var field = new SolField(abiItem.inputs[i])
        field.setHtmlId([this.config.eventIdPrefix, this.name, field.field.name].join(this.config.idJoinString))
        this.inputs[i] = field
    }
}

EvmEvent.prototype.renderDom = function(err, results, cb) {
    // containing div element
    var div = document.createElement('div')
    div.className = ['event'].join(' ')
    div.id = 'event' + this.name

    div.appendChild(this.headerScaffolding())

    div.appendChild(this.bodyScaffolding(err, results))

    if (results && this.inputs.length > 0)
        div.appendChild(this.eventScaffolding(err, results))

    if (typeof cb === "function")
        cb(div)

    return div
}

EvmEvent.prototype.headerScaffolding = function() {
    // header
    var h3 = document.createElement('h3')
    h3.innerHTML = this.name
    return h3

}

EvmEvent.prototype.eventScaffolding = function(err, results) {
    // console.log(results)
    // if there are inputs, display them in a fieldset
    if (this.inputs.length > 0) {
        var fs = document.createElement('fieldset')
        fs.className = 'inputs'

        var leg = document.createElement('legend')
        leg.innerHTML = 'Fields'
        fs.appendChild(leg)


        // append the DOM for each field to the fieldset
        for (var i = 0; i < this.inputs.length; i++) {
            var field = this.inputs[i]

            // if we have a value for a given field, render it
            if (results && "args" in results && field.field.name in results.args)
                fs.appendChild(field.renderDom(false, results.args[field.field.name]))
            else
                fs.appendChild(field.renderDom(false))
        }
        return fs
    }

}

EvmEvent.prototype.bodyScaffolding = function(err, results) {
    if (err) {
        var p = document.createElement('p')
        p.innerHTML = err.toString()
        return p
    } else {
        var receipt = web3.eth.getTransactionReceipt(results.transactionHash)
        var dl = document.createElement('dl')

        var dtAddress = document.createElement('dt')
        var ddAddress = document.createElement('dd')

        dtAddress.innerHTML = 'Contract:'
        ddAddress.innerHTML = results.address
        dl.appendChild(dtAddress)
        dl.appendChild(ddAddress)


        var dtHash = document.createElement('dt')
        var ddHash = document.createElement('dd')

        dtHash.innerHTML = 'Transaction hash:'
        dl.appendChild(dtHash)

        ddHash.innerHTML = results.transactionHash
        dl.appendChild(ddHash)

        var dtGas = document.createElement('dt')
        var ddGas = document.createElement('dd')

        dtGas.innerHTML = 'Gas used:'
        dl.appendChild(dtGas)

        ddGas.innerHTML = receipt.gasUsed
        dl.appendChild(ddGas)

        // p.innerHTML = 'Transaction Hash: ' + results.transactionHash + '<br>Gas used: ' + receipt.gasUsed
        return dl
    }
}


EvmEvent.prototype.Watch = function(userOptions, filterFields, cb) {
    var params = []

    // set transaction options
    var filterOptions = {
        address: userOptions.to,
        fromBlock: 'latest',
        toBlock: 'latest'
    }
    params.push(filterOptions);


    if (!filterFields)
        params.push({})
    else
        params.push(filterFields)


    // get instance of contract
    var contract = this.contract.at(filterOptions.address)
    var func = contract[this.name]
    this.filter = func.apply(func, params)

    // set callback
    if (typeof cb !== "function") {
        var that = this
        cb = function(htmlDom) {
            console.log(htmlDom)
        }
    }

    if (this.filter) {
        var that = this
        this.filter.watch(function(err, results) {
            that.renderDom(err, results, cb)
        })
    }
}

EvmEvent.prototype.Get = function(userOptions, filterFields, cb) {
    // console.log('Get event', this.name, userOptions, filterFields, cb)
    var params = []

    // set filter fields first
    if (!filterFields)
        params.push({})
    else
        params.push(filterFields)

    // set transaction options
    var filterOptions = {
        address: userOptions.address,
        fromBlock: 'earliest',
        toBlock: 'latest'
    }
    params.push(filterOptions);




    // get instance of contract
    var contract = this.contract.at(filterOptions.address)
    var func = contract[this.name]
    this.filter = func.apply(func, params)

    // set callback
    if (typeof cb !== "function") {
        var that = this
        cb = function(htmlDom) {
            console.log(htmlDom)
        }
    }

    if (this.filter) {
        var that = this
        this.filter.get(function(err, results) {
            // console.log(err, results)
            for (var i = 0; i < results.length; i++) {
                that.renderDom(err, results[i], cb)
            }

        })
    }
}



/*




*/


var SolField = function(solField, value) {
    if (this.sanityCheck(solField)) {
        var field = this.constructor(solField, value)
        field.name = solField.name
        this.field = field
            // return this
    }
}

SolField.prototype.sanityCheck = function(solField) {
    if (typeof solField !== "object")
        return false

    // required field
    if (!("name" in solField))
        this.name = 'empty'
        // return false

    // required field
    if (!("type" in solField))
        return false

    // initialize optional fields
    if (!("indexed" in solField))
        this.indexed = false

    return true
}

SolField.prototype.constructor = function(solField, value) {
    var solType = this.splitType(solField.type)

    switch (solType.base) {
        case 'bool':
            return new SolBool(value)
        case 'address':
            return new SolAddress(value)
        case 'string':
            return new SolString(solType.size, value)
        case 'bytes':
            return new SolBytes(solType.size, value)
        case 'int':
            return new SolInt(solType.size, value)
        case 'uint':
            return new SolUint(solType.size, value)
        case 'real': // not yet implemented
        case 'ureal': // not yet implemented
        default:
            console.log('Unknown field type:', solField.name, solType.base, solType.size)
    }

}

SolField.prototype.splitType = function(solidityType) {
    // Function to split something like "uint256" into discrete pieces
    var firstDigit = solidityType.match(/\d/);
    if (firstDigit === null) {
        return {
            base: solidityType,
            size: null
        }
    }
    var index = solidityType.indexOf(firstDigit);
    return {
        base: solidityType.substring(0, index),
        size: solidityType.substring(index, solidityType.length)
    }
}



SolField.prototype.renderDom = function(isEditable, value) {
    // initialize empty DOM element
    var div = document.createElement('div')
    div.className = 'solfield'

    // make input if possible
    var input = this.field.renderDom(this.getHtmlId(), isEditable, value)
    if (input) {
        var label = document.createElement('label')
        label.htmlFor = this.getHtmlId()
        if (this.field.name)
            label.innerHTML = this.field.name
        else
            label.innerHTML = '(returns)'
        div.appendChild(label)
        div.appendChild(input)
    }

    return div
}

SolField.prototype.setHtmlId = function(htmlId) {
    this.field.htmlId = htmlId
}

SolField.prototype.getHtmlId = function() {
    return this.field.htmlId
}


var SolBool = function(value) {
    this.base = "bool"
    this.value = value

    if (this.validate())
        return this
}

SolBool.prototype.validate = function() {
    if (typeof this.value !== "bool")
        return false

    return true
}


SolBool.prototype.renderDom = function(htmlId, isEditable, value) {
    var input = document.createElement('input')
    input.id = htmlId
    input.className = this.base

    // if the field should be editable
    if (!!isEditable) {
        input.type = 'checkbox'
    } else {
        input.type = 'text'
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (!!value)
        input.value = value
    else if (!!this.value)
        input.value = this.value

    return input
}

var SolAddress = function(value) {
    this.base = "address"
    this.value = value


    if (this.validate())
        return this
}

SolAddress.prototype.validate = function() {
    if (typeof this.value !== "string")
        return false

    // ensure address is prefixed "0x"
    if (this.value.substring(0, 2) !== "0x")
        this.value = "0x" + this.value

    // address is 20 bytes = 40 characters + 2 prefix
    if (this.value.length != 42)
        return false

    return true
}

SolAddress.prototype.renderDom = function(htmlId, isEditable, value) {
    var input = document.createElement('input')
    input.id = htmlId
    input.type = 'text'
    input.className = this.base

    // if not editable
    if (!!!isEditable) {
        input.className = [this.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (!!value)
        input.value = value
    else if (!!this.value)
        input.value = this.value

    return input
}

var SolBytes = function(size, value) {
    this.size = size
    this.base = "bytes"
    this.value = value

    if (this.validate())
        return this
}

SolBytes.prototype.validate = function() {
    if (typeof this.value !== "string")
        return false

    return true
}

SolBytes.prototype.renderDom = function(htmlId, isEditable, value) {
    var input = document.createElement('textarea')
    input.id = htmlId
    input.rows = 4
    input.cols = 40
    input.className = [this.base, this.base + this.size].join(' ')

    // if not editable
    if (!!!isEditable) {
        input.className = [this.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (!!value)
        input.value = value
    else if (!!this.value)
        input.value = this.value

    return input
}

var SolString = function(size, value) {
    this.size = size
    this.base = "string"
    this.value = value

    if (this.validate())
        return this
}

SolString.prototype.validate = function() {
    if (typeof this.value !== "string")
        return false

    return true
}

SolString.prototype.renderDom = function(htmlId, isEditable, value) {
    var input = document.createElement('textarea')
    input.id = htmlId
    input.rows = 4
    input.cols = 40
    input.className = [this.base, this.base + this.size].join(' ')

    // if not editable
    if (!!!isEditable) {
        input.className = [this.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (!!value)
        input.value = value
    else if (!!this.value)
        input.value = this.value

    return input
}

var SolInt = function(size, value) {
    this.size = (size ? size : "256")
    this.base = "int"
    this.value = value

    if (this.validate())
        return this
}

SolInt.prototype.validate = function() {
    if (typeof this.value === "string") {
        if (this.value.length < 3)
            return false

        if (this.value.substring(0, 2) !== "0x")
            this.value = "0x" + this.value
    } else if (typeof this.value === "number") {
        this.value = web3.toHex(this.value)
    }

    return true
}

SolInt.prototype.renderDom = function(htmlId, isEditable, value) {
    var input = document.createElement('input')
    input.id = htmlId
    input.type = 'input'
    input.className = this.base
    if (this.size)
        input.className = [input.className, this.base + this.size].join(' ')

    // if not editable
    if (!!!isEditable) {
        input.className = [this.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (!!value)
        input.value = value
    else if (!!this.value)
        input.value = this.value

    return input
}

var SolUint = function(size, value) {
    this.size = (size ? size : "256")
    this.base = "uint"
    this.value = value

    if (this.validate())
        return this
}

SolUint.prototype.validate = function() {
    if (typeof this.value === "string") {
        if (this.value.length < 3)
            return false

        if (this.value.substring(0, 2) !== "0x")
            this.value = "0x" + this.value
    } else if (typeof this.value === "number") {
        return false
    }

    return true
}

SolUint.prototype.renderDom = function(htmlId, isEditable, value) {
    var input = document.createElement('input')
    input.id = htmlId
    input.type = 'input'
    input.className = this.base
    if (this.size)
        input.className = [input.className, this.base + this.size].join(' ')

    // if not editable
    if (!!!isEditable) {
        input.className = [this.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (!!value)
        input.value = value
    else if (!!this.value)
        input.value = this.value

    return input
}
