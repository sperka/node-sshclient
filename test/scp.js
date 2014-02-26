var SCP = require('../lib/scp')
	, SSH = require('../lib/ssh')
	, ProcResult = require('../lib/procresult')
	, should = require('should')
	, fs = require('fs');


describe('SCP tests', function() {
	describe('SCP test', function() {
		var ssh, scp
			, hostname = 'testhostname'
			, debug = false
			, dlDir = 'test/downloadtest/';

		before(function(done) {
			ssh = new SSH({
				hostname: hostname
				, debug: debug
			});

			scp = new SCP({
				hostname: hostname
				, debug: debug
			});

			fs.mkdirSync(dlDir);

			done();
		});

		it('Should throw error for non-existing file to upload', function(done) {
			(function() {
				scp.upload('dummyfile', function(procResult) {
					should.fail('Shouldn\'t reach this code');
				});
			}).should.throw(/Local files don't exist/);
			done();
		});

		it('Should upload file to server', function(done) {
			scp.upload('test/scp.js', function(procResult) {
				procResult.exitCode.should.be.equal(0);
				done();
			});
		});

		it('Should check it was uploaded', function(done) {
			ssh.command('stat', 'scp.js', function(procResult) {
				procResult.exitCode.should.equal(0);
				procResult.stderr.should.be.empty;
				procResult.stdout.indexOf('No such file or directory').should.equal(-1);
				done();
			});
		});

		it('Should download previously uploaded file', function(done) {
			scp.download('scp.js', dlDir, function(procResult) {
				procResult.exitCode.should.equal(0);
				procResult.stderr.should.be.empty;
				done();
			});
		});

		it('Should throw error for non-existing localPath while downloading', function(done) {
			(function() {
				scp.download('scp.js', 'test/dummydir/', function(procResult) {
					should.fail('Shouldn\'t reach this code');
				});
			}).should.throw(/Local path \(test\/dummydir\/\) does not exist/);
			done();
		});

		it('Should match filesizes', function(done) {
			fs.stat(dlDir + 'scp.js', function(dlErr, dlStat) {
				should.not.exist(dlErr);

				fs.stat('test/scp.js', function(origErr, origStat) {
					should.not.exist(origErr);

					dlStat.size.should.equal(origStat.size);
					done();
				});
			});
		});

		after(function(done) {
			fs.unlinkSync('test/downloadtest/scp.js');
			fs.rmdirSync('test/downloadtest');
			done();
		});
	});
});