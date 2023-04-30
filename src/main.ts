import { Agent, AgentConfig } from './Agent';
import { DockerManager } from './utils/DockerManager';
import dotenv from 'dotenv';
import { CommandBus } from './infra/CommandBus';
import { DockerCommandHandler } from './commands/DockerCommandHandler';
import OpenAiManager from './utils/OpenAIManager';
import { v4 as uuid } from 'uuid'
import Logger from './utils/Logger';
import { CodeEditingCommandHandler}  from './commands/CodeEditingCommandHandler'
import { EnhancedMemory } from './memory/EnhancedMemory';
import { ResearchCommandHandler } from './commands/ResearchCommandHandler';

dotenv.config();


const main = async () => {
  const options = {
    openAiApiKey: process.env.OPENAI_API_KEY as string,
    googleApiKey: process.env.GOOGLE_API_KEY as string,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID as string,
    wolframAlphaAppId: process.env.WOLFRAM_ALPHA_APP_ID as string,
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY as string,
      environment: process.env.PINECONE_ENVIRONMENT as string,
      index:process.env.PINECONE_INDEX as string
    }
  }

  const agentConfig: AgentConfig = {
    agentId: uuid(),
    directive: 'You are a AGI programming machine designed to write effective, short code that functions.',
    goals: [
      'Make a calculator app in python, that can add, subtract, multiply, and divide',
      'validate the program can run',
      'write tests to make sure it works',
    ],
    enabledSkills: ['WRITE_TO_FILE', 'APPEND_FILE', 'RUN_PYTHON', 'REPLACE_LINE', 'ADD_LINES'],
  }

  // const agentConfig: AgentConfig = {
  //   agentId: uuid(),
  //   directive: 'You are a AGI research analyst designed to research information and synthesise it into a report',
  //   goals: [
  //     '- research the most populat destinations for a holiday in the UK in summer',
  //     '- generate a travel itenerary proposal',
  //     '- save the plan in a text file',
  //   ]
  // }

  // Set up logging
  const logger = new Logger(agentConfig.agentId);
  
  // Setup docker interface as sandbox for agent
  const dockerManager = new DockerManager()
  await dockerManager.setup()

  // Create OpenAI manager
  const openAiManager = new OpenAiManager(options.openAiApiKey);

  // Create command bus and register commands
  const commandBus = new CommandBus()
  const dockerCommandHandler = new DockerCommandHandler(dockerManager, openAiManager)
  dockerCommandHandler.registerTo(commandBus)
  const researchCommandHandler = new ResearchCommandHandler(
    openAiManager, 
    { 
      googleApiKey: options.googleApiKey, 
      googleSearchEngineId: options.googleSearchEngineId, 
      wolframAlphaAppId: options.wolframAlphaAppId 
    }
  )
  researchCommandHandler.registerTo(commandBus)
  const codeEditingCommandHandler = new CodeEditingCommandHandler(dockerManager)
  codeEditingCommandHandler.registerTo(commandBus)

  // Instantiate agent
  const memory = new EnhancedMemory(logger, { ...options.pinecone, openAIApiKey: options.openAiApiKey }, openAiManager)
  memory.setup()
  const agent = new Agent(agentConfig, commandBus, openAiManager, memory)

  // Run agent
  agent.run(10);
};

main();
