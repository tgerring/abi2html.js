function inBool(name, id) {
    id = id + '_' + name
    return '<label for="' + id + '">' + name + '</label><input type="checkbox" class="' + cParamIn + ' in_check" id="' + id + '">';
}

function inAddress(name, id) {
    id = id + '_' + name
    return '<label for="' + id + '">' + name + ':</label><input type="text" id="' + id + '" class="' + cParamIn + ' in_address">';
}

function inBytes(name, size, id) {
    id = id + '_' + name
    if (size == null) size = '256';
    return '<label for="' + id + '">' + name + ':</label><input type="text" id="' + id + '" class="' + cParamIn + ' in_bytes' + size + '">';
}

function inInt(name, size, id) {
    id = id + '_' + name
    if (size == null) size = '256';
    return '<label for="' + id + '">' + name + ':</label><input type="text" id="' + id + '" class="' + cParamIn + ' in_int' + size + '">';
}

function inUint(name, size, id) {
    id = id + '_' + name
    if (size == null) size = '256';
    return '<label for="' + id + '">' + name + ':</label><input type="text" id="' + id + '" class="' + cParamIn + ' in_int' + size + '">';
}

function outBool(name, id) {
    // for example, a return value from a call'd function
    if (!name) name = 'return';
    id = id + '_' + name
    return '<label for="' + id + '">' + name + ':</label><input type="text" class="readonly ' + cParamOut + ' out_bool" id="' + id + '" readonly></input>';
}

function outAddress(name, id) {
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    return '<label for="' + id + '">' + name + ':</label><input type="text" class="readonly cParamOut out_address" id="' + id + '" readonly></input>';
}

function outBytes(name, size, id) {
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    if (size == null) size = '256';
    return '<label for="' + id + '">' + name + ':</label><input type="text" class="readonly cParamOut out_bytes' + size + '" id="' + id + '" readonly></input>';
}

function outInt(name, size, id) {
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    if (size == null) size = '256';
    return '<label for="">' + name + ':</label><input type="text" class="readonly cParamOut out_int' + size + '" id="' + id + '" readonly></input>';
}

function outUint(name, size, id) {
    id = id + '_' + name
    if (name === null) name = 'Output' + id;
    if (size == null) size = '256';
    return '<label for="">' + name + ':</label><input type="text" class="readonly cParamOut out_uint' + size + '" id="' + id + '" readonly></span>';
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
    return {amount: amount, unit: unit};
}

function getGas() {
    return document.getElementById('gas').value;
}

function getEtherAmount() {
    return document.getElementById('ether_amt').value;
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
    // var outFields = getOutputFields(id);
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
                // alert('Could not find id ' + id)
        }
    });
}

function fillResults(id, result) {
    var outFields = getOutputFields(id);
    outFields.forEach(function(val) {
        // console.log(id, val, result);
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
            // alert('Could not find id ' + id)
        }
    });
}



function genFunction(abiItem) {
    // TODO model as object instead of text
    id = cFuncId + abiItem.name;
    var text = '<div class="border function" id="' + id + '"><h3>Function: ' + abiItem.name + '</h3>';
    var fields_in = makeInputs(abiItem.inputs, id);

    text += '<fieldset class="' + cFieldsIn + '"><legend>Inputs</legend>';
    if (fields_in.length > 0) {
        fields_in.forEach(function(field) {
            text += field;
        });
    }


    // Call is only useful when there is a return value
    if (abiItem.outputs.length > 0)
        text += ' <button type="button" id="' + id + '_btn" onclick="contractCall(\'' + id + '\')">Call</button>';
    // Transact available when not constant. (Constant functions cannot modify state)
    if (!abiItem.constant)
        text += ' <button type="button" id="' + id + '_btn" onclick="contractTransact(\'' + id + '\')">Transact</button>';
    text += '</fieldset>'


    var fields_out = makeOutputs(abiItem.outputs, id);
    if (fields_out.length > 0) {
        text += '<fieldset class="' + cFieldsOut + '"><legend>Outputs</legend>';
        fields_out.forEach(function(field) {
            text += field;
        });
        text += '</fieldset>';
    }

    text += '</div>';

    return text;
}


function genEvent(abiItem) {
    // TODO model as object instead of text
    id = cEventId + abiItem.name;
    var text = '';
    text += '<div class="border event" id="' + id + '"><h3>Event: ' + abiItem.name + '</h3>';
    var fields = makeInputs(abiItem.inputs, id);
    if (fields.length > 0)
        text += '<fieldset class="' + cFieldsOut + '"><legend>Outputs</legend>';
    fields.forEach(function(field) {
        text += field;
    });
    if (fields.length > 0)
        text += '</fieldset>';
    text += '</div>';

    return text;
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
    // console.log(text);
    var pre = document.getElementById(elementId).innerHTML;
    document.getElementById(elementId).innerHTML = pre + text;
}

function renderGasPriceEstimate(gasWei) {
        var elAmount = document.getElementById('gas_price');
        var elUnit = document.getElementById('gas_price_unit');

        elAmount.value = web3.fromWei(gasWei, elUnit.value);
}

function renderAccountBalance(domId, weiBalance) {
    var formattedBalance = web3.fromWei(weiBalance, defaultUnit).toString() + ' ' + defaultUnit

    document.getElementById(domId).innerHTML = formattedBalance;
}
