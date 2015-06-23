var abi = [{
    "constant": false,
    "inputs": [],
    "name": "isTrue",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "addr",
        "type": "address"
    }],
    "name": "queryBalance",
    "outputs": [{
        "name": "balance",
        "type": "uint256"
    }],
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "owner",
        "type": "address"
    }, {
        "name": "amount",
        "type": "uint256"
    }],
    "name": "mint",
    "outputs": [],
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "receiver",
        "type": "address"
    }, {
        "name": "amount",
        "type": "uint256"
    }],
    "name": "send",
    "outputs": [],
    "type": "function"
}, {
    "inputs": [],
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "from",
        "type": "address"
    }, {
        "indexed": false,
        "name": "to",
        "type": "address"
    }, {
        "indexed": false,
        "name": "value",
        "type": "uint256"
    }],
    "name": "Send",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "from",
        "type": "address"
    }, {
        "indexed": false,
        "name": "value",
        "type": "uint256"
    }],
    "name": "Deposit",
    "type": "event"
}]
