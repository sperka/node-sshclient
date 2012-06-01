// define export object
var SshClient = {};

SshClient.SSH = require('./lib/ssh');
SshClient.SCP = require('./lib/scp');
SshClient.ProcResult = require('./lib/procresult');

/**
 * Expose module.
 */
exports = module.exports = SshClient;