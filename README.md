# robust-logs

[![Run Status](https://api.shippable.com/projects/588995b5f35d500f0014a472/badge?branch=master)](https://app.shippable.com/projects/588995b5f35d500f0014a472)
[![Coverage Badge](https://api.shippable.com/projects/588995b5f35d500f0014a472/coverageBadge?branch=master)](https://app.shippable.com/projects/588995b5f35d500f0014a472)

Robust-logs is a full-featured fast logging module for browser and node apps.

It uses [bunyan](https://github.com/trentm/node-bunyan)'s data format so it is compatible with
bunyan log viewer. ![bunyan CLI screenshot](https://raw.github.com/trentm/node-bunyan/master/tools/screenshot1.png)

Robust-logs use a standard logging API and more advanced features than other loggers.

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

    LOG_LEVEL="INFO"  TODO: check this is implemented...
    LOG_FILTERS="APP"
    NODE_APP="Test App"
    NODE_ENV="test"


main.js
---
    // load environment variables
    // Ex. via dotenv
    require('dotenv').load();

    // logging from the main executable
    var log = require('robust-log')()

    // logging from a module:
    var log = require('robust-log')("Module_Name")

### Default Config

    {
      ringBufferSize: 100,
      component: 'Module_Name',
      app: 'app_name', // DEFAULTS TO: env.NODE_APP
      env: 'env' // DEFAULTS TO: env.NODE_ENV
    }

## Usage

**If you are writing a component, be sure to set config.component = "component_name".  This tells
the logging system that this is a dependency component which should only be logged to error dumps.**

    log = require('robust-log')('component_name')
    // OR
    log = require('robust-log')({component: 'component_name'})

## API

### Logging an event

#### log(eventLabelStr, [detailsObj], [opts])

  - Logs an event as level: INFO
  - Returns: Promise
  - INFO will always be written to stdout unless filtered out by LOG_FILTERS

##### Example

    log('something happened', {id:1})

#### log.info(eventLabelStr, [detailsObj])

  - Logs an event as level: INFO
  - Returns: Promise

##### Example

      log.info('something happened', {id:1})

// TODO: finish these sections...

log.warn(eventLabelStr, [detailsObj])
  - warnings are pretty printed in bold
  - in the future, warning events can trigger alerts

log.trace(eventLabelStr, [detailsObj])
  - trace events are only written to the log stream if process.env.DEBUG is truthy.
  - trace events are also written to the log stream if an error occurs.

log.error(errorLabelStr, errObj)  // only used when there is an unrecovered error.
  - if an error is logged, it will also flush the ringbuffer containing all logs from all modules.
  - flushes to stderr as well as stdout


log.fatal(eventLabelStr, [detailsObj])  // reserved for only the most grievious of circumstances
  - fatal errors are styled uniquely
  - in the future, fatal events can trigger alerts

- All event logging returns a Promise

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

    log = require('robust-log')('taxi')
    // trigger the event handler
    log('passenger arrived.')

    // cleanup
    log.removeEventHandler(registrationObj)
