import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

export class WebSummariser {
  constructor() {}

  async getSummary(url: string, question: string): Promise<string> {
    const content = (await this.getContentInMarkdown(url))
      .split("\n")
      .filter(
        (line) => line.length > 200 && !/^\s*[-#*\[]/.test(line)
      )
    
    // Write summarising system here.
    console.log(content)
    return question
  }

  

  async getContentInMarkdown (url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const turndownService = new TurndownService();
  
      // Remove unwanted elements (noise) from the DOM
      const noiseSelectors = [
        'script',
        'style',
        'noscript',
        'meta',
        'link',
        'nav',
        'footer',
        'header',
        '.ad',
      ];
  
      noiseSelectors.forEach((selector) => {
        const elements = dom.window.document.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      });
  
      // Extract the main content element (change this selector based on the target website structure)
      const mainContentSelector = 'body'; // You can adjust this selector to target a more specific content container
      const mainContent = dom.window.document.querySelector(mainContentSelector);
  
      if (!mainContent) {
        throw new Error(`Main content not found using selector: "${mainContentSelector}"`);
      }
  
      // Convert cleaned HTML to Markdown - as ito is easier to work with
      const markdown = turndownService.turndown(mainContent.innerHTML);
      return markdown;
    } catch (error) {
      console.error(`Error fetching and processing URL "${url}":`, error);
      throw error;
    }
  }
}
