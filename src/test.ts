import { Agent, AgentConfig } from './Agent';
import {
  spawnBashCommandHandler,
  appendToFileCommandHandler,
  changeDirectoryCommandHandler,
  createDirectoryCommandHandler,
  readFileCommandHandler,
  removeDirectoryCommandHandler,
  writeToFileCommandHandler,
} from './commands';
import { makeWorkspace } from './utils/helper';
import { DockerManager } from './utils/DockerManager';
import dotenv from 'dotenv';
import { CommandBus } from './infra/CommandBus';
import { DockerCommandHandler } from './commands/DockerCommandHandler';

dotenv.config();


const main = async () => {
  const dockerManager = new DockerManager()
  await dockerManager.setup()

  const commandBus = new CommandBus()
  const dockerCommandHandler = new DockerCommandHandler(dockerManager)
  dockerCommandHandler.registerTo(commandBus)

  const res = await commandBus.execute("RUN_PYTHON", ["/app/hello.py"])
  console.log(res)
};

main();
