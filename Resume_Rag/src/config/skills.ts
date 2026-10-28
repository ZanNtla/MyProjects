export const SKILLS = [
  "Java",
  "Selenium",
  "Playwright",
  "API Testing",
  "Postman",
  "SQL",
  "MongoDB",
  "Jenkins",
  "Python",
  "C#",
  "REST Assured",
  "Cucumber",
  "GenAI",
  "Langchain",
  "Langgraph",
  "RAG",
  "Azure DevOps",
  "AWS Lambda",
  "GitHub",
  "DeepEval",
  "MCP (Model Context Protocol)",
  "Core Java",
  "Selenium WebDriver",
  "MCP",
  "Prompt Engineering",
  "React",
  "Node.js",
  "TypeScript",
  "C++",
  ".NET",
];

export function detectSkills(text: string): string[] {
  const normalized = text.toLowerCase();

  return SKILLS.filter((skill) => {
    const skillLower = skill.toLowerCase();
    return normalized.includes(skillLower);
  });
}
