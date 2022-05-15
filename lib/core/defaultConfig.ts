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
		readCurrentVersion: {
			file: 'required',
			store: 'required',
		},
		writeVersion: {
			files: 'required',
			newVersion: 'required',
		},
		incrementVersion: {
			incrementFrom: 'required',
			incrementBy: 'required',
			store: 'required',
		},
		commit: {
			message: 'optional',
			add: 'optional',
		},
		pull: {
			branch: 'optional',
		},
		push: {
			branch: 'optional',
			awaitPipeline: 'optional',
		},
	},
};

export { defaultConfig };
