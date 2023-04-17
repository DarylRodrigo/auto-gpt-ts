import { expect } from "chai";
import nock from "nock";
import { CommandBus } from "../../src/infra/CommandBus";
import { ResearchCommandHandler, ResearchCommandHandlerOptions } from "../../src/commands/ResearchCommandHandler";
import OpenAiManager from "../../src/utils/OpenAIManager";

describe("ResearchCommandHandler", () => {
  const options: ResearchCommandHandlerOptions = {
    googleApiKey: "fake_google_api_key",
    googleSearchEngineId: "fake_google_search_engine_id",
    wolframAlphaAppId: "fake_wolfram_alpha_app_id",
  };

  const openAiManager = new OpenAiManager("fake_open_ai_api_key");

  const researchCommandHandler = new ResearchCommandHandler(openAiManager, options);
  const commandBus = new CommandBus();
  researchCommandHandler.registerTo(commandBus);

  afterEach(() => {
    nock.cleanAll();
  });

  it("should search Google", async () => {
    nock("https://www.googleapis.com")
      .get("/customsearch/v1")
      .query(true)
      .reply(200, {
        items: [
          {
            title: "Nikola Tesla - Wikipedia",
            link: "https://en.wikipedia.org/wiki/Nikola_Tesla",
            snippet: 'Nikola Tesla was born an ethnic Serb in the village of Smiljan, within the Military Frontier, in the Austrian Empire (present day Croatia), on 10 July [O.S. 28 ...',
          },
        ],
      });

    const res = await commandBus.execute("SEARCH_GOOGLE", ["How was Nikola Tesla"]);
    expect(res.ok).to.eql(true);
    expect(res.message).to.be.a("string");
    expect(res.message).to.eql("Nikola Tesla - Wikipedia snippet: Nikola Tesla was born an ethnic Serb in the village of Smiljan, within the Military Frontier, in the Austrian Empire (present day Croatia), on 10 July [O.S. 28 ... - link: https://en.wikipedia.org/wiki/Nikola_Tesla");
  });

  it("should query Wolfram Alpha", async () => {
    nock("http://api.wolframalpha.com")
      .get("/v1/result")
      .query(true)
      .reply(200, "Paris");

    const res = await commandBus.execute("QUERY_WOLFRAM_ALPHA", ["What is the capital of France?"]);
    expect(res.ok).to.eql(true);
    expect(res.message).to.be.a("string");
    expect(res.message).to.eql("Paris");
  });
});
