import YAML = require('yaml');
import { z } from 'zod';

const parserResultSchema = z.union([z.object({}).passthrough(), z.array(z.unknown())]);
const JSONParse = (string:string) => (parserResultSchema.parse(JSON.parse(string) as unknown));
const YAMLParse = (string:string) => (parserResultSchema.parse(YAML.parse(string) as unknown));

export { YAMLParse, JSONParse };
