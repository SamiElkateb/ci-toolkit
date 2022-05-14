const standby = async (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, duration);
	});
};
export { standby };
