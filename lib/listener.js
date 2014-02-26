/**
 * Module dependecies
 */
var ProcResult = require('./procresult');

/**
 * Listener that can collect data from child_process' outputs. Manages multiple processes based on their pid.
 * @constructor
 */
function Listener(options) {
	this.buffers = {};
	this.options = options || {};

	this.debug = !!this.options.debug;
}

/**
 * The listener of the spawned child_process. Collects stdout and stderr data until the process ends.
 * @param proc The spawned child_process instance.
 * @param callback The function which is called after the process exists. It's called with a `ProcResult` instance as a parameter.
 */
Listener.prototype.listenProc = function(proc, callback) {
	var self = this;

	function checkBuffer(pid) {
		if(self.buffers[pid] === undefined) {
			self.buffers[pid] = new ProcResult(pid);
		}
	}

	proc.stderr.on('data', function(data) {
		if(self.debug) {
			console.log('[stderr] ' + data);
		}

		checkBuffer(proc.pid);
		self.buffers[proc.pid].stderr += new String(data);
	});

	proc.stdout.on('data', function(data) {
		if(self.debug) {
			console.log('[stdout] ' + data);
		}

		checkBuffer(proc.pid);
		self.buffers[proc.pid].stdout += new String(data);
	});

	proc.on('exit', function(code) {
		if(self.debug) {
			console.log('[exit] ' + code);
		}

		checkBuffer(proc.pid);

		var procResult = self.buffers[proc.pid];
		procResult.exitCode = code;
		delete self.buffers[proc.pid];

		callback(procResult);
	});
};

/**
 * Expose module.
 */
exports = module.exports = Listener;