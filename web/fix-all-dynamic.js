import fs from 'fs';
import path from 'path';

const allLayoutsAndPages = [
    ...getFiles('app/admin'),
    ...getFiles('app/mentor'),
    ...getFiles('app/(main)'),
    ...getFiles('app/(auth)'),
    ...getFiles('app/(onboarding)')
];

function getFiles(dir, allFiles = []) {
    if (!fs.existsSync(dir)) return allFiles;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else if (file === 'page.tsx' || file === 'layout.tsx') {
            allFiles.push(name);
        }
    });
    return allFiles;
}

allLayoutsAndPages.forEach(fullPath => {
    let content = fs.readFileSync(fullPath, 'utf8');

    if (content.includes("'use client'")) {
        // Remove it from client components
        if (content.includes("export const dynamic = 'force-dynamic'")) {
            content = content.replace(/export const dynamic = 'force-dynamic';?\n*/g, "");
            fs.writeFileSync(fullPath, content);
            console.log(`Cleaned up client component: ${fullPath}`);
        }
        return;
    }

    // For server components and layouts, ensure it is there if it imports something dynamic
    // Skip sitemap and robots
    if (fullPath.includes('sitemap') || fullPath.includes('robots')) return;
    // Skip mentors as they are ISR
    if (fullPath.endsWith('app/(main)/mentors/page.tsx')) return;
    if (fullPath.endsWith('app/(main)/mentors/[id]/page.tsx')) return;

    if (content.includes("export const dynamic = 'force-dynamic'")) return;

    // Remove "use server" if at top (redundant and sometimes problematic on pages)
    content = content.replace(/^['"]use server['"];?\n*/m, "");

    const hasDirective = content.match(/^['"]use (client|server)['"];?\n*/);
    if (hasDirective) {
        content = content.replace(/^['"]use (client|server)['"];?\n*/, "$&\n\nexport const dynamic = 'force-dynamic';\n\n");
    } else {
        content = "export const dynamic = 'force-dynamic';\n\n" + content;
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Updated server component/layout: ${fullPath}`);
});
