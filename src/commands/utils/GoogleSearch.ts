import axios from "axios";

export class GoogleSearch {
  private apiKey: string;
  private searchEngineId: string;

  constructor(apiKey: string, searchEngineId: string) {
    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
  }

  async search(query: string): Promise<string> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const items = response.data.items;

    if (items && items.length > 0) {
      return items.map((item: any) => `${item.title} snippet: ${item.snippet} - link: ${item.link}`).join("\n")
    } else {
      return "No results found";
    }
  }
}
