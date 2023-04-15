import { expect } from "chai"
import { DockerCommandHandler } from "../../src/commands/DockerCommandHandler"
import { CommandBus } from "../../src/infra/CommandBus"
import { DockerManager } from "../../src/utils/DockerManager"

describe('dockerCommandHandler', () => {
  const dockerManager = new DockerManager()
  const dockerCommandHandler = new DockerCommandHandler(dockerManager)
  const commandBus = new CommandBus()
  dockerCommandHandler.registerTo(commandBus)

  beforeEach( async () => {
    await dockerManager.setup()
    
  })

  afterEach( async () => {
    await commandBus.execute("REMOVE_DIR", ["testDir"])
    await commandBus.execute("DELETE_FILE", ["*.txt"])
    await commandBus.execute("DELETE_FILE", ["*.py"])
  })
  
  it("should list files", async () => {
    const res = await commandBus.execute("LIST_FILES", []);
    expect(res.ok).eql(true);
    expect(res.message).to.be.a("string");
  });

  it("should make a directory", async () => {
    const res = await commandBus.execute("MAKE_DIR", ["testDir"]);
    
    const { message: files} = await commandBus.execute("LIST_FILES", []);
    expect(res.ok).eql(true);
    expect(files).to.include("testDir");
  });

  it("should remove a directory", async () => {
    await commandBus.execute("MAKE_DIR", ["testDirToRemove"]);

    const res = await commandBus.execute("REMOVE_DIR", ["testDirToRemove"]);

    const { message: files} = await commandBus.execute("LIST_FILES", []);
    expect(files).to.not.include("testDirToRemove");
    expect(res.ok).eql(true);
  });

  it("should create a file", async () => {
    const res = await commandBus.execute("MAKE_FILE", ["testFile.txt"]);

    const { message: files} = await commandBus.execute("LIST_FILES", []);
    expect(files).to.include("testFile.txt");
    expect(res.ok).eql(true);
  });

  it("should delete a file", async () => {
    await commandBus.execute("MAKE_FILE", ["testFileToDelete.txt"]);

    const res = await commandBus.execute("DELETE_FILE", ["testFileToDelete.txt"]);

    const { message: files} = await commandBus.execute("LIST_FILES", []);
    expect(files).to.not.include("testFileToDelete.txt");
    expect(res.ok).eql(true);
  });

  it("should write and read a file", async () => {
    await commandBus.execute("WRITE_TO_FILE", ["testFileToRead.txt", "Hello, World!"]);
    
    const res = await commandBus.execute("READ_FILE", ["testFileToRead.txt"]);
    
    expect(res.ok).eql(true);
    expect(res.message).to.include("Hello, World!");
  });

  it("should append to a file", async () => {
    await commandBus.execute("DELETE_FILE", ["testFileToAppend.txt"]);
    await commandBus.execute("WRITE_TO_FILE", ["testFileToAppend.txt", "Hello"]);

    const res = await commandBus.execute("APPEND_FILE", ["testFileToAppend.txt", ", World!"]);

    const { message: content} = await commandBus.execute("READ_FILE", ["testFileToAppend.txt"]);
    expect(content).to.include("World!"); 
    expect(res.ok).eql(true);
  });

  it("should run python", async () => {
    await commandBus.execute("DELETE_FILE", ["hello.py"]);
    await commandBus.execute("WRITE_TO_FILE", ["hello.py", `print ("Hello World!")`]);
    
    const res = await commandBus.execute("RUN_PYTHON", ["hello.py"]);
  
    expect(res.ok).eql(true);
    expect(res.message).to.include("Hello World!");
  });

})
