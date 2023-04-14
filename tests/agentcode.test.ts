// const cca = new CorrectCommandAgent(agentConfig)

//   const incorrectCommand = `
//   {
//     name: 'WRITE_TO_FILE',
//     args: [
//       'def test_add():\n' +
//         '    assert add(2, 3) == 5\n' +
//         '    assert add(-2, 3) == 1\n' +
//         '    assert add(-2, -3) == -5\n' +
//         '\n'
//     ],
//     filename: 'test_calculator.py'
//   }`

//   const a = await cca.execute(incorrectCommand, Object.keys(agent.commands).map(keys => agent.commands[keys]))
//   console.log(a)
