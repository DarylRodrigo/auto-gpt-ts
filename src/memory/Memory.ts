import { Record, Array, Static } from 'runtypes';
import { AgentThought } from '../Agent';
import { CommandPayload, CommandResult } from '../infra/Commands';

const MemoryBlock = Record({
  thoughts: AgentThought,
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
        plan: block.thoughts.plan.join(' -> '),
        reasoning: block.thoughts.reasoning,
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
