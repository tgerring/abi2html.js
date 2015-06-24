var Contract = web3.eth.contract(abi);
var cFieldsIn = 'fields_in',
    cFieldsOut = 'fields_out';
var cFuncId = 'f_',
    cEventId = 'e_';
var cInId = '_in',
    cOutId = '_out';
var cParamIn = 'p_in',
    cParamOut = 'p_out';
var abiEvents = [];
var abiFunctions = [];
var senderBalanceFilter;




function getAccounts(domId, callback) {
    web3.eth.getAccounts(function(error, accounts) {
        if (!error) {
            setAccounts(domId, accounts);
            if (typeof callback == "function")
                callback();
        } else {
            alert("couldn't get accounts")
        }
    });
}

function splitSolType(solidityType) {
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


function makeInputs(abiFields, id) {
    var results = [],
        end = abiFields.length,
        html;
    id = id + cInId;

    for (var i = 0; i < end; i = i + 1) {
        var field = abiFields[i];
        var solType = splitSolType(field);
        switch (solType.base) {
            case "bool":
                html = inBool(field.name, id);
                break;
            case "address":
                html = inAddress(field.name, id);
                break;
            case "bytes":
                html = inBytes(field.name, solType.size, id);
                break;
            case "int":
                html = inInt(field.name, solType.size, id);
                break;
            case "uint":
                html = inUint(field.name, solType.size, id);
                break;
            default:
                html = '';
                console.log("unknown type:", field.name, solType.base, solType.size);
        }
        results.push(html);
    }
    return results;
}


function makeOutputs(abiFields, id) {
    var results = [],
        end = abiFields.length,
        html;
    id = id + cOutId;

    for (var i = 0; i < end; i = i + 1) {
        var field = abiFields[i];
        var solType = splitSolType(field);
        switch (solType.base) {
            case "bool":
                html = outBool(field.name, id);
                break;
            case "address":
                html = outAddress(field.name, id);
                break;
            case "bytes":
                html = outBytes(field.name, solType.size, id);
                break;
            case "int":
                html = outInt(field.name, solType.size, id);
                break;
            case "uint":
                html = outUint(field.name, solType.size, id);
                break;
            default:
                html = '';
                console.log("unknown type:", field.name, solType.base, solType.size);
        }
        results.push(html);
    }
    return results;
}

function genFunction(abiItem) {
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

    text += "</div>";

    display('functions', text);
}


function genEvent(abiItem) {
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
    text += "</div>";

    display('events', text);
    watchEvent(abiItem);
}

function getOutputFields(funcId) {
    var v = [];
    var i;
    for (i = 0; i < abi.length; i++) {
        if (abi[i].name == funcId.slice(2, funcId.length))
            break;
    };
    if (i == abi.length) {
        return null;
    }
    abi[i].outputs.forEach(function(field) {
        var name = '_' + (field.name == "" ? "return" : field.name);
        v.push({
            name: funcId + cOutId + name,
            type: field.type
        });
    });
    return v;
}

function getInputFields(funcId) {
    var v = [];
    var i;
    for (i = 0; i < abi.length; i++) {
        // TODO this needs to be cleaned up
        if (abi[i].name == funcId || abi[i].name == funcId.slice(2, funcId.length))
            break;
    };
    if (i == abi.length) {
        return null;
    }
    abi[i].inputs.forEach(function(field) {
        var name = '_' + field.name;
        v.push({
            name: funcId + cInId + name,
            type: field.type
        });
    });
    return v;
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

function sendValue() {
    var address = getContractAddress();
    var account = getSenderAddress();
    var etheramt = getEtherAmount();

    var tx = web3.eth.sendTransaction({
        from: account,
        to: address,
        value: web3.toWei(etheramt, "ether")
    }, function(error, result) {
        if (error)
            alert(error);
        else
            alert(result)
    });
}

function contractCall(id) {
    var kv = getInputValues(id);

    // set transaction options
    var options = {
        from: getSenderAddress(),
        gas: getGas(),
        gasPrice: getGasPrice()
    };
    kv.push(options);

    // set callback
    var callback = function(err, result) {
        if (err)
            alert(err)
        else {
            fillResults(id, result);
        }
    }
    kv.push(callback);

    // get instance of contract
    var contract = Contract.at(getContractAddress());
    // get function as object
    var contract_func_name = id.substring(cFuncId.length, id.length);
    var func = contract[contract_func_name];
    // call the contract
    func.call.apply(func, kv);
}

function contractTransact(id) {
    var kv = getInputValues(id);

    // set transaction options
    var options = {
        from: getSenderAddress(),
        gas: getGas(),
        gasPrice: getGasPrice()
    };
    kv.push(options);

    // set callback
    var callback = function(err, result) {
        if (err)
            alert(err)
        else {
            // fillResults('f_' + contract_func_name, results)
            var id = cFuncId + contract_func_name + '_out_return';
            var elem = document.getElementById(id);
            if (elem) {
                elem.value = result;
            } else {
                alert(contract_func_name + ': ' + result);
                // alert('Could not find id ' + id)
            }
        }
    }
    kv.push(callback);

    // get instance of contract
    var contract = Contract.at(getContractAddress());
    // get function as object
    var contract_func_name = id.substring(2, id.length);
    var func = contract[contract_func_name];
    // transact the contract
    func.sendTransaction.apply(func, kv);
}

function watchEvent(abiItem) {
    if (abiItem.type != "event") return;
    var kv = [];

    // first argument empty object
    // TODO accept params as function input
    var filterFields = {};
    kv.push(filterFields);

    // set transaction options to only watch for newly mined
    var options = {
        fromBlock: 'latest',
        toBlock: 'latest'
    };
    kv.push(options);

    // set callback
    var callback = function(err, result) {
        if (err)
            alert(err)
        else {
            fillEventOutput(result.event, result.args);
        }
    }

    // get instance of contract
    var contract = Contract.at(getContractAddress());
    // get function as object
    var contract_func_name = id.substring(cFuncId.length, id.length);
    var func = contract[contract_func_name];
    // call the contract
    func.apply(func, kv).watch(callback);

}

function watchSenderBalance() {
    var unit = "ether";
    var address = getSenderAddress()
    var originalBalance = web3.fromWei(web3.eth.getBalance(address).toNumber(), unit);
    document.getElementById('sender_balance').innerHTML = originalBalance;

    if (senderBalanceFilter) {
        senderBalanceFilter.stopWatching();
    }
    senderBalanceFilter = web3.eth.filter('pending');
    senderBalanceFilter.watch(function(error, result) {
        var currentBalance = web3.fromWei(web3.eth.getBalance(address).toNumber(), unit)
        document.getElementById("sender_balance").innerHTML = currentBalance;
    });
}

function watchContractBalance() {
    var unit = "ether";
    var contract = getContractAddress()
    var originalBalance = web3.eth.getBalance(contract).toNumber()
    document.getElementById('contract_balance').innerHTML = web3.fromWei(originalBalance, unit);

    var f_balance = web3.eth.filter('pending');
    f_balance.watch(function(error, result) {
        var currentBalance = web3.eth.getBalance(contract).toNumber();
        document.getElementById("contract_balance").innerHTML = web3.fromWei(currentBalance, unit);
    });
    filters.push(f_balance);
}

function display(elementname, text) {
    // console.log(text);
    var pre = document.getElementById(elementname).innerHTML;
    document.getElementById(elementname).innerHTML = pre + text;
}

function readAbi(abi) {
    abi.forEach(function(val) {
        // safety check
        if (!val.type) {
            console.log('Unexpected ABI format');
            return
        }
        var r;
        switch (val.type) {
            case "function":
                r = genFunction(val);
                abiFunctions.push(val);
                break;
            case "event":
                r = genEvent(val);
                abiEvents.push(val);
                break;
            case "constructor":
                // console.log("ignoring constructor");
                break;
            default:
                console.log("unknown type:", val.name, val.type);
        }
    });
}

var filters = [];

var main = function(abi) {
    if (!abi) {
        alert('no abi!')
    }
    getAccounts("sender_address", watchSenderBalance);
    readAbi(abi);
    // watchLogs();
    watchContractBalance();
}

var unset = function() {
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        filter.stopWatching();
    };
    filters = [];
}

var reload = function() {
    unset();
    main(abi);
}
