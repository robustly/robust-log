/**
* Logger implementation.
*/

/*
 * log format version. This becomes the 'v' field on all log records.
 * This will be incremented if there is any backward incompatible change to
 * the log record format. Details will be in 'CHANGES.md' (the change log).
 */
var LOG_VERSION = 0;

var TRACE = 10;
var DEBUG = 20;
var INFO = 30;
var WARN = 40;
var ERROR = 50;
var FATAL = 60;

try {
    var sourceMapSupport = require('source-map-support' + '');
} catch (_) {
    sourceMapSupport = null;
}

module.exports = function(config) {
  var m = {},
    _ringBuffer = require('fixedqueue').FixedQueue(config.ringBufferSize)

  m.post = function(level,eventLabel,details,opts) {
    details = details || {}

    var rec = mkRecord(m,{
      level: level,
      message: eventLabel,
      details: details instanceof Error ? undefined : details,
      err: details instanceof Error ? details : (details && details.err)
    })

    if (level >= WARN && config.debug) {
      rec.src = getCaller3Info()
    }

    console.log(rec)

    return p.resolve()
  }

  /**
   * Build a record object suitable for emitting from the arguments
   * provided to the a log emitter.
   */
  function mkRecord(log, rec) {
    rec.time = new Date()
    return rec
  }

  /**
   * Gather some caller info 3 stack levels up.
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
    Error.stackTraceLimit = 3;

    Error.prepareStackTrace = function (_, stack) {
        var caller = stack[2];
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
    // call prepareStackTrace
    this.stack

    Error.stackTraceLimit = saveLimit;
    Error.prepareStackTrace = savePrepare;
    return obj;
  }

  return m
}
