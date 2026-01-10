import fs from 'fs';
import path from 'path';

const files = [
    'app/(onboarding)/onboarding/features/page.tsx',
    'app/(onboarding)/onboarding/safety/page.tsx',
    'app/(onboarding)/onboarding/welcome/page.tsx',
    'app/(auth)/login/page.tsx',
    'app/(auth)/signup/page.tsx'
];

files.forEach(file => {
    const fullPath = path.resolve('/Users/swami/Documents/React_native _Arthi/safespace-web', file);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(/^['"]use server['"];?\n*/m, "");

    if (!content.includes("export const dynamic = 'force-dynamic'")) {
        // Find directove
        const hasDirective = content.match(/^['"]use (client|server)['"];?\n*/);
        if (hasDirective) {
            content = content.replace(/^['"]use (client|server)['"];?\n*/, "$&\n\nexport const dynamic = 'force-dynamic';\n\n");
        } else {
            content = "export const dynamic = 'force-dynamic';\n\n" + content;
        }
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
});
