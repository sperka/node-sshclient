var SSH = require('../lib/ssh')
	, ProcResult = require('../lib/procresult')
	, should = require('should');


describe('SSH tests', function() {
	var hostname =  'testhostname';
	var debug = false;
	var _testTimeout = 3;

	describe('SSH basic commands', function() {
		var ssh;

		before(function(done) {
			ssh = new SSH({
				hostname: hostname
				, debug: debug
			});

			done();
		});

		it('Should print the parameter', function(done) {
			ssh.command('echo', 'test', function(procResult) {
				procResult.should.be.an.instanceof(ProcResult, 'ProcResult');
				procResult.stderr.should.be.empty;

				var out = procResult.stdout.replace('\n', '');
				out.should.equal('test');
				procResult.exitCode.should.equal(0);

				done();
			});
		});

		it('Should print error message', function(done) {
			ssh.command('asdasdasdasd', 'asdasdasdasd', function(procResult) {
				procResult.should.be.an.instanceof(ProcResult, 'ProcResult');
				procResult.stderr.should.not.be.empty;
				procResult.stderr.indexOf('not found').should.not.equal(-1);
				procResult.stdout.should.be.empty;
				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(127);

				done();
			});
		});
	});

	describe('SSH hostname/connect test', function() {
		it('Should fail to initialize without a hostname parameter', function(done) {
			(function() {
				var ssh = new SSH({});
			}).should.throw('Hostname required!');

			done();
		});

		it('Should fail to connect to dummy host', function(done) {
			var ssh = new SSH({
				hostname: 'dummy' // test success if not having a 'dummy' entry in your hosts file
				, debug: debug
				, option: {
					ConnectTimeout: _testTimeout
				}
			});
			ssh.command('echo', 'test', function(procResult) {
				procResult.stdout.should.be.empty;
				procResult.stderr.should.not.be.empty;

				// either "Operation timed out" or "Could not resolve hostname" or "Connection refused"
				var opTimeOutIdx = procResult.stderr.indexOf('Operation timed out');
				var connRefusedIdx = procResult.stderr.indexOf('Connection refused');
				var couldntResolveIdx = procResult.stderr.indexOf('Could not resolve hostname');
				(opTimeOutIdx * connRefusedIdx * couldntResolveIdx).should.not.be.equal(-1);

				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(255);

				done();
			});
		});

		it('Should fail to connect to dummy port', function(done) {
			var ssh = new SSH({
				hostname: hostname
				, port: 12345 // test success if not using port 12345 for ssh by default
				, debug: debug
				, option: {
					ConnectTimeout: _testTimeout
				}
			});
			ssh.command('echo', 'test', function(procResult) {
				procResult.stdout.should.be.empty;
				procResult.stderr.should.not.be.empty;

				// either "Operation timed out" or "Connection refused"
				var opTimeOutIdx = procResult.stderr.indexOf('Operation timed out');
				var connRefusedIdx = procResult.stderr.indexOf('Connection refused');
				(opTimeOutIdx + connRefusedIdx).should.not.be.equal(-2);

				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(255);

				done();
			});
		});

		it('Should use option parameter - and timeout for dummy hostname', function(done) {
			var ssh = new SSH({
				hostname: 'dummy'
				, option: {
					ConnectTimeout: 1
				}
				, debug: debug
			});

			ssh.command('echo', 'test', function(procResult) {
				procResult.stdout.should.be.empty;
				procResult.stderr.should.not.be.empty;

				var opTimeOutIdx = procResult.stderr.indexOf('Operation timed out');
				opTimeOutIdx.should.not.be.equal(-1);
				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(255);

				done();
			});
		});
	});

	describe('Listener \'stress\' test', function() {
		var ssh;

		before(function() {
			ssh = new SSH({
				hostname: hostname
				, debug: debug
			});
		});

		it('Should start multiple long-running commands', function(done) {

			function startLong() {
				//console.log('Starting long-running command...');
				ssh.command('sleep 4 && echo done', function(procResult) {
					//console.log('Long-running command with pid ' + procResult.pid + ' finished');
					procResult.stderr.should.be.empty;
					var out = procResult.stdout.replace('\n', '');
					out.should.equal('done');
					procResult.exitCode.should.equal(0);

					lazyDone();
				});
			};

			var n = 0;
			function lazyDone() {
				n++;
				if(n === 5) {
					done();
				}
			};

			startLong();
			startLong();
			startLong();
			startLong();
			startLong();
		});
	});

});