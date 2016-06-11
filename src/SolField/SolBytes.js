
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
