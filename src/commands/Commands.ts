import { Record, String, Array, Static, Null, Boolean } from "runtypes";

export const CommandPayload = Record({
  name: String,
  args: Array(String),
})
export type CommandPayload = Static<typeof CommandPayload>

export const CommandResult = Record({
  ok: Boolean,
  message: String.Or(Null),
})
export type CommandResult = Static<typeof CommandResult>

export abstract class Commands {
  constructor(
    readonly name: string,
    readonly machineDescription: string,
    readonly format: unknown,
  ) {}

  abstract execute(params?: unknown): Promise<CommandResult>;

  generateInstruction() {
    return `command name: ${this.name}, description: ${this.machineDescription}, args: ${this.format}`;
  }
}
