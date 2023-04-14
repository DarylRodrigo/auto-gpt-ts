import { Commands } from './Commands';
import { Record, String, Static, Array } from 'runtypes';
import { promisify } from 'util';
import { exec } from 'child_process';

const ExecuteBashCommandFormat = Record({
  args: Array(String),
});
type ExecuteBashCommandFormat = Static<typeof ExecuteBashCommandFormat>;

class ExecuteBashCommand extends Commands {
  private exec = promisify(exec);

  constructor(name: string, machineDescription: string, format: unknown) {
    super(name, machineDescription, format);
  }

  async execute(params: ExecuteBashCommandFormat) {
    const { args } = ExecuteBashCommandFormat.check(params);

    try {
      const { stdout, stderr } = await this.exec(args.join(' '));

      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      if (stderr) return { ok: true, message: stderr };
      return { ok: true, message: stdout };
    } catch (err) {
      console.log(err);
      return { ok: true, message: JSON.stringify(err) };
    }
  }

  static create() {
    return new ExecuteBashCommand('EXECUTE_BASH', 'execute code', {});
  }
}

export const executeCodeCommandHandler = ExecuteBashCommand.create();
