/**
 * Builds the Follow-up Form A2UI surface.
 */
export function buildFollowupForm(questions: any[], progress: number = 0) {
    const components = [];

    // 1. Header
    components.push({
        type: 'CardHeader',
        props: {
            children: [
                { type: 'CardTitle', props: { children: "Wellness Check-In" } },
                { type: 'CardDescription', props: { children: "Help us understand how you're doing between sessions." } }
            ]
        }
    });

    // 2. Questions Container
    const questionComponents = questions.map((q, idx) => {
        switch (q.type) {
            case 'slider':
                return {
                    type: 'Slider',
                    props: {
                        label: q.label,
                        min: q.min,
                        max: q.max,
                        defaultValue: [5],
                        onValueChange: `on_change_${q.id}`,
                        className: 'mb-8'
                    }
                };
            case 'radio':
                return {
                    type: 'RadioGroup',
                    props: {
                        label: q.label,
                        options: q.options,
                        onValueChange: `on_change_${q.id}`,
                        orientation: 'vertical',
                        className: 'mb-8'
                    }
                };
            case 'checkbox':
                return {
                    type: 'CheckboxGroup',
                    props: {
                        label: q.label,
                        options: q.options,
                        onChange: `on_change_${q.id}`,
                        className: 'mb-8'
                    }
                };
            default:
                return null;
        }
    }).filter(Boolean);

    components.push({
        type: 'CardContent',
        props: {
            children: [
                {
                    type: 'Progress',
                    props: {
                        value: ((progress + 1) / questions.length) * 100,
                        className: 'mb-8'
                    }
                },
                ...questionComponents
            ]
        }
    });

    // 3. Footer
    components.push({
        type: 'CardFooter',
        props: {
            className: 'flex gap-3 justify-between mt-6',
            children: [
                {
                    type: 'Button',
                    props: {
                        variant: 'ghost',
                        children: 'Need Urgent Help?',
                        onClick: 'request_help'
                    }
                },
                {
                    type: 'Button',
                    props: {
                        variant: 'primary',
                        children: 'Submit Response',
                        onClick: 'submit_wellness_check'
                    }
                }
            ]
        }
    });

    return [
        {
            type: 'Card',
            props: {
                className: 'w-full shadow-none border-none p-0 bg-transparent',
                children: components
            }
        }
    ];
}

/**
 * Builds the completion surface.
 */
export function buildCompletionSurface() {
    return [
        {
            type: 'Card',
            props: {
                className: 'p-8 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700',
                children: [
                    {
                        type: 'CardContent',
                        props: {
                            className: 'flex flex-col items-center',
                            children: [
                                {
                                    type: 'StatCard',
                                    props: {
                                        title: 'Status',
                                        value: 'Completed',
                                        icon: 'CheckCircle2',
                                        iconColor: '#10b981',
                                        className: 'mb-6 w-full max-w-[240px]'
                                    }
                                },
                                {
                                    type: 'Typography',
                                    props: {
                                        variant: 'h3',
                                        className: 'mb-2',
                                        children: 'Thank You!'
                                    }
                                },
                                {
                                    type: 'Typography',
                                    props: {
                                        variant: 'p',
                                        className: 'mb-8',
                                        children: 'Your responses help us tailor your next session. Keep up the great work!'
                                    }
                                },
                                {
                                    type: 'Button',
                                    props: {
                                        variant: 'primary',
                                        children: 'View My Insights',
                                        onClick: 'view_detailed_insights'
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ];
}
