

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
