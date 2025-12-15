import { pdfjs } from 'react-pdf';

// Configure PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function prepareChunks(text: string, chunkSize: number = 180): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'any', 'if', 'because', 'until'
]);

function extractKeywords(text: string): string[] {
  const cleaned = cleanText(text);
  const words = cleaned.split(/\s+/);
  return words.filter(word => word.length > 2 && !STOPWORDS.has(word));
}

function scoreChunk(chunk: string, keywords: string[]): number {
  const cleanedChunk = cleanText(chunk);
  const chunkWords = new Set(cleanedChunk.split(/\s+/));
  
  let score = 0;
  for (const keyword of keywords) {
    if (chunkWords.has(keyword)) {
      score += 1;
    }
    // Partial match bonus
    for (const word of chunkWords) {
      if (word.includes(keyword) || keyword.includes(word)) {
        score += 0.5;
      }
    }
  }
  
  return score;
}

export function findBestAnswer(question: string, chunks: string[]): string {
  if (chunks.length === 0) {
    return "📄 Please upload a PDF first so I can help answer your questions.";
  }
  
  const keywords = extractKeywords(question);
  
  if (keywords.length === 0) {
    return "🤔 Could you please rephrase your question with more specific terms?";
  }
  
  // Score all chunks and get top 3
  const scoredChunks = chunks
    .map((chunk, index) => ({
      chunk,
      index,
      score: scoreChunk(chunk, keywords)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  if (scoredChunks.length === 0) {
    return `❌ I couldn't find information about "${keywords.slice(0, 3).join(', ')}" in the PDF.\n\n**Suggestions:**\n• Try using different keywords\n• Check if the topic is covered in the document\n• Ask about the main subjects of the PDF`;
  }
  
  // Format the response with proper structure
  const topKeywords = keywords.slice(0, 4).join(', ');
  let response = `## 📖 Answer\n\n**Keywords matched:** ${topKeywords}\n\n---\n\n`;
  
  scoredChunks.forEach((item, idx) => {
    const formattedText = formatChunkText(item.chunk);
    if (scoredChunks.length > 1) {
      response += `### Passage ${idx + 1}\n\n`;
    }
    response += `${formattedText}\n\n`;
  });
  
  response += `---\n\n*Found ${scoredChunks.length} relevant section${scoredChunks.length > 1 ? 's' : ''} in the document.*`;
  
  return response;
}

function formatChunkText(text: string): string {
  // Clean up the text and format it nicely
  let formatted = text
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into sentences for better readability
  const sentences = formatted.match(/[^.!?]+[.!?]+/g) || [formatted];
  
  // Group sentences into logical paragraphs (3-4 sentences each)
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  
  sentences.forEach((sentence, index) => {
    currentParagraph.push(sentence.trim());
    if (currentParagraph.length >= 3 || index === sentences.length - 1) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  });
  
  // Format with bullet points for key information
  if (paragraphs.length === 1) {
    return `> ${paragraphs[0]}`;
  }
  
  return paragraphs.map(p => `• ${p}`).join('\n\n');
}

export function generateChatTitle(pdfName: string): string {
  const baseName = pdfName.replace(/\.pdf$/i, '');
  const truncated = baseName.length > 25 ? baseName.substring(0, 25) + '...' : baseName;
  return truncated;
}
