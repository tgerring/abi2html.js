"use strict";

var AbiHtml = function(abiString, properties) {
    // set propeties not specifid by the user
    if (!properties) properties = {}
    this.properties = this.getDefaults(properties)
    console.log(this.properties)

    this.abi = []
    this.abi = this.loadAbi(abiString);

}

AbiHtml.prototype.getDefaults = function(properties) {
    // set default properties that the user can override
    if (!("idJoinString" in properties))
        properties.idJoinString = "-"

    if (!("outputEmptyName" in properties))
        properties.outputEmptyName = "return"

    if (!("idInputAffix" in properties))
        properties.idInputAffix = '' //properties.idJoinString + "in"

    if (!("idOutputAffix" in properties))
        properties.idOutputAffix = '' //properties.idJoinString + "out"

    if (!("callButtonText" in properties))
        properties.callButtonText = "Call"

    if (!("callIdAffix" in properties))
        properties.callIdAffix = properties.idJoinString + "call"

    if (!("callFunction" in properties))
        properties.callFunction = function(ev) {
            console.log(ev.target.id)
        }

    if (!("transactButtonText" in properties))
        properties.transactButtonText = "Transact"

    if (!("transactIdAffix" in properties))
        properties.transactIdAffix = properties.idJoinString + "transact"

    if (!("transactFunction" in properties))
        properties.transactFunction = function(ev) {
            console.log(ev.target.id)
        }

    return properties
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
                param.htmlId = [abiItem.name, param.name].join(this.properties.idJoinString) + this.properties.idInputAffix
                console.log(abiItem.name, param)
            }

        // generate internal representation of outputs
        if ("outputs" in abiItem)
            for (var k = 0; k < abiItem.outputs.length; k++) {
                var param = abiItem.outputs[k];
                if (param.name.length < 1)
                    param.name = this.properties.outputEmptyName
                param.htmlId = [abiItem.name, param.name].join(this.properties.idJoinString) + this.properties.idOutputAffix
                console.log(abiItem.name, param)
            }

    }

    return abi
}

AbiHtml.prototype.generateDocument = function() {
    var abi = this.abi;
    var doc = {
        functions: [],
        events: []
    }

    for (var i = 0; i < abi.length; i++) {
        var val = abi[i];

        // safety check
        if (!val.type) {
            console.log('Unexpected ABI format')
            return
        }

        switch (val.type) {
            case 'function':
                doc.functions.push(this.generateFunctionForm(val))
                break;
            case 'event':
                doc.events.push(this.generateEventForm(val))
                break;
            case 'constructor':
                // contructors are not accessible
                break;
            default:
                console.log('Unknown field type', val.name, val.type)
        }
    }

    return doc
}

AbiHtml.prototype.generateFunctionForm = function(abiItem) {
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

    // Transact button available when not constant. (Constant functions cannot modify state)
    if (!abiItem.constant) {
        var btn = this.makeHtmlTransact(abiItem)
        div.appendChild(btn)
    }

    var inputFields = this.makeInputs(abiItem, true)
    if (inputFields.length > 0) {
        var fsi = document.createElement('fieldset')
        fsi.className = 'input';

        var leg = document.createElement('legend');
        leg.innerHTML = 'Inputs';
        fsi.appendChild(leg);

        inputFields.forEach(function(field) {
            fsi.appendChild(field);
        });

        div.appendChild(fsi);
    }

    var fieldsOut = this.makeOutputs(abiItem, false);
    if (fieldsOut.length > 0) {
        var fso = document.createElement('fieldset')
        fso.className = 'output';

        var leg = document.createElement('legend');
        leg.innerHTML = 'Outputs';
        fso.appendChild(leg);

        fieldsOut.forEach(function(field) {
            fso.appendChild(field);
        });

        div.appendChild(fso);
    }

    return div;
}

AbiHtml.prototype.generateEventForm = function(abiItem) {
    var div = document.createElement('div');
    div.className = ['border', 'event'].join(' ');
    div.id = 'event' + abiItem.name;

    var h3 = document.createElement('h3');
    h3.innerHTML = 'Event: ' + abiItem.name
    div.appendChild(h3);

    var fields = this.makeInputs(abiItem, false);
    if (fields.length > 0) {

        var fsi = document.createElement('fieldset')
        fsi.className = 'output';

        var leg = document.createElement('legend');
        leg.innerHTML = 'Outputs';
        fsi.appendChild(leg);

        fields.forEach(function(field) {
            fsi.appendChild(field);
        });

        div.appendChild(fsi);
    }

    return div;
}

AbiHtml.prototype.makeInputs = function(abiItem, isEditable) {
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

AbiHtml.prototype.makeOutputs = function(abiItem, isEditable) {
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

AbiHtml.prototype.makeHtmlCall = function(abiItem) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = [abiItem.name].join(this.properties.idJoinString) + this.properties.callIdAffix
    btn.innerHTML = this.properties.callButtonText
    btn.addEventListener('click', this.properties.callFunction)
    return btn
}

AbiHtml.prototype.makeHtmlTransact = function(abiItem) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = [abiItem.name].join(this.properties.idJoinString) + this.properties.transactIdAffix
    btn.innerHTML = this.properties.transactButtonText
    btn.addEventListener('click', this.properties.transactFunction)
    return btn
};

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

SolHtml.prototype.makeField = function(field, isEditable) {
    var html = [];

    var solType = this.splitType(field)
    field.solType = solType;
    switch (solType.base) {
        case 'bool':
            html = this.makeBool(field, isEditable)
            break
        case 'address':
            html = this.makeAddress(field, isEditable)
            break
        case 'string':
        case 'bytes':
            html = this.makeBytes(field, isEditable)
            break
        case 'int':
        case 'uint':
            html = this.makeInt(field, isEditable)
            break
        default:
            console.log('unknown field type:', field.name, solType.base, solType.size)
    }
    return html;
}

SolHtml.prototype.makeBool = function(field, isEditable) {
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

SolHtml.prototype.makeAddress = function(field, isEditable) {
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

SolHtml.prototype.makeBytes = function(field, isEditable) {
    // if (size == null) size = '256';

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

SolHtml.prototype.makeInt = function(field, isEditable) {
    // if (size == null) size = '256';

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
