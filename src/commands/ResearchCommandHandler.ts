import { CommandBus } from "../infra/CommandBus";
import { CommandResult } from "../infra/Commands";
import { GoogleSearch } from "./utils/GoogleSearch";
import { WolframAlpha } from "./utils/WolframAlpha";

export interface ResearchCommandHandlerOptions {
  googleApiKey: string;
  googleSearchEngineId: string;
  wolframAlphaAppId: string;
}

export class ResearchCommandHandler {
  private googleSearch: GoogleSearch;
  private wolframAlpha: WolframAlpha;

  constructor(options: ResearchCommandHandlerOptions) {
    this.googleSearch = new GoogleSearch(options.googleApiKey, options.googleSearchEngineId);
    this.wolframAlpha = new WolframAlpha(options.wolframAlphaAppId);
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

  registerTo(commandBus: CommandBus) {
    commandBus.registerCommand(
      "SEARCH_GOOGLE",
      "Searches Google for the given query eg: ['Who was Nikola Tesla']",
      "['search query']",
      async (args) => await this.searchGoogle(args)
    );

    commandBus.registerCommand(
      "QUERY_WOLFRAM_ALPHA",
      "Queries Wolfram Alpha for the given query eg: ['What is the capital of France?']",
      "['query']",
      async (args) => await this.queryWolframAlpha(args)
    );
  }
}
