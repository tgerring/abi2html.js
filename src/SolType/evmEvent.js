"use strict";

var EvmEvent = function(abiItem) {
    // sanity checks
    if (typeof abiItem !== "object") return null
    if (!("name" in abiItem)) return null
    if (!("type" in abiItem) || abiItem.type != "event") return null

    // set properties
    this.abi = abiItem
    this.name = abiItem.name
    this.type = abiItem.type
    this.anonymous = (abiItem.anonymous ? abiItem.anonymous : false)
    this.inputs = []
    this.error = undefined

    // Event values exist as inputs
    // Assemble inputs as SolFields
    for (var i = 0; i < abiItem.inputs.length; i++) {
        this.inputs[i] = new SolField(abiItem.inputs[i])
    }
}

EvmEvent.prototype.GetInputByName = function(name) {
    for (var i = 0; i < this.inputs.length; i++) {
        var field = this.inputs[i]
        if (field.name === name) return this.inputs[i]
    }
}
