import * as fs from 'fs';
import * as path from 'path';

async function updateTerminal() {
  const now = new Date();
  
  // Format dynamic dates
  const dateStrShort = now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' UTC';

  // Generate terminal.svg from template
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
    process.exit(1);
  }
}

updateTerminal().catch((err) => {
  console.error('Failed to run updates:', err);
  process.exit(1);
});
