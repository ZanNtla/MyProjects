import { detectSkills } from "../../../config/skills";
import { extractEmail, extractExperienceYears, extractPhone } from "../utils/regex";

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  role?: string;
  education?: string;
  totalExperience?: number;
  relevantExperience?: number;
  skills: string[];
  jobTitles?: string[];
  experienceSummary?: string;
}

export class AlgorithmResumeParser {
  parseResume(rawText: string): ParsedResume {
    const text = rawText.trim();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const name = lines[0] ?? undefined;
    const role = lines[1] ?? undefined;
    const company = this.extractCompany(lines, text);
    const email = extractEmail(text) ?? undefined;
    const phone = extractPhone(text) ?? undefined;
    const education = this.extractEducation(lines, text);
    const totalExperience = extractExperienceYears(text) ?? undefined;
    const skills = detectSkills(text);

    return {
      name,
      email,
      phone,
      company,
      role,
      education,
      totalExperience,
      skills,
      jobTitles: role ? [role] : undefined,
      experienceSummary: this.buildExperienceSummary(text, totalExperience),
    };
  }

  private extractCompany(lines: string[], text: string): string | undefined {
    const companyLine = lines.find((line, index) => {
      if (index < 2) {
        return false;
      }

      const normalized = line.replace(/[;:]+$/g, "").trim();
      if (!normalized || /^(Email|Phone|Contact|Address|Location|B\.Tech|Bachelor|Master|M\.Tech|MBA|BE|B\.E|Diploma|Education)/i.test(normalized)) {
        return false;
      }

      return /private limited|pvt ltd|llp|limited|technologies|solutions|inc|company|private/i.test(normalized);
    });

    if (companyLine) {
      return companyLine;
    }

    const companyPatterns = [
      /(?:at|with|from)\s+([A-Z][A-Za-z0-9&.,()\-\s]+(?:Private Limited|Pvt Ltd|LLP|Inc|Ltd|Limited|Technologies|Solutions)?)\.?/i,
      /(?:^|\n)([A-Z][A-Za-z0-9&.,()\-\s]+(?:Private Limited|Pvt Ltd|LLP|Inc|Ltd|Limited|Technologies|Solutions)?)\.?\s*(?=\n|$)/i,
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      const candidate = match?.[1]?.trim();
      if (candidate && !/^(Email|Phone|Contact|Address|Location)/i.test(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  private extractEducation(lines: string[], text: string): string | undefined {
    const educationLine = lines.find((line) => /B\.Tech|Bachelor|Master|M\.Tech|MBA|BE|B\.E|Diploma|Education|College|University/i.test(line));
    if (educationLine) {
      return educationLine;
    }

    const match = text.match(/([A-Z][A-Za-z0-9.\-\s]+(?:B\.Tech|Bachelor|Master|M\.Tech|MBA|BE|B\.E|Diploma)[A-Za-z0-9.\-\s]*)/i);
    return match?.[0]?.trim() ?? undefined;
  }

  private buildExperienceSummary(text: string, totalExperience?: number): string | undefined {
    if (!totalExperience) {
      return undefined;
    }

    const skillSummary = detectSkills(text).slice(0, 5).join(", ");
    return `Experience of ${totalExperience} years with focus on ${skillSummary || "resume quality and automation"}.`;
  }
}
