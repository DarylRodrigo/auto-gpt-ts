import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import * as natural from 'natural'
import OpenAiManager from '../../utils/OpenAIManager';
import { Record, Static, String, Number, Boolean } from 'runtypes';
import wiki from 'wikijs';

export const GptAnalysis = Record({
  quality: Number,
  summary: String,
  questionAnswered: Boolean,
});
export type GptAnalysis = Static<typeof GptAnalysis>;

export class WebSummariser {
  private textTiling: TextTiling;
  constructor(private openAiManager: OpenAiManager) {
    this.textTiling = new TextTiling()
  }

  async getSummary(url: string, question: string): Promise<string[]> {
    let segments: string[] = []
    if (url.includes("wikipedia.org")) {
      segments = await this.getWikipediaBlocks(url)
    } else {
      const content = await this.getContentInMarkdown(url)
      console.log(content)
      const filtered = content.split("\n").filter((line) => line.length > 10 && !/^\s*[\[]/.test(line))
      console.log(filtered)
      segments = this.textTiling.textTiling(filtered.join(" "), 30, 5).filter( (segment) => segment.length > 10)
    }
    

    const analysis = await Promise.all(segments.map((segment) => this.summariseBlock(segment, question)))
    console.log(analysis)

    return analysis
      .filter((a) => 
        a.questionAnswered && a.quality > 4 || 
        !a.questionAnswered && a.quality > 5
      )
      .map((a) => a.summary)
  }

  async summariseBlock(content: string, question: string): Promise<GptAnalysis> { 

    const systemPrompt = {
      role: "system",
      content: `
      You are an AGI design to summaries and analyse text and answer questions. 
      Please summaries the text in 2 or 3 sentences.
      Also calculate the quality from 0 to 10, quality means how helpful the text is in answering the question. 
      Use the questionAnswered to asses whether the question was answered.

      Please respond with the follow format ONLY

      {
        "quality": 5,
        "summary":"summaries text"
        "questionAnswered": true
      }
      `
    }

    const userPromp = {
      role: "user",
      content: `CONTENT

        ${content}

        QUESTION 
        
        ${question}
        
        Please response with JSON ONLY no additional text
      `
    }

    return await this.openAiManager.chatCompletion([systemPrompt, userPromp], GptAnalysis )
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
        'a',
        'img',
      ];
  
      noiseSelectors.forEach((selector) => {
        const elements = dom.window.document.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      })
      
      dom.window.document
        .querySelectorAll('*')
        .forEach((node) => {
          if (node.nodeType === dom.window.Node.COMMENT_NODE) {
            node.remove();
          }
        })

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

  async getWikipediaBlocks (url: string): Promise<string[]> {
    interface IPage {
      title: string;
      content: string;
      items?: IPage[];
    }

    // Get the page title from the URL and fetch the page content
    const title = decodeURIComponent(url.split('/').pop() || '');
    if (!title) {
      throw new Error('Invalid URL format');
    }
    const page = await wiki().page(title);
    const summary = await page.content() as unknown as IPage[]

    // Filter out unwanted pages - they are just noise
    const content = summary.filter((page) => !["External links", "Further reading", "Notes", "References", "See also"].includes(page.title))
    
    // Flatten the content into a single array of blocks
    const blocks: string[] = []
    content.forEach((page) => {
      if (page.content.length === 0 && page.items) {
        page.items.forEach((item) => {
          blocks.push(`${page.title} : ${item.title} - ${item.content}`)
        })
      } else {
        blocks.push(`${page.title} - ${page.content}`)
      }
    })

    return blocks
  }
}



class TextTiling {
  constructor() {}

  textTiling(text: string, blockSize: number = 10, windowSize: number = 3): string[] {
    const tokens = this.tokenize(text);
    const pseudoSentences = this.createPseudoSentences(tokens, blockSize);
    const similarityScores = pseudoSentences.slice(0, -1).map((ps, i) => this.calculateSimilarity(ps, pseudoSentences[i + 1]));
    const smoothedScores = this.smoothScores(similarityScores, windowSize);
    const valleys = this.findValleys(smoothedScores);

    const segments: string[] = [];
    let start = 0;

    for (const valley of valleys) {
      const segmentTokens = tokens.slice(start, start + valley * blockSize);
      segments.push(segmentTokens.join(' '));
      start += valley * blockSize;
    }

    const lastSegmentTokens = tokens.slice(start);
    segments.push(lastSegmentTokens.join(' '));

    return segments;
  }

  private tokenize(text: string): string[] {
    const tokenizer = new natural.WordTokenizer();
    return tokenizer.tokenize(text);
  }

  private createPseudoSentences(tokens: string[], blockSize: number): string[][] {
    const pseudoSentences: string[][] = [];

    for (let i = 0; i < tokens.length; i += blockSize) {
      pseudoSentences.push(tokens.slice(i, i + blockSize));
    }

    return pseudoSentences;
  }

  private calculateSimilarity(a: string[], b: string[]): number {
    const intersection = a.filter((x) => b.includes(x)).length;
    return intersection / (a.length + b.length - intersection);
  }

  private smoothScores(scores: number[], windowSize: number): number[] {
    const smoothedScores = [];

    for (let i = 0; i < scores.length - windowSize + 1; i++) {
      const windowScores = scores.slice(i, i + windowSize);
      smoothedScores.push(windowScores.reduce((a, b) => a + b, 0) / windowSize);
    }

    return smoothedScores;
  }

  private findValleys(smoothedScores: number[]): number[] {
    const valleys: number[] = [];

    for (let i = 1; i < smoothedScores.length - 1; i++) {
      if (smoothedScores[i] < smoothedScores[i - 1] && smoothedScores[i] < smoothedScores[i + 1]) {
        valleys.push(i);
      }
    }

    return valleys;
  }

  
}
