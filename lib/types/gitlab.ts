interface mergeRequest {
	id: number;
	iid: number;
	project_id: number;
	title: string;
	description: string;
	state: string;
	target_branch: string;
	source_branch: string;
	upvotes: number;
	downvotes: number;
	merge_status: string;
	should_remove_source_branch: string;
}
interface user {
	id: number;
	username: string;
	name: string;
	state: string;
	avatar_url: string;
	web_url: string;
}
