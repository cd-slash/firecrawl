import { createOpenAI } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";
import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { fireworks } from "@ai-sdk/fireworks";
import { deepinfra } from "@ai-sdk/deepinfra";
import { createVertex } from "@ai-sdk/google-vertex";

export type Provider =
  | "openai"
  | "ollama"
  | "anthropic"
  | "groq"
  | "google"
  | "openrouter"
  | "fireworks"
  | "deepinfra"
  | "vertex";

// Default provider - can be overridden via DEFAULT_PROVIDER env var
const defaultProvider: Provider = (process.env.DEFAULT_PROVIDER as Provider) ||
  (process.env.OLLAMA_BASE_URL ? "ollama" : "openai");

// Default models for extraction tasks - configurable via environment variables
export const defaultExtractModel = process.env.EXTRACT_MODEL || "gemini-2.5-pro";
export const defaultExtractProvider: Provider = (process.env.EXTRACT_PROVIDER as Provider) || "vertex";
export const defaultExtractRetryModel = process.env.EXTRACT_RETRY_MODEL || "gemini-2.5-pro";
export const defaultExtractRetryProvider: Provider = (process.env.EXTRACT_RETRY_PROVIDER as Provider) || "google";

// Default models for reranking tasks
export const defaultRerankerModel = process.env.RERANKER_MODEL || defaultExtractModel;
export const defaultRerankerProvider: Provider = (process.env.RERANKER_PROVIDER as Provider) || defaultExtractProvider;
export const defaultRerankerRetryModel = process.env.RERANKER_RETRY_MODEL || defaultExtractRetryModel;
export const defaultRerankerRetryProvider: Provider = (process.env.RERANKER_RETRY_PROVIDER as Provider) || defaultExtractRetryProvider;

// Default models for smart scrape thinking/tool models
export const defaultSmartScrapeThinkingModel = process.env.SMART_SCRAPE_THINKING_MODEL || "gemini-2.5-pro";
export const defaultSmartScrapeThinkingProvider = process.env.SMART_SCRAPE_THINKING_PROVIDER || "vertex";
export const defaultSmartScrapeToolModel = process.env.SMART_SCRAPE_TOOL_MODEL || "gemini-2.0-flash";
export const defaultSmartScrapeToolProvider = process.env.SMART_SCRAPE_TOOL_PROVIDER || "google";

const providerList: Record<Provider, any> = {
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  }), //OPENAI_API_KEY
  ollama: createOllama({
    baseURL: process.env.OLLAMA_BASE_URL,
  }),
  anthropic, //ANTHROPIC_API_KEY
  groq, //GROQ_API_KEY
  google, //GOOGLE_GENERATIVE_AI_API_KEY
  openrouter: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  }),
  fireworks, //FIREWORKS_API_KEY
  deepinfra, //DEEPINFRA_API_KEY
  vertex: createVertex({
    project: process.env.VERTEX_PROJECT || "firecrawl",
    baseURL: process.env.VERTEX_BASE_URL ||
      `https://aiplatform.googleapis.com/v1/projects/${process.env.VERTEX_PROJECT || "firecrawl"}/locations/${process.env.VERTEX_LOCATION || "global"}/publishers/google`,
    location: process.env.VERTEX_LOCATION || "global",
    googleAuthOptions: process.env.VERTEX_CREDENTIALS
      ? {
          credentials: JSON.parse(atob(process.env.VERTEX_CREDENTIALS)),
        }
      : {
          keyFile: process.env.VERTEX_KEY_FILE || "./gke-key.json",
        },
  }),
};

export function getModel(name: string, provider: Provider = defaultProvider) {
  return process.env.MODEL_NAME
    ? providerList[provider](process.env.MODEL_NAME)
    : providerList[provider](name);
}

export function getExtractModel() {
  return getModel(defaultExtractModel, defaultExtractProvider);
}

export function getExtractRetryModel() {
  return getModel(defaultExtractRetryModel, defaultExtractRetryProvider);
}

export function getRerankerModel() {
  return getModel(defaultRerankerModel, defaultRerankerProvider);
}

export function getRerankerRetryModel() {
  return getModel(defaultRerankerRetryModel, defaultRerankerRetryProvider);
}

export function getEmbeddingModel(
  name: string,
  provider: Provider = defaultProvider,
) {
  return process.env.MODEL_EMBEDDING_NAME
    ? providerList[provider].embedding(process.env.MODEL_EMBEDDING_NAME)
    : providerList[provider].embedding(name);
}
