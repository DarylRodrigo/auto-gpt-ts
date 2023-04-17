import { DockerManager } from '../utils/DockerManager';
import { CommandBus } from '../infra/CommandBus';
import { CommandResult } from '../infra/Commands';
import { CodeFileEditor } from './utils/CodeFileEditor';

export class CodeEditingCommandHandler {
  private fileEditor: CodeFileEditor;

  constructor(dockerManager: DockerManager) {
    this.fileEditor = new CodeFileEditor(dockerManager);
  }

  async removeLines(filePath: string, startLine: number, endLine: number): Promise<CommandResult> {
    await this.fileEditor.openFile(filePath);
    this.fileEditor.removeLines(startLine, endLine);
    await this.fileEditor.saveFile(filePath);
    return { ok: true, message: `Lines ${startLine}-${endLine} removed from ${filePath}` };
  }

  async replaceLine(filePath: string, lineNumber: number, newLine: string): Promise<CommandResult> {
    await this.fileEditor.openFile(filePath);
    this.fileEditor.replaceLineByNumber(lineNumber, newLine);
    await this.fileEditor.saveFile(filePath);
    return { ok: true, message: `Line replaced in ${filePath}` };
  }

  async addLines(filePath: string, lineNumber: number, newLines: string): Promise<CommandResult> {
    await this.fileEditor.openFile(filePath);
    this.fileEditor.addLines(lineNumber, newLines);
    await this.fileEditor.saveFile(filePath);
    return { ok: true, message: `Lines added after line ${lineNumber} in ${filePath}` };
  }

  registerTo(commandBus: CommandBus) {
    commandBus.registerCommand(
      'REMOVE_LINES',
      'Removes lines in the given range from the specified file, line numbers indexed at 0',
      "['file_path', startLine, endLine]",
      async (args) => await this.removeLines(args[0], parseInt(args[1]), parseInt(args[2]))
    );

    commandBus.registerCommand(
      'REPLACE_LINE',
      'Replaces a specific line in the given file - eg: ["script.py", 2, "a = 1"]',
      "['file_path', line_num, 'newLine']",
      async (args) => await this.replaceLine(args[0], parseInt(args[1]), args[2])
    );

    commandBus.registerCommand(
      'ADD_LINES',
      'Inserts new lines after a specific line number in the given file',
      "['file_path', lineNumber, 'newLines']",
      async (args) => await this.addLines(args[0], parseInt(args[1]), args[2])
    );
  }
}
