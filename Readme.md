_sshclient_ is a lightweight ssh/scp library for [node](http://nodejs.org).

_sshclient_ doesn't support interactivity, so you need to set up your remote server to allow login without a password
(google: 'ssh login without a password').

## Example

### ssh

	var ssh = new SSH({
		hostname: 'server'
		, user: 'user'
		, port: 22
	});

	ssh.command('echo', 'test', function(procResult) {
		console.log(procResult.stdout);
	});
	
### scp

	var scp = new SCP({
		hostname: 'server'
		, user: 'user'
	});
	
	scp.upload('myfile', 'path/to/remote/dir/', function(procResult) {
		console.log(procResult.exitCode);
	});
	scp.download('remotefile', 'path/to/local/dir/', function(procResult) {
		console.log(procResult.exitCode);
	});

For more examples, see the tests.

## Installation

	$ npm install node-sshclient

## Running tests

To run tests, simply enter:

	$ npm test

(note that in mocha.opts --timeout is set to 25seconds to test connect fail - you may want to change it depending on your test system).

_Note_: set the `hostname` variable to your server's hostname to succeed with the tests (or add `testhostname` to
`~/.ssh/config` with the proper settigs).