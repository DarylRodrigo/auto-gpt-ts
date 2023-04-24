import OpenAiManager from "../utils/OpenAIManager";
import { CommandBus } from "../infra/CommandBus"
import { CommandResult } from "../infra/Commands"
import { DockerManager } from "../utils/DockerManager"
import { String } from 'runtypes';

interface DockerCommandHandlerOptions {
  correctCode: boolean
}
export class DockerCommandHandler {
  constructor(private dockerManager: DockerManager, private openAiManager: OpenAiManager, private options: DockerCommandHandlerOptions = { correctCode: true }) {}

  async runPythonScript(args: string[]): Promise<CommandResult> {
    const res = await this.dockerManager.containerExec(["python", ...args]);
    return { ok: true, message: res };
  }

  async makeDirectory(args: string[]): Promise<CommandResult> {
    const [directoryName] = args;
    await this.dockerManager.containerExec(["mkdir", directoryName]);
    return { ok: true, message: "succesfull" };
  }

  async removeDirectory(args: string[]): Promise<CommandResult> {
    const [directoryName] = args;
    await this.dockerManager.containerExec(["rm", "-r", directoryName]);
    return { ok: true, message: "succesfull" };
  }

  async deleteFile(args: string[]): Promise<CommandResult> {
    const [fileName] = args;
    await this.dockerManager.containerExec(["sh", "-c", `rm ${fileName}`]);
    return { ok: true, message: "succesfull" };
  }

  async readFile(args: string[]): Promise<CommandResult> {
    const [fileName] = args;
    const res = await this.dockerManager.containerExec(["cat", fileName]);
    return { ok: true, message: res };
  }

  async writeToFile(args: string[]): Promise<CommandResult> {
    const [fileName, content] = args;
    await this.dockerManager.containerExec(["sh", "-c", `echo '${content}' > ${fileName}`]);
    return { ok: true, message: "succesfull" };
  }

  async appendToFile(args: string[]): Promise<CommandResult> {
    const [fileName, content] = args;
    await this.dockerManager.containerExec(["sh", "-c", `echo '${content}' >> ${fileName}`]);
    return { ok: true, message: "succesfull" };
  }

  async listFiles(args: string[]): Promise<CommandResult> {
    if (args.length > 0)  return { ok: true, message: "Not suppose to provide any args" }; 
    const res = await this.dockerManager.containerExec(["ls"]);
    return { ok: true, message: res };
  }


  registerTo(commandBus: CommandBus) {
    commandBus.registerCommand(
      "RUN_PYTHON",
      'runs python script with arguments eg: ["script.py"] or ["script.py", "-i", "1"]]. User intraction is not supported',
      '["script_name", "arg", "value"]',
      async (args) => await this.runPythonScript(args)
    );
  
    commandBus.registerCommand(
      "MAKE_DIR",
      'Makes new directory eg: ["new_dir"]',
      '["directory_name"]',
      async (args) => await this.makeDirectory(args)
    );
  
    commandBus.registerCommand(
      "REMOVE_DIR",
      'Removes directory eg: ["dir_to_remove"]',
      '["directory_name"]',
      async (args) => await this.removeDirectory(args)
    );
  
    commandBus.registerCommand(
      "DELETE_FILE",
      'Deletes file eg: ["file_to_delete"]',
      '["file_name"]',
      async (args) => await this.deleteFile(args)
    );
  
    commandBus.registerCommand(
      "READ_FILE",
      'Reads file content eg: ["file_to_read"]',
      '["file_name"]',
      async (args) => await this.readFile(args)
    );
  
    commandBus.registerCommand(
      "WRITE_TO_FILE",
      'Writes content to file eg: ["file_to_write", "content"]',
      '["file_name", "content"]',
      async (args) => await this.writeToFile(args),
      async (args) => {
        const systemPrompt = "Can you check if the syntax of this code is correct and make sure the input command is not used. If an input command is used please replace it for command line arguments. Respond with JUST the new code.";
        if (args[0].includes(".py") && this.options.correctCode) 
          args[1] = await this.openAiManager.chatCompletion(OpenAiManager.toPrompt([systemPrompt], [args[0]] ), String);
        return args
      }
    );
  
    commandBus.registerCommand(
      "APPEND_FILE",
      'Appends content to file eg: ["file_to_append", "content"]',
      '["file_name", "content"]',
      async (args) => await this.appendToFile(args)
    );
  
    commandBus.registerCommand(
      "LIST_FILES",
      'Lists files in directory',
      '[]',
      async (args) => await this.listFiles(args)
    );
  }
  
}
