export function get_event_name(rowData) {
    return rowData.name.value
  }
  
  export function group_by_names(data, sort_function = () => {}) {
    let elementsGroupedByName = {}
    let keysSort = new Set()
    for (let el of data) {
      let name = el.data.objectName.value
      if (!elementsGroupedByName[name]) elementsGroupedByName[name] = []
      elementsGroupedByName[name].push(el)
      keysSort.add(name)
    }
    for (let key of Object.keys(elementsGroupedByName)) {
      elementsGroupedByName[key].sort(sort_function)
    }
    let result = []
    for (let key of keysSort.values()) result.push(elementsGroupedByName[key])
    return result
  }
  
  export function get_sort_function(index, data, sortDirection) {
    let sortFunc
    let param = Object.keys(data[0].data)[index]
    let type = data[0].data[param].type
  
    if (type == "number") {
      sortFunc = (a, b) => {
        let direction = sortDirection ? -1 : 1
        return (
          direction *
          (parseFloat(a.data[param].value.replace(/\s/g, "")) -
            parseFloat(b.data[param].value.replace(/\s/g, "")))
        )
      }
    } else {
      if (type == "date") {
        sortFunc = (a, b) => {
          let direction = sortDirection ? -1 : 1
          a = a.data[param].value.split(".")
          a = a[2] + "-" + a[1] + "-" + a[0]
          b = b.data[param].value.split(".")
          b = b[2] + "-" + b[1] + "-" + b[0]
          return (
            direction * (new Date(a).getTime() / 1000) -
            new Date(b).getTime() / 1000
          )
        }
      } else {
        if (sortDirection) {
          sortFunc = function(a, b) {
            if (a.data[param].value > b.data[param].value) {
              return 1
            }
            if (a.data[param].value < b.data[param].value) {
              return -1
            }
            return 0
          }
        } else {
          sortFunc = function(a, b) {
            if (a.data[param].value < b.data[param].value) {
              return 1
            }
            if (a.data[param].value > b.data[param].value) {
              return -1
            }
            return 0
          }
        }
      }
    }
    return sortFunc
  }