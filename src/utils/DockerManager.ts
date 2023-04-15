import Docker from 'dockerode'
import { Duplex } from 'stream'
import { TextDecoder } from 'text-encoding-utf-8'



export class DockerManager {
  private docker: Docker
  private container: Docker.Container | undefined

  constructor(readonly containerName = 'python-sandbox') {
    this.docker = new Docker()    
  }

  async setup() {
    if (this.container) { return }
    this.container = await this.connectToPythonContainer(this.containerName)
  }

  containerExec(cmd: string[]) {
    console.log(cmd)
    return new Promise<string>((resolve, reject) => {
      if (!this.container) {
        return reject(new Error('Container is not initialized'))
      }

      this.container.exec(
        {
          AttachStdout: true,
          AttachStderr: true,
          Cmd: cmd,
        },
        (err, exec) => {
          if (err) {
            return reject(err)
          }
  
          if (!exec) {
            return reject(new Error('Failed to create exec instance'));
          }
  
          exec.start({}, (err: Error | null, stdoutStream: Duplex | undefined) => {
            if (err) {
              return reject(err)
            }
  
            if(!stdoutStream) {
              return reject(new Error('Failed to create stdout stream'))
            }
  
            let output = ''
            stdoutStream.on('data', (chunk) => {
              output += chunk
            });
  
            stdoutStream.on('end', () => {
              const message = new TextDecoder('utf-8').decode(Buffer.from(output, 'binary'));
              console.log(message);
              resolve(message);
            });
          })
        }
      )
    })
  }

  private async connectToPythonContainer(containerName: string) {
    try {
      const container = await this.docker.getContainer(containerName).inspect();
      return this.docker.getContainer(container.Id);
    } catch (err) {
      throw new Error(`Failed to connect to the container: ${containerName}`);
    }
  }
  
}
