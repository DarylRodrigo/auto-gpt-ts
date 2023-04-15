import { Commands } from '../infra/Commands';
import { GenerateBashCommand } from './helpers/GenerateBashCommand';

class ChangeDirectoryCommand extends Commands {
  constructor(name: string, machineDescription: string, format: unknown) {
    super(name, machineDescription, format);
  }

  async execute(params: { args: string[] }) {
    const { args } = params;

    process.chdir('./' + args[0]);
    return { ok: true, message: null };
  }

  static create() {
    return new ChangeDirectoryCommand(
      'CHANGE_DIR',
      'Changes directory',
      '["arg_name_of_directory"]',
    );
  }
}

export const changeDirectoryCommandHandler = ChangeDirectoryCommand.create();

export const createDirectoryCommandHandler = GenerateBashCommand.create(
  'CREATE_DIR',
  'Creates a new file in current working directory',
  'mkdir <arg>',
  '["arg_name_of_directory"]',
);
export const removeDirectoryCommandHandler = GenerateBashCommand.create(
  'REMOVE_DIR',
  'Recursively removes a Directory',
  'rm -rf <arg>',
  '["arg_name_of_directory"]',
);
export const makeFileCommandHandler = GenerateBashCommand.create(
  'MAKE_FILE',
  'Creates a new file',
  'touch <arg>',
  '["arg_name_of_file"]',
);
export const deleteFileCommandHandler = GenerateBashCommand.create(
  'DELETE_FILE',
  'Deletes a file',
  'rm <arg>',
  '["arg_name_of_file"]',
);
export const readFileCommandHandler = GenerateBashCommand.create(
  'READ_FILE',
  'Reads a file',
  'cat <arg>',
  '["arg_name_of_file"]',
);
export const writeToFileCommandHandler = GenerateBashCommand.create(
  'WRITE_TO_FILE',
  'Writes to a new file',
  'echo "<arg>" > <arg>',
  '["arg_content","arg_name_of_file"]',
);
export const appendToFileCommandHandler = GenerateBashCommand.create(
  'APPEND_FILE',
  'Appends a file',
  'echo "<arg>" >> <arg>',
  '["arg_content","arg_name_of_file"]',
);
