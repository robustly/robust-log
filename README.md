# robust-logs

Robust logs is a simple and fast logging module for browser/node.js services.

It uses [bunyan](https://github.com/trentm/node-bunyan)'s data format so it is compatible with
bunyan log viewer. ![bunyan CLI screenshot](https://raw.github.com/trentm/node-bunyan/master/tools/screenshot1.png)

It has an improved logging API and more advanced features than other loggers.

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

*Optional*

`npm i -g bunyan` -- command line log viewer

## Features

- Standard interface for logging management.  
- Extensible via stream plugins
- Ringbuffer support for additional details when exceptions occur.
- Supports multiple runtime environments: browser, node.js
- Tracks success rates and performance history. (via goal tracking.)
- Supports multiple report formats (JSON, CSV, etc...)
- Supports large scale deployments

## Usage Examples


``` javascript
  // logging from the main executable
  var log = require('robust-log')('Test App')

  log('Hello, welcome to the logging example.')

  log('I saw your future and here is what I learned:',
    {deathDate: '09/13/2019', painScore: 98, cause: 'car accident'})

  log.warn('I just detected that the internal temperature is rising!')

  // log.error('An unexpected error just occurred.', new Error('Module Overheated.'))

```

![Console Output](assets/usage-example-1.png)


### Default Configuration

    {
      ringBufferSize: 100, // set to 0 to disable buffer dumps on errors.
      app: 'app_name', // DEFAULTS TO: env.NODE_APP
      env: 'env' // DEFAULTS TO: env.NODE_ENV
    }

## Supported Environment Variables

.env
---
    LOG_LEVEL="INFO"  TODO: check this is implemented...
    LOG_FILTERS="APP" TODO: implement
    NODE_APP="Test App"
    NODE_ENV="test"

## API

### Logging an event

#### log(eventLabelStr, [detailsObj], [opts])

  - Logs an INFO_LEVEL event
  - Returns: Promise
  - INFO will always be written to stdout unless filtered out by LOG_FILTERS

##### Example

    log('something happened', {id:1})

#### log.warn(eventLabelStr, [detailsObj])
  - warnings are pretty printed in bold
  - in the future, warning events can trigger alerts

#### log.trace(eventLabelStr, [detailsObj])
  - trace events are only written to the log stream if process.env.DEBUG is truthy.
  - trace events are also written to the log stream if an error occurs.

#### log.error(errorLabelStr, errObj)  // only used when there is an unrecovered error.
  - if an error is logged, it will also flush the ringbuffer containing all logs from all modules.
  - flushes to stderr as well as stdout

#### log.fatal(eventLabelStr, [detailsObj])  // reserved for only the most grievious of circumstances
  - fatal errors are styled uniquely
  - in the future, fatal events can trigger alerts

- All event logging returns a Promise

### Create a goal

Goal tracking is useful to track performance and success rates for end-to-end services
and internal workflows when debugging.  If you are new to logging goals, it is recommended
that you add goal tracking to your public APIs.  

#### log.goal(goalLabelStr, contextObj, opts):log

  - logs goal started event with a unique id and start timestamp
  - Returns: new instance of log with context set to the new goal

#### goal.fail([ErrorObj]) : function<Promise>

  - logs that a goal has failed and logs the error as a reason.
  - Returns: resolved Promise

#### goal.succeed([ResolvedValue]) : function<Promise>

  - logs that a goal has succeeded

##### Example

``` javascript
  function getItem(req, res) {
    // create a goal instance and a goal log.
    var goal = log.goal('Get Item', {req:req})

    get(req).
      .then(item=> {
        res.send(item)
        // note that the goal was a success
        return goal.succeed(item)
      })
      // if the goal fails, both the failure and the cause will be recorded in the logs.
      .catch(goal.fail)
  }
```
TODO: insert screenshot of the output of this goal logging.

### Event Handling

Events are visible globally to an application.  Any event logged in one module is available to be listened for in another module.  

log.removeEventHandler(registrationObj)
  - removes a single event handler

log.removeEventHandler(eventLabelStr)
  - removes all event handlers for event.

#### Example

``` javascript
    var log = require('robust-log')()

    function sayHi(eventLabelStr, details) { console.log('Hello Passenger!') }
    var registrationObj = log.addEventHandler("passenger arrived.", sayHi, "taxi") // replace taxi with *

    log = require('robust-log')('taxi')
    // trigger the event handler
    log('passenger arrived.')

    // cleanup
    log.removeEventHandler(registrationObj)
```

## FAQ

### ???

## Advanced Use Cases

### Usage with DevTool

### Report on goal performance numbers with respect to application versions

## Wishlist

- a compressed minified version that only requires the used bits of lodash.
