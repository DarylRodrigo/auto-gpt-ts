import { CommandBus } from "../infra/CommandBus";
import { CommandResult } from "../infra/Commands";
import { GoogleSearch } from "./utils/GoogleSearch";
import { WolframAlpha } from "./utils/WolframAlpha";
import OpenAiManager from "../utils/OpenAIManager";
import { WebSummariser } from "./utils/WebSummariser";

export interface ResearchCommandHandlerOptions {
  googleApiKey: string;
  googleSearchEngineId: string;
  wolframAlphaAppId: string;
}

export class ResearchCommandHandler {
  private googleSearch: GoogleSearch
  private wolframAlpha: WolframAlpha
  private webSummaries: WebSummariser

  constructor(openAiManager: OpenAiManager, private options: ResearchCommandHandlerOptions) {
    this.googleSearch = new GoogleSearch(options.googleApiKey, options.googleSearchEngineId);
    this.wolframAlpha = new WolframAlpha(options.wolframAlphaAppId);
    this.webSummaries = new WebSummariser(openAiManager)
  }

  async searchGoogle(args: string[]): Promise<CommandResult> {
    const [searchTerm] = args;
    const res = await this.googleSearch.search(searchTerm);
    return { ok: true, message: res };
  }

  async queryWolframAlpha(args: string[]): Promise<CommandResult> {
    const [query] = args;
    const res = await this.wolframAlpha.query(query);
    return { ok: true, message: res };
  }

  async summaries(args: string[]): Promise<CommandResult> {
    const [ url, question ] = args;

    const summaries = await this.webSummaries.getSummary(url, question); 

    return { ok: true, message: summaries.join("\n") };
  }

  registerTo(commandBus: CommandBus) {

    if (this.options.googleApiKey && this.options.googleSearchEngineId) {
      commandBus.registerCommand(
        "SEARCH_GOOGLE",
        "Searches Google for the given query eg: ['Who was Nikola Tesla'], returns links and snippets only",
        "['search query']",
        async (args) => await this.searchGoogle(args)
      );  
    }
    
    if (this.options.wolframAlphaAppId) {
      commandBus.registerCommand(
        "QUERY_WOLFRAM_ALPHA",
        "Queries Wolfram Alpha for the given query eg: ['What is the capital of France?']",
        "['query']",
        async (args) => await this.queryWolframAlpha(args)
      )
    }

    commandBus.registerCommand(
      "SUMMARIES_WEBSITE",
      "Researches a website and tries to answer question eg: ['https://en.wikipedia.org/wiki/Nikola_Tesla', 'Who was Nikola Tesla?']",
      "['website_url', 'question to answer']",
      async (args) => await this.summaries(args)
    );
  }
}
