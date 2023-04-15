import axios, { AxiosInstance } from 'axios';

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

  async chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
    const request: ChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
    };

    const response = await this.axiosInstance.post<ChatCompletionResponse>(
      'chat/completions',
      request,
    );

    return response.data.choices[0].message.content;
  }
}

export default OpenAiManager;
