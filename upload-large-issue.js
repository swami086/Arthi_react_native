const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const TOKEN = process.argv[2];
const REPO_OWNER = 'swami086';
const REPO_NAME = 'Arthi_react_native';
const FILE_PATH = '/Users/swami/Documents/Health_app/Master_PRD__AI-Powered_Therapy_Platform_-_TherapyFlow_AI.md';
const TITLE = 'Master PRD: AI-Powered Therapy Platform - TherapyFlow AI';

async function upload() {
    const octokit = new Octokit({ auth: TOKEN });
    const content = fs.readFileSync(FILE_PATH, 'utf8');

    // Split logic
    const LIMIT = 60000; // Safe limit below 65536
    let part1 = content;
    let part2 = '';

    if (content.length > LIMIT) {
        // Find last newline before LIMIT
        const cutOff = content.lastIndexOf('\n', LIMIT);
        if (cutOff === -1) {
            part1 = content.slice(0, LIMIT);
            part2 = content.slice(LIMIT);
        } else {
            part1 = content.slice(0, cutOff);
            part2 = content.slice(cutOff + 1);
        }
    }

    console.log(`Creating issue with ${part1.length} chars...`);
    const issue = await octokit.issues.create({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        title: TITLE,
        body: part1 + (part2 ? '\n\n*(Continued in comments...)*' : '')
    });

    console.log(`✅ Issue created: #${issue.data.number}`);

    if (part2) {
        console.log(`Adding comment with ${part2.length} chars...`);
        await octokit.issues.createComment({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issue.data.number,
            body: part2
        });
        console.log('✅ Comment added.');
    }
}

upload().catch(console.error);
