import https = require('https');
const getHttpsAgent = (allowInsecure?: boolean) => {
	if (allowInsecure) {
		return new https.Agent({ rejectUnauthorized: false });
	}
	return new https.Agent();
};

export { getHttpsAgent };
