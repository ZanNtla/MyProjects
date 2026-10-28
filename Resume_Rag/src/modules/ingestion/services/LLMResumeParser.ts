export class LLMResumeParser {
  static isEnabled(): boolean {
    return process.env.USE_LLM_PARSER === "true";
  }

  parseResume(_rawText: string): never {
    throw new Error("LLM resume parser is disabled");
  }
}
