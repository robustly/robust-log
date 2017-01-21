ISTANBUL=node_modules/.bin/istanbul
TEST_FILES=$(shell find . -name "*.test.js" -not -path "./node_modules/*")
MOCHA_ARGS=--bail -u bdd -r test/config.js --timeout 30000
MOCHA=node ./node_modules/mocha/bin/mocha ${MOCHA_ARGS}

test:
	${MOCHA} ${UNIT_TEST_FILES} ${ARGS}

.PHONY: test
