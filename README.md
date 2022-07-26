# CI-TOOLKIT

## Overview

ci-toolkit is a highly configurable tool to automate your deployment workflow directly from your terminal.

You can use it to create your own workflow by combining different base commands in a yaml format.

You can start your workflow by running

```
npx ci-toolkit workflow_name
```

Currently, ci-toolkit only works with gitlab.

## Quick start guide

Initialize your folder with

```
npx ci-toolkit init
```

This will create a `.ci-toolkit` folder and `ci-toolkit.yaml` file containing the default configuration in your current folder.

It will also add `.ci-toolkit/.secrets` in your `.gitignore` file.

To start using ci-toolkit, add your gitlab token in `.ci-toolkit/.secrets` and configure the domain in `ci-toolkit.yaml`

You can then start trying the different commands with
`npx ci-toolkit ` followed by the command name.

Example:

```
npx ci-toolkit increment_version
```

## Variables

The values supplied in the configuration can either be hardcoded or variables.

Variable values can be retrieved using the prompt command or the get, read or fetch commands.

Variables will be stored in the key supplied

Variables must be written with a leading `$_` (ex: `$_variableName`)

## Example

Example of a workflow for incrementing the packages version before merging and tagging.

```
- prompt:
    question: How to increment the version? (major|minor|patch)
    store: $_increment
- get_current_branch_name:
    store: $_currentBranch
- get_current_project_name:
    store: $_currentProject
- fetch_last_tag:
    project: $_currentProject
    store: $_currentVersion
- increment_version:
    increment_from: $_currentVersion
    increment_by: $_increment
    store: $_newVersion
- write_version:
    files: ["./package.json", "./package-lock.json"]
    new_version: $_newVersion
- commit:
    add: all
    message: "chore: increment version"
- push:
    await_pipeline: true
- merge_merge_request:
    project: $_currentProject
    source_branch: $_currentBranch
    target_branch: develop
    await_pipeline: true
    min_upvotes: 2
    max_downvotes: 0
    delete_source_branch: true
    squash_commits: false
- create_tag:
    project: $_project
    target_branch: develop
    tag_name: $_newVersion
    await_pipeline: true
```

## Base Commands:

-   prompt
-   get_current_branch_name
-   get_current_project_name
-   fetch_last_tag
-   increment_version
-   write_version
-   commit
-   push
-   create_tag
-   get_diffs
-   prompt_diffs
-   apply_diffs
-   create_merge_request
-   merge_merge_request

### prompt

Prompt for a value that can be used later

**Values:**

mandatory:
```
question: string
store: variable
```
Example:
```
- prompt:
    question: How to increment the version? (major|minor|patch)
    store: $_increment
```

### get_current_branch_name

Retrieves the name of the active branch

**Values:**

mandatory:
```
store: variable
```
Example:
```
- get_current_branch_name:
    store: $_currentBranch
```

### get_current_project_name

Retrieves the name of the current project from the url of the remote

**Values:**

mandatory:
```
store: variable
```
Example:
```
- get_current_project_name:
    store: $_currentProject
```

### fetch_last_tag

Retrieves the last tag from gitlab

**Values:**

mandatory:
```
project: string|variable
store: variable
```
Example:
```
fetch_last_tag:
    project: $_currentProject
    store: $_currentVersion
```

### increment_version

Increments the supplied version.

The version supplied must be written as MAJOR.MINOR.PATCH

The increment_by value can be major, minor or patch.

**Values:**

mandatory:
```
increment_from: string|variable
increment_by: major|minor|patch|variable
store: variable
```
Example
```
- increment_version:
    increment_from: $_currentVersion
    increment_by: $_increment
    store: $_currentVersion
```

### write_version

Replaces the package version with the new version

**Values:**

mandatory:
```
files: string[] 
new_version: string|variable
```
Example:
```
- write_version:
    files: ["./package.json", "./package-lock.json"]
    new_version: $_newVersion
```

### commit

Creates a new commit

**Values:**

mandatory:

```
message: string|variable 
```

optional:

```
add: all|tracked
```

Example:

```
- commit:
    add: all
    message: 'auto: ci-toolkit commit'
```

### push


Pushes the branch from the project directory to the remote (active branch by default)

**Values:**

optional:

```
branch: string or variable 
await_pipeline: boolean
```

Example:

```
push:
    branch: $_currentBranch
    await_pipeline: true
```
### create_tag

### get_diffs

### prompt_diffs

### apply_diffs

### create_merge_request

### merge_merge_request
