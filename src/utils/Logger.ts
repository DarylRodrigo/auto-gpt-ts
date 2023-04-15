import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { MemoryBlock } from "../infra/Memories"

class Logger {
  private logPath: string

  constructor(root: string) {
    this.logPath = path.join('logs', root)
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true })
    }
  }

  saveThought(thought: MemoryBlock): void {
    const memoryYaml = yaml.dump(thought)
    const filePath = path.join(this.logPath, 'memory.yaml')
    fs.writeFileSync(filePath, memoryYaml, { encoding: 'utf-8' })
  }

  log(msg: string): void {
    console.log(msg)
  }
}

export default Logger
