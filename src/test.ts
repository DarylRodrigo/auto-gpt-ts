import { DockerManager } from './utils/DockerManager';
import dotenv from 'dotenv';
import { CommandBus } from './infra/CommandBus';
import { DockerCommandHandler } from './commands/DockerCommandHandler';

dotenv.config();


const main = async () => {
  const dockerManager = new DockerManager()
  await dockerManager.setup()

  const commandBus = new CommandBus()
  const dockerCommandHandler = new DockerCommandHandler(dockerManager)
  dockerCommandHandler.registerTo(commandBus)

  // let res = await commandBus.execute("RUN_PYTHON", ["/app/hello.py"])
  // console.log(res)
  // res = await commandBus.execute("MAKE_DIR", ["new_dir"])
  // console.log(res)
  // res = await commandBus.execute("LIST_FILES", [])
  // console.log(res)
  await commandBus.execute("WRITE_TO_FILE", ["testFileToWrite.txt", "Hello, World!"]);
};

main();
