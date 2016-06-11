
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
