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
var filters = [];
var defaultUnit = 'ether';
var networkGasPrice;

function getNetworkGasPrice(callback) {
    web3.eth.getGasPrice(function(error, result){
        networkGasPrice = result;
        if (typeof callback == "function")
            callback(result);
    })
}


function getAccounts(domId, callback) {
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
            alert("couldn't get accounts")
        } else {
            setAccounts(domId, accounts);
            if (typeof callback == "function")
                callback();
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
            alert('Transaction: ' + result)
    });
}

function contractCall(id) {
    var kv = getInputValues(id);

    // set transaction options
    gp = getUserGasPrice();
    var options = {
        from: getSenderAddress(),
        gas: getGas(),
        gasPrice: web.toWei(gp.amount, gp.unit)
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
    gp = getUserGasPrice();
    var options = {
        from: getSenderAddress(),
        gas: getGas(),
        gasPrice: web.toWei(gp.amount, gp.unit)
    };
    kv.push(options);

    // set callback
    var callback = function(err, result) {
        if (err)
            alert(err)
        else {
            var id = cFuncId + contract_func_name + '_out_return';
            var elem = document.getElementById(id);
            if (elem) {
                elem.value = result;
            } else {
                alert(contract_func_name + ': ' + result); //txhash, probably
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

function watchEvent(abiItem, filterFields) {
    if (abiItem.type != "event") return;
    var kv = [];

    // first argument empty object
    if (!filterFields)
        filterFields = {};
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

function watchSenderBalance(domId) {
    var unit = defaultUnit;
    var address = getSenderAddress()
    var originalBalance = web3.fromWei(web3.eth.getBalance(address).toNumber(), defaultUnit);
    document.getElementById(domId).innerHTML = originalBalance;

    if (senderBalanceFilter) {
        senderBalanceFilter.stopWatching();
    }
    senderBalanceFilter = web3.eth.filter('pending');
    senderBalanceFilter.watch(function(error, result) {
        var currentBalance = web3.fromWei(web3.eth.getBalance(address).toNumber(), unit)
        document.getElementById(domId).innerHTML = currentBalance;
    });
}

function watchBalance(domId, address) {
    var unit = defaultUnit;
    var curBalance = web3.eth.getBalance(address).toNumber()
    document.getElementById(domId).innerHTML = web3.fromWei(curBalance, unit);

    var filterBalance = web3.eth.filter('pending');
    filterBalance.watch(function(error, result) {
        var newBalance = web3.eth.getBalance(address).toNumber();
        document.getElementById(domId).innerHTML = web3.fromWei(newBalance, unit);
    });
    return filterBalance;
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
                render('functions', r);
                break;
            case "event":
                r = genEvent(val);
                abiEvents.push(val);
                render('events', r);
                watchEvent(val);
                break;
            case "constructor":
                // console.log("ignoring constructor");
                break;
            default:
                console.log("unknown type:", val.name, val.type);
        }
    });
}

var main = function(abi) {
    if (!abi) {
        alert('no abi!')
        return
    }
    getAccounts('sender_address', function(){
        watchSenderBalance('sender_balance')
    });
    readAbi(abi);

    var contractFilter = watchBalance('contract_balance', getContractAddress());
    filters.push(contractFilter);

    getNetworkGasPrice(renderGasPriceEstimate);
    
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
