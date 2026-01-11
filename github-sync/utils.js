const fs = require('fs-extra');

// ============================================
// LOAD TICKETS FROM JSON
// ============================================

function loadTickets(filePath) {
    try {
        console.log(`📂 Loading tickets from: ${filePath}`);
        const data = fs.readJsonSync(filePath);

        if (!Array.isArray(data)) {
            throw new Error('tickets.json must be an array of ticket objects');
        }

        // Validate ticket structure
        for (const ticket of data) {
            if (!ticket.id || !ticket.title) {
                throw new Error(`Invalid ticket: missing id or title - ${JSON.stringify(ticket)}`);
            }
        }

        console.log(`✅ Loaded ${data.length} tickets\n`);
        return data;

    } catch (err) {
        console.error('❌ Failed to load tickets:', err.message);
        process.exit(1);
    }
}

// ============================================
// NORMALIZE TITLE FOR COMPARISON
// ============================================

function normalizeTitle(title) {
    return title
        .trim()
        .toLowerCase()
        .replace(/^\[.*?\]\s*/, '') // Remove [Category] prefix
        .replace(/\s+/g, ' ');       // Normalize whitespace
}

// ============================================
// GENERATE GITHUB ISSUE BODY
// ============================================

function generateIssueBody(ticket) {
    // Description/Content
    const content = ticket.body || '';

    const sections = [content];

    // Wave Reference (if not already in body via some other way, but good to ensure)
    // We can add a footer section

    // Traycer Origin Footer
    sections.push(`
---
## Traycer Origin

- **Ticket ID:** \`${ticket.id}\`
- **Status:** ${ticket.status || 'Todo'}
- **Priority:** ${ticket.priority || 'Medium'}
- **Wave:** ${ticket.wave ? `Wave ${ticket.wave}` : 'N/A'}

*Synced from Traycer Epic: \`d969320e-d519-47a7-a258-e04789b8ce0e\`*
`);

    return sections.join('\n');
}

// ============================================
// GENERATE GITHUB LABELS
// ============================================

function generateLabels(ticket) {
    const labels = [
        'traycer-sync',
        `traycer-id:${ticket.id}`
    ];

    // Extract category from title prefix [Category]
    const categoryMatch = ticket.title.match(/^\[(.*?)\]/);
    if (categoryMatch) {
        const category = categoryMatch[1]
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        labels.push(category);
    }

    // Status label
    if (ticket.status) {
        const status = ticket.status
            .toLowerCase()
            .replace(/\s+/g, '-');
        labels.push(`status-${status}`);
    }

    // Priority label
    if (ticket.priority) {
        const priority = ticket.priority.toLowerCase();
        labels.push(`priority-${priority}`);
    }

    // Wave label
    if (ticket.wave) {
        labels.push(`wave-${ticket.wave}`);
    }

    return labels;
}

// ============================================
// DELAY UTILITY
// ============================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    loadTickets,
    normalizeTitle,
    generateIssueBody,
    generateLabels,
    delay
};
