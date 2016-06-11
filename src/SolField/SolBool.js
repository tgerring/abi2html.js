
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
