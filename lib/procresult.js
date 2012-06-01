/**
 * Represents a child_process' result after spawning and exiting.
 * @constructor
 */
function ProcResult(pid) {
	this.pid = pid;
	this.stderr = '';
	this.stdout = '';
	this.exitCode = NaN;
}

ProcResult.prototype.toString = function() {
	return JSON.stringify(this);
};

/**
 * Expose `ProcResult`.
 */
exports = module.exports = ProcResult;
