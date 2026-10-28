import { AlgorithmResumeParser } from "./AlgorithmResumeParser";
import { LLMResumeParser } from "./LLMResumeParser";

export function getResumeParser(): AlgorithmResumeParser | LLMResumeParser {
  if (LLMResumeParser.isEnabled()) {
    return new LLMResumeParser();
  }

  return new AlgorithmResumeParser();
}
