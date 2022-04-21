const increaseTag = ({ tag, type }) => {
	let [, major, minor, patch] = tag.match(/(\d*)\.(\d*)\.(\d*)/);
	switch (type) {
		case 'patch':
			patch = +patch + 1;
			break;
		case 'minor':
			patch = 0;
			minor = +minor + 1;
		case 'major':
			patch = 0;
			minor = 0;
			major = +major + 1;
		default:
			throw 'Error while increasing tag number';
	}
	return `${major}.${minor}.${patch}`;
};

module.exports = { increaseTag };
