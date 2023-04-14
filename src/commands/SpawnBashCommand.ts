import { Commands } from "./Commands";
import { Record, String, Static, Array } from "runtypes"
import { promisify } from 'util'
import { spawn } from 'child_process'

const SpawnBashCommandFormat = Record({
  args: Array(String),
});
type SpawnBashCommandFormat = Static<typeof SpawnBashCommandFormat>

class SpawnBashCommand extends Commands {
  constructor (name: string, machineDescription: string, format: unknown) {
    super(name, machineDescription, format);
  }

  async execute(params: SpawnBashCommandFormat): Promise<{ok: boolean, message: string | null}> {
    return new Promise((resolve, reject) => {
      console.log(params)
      const { args } = SpawnBashCommandFormat.check(params);
      console.log(args[0], args.slice(1))
      const process = args.length == 1 ? spawn(args[0]) : spawn(args[0], args.slice(1));

      const output: string[] = []
    
      process.stdout.on('data', (data: Buffer) => {
        const dataStr = data.toString();
        output.push(dataStr)
        
        if (dataStr.includes(':') || dataStr.toLowerCase().includes('y/n')) {
          process.stdin.write('\n'); // Press "Enter" for each prompt
        }
      });
    
      process.stderr.on('data', (data: Buffer) => {
        console.error(data.toString());
      });
    
      process.on('error', (error: Error) => {
        reject({ ok: false, message: null});
      });
    
      process.on('exit', (code: number) => {
        process.stdin.end(); // Close the stdin stream
        if (code === 0) {
          resolve( {ok: true, message: output.join(" ")} );
        } else {
          reject({ ok: false, message: `process exited with code ${code}`});
        }
      })
    })
  }

  static create() {
    return new SpawnBashCommand(
      "EXECUTE_BASH", 
      'execute a single command eg: ["ls", "-la"], ["npm", "init"]',
      '["command", "parameter1", "parameter2"]'
    );
  }
}

export const spawnBashCommandHandler = SpawnBashCommand.create()
