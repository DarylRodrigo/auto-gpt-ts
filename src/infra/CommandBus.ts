import { CommandResult } from "./Commands";

export class CommandBus {
  private commands: any = {}

  constructor() {}

  registerCommand(name: string, instruction: string, format: string, command: (args: string[]) => Promise<CommandResult>) {
    this.commands[name] = { cmd: command, instruction, format }
  }

  generateCommandList(): string[] {
    return Object.keys(this.commands).map((commandName) => {
      const { instruction, format } = this.commands[commandName]
      return `${commandName} args: ${format} - ${instruction}`
    })
  }

  async execute(commandName: string, args: string[]) {
    const { cmd } = this.commands[commandName];
    const commandResult = await cmd(args) as CommandResult;
    return commandResult
  }
}
