import Logger from "../utils/Logger";
import { MemoryBlock } from "../infra/Memories";

export class Memory {
  private memory: MemoryBlock[] = [];
  constructor(private logger: Logger) {}

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
        return `plan: ${block.plan}, reasoning: ${block.reasoning}, commands: ${block.command}`
      })
      .join('\n')
  }

  addMemoryBlock(memoryBlock: MemoryBlock) {
    this.memory.push(memoryBlock)
    this.logger.saveThought(memoryBlock)
  }
}
