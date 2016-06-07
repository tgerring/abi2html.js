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

// EvmEvent.prototype.DefaultRenderer = function(err, results, cb) {
//     // containing div element
//     var div = document.createElement('div')
//     div.className = ['event'].join(' ')
//     div.id = 'event' + this.name

//     var h3 = document.createElement('h3')
//     h3.innerHTML = this.name
//     div.appendChild(h3)

//     if (err) {
//         var p = document.createElement('p')
//         p.innerHTML = err.toString()
//         div.appendChild(p)
//     } else {
//         var receipt = web3.eth.getTransactionReceipt(results.transactionHash)
//         var dl = document.createElement('dl')

//         var dtAddress = document.createElement('dt')
//         var ddAddress = document.createElement('dd')

//         dtAddress.innerHTML = 'Contract:'
//         ddAddress.innerHTML = results.address
//         dl.appendChild(dtAddress)
//         dl.appendChild(ddAddress)


//         var dtHash = document.createElement('dt')
//         var ddHash = document.createElement('dd')

//         dtHash.innerHTML = 'Transaction hash:'
//         dl.appendChild(dtHash)

//         ddHash.innerHTML = results.transactionHash
//         dl.appendChild(ddHash)

//         var dtGas = document.createElement('dt')
//         var ddGas = document.createElement('dd')

//         dtGas.innerHTML = 'Gas used:'
//         dl.appendChild(dtGas)

//         ddGas.innerHTML = receipt.gasUsed
//         dl.appendChild(ddGas)

//         div.appendChild(dl)
//     }
//     div.appendChild(dl)

//     if (results && this.inputs.length > 0) {
//         // if there are inputs, display them in a fieldset
//         if (this.inputs.length > 0) {
//             var fs = document.createElement('fieldset')
//             fs.className = 'inputs'

//             var leg = document.createElement('legend')
//             leg.innerHTML = 'Fields'
//             fs.appendChild(leg)


//             // append the DOM for each field to the fieldset
//             for (var i = 0; i < this.inputs.length; i++) {
//                 var field = this.inputs[i]

//                 // if we have a value for a given field, render it
//                 if (results && "args" in results && field.getName() in results.args)
//                     fs.appendChild(field.DefaultRenderer(false, results.args[field.getName()]))
//                 else
//                     fs.appendChild(field.DefaultRenderer(false))
//             }
//             div.appendChild(fs)
//         }
//     }

//     if (typeof cb === "function")
//         cb(div)

//     return div
// }
