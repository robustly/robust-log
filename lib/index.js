/**
* The logging interface.  Changes to this file must be reviewed to determine
* if a major or minor version update is required.
*/

var TRACE = 10;
var DEBUG = 20;
var INFO = 30;
var WARN = 40;
var ERROR = 50;
var FATAL = 60;

var __levels = {
  "trace": TRACE,
  "debug": DEBUG,
  "info": INFO,
  "warn": WARN,
  "error": ERROR,
  "fatal": FATAL
}

var bunyan = require('bunyan')
var __ringbuffer

var _ = require('lodash'),
  p = require('bluebird')

// NOTE: I ran this in devtool and noticed that only ringbuffer dumps showed up in the console
// because devtool relies on console.log to be called for logging.  Can we find out more information
// on this and weather it would be a good idea to just always use console.log instead of the bunyan stdout stream.

module.exports = function(logStreamId, config, opts) {
  opts = opts || {}
  var logger

  config = _.defaults(config, {
    ringBufferSize: 100,
    app: logStreamId,
    logStreamId: logStreamId
  })
  __ringbuffer = __ringbuffer || new bunyan.RingBuffer({ limit: config.ringBufferSize })

  var _bunyanConfig = {
    streams: [
        {
            level: 'trace',
            type: 'raw',    // use 'raw' to get raw log record objects
            stream: __ringbuffer
        }
    ],
    serializers: {
      err: bunyan.stdSerializers.err
    }
  }

  function resolveEnvironmentSettings(env) {
    var filters = process.env['ROBUST_FILTER'] ? process.env['ROBUST_FILTER'].split(',') : []
    return {
      filters: _.zipObject(filters, filters),
      level: resolveLogLevel(),
      name: env.NODE_APP || ('lib:'+logStreamId),
      appIsDefined: env.NODE_APP
    }
  }

  function resolveLogLevel() {
    if (config.trace) return 'trace'
    else if (config.debug) return 'debug'
    else return 'info'
  }

  /**
   * RobustLog is a function object which if called by itself it will
   * log as INFO level. (unless it is in component mode.)
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  var m = post.bind(m, 'info')
  if (opts.goal) m.__goal = opts.goal


  function initLogger() {
    m.__settings = resolveEnvironmentSettings(process.env)

    if (logStreamId == m.__settings.name || !m.__settings.appIsDefined) {
      _bunyanConfig.streams.push({
              level: m.__settings.level,
              stream: process.stdout
          })
    } else {
      m.__settings.libmode = true
    }

    _bunyanConfig.name = m.__settings.name
    return bunyan.createLogger(_bunyanConfig)
  }

  var _log = initLogger()

  /**
   * Trace is the lowest log level.  It will always be buffered rather than
   * actually logged unless an error occurs or if the log level is set to TRACE.
   * Does not trigger events.
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  m.trace = post.bind(m, 'trace')

  /**
   * debug is a buffered log level like trace.  Events logged at the debug level will be logged
   * if in debug mode.
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  m.debug = post.bind(m, 'debug')


  /**
   * Exactly the same as RobustLog
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  m.log = m.info = m

  /**
   * warnings events indicate that a possible error situation has occurred.
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  m.warn = post.bind(m, 'warn')

  /**
   * error events should only be created if an unrecoverable error has occurred
   * that indicates a problem which needs to be fixed.
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  m.error = post.bind(m, 'error')

  /**
   * fatal log events indicate an unrecoverable error occurred that has
   * taken down the service.
   * @param {string} eventLabel - a human readable label to describe the event.
   * @param {Object} details - optional details about the event
   * @param {Object} opts - optional settings and configuration overrides
   * @returns {Promise} A promise that will return when the event has been logged.
   */
  m.fatal = post.bind(m, 'fatal')

  m.goal = function(goalLabelStr, data, opts) {
    var goal = createGoal(goalLabelStr, data, opts)
    m(goal.name+'_STARTED', goal)

    return module.exports(logStreamId,config, {goal:goal})
  }

  m.fail = function(err) {
    if (m.__goal) {
      m.__goal.err = err
      m.__goal.duration = Date.now() - m.__goal.creationTime
      m(err)
      m(m.__goal.name+'_FAILED', m.__goal)
      //m.__goal = null
      delete m
    }
    return p.resolve()
  }

  m.succeed = m.pass = function(val) {
    if (m.__goal) {
      m.__goal.duration = Date.now() - m.__goal.creationTime
      m.__goal.result = val
      m.log(m.__goal.name+'_COMPLETED', m.__goal)
      //m.__goal = null
      delete m
    }

    return p.resolve(val)
  }

  function createGoal(name, data, opts) {
    opts = opts || {}
    return {
      gid: _.uniqueId(),
      data: data,
      name: name,
      creationTime: Date.now(),
      tags: opts.tags
    }
  }

  function post(level,eventLabel,details,opts) {
    if (m.__settings.libmode) {
      level = 'trace'
    }

    var rec = {
      d: !details || details instanceof Error ? undefined : details,
    }

    // err property has special meaning to bunyan logger.
    // this code ensures it always passed as the err property.
    details = details || {}
    rec.err = details instanceof Error ? details : details.err

    if (__levels[level] >= WARN || config.debug) {
      rec.src = getCaller3Info()
    }
    //console.log('xxx',rec)
    if (__levels[level] > WARN && config.ringBufferSize) {
      console.log('== BEGIN RINGBUFFER DUMP == ')
      console.log(__ringbuffer.records)
      console.log('== END RINGBUFFER DUMP ==')
      __ringbuffer.records = []
    }

    if (m.__goal) {
      rec.goalId = m.__goal.gid
    }

    _log[level](rec, eventLabel)

    return p.resolve()
  }

  try {
      var sourceMapSupport = require('source-map-support' + '');
  } catch (_) {
      sourceMapSupport = null;
  }

  /**
 * Gather some caller info 2 stack levels up.
 * See <http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi>.
 */
function getCaller3Info() {
    if (this === undefined) {
        // Cannot access caller info in 'strict' mode.
        return;
    }
    var obj = {};
    var saveLimit = Error.stackTraceLimit;
    var savePrepare = Error.prepareStackTrace;
    Error.stackTraceLimit = 2;

    Error.prepareStackTrace = function (_, stack) {
        var caller = stack[1];
        if (sourceMapSupport) {
            caller = sourceMapSupport.wrapCallSite(caller);
        }
        obj.file = caller.getFileName();
        obj.line = caller.getLineNumber();
        var func = caller.getFunctionName();
        if (func)
            obj.func = func;
    };
    Error.captureStackTrace(this, getCaller3Info);
    this.stack;

    Error.stackTraceLimit = saveLimit;
    Error.prepareStackTrace = savePrepare;
    return obj;
}

  return m
}
