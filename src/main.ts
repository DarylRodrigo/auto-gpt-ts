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
import dotenv from 'dotenv';

dotenv.config();
import { makeWorkspace } from './utils/helper';

const agentConfig: AgentConfig = {
  openAIApiKey: process.env.OPENAI_API_KEY as string,
};

const directive = 'You are a AGI programming machine';

// const goals = [
//   "- Create a todo list app in node.js",
//   "- Create backend",
//   "- Create simple front end to connect to back end",
// ]

const goals = [
  '- Make a calculator app in python, that can add, subtract, multiply, and divide',
  '- validate the program can run',
  '- write tests to make sure it works',
];

const agent = new Agent('Jarvis', directive, goals, agentConfig);

agent.registerCommand(removeDirectoryCommandHandler);
agent.registerCommand(createDirectoryCommandHandler);
agent.registerCommand(changeDirectoryCommandHandler);
agent.registerCommand(readFileCommandHandler);
agent.registerCommand(writeToFileCommandHandler);
agent.registerCommand(appendToFileCommandHandler);
agent.registerCommand(spawnBashCommandHandler);

const main = async () => {
  makeWorkspace();
  agent.run(5);
};

main();
