"use strict";

var SolBool = function() {
    this.base = "bool"
    this.operators = [OperatorEnum.Eq, OperatorEnum.Neq]
}

SolBool.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
    this.value = !!value
    return null
}

SolBool.prototype.compareValueOperation = function(compareVal, operator) {
    switch (operator) {
        case OperatorEnum.Neq:
            if (compareVal !== this.value) return true
            break
        case OperatorEnum.Eq:
            if (compareVal === this.value) return true
            break
        default:
            console.log('Unknown comparison', operator)
    }
    return false
}

SolBool.prototype.DefaultRenderer = function(isEditable, htmlId) {
    var input = document.createElement('input')
    if (htmlId) input.id = htmlId
    input.className = this.base
    input.placeholder = this.base

    // if the field should be editable
    if (!!isEditable) {
        input.type = 'checkbox'
    } else {
        input.type = 'text'
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (this.value) input.value = this.value

    return input
}

var SolAddress = function() {
    this.base = "address"
    this.operators = [OperatorEnum.Eq, OperatorEnum.Neq, OperatorEnum.Contain]
}

SolAddress.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
        // ensure address is prefixed "0x"
    if (value.substring(0, 2) !== "0x")
        value = "0x" + value

    // address is 20 bytes = 40 characters + 2 prefix
    if (value.length != 42)
        return new Error('Address not 40 characters. Got ' + (value.length - 2).toString())

    this.value = value
    return null
}

SolAddress.prototype.compareValueOperation = function(compareVal, operator) {
    switch (operator) {
        case OperatorEnum.Neq:
            if (compareVal !== this.value) return true
            break
        case OperatorEnum.Eq:
            if (compareVal === this.value) return true
            break
        case OperatorEnum.Contain:
            if (this.value.indexOf(value) > -1) return true
            break
        default:
            console.log('Unknown comparison', operator)
    }
    return false
}


SolAddress.prototype.DefaultRenderer = function(isEditable, htmlId) {
    var input = document.createElement('input')
    if (htmlId) input.id = htmlId
    input.type = 'text'
    input.className = ['logField', this.base].join(' ')
    input.placeholder = this.base

    // if not editable
    if (!!!isEditable) {
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (this.value) input.value = this.value

    return input
}

var SolBytes = function(size) {
    this.size = size
    this.base = "bytes"
    this.operators = [OperatorEnum.Eq, OperatorEnum.Neq, OperatorEnum.Contain]
}

SolBytes.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
    if (typeof value !== "string")
        return new Error('Value must be string')

    if (value.substring(0, 2) !== "0x")
        value = "0x" + this.value

    if (value.length % 2 != 0)
        return new Error('Not even number of bytes')

    this.value = value
    return null
}

SolBytes.prototype.compareValueOperation = function(compareVal, operator) {
    switch (operator) {
        case OperatorEnum.Neq:
            if (compareVal !== this.value) return true
            break
        case OperatorEnum.Eq:
            if (compareVal === this.value) return true
            break
        case OperatorEnum.Contain:
            if (this.value.indexOf(value) > -1) return true
            break
        default:
            console.log('Unknown comparison', operator)
    }
    return false
}


SolBytes.prototype.DefaultRenderer = function(isEditable, htmlId) {
    var input = document.createElement('textarea')
    if (htmlId) input.id = htmlId
    input.rows = 4
    input.cols = 40
    input.className = [this.base, this.base + this.size].join(' ')
    input.placeholder = this.base + this.size

    // if not editable
    if (!!!isEditable) {
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (this.value) input.innerHTML = this.value

    return input
}

var SolString = function(size) {
    this.size = size
    this.base = "string"
    this.operators = [OperatorEnum.Eq, OperatorEnum.Neq, OperatorEnum.Contain]
}

SolString.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
    if (typeof value !== "string")
        return new Error('Must be string')

    this.value = value
    return null
}


SolString.prototype.compareValueOperation = function(compareVal, operator) {
    switch (operator) {
        case OperatorEnum.Neq:
            if (compareVal !== this.value) return true
            break
        case OperatorEnum.Eq:
            if (compareVal === this.value) return true
            break
        case OperatorEnum.Contain:
            if (this.value.indexOf(value) > -1) return true
            break
        default:
            console.log('Unknown comparison', operator)
    }
    return false
}


SolString.prototype.DefaultRenderer = function(isEditable, htmlId) {
    var input = document.createElement('textarea')
    if (htmlId) input.id = htmlId
    input.rows = 4
    input.cols = 40
    input.className = [this.base, this.base + this.size].join(' ')
    input.placeholder = this.base + this.size

    // if not editable
    if (!!!isEditable) {
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (this.value) input.innerHTML = this.value

    return input
}

var SolInt = function(size) {
    this.size = (size ? size : "256")
    this.base = "int"
    this.operators = [
        OperatorEnum.Eq,
        OperatorEnum.Neq,
        OperatorEnum.LT,
        OperatorEnum.LTEq,
        OperatorEnum.GT,
        OperatorEnum.GTEq
    ]
}

SolInt.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
    try {
        var val = web3.toBigNumber(value)
    } catch (err) {
        return err
    }

    this.value = val
    return null
}

SolInt.prototype.compareValueOperation = function(compareVal, operator) {
    // web3 gives us a BigNumber
    var result = this.value.comparedTo(compareVal)
    switch (operator) {
        case OperatorEnum.Neq:
            if (result !== 0) return true
            break
        case OperatorEnum.Eq:
            if (result === 0) return true
            break
        case OperatorEnum.LT:
            if (result === -1) return true
            break
        case OperatorEnum.LTEq:
            if (result === -1 || result === 0) return true
            break
        case OperatorEnum.GT:
            if (result === 1) return true
            break
        case OperatorEnum.GTEq:
            if (result === 1 || result === 0) return true
            break
        default:
            console.log('Unknown comparison', operator)
    }
    return false
}


SolInt.prototype.DefaultRenderer = function(isEditable, htmlId) {
    var input = document.createElement('input')
    if (htmlId) input.id = htmlId
    input.type = 'input'
    input.className = this.base
    input.placeholder = this.base
    if (this.size) {
        input.className = [input.className, this.base + this.size].join(' ')
        input.placeholder += this.size
    }

    // if not editable
    if (!!!isEditable) {
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (this.value) input.value = this.value

    return input
}

var SolUint = function(size) {
    this.size = (size ? size : "256")
    this.base = "uint"
    this.operators = [
        OperatorEnum.Eq,
        OperatorEnum.Neq,
        OperatorEnum.LT,
        OperatorEnum.LTEq,
        OperatorEnum.GT,
        OperatorEnum.GTEq
    ]
}

SolUint.prototype.setValue = function(value) {
    if (typeof value === 'undefined') return
    try {
        var val = web3.toBigNumber(value)
    } catch (err) {
        return err
    }

    this.value = val
    return null
}

SolUint.prototype.DefaultRenderer = function(isEditable, htmlId) {
    var input = document.createElement('input')
    if (htmlId) input.id = htmlId
    input.type = 'input'
    input.className = this.base
    input.placeholder = this.base
    if (this.size) {
        input.className = [input.className, this.base + this.size].join(' ')
        input.placeholder += this.size
    }
    // if not editable
    if (!!!isEditable) {
        input.className = [input.className, 'readonly'].join(' ')
        input.readOnly = true
    }

    // if there is a value, apply it
    if (this.value) input.value = this.value

    return input
}

SolUint.prototype.compareValueOperation = function(compareVal, operator) {
    // web3 gives us a BigNumber
    var result = this.value.comparedTo(compareVal)
    switch (operator) {
        case OperatorEnum.Neq:
            if (result !== 0) return true
            break
        case OperatorEnum.Eq:
            if (result === 0) return true
            break
        case OperatorEnum.LT:
            if (result === -1) return true
            break
        case OperatorEnum.LTEq:
            if (result === -1 || result === 0) return true
            break
        case OperatorEnum.GT:
            if (result === 1) return true
            break
        case OperatorEnum.GTEq:
            if (result === 1 || result === 0) return true
            break
        default:
            console.log('Unknown comparison', operator)
    }
    return false
}
