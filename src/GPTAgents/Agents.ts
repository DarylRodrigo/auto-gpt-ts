import { AgentConfig } from '../Agent';
import { Record, String, Static } from 'runtypes';
import OpenAi from '../utils/OpenAI';
import { CommandPayload, Commands } from '../infra/Commands';

export const CorrectionFormat = Record({
  command: CommandPayload,
  error: String,
});
export type CorrectionFormat = Static<typeof CorrectionFormat>;

export class CorrectCommandAgent {
  private openAi: OpenAi;

  constructor(private config: AgentConfig) {
    this.openAi = new OpenAi(this.config.apiKeys.openAi);
  }

  async execute(incorrectCommand: unknown, commands: Commands[]): Promise<CorrectionFormat> {
    const response = await this.openAi.chatCompletion([
      {
        role: 'system',
        content: this.generatePrompt(incorrectCommand, commands),
      },
      {
        role: 'user',
        content: `Determine the correct command format, and respond using the format specified above:`,
      },
    ]);

    try {
      const res = CorrectionFormat.check(JSON.parse(response));
      return res;
    } catch (err) {
      throw new Error('Error parsing agent response');
    }
  }

  private generatePrompt(incorrectCommand: unknown, commands: Commands[]) {
    return `
      You are an expert analytics and coding program designed to figure out problems with json responses.

      OBJECTIVES:
      - Looking at the incorrectly formatted command and the different styles of correct formats, map the incorrect command to a correct one
      - pay special attention that 
          - only the keys "name" and "args" are present
          - there are the correct type of elemnents in the array


      VALID COMMAND FORMATS
      ${commands.map((command) => {
        return `{
            "name": "${command.name}",
            "args": [${command.format}]
          }`;
      })}
      - { "name": REMOVE_DIR, args: ["arg_name_of_directory"] }
      - { "name": CREATE_DIR, args: ["arg_name_of_directory"] }
      - { "name": CHANGE_DIR, args: ["arg_name_of_directory"] }
      - { "name": READ_FILE, args: ["arg_name_of_file"] }
      - { "name": WRITE_TO_FILE, args: ["arg_content","arg_name_of_file"] }
      - { "name": APPEND_FILE, args: ["arg_content","arg_name_of_file"] }
      - { "name": EXECUTE_BASH, args:  ["command", "parameter1", "parameter2"] }


      INCORRECT COMMAND

      ${JSON.stringify(incorrectCommand)}


      CORRECT COMMNAD FORMAT

      {
        "name": "command name",
        "args": ["relevant", "arguments"]
      }


      REPLY ONLY IN THE JSON BELOW
      {
        "command": {
            "name": "command name",
          "args": ["relevant", "arguments"]
        },
        "error": "short description of what the problem was"
      }
    `;
  }
}
