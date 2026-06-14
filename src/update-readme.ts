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

async function updateReadme() {
  const joke = await fetchProgrammingJoke();
  const dateStr = new Date().toUTCString();

  const dynamicContent = `
### 💡 Daily Tech Byte
> ${joke.replace(/\n/g, '\n> ')}

### 🕒 Profile Updates
- **Last Sync:** \`${dateStr}\`
- **Current Mission:** ⚒️ Forging clean code and blacksmithing digital solutions...
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

updateReadme().catch((err) => {
  console.error('Failed to update README:', err);
  process.exit(1);
});
