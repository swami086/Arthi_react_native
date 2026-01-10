const https = require('https');

const ACCESS_TOKEN = process.env.ROLLBAR_POST_SERVER_ITEM_TOKEN;
const ENVIRONMENT = process.env.ROLLBAR_ENVIRONMENT || 'production';
const REVISION = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
const USERNAME = process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || 'Vercel';

if (!ACCESS_TOKEN) {
    console.warn('ROLLBAR_POST_SERVER_ITEM_TOKEN is not set. Skipping Rollbar deploy notification.');
    process.exit(0);
}

const data = JSON.stringify({
    access_token: ACCESS_TOKEN,
    environment: ENVIRONMENT,
    revision: REVISION,
    local_username: USERNAME,
    comment: 'Deploy from Vercel',
});

const options = {
    hostname: 'api.rollbar.com',
    port: 443,
    path: '/api/1/deploy/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
    },
};

const req = https.request(options, (res) => {
    console.log(`Rollbar deploy notification status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error notifying Rollbar of deploy:', error);
});

req.write(data);
req.end();
