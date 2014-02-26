/**
 * Module dependecies and variables.
 */
var spawn      = require('child_process').spawn
	, fs       = require('fs')
	, Listener = require('./listener')
	, switchHash;

switchHash = {
	'cipher'			: '-c'
	, 'ssh_config'		: '-F'
	, 'identity_file'	: '-i'
	, 'limit'			: '-l'
	, 'port'			: '-P'
	, 'program'			: '-S'
};

/**
 * SCP manager.
 * @param options The options to use when sending the command to the remote server.
 * @constructor
 */
function SCP(options) {
	this.options = options || {};

	console.assert(this.options.hostname, "Hostname required!");

	this.debug = !!options.debug;
	this.listener = new Listener({
		debug: options.debug
	});
}

/**
 * Run `scp` on local machine to upload files with the provided parameters.
 * Returns the spawned process without handling any events of it.
 * @param localFiles The paths of the files to upload.
 * @param remotePath The remote path to upload the files to.
 * @return The spawned child_process instance.
 */
SCP.prototype.uploadProc = function(localFiles, remotePath) {
	var scpParams = []
		, target
		, proc
		, options = this.options
		, i
		, switchKey;

	if(!(localFiles instanceof Array)) {
		localFiles = [localFiles];
	}

	for(i=localFiles.length-1; i>-1; i=i-1) {
		if(!fs.existsSync(localFiles[i])) {
			console.log('File not exists: ' + localFiles[i] + '\tignoring...');
			localFiles.splice(i, 1);
		}
	}
	if(localFiles.length === 0) {
		throw new Error('Local files don\'t exist. Quitting...');
	}

	if(options.user && options.hostname) {
		target = options.user + '@' + options.hostname + ':' + remotePath;
	}
	else {
		target = options.hostname + ':' + remotePath;
	}

	for(switchKey in switchHash) {
		if(switchHash.hasOwnProperty(switchKey)) {
			if(options[switchKey]) {
				scpParams.push(switchHash[switchKey]);
				scpParams.push(options[switchKey]);
			}
		}
	}

	scpParams = scpParams.concat(localFiles);
	scpParams.push(target);

	if(this.debug) {
		console.log('scp ' + scpParams.join(' '));
	}

	proc = spawn('scp', scpParams);

	return proc;
};

/**
 * Uploads files with `scp` command and returns the result through the callback.
 * @param localFiles The paths of the files to upload.
 * @param remotePath The remote path to upload the files to.
 * @param callback The function that will be called after uploading the files to the remote host. Signature: fn(procResult).
 */
SCP.prototype.upload = function(localFiles, remotePath, callback) {
	var proc;

	// remotePath not set
	if(callback === undefined && (typeof remotePath === 'function')) {
		callback = remotePath;
		remotePath = '.';
	}

	proc = this.uploadProc(localFiles, remotePath);
	this.listener.listenProc(proc, callback);
};

/**
 * Run `scp` on local machine to download files from remote host with the provided parameters.
 * Returns the spawned process without handling any output of it.
 * @param remoteFiles The files on the remote host to download.
 * @param localPath The local path to download the files to.
 * @return The spawned child_process instance.
 */
SCP.prototype.downloadProc = function(remoteFiles, localPath) {
	if(!(remoteFiles instanceof Array)) {
		remoteFiles = [remoteFiles];
	}

	var scpParams = [], remote, proc, switchKey, options = this.options;

	if(!fs.existsSync(localPath)) {
		//console.log('Local path not exists: ' + localPath);
		throw new Error('Local path ('+ localPath +') does not exist. Quitting...');
	}

	for(switchKey in switchHash) {
		if(switchHash.hasOwnProperty(switchKey)) {
			if(options[switchKey]) {
				scpParams.push(switchHash[switchKey]);
				scpParams.push(options[switchKey]);
			}
		}
	}

	if(options.user && options.hostname) {
		remote = options.user + '@' + options.hostname + ':';
	}
	else {
		remote = options.hostname + ':';
	}
	remote += '""'; // two double quotes hack
	remote += remoteFiles.join(' ');
	remote += '""'; // two double quotes hack

	scpParams.push(remote);
	scpParams.push(localPath);

	if(this.debug) {
		console.log('scp ' + scpParams.join(' '));
	}

	proc = spawn('scp', scpParams);

	return proc;
};

/**
 * Downloads files with `scp` command and returns the result through the callback.
 * @param remoteFiles The files on the remote host to download.
 * @param localPath The local path to download the files to.
 * @param callback The function that will be called after downloading the files to the remote host. Signature: fn(procResult).
 */
SCP.prototype.download = function(remoteFiles, localPath, callback) {
	var proc;

	if(callback === undefined && (typeof localPath === 'function')) {
		callback = localPath;
		localPath = '.';
	}

	proc = this.downloadProc(remoteFiles, localPath);
	this.listener.listenProc(proc, callback);
};

exports = module.exports = SCP;