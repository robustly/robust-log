var log = require('../')('goal-tracking')
var p = require('bluebird')

function get(request) {
  return p.resolve()
}

function getItem(req) {
  // create a goal instance and a goal log.
  var goal = log.goal('Get Item', {req:req})

  get(req)
    .then(()=>goal.info('getting item...'))
    .then(goal.succeed)
    // if the goal fails, both the failure and the cause will be recorded in the logs.
    .catch(goal.fail)
}

getItem({id: 1})
