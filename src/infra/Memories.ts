import { Record, Array, Static, String, Union, Literal } from 'runtypes';
import { AgentThought } from '../Agent';
import { CommandPayload, CommandResult } from '../infra/Commands';

export const ThoughtMemory = Record({
  thoughts: AgentThought,
  actions: Array(CommandPayload),
})

export type ThoughtMemory = Static<typeof ThoughtMemory>;

export const ReflectionMemory = Record({
  reflection: String
});
export type ReflectionMemory = Static<typeof ReflectionMemory>;

export const CommandMemory = Record({
  command: CommandPayload,
  commandResult: CommandResult
});
export type CommandMemory = Static<typeof CommandMemory>;


export const MemoryTypes = Union(
  Literal("COMMAND"),
  Literal("THOUGHT"),
  Literal("REFLECTION"),
)
export type MemoryTypes = Static<typeof MemoryTypes>

export const MemoryBlock = Record({
  type: MemoryTypes,
  memory: ThoughtMemory.Or(ReflectionMemory).Or(CommandMemory)
});
export type MemoryBlock = Static<typeof MemoryBlock>;
