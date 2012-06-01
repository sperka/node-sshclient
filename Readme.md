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
	
	scp.upload('myfile', '.', function(procResult) {
		console.log(procResult.exitCode);
	});
	scp.download('remotefile', 'localPath/', function(procResult) {
		console.log(procResult.exitCode);
	});

For more examples, see the tests.

## Installation

	$ npm install sshclient

_Note_: not yet submitted to the _npm_ repository!

## Running tests

To run the tests, simply run:

	$ make test

_Note_: set the `hostname` variable to your server's hostname to succeed with the tests.