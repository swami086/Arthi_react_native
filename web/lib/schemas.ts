import { type Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Organization schema for root layout
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SafeSpace',
        description: 'Mental health support platform connecting mentees with certified life coaches',
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

// Person schema for mentor profiles
export function generateMentorSchema(mentor: Profile & { avg_rating?: number, total_reviews?: number }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: mentor.full_name,
        image: mentor.avatar_url,
        jobTitle: 'Life Coach',
        description: mentor.bio || 'Certified Life Coach at SafeSpace',
        knowsAbout: (mentor.expertise_areas as string[]) || [],
        worksFor: {
            '@type': 'Organization',
            name: 'SafeSpace'
        },
        aggregateRating: mentor.avg_rating ? {
            '@type': 'AggregateRating',
            ratingValue: mentor.avg_rating,
            reviewCount: mentor.total_reviews
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
export function generateServiceSchema(mentorName: string, serviceName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceName,
        provider: {
            '@type': 'Person',
            name: mentorName
        },
        areaServed: 'India',
        serviceType: 'Mental Health Support'
    };
}
