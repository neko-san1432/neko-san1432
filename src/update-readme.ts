import * as fs from 'fs';
import * as path from 'path';

interface SingleJoke {
  type: 'single';
  joke: string;
}

interface TwoPartJoke {
  type: 'twopart';
  setup: string;
  delivery: string;
}

type JokeResponse = (SingleJoke | TwoPartJoke) & { error: boolean };

async function fetchProgrammingJoke(): Promise<string> {
  try {
    const res = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = (await res.json()) as JokeResponse;
    
    if (data.error) throw new Error('JokeAPI returned error');

    if (data.type === 'single') {
      return data.joke;
    } else {
      return `${data.setup}\n\n*${data.delivery}*`;
    }
  } catch (error) {
    console.error('Error fetching joke:', error);
    return 'Why do programmers wear glasses? Because they can\'t C#! 🤓'; // Fallback
  }
}

async function updateReadmeAndTerminal() {
  const joke = await fetchProgrammingJoke();
  const now = new Date();
  
  // Format dynamic dates
  const dateStrUTC = now.toUTCString();
  const dateStrShort = now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' UTC';

  // 1. Generate terminal.svg from template
  try {
    const templatePath = path.join(process.cwd(), 'src', 'terminal.template.svg');
    const outputPath = path.join(process.cwd(), 'terminal.svg');
    
    if (fs.existsSync(templatePath)) {
      let templateContent = fs.readFileSync(templatePath, 'utf8');
      const updatedTemplate = templateContent.replace('{LAST_SYNC}', dateStrShort);
      fs.writeFileSync(outputPath, updatedTemplate, 'utf8');
      console.log('terminal.svg generated successfully!');
    } else {
      console.error('Terminal template SVG not found!');
    }
  } catch (err) {
    console.error('Failed to generate terminal.svg:', err);
  }

  // 2. Update README.md (Quote and text sync info)
  const dynamicContent = `
### 💡 Daily Tech Byte
> ${joke.replace(/\n/g, '\n> ')}

### 🕒 System Synchronized
- **Uptime:** Active 24/7 (via Actions)
- **Time:** \`${dateStrUTC}\`
`;

  const readmePath = path.join(process.cwd(), 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  const startMarker = '<!-- DYNAMIC_START -->';
  const endMarker = '<!-- DYNAMIC_END -->';

  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find start or end markers in README.md!');
    process.exit(1);
  }

  const updatedContent = 
    readmeContent.substring(0, startIndex + startMarker.length) +
    '\n' +
    dynamicContent.trim() +
    '\n' +
    readmeContent.substring(endIndex);

  fs.writeFileSync(readmePath, updatedContent, 'utf8');
  console.log('README.md updated successfully!');
}

updateReadmeAndTerminal().catch((err) => {
  console.error('Failed to run updates:', err);
  process.exit(1);
});
