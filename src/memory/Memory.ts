import Logger from "../utils/Logger";
import { CommandMemory, MemoryBlock, ThoughtMemory } from "../infra/Memories";

export class Memory {
  private memory: MemoryBlock[] = [];
  constructor(private logger: Logger) {}

  get shortTermMemory(): string {
    const memory = this.memory.map((block) => {
      switch (block.type) {
        case 'THOUGHT':
          return this.thoughtMemoryToPrompt(block.memory as ThoughtMemory)
        case 'COMMAND':
          return this.commandMemoryToPrompt(block.memory as CommandMemory)
        default:
          throw new Error(`Unknown memory type ${block.type}`)
      }
    });
    return memory.join('\n\n')
  }

  addMemoryBlock(memoryBlock: MemoryBlock) {
    console.log(`💭 Adding memory block: ${JSON.stringify(memoryBlock)}`)

    this.memory.push(memoryBlock)
    this.logger.saveThought(memoryBlock)
  }

  private commandMemoryToPrompt(memoryBlock: CommandMemory): string {
    const { commandResult, command } = memoryBlock
    return `At ${commandResult.executedAt} I ran the command ${command.name} with ${command.args.join(', ')}\nWhen completed, the result was ${commandResult.message}\n`
  }

  private thoughtMemoryToPrompt(memoryBlock: ThoughtMemory): string {
    const now = new Date()
    const time =  `At ${now.toLocaleDateString()} ${now.toLocaleTimeString()} `
    const plan = `the plan was to ${memoryBlock.thoughts.plan.join(', then ')}`
    const commands = `My immediate actions were to ${memoryBlock.actions.map((action) => `${action.name}` ).join(', then ')}`

    return `${time} ${plan}\n${commands}\n`
  }
}
