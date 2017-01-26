var log = require('../')('goal-tracking')
var p = require('bluebird')

function getItem(req) {
  // create a goal instance and a goal log.
  var goal = log.goal('Get Item', {req:req})

  get(req)
    .then(()=>goal.info('getting item...'))
    .then(goal.succeed)
    // if the goal fails, both the failure and the cause will be recorded in the logs.
    .catch(goal.fail)
}

function get(request) {
  return p.resolve()
}

getItem({id: 1})
