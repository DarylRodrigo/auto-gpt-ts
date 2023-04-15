import { CommandBus } from "../infra/CommandBus"
import { CommandResult } from "../infra/Commands"
import { DockerManager } from "../utils/DockerManager"

export class DockerCommandHandler {
  constructor(private dockerManager: DockerManager) {}

  async runPythonScript(args: string[]): Promise<CommandResult> {
    const [fileName] = args;
    const res = await this.dockerManager.containerExec(["python", fileName]);
    return { ok: true, message: res };
  }

  async makeDirectory(args: string[]): Promise<CommandResult> {
    const [directoryName] = args;
    const res = await this.dockerManager.containerExec(["mkdir", directoryName]);
    return { ok: true, message: res };
  }

  async removeDirectory(args: string[]): Promise<CommandResult> {
    const [directoryName] = args;
    const res = await this.dockerManager.containerExec(["rm", "-r", directoryName]);
    return { ok: true, message: res };
  }

  async makeFile(args: string[]): Promise<CommandResult> {
    const [fileName] = args;
    const res = await this.dockerManager.containerExec(["touch", fileName]);
    return { ok: true, message: res };
  }

  async deleteFile(args: string[]): Promise<CommandResult> {
    const [fileName] = args;
    const res = await this.dockerManager.containerExec(["rm", fileName]);
    return { ok: true, message: res };
  }

  async readFile(args: string[]): Promise<CommandResult> {
    const [fileName] = args;
    const res = await this.dockerManager.containerExec(["cat", fileName]);
    return { ok: true, message: res };
  }

  async writeToFile(args: string[]): Promise<CommandResult> {
    const [fileName, content] = args;
    const res = await this.dockerManager.containerExec(["sh", "-c", `echo '${content}' > ${fileName}`]);
    return { ok: true, message: res };
  }

  async appendToFile(args: string[]): Promise<CommandResult> {
    const [fileName, content] = args;
    const res = await this.dockerManager.containerExec(["sh", "-c", `echo '${content}' >> ${fileName}`]);
    return { ok: true, message: res };
  }

  async listFiles(args: string[]): Promise<CommandResult> {
    if (args.length > 0)  return { ok: true, message: "Not suppose to provide any args" }; 
    const res = await this.dockerManager.containerExec(["ls"]);
    return { ok: true, message: res };
  }


  registerTo(commandBus: CommandBus) {
    commandBus.registerCommand(
      "RUN_PYTHON",
      'runs python script eg: ["script.py"]',
      '["script_name"]',
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
      "MAKE_FILE",
      'Creates new file eg: ["new_file"]',
      '["file_name"]',
      async (args) => await this.makeFile(args)
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
      async (args) => await this.writeToFile(args)
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
