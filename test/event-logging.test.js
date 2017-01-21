var ModuleUnderTest = require('../lib')

var intercept = require("intercept-stdout"),
    captured = "";

describe('robust-logs', function() {
  var log
  var unhook_intercept = intercept(function(txt) {
      captured += txt;
  });

  beforeEach(function() {
    log = ModuleUnderTest()
    captured = ""
  })

  describe('Console Logging', function() {
    describe('debug level', function() {
      it('buffers if config.debug==false', ()=>
        log.debug('should not be logged')
          //.tap(()=>console.log('xxx',captured))
          .then(()=>expect(captured).not.to.contain('should not be logged')))

      it('logs if in debug mode.', ()=> {
        log = ModuleUnderTest({debug:true})
        return log.debug('I should be in the logs')
                .then(()=>expect(captured).to.contain('I should be in the logs'))})

    })
    describe('info level', function() {
      it('outputs correctly', function() {
        log.info('something happened')
        expect(captured).to.contain('something happened')
      })
    })
    describe('log()', function() {
      it('outputs correctly', function() {
        log('something happened')
        expect(captured).to.contain('something happened')
      })
    })
    describe('fatal level', () => {
      it('outputs correctly', () =>
        log.warn('something happened')
          .tap(()=>log.info('fuckers'))
          .then(()=>expect(captured).to.contain('something happened'))
      )
    })

    describe('warn level', function() {
      it('outputs correctly', function() {
        log.warn('something happened')
        expect(captured).to.contain('something happened')
      })
    })

    describe('error level', function() {
      it('outputs correctly', function() {
        log.error('something happened')
        expect(captured).to.contain('something happened')
      })
      it('outputs error objects correctly with stack trace.', function() {
        log.error('Error happened', new Error('something bad happened'))
        expect(captured).to.contain('Error: something bad happened')
        // check stack trace is present as well:
        expect(captured).to.contain('at Context.<anonymous>')
      })
      it('prints parameters along with err.', () => log.error('Error happened', {
                param: 'some param',
                err: new Error('something bad happened')
              }).then(()=>expect(captured).to.contain('"param":"some param"'))
            )

      it('outputs detail objects correctly with stack trace.', function() {
        log.error('Error happened', {
          param: 'some param',
          err: new Error('something bad happened')
        })
        expect(captured).to.contain('Error: something bad happened')
        // check stack trace is present as well:
        expect(captured).to.contain('at Context.<anonymous>')
      })
    })
  })

  describe('handle circular object logging', function() {
    it('does not throw exception when logging circular object', function() {
      var circle = {
        name: 'awesome'
      }
      circle.brother = circle

      expect(function() { log('Circle', circle) }).to.not.throw()
    })
  })


})
