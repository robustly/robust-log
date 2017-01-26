// logging from the main executable
var log = require('../')('Test App')

log('Hello, welcome to the logging example.')

log('I saw your future and here is what I learned:',
  {deathDate: '09/13/2019', painScore: 98, cause: 'car accident'})

log.warn('I just detected that the internal temperature is rising!')

// log.error('An unexpected error just occurred.', new Error('Module Overheated.'))
