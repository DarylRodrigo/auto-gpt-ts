import { Record, Static, String, Array } from 'runtypes';
import { generateGuidingPrompt } from './config';

// import { CorrectCommandAgent } from './GPTAgents/Agents';
import { CommandBus } from './infra/CommandBus';
import { CommandPayload, CommandResult } from './infra/Commands';
import OpenAiManager from './utils/OpenAIManager';
import { EnhancedMemory } from './memory/EnhancedMemory';
const prompt = require('prompt-sync')();

export const AgentThought = Record({
  text: String,
  reasoning: String,
  plan: Array(String),
  criticism: String,
  speak: String,
});
export type AgentThought = Static<typeof AgentThought>;

export const AgentResponse = Record({
  thoughts: AgentThought,
  command: CommandPayload,
});
export type AgentResponse = Static<typeof AgentResponse>;

export interface AgentConfig {
  agentId: string,
  directive: string,
  goals: string[],
  enabledSkills: string[]
}

export class Agent {
  private guidingPrompt: string = '';
  constructor(
    private config: AgentConfig,
    private commandBus: CommandBus,
    private openai: OpenAiManager,
    private memory: EnhancedMemory
  ) {
    this.guidingPrompt = generateGuidingPrompt(
      this.config.directive,
      this.config.goals,
      this.commandBus.generateCommandList(config.enabledSkills),
    );

    console.log(`✨ Directive: ${this.config.directive}`)
    console.log(`\n🎯 Goals: \n${this.config.goals.map((goal) => `- ${goal}`).join('\n')}`)
    console.log(`\n🛠 Registered Commands:\n${this.commandBus.generateCommandList(config.enabledSkills).map(cmd => `-${cmd}`).join('\n')} \n\n`)
  }

  async run(numLoops = 10, options = { permissions: true }) {
    for (let i = 0; i < numLoops; i++) {
      
      // Generate thoughts
      const { thoughts, command } = await this.think();
      if (options.permissions && prompt('continue with action?') !== 'y') process.exit(-1);
      
      // Execute command
      const commandResult = await this.act(command);

      // Add thoughts and command to memory
      await this.memory.addMemoryBlock(thoughts, { command, commandResult })
    }
  };

  async think() {
    console.log("============= 🧠 T H I N K I N G 🧠 =============")
    console.log("===> Memories Added")
    console.log(this.memory.shortTermMemory)
    console.log("===================")

    const { thoughts, command } = await this.openai.chatCompletion([
      {
        role: 'system',
        content: this.guidingPrompt,
      },
      {
        role: 'system',
        content: `this reminds you of: ${this.memory.shortTermMemory}}`,
      },
      {
        role: 'user',
        content:
          'Determine which next command to use, and respond using the format specified above:',
      }
    ], AgentResponse);
    
    console.log("===> Thoughts Returned")
    console.log(thoughts)
    console.log("===> Commands Returned")
    console.log(command)
    
    return {
      thoughts,
      command,
    };

  }

  async act(commandPayload: CommandPayload): Promise<CommandResult> {
    const { name: commandName, args } = commandPayload;
    console.log(`executing command: ${commandName} \n\n with args: ${args.join("\n")}`);

    return await this.commandBus.execute(commandName, args);
  }

}
