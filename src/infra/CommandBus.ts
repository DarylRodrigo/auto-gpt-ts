import { DockerManager } from "../utils/DockerManager";
import { CommandResult, Commands } from "./Commands";

export class CommandBus {
  private commands: any = {}

  constructor() {}

  registerCommand(name: string, command: (args: string[]) => Promise<CommandResult>) {
    this.commands[name] = command;
  }

  async execute(commandName: string, args: string[]) {
    const cmd = this.commands[commandName];
    const commandResult = await cmd(args) as CommandResult;
    return commandResult
  }
}
