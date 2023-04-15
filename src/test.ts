import { DockerManager } from './utils/DockerManager';
import { WebSummariser } from './commands/utils/WebSummariser';
import { CommandBus } from './infra/CommandBus';
import dotenv from 'dotenv';
import { DockerCommandHandler } from './commands/DockerCommandHandler';
import { ResearchCommandHandler } from './commands/ResearchCommandHandler';

dotenv.config();


const main = async () => {
  const options = {
    openAiApiKey: process.env.OPENAI_API_KEY as string,
    googleApiKey: process.env.GOOGLE_API_KEY as string,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID as string,
    wolframAlphaAppId: process.env.WOLFRAM_ALPHA_APP_ID as string,
  }

  // Set up logging
  
  // Setup docker interface as sandbox for agent
  const dockerManager = new DockerManager()
  await dockerManager.setup()

  // Create command bus and register commands
  const commandBus = new CommandBus()

  const dockerCommandHandler = new DockerCommandHandler(dockerManager)
  dockerCommandHandler.registerTo(commandBus)
  const researchCommandHandler = new ResearchCommandHandler({ 
    googleApiKey: options.googleApiKey, 
    googleSearchEngineId: options.googleSearchEngineId, 
    wolframAlphaAppId: options.wolframAlphaAppId 
  })
  researchCommandHandler.registerTo(commandBus)
  const res = await commandBus.execute("SUMMARIES_WEBSITE", ['https://en.wikipedia.org/wiki/Nikola_Tesla', 'Who was Nikola Tesla?'])
  console.log(res)

  const ws = new WebSummariser()
  console.log(await ws.getSummary('https://en.wikipedia.org/wiki/Nikola_Tesla', ""))
};

main();
