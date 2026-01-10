import { type Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Organization schema for root layout
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SafeSpace',
        description: 'Mental health support platform connecting patients with certified life coaches',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://safespace.app',
        logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://safespace.app'}/logo.png`,
        sameAs: [
            // Social media links
            'https://twitter.com/safespace',
            'https://linkedin.com/company/safespace',
            'https://instagram.com/safespace'
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            availableLanguage: ['English', 'Hindi']
        }
    };
}

// Person schema for therapist profiles
export function generateTherapistSchema(therapist: Profile & { avg_rating?: number, total_reviews?: number }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: therapist.full_name,
        image: therapist.avatar_url,
        jobTitle: 'Life Coach',
        description: therapist.bio || 'Certified Life Coach at SafeSpace',
        knowsAbout: (therapist.expertise_areas as string[]) || [],
        worksFor: {
            '@type': 'Organization',
            name: 'SafeSpace'
        },
        aggregateRating: therapist.avg_rating ? {
            '@type': 'AggregateRating',
            ratingValue: therapist.avg_rating,
            reviewCount: therapist.total_reviews
        } : undefined,
        offers: {
            '@type': 'Service',
            serviceType: 'Life Coaching Session',
            provider: { '@id': '#person' },
            areaServed: 'India',
            priceCurrency: 'INR',
            // Add price if available in profile
        }
    };
}

// Service schema for booking pages
export function generateServiceSchema(therapistName: string, serviceName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceName,
        provider: {
            '@type': 'Person',
            name: therapistName
        },
        areaServed: 'India',
        serviceType: 'Mental Health Support'
    };
}
