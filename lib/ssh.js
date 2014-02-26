/**
 * Module dependencies and variables.
 */
var spawn = require('child_process').spawn
	, Listener = require('./listener')
	, switchHash;

// hash to match passed options.
switchHash = {
	'bind_address'			: '-b'
	, 'cipher_spec'			: '-c'
	, 'escape_char'			: '-e'
	, 'configfile'			: '-F'
	, 'pkcs11'				: '-I'
	, 'identity_file'		: '-i'
	, 'login_name'			: '-l'
	, 'mac_spec'			: '-m'
	, 'ctl_cmd'				: '-O'
	, 'port'				: '-p'
	, 'ctl_path'			: '-S'
};

/**
 * SSH manager.
 * @param options The options to use when sending the command to the remote server.
 * @constructor
 */
function SSH(options) {
	this.options = options || {};
	console.assert(this.options.hostname, "Hostname required!");

	this.debug = !!options.debug;
	this.listener = new Listener({
		debug: options.debug
	});
}

/**
 * Runs `ssh` command on local machine with the provided parameters. Returns the spawned process without handling any output.
 * @param command The command to run on the remote host.
 * @param params The parameters of the command.
 * @return ChildProcess instance.
 */
SSH.prototype.sshProc = function(command, params) {
	var proc, sshParams = []
		, switchKey, optionKey
		, options = this.options;

	// add optional parameters if set in options
	for(switchKey in switchHash) {
		if(switchHash.hasOwnProperty(switchKey)) {
			if(options[switchKey]) {
				sshParams.push(switchHash[switchKey]);
				sshParams.push(options[switchKey]);
			}
		}
	}

	if(options.option) {
		for(optionKey in options.option) {
			if(options.option.hasOwnProperty(optionKey)) {
				sshParams.push('-o');
				sshParams.push(optionKey + '=' + options.option[optionKey]);
			}
		}
	}

	// [user@]hostname
	if(options.user && options.hostname) {
		sshParams.push(options.user + '@' + options.hostname);
	}
	else {
		sshParams.push(options.hostname);
	}

	// add the command and its parameters
	sshParams.push(command);
	sshParams = sshParams.concat(params);

	if(this.debug) {
		console.log('ssh ' + sshParams.join(' '));
	}

	proc = spawn('ssh', sshParams);
	return proc;
};

/**
 * Runs `ssh` command and returns the result through the callback.
 * @param command The command to run on the remote host.
 * @param params The parameters of the command.
 * @param callback The function that will be called after running the command on the remote host. Signature: fn(procResult).
 */
SSH.prototype.command = function(command, params, callback) {
	var proc;

	// if params not provided, just a callback as a second parameter
	if(callback === undefined && (typeof params === 'function')) {
		callback = params;
		params = [];
	}

	proc = this.sshProc(command, params);
	this.listener.listenProc(proc, callback);
};

exports = module.exports = SSH;