import { Metadata } from 'next';

type MetadataGeneratorParams = {
    title: string;
    description: string;
    path: string;
    image?: string;
    noIndex?: boolean;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://safespace.app';
const SITE_NAME = 'SafeSpace';
const DEFAULT_LOCALE = 'en_IN';

export function generateMetadata({
    title,
    description,
    path,
    image,
    noIndex = false,
}: MetadataGeneratorParams): Metadata {
    const canonicalUrl = `${SITE_URL}${path}`;
    const imageUrl = image || `${SITE_URL}/og-image.jpg`; // Default OG image

    return {
        title: {
            default: `${title} | ${SITE_NAME}`,
            template: `%s | ${SITE_NAME}`,
        },
        description,
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            locale: DEFAULT_LOCALE,
            type: 'website',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ${SITE_NAME}`,
            description,
            images: [imageUrl],
            creator: '@safespace_app', // Replace with actual handle if available
        },
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export function generateNoIndexMetadata(): Metadata {
    return {
        robots: {
            index: false,
            follow: false,
        },
    };
}
