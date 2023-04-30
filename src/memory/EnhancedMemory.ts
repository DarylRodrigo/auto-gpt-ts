import Logger from "../utils/Logger";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { CommandMemory } from "../infra/Memories";
import { AgentThought } from "../Agent";
import OpenAiManager from "../utils/OpenAIManager";
import { String } from "runtypes";

interface PineconeDbOptions {
  apiKey: string
  environment: string
  index: string
  openAIApiKey: string
}

export class EnhancedMemory {
  private pineconeIndex: VectorOperationsApi | null = null;

  private memory: string[] = [];
  constructor(private logger: Logger, private options: PineconeDbOptions, private openAiManager: OpenAiManager) {}

  async setup() {
    const client = new PineconeClient();
    await client.init({ apiKey: this.options.apiKey, environment: this.options.environment })
    this.pineconeIndex = client.Index(this.options.index)
  }

  get shortTermMemory(): string {
    return this.memory.join('\n')
  }

  async addMemoryBlock(thoughts: AgentThought, commandMemory: CommandMemory) {
    if (this.pineconeIndex === null) throw Error("Setup memory.")

    const system = "Write a summary of the reasoning, plan, command and results"
    const codeSummary = commandMemory.command.name === "WRITE_TO_FILE" ? 
      "Include in the summary details of the code. Specifically how to interact with it. For example if parameters are required and how to run it." : ""
    const user = `
      Thoughts: ${thoughts.reasoning}
      Plan: ${thoughts.plan.join(", ")}
      Command: ${commandMemory.command.name} ${commandMemory.command.args.join(", ")},
      Result: ${commandMemory.commandResult.message}
    `

    const summary = await this.openAiManager.chatCompletion(OpenAiManager.toPrompt([system, codeSummary], [user] ), String, false) as string;
    
    // Save to Pinecone
    const now = new Date()
    const docs = [
      new Document({
        metadata: { type: "command", time: now },
        pageContent: JSON.stringify(commandMemory)
      }),
      new Document({
        metadata: { type: "plan", time: now },
        pageContent: thoughts.plan.join(", "),
      }),
      new Document({
        metadata: { type: "reasoning", time: now },
        pageContent: thoughts.reasoning,
      }),
      new Document({
        metadata: { type: "summary", time: now },
        pageContent: summary,
      })
    ];

    try {
      await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings({ openAIApiKey: this.options.openAIApiKey }), {
        pineconeIndex: this.pineconeIndex,
      });
    } catch (e) {
      console.log(e)
    }
    

    // Save to memory
    this.memory.push(`
At ${now.toISOString()} 
I Thoughts: ${thoughts.speak}
with the Plan: ${thoughts.plan.join(", ")}
So I did: ${commandMemory.command.name} ${commandMemory.command.args.join(", ")}
With the result: ${commandMemory.commandResult.message}
`
    )

    // Log
    this.logger.log(`Summary Logger: ${summary}`)
  }
}
