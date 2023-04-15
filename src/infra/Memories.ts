import { Record, Array, Static } from 'runtypes';
import { AgentThought } from '../Agent';
import { CommandPayload, CommandResult } from '../infra/Commands';

export const MemoryBlock = Record({
  thoughts: AgentThought,
  actions: Array(
    Record({
      command: CommandPayload,
      commandResult: CommandResult,
    }),
  ),
});
export type MemoryBlock = Static<typeof MemoryBlock>;
