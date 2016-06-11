"use strict";

var EvmConstructor = function(abiItem) {
    if (typeof abiItem !== "object") return null
    if (!("type" in abiItem) || abiItem.type != "constructor") return null

    this.abi = abiItem
    this.name = 'Constructor'
    this.type = abiItem.type
    this.inputs = []
    this.outputs = []
    this.error = undefined

    for (var i = 0; i < abiItem.inputs.length; i++) {
        var field = new SolField(abiItem.inputs[i])
        this.inputs[i] = field
    }

}



EvmConstructor.prototype.makeFieldForm = function(callCallback, transactCallback) {
    var div = document.createElement('div')
    div.className = ['constructor'].join(' ')
    div.id = 'constructor' + this.name

    // generate inputs with html id
    if (this.inputs.length > 0) {
        var fsi = document.createElement('fieldset')
        fsi.className = 'inputs'

        var leg = document.createElement('legend')
        leg.innerHTML = 'Inputs'
        fsi.appendChild(leg)

        this.inputs.forEach(function(field) {
            field.setHtmlId(['constructor', field.name, 'input'].join('-'))
            fsi.appendChild(field.DefaultRenderer(true))
        })

    }

    // // generate outputs with htmlid
    // if (this.outputs.length > 0) {
    //     var fso = document.createElement('fieldset')
    //     fso.className = 'outputs'

    //     var leg = document.createElement('legend')
    //     leg.innerHTML = 'Outputs'
    //     fso.appendChild(leg)

    //     this.outputs.forEach(function(field) {
    //         field.setHtmlId(['function', this.name, 'output'].join('-'))
    //         fso.appendChild(field.DefaultRenderer(false))
    //     })

    // }

    // // display call button when we the function has output fields
    // if (this.outputs.length > 0) {
    //     var btn = document.createElement('button')
    //     btn.type = 'button'
    //     btn.innerHTML = 'Call'
    //     var that = this
    //     btn.addEventListener('click', function() {
    //         callCallback(that)
    //     })
    //     div.appendChild(btn)
    // }

    // if (!this.constant) {
    //     var tbtn = document.createElement('button')
    //     tbtn.type = 'button'
    //     tbtn.innerHTML = 'Transact'
    //     var that = this
    //     tbtn.addEventListener('click', function() {
    //         transactCallback(that)
    //     })
    //     div.appendChild(tbtn)
    // }

    if (this.inputs.length > 0)
        div.appendChild(fsi)
    if (this.outputs.length > 0)
        div.appendChild(fso)

    return div
}
