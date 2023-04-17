import { DockerManager } from '../../utils/DockerManager';

export class CodeFileEditor {
  private content: string = ""
  constructor(private dockerManager: DockerManager) {}

  async openFile(filepath: string): Promise<void> {
    this.content = (await this.dockerManager.containerExec(["cat", filepath]))
  }

  async saveFile(filepath: string): Promise<void> {
    await this.dockerManager.containerExec(["sh", "-c", `echo '${this.content}' > ${filepath}`]);
  }

  addLines(lineNumber: number, newLines: string): CodeFileEditor {
    const lines = this.content.split('\n');
    if (lineNumber >= 0 && lineNumber <= lines.length) {
      const newLineArray = newLines.split('\n');
      lines.splice(lineNumber, 0, ...newLineArray);
      this.content = lines.join('\n');
    } else {
      throw new Error(`Line number ${lineNumber} is out of bounds.`);
    }

    return this;
  }

  removeLines(startLine: number, endLine: number): CodeFileEditor {
    const lines = this.content.split('\n')
    if (startLine >= 0 && endLine < lines.length) {
      lines.splice(startLine, endLine - startLine + 1);
      this.content = lines.join('\n');
    } else {
      throw new Error(`Line range (${startLine}, ${endLine}) is out of bounds.`);
    }

    return this;
  }

  replaceLineByNumber(lineNumber: number, newLine: string): void {
    const lines = this.content.split('\n');
    if (lineNumber > 0 && lineNumber <= lines.length) {
      lines[lineNumber - 1] = newLine;
      this.content = lines.join('\n');
    } else {
      throw new Error(`Line number ${lineNumber} is out of bounds`);
    }
  }

  getContent(): string {
    return this.content;
  }
}
