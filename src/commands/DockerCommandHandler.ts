import { CommandBus } from "../infra/CommandBus"
import { CommandResult } from "../infra/Commands"
import { DockerManager } from "../utils/DockerManager"

export class DockerCommandHandler {
  constructor(private dockerManager: DockerManager) {}

  async runPythonScript(args: string[]): Promise<CommandResult> {
    const res = await this.dockerManager.containerExec(["python", args[0]])
    return { ok: true, message: res}
  }

  registerTo(commandBus: CommandBus) {
    commandBus.registerCommand("RUN_PYTHON", async (args) => await this.runPythonScript(args))
  }
}

// agent.registerCommand(removeDirectoryCommandHandler);
// agent.registerCommand(createDirectoryCommandHandler);
// agent.registerCommand(changeDirectoryCommandHandler);
// agent.registerCommand(readFileCommandHandler);
// agent.registerCommand(writeToFileCommandHandler);
// agent.registerCommand(appendToFileCommandHandler);
// agent.registerCommand(spawnBashCommandHandler);
