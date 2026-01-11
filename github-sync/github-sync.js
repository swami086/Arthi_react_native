#!/usr/bin/env node

const { Command } = require('commander');
const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const {
    loadTickets,
    normalizeTitle,
    generateIssueBody,
    generateLabels,
    delay
} = require('./utils');

// ============================================
// CLI ARGUMENT PARSING
// ============================================

const program = new Command();
program
    .name('github-sync')
    .description('Sync Traycer tickets to GitHub Issues')
    .requiredOption('--token <token>', 'GitHub Personal Access Token')
    .requiredOption('--owner <owner>', 'GitHub repo owner (e.g., swami086)')
    .requiredOption('--repo <repo>', 'GitHub repo name (e.g., Arthi_react_native)')
    .requiredOption('--tickets <file>', 'Path to tickets.json file')
    .option('--dry-run', 'Dry run mode - no API calls', false)
    .option('--force-new', 'Always create new issues, even if they already exist', false)
    .option('--incremental', 'Only sync tickets that have changed since last run', false)
    .option('--batch-size <size>', 'Batch size for processing', '10')
    .option('--delay <ms>', 'Delay between requests (ms)', '200')
    .parse();

const opts = program.opts();

// ============================================
// OCTOKIT INITIALIZATION
// ============================================

function initOctokit(token) {
    return new Octokit({
        auth: token,
        userAgent: 'traycer-github-sync/1.0.0',
        log: {
            debug: () => { },
            info: () => { },
            warn: console.warn,
            error: console.error
        }
    });
}

// ============================================
// FETCH EXISTING ISSUES
// ============================================

async function fetchExistingIssues(octokit, owner, repo, dryRun) {
    if (dryRun) {
        console.log('🔍 DRY-RUN: Skipping fetch of existing issues');
        return [];
    }

    console.log('🔍 Fetching existing Traycer issues from GitHub...');
    const issues = [];
    let page = 1;
    const perPage = 100;

    try {
        while (true) {
            const { data } = await octokit.rest.issues.listForRepo({
                owner,
                repo,
                state: 'all',
                labels: 'traycer-sync',
                per_page: perPage,
                page
            });

            if (data.length === 0) break;
            issues.push(...data);
            console.log(`  Fetched page ${page}: ${data.length} issues`);
            page++;

            // Rate limit check
            await handleRateLimit(octokit);
        }

        console.log(`✅ Fetched ${issues.length} existing Traycer issues\n`);
        return issues;
    } catch (error) {
        console.error('❌ Error fetching issues:', error.message);
        throw error;
    }
}

// ============================================
// BUILD ISSUE MAP
// ============================================

function buildIssueMap(issues) {
    const map = new Map();

    for (const issue of issues) {
        // Extract traycer-id from labels
        const traycerLabel = issue.labels.find(l =>
            typeof l === 'object' ? l.name.startsWith('traycer-id:') : l.startsWith('traycer-id:')
        );

        if (traycerLabel) {
            const labelName = typeof traycerLabel === 'object' ? traycerLabel.name : traycerLabel;
            const ticketId = labelName.split(':')[1];
            map.set(ticketId, issue.number);
        }
    }

    console.log(`📋 Built issue map: ${map.size} tickets already synced\n`);
    return map;
}

// ============================================
// DETECT DUPLICATE
// ============================================

function detectDuplicateByTitle(ticket, issues) {
    const normalizedTitle = normalizeTitle(ticket.title);

    for (const issue of issues) {
        if (normalizeTitle(issue.title) === normalizedTitle) {
            return issue.number;
        }
    }

    return null;
}

// ============================================
// RATE LIMIT HANDLING
// ============================================

async function handleRateLimit(octokit) {
    try {
        const { data } = await octokit.rest.rateLimit.get();
        const remaining = data.rate.remaining;
        const reset = new Date(data.rate.reset * 1000);

        if (remaining < 100) {
            const waitTime = Math.ceil((reset - new Date()) / 1000);
            console.warn(`⚠️  Low rate limit: ${remaining}/5000. Waiting ${waitTime}s until reset...`);
            await delay(waitTime * 1000);
        }
    } catch (error) {
        console.warn('⚠️  Could not check rate limit:', error.message);
    }
}
// ============================================
// STATE MANAGEMENT
// ============================================

const STATE_FILE = '.sync-state.json';

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return fs.readJsonSync(STATE_FILE);
        }
    } catch (e) {
        console.warn('⚠️  Could not load sync state:', e.message);
    }
    return {};
}

function saveState(state) {
    try {
        fs.writeJsonSync(STATE_FILE, state, { spaces: 2 });
    } catch (e) {
        console.error('❌ Could not save sync state:', e.message);
    }
}

function getContentHash(ticket) {
    const content = generateIssueBody(ticket) + JSON.stringify(generateLabels(ticket)) + ticket.title;
    return crypto.createHash('md5').update(content).digest('hex');
}

// ============================================
// SYNC SINGLE TICKET
// ============================================

async function syncSingleTicket(ticket, issueMap, issues, octokit, owner, repo, dryRun, delayMs, state) {
    const ticketId = ticket.id;
    const currentHash = getContentHash(ticket);

    // Check Incremental State
    if (opts.incremental && state && state[ticketId] === currentHash) {
        // Double check it exists in the issue map (it might be in state but deleted from GitHub manually)
        if (issueMap.has(ticketId)) {
            return { ticketId, action: 'unchanged' };
        }
    }

    // 1. Check traycer-id map (primary method)
    let issueNumber = opts.forceNew ? null : issueMap.get(ticketId);

    // 2. Fallback: exact title match
    if (!issueNumber && !opts.forceNew) {
        issueNumber = detectDuplicateByTitle(ticket, issues);
    }

    const body = generateIssueBody(ticket);
    const labels = generateLabels(ticket);

    if (dryRun) {
        const action = issueNumber ? `UPDATE #${issueNumber}` : 'CREATE NEW';
        console.log(`🔍 DRY-RUN: ${action} - ${ticket.title}`);
        return {
            ticketId,
            issueNumber,
            action: issueNumber ? 'update' : 'create',
            dryRun: true
        };
    }

    try {
        if (issueNumber) {
            // UPDATE existing issue
            await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: issueNumber,
                title: ticket.title,
                body,
                labels
            });
            console.log(`✅ UPDATED #${issueNumber}: ${ticket.title}`);
            if (state) state[ticketId] = currentHash; // Update state
            return { ticketId, issueNumber, action: 'updated' };

        } else {
            // CREATE new issue
            const { data } = await octokit.rest.issues.create({
                owner,
                repo,
                title: ticket.title,
                body,
                labels
            });
            console.log(`✅ CREATED #${data.number}: ${ticket.title}`);
            if (state) state[ticketId] = currentHash; // Update state
            return { ticketId, issueNumber: data.number, action: 'created' };
        }

    } catch (error) {
        // Handle rate limiting with retry
        if (error.status === 429) {
            const retryAfter = error.response?.headers['retry-after'] || 60;
            console.log(`⏳ Rate limited. Waiting ${retryAfter}s...`);
            await delay(retryAfter * 1000);

            // Retry once
            return await syncSingleTicket(ticket, issueMap, issues, octokit, owner, repo, dryRun, delayMs, state);
        }

        // Handle validation errors
        if (error.status === 422) {
            console.log(`⚠️  Validation error - skipping: ${error.message}`);
            return { ticketId, issueNumber, action: 'skipped', reason: 'validation', error: error.message };
        }

        console.error(`❌ ERROR ${ticketId}:`, error.message);
        return { ticketId, issueNumber, action: 'error', error: error.message };
    } finally {
        // Delay between requests
        await delay(delayMs);
    }
}

// ============================================
// BATCH SYNC TICKETS
// ============================================

async function syncTickets(tickets, octokit, owner, repo, dryRun, batchSize, delayMs) {
    const existingIssues = await fetchExistingIssues(octokit, owner, repo, dryRun);
    const issueMap = buildIssueMap(existingIssues);

    // Load state for incremental sync
    let state = opts.incremental ? loadState() : null;
    if (opts.incremental) {
        console.log('🔄 Incremental sync enabled. Checking for changes...');
    }

    const results = [];
    const totalBatches = Math.ceil(tickets.length / batchSize);

    for (let i = 0; i < tickets.length; i += batchSize) {
        const batch = tickets.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;

        console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (${batch.length} tickets)`);
        console.log('─'.repeat(60));

        for (const ticket of batch) {
            const result = await syncSingleTicket(
                ticket,
                issueMap,
                existingIssues,
                octokit,
                owner,
                repo,
                dryRun,
                delayMs,
                state
            );

            // Log unchanged (verbose) or just count
            if (result.action === 'unchanged') {
                // process.stdout.write('.'); // Minimal output for skipped
            }
            results.push(result);

            // Rate limit check every 10 tickets
            if ((i + batch.indexOf(ticket)) % 10 === 0 && !dryRun) {
                await handleRateLimit(octokit);
            }
        }

        // Delay between batches
        if (i + batchSize < tickets.length) {
            const batchDelay = delayMs * 5;
            console.log(`⏳ Waiting ${batchDelay}ms between batches...`);
            await delay(batchDelay);
        }
    }

    if (state && !dryRun) {
        saveState(state);
        console.log('💾 Sync state saved.');
    }

    return results;
}

// ============================================
// GENERATE REPORT
// ============================================

function generateReport(results) {
    const stats = {
        total: results.length,
        created: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length,
        unchanged: results.filter(r => r.action === 'unchanged').length,
        skipped: results.filter(r => r.action === 'skipped').length,
        errors: results.filter(r => r.action === 'error').length,
        dryRun: results[0]?.dryRun || false
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC REPORT');
    console.log('='.repeat(60));
    console.log(`Total tickets:    ${stats.total}`);
    console.log(`✅ Created:       ${stats.created}`);
    console.log(`🔄 Updated:       ${stats.updated}`);
    console.log(`💤 Unchanged:     ${stats.unchanged}`);
    console.log(`⏭️  Skipped:       ${stats.skipped}`);
    console.log(`❌ Errors:        ${stats.errors}`);

    if (stats.dryRun) {
        console.log('\n🔍 DRY-RUN MODE: No actual changes were made');
    }

    if (stats.errors > 0) {
        console.log('\n❌ Errors encountered:');
        results.filter(r => r.action === 'error').forEach(r => {
            console.log(`  • ${r.ticketId}: ${r.error}`);
        });
    }

    console.log('='.repeat(60));
    console.log('✅ Sync complete!\n');

    return stats;
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
    try {
        console.log('\n🚀 Traycer → GitHub Sync Script');
        console.log('='.repeat(60));

        // Load tickets
        const tickets = loadTickets(opts.tickets);

        if (tickets.length === 0) {
            console.log('⚠️  No tickets to sync.');
            return;
        }

        // Initialize Octokit
        const octokit = initOctokit(opts.token);

        console.log(`📦 Repository:    ${opts.owner}/${opts.repo}`);
        console.log(`📋 Tickets:       ${tickets.length}`);
        console.log(`🔍 Mode:          ${opts.dryRun ? 'DRY-RUN' : 'LIVE'}`);
        console.log(`⚙️  Batch size:    ${opts.batchSize}`);
        console.log(`⏱️  Delay:         ${opts.delay}ms`);
        console.log('='.repeat(60) + '\n');

        // Sync tickets
        const results = await syncTickets(
            tickets,
            octokit,
            opts.owner,
            opts.repo,
            opts.dryRun,
            parseInt(opts.batchSize),
            parseInt(opts.delay)
        );

        // Generate report
        generateReport(results);

    } catch (error) {
        console.error('\n💥 Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// ============================================
// ERROR HANDLERS
// ============================================

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// ============================================
// RUN
// ============================================

main();
