/**
 * Builds the Insights Dashboard A2UI surface.
 */
export function buildInsightsDashboard(analysis: any, patterns: any[]) {
    const components = [];

    // 1. Header
    components.push({
        type: 'CardHeader',
        props: {
            children: [
                { type: 'CardTitle', props: { children: "Your Insights Dashboard" } },
                { type: 'CardDescription', props: { children: "AI-powered analysis of your therapy journey and behavioral patterns." } }
            ]
        }
    });

    // 2. Key Metrics Row
    const statsRow = {
        type: 'CardContent',
        props: {
            className: 'grid grid-cols-2 md:grid-cols-4 gap-4 p-0 mb-6',
            children: [
                {
                    type: 'StatCard',
                    props: {
                        title: 'Total Sessions',
                        value: analysis.totalSessions,
                        icon: 'Calendar',
                        iconColor: '#0066FF'
                    }
                },
                {
                    type: 'StatCard',
                    props: {
                        title: 'Avg. Mood',
                        value: calculateAvgMood(analysis.moodLogs),
                        icon: 'Activity',
                        iconColor: '#ec4899',
                        growth: '+5%',
                        growthLabel: 'vs last month'
                    }
                },
                {
                    type: 'StatCard',
                    props: {
                        title: 'Therapy Hours',
                        value: analysis.totalSessions * 0.8,
                        icon: 'Clock',
                        iconColor: '#7c3aed'
                    }
                },
                {
                    type: 'StatCard',
                    props: {
                        title: 'Progress',
                        value: '72%',
                        icon: 'TrendingUp',
                        iconColor: '#10b981'
                    }
                }
            ]
        }
    };
    components.push(statsRow);

    // 3. Mood Trend Chart (LineChart)
    if (analysis.moodLogs.length > 0) {
        components.push({
            type: 'LineChart',
            props: {
                title: 'Mood Trends (90 Days)',
                data: analysis.moodLogs.map((m: any) => ({
                    date: new Date(m.created_at).toLocaleDateString(),
                    value: m.score,
                    label: m.note
                })),
                height: 250,
                color: '#0066FF'
            }
        });
    }

    // 4. Distribution & Categorical Charts
    if (analysis.sessionTypes.length > 0 || analysis.symptomDistribution.length > 0) {
        components.push({
            type: 'CardContent',
            props: {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-6 p-0 mt-8',
                children: [
                    ...(analysis.sessionTypes.length > 0 ? [{
                        type: 'BarChart',
                        props: {
                            title: 'Session Types',
                            data: analysis.sessionTypes,
                            height: 200,
                            color: '#7c3aed'
                        }
                    }] : []),
                    ...(analysis.symptomDistribution.length > 0 ? [{
                        type: 'PieChart',
                        props: {
                            title: 'Symptom Distribution',
                            data: analysis.symptomDistribution,
                            height: 200,
                            showLegend: true
                        }
                    }] : [])
                ]
            }
        });
    }

    // 5. Detected Patterns
    if (patterns.length > 0) {
        components.push({
            type: 'CardContent',
            props: {
                className: 'mt-8 flex flex-col gap-4 p-0',
                children: [
                    {
                        type: 'Typography',
                        props: {
                            variant: 'label',
                            className: 'mb-2',
                            children: 'Detected Behavioral Patterns'
                        }
                    },
                    ...patterns.map(p => ({
                        type: 'PatternCard',
                        props: {
                            ...p,
                            onClick: 'view_detailed_insights'
                        }
                    }))
                ]
            }
        });
    }

    // 5. Action Footer
    components.push({
        type: 'CardFooter',
        props: {
            className: 'flex gap-3 justify-end mt-6',
            children: [
                {
                    type: 'Button',
                    props: {
                        variant: 'outline',
                        children: 'Refresh Analysis',
                        onClick: 'refresh_analysis'
                    }
                },
                {
                    type: 'Button',
                    props: {
                        variant: 'primary',
                        children: 'Export Full Report',
                        onClick: 'export_report'
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

function calculateAvgMood(logs: any[]) {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, current) => acc + current.score, 0);
    return (sum / logs.length).toFixed(1);
}
