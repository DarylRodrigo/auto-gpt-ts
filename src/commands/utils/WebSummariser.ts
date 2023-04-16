import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import * as natural from 'natural'
import OpenAiManager from '../../utils/OpenAIManager';
import { Record, Static, String, Number, Boolean } from 'runtypes';

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
    const content = (await this.getContentInMarkdown(url)).split("\n")
    const filtered = content.filter((line) => line.length > 10 && !/^\s*[\[]/.test(line))
    const segments = this.textTiling.textTiling(filtered.join(" "), 30, 5).filter( (segment) => segment.length > 10)

    const analysis = await Promise.all(segments.map((segment) => this.summariseBlock(segment, question)))

    return analysis
      .filter((a) => 
        a.questionAnswered && a.quality > 5 || 
        !a.questionAnswered && a.quality > 7
      )
      .map((a) => a.summary)
  }

  async summariseBlock(content: string, question: string): Promise<GptAnalysis> { 

    const systemPrompt = {
      role: "system",
      content: `
      You are an AGI design to summaries and analyse text and answer questions. 
      If the question cannot be answered using the text please summarize the text. 
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
        
        Please response with JSON
      `
    }

    const completion = await this.openAiManager.chatCompletion([systemPrompt, userPromp])
    console.log(completion)

    const analysis = GptAnalysis.check(JSON.parse(completion));
    return analysis
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
