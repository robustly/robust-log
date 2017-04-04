var log = require('..')('App_Name')

log('Hello, welcome to the logging example.')

log.trace('Low level logging that I only want to see when errors occur.',
  {data: 'some data'})

log.warn('I just detected that the internal temperature is rising!', {core: 'x7'})

log.error('An unexpected error just occurred.', new Error('Module Overheated.'))
