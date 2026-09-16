import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { CourseModule, Topic, Subtopic } from "@/components/CourseBuilder";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${
    pdfjsLib.version || "4.10.38"
  }/pdf.worker.min.mjs`;
}

/**
 * Extracts raw text from PDF files using pure JavaScript (pdfjs-dist)
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const textPages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item: any) => item.str || "")
      .filter((s: string) => s.trim().length > 0);
    textPages.push(pageStrings.join(" "));
  }

  return textPages.join("\n\n");
}

/**
 * Extracts raw text from Word documents (.docx) using pure JavaScript (mammoth)
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extracts raw text from plain text or Markdown files (.txt, .md)
 */
export async function extractTextFromPlainText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = () => reject(new Error("Failed to read text file"));
    reader.readAsText(file);
  });
}

/**
 * Universal document reader supporting PDF, DOCX, DOC, TXT, and MD files in pure JS
 */
export async function extractTextFromDocument(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf" || file.type === "application/pdf") {
    return extractTextFromPdf(file);
  }
  if (
    ext === "docx" ||
    ext === "doc" ||
    file.type.includes("wordprocessingml") ||
    file.type.includes("msword")
  ) {
    return extractTextFromDocx(file);
  }
  return extractTextFromPlainText(file);
}

/**
 * Determines subtopic lesson type from title / content keywords
 */
function inferLessonType(text: string): "Video" | "Article" | "Quiz" | "Assignment" {
  const lower = text.toLowerCase();
  if (
    lower.includes("quiz") ||
    lower.includes("test") ||
    lower.includes("assessment") ||
    lower.includes("mcq") ||
    lower.includes("exam")
  ) {
    return "Quiz";
  }
  if (
    lower.includes("assignment") ||
    lower.includes("project") ||
    lower.includes("exercise") ||
    lower.includes("homework") ||
    lower.includes("challenge") ||
    lower.includes("lab") ||
    lower.includes("hands-on")
  ) {
    return "Assignment";
  }
  if (
    lower.includes("article") ||
    lower.includes("reading") ||
    lower.includes("notes") ||
    lower.includes("cheatsheet") ||
    lower.includes("documentation") ||
    lower.includes("guide") ||
    lower.includes("summary")
  ) {
    return "Article";
  }
  return "Video";
}

/**
 * Extracts or assigns reasonable duration for a subtopic
 */
function extractDuration(text: string): string {
  // Matches patterns like "15 mins", "10m", "45 min", "1 hr", "1.5 hours"
  const durationMatch = text.match(
    /\b(\d+(?:\.\d+)?)\s*(?:mins?|minutes?|m|hrs?|hours?)\b/i
  );
  if (durationMatch) {
    const raw = durationMatch[0].toLowerCase();
    if (raw.includes("h") || raw.includes("hour")) {
      return `${durationMatch[1]} hr`;
    }
    return `${durationMatch[1]} mins`;
  }
  // Default durations based on type
  const type = inferLessonType(text);
  if (type === "Quiz") return "15 mins";
  if (type === "Assignment") return "45 mins";
  if (type === "Article") return "10 mins";
  return "20 mins";
}

/**
 * Clean up title text by removing bullet markers, numbers, and duration prefixes
 */
function cleanTitle(text: string): string {
  return text
    .replace(/^[\s\-\*\•\–\—\d\.\:\)\(]+/, "") // remove leading bullets/numbers
    .replace(/\s*[\(\[]\s*\d+\s*(?:mins?|minutes?|m|hrs?|hours?)\s*[\)\]]/gi, "") // remove embedded duration
    .replace(/\s*[\(\[]\s*(?:video|quiz|assignment|article|reading|lab)\s*[\)\]]/gi, "") // remove type tags
    .trim();
}

/**
 * Intelligent pure JS parser that converts raw syllabus text into structured
 * Modules -> Topics -> Subtopics hierarchy
 */
export function parseSyllabusText(rawText: string): CourseModule[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const modules: CourseModule[] = [];
  let currentModule: CourseModule | null = null;
  let currentTopic: Topic | null = null;

  const moduleRegex =
    /^(?:module|chapter|unit|section|week|part|phase)\s*(\d+|[ivxlcdm]+)[\s\:\.\-–—]+(.+)/i;
  const simpleModuleRegex = /^(?:module|chapter|unit|week|part)\s*(\d+|[ivxlcdm]+)$/i;
  const markdownModuleRegex = /^#\s+(.+)/;

  const topicRegex = /^(?:topic|day|session|lecture)\s*(\d+|[ivxlcdm]+)[\s\:\.\-–—]+(.+)/i;
  const numberedTopicRegex = /^(\d+\.\d+)\s*[\:\.\-–—]?\s*(.+)/;
  const markdownTopicRegex = /^##\s+(.+)/;

  const subtopicRegex = /^[\-\*\•\–\—]\s+(.+)/;
  const numberedSubtopicRegex = /^(\d+\.\d+\.\d+|\([a-z\d]\)|[a-z]\))\s*[\:\.\-–—]?\s*(.+)/i;
  const markdownSubtopicRegex = /^###\s+(.+)/;

  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    // 1. Check if line is a Module Header
    let modTitle = "";
    if (markdownModuleRegex.test(line)) {
      modTitle = line.replace(/^#\s+/, "").trim();
    } else if (moduleRegex.test(line)) {
      const match = line.match(moduleRegex);
      modTitle = match ? `Module ${match[1]}: ${cleanTitle(match[2])}` : line;
    } else if (simpleModuleRegex.test(line)) {
      const nextLine = lines[lineIndex + 1];
      if (nextLine && !moduleRegex.test(nextLine) && !markdownModuleRegex.test(nextLine)) {
        modTitle = `${line}: ${cleanTitle(nextLine)}`;
        lineIndex++;
      } else {
        modTitle = line;
      }
    }

    if (modTitle) {
      currentTopic = null;
      currentModule = {
        id: `mod_${Date.now()}_${modules.length + 1}`,
        title: modTitle,
        description: "",
        topics: [],
      };
      modules.push(currentModule);
      lineIndex++;
      continue;
    }

    // Ensure a current module exists
    if (!currentModule) {
      currentModule = {
        id: `mod_${Date.now()}_1`,
        title: "Module 1: Course Fundamentals",
        description: "",
        topics: [],
      };
      modules.push(currentModule);
    }

    // 2. Check if line is a Topic Header
    let topTitle = "";
    if (markdownTopicRegex.test(line)) {
      topTitle = line.replace(/^##\s+/, "").trim();
    } else if (topicRegex.test(line)) {
      const match = line.match(topicRegex);
      topTitle = match ? `Topic: ${cleanTitle(match[2])}` : cleanTitle(line);
    } else if (numberedTopicRegex.test(line)) {
      const match = line.match(numberedTopicRegex);
      topTitle = match ? `${match[1]} ${cleanTitle(match[2])}` : cleanTitle(line);
    }

    if (topTitle) {
      currentTopic = {
        id: `top_${Date.now()}_${currentModule.topics.length + 1}`,
        title: topTitle,
        subtopics: [],
      };
      currentModule.topics.push(currentTopic);
      lineIndex++;
      continue;
    }

    // Ensure a current topic exists within current module
    if (!currentTopic) {
      currentTopic = {
        id: `top_${Date.now()}_${currentModule.topics.length + 1}`,
        title: `Core Concepts & Overview`,
        subtopics: [],
      };
      currentModule.topics.push(currentTopic);
    }

    // 3. Check if line is a Subtopic / Lesson item
    let subTitle = "";
    if (markdownSubtopicRegex.test(line)) {
      subTitle = line.replace(/^###\s+/, "").trim();
    } else if (subtopicRegex.test(line)) {
      subTitle = line.replace(/^[\-\*\•\–\—]\s+/, "").trim();
    } else if (numberedSubtopicRegex.test(line)) {
      const match = line.match(numberedSubtopicRegex);
      subTitle = match ? match[2].trim() : line;
    } else if (line.length < 80) {
      // Fallback for short single-line items
      subTitle = line;
    }

    if (subTitle && subTitle.length > 2) {
      const cleaned = cleanTitle(subTitle);
      if (cleaned) {
        const type = inferLessonType(subTitle);
        const duration = extractDuration(subTitle);

        const newSubtopic: Subtopic = {
          id: `sub_${Date.now()}_${currentTopic.subtopics.length + 1}`,
          title: cleaned,
          type,
          duration,
        };
        currentTopic.subtopics.push(newSubtopic);
      }
    }

    lineIndex++;
  }

  // Post-processing cleanup:
  // Ensure every module has at least one topic, and every topic has at least one subtopic
  return modules
    .filter((mod) => mod.title.trim().length > 0)
    .map((mod, mIdx) => {
      let topics = mod.topics;
      if (topics.length === 0) {
        topics = [
          {
            id: `top_${Date.now()}_${mIdx}_1`,
            title: `Introduction to ${cleanTitle(mod.title)}`,
            subtopics: [
              {
                id: `sub_${Date.now()}_${mIdx}_1_1`,
                title: "Concept Overview & Setup",
                type: "Video",
                duration: "15 mins",
              },
              {
                id: `sub_${Date.now()}_${mIdx}_1_2`,
                title: "Practical Walkthrough & Examples",
                type: "Video",
                duration: "25 mins",
              },
              {
                id: `sub_${Date.now()}_${mIdx}_1_3`,
                title: "Knowledge Check & Quiz",
                type: "Quiz",
                duration: "15 mins",
              },
            ],
          },
        ];
      } else {
        topics = topics.map((t, tIdx) => {
          let subtopics = t.subtopics;
          if (subtopics.length === 0) {
            subtopics = [
              {
                id: `sub_${Date.now()}_${mIdx}_${tIdx}_1`,
                title: `${cleanTitle(t.title)} - Deep Dive`,
                type: "Video",
                duration: "20 mins",
              },
              {
                id: `sub_${Date.now()}_${mIdx}_${tIdx}_2`,
                title: `${cleanTitle(t.title)} - Hands-on Practice`,
                type: "Assignment",
                duration: "30 mins",
              },
            ];
          }
          return { ...t, subtopics };
        });
      }
      return { ...mod, topics };
    });
}
