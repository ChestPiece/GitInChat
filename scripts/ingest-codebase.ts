const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error("Missing environment variables. Check .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Manual recursive file walker
async function getAllFiles(dirPath, arrayOfFiles) {
  const files = await fs.promises.readdir(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
       if (!["node_modules", ".git", ".next", "dist", "build", "coverage", ".agent"].includes(file)) {
          arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
       }
    } else {
       if (/\.(ts|tsx|md|sql)$/.test(file)) {
          arrayOfFiles.push(fullPath);
       }
    }
  }
  return arrayOfFiles;
}

async function ingestFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip large files or generated code
    if (content.length > 50000 || relativePath.includes('package-lock.json')) {
        console.log(`Skipping large file: ${relativePath}`);
        return;
    }

    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize));
    }

    for (const chunkContent of chunks) {
      if (!chunkContent.trim()) continue;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunkContent.replace(/\n/g, ' '),
      });

      const embedding = embeddingResponse.data[0].embedding;

      const { error } = await supabase.from('documents').insert({
        content: chunkContent,
        metadata: { filePath: relativePath },
        embedding
      });

      if (error) {
        console.error(`Error inserting chunk for ${relativePath}:`, error);
      }
    }
  } catch (err) {
    console.error(`Failed to ingest ${filePath}:`, err);
  }
}

async function main() {
  console.log("Starting codebase ingestion...");
  
  // 1. Clear existing documents
  console.log("Clearing old index...")
  const { error: deleteError } = await supabase.from('documents').delete().neq('id', 0);
  if (deleteError) console.warn("Could not clear old documents:", deleteError.message);

  // 2. Scan files using manual walker
  console.log("Scanning files...");
  const files = await getAllFiles(process.cwd(), []);

  console.log(`Found ${files.length} files to ingest.`);

  // 3. Ingest
  let processed = 0;
  for (const file of files) {
    console.log(`[${processed + 1}/${files.length}] Ingesting: ${path.relative(process.cwd(), file)}`);
    await ingestFile(file);
    processed++;
  }

  console.log("Ingestion complete!");
}

main();
