import { expect } from 'chai';
import { CommandBus } from '../../src/infra/CommandBus';
import { DockerCommandHandler } from '../../src/commands/DockerCommandHandler';
import { DockerManager } from '../../src/utils/DockerManager';
import { CodeEditingCommandHandler } from '../../src/commands/CodeEditingCommandHandler';
import OpenAiManager from '../../src/utils/OpenAIManager';

describe('CodeEditingHandler', () => {
  const dockerManager = new DockerManager();
  const openAiManager = new OpenAiManager("fake-keys");
  const dockerCommandHandler = new DockerCommandHandler(dockerManager, openAiManager, { correctCode: false });
  const codeEditingCommandHandler = new CodeEditingCommandHandler(dockerManager);
  const commandBus = new CommandBus();

  dockerCommandHandler.registerTo(commandBus);
  codeEditingCommandHandler.registerTo(commandBus);

  beforeEach(async () => {
    await dockerManager.setup()

    await commandBus.execute('DELETE_FILE', ['testfile.py']);
    await commandBus.execute('WRITE_TO_FILE', [
      'testfile.py',
      'line1\nline2\nline3\nline4\nline5',
    ]);
  });

  afterEach(async () => {
    await commandBus.execute('DELETE_FILE', ['testfile.py']);
  });

  it('should remove lines from a file', async () => {
    await commandBus.execute('REMOVE_LINES', ['testfile.py', '2', '3']);
    const res = await commandBus.execute('READ_FILE', ['testfile.py']);

    expect(res.ok).to.eql(true);
    expect(res.message).to.be.a('string');
    expect(res.message).to.eql('line1\nline2\nline5\n\n');
  });

  it('should replace a line in a file', async () => {
    await commandBus.execute('REPLACE_LINE', ['testfile.py', '2', 'newLine2']);
    const res = await commandBus.execute('READ_FILE', ['testfile.py']);
  
    expect(res.ok).to.eql(true);
    expect(res.message).to.be.a('string');
    expect(res.message).to.eql('line1\nnewLine2\nline3\nline4\nline5\n\n');
  });

  it('should add lines to a file', async () => {
    await commandBus.execute('ADD_LINES', ['testfile.py', '2', 'newLineA\nnewLineB']);
    const res = await commandBus.execute('READ_FILE', ['testfile.py']);

    expect(res.ok).to.eql(true);
    expect(res.message).to.be.a('string');
    expect(res.message).to.eql('line1\nline2\nnewLineA\nnewLineB\nline3\nline4\nline5\n\n');
  });
});
