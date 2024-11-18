import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const decodeSpecialCharacters = (str) => {
  return str
      // Handle the specific escape sequences from your data
      .replace(/\\'e1/g, 'á')
      .replace(/\\'e9/g, 'é')
      .replace(/\\'ed/g, 'í')
      .replace(/\\'f3/g, 'ó')
      .replace(/\\'fa/g, 'ú')
      .replace(/\\'f1/g, 'ñ')
      .replace(/\\'bf/g, '¿')
      .replace(/\\'a1/g, '¡')
      .replace(/\\'fc/g, 'ü');
};

const convertCsvToJson = (csvString) => {
  const lines = csvString.split('\n').filter(line => line.trim());

  const flashcards = lines.map(line => {
    try {
      const matches = line.match(/("([^"]*)"|[^,]+)/g);
      if (matches && matches.length >= 5) {
        const [spanish, english, exampleSpanish, exampleEnglish, weekNum] = matches.map(field => {
          // Remove quotes and decode special characters
          const unquoted = field.replace(/^"|"$/g, '').trim();
          return decodeSpecialCharacters(unquoted);
        });

        const week = parseInt(weekNum.replace(/['"]/g, ''));

        return {
          spanish,
          english,
          exampleSpanish,
          exampleEnglish,
          week: isNaN(week) ? 1 : week
        };
      }
    } catch (error) {
      console.error(`Error processing line: ${line}`);
      console.error(error);
    }
    return null;
  }).filter(item => item !== null);

  return JSON.stringify(flashcards, null, 2);
};

try {
  const csvData = fs.readFileSync(path.join(__dirname, '../data/flashcards.csv'), 'utf8');
  const jsonData = convertCsvToJson(csvData);

  const outputDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'flashcards.json');
  fs.writeFileSync(outputPath, jsonData, 'utf8');

  console.log('Successfully converted CSV to JSON!');
  console.log(`Output saved to: ${outputPath}`);
} catch (error) {
  console.error('Error processing CSV file:', error);
  process.exit(1);
}