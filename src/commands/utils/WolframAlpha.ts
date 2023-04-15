import axios, { AxiosError } from "axios";

export class WolframAlpha {
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }

  async query(query: string): Promise<string> {
    const url = `http://api.wolframalpha.com/v1/result?appid=${this.appId}&i=${encodeURIComponent(query)}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.status === 501) {
        return "No results found";
      } else {
        throw error;
      }
    }
  }
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}
