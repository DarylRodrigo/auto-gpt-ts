import * as fs from 'fs';

export const makeWorkspace = () => {
  const rootFolder = 'runs';
  if (!fs.existsSync(rootFolder)) {
    fs.mkdirSync(rootFolder);
  }
  process.chdir(rootFolder);

  const runFolder = `run_${new Date().toISOString()}`;
  if (!fs.existsSync(runFolder)) {
    fs.mkdirSync(runFolder);
  }
  process.chdir(runFolder);
};
