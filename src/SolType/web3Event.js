"use strict";

var Web3Event = function(abiItem) {
    this.loadedLogs = []
    this.ev = new EvmEvent(abiItem)
    this.name = this.ev.name
    this.abi = this.ev.abi
}

Web3Event.prototype.StopWatching = function() {
    if (this.filter) {
        this.filter.stopWatching()
    }
}


Web3Event.prototype.Watch = function(userOptions, filterFields, cb) {
    var params = []

    // set transaction options with defaults
    var filterOptions = {
        address: (userOptions.address ? userOptions.address : ''),
        fromBlock: (userOptions.fromBlock ? userOptions.fromBlock : 'latest'),
        toBlock: (userOptions.toBlock ? userOptions.toBlock : 'latest')
    }
    params.push(filterOptions);

    // add empty filterfields if none provided
    if (!filterFields)
        params.push({})
    else
        params.push(filterFields)


    // get instance of contract
    var contract = this.contract.at(filterOptions.address)
    var func = contract[this.ev.name]
    this.filter = func.apply(func, params)

    // if filter was created successfully
    if (this.filter) {
        var abi = this.abi
        this.filter.watch(function(err, result) {
            var ev = new EvmEvent(abi)

            if (err) {
                ev.error = err
            } else {
                ev.result = result

                // if we have results
                if (result && "args" in result && result.args.length > 0)

                // event fields are represented as inputs
                // loop through event inputs
                    for (var i = 0; i < ev.inputs.length; i++) {
                    var field = ev.inputs[i]

                    // if the field appears in the results, set its value
                    // assumes that results is keyed on the name of the field
                    if (field.name in result.args)
                        field.setValue(result.args[field.name])
                }
            }

            // if a callback was given, send the resulting EvmEvent to it
            if (typeof cb === "function") cb(ev)
        })
    } else {
        throw "Could not create filter"
    }
}

Web3Event.prototype.FetchLogs = function(userOptions, filterFields, cb) {
    var params = []

    // set filter fields first
    // TODO need to only push those that are indexes as topics?
    if (!filterFields)
        params.push({})
    else
        params.push(filterFields)

    // set transaction options with defaults
    var filterOptions = {
        address: (userOptions.address ? userOptions.address : ''),
        fromBlock: (userOptions.fromBlock ? userOptions.fromBlock : 'earliest'),
        toBlock: (userOptions.toBlock ? userOptions.toBlock : 'latest')
    }
    params.push(filterOptions);

    // get instance of contract
    var contract = this.contract.at(filterOptions.address)
    var func = contract[this.name]
    this.filter = func.apply(func, params)

    if (this.filter) {
        this.loadedLogs.length = 0

        // instead of modifying & returning a copy of this for each event
        // manufacture & callback new evmevent. return loaded logs
        var that = this
        this.filter.get(function(err, results) {
            for (var r = 0; r < results.length; r++) {
                var result = results[r]
                var ev = new EvmEvent(that.abi)
                if (err) ev.error = err

                // if we have results
                if (result && "args" in result) {
                    ev.result = result

                    // event fields are represented as inputs
                    // loop through event inputs
                    for (var i = 0; i < ev.inputs.length; i++) {
                        var field = ev.inputs[i]

                        // if the field appears in the results, set its value
                        // assumes that results is keyed on the name of the field
                        if (field.name in result.args)
                            field.setValue(result.args[field.name])
                    }
                }
                // add to loaded logs for this event
                that.loadedLogs.push(ev)
            }
            // if a callback was given, send the resulting EvmEvent to it
            if (typeof cb === "function") cb(that.loadedLogs)
        })
    }
}

Web3Event.prototype.GetLogsFiltered = function(filterFields, callback) {
    // for returning all results syncronyously
    var matches = []
    for (var k in this.loadedLogs) {
        // get EvmEvent from loaded logs
        var ev = this.loadedLogs[k]

        // innocent until proven guilty
        var valid = true
            // check each input
        for (var i = 0; i < ev.inputs.length; i++) {
            // get the field
            var field = ev.inputs[i]

            // if the field exists in the filter fields
            if (field.name in filterFields) {
                // get the filter
                var filter = filterFields[field.name]

                // compare the field to the filter value with given operator
                if (!field.compareValueOperation(filter.value, filter.operator)) {
                    // if doesn't match, flag as invalid and stop looping
                    valid = false
                    break
                }
            }
        }

        if (valid) {

            // if a callback was given, send it the matching log
            if (typeof callback === "function") callback(ev)

            // add to results for return
            matches.push(ev)
        }
    }

    // syncronyous return
    return matches
}


Web3Event.prototype.getFieldFilterValues = function() {
    var filterFields = {}
    var evmEvent = this.ev
    evmEvent.inputs.forEach(function(field) {
        var valueField = document.getElementById(field.htmlId)
        var opField = document.getElementById(field.htmlId + '-operator')
        if (valueField && valueField.value) {
            var obj = {
                name: field.name,
                value: valueField.value,
                operator: opField.value
            }
            filterFields[field.name] = obj
        }
    })
    return filterFields
}

Web3Event.prototype.getIndexedFilterValues = function() {
    var filterFields = {}
    var evmEvent = this.ev
    evmEvent.inputs.forEach(function(field) {
        if (!field.indexed) return

        var valueField = document.getElementById(field.htmlId)
        if (valueField && valueField.value) {
            filterFields[field.name] = valueField.value
        }
    })
    return filterFields
}


Web3Event.prototype.makeFieldFilter = function(userId) {
    if (!userId) userId = 'sorter'
    var evmEvent = this.ev

    // containing div element
    var div = document.createElement('div')
    div.className = ['event'].join(' ')
    div.id = 'eventTopicFilter' + evmEvent.name

    var h3 = document.createElement('h3')
    h3.innerHTML = evmEvent.name

    if (evmEvent.inputs.length > 0) {
        var fs = document.createElement('fieldset')
        fs.className = 'inputs'

        var leg = document.createElement('legend')
        leg.innerHTML = 'Event topics'
        fs.appendChild(leg)


        // append the DOM for each field to the fieldset
        for (var i = 0; i < evmEvent.inputs.length; i++) {
            var field = evmEvent.inputs[i]
            field.setHtmlId(['event', userId, this.name].join('-'))

            var wrap = document.createElement('div')
            wrap.className = 'solfield'
            wrap.appendChild(field.RenderLabel())


            // make comparison select
            var select = document.createElement('select')
            select.className = 'comparison'
            select.id = field.htmlId + '-operator'


            var group = document.createElement('optgroup')
            group.label = '(' + field.type + ')'


            var first = document.createElement('option')
            first.innerHTML = '(all)'
            first.value = '*'
            select.options.add(first)

            var ops = field.operators
            for (var k in ops) {
                var option = document.createElement('option')
                option.innerHTML = ops[k]
                option.value = ops[k]
                group.appendChild(option)
            }
            select.appendChild(group)


            // select.selectedIndex = 0
            wrap.appendChild(select)

            wrap.appendChild(field.RenderField(true))

            if (field.indexed) {
                var icon = document.createElement('span')
                icon.innerHTML = '<dfn title="Indexed topic">&#8623;</dfn>'
                icon.className = 'indexed'
                wrap.appendChild(icon)
            }

            fs.appendChild(wrap)
        }

        div.appendChild(h3)
        div.appendChild(fs)

    }

    return div


}
