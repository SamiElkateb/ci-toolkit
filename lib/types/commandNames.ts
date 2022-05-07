import { commandNames, command_names } from '../constants/commandNames';

type command_name = typeof command_names[number];
type commandName = typeof commandNames[number];
export { command_name, commandName };
