module.exports = {
  require: ["ts-node/register/transpile-only", "test/index.ts"],  //"test/env.ts"],
  extension: ["ts"],
  recursive: true,
  exit: true,
}
