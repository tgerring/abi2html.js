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

// EvmFunction.prototype.DefaultRenderer = function(options, cb) {
//     var div = document.createElement('div')
//     div.className = ['function'].join(' ')
//     div.id = 'function' + this.name

//     var h3 = document.createElement('h3')
//     h3.innerHTML = this.name
//     div.appendChild(h3)

//     // Call button is only useful when there is a return value
//     if (this.outputs.length > 0) {
//         var btn = document.createElement('button')
//         btn.type = 'button'
//         btn.id = [this.name, "call"].join('-')
//         btn.innerHTML = "Call"
//         var that = this
//         btn.addEventListener('click', function(ev) {
//             that.Call(options)
//         })
//         div.appendChild(btn)
//     }

//     // Transact button available when not constant (constant functions cannot modify state)
//     if (!this.constant) {
//         var btn = document.createElement('button')
//         btn.type = 'button'
//         btn.id = [this.name, "transact"].join('-')
//         btn.innerHTML = "Transact"
//         var that = this
//         btn.addEventListener('click', function(ev) {
//             that.Transact(options)
//         })
//         div.appendChild(btn)
//     }

//     if (this.inputs.length > 0) {
//         var fs = document.createElement('fieldset')
//         fs.className = 'inputs'

//         var leg = document.createElement('legend')
//         leg.innerHTML = 'Inputs'
//         fs.appendChild(leg)

//         this.inputs.forEach(function(field) {
//             fs.appendChild(field.DefaultRenderer(true))
//         })

//         div.appendChild(fs)
//     }

//     if (this.outputs.length > 0) {
//         var fs = document.createElement('fieldset')
//         fs.className = 'outputs'

//         var leg = document.createElement('legend')
//         leg.innerHTML = 'Outputs'
//         fs.appendChild(leg)

//         this.outputs.forEach(function(field) {
//             fs.appendChild(field.DefaultRenderer(false))
//         })
//         div.appendChild(fs)
//     }

//     if (typeof cb === "function")
//         cb(div)

//     return div
// }
