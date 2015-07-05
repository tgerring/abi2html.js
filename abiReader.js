var Contract;

var cFuncId = 'f_',
    cEventId = 'e_';
var cInId = '_in',
    cOutId = '_out';

var filters = [];
var defaultUnit = 'ether';
var networkGasPrice;

function getNetworkGasPrice(callback) {
    web3.eth.getGasPrice(function(error, result) {
        if (error) {
            console.log('could not get gas price estimate')
        } else {
            networkGasPrice = result;
            console.log('Network gas price estimate:', result.toString(), 'wei');
            if (typeof callback == 'function')
                callback(result);
        }
    })
}


function getAccounts(domId, callback) {
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
            alert('could not get accounts')
        } else {
            console.log('Got accounts:', accounts)
            setAccounts(domId, accounts);
            if (typeof callback == 'function')
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
        html = [];
    id = id + cInId;

    for (var i = 0; i < end; i = i + 1) {
        var field = abiFields[i];
        var solType = splitSolType(field);
        switch (solType.base) {
            case 'bool':
                html = inBool(field.name, id);
                break;
            case 'address':
                html = inAddress(field.name, id);
                break;
            case 'bytes':
                html = inBytes(field.name, solType.size, id);
                break;
            case 'int':
                html = inInt(field.name, solType.size, id);
                break;
            case 'uint':
                html = inUint(field.name, solType.size, id);
                break;
            default:
                console.log('unknown type:', field.name, solType.base, solType.size);
        }
        html.forEach(function(el) {
            results.push(el);
        })
    }


    return results;
}


function makeOutputs(abiFields, id) {
    var results = [],
        end = abiFields.length,
        html = [];
    id = id + cOutId;

    for (var i = 0; i < end; i = i + 1) {
        var field = abiFields[i];
        var solType = splitSolType(field);
        switch (solType.base) {
            case 'bool':
                html = outBool(field.name, id);
                break;
            case 'address':
                html = outAddress(field.name, id);
                break;
            case 'bytes':
                html = outBytes(field.name, solType.size, id);
                break;
            case 'int':
                html = outInt(field.name, solType.size, id);
                break;
            case 'uint':
                html = outUint(field.name, solType.size, id);
                break;
            default:
                console.log('unknown type:', field.name, solType.base, solType.size);
        }
        html.forEach(function(el) {
            results.push(el);
        })
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
        var name = '_' + (field.name == '' ? 'return' : field.name);
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
    var abi = getAbi()
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
        value: web3.toWei(etheramt, defaultUnit)
    }, function(error, result) {
        if (error)
            alert(error);
        else {
            // TODO renderTransactionHash
            console.log('Transaction: ' + result)
            alert('Transaction: ' + result)
        }
    });
}

function deployContract(hexstring, callback) {
    gp = getUserGasPrice();
    var options = {
        from: getSenderAddress(),
        code: hexstring,
        value: web3.toWei(getEtherAmount(), defaultUnit),
        gas: getGas(),
        gasPrice: web3.toWei(gp.amount, gp.unit)
    };

    web3.eth.sendTransaction(options, callback);
}

function contractCall(id) {
    var kv = getInputValues(id);

    // set transaction options
    gp = getUserGasPrice();
    var options = {
        from: getSenderAddress(),
        gas: getGas(),
        gasPrice: web3.toWei(gp.amount, gp.unit)
    };
    console.log('Calling contract with options', options);
    kv.push(options);

    // set callback
    var callback = function(err, result) {
        if (err)
            alert(err)
        else {
            console.log('Contract call returned', result);
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
        gasPrice: web3.toWei(gp.amount, gp.unit)
    };
    console.log('Sending transaction with options', options);
    kv.push(options);

    // set callback
    var callback = function(err, result) {
        // result is txhash
        if (err)
            alert(err)
        else {
            // TODO generalize below call for all output types
            // fillEventOutput(result.event, result.args);

            var id = cFuncId + contract_func_name + '_out_return';
            var elem = document.getElementById(id);
            if (elem) {
                console.log('Transaction returned', result)
                elem.value = result;
            } else {
                console.log(contract_func_name + ': ' + result);
                alert(contract_func_name + ': ' + result);
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
    if (abiItem.type != 'event') return;
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
            console.log('Event:', result);
            fillEventOutput(result.event, result.args);
        }
    }

    // get instance of contract
    var address = getContractAddress()
    if (address) {
        var contract = Contract.at(address);
        // get function as object
        var contract_func_name = id.substring(cFuncId.length, id.length);
        var func = contract[contract_func_name];
        // call the contract
        var eventFilter = func.apply(func, kv);
        console.log('filtering for event', contract_func_name)
        eventFilter.watch(callback);
        return eventFilter;
    }

}

function watchBlocks(callback) {
    var filter = web3.eth.filter('latest');
    filter.watch(function(error, result) {
        console.log('Saw new block', result);
        callback(result);
    });
    console.log('Started new block filter', filter);

    return filter;
}

function getBalance(address) {
    var weiBalance = web3.eth.getBalance(address).toNumber()
    console.log('Got address', address, 'balance of', web3.fromWei(weiBalance.toString(), defaultUnit), defaultUnit);
    return weiBalance;
}

function compileSolidity(sourceString, callback) {
    var c = web3.eth.getCompilers()
    var i = 0;
    for (; i < c.length; i++) {
        if (c[i] == 'Solidity')
            break;
    }
    if (i < c.length) {
        web3.eth.compile.solidity(sourceString, callback)
    } else {
        alert("Solidity compiler not available")
    }
}

function generateDoc(watchEvents) {
    unset()
    var abi = getAbi()
    Contract = web3.eth.contract(abi);

    abi.forEach(function(val) {
        // safety check
        if (!val.type) {
            console.log('Unexpected ABI format');
            return
        }
        // console.log('Generating',val.type,'for',val.name);
        switch (val.type) {
            case 'function':
                render('functions', genFunction(val));
                break;
            case 'event':
                render('events', genEvent(val));
                if (watchEvents === true) {
                    var filter = watchEvent(val);
                    filters.push(filter);
                }
                break;
            case 'constructor':
                break;
            default:
                console.log('unknown type:', val.name, val.type);
        }
    });
}

function connectInstance(ip, port) {
    if (!ip) ip = '127.0.0.1'
    if (!port) port = '8545'
    web3.setProvider(new web3.providers.HttpProvider('http://' + ip + ':' + port));
    try {
        web3.eth.accounts;
    } catch (e) {
        return false
    }
    return true
}

function updateBalances() {
    var sender = getSenderAddress()
    var contract = getContractAddress()
    if (sender)
        renderAccountBalance('sender_balance', getBalance(sender));
    if (contract)
        renderAccountBalance('contract_balance', getBalance(contract));
}

function monitorBlocks() {
    unset()
    var blockFilter = watchBlocks(function(result) {
        updateBalances()
        getNetworkGasPrice(renderGasPriceEstimate)
    });
    filters.push(blockFilter);
}

function unset() {
    console.log('Clearing DOM')
    document.getElementById('functions').innerHTML = '';
    document.getElementById('events').innerHTML = '';

    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        if (filter) {
            console.log('Stopping filter', filter.filterId)
            filter.stopWatching();
        }
    };
    filters = [];


}
