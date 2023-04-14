import { Commands } from '../Commands';
import { Record, String, Static, Null, Array } from 'runtypes';
import { promisify } from 'util';
import { exec } from 'child_process';

const ExecuteBashCommandFormat = Record({
  args: Array(String).Or(Null),
});
type ExecuteBashCommandFormat = Static<typeof ExecuteBashCommandFormat>;

export class GenerateBashCommand extends Commands {
  private exec = promisify(exec);
  private requiresArgument = false;

  constructor(
    name: string,
    machineDescription: string,
    private bashCommand: string,
    format: string,
  ) {
    super(name, machineDescription, format);
    this.requiresArgument = bashCommand.includes('<arg>');
  }

  async execute(params: ExecuteBashCommandFormat) {
    const { args } = ExecuteBashCommandFormat.check(params);
    if (this.requiresArgument && !args) throw new Error('Argument is required');

    try {
      let commandToExecute = this.bashCommand;
      if (this.requiresArgument) commandToExecute = this.replaceArgs(commandToExecute, args);

      console.log(commandToExecute);
      const { stdout, stderr } = await this.exec(commandToExecute);
      console.log('stdout:', stdout);

      if (stderr) return { ok: true, message: stderr };
      return { ok: true, message: stdout };
    } catch (err: any) {
      console.log(err);
      return { ok: true, message: err.stderr };
    }
  }

  private replaceArgs(command: string, args: string[] | null): string {
    if (!args) throw new Error('Argument is required');

    let currentIndex = 0;
    return command.replace(/<arg>/g, () => {
      const replacement = args[currentIndex];
      currentIndex++;
      return replacement;
    });
  }

  static create(name: string, description: string, command: string, format: string) {
    return new GenerateBashCommand(name, description, command, format);
  }
}
