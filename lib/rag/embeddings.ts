import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

/**
 * Generate a single embedding for text using OpenAI's text-embedding-3-small model.
 * Returns a 1536-dimensional vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });

  return embedding;
}

/**
 * Generate embeddings for multiple texts in a single batch request.
 * More efficient than calling generateEmbedding multiple times.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  });

  return embeddings;
}

/**
 * Chunk text into smaller pieces for better embedding quality.
 * Splits on paragraphs, then falls back to sentences if too large.
 */
export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If paragraph itself is too large, split by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/\. /);
        let sentenceChunk = '';
        
        for (const sentence of sentences) {
          if ((sentenceChunk + sentence).length <= maxChunkSize) {
            sentenceChunk += (sentenceChunk ? '. ' : '') + sentence;
          } else {
            if (sentenceChunk) {
              chunks.push(sentenceChunk);
            }
            sentenceChunk = sentence;
          }
        }
        
        if (sentenceChunk) {
          chunks.push(sentenceChunk);
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
