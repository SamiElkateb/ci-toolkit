const { increaseTag } = require('./utils');

const {
	getTags,
	getLastTag,
	getMergeRequests,
	getMergeRequest,
} = require('./gitlab');

const {
	getCurrentBranchName,
	getCurrentProjectName,
	getOriginDomain,
} = require('./git');

module.exports = {
	increaseTag,
	getTags,
	getLastTag,
	getMergeRequests,
	getMergeRequest,
	getCurrentBranchName,
	getCurrentProjectName,
	getOriginDomain,
};
