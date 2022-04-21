var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false,
});
const getTags = ({ domain, token, projectId }) => __awaiter(this, void 0, void 0, function* () {
    const url = `${domain}/projects/${projectId}/repository/tags?access_token=${token}`;
    const res = yield axios.get(url, { httpsAgent: agent });
    return res.data;
});
const getLastTag = ({ domain, token, projectId }) => __awaiter(this, void 0, void 0, function* () {
    const data = yield getTags({ domain, token, projectId });
    const lastTag = data[0].name;
    return lastTag;
});
const getMergeRequests = ({ domain, token, projectId }) => __awaiter(this, void 0, void 0, function* () {
    const url = `${domain}/projects/${projectId}/merge_requests?state=opened&access_token=${token}`;
    const res = yield axios.get(url, { httpsAgent: agent });
    return res.data;
});
const getMergeRequest = ({ domain, token, projectId, sourceBranch }) => __awaiter(this, void 0, void 0, function* () {
    const mergeRequests = yield getMergeRequests({ domain, token, projectId });
    const mergeRequest = mergeRequests.find((mergeRequest) => mergeRequest.source_branch === sourceBranch);
    return mergeRequest;
});
module.exports = { getTags, getLastTag, getMergeRequests, getMergeRequest };
