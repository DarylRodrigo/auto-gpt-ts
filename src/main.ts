import { Agent, AgentConfig } from "./Agent";
import { CorrectCommandAgent } from "./GPTAgents/Agents";
import { CommandPayload, Commands, spawnBashCommandHandler } from "./commands";
import { executeCodeCommandHandler } from "./commands/ExecuteBashCommand";
import { appendToFileCommandHandler, changeDirectoryCommandHandler, createDirectoryCommandHandler, makeFileCommandHandler, readFileCommandHandler, removeDirectoryCommandHandler, writeToFileCommandHandler } from "./commands/FileCommands";
import { spawn } from 'child_process';
import Logger from "./utils/Logger";
const prompt = require('prompt-sync')();

const agentConfig: AgentConfig = {
  openAIApiKey: "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"
}

const directive = "You are a AGI programming machine"

// const goals = [
//   "- Create a todo list app in node.js",
//   "- Create backend",
//   "- Create simple front end to connect to back end",
// ]

const goals = [
  "- Make a calculator app in python, that can add, subtract, multiply, and divide",
  "- validate the program can run",
  "- write tests to make sure it works",
]


const agent = new Agent("Jarvis", directive, goals, agentConfig);

agent.registerCommand(removeDirectoryCommandHandler)
agent.registerCommand(createDirectoryCommandHandler)
agent.registerCommand(changeDirectoryCommandHandler)
agent.registerCommand(readFileCommandHandler)
agent.registerCommand(writeToFileCommandHandler)
agent.registerCommand(appendToFileCommandHandler)
agent.registerCommand(spawnBashCommandHandler)

const thoughtActionLoop = async () => {
  const { thoughts, commands } = await agent.think()
  if (prompt('continue with action?') !== 'y') process.exit(-1)
  const resp = await agent.act(thoughts, commands)
}

const main = async () => {
  process.chdir('./workspace');
  
  for (let i = 0; i < 10; i++) {
    await thoughtActionLoop() 
  }
}

main()

