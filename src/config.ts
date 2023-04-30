export const generateGuidingPrompt = (
  directive: string,
  goals: string[],
  commandListInstructions: string[],
): string => {
  const prompt = `
ROLE:
${directive}

GOAL:
${goals.map((goal) => `- ${goal}`).join('\n')}

CONSTRAINTS:
1. No user assistance
2. Exclusively use the commands listed in double quotes e.g. "command name"
3. Try to write code files in it's entirety, rather than appending to them.
4. You cannot run interactive code - so no user inputs in code.

COMMANDS:    

${commandListInstructions.join('\n')}

PERFORMANCE EVALUATION:

1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities. 
2. Constructively self-criticize your big-picture behavior constantly.
3. Reflect on past decisions and strategies to refine your approach.
4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.

You should only respond in JSON format as described below

Response format:
{
    "thoughts":
    {
        "text": "thought",
        "reasoning": "reasoning",
        "plan": ["short", "list that conveys", "long-term plan",
        "criticism": "constructive self-criticism",
        "speak": "thoughts summary to say to user"
    },
    "command": {
      "name": "command name",
      "args": ["relevant", "arguments"]
    }
}
    `;
  return prompt;
};
