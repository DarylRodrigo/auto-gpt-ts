import axios, { AxiosInstance } from 'axios';
import { Runtype } from 'runtypes';

interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  n?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

class OpenAiManager {
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.openai.com/v1/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async chatCompletion<T>(messages: Array<{ role: string; content: string }>, record: Runtype<T>) {
    const RETRIES = 3
    for (let i = 0 ; i < RETRIES ; i++) {
      try {
        const request: ChatCompletionRequest = {
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
        };
    
        const completion = await this.axiosInstance.post<ChatCompletionResponse>(
          'chat/completions',
          request,
        );

        // Validate correct response format
        const content = completion.data.choices[0].message.content
        return record.check(JSON.parse(content));
      } catch (e) {
        console.log("Failed to get valid JSON response from OpenAI - trying again...")
      }
    }

    throw new Error("Failed to get valid JSON response from OpenAI")
    
  }
}

export default OpenAiManager;
