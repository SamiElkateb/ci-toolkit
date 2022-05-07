const defaultConfig = {
	commands: {
		prompt: {
			question: 'required',
			store: 'required',
		},
		getCurrentBranchName: {
			store: 'required',
		},
		getCurrentProjectName: {
			store: 'required',
		},
		getLastTag: {
			project: 'required',
			store: 'required',
			protocole: 'optional',
			domain: 'optional',
		},
	},
};

export { defaultConfig };
