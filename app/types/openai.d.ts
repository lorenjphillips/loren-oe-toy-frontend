declare module 'openai' {
  interface OpenAIConfig {
    apiKey: string;
    organization?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
  }

  interface ChatCompletionMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
  }

  interface ChatCompletionOptions {
    model: string;
    messages: ChatCompletionMessage[];
    temperature?: number;
    top_p?: number;
    n?: number;
    stream?: boolean;
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    logit_bias?: Record<string, number>;
    user?: string;
    response_format?: { type: string };
  }

  interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }[];
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }

  interface EmbeddingOptions {
    model: string;
    input: string | string[];
    user?: string;
  }

  interface EmbeddingResponse {
    object: string;
    data: {
      object: string;
      embedding: number[];
      index: number;
    }[];
    model: string;
    usage: {
      prompt_tokens: number;
      total_tokens: number;
    };
  }

  class OpenAI {
    constructor(config: OpenAIConfig);
    
    // Chat completions
    chat: {
      completions: {
        create(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
      };
    };
    
    // Embeddings
    embeddings: {
      create(options: EmbeddingOptions): Promise<EmbeddingResponse>;
    };
  }

  export default OpenAI;
} 