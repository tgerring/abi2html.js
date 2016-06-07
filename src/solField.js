"use strict";

var SolField = function(abiField, value) {
    if (typeof abiField !== "object") return
    var field = this._constructor(abiField)
    if (field) {
        this.name = abiField.name
        this.type = abiField.type
        this.indexed = ('indexed' in abiField ? abiField.indexed : false)
        this.anonymous = ('anonymous' in abiField ? abiField.anonymous : false)
        this.operators = field.operators
        if (value) field.setValue(value)
        if (field.value) this.value = field.value
        this._field = field
    }
}

SolField.prototype._constructor = function(abiField) {
    var solType = this.splitType(abiField.type)
    this.typeBase = solType.base
    this.typeSize = solType.size

    switch (solType.base) {
        case 'bool':
        case 'bool[]':
            return new SolBool()
        case 'address':
        case 'address[]':
            return new SolAddress()
        case 'string':
        case 'string[]':
            return new SolString(solType.size)
        case 'bytes':
        case 'bytes[]':
            return new SolBytes(solType.size)
        case 'int':
        case 'int[]':
            return new SolInt(solType.size)
        case 'uint':
        case 'uint[]':
            return new SolUint(solType.size)
        case 'real': // not yet implemented
        case 'real[]': // not yet implemented
        case 'ureal': // not yet implemented
        case 'ureal[]': // not yet implemented
        default:
            console.log('Unknown field type:', abiField.name, solType.base, solType.size)
    }

}

SolField.prototype.splitType = function(solidityType) {
    // Function to split something like "uint256" into discrete pieces
    var firstDigit = solidityType.match(/\d/);
    if (firstDigit === null) {
        return {
            base: solidityType,
            size: null
        }
    }
    var index = solidityType.indexOf(firstDigit);
    return {
        base: solidityType.substring(0, index),
        size: solidityType.substring(index, solidityType.length)
    }
}

SolField.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
    var err = this._field.setValue(value)
    if (err)
        throw err
    this.value = this._field.value
}

SolField.prototype.setHtmlId = function(htmlIdPrefix) {
    if (!htmlIdPrefix) return
    this.htmlId = [htmlIdPrefix.toString(), this.name].join('-')
}

SolField.prototype.DefaultRenderer = function(isEditable) {
    // initialize empty DOM element
    var div = document.createElement('div')
    div.className = 'solfield'

    div.appendChild(this.RenderLabel())
    div.appendChild(this.RenderField(isEditable))

    return div
}

SolField.prototype.RenderLabel = function() {
    var label = document.createElement('label')
    label.htmlFor = this.htmlId
    label.className = 'name'
    var name = this.name
    if (!name)
        name = '(returns)'
    label.innerHTML = name
    return label
}

SolField.prototype.RenderField = function(isEditable) {
    this._field.setValue(this.value)
    var input = this._field.DefaultRenderer(isEditable, this.htmlId)
    input.className += ' value'
    return input
}

SolField.prototype.compareValueOperation = function(compareVal, operator) {
    if (operator === '*') return true
    var result = this._field.compareValueOperation(compareVal, operator)
        // console.log(this, this.getValue().valueOf(), compareVal, operator, result)
    return result
}

