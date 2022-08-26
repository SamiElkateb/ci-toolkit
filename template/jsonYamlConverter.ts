
const YAML = require('yaml');
const { readFileSync, writeFileSync } = require('fs');

const configPaths = ['ci-toolkit', 'commands/apply_env_diff', 'commands/create_merge_request', 'commands/increment_version_from_tag', 'commands/merge_merge_request', 'commands/start_pipeline'];

configPaths.forEach(async (config)=> {

const yaml = readFileSync('./template/yaml/' + config + '.yml').toString();
const parsed = YAML.parse(yaml);
const json = JSON.stringify(parsed, null, '\t');

writeFileSync('./template/json/' + config + '.json', json);
})

