import { DockerManager } from './utils/DockerManager';
import { WebSummariser } from './commands/utils/WebSummariser';
import { CommandBus } from './infra/CommandBus';
import dotenv from 'dotenv';
import { DockerCommandHandler } from './commands/DockerCommandHandler';
import { ResearchCommandHandler } from './commands/ResearchCommandHandler';
import OpenAIManager from './utils/OpenAIManager';



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


  // Setup OpenAIManager
  const openAiManager = new OpenAIManager(options.openAiApiKey)

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

  // const searchRes = await commandBus.execute("SEARCH_GOOGLE", ['top italian dishes'])
  // console.log(searchRes)

  // const res = await commandBus.execute("SUMMARIES_WEBSITE", ['https://www.auburn.edu/~vestmon/robotics.html', 'What are the 3 laws of robotics?'])
  // console.log(res)

  const ws = new WebSummariser(openAiManager)
  // console.log(await ws.getSummary('https://www.chefspencil.com/top-25-most-popular-italian-foods-dishes', "top italian dishes?"))
  // console.log(await ws.getSummary('https://en.wikipedia.org/wiki/Nikola_Tesla', ""))
  
  // console.log(await ws.getSummary('https://www.auburn.edu/~vestmon/robotics.html', ""))
  console.log(await ws.getSummary('https://en.wikipedia.org/wiki/Three_Laws_of_Robotics', "What are the three laws of robotics?"))
  // console.log(await ws.getSummary('https://www.britannica.com/topic/Three-Laws-of-Robotics', ""))
  // console.log(await ws.getSummary('https://theconversation.com/after-75-years-isaac-asimovs-three-laws-of-robotics-need-updating-74501', ""))
  // console.log(await ws.getSummary('https://www.theguardian.com/notesandqueries/query/0,5753,-21259,00.html', ""))
  // console.log(await ws.getSummary('https://www.scientificamerican.com/article/asimovs-laws-wont-stop-robots-from-harming-humans-so-weve-developed-a-better-solution/', ""))
  // console.log(await ws.getSummary('https://www.brookings.edu/opinions/isaac-asimovs-laws-of-robotics-are-wrong/', ""))
  // console.log(await ws.getSummary('https://floodgate.games/products/3-laws-of-robotics', ""))
  // console.log(await ws.getSummary('https://boardgamegeek.com/boardgame/271447/3-laws-robotics', ""))
  // console.log(await ws.getSummary('https://papers.ssrn.com/sol3/papers.cfm?abstract_id=289', ""))
};

main();
