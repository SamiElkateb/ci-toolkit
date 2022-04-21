const axios = require('axios');
const https = require('https');
const protocole = 'https';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const getTags = async ({ domain, token, projectId }) => {
	const encodedProjectId = encodeURIComponent(projectId);
	const url = `${protocole}://${domain}/api/v4/projects/${encodedProjectId}/repository/tags?access_token=${token}`;
	console.log(url);
	const res = await axios.get(url, { httpsAgent: agent });
	return res.data;
};

const getLastTag = async ({ domain, token, projectId }) => {
	const data = await getTags({ domain, token, projectId });
	const lastTag = data[0].name;
	return lastTag;
};

const getMergeRequests = async ({ domain, token, projectId }) => {
	const encodedProjectId = encodeURIComponent(projectId);
	const url = `${protocole}://${domain}/api/v4/projects/${encodedProjectId}/merge_requests?state=opened&access_token=${token}`;
	const res = await axios.get(url, { httpsAgent: agent });
	return res.data;
};

const getMergeRequest = async ({ domain, token, projectId, sourceBranch }) => {
	const mergeRequests = await getMergeRequests({ domain, token, projectId });
	const mergeRequest = mergeRequests.find(
		(mergeRequest) => mergeRequest.source_branch === sourceBranch
	);
	return mergeRequest;
};

module.exports = { getTags, getLastTag, getMergeRequests, getMergeRequest };
