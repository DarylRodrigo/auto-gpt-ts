import { CommandResult } from "./Commands";

export class CommandBus {
  private commands: any = {}

  constructor() {}

  registerCommand(name: string, instruction: string, format: string, command: (args: string[]) => Promise<CommandResult>, correctionalPrompt?: (args: string[]) => Promise<string[]>) {
    this.commands[name] = { cmd: command, instruction, format, correctionalPrompt }
  }

  generateCommandList(enabledSkills: string[]): string[] {
    return Object.keys(this.commands)
      .filter((commandName) => enabledSkills.includes(commandName))
      .map((commandName) => {
        const { instruction, format } = this.commands[commandName]
        return `${commandName} args: ${format} - ${instruction}`
      })
  }

  async execute(commandName: string, args: string[]) {
    if (commandName === 'FINISHED') {
      console.log("👋🏼  Objective completed - Goodbye!")
      process.exit(-1);
    }

    const now = new Date()
    const { cmd, correctionalPrompt } = this.commands[commandName];
    if (correctionalPrompt)
      args = await correctionalPrompt(args);

    const commandResult = await cmd(args) as CommandResult;
    
    return { ...commandResult, executedAt: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}` }
  }
}
