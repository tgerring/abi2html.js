"use strict";

var EvmFunction = function(abiItem) {
    if (typeof abiItem !== "object") return null
    if (!("name" in abiItem)) return null
    if (!("type" in abiItem) || abiItem.type != "function") return null

    this.abi = abiItem
    this.name = abiItem.name
    this.type = abiItem.type
    this.constant = (abiItem.constant ? abiItem.constant : false)
    this.inputs = []
    this.outputs = []
    this.error = undefined

    // assemble function parameters
    for (var i = 0; i < abiItem.inputs.length; i++) {
        var field = new SolField(abiItem.inputs[i])
        this.inputs[i] = field
    }

    // assemble return values
    for (var i = 0; i < abiItem.outputs.length; i++) {
        var field = new SolField(abiItem.outputs[i])
        this.outputs[i] = field
    }
}
