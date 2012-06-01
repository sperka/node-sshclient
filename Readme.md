_sshclient_ is a lightweight ssh/scp library for [node](http://nodejs.org).

_sshclient_ doesn't support interactivity, so you need to set up your remote server to allow login without a password
(google: 'ssh login without a password').

## Example

	var ssh = new SSH({
		hostname: 'server'
		, user: 'user'
		, port: 22
	});

	ssh.command('echo', 'test', function(procResult) {
		console.log(procResult.stdout);
	});

For more examples, see the tests.

## Installation

	$ npm install sshclient

_Note_: not yet submitted to the _npm_ repository!

## Running tests

To run the tests, simply run this command:

	$ make test

_Note_: set the `hostname` variable to your server to succeed with the tests.