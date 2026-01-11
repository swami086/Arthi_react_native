#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const program = new Command();

// Default source path (The "Traycer" Source)
const DEFAULT_SOURCE = '/var/folders/6_/h67pf9zj13s4y22pdqlh0fs00000gn/T/traycer-epics/d969320e-d519-47a7-a258-e04789b8ce0e-Recreate_Traycer_Tickets_on_GitHub_MCP/tickets';

program
    .name('export-traycer-tickets')
    .description('Sync/Export Traycer tickets from local cache to project directory')
    .option('-s, --source <dir>', 'Source directory (Traycer Cache)', DEFAULT_SOURCE)
    .option('-o, --output <dir>', 'Output directory', './tickets')
    .option('-c, --categorize', 'Organize files by category subdirectories', false)
    .option('-d, --delete', 'Delete local files for tickets removed from source', false)
    .option('-v, --verbose', 'Verbose output', false)
    .parse(process.argv);

const options = program.opts();

async function getFileHash(filePath) {
    try {
        const content = await fs.readFile(filePath);
        return crypto.createHash('md5').update(content).digest('hex');
    } catch (e) {
        return null;
    }
}

async function extractCategory(content) {
    // Try to find category in frontmatter
    const match = content.match(/^category:\s*(.+)$/m);
    if (match) return match[1].trim();

    // Try to infer from Title tag in content [Category]
    const titleMatch = content.match(/^title:\s*\[(.*?)\]/m);
    if (titleMatch) return titleMatch[1].trim();

    return 'Uncategorized';
}

async function exportTickets() {
    console.log(`🚀 Syncing tickets from: ${options.source}`);
    console.log(`📁 To Output directory: ${options.output}\n`);

    if (!await fs.pathExists(options.source)) {
        console.error(`❌ Source directory not found: ${options.source}`);
        process.exit(1);
    }

    await fs.ensureDir(options.output);

    // 1. Scan Source
    const sourceFiles = (await fs.readdir(options.source)).filter(f => f.endsWith('.md'));
    const sourceMap = new Map(); // filename -> fullpath

    for (const file of sourceFiles) {
        sourceMap.set(file, path.join(options.source, file));
    }

    // 2. Scan Destination (for updates/deletes)
    const destFiles = [];
    if (await fs.pathExists(options.output)) {
        // Recursive scan if categorized
        async function scanDir(dir) {
            const files = await fs.readdir(dir);
            for (const f of files) {
                const fullPath = path.join(dir, f);
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                    await scanDir(fullPath);
                } else if (f.endsWith('.md') && f !== 'index.md') {
                    destFiles.push({ name: f, path: fullPath });
                }
            }
        }
        await scanDir(options.output);
    }

    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let deleted = 0;

    // 3. Process Sync
    for (const [filename, sourcePath] of sourceMap) {
        const content = await fs.readFile(sourcePath, 'utf8');
        const category = await extractCategory(content);

        // Determine target path
        let targetDir = options.output;
        if (options.categorize) {
            targetDir = path.join(options.output, category);
            await fs.ensureDir(targetDir);
        }
        const targetPath = path.join(targetDir, filename);

        // Check if exists
        const sourceHash = await getFileHash(sourcePath);
        const targetHash = await getFileHash(targetPath);

        if (!targetHash) {
            // Create
            await fs.writeFile(targetPath, content);
            if (options.verbose) console.log(`✅ Created: ${filename}`);
            created++;
        } else if (sourceHash !== targetHash) {
            // Update
            await fs.writeFile(targetPath, content);
            if (options.verbose) console.log(`🔄 Updated: ${filename}`);
            updated++;
        } else {
            unchanged++;
        }
    }

    // 4. Handle Deletes
    if (options.delete) {
        for (const dest of destFiles) {
            if (!sourceMap.has(dest.name)) {
                await fs.remove(dest.path);
                if (options.verbose) console.log(`🗑️  Deleted: ${dest.name}`);
                deleted++;
            }
        }
    }

    // 5. Generate Index
    await generateIndex(sourceMap, options.output);

    console.log(`\n✨ Sync Complete!`);
    console.log(`   📝 Created:   ${created}`);
    console.log(`   🔄 Updated:   ${updated}`);
    console.log(`   ⏭️  Unchanged: ${unchanged}`);
    if (options.delete) console.log(`   🗑️  Deleted:   ${deleted}`);
}

async function generateIndex(sourceMap, outputDir) {
    const categories = {};

    for (const [filename, sourcePath] of sourceMap) {
        const content = await fs.readFile(sourcePath, 'utf8');
        const category = await extractCategory(content);
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        const title = titleMatch ? titleMatch[1].replace(/"/g, '').trim() : filename;

        if (!categories[category]) categories[category] = [];
        categories[category].push({ title, filename });
    }

    let indexContent = `# Project Tickets Index\n\nGenerated: ${new Date().toISOString()}\n\n`;

    for (const cat of Object.keys(categories).sort()) {
        indexContent += `## ${cat}\n\n`;
        for (const item of categories[cat]) {
            indexContent += `- [${item.title}](${encodeURIComponent(item.filename)})\n`;
        }
        indexContent += '\n';
    }

    await fs.writeFile(path.join(outputDir, 'index.md'), indexContent);
}

exportTickets().catch(console.error);
