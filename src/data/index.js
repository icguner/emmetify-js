import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadSingleTokenNames() {
  const data = readFileSync(join(__dirname, 'single_token_names.json'), 'utf8');
  return JSON.parse(data);
}

export function loadSingleTokenWords() {
  const data = readFileSync(join(__dirname, 'single_token_words.json'), 'utf8');
  return JSON.parse(data);
}