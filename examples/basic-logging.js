var log = require('../lib')()

log('starting process 1.')

log('initiating feeds')

log.warn('detected anomoly.')

try {
  test.this.throws
} catch (err) {
  log(err)
}

log.error('Error occurred during process 1.')
