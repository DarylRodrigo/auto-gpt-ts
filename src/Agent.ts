import { Record, Static, String, Array } from 'runtypes';
import { CommandPayload, Commands } from './commands';
import { generateGuidingPrompt } from './config';
import OpenAi from './utils/OpenAI';
import { Memory } from './memory/Memory';
import { CorrectCommandAgent } from './GPTAgents/Agents';
import { v4 as uuid } from 'uuid'
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
  openAIApiKey: string;
}

export class Agent {
  private agentId: string;
  private guidingPrompt: string = '';
  private correctCommandAgent: CorrectCommandAgent;
  private openai: OpenAi;

  constructor(
    public name: string,
    public directive: string,
    public goals: string[],
    private config: AgentConfig,
    public commands: any = {},
    private memory: Memory = new Memory(),
  ) {
    this.guidingPrompt = generateGuidingPrompt(
      this.directive,
      this.goals,
      this.generateCommandList(),
    );
    this.correctCommandAgent = new CorrectCommandAgent(config);
    this.openai = new OpenAi(this.config.openAIApiKey);
    this.agentId = uuid()
  }

  registerCommand(command: Commands) {
    this.commands[command.name] = command;
    this.guidingPrompt = generateGuidingPrompt(
      this.directive,
      this.goals,
      this.generateCommandList(),
    );
    console.log(this.guidingPrompt);
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

        console.log(`Incorrect command format: ${commandPayload}`);
        const corrections = await this.correctCommandAgent.execute(commandPayload, this.commands);
        return corrections.command;
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

  async act(thought: AgentThought, commandPayloads: CommandPayload[]) {
    const commandHistory = [];

    for (const commandPayload of commandPayloads) {
      const { name: commandName, args } = commandPayload;
      console.log(`executing command: ${commandName} with args: ${args}`);

      const cmd = this.commands[commandName];
      const commandResult = await cmd.execute({ args });

      commandHistory.push({ command: commandPayload, commandResult });
    }

    this.memory.addMemoryBlock({ thought, actions: commandHistory });

    console.log(this.memory.shortTermMemory);
  }

  private generateCommandList() {
    return Object.keys(this.commands).map((command) => {
      return this.commands[command].generateInstruction();
    });
  }
}
