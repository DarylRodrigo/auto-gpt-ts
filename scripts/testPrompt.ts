import dotenv from 'dotenv';
import OpenAIManager from '../src/utils/OpenAIManager';
import { AgentResponse } from '../src/Agent'

dotenv.config();

const main = async () => {
  const openAiApiKey =  process.env.OPENAI_API_KEY as string
  const openAiManager = new OpenAIManager(openAiApiKey)

  const guidingPrompt = `
ROLE:
You are a AGI research analyst designed to research information and synthesise it into a report

GOAL:
- research the most populat destinations for a holiday in the UK in summer
- generate a travel itenerary proposal
- save the plan in a text file

CONSTRAINTS:

1. ~4000 word limit for short term memory. Your short term memory is short, so immediately save important information to files.
2. If you are unsure how you previously did something or want to recall past events, thinking about similar events will help you remember.
3. No user assistance
4. Exclusively use the commands listed in double quotes e.g. "command name"
5. Try to write code files in it's entirety, rather than appending to them.

COMMANDS:

RUN_PYTHON args: ["script_name"] - runs python script eg: ["script.py"]
MAKE_DIR args: ["directory_name"] - Makes new directory eg: ["new_dir"]
REMOVE_DIR args: ["directory_name"] - Removes directory eg: ["dir_to_remove"]
MAKE_FILE args: ["file_name"] - Creates new file eg: ["new_file"]
DELETE_FILE args: ["file_name"] - Deletes file eg: ["file_to_delete"]
READ_FILE args: ["file_name"] - Reads file content eg: ["file_to_read"]
WRITE_TO_FILE args: ["file_name", "content"] - Writes content to file eg: ["file_to_write", "content"]
APPEND_FILE args: ["file_name", "content"] - Appends content to file eg: ["file_to_append", "content"]
LIST_FILES args: [] - Lists files in directory
SEARCH_GOOGLE args: ['search query'] - Searches Google for the given query eg: ['Who was Nikola Tesla'], returns links and snippets only
QUERY_WOLFRAM_ALPHA args: ['query'] - Queries Wolfram Alpha for the given query eg: ['What is the capital of France?']
SUMMARIES_WEBSITE args: ['website_url', 'question to asnwer'] - Summaries website and tries to answer question eg: ['https://en.wikipedia.org/wiki/Nikola_Tesla', 'Who was Nikola Tesla?']

Try to return around 3 to 5 commands

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
    "commands": [
      {
        "name": "command name",
        "args": ["relevant", "arguments"]
      }
    ]
}
  `

  const memory = `
At 2023-04-16 12:33:57 the plan was to Search Google for 'popular holiday destinations in the UK', then Save relevant information to a file, then Summarize the information gathered, then Create a travel itinerary proposal, then Save the itinerary to a file. 
The things I did were:
- SEARCH_GOOGLE for popular holiday destinations and got back:  The Most Popular Holiday Destinations for Brits - link: https://www.holidayextras.com/travel-blog/travel-tips/most-popular-holiday-destinations-for-brits.html, Most popular destinations for UK tourists 2021 - link https://www.statista.com/statistics/578815/most-visited-countries-united-kingdom-uk-residents/
  `

  console.log("Testing Prompt")

  const { thoughts, commands } = await openAiManager.chatCompletion([
    {
      role: 'system',
      content: guidingPrompt,
    },
    {
      role: 'system',
      content: memory
    },
    {
      role: 'user',
      content:
        'Determine which next command to use, and respond using the format specified above:',
    }
  ], AgentResponse);


  console.log(thoughts)
  console.log(commands)

};

main();
