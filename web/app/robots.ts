import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safespace.app';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/_next/',
                '/therapist/home/',
                '/patient/dashboard/',
                '/private/',
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
