import * as fs from 'fs'
import * as path from 'path'

class Logger {
  private logPath: string

  constructor(root: string) {
    this.logPath = path.join('logs', root)
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true })
    }
  }

  saveThought(thought: string): void {
    const filePath = path.join(this.logPath, 'memory.yaml')
    fs.writeFileSync(filePath, `${thought} \n\n`, { encoding: 'utf-8' })
  }

  log(msg: string): void {
    console.log(msg)
  }
}

export default Logger
