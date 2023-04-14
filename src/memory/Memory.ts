import { Record, Array, Static } from 'runtypes';
import { AgentThought } from '../Agent';
import { CommandPayload, CommandResult } from '../commands';

const MemoryBlock = Record({
  thought: AgentThought,
  actions: Array(
    Record({
      command: CommandPayload,
      commandResult: CommandResult,
    }),
  ),
});
type MemoryBlock = Static<typeof MemoryBlock>;

export class Memory {
  private memory: MemoryBlock[] = [];
  constructor() {}

  get shortTermMemory(): string {
    const memory = this.memory.map((block) => {
      return {
        plan: block.thought.plan.join(' -> '),
        reasoning: block.thought.reasoning,
        command: block.actions
          .map(
            (action) =>
              `${action.command.name} - ${action.command.args.join(', ')} : completed ${
                action.commandResult.ok
              }`,
          )
          .join(' -> '),
      };
    });

    return memory
      .map((block) => {
        return `plan: ${block.plan}, reasoning: ${block.reasoning}, commands: ${block.command}`;
      })
      .join('\n');
  }

  addMemoryBlock(memoryBlock: MemoryBlock) {
    this.memory.push(memoryBlock);
  }
}
