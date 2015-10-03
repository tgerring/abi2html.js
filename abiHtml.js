var cFieldsIn = 'fields_in',
    cFieldsOut = 'fields_out';
var cParamIn = 'p_in',
    cParamOut = 'p_out';

function inBool(name, id) {
    id = id + '_' + name

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.className = cParamIn + ' in_check';
    input.id = id;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function inAddress(name, id) {
    id = id + '_' + name

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = cParamIn + ' in_address';
    input.id = id;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function inBytes(name, size, id) {
    id = id + '_' + name
    if (size == null) size = '256';

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = cParamIn + ' in_bytes' + size;
    input.id = id;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function inInt(name, size, id) {
    id = id + '_' + name
    if (size == null) size = '256';

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = cParamIn + ' in_int' + size;
    input.id = id;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function inUint(name, size, id) {
    id = id + '_' + name
    if (size == null) size = '256';

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = cParamIn + ' in_uint' + size;
    input.id = id;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function outBool(name, id) {
    // for example, a return value from a call'd function
    if (!name) name = 'return';
    id = id + '_' + name

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'readonly ' + cParamOut + ' out_bool';
    input.id = id;
    input.readOnly = true;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function outAddress(name, id) {
    if (!name) name = 'return';
    id = id + '_' + name
    if (name === null) name = 'Output' + id;

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'readonly ' + cParamOut + ' out_address';
    input.id = id;
    input.readOnly = true;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function outBytes(name, size, id) {
    if (!name) name = 'return';
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    if (size == null) size = '256';

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = ['readonly', cParamOut, 'out_bytes' + size].join(' ');
    input.id = id;
    input.readOnly = true;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function outInt(name, size, id) {
    if (!name) name = 'return';
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    if (size == null) size = '256';

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = ['readonly', cParamOut, 'out_int' + size].join(' ');
    input.id = id;
    input.readOnly = true;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function outUint(name, size, id) {
    if (!name) name = 'return';
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    if (size == null) size = '256';

    var div = document.createElement('div');
    div.className = cParamIn

    var label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = name;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = ['readonly', cParamOut, 'out_unit' + size].join(' ');
    input.id = id;
    input.readOnly = true;

    div.appendChild(label)
    div.appendChild(input)

    return [div];
}

function getAbi() {
    return JSON.parse(document.getElementById('contract-abi').value);
    // return getSelectedContract().info.abiDefinition;
}

function getInstanceHostname() {
    return document.getElementById('instance-hostname').value;
}

function getInstancePort() {
    return document.getElementById('instance-port').value;
}

function getContractAddress() {
    return document.getElementById('contract_address').value;
}

function getSenderAddress() {
    return document.getElementById('sender_address').value;
}

function getUserGasPrice() {
    var amount = document.getElementById('gas_price').value;
    var unit = document.getElementById('gas_price_unit').value;
    return {
        amount: amount,
        unit: unit
    };
}

function getGas() {
    return document.getElementById('gas').value;
}

function getEtherAmount() {
    return document.getElementById('ether_amt').value;
}


function setContractSelector(elemId, contracts) {
    // get DOM object
    select = document.getElementById(elemId);
    // reset items
    select.options.length = 0;
    // inject accounts
    for (var k in contracts) {
        var obj = contracts[k];
        var el = document.createElement('option');
        el.textContent = k;
        el.value = k;
        select.options.add(el);
    }
}

function renderContractInfo(elemId, abiObj) {
    document.getElementById(elemId).value = JSON.stringify(abiObj.info.abiDefinition)
}

function getSelectedContract(elemId) {
    if (!elemId)
        elemId = 'contract-selector'
    var contractName = document.getElementById(elemId).value
    return contracts[contractName]
}


function setAccounts(elemId, accounts) {
    // get DOM object
    select = document.getElementById(elemId);
    // reset items
    select.options.length = 0;
    // inject accounts
    for (var i = 0; i < accounts.length; i++) {
        var opt = accounts[i];
        var el = document.createElement('option');
        el.textContent = opt;
        el.value = opt;
        select.options.add(el);
    }
}

function fillEventOutput(id, results) {
    var outFields = getInputFields(id);
    outFields.forEach(function(val) {
        var badId = id + cInId + '_'
        var idxName = val.name.slice((val.name.length - badId.length) * -1)
        var result = results[idxName];
        var eventDomId = cEventId + val.name
        var elem = document.getElementById(eventDomId);
        if (elem) {
            switch (val.type.substring(0, 3)) {
                case 'byt':
                    elem.value = web3.toHex(result);
                    break;
                default:
                    elem.value = result;
            }

        } else {
            console.log('Looking for event', eventDomId, 'with result', result)
        }
    });
}

function fillResults(id, result) {
    var outFields = getOutputFields(id);
    outFields.forEach(function(val) {
        var elem = document.getElementById(val.name);
        if (elem) {
            switch (val.type.substring(0, 3)) {
                case 'byt':
                    elem.value = web3.toHex(result);
                    break;
                default:
                    elem.value = result.toString();
            }

        } else {
            console.log('Could not find id', id)
        }
    });
}



function genFunction(abiItem) {
    id = cFuncId + abiItem.name;

    var div = document.createElement('div');
    div.className = ['border', 'function'].join(' ');
    div.id = id;

    var h3 = document.createElement('h3');
    h3.innerHTML = 'Function: ' + abiItem.name
    div.appendChild(h3);

    // Call is only useful when there is a return value
    if (abiItem.outputs.length > 0) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = id + '_call';
        btn.innerHTML = 'Call';
        btn.addEventListener('click', function() {
            contractCall(div.id)
        });
        div.appendChild(btn)
    }

    // Transact available when not constant. (Constant functions cannot modify state)
    if (!abiItem.constant) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = id + '_transact';
        btn.innerHTML = 'Transact';
        btn.addEventListener('click', function() {
            contractTransact(div.id)
        });
        div.appendChild(btn)
    }

    var fieldsIn = makeInputs(abiItem.inputs, id);

    if (fieldsIn.length > 0) {
        var fsi = document.createElement('fieldset')
        fsi.className = cFieldsIn;

        var leg = document.createElement('legend');
        leg.innerHTML = 'Inputs';
        fsi.appendChild(leg);

        fieldsIn.forEach(function(field) {
            fsi.appendChild(field);
        });

        div.appendChild(fsi);
    }



    var fieldsOut = makeOutputs(abiItem.outputs, id);
    if (fieldsOut.length > 0) {
        var fso = document.createElement('fieldset')
        fso.className = cFieldsOut;

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


function genEvent(abiItem) {
    id = cEventId + abiItem.name;

    var div = document.createElement('div');
    div.className = ['border', 'event'].join(' ');
    div.id = id;

    var h3 = document.createElement('h3');
    h3.innerHTML = 'Event: ' + abiItem.name
    div.appendChild(h3);

    var fields = makeInputs(abiItem.inputs, id);
    if (fields.length > 0) {

        var fsi = document.createElement('fieldset')
        fsi.className = cFieldsOut;

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

function getInputValues(id) {
    f = getInputFields(id);
    var kv = [];

    for (var i = 0; i < f.length; i++) {
        f[i].value = document.getElementById(f[i].name).value;
        kv.push(f[i].value);
    };

    return kv;
}

function render(elementId, text) {
    document.getElementById(elementId).appendChild(text);
}

function renderUserGasPrice(gasWei) {
    // getNetworkGasPrice(function(gasWei) {
        var elAmount = document.getElementById('gas_price');
        var elUnit = document.getElementById('gas_price_unit');
        elAmount.value = web3.fromWei(gasWei, elUnit.value);
    // })

}

function renderGasPriceEstimate() {
    getNetworkGasPrice(function(gasWei) {
        var elUnit = document.getElementById('gas_price_unit');
        document.getElementById('gas-price').innerHTML = web3.fromWei(gasWei, elUnit.value) + ' ' + elUnit.value
    })
}

function renderAccountBalance(domId, weiBalance) {
    var formattedBalance = web3.fromWei(weiBalance, defaultUnit).toString() + ' ' + defaultUnit

    document.getElementById(domId).innerHTML = formattedBalance;
}

function getTransactionHash() {
    return document.getElementById('transaction-hash').value
}

function renderTransactionHash(hash) {
    document.getElementById('transaction-hash').value = hash
}

function renderBlock(block) {
    document.getElementById('block-height').innerHTML = block.number
    document.getElementById('block-hash').innerHTML = block.hash
}


function renderTxCostTotal() {
    var gp = getUserGasPrice()
    var gas = getGas()
    var wei  = web3.toWei(gp.amount, gp.unit)
    var tot = wei * gas
    // document.getElementById('txcost-total').innerHTML = web3.fromWei(wei, gp.unit) + ' ' + gp.unit
    document.getElementById('txcost-total').innerHTML = web3.fromWei(tot, defaultUnit) + ' ' + defaultUnit
    // document.getElementById('txcost-total').innerHTML = tot.toString() + ' ' + gp.unit
}
