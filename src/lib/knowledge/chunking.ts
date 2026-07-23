export type TextChunk = { content: string; index: number };

const DEFAULT_TARGET_WORDS = 650; // ~700-1000 tokens for typical He/Ar/En text
const DEFAULT_OVERLAP_WORDS = 120;

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Hard-splits a single paragraph that's already bigger than the target chunk
// size on its own (long unbroken text) — otherwise it would never be split.
function splitLongParagraph(paragraph: string, targetWords: number): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (words.length <= targetWords) return [paragraph];

  const parts: string[] = [];
  for (let i = 0; i < words.length; i += targetWords) {
    parts.push(words.slice(i, i + targetWords).join(" "));
  }
  return parts;
}

function overlapTail(text: string, overlapWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= overlapWords) return text;
  return words.slice(-overlapWords).join(" ");
}

export function chunkText(
  rawText: string,
  { targetWords = DEFAULT_TARGET_WORDS, overlapWords = DEFAULT_OVERLAP_WORDS } = {},
): TextChunk[] {
  const paragraphs = splitIntoParagraphs(rawText).flatMap((p) => splitLongParagraph(p, targetWords));
  if (paragraphs.length === 0) return [];

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (current && wordCount(candidate) > targetWords) {
      chunks.push(current);
      const carry = overlapTail(current, overlapWords);
      current = carry ? `${carry}\n\n${paragraph}` : paragraph;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  // Drop trivially small trailing chunks (e.g. just the overlap tail with
  // nothing new) that add noise without useful content.
  return chunks
    .filter((chunk) => wordCount(chunk) >= 15)
    .map((content, index) => ({ content, index }));
}
