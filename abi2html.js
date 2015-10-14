"use strict";

var AbiHtml = function(abiString, config) {
    // set propeties not specifid by the user
    if (!config) config = {}
    this.config = this.applyMissingDefaults(config)

    this.abi = []
    this.abi = this.loadAbi(abiString);

    this.doc = {}
}

AbiHtml.prototype.applyMissingDefaults = function(userConfig) {
    // define default values here
    var defaultConfig = {
        idJoinString: "-",
        inputIdPrefix: "in",
        outputIdPrefex: "out",
        outputEmptyName: "return",

        function: {},
        event: {}
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


AbiHtml.prototype.loadAbi = function(abiString) {
    var abi;

    // support multiple param types
    if (typeof abiString === 'string')
        abi = JSON.parse(abiString)
    else
        return

    // sanity check
    if (abi == null || !abi instanceof Array)
        return

    // loop through all abi items
    for (var i = 0; i < abi.length; i++) {
        var abiItem = abi[i];

        // generate internal representation of inputs
        if ("inputs" in abiItem)
            for (var j = 0; j < abiItem.inputs.length; j++) {
                var param = abiItem.inputs[j];

                if (this.config.inputIdPrefix.length > 0)
                    param.htmlId = [abiItem.name, this.config.inputIdPrefix, param.name].join(this.config.idJoinString)
                else
                    param.htmlId = [abiItem.name, param.name].join(this.config.idJoinString)

                // console.log(abiItem.name, param)
            }

        // generate internal representation of outputs
        if ("outputs" in abiItem)
            for (var k = 0; k < abiItem.outputs.length; k++) {
                var param = abiItem.outputs[k];

                if (param.name.length < 1)
                    param.name = this.config.outputEmptyName

                if (this.config.outputIdPrefex.length > 0)
                    param.htmlId = [abiItem.name, this.config.outputIdPrefex, param.name].join(this.config.idJoinString)
                else
                    param.htmlId = [abiItem.name, param.name].join(this.config.idJoinString)

                // console.log(abiItem.name, param)
            }

    }

    return abi
}

AbiHtml.prototype.generateDocument = function() {
    var abi = this.abi;
    this.doc = {
        functions: [],
        events: []
    }

    for (var i = 0; i < abi.length; i++) {
        var abiItem = abi[i];

        // safety check
        if (!abiItem.type) {
            console.log('Unexpected ABI format')
            return
        }

        switch (abiItem.type) {
            case 'function':
                var func = new Function(this.config.functions, abiItem)
                this.doc.functions.push(func)
                break;
            case 'event':
                var ev = new Event(this.config.events, abi, abiItem)
                this.doc.events.push(ev)
                break;
            case 'constructor':
                // contructors are not accessible
                break;
            default:
                console.log('Unknown field type', abiItem.name, abiItem.type)
        }
    }

    return this.doc
}

/*




*/


var Function = function(config, abiItem) {
    if (abiItem.type != 'function') return
    this.abiItem = abiItem
    this.config = this.applyMissingDefaults(config)

}

Function.prototype.applyMissingDefaults = function(userConfig) {
    var defaultConfig = {
        inputFieldsetName: "Inputs",
        inputScaffolding: function() {

        },

        outputIdPrefex: "out",
        outputFieldsetName: "Outputs",
        outputScaffolding: function() {

        },

        callButtonText: "Call",
        callIdAffix: "call",
        callButtonText: "Call",
        callScaffolding: function() {

        },
        callFunction: function(ev) {
            console.log(ev.target.id)
        },

        transactButtonText: "Transact",
        transactIdAffix: "transact",
        transactScaffolding: function() {

        },
        transactFunction: function(ev) {
            console.log(ev.target.id)
        },

        renderCallback: function(htmlDom) {
            console.log('Got DOM', htmlDom)
        }
    }

    // safety check
    if (!userConfig) userConfig = {}

    // apply default config to missing user config
    for (var k in defaultConfig) {
        if (!userConfig.hasOwnProperty(k))
            userConfig[k] = defaultConfig[k]
    }

    return userConfig
}

Function.prototype.generateHtml = function() {
    var abiItem = this.abiItem

    var div = document.createElement('div')
    div.className = ['border', 'function'].join(' ')
    div.id = 'function' + abiItem.name

    var h3 = document.createElement('h3')
    h3.innerHTML = abiItem.name
    div.appendChild(h3)

    // Call button is only useful when there is a return value
    if (abiItem.outputs.length > 0) {
        var btn = this.makeHtmlCall(abiItem)
        div.appendChild(btn)
    }

    // Transact button available when not constant (constant functions cannot modify state)
    if (!abiItem.constant) {
        var btn = this.makeHtmlTransact(abiItem)
        div.appendChild(btn)
    }

    var inputFields = this.makeInputs(abiItem, true)
    if (inputFields.length > 0) {
        var fsi = document.createElement('fieldset')
        fsi.className = 'input';

        if (this.config.inputFieldsetName.length > 0) {
            var leg = document.createElement('legend');
            leg.innerHTML = this.config.inputFieldsetName;
            fsi.appendChild(leg);
        }

        inputFields.forEach(function(field) {
            fsi.appendChild(field);
        });

        div.appendChild(fsi);
    }

    var fieldsOut = this.makeOutputs(abiItem, false);
    if (fieldsOut.length > 0) {
        var fso = document.createElement('fieldset')
        fso.className = 'output';

        if (this.config.outputFieldsetName.length > 0) {
            var leg = document.createElement('legend');
            leg.innerHTML = this.config.outputFieldsetName;
            fso.appendChild(leg);
        }

        fieldsOut.forEach(function(field) {
            fso.appendChild(field);
        });

        div.appendChild(fso);
    }

    this.config.renderCallback(div);
}

Function.prototype.makeInputs = function(abiItem, isEditable) {
    var results = [];
    var sol = new SolHtml();

    for (var i = 0; i < abiItem.inputs.length; i++) {
        var field = abiItem.inputs[i]
        var html = sol.makeField(field, isEditable)
        html.forEach(function(el) {
            results.push(el);
        })
    }

    return results
}

Function.prototype.makeOutputs = function(abiItem, isEditable) {
    var results = [];
    var sol = new SolHtml();

    for (var i = 0; i < abiItem.outputs.length; i++) {
        var field = abiItem.outputs[i]
        var html = sol.makeField(field, isEditable)
        html.forEach(function(el) {
            results.push(el);
        })
    }

    return results
}

Function.prototype.makeHtmlCall = function(abiItem) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = [abiItem.name, this.config.callIdAffix].join(this.config.idJoinString)
    btn.innerHTML = this.config.callButtonText
    btn.addEventListener('click', this.config.callFunction)
    return btn
}

Function.prototype.makeHtmlTransact = function(abiItem) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = [abiItem.name, this.config.transactIdAffix].join(this.config.idJoinString)
    btn.innerHTML = this.config.transactButtonText
    btn.addEventListener('click', this.config.transactFunction)
    return btn
}


/*





*/


var Event = function(config, abi, abiItem) {
    if (abiItem.type != 'event') return;
    this.abi = abi
    this.abiItem = abiItem
    this.config = this.applyMissingDefaults(config)
}


Event.prototype.applyMissingDefaults = function(userConfig) {
    var defaultConfig = {
        idJoinString: "-",

        inputIdPrefix: "in",
        inputFieldsetName: "Inputs",
        inputScaffolding: function() {

        },

        outputFieldsetName: "Outputs",
        outputScaffolding: function() {

        },
        eventFieldsetName: "Events",
        renderCallback: function(err, results, htmlDom) {

        },
        watchCallback: function(err, results, htmlDom) {
            if (err)
                console.log(err)
            else {
                console.log('Heard event', results)
            }
        },
    }

    // safety check
    if (!userConfig) userConfig = {}

    // apply default config to missing user config
    for (var k in defaultConfig) {
        if (!userConfig.hasOwnProperty(k))
            userConfig[k] = defaultConfig[k]
    }

    return userConfig
}

Event.prototype.watch = function(address, filterFields) {
    var params = [];

    if (!filterFields)
        params.push({});

    // set transaction options to only watch for newly mined
    var options = {
        fromBlock: 'latest',
        toBlock: 'latest',
        address: address
    }
    params.push(options)

    // get instance of contract
    var contract = web3.eth.contract(this.abi).at(address);
    // get function as object
    var func = contract[this.abiItem.name];

    // call the contract storing result
    this.filter = func.apply(func, params);

    if (this.filter) {
        console.log('Watching for event', this.abiItem.name, 'at address', address)

        var that = this
        this.filter.watch(function(err, results) {
            console.log('saw event')
            var doc = that.generateHtml(err, results)
            that.config.watchCallback(err, results, doc)
        })
    }
}

Event.prototype.generateHtml = function(err, results) {
    var div = document.createElement('div');
    div.className = ['border', 'event'].join(' ');
    div.id = 'event' + this.abiItem.name;

    var h3 = document.createElement('h3');
    h3.innerHTML = this.config.eventFieldsetName
    div.appendChild(h3);

    var fields = this.makeInputs(this.abiItem, false);
    // fields.selector('input[i]').value = results.args.value
    // fields.selector('input[i]').address = results.args.address
    if (fields.length > 0) {

        var fsi = document.createElement('fieldset')
        fsi.className = 'event';

        if (this.config.eventFieldsetName.length > 0) {
            var leg = document.createElement('legend');
            leg.innerHTML = this.abiItem.name;
            fsi.appendChild(leg);
        }

        fields.forEach(function(field) {
            fsi.appendChild(field);
        });

        div.appendChild(fsi);
    }

    if (this.config.renderCallback)
        this.config.renderCallback(err, results, div)

    return div
}

Event.prototype.makeInputs = function(abiItem, isEditable) {
    var results = [];
    var sol = new SolHtml();

    for (var i = 0; i < abiItem.inputs.length; i++) {
        var field = abiItem.inputs[i]
        var html = sol.makeField(field, isEditable)
        html.forEach(function(el) {
            results.push(el);
        })
    }

    return results
}

// Event.prototype.makeOutputs = function(abiItem, isEditable) {
//     var results = [];
//     var sol = new SolHtml();

//     for (var i = 0; i < abiItem.outputs.length; i++) {
//         var field = abiItem.outputs[i]
//         var html = sol.makeField(field, isEditable)
//         html.forEach(function(el) {
//             results.push(el);
//         })
//     }

//     return results
// }

/*





*/

var SolHtml = function() {}

SolHtml.prototype.splitType = function(solidityType) {
    var firstDigit = solidityType.type.match(/\d/);
    if (firstDigit === null) {
        return {
            base: solidityType.type,
            size: null
        }
    }
    var index = solidityType.type.indexOf(firstDigit);
    return {
        base: solidityType.type.substring(0, index),
        size: solidityType.type.substring(index, solidityType.length)
    }
}

SolHtml.prototype.makeField = function(field, isEditable, value) {
    var html = [];
    if (!value) var value = ""

    var solType = this.splitType(field)
    field.solType = solType;
    switch (solType.base) {
        case 'bool':
            html = this.makeBool(field, isEditable, value)
            break
        case 'address':
            html = this.makeAddress(field, isEditable, value)
            break
        case 'string':
        case 'bytes':
            html = this.makeBytes(field, isEditable, value)
            break
        case 'int':
        case 'uint':
            html = this.makeInt(field, isEditable, value)
            break
        default:
            console.log('unknown field type:', field.name, solType.base, solType.size)
    }
    return html;
}

SolHtml.prototype.makeBool = function(field, isEditable, value) {
    var div = document.createElement('div');
    div.className = field.solType.base
    if (field.solType.size)
        div.className = [div.className, field.solType.base + field.solType.size].join(' ')

    var label = document.createElement('label');
    label.htmlFor = field.htmlId;
    label.innerHTML = field.name;

    if (!!isEditable) {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'checkbox';
        input.className = div.className
    } else {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'text';
        input.className = [div.className, 'readonly'].join(' ')
        input.readOnly = true;
    }

    div.appendChild(label)
    div.appendChild(input)

    return [div];
};

SolHtml.prototype.makeAddress = function(field, isEditable, value) {
    var div = document.createElement('div');
    div.className = field.solType.base
    if (field.solType.size)
        div.className = [div.className, field.solType.base + field.solType.size].join(' ')

    var label = document.createElement('label');
    label.htmlFor = field.htmlId;
    label.innerHTML = field.name;

    if (!!isEditable) {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'text';
        input.className = div.className
    } else {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'text';
        input.className = [div.className, 'readonly'].join(' ')
        input.readOnly = true;
    }

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

SolHtml.prototype.makeBytes = function(field, isEditable, value) {
    var div = document.createElement('div');
    div.className = field.solType.base
    if (field.solType.size)
        div.className = [div.className, field.solType.base + field.solType.size].join(' ')

    var label = document.createElement('label');
    label.htmlFor = field.htmlId;
    label.innerHTML = field.name;

    if (!!isEditable) {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'text';
        input.className = div.className
    } else {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'text';
        input.className = [div.className, 'readonly'].join(' ')
        input.readOnly = true;
    }

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

SolHtml.prototype.makeInt = function(field, isEditable, value) {
    var div = document.createElement('div');
    div.className = field.solType.base
    if (field.solType.size)
        div.className = [div.className, field.solType.base + field.solType.size].join(' ')

    var label = document.createElement('label');
    label.htmlFor = field.htmlId;
    label.innerHTML = field.name;

    if (!!isEditable) {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'number';
        input.className = div.className
    } else {
        var input = document.createElement('input');
        input.id = field.htmlId;
        input.type = 'number';
        input.className = [div.className, 'readonly'].join(' ')
        input.readOnly = true;
    }

    div.appendChild(label)
    div.appendChild(input)

    return [div];
};
