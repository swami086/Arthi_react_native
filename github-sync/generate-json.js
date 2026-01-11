const fs = require('fs');
const path = require('path');

const ticketsDir = path.join(__dirname, '../tickets');
const outputFilePath = '/Users/swami/Documents/Health_app/Arthi_react_native/github-sync/tickets.json';

function parseMD(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const ticket = {
        id: '',
        title: '',
        status: 'Todo',
        priority: 'Medium',
        wave: null,
        body: ''
    };

    let inFrontmatter = false;
    let hasPassedFrontmatter = false;
    let bodyLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Handle Frontmatter delimiters
        if (line.trim() === '---') {
            if (!hasPassedFrontmatter) {
                inFrontmatter = !inFrontmatter;
                if (!inFrontmatter) {
                    hasPassedFrontmatter = true;
                }
                continue;
            }
        }

        // Parse Frontmatter
        if (inFrontmatter) {
            if (line.startsWith('id:')) ticket.id = line.split(':')[1].trim().replace(/"/g, '');
            if (line.startsWith('title:')) ticket.title = line.split(':').slice(1).join(':').trim().replace(/"/g, '');
            if (line.startsWith('status:')) ticket.status = line.split(':')[1].trim().replace(/"/g, ''); // Basic capture
            if (line.startsWith('priority:')) ticket.priority = line.split(':')[1].trim().replace(/"/g, '');
            continue;
        }

        // Capture Body (skip until we pass frontmatter)
        if (hasPassedFrontmatter) {
            // Skip the first immediate H1 if it looks like the title to avoid duplication
            if (bodyLines.length === 0 && line.trim() === '') continue; // Skip leading whitespace
            if (bodyLines.length === 0 && line.startsWith('# ')) continue; // Skip main title H1

            bodyLines.push(line);
        }
    }

    // Infer wave from content if not found (though body capture preserves it in text, extracting for metadata is still good)
    // We'll scan the bodyLines for metadata we want to lift to top-level properties
    const fullBody = bodyLines.join('\n').trim();
    ticket.body = fullBody;

    // Try to find wave in content text for metadata
    if (fullBody.includes('**Wave ')) {
        const match = fullBody.match(/\*\*Wave (\d+)\*\*/);
        if (match) ticket.wave = parseInt(match[1]);
    }

    // Infer wave from filename if still missing
    const fileName = path.basename(filePath);
    const waveMatch = fileName.match(/Wave_(\d+)/i);
    if (!ticket.wave && waveMatch) {
        ticket.wave = parseInt(waveMatch[1]);
    }

    return ticket;
}

const files = fs.readdirSync(ticketsDir).filter(f => f.endsWith('.md') && !f.includes('untitled'));
const tickets = files.map(file => parseMD(path.join(ticketsDir, file))).filter(t => t.title && t.id);

fs.writeFileSync(outputFilePath, JSON.stringify(tickets, null, 2));
console.log(`Successfully generated tickets.json with ${tickets.length} tickets.`);
