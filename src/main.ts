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

dotenv.config();


const main = async () => {
  const agentConfig: AgentConfig = {
    goals: 'You are a AGI programming machine',
    directive: [
      '- Make a calculator app in python, that can add, subtract, multiply, and divide',
      '- validate the program can run',
      '- write tests to make sure it works',
    ],
    apiKeys: {
      openAI: process.env.OPENAI_API_KEY as string,
    }
  }
  
  const dockerManager = new DockerManager()
  await dockerManager.setup()

  const commandBus = new CommandBus()
  const dockerCommandHandler = new DockerCommandHandler(dockerManager)
  dockerCommandHandler.registerTo(commandBus)

  const agent = new Agent('Jarvis', agentConfig, commandBus);  

  makeWorkspace();
  agent.run(5);
};

main();
