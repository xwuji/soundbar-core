const mergeGroupData = require('./merge.js')
const filterGroupData = require('./filter.js')
const res = {
  mergeGroup: mergeGroupData(),
  filterGroup: filterGroupData()
}
console.log(JSON.stringify(res))
