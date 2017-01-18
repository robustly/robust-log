# robust-logs

Robust logs is a simple and fast logging module for browser/node.js services.

It uses [bunyan](https://github.com/trentm/node-bunyan)'s data format so it is compatible with
bunyan CLI tool ![bunyan CLI screenshot](https://raw.github.com/trentm/node-bunyan/master/tools/screenshot1.png)
But it has an improved logging API and more advanced features.

## Table of Contents

<!-- toc -->

- [Current Status](#current-status)
- [Installation](#installation)
- [Features](#features)
- [Setup](#setup)
- [API](#api)
- [Versioning](#versioning)
- [License](#license)
- [See Also](#see-also)

<!-- tocstop -->

## Current Status

Robust logs is not ready for production use.  It is still experimental.

## Installation

`npm i robust-logs`

## Features

- Elegant logging API.  Example: log('message', details)
- Extensible via stream plugins
- Ringbuffer support for additional details when exceptions occur.
- Supports multiple runtime environments: browser, node.js
- Tracks success rates and performance history. (via goal tracking.)
- Supports multiple report formats (tabular, JSON, etc...)
- Optional global application event log and dispatcher (register event handlers, trigger events)

## Setup

.env
---
   LOG_LEVEL="INFO"
   LOG_FILTERS="APP"
   NODE_APP="Test App"
   NODE_ENV="test"


main.js
---
    process.env["LOG_LEVEL"] = "INFO"  // DEFAULT
    process.env["LOG_FILTERS"] = "APP"  // DEFAULT.  "ALL" | "MODULE_NAME"
    process.env["NODE_APP"] = "app_name"
    process.env["NODE_ENV"] = "env"

    // logging from the main executable
    var log = require('robust-log')()

    // logging from a module:
    var log = require('robust-log')("Module_Name") // "Module_Name can be filtered via LOG_FILTERS"


## API

### Log an event

* Each log
log(eventLabelStr, [detailsObj]) // Defaults to INFO_LEVEL

log.info(eventLabelStr, [detailsObj])
log.error(errorLabelStr, errObj)  // only used when there is an unrecovered error.
log.warn(eventLabelStr, [detailsObj])
log.trace(eventLabelStr, [detailsObj])
log.fatal(eventLabelStr, [detailsObj])  // reserved for only the most grievious of circumstances

Returns: Promise

### Goal tracking

#### Create a goal

log.goal(goalLabelStr, contextObj, opts)

  - logs that the goal has begun
  - creates a new log instance whose context is set to the goal.
  - creates a new goal with a unique id and start timestamp

goal.fail - function<Promise>
goal.pass - function<Promise>

Example
---
    var goal = log.goal(goalLabel, contextObj, opts)
    work().then(goal.pass).catch(goal.fail)

### Event Handling

Events are visible globally to an application.  Any event logged in one module is available to be listened for in another module.  

log.removeEventHandler(registrationObj)
  - removes a single event handler

log.removeEventHandler(eventLabelStr)
  - removes all event handlers for event.

#### Example

    var log = require('robust-log')()
    function sayHi(eventLabelStr, details) { console.log('Hello Passenger!') }
    var registrationObj = log.addEventHandler("passenger arrived.", sayHi, "taxi") // replace taxi with *
    require('robust-log')('taxi')('passenger arrived.')
    log.removeEventHandler(registrationObj)
