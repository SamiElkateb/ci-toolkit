import YAML = require('yaml');

const JSONParse = (string:string) => (JSON.parse(string) as unknown);
const YAMLParse = (string:string) => (YAML.parse(string) as unknown);

export { YAMLParse, JSONParse };
