TESTS = test/*.js
REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
        --ui bdd \
        --reporter $(REPORTER) \
        --timeout 10000 \
		$(TESTS)

.PHONY: test