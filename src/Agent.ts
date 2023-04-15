import { Record, Static, String, Array } from 'runtypes';
import { generateGuidingPrompt } from './config';

import { Memory } from './memory/Memory';
// import { CorrectCommandAgent } from './GPTAgents/Agents';
import { CommandBus } from './infra/CommandBus';
import { CommandPayload } from './infra/Commands';
import OpenAiManager from './utils/OpenAIManager';
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
  commands: Array(CommandPayload),
});
export type AgentResponse = Static<typeof AgentResponse>;

export interface AgentConfig {
  agentId: string,
  directive: string,
  goals: string[],
}

export class Agent {
  private guidingPrompt: string = '';
  constructor(
    private config: AgentConfig,
    private commandBus: CommandBus,
    private openai: OpenAiManager,
    private memory: Memory
  ) {
    this.guidingPrompt = generateGuidingPrompt(
      this.config.directive,
      this.config.goals,
      this.commandBus.generateCommandList(),
    );

    console.log(this.guidingPrompt)
  }

  async run(numLoops = 10, options = { permissions: true }) {
    for (let i = 0; i < numLoops; i++) {
      const { thoughts, commands } = await this.think();
      console.log(thoughts)
      console.log(commands)
      if (options.permissions && prompt('continue with action?') !== 'y') process.exit(-1);
      await this.act(thoughts, commands);
    }
  };

  async think() {
    const completion = await this.openai.chatCompletion([
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
      },
    ]);

    try {
      // Check response is in correct format
      const { thoughts, commands } = AgentResponse.check(JSON.parse(completion));

      // Commands sometimes are not in the correctly interperated so have agent correct them.
      const promises = commands.map(async (commandPayload: unknown): Promise<CommandPayload> => {
        if (CommandPayload.validate(commandPayload).success) {
          return commandPayload as CommandPayload;
        }

        // console.log(`Incorrect command format: ${commandPayload}`);
        // const corrections = await this.correctCommandAgent.execute(commandPayload, this.commands);
        // return corrections.command;
        return commandPayload as CommandPayload;
      });

      // Return thoughts and corrected commands
      return {
        thoughts,
        commands: await Promise.all(promises),
      };
    } catch (err) {
      console.log(completion);
      throw new Error('Error parsing agent response');
    }
  }

  async act(thoughts: AgentThought, commandPayloads: CommandPayload[]) {
    const commandHistory = [];

    for (const commandPayload of commandPayloads) {
      const { name: commandName, args } = commandPayload;
      
      console.log(`executing command: ${commandName} with args: ${args}`);
      const commandResult = await this.commandBus.execute(commandName, args);
      commandHistory.push({ command: commandPayload, commandResult });
    }

    this.memory.addMemoryBlock({ thoughts, actions: commandHistory });

    console.log(this.memory.shortTermMemory);
  }

}
