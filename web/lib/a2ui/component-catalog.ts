/**
 * A2UI Component Catalog
 * 
 * Maps existing TherapyFlow components to A2UI component types.
 * Provides validation schemas and component definitions for the renderer.
 */

import React from 'react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ComponentDefinition, ComponentCatalog, PropSchema } from './types';

// Import existing components
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Input,
    Switch,
    Slider,
    SessionCard,
    TherapistCard,
    AppointmentCard,
    CalendarPicker,
    InterventionCard,
    RiskAlert,
    PatternCard,
    TimeSlotButton
} from '@/components/ui';

import { LineChart, BarChart } from '@/components/charts';

// ============================================================================
// Ajv Setup for Schema Validation
// ============================================================================

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// ============================================================================
// Component Schemas
// ============================================================================

const buttonSchema: PropSchema = {
    type: 'object',
    properties: {
        variant: {
            type: 'string',
            enum: ['primary', 'secondary', 'outline', 'ghost', 'transparent', 'error', 'link'],
        },
        size: {
            type: 'string',
            enum: ['sm', 'md', 'lg', 'icon'],
        },
        isLoading: { type: 'boolean' },
        disabled: { type: 'boolean' },
        children: { type: 'string' },
        onClick: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    additionalProperties: false,
};

const cardSchema: PropSchema = {
    type: 'object',
    properties: {
        className: { type: 'string' },
        children: { type: 'array' },
    },
    additionalProperties: false,
};

const inputSchema: PropSchema = {
    type: 'object',
    properties: {
        label: { type: 'string' },
        error: { type: 'string' },
        type: { type: 'string' },
        placeholder: { type: 'string' },
        value: { type: 'string' },
        disabled: { type: 'boolean' },
        multiline: { type: 'boolean' },
        onChange: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    additionalProperties: false,
};

const sliderSchema: PropSchema = {
    type: 'object',
    properties: {
        min: { type: 'number' },
        max: { type: 'number' },
        step: { type: 'number' },
        value: { type: 'array', items: { type: 'number' } },
        defaultValue: { type: 'array', items: { type: 'number' } },
        label: { type: 'string' },
        showValue: { type: 'boolean' },
        disabled: { type: 'boolean' },
        onValueChange: { type: 'string' }, // Action ID
        formatValue: { type: 'string' }, // Transform function name
        className: { type: 'string' },
    },
    additionalProperties: false,
};

const switchSchema: PropSchema = {
    type: 'object',
    properties: {
        checked: { type: 'boolean' },
        disabled: { type: 'boolean' },
        onCheckedChange: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    additionalProperties: false,
};

const sessionCardSchema: PropSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        date: { type: 'string' },
        duration: { type: 'string' },
        status: {
            type: 'string',
            enum: ['confirmed', 'pending', 'completed', 'cancelled'],
        },
        patientName: { type: 'string' },
        patientAvatar: { type: 'string' },
        meetingLink: { type: 'string' },
        feedback: { type: 'string' },
        onClick: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    required: ['title', 'date', 'duration', 'status', 'patientName', 'onClick'],
    additionalProperties: false,
};

const therapistCardSchema: PropSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        role: { type: 'string' },
        imageUrl: { type: 'string' },
        rating: { type: 'number' },
        bio: { type: 'string' },
        expertise: { type: 'array', items: { type: 'string' } },
        isOnline: { type: 'boolean' },
        onClick: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    required: ['name', 'role', 'bio', 'expertise', 'onClick'],
    additionalProperties: false,
};

const appointmentCardSchema: PropSchema = {
    type: 'object',
    properties: {
        appointment: {
            type: 'object',
            properties: {
                therapist: {
                    type: 'object',
                    properties: {
                        full_name: { type: 'string' },
                        avatar_url: { type: 'string' },
                        specialization: { type: 'string' },
                    },
                    required: ['full_name'],
                },
                start_time: { type: 'string', format: 'date-time' },
                end_time: { type: 'string', format: 'date-time' },
                status: {
                    type: 'string',
                    enum: ['confirmed', 'pending', 'completed', 'cancelled'],
                },
                meeting_link: { type: 'string' },
            },
            required: ['therapist', 'start_time', 'end_time', 'status'],
        },
        variant: {
            type: 'string',
            enum: ['upcoming', 'past'],
        },
        onJoin: { type: 'string' }, // Action ID
        onCancel: { type: 'string' }, // Action ID
        onConfirm: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    required: ['appointment'],
    additionalProperties: false,
};

const calendarPickerSchema: PropSchema = {
    type: 'object',
    properties: {
        selectedDate: { type: 'string', format: 'date-time' },
        onDateSelect: { type: 'string' }, // Action ID
        availableDates: { type: 'array', items: { type: 'string' } },
        disabledDates: { type: 'array', items: { type: 'string' } },
        minDate: { type: 'string', format: 'date-time' },
        maxDate: { type: 'string', format: 'date-time' },
        className: { type: 'string' },
    },
    required: ['onDateSelect'],
    additionalProperties: false,
};

const interventionCardSchema: PropSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        type: { type: 'string', enum: ['CBT', 'DBT', 'ACT', 'Other'] },
        description: { type: 'string' },
        steps: { type: 'array', items: { type: 'string' } },
        onApply: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    required: ['title', 'type', 'description', 'steps', 'onApply'],
    additionalProperties: false,
};

const riskAlertSchema: PropSchema = {
    type: 'object',
    properties: {
        type: { type: 'string', enum: ['self-harm', 'suicide', 'harm-to-others', 'substance-abuse'] },
        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        description: { type: 'string' },
        detectedAt: { type: 'string', format: 'date-time' },
        onOpenAssessment: { type: 'string' }, // Action ID
        onFlagForReview: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    required: ['type', 'severity', 'description', 'detectedAt'],
    additionalProperties: false,
};

const patternCardSchema: PropSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        frequency: { type: 'string' },
        trend: { type: 'string', enum: ['increasing', 'stable', 'decreasing'] },
        confidence: { type: 'number', minimum: 0, maximum: 100 },
        relatedSessions: { type: 'number' },
        onClick: { type: 'string' }, // Action ID
        className: { type: 'string' },
    },
    required: ['title', 'description', 'frequency', 'trend', 'confidence'],
    additionalProperties: false,
};

const timeSlotButtonSchema: PropSchema = {
    type: 'object',
    properties: {
        time: { type: 'string' },
        endTime: { type: 'string' },
        isSelected: { type: 'boolean' },
        onPress: { type: 'string' }, // Action ID
        disabled: { type: 'boolean' },
        available: { type: 'boolean' },
        label: { type: 'string' },
        className: { type: 'string' },
    },
    required: ['time', 'isSelected', 'onPress'],
    additionalProperties: false,
};

const lineChartSchema: PropSchema = {
    type: 'object',
    properties: {
        data: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    date: { type: 'string' },
                    value: { type: 'number' },
                    label: { type: 'string' },
                },
                required: ['date', 'value'],
            },
        },
        title: { type: 'string' },
        xAxisLabel: { type: 'string' },
        yAxisLabel: { type: 'string' },
        color: { type: 'string' },
        showGrid: { type: 'boolean' },
        showTooltip: { type: 'boolean' },
        height: { type: 'number' },
        className: { type: 'string' },
    },
    required: ['data'],
    additionalProperties: false,
};

const barChartSchema: PropSchema = {
    type: 'object',
    properties: {
        data: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    category: { type: 'string' },
                    value: { type: 'number' },
                    label: { type: 'string' },
                },
                required: ['category', 'value'],
            },
        },
        title: { type: 'string' },
        xAxisLabel: { type: 'string' },
        yAxisLabel: { type: 'string' },
        color: { type: 'string' },
        showGrid: { type: 'boolean' },
        showTooltip: { type: 'boolean' },
        height: { type: 'number' },
        className: { type: 'string' },
    },
    required: ['data'],
    additionalProperties: false,
};


// ============================================================================
// Component Catalog
// ============================================================================

const catalog: ComponentCatalog = {
    Button: {
        componentType: 'Button',
        reactComponent: Button,
        propSchema: buttonSchema,
        allowedActions: ['onClick'],
        description: 'Primary button component with variants and loading states',
        category: 'input',
    },

    Card: {
        componentType: 'Card',
        reactComponent: Card,
        propSchema: cardSchema,
        allowedActions: [],
        description: 'Container card component',
        category: 'layout',
    },

    CardHeader: {
        componentType: 'CardHeader',
        reactComponent: CardHeader,
        propSchema: cardSchema,
        allowedActions: [],
        description: 'Card header section',
        category: 'layout',
    },

    CardTitle: {
        componentType: 'CardTitle',
        reactComponent: CardTitle,
        propSchema: { type: 'object', properties: { children: { type: 'string' } } },
        allowedActions: [],
        description: 'Card title text',
        category: 'layout',
    },

    CardDescription: {
        componentType: 'CardDescription',
        reactComponent: CardDescription,
        propSchema: { type: 'object', properties: { children: { type: 'string' } } },
        allowedActions: [],
        description: 'Card description text',
        category: 'layout',
    },

    CardContent: {
        componentType: 'CardContent',
        reactComponent: CardContent,
        propSchema: cardSchema,
        allowedActions: [],
        description: 'Card content section',
        category: 'layout',
    },

    CardFooter: {
        componentType: 'CardFooter',
        reactComponent: CardFooter,
        propSchema: cardSchema,
        allowedActions: [],
        description: 'Card footer section',
        category: 'layout',
    },

    Input: {
        componentType: 'Input',
        reactComponent: Input,
        propSchema: inputSchema,
        allowedActions: ['onChange', 'onFocus', 'onBlur'],
        description: 'Text input component with label and error support',
        category: 'input',
    },

    Slider: {
        componentType: 'Slider',
        reactComponent: Slider,
        propSchema: sliderSchema,
        allowedActions: ['onValueChange'],
        description: 'Range slider component',
        category: 'input',
    },

    Switch: {
        componentType: 'Switch',
        reactComponent: Switch,
        propSchema: switchSchema,
        allowedActions: ['onCheckedChange'],
        description: 'Toggle switch component',
        category: 'input',
    },

    SessionCard: {
        componentType: 'SessionCard',
        reactComponent: SessionCard,
        propSchema: sessionCardSchema,
        allowedActions: ['onClick'],
        description: 'Therapy session card with patient info and status',
        category: 'display',
    },

    TherapistCard: {
        componentType: 'TherapistCard',
        reactComponent: TherapistCard,
        propSchema: therapistCardSchema,
        allowedActions: ['onClick'],
        description: 'Therapist profile card with expertise and rating',
        category: 'display',
    },

    AppointmentCard: {
        componentType: 'AppointmentCard',
        reactComponent: AppointmentCard,
        propSchema: appointmentCardSchema,
        allowedActions: ['onJoin', 'onCancel', 'onConfirm'],
        description: 'Appointment card for therapy sessions',
        category: 'display',
    },

    CalendarPicker: {
        componentType: 'CalendarPicker',
        reactComponent: CalendarPicker,
        propSchema: calendarPickerSchema,
        allowedActions: ['onDateSelect'],
        description: 'Calendar component for appointment booking with available dates highlighting',
        category: 'input',
    },

    InterventionCard: {
        componentType: 'InterventionCard',
        reactComponent: InterventionCard,
        propSchema: interventionCardSchema,
        allowedActions: ['onApply'],
        description: 'Therapy intervention card with technique steps and apply button',
        category: 'display',
    },

    RiskAlert: {
        componentType: 'RiskAlert',
        reactComponent: RiskAlert,
        propSchema: riskAlertSchema,
        allowedActions: ['onOpenAssessment', 'onFlagForReview'],
        description: 'Risk indicator alert with severity levels and action buttons',
        category: 'display',
    },

    PatternCard: {
        componentType: 'PatternCard',
        reactComponent: PatternCard,
        propSchema: patternCardSchema,
        allowedActions: ['onClick'],
        description: 'Patient behavioral pattern card with frequency and trend indicators',
        category: 'display',
    },

    TimeSlotButton: {
        componentType: 'TimeSlotButton',
        reactComponent: TimeSlotButton,
        propSchema: timeSlotButtonSchema,
        allowedActions: ['onPress'],
        description: 'Time slot selection button with available/selected states',
        category: 'input',
    },

    LineChart: {
        componentType: 'LineChart',
        reactComponent: LineChart,
        propSchema: lineChartSchema,
        allowedActions: [],
        description: 'Line chart for mood trends and time-series data visualization',
        category: 'visualization',
    },

    BarChart: {
        componentType: 'BarChart',
        reactComponent: BarChart,
        propSchema: barChartSchema,
        allowedActions: [],
        description: 'Bar chart for session frequency and categorical data visualization',
        category: 'visualization',
    },
};

// ============================================================================
// Catalog Functions
// ============================================================================

/**
 * Get component definition by type
 */
export function getComponent(type: string): ComponentDefinition | undefined {
    return catalog[type];
}

/**
 * Check if component type is whitelisted
 */
export function isComponentAllowed(type: string): boolean {
    return type in catalog;
}

/**
 * Validate component props against schema
 */
export function validateComponentProps(type: string, props: any): { valid: boolean; errors?: string[] } {
    const component = catalog[type];
    if (!component) {
        return {
            valid: false,
            errors: [`Unknown component type: ${type}`],
        };
    }

    const validate = ajv.compile(component.propSchema);
    const valid = validate(props);

    if (!valid && validate.errors) {
        return {
            valid: false,
            errors: validate.errors.map((e) => `${e.instancePath} ${e.message}`),
        };
    }

    return { valid: true };
}

/**
 * Get all component types in catalog
 */
export function getAllComponentTypes(): string[] {
    return Object.keys(catalog);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: string): ComponentDefinition[] {
    return Object.values(catalog).filter((c) => c.category === category);
}

/**
 * Get component categories
 */
export function getCategories(): string[] {
    const categories = new Set(Object.values(catalog).map((c) => c.category || 'other'));
    return Array.from(categories);
}

// Export catalog
export { catalog as componentCatalog };
