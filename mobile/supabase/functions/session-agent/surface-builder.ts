/**
 * Session Agent Surface Builder
 */

export function buildCopilotSurface(analysis: any) {
    const components: any[] = [];

    // 1. Risk Alerts (Highest priority)
    if (analysis.risks && analysis.risks.length > 0) {
        analysis.risks.forEach((risk: any, idx: number) => {
            components.push({
                id: `risk-alert-${idx}`,
                type: 'RiskAlert',
                props: {
                    type: risk.type,
                    severity: risk.severity,
                    description: risk.description,
                    detectedAt: risk.detectedAt || new Date().toISOString(),
                    onOpenAssessment: 'open_risk_assessment',
                    onFlagForReview: 'flag_for_review'
                },
                actionPayload: {
                    riskType: risk.type,
                    severity: risk.severity,
                    evidence: risk.evidence
                }
            });
        });
    }

    // 2. Intervention Suggestions
    if (analysis.interventions && analysis.interventions.length > 0) {
        components.push({
            id: 'interventions-container-header',
            type: 'CardHeader',
            props: { className: 'px-0 pt-4' },
            children: [
                { id: 'interventions-title', type: 'CardTitle', props: { children: 'Suggested Interventions' } }
            ]
        });

        analysis.interventions.forEach((intervention: any, idx: number) => {
            components.push({
                id: `intervention-card-${idx}`,
                type: 'InterventionCard',
                props: {
                    title: intervention.title,
                    type: intervention.type,
                    description: intervention.description,
                    steps: intervention.steps,
                    onApply: 'apply_intervention'
                },
                actionPayload: {
                    interventionId: `int_${idx}_${Date.now()}`,
                    interventionType: intervention.type,
                    title: intervention.title
                }
            });
        });
    }

    // 3. Behavioral Patterns
    if (analysis.patterns && analysis.patterns.length > 0) {
        components.push({
            id: 'patterns-container-header',
            type: 'CardHeader',
            props: { className: 'px-0 pt-4' },
            children: [
                { id: 'patterns-title', type: 'CardTitle', props: { children: 'Behavioral Insights' } }
            ]
        });

        analysis.patterns.forEach((pattern: any, idx: number) => {
            components.push({
                id: `pattern-card-${idx}`,
                type: 'PatternCard',
                props: {
                    title: pattern.title,
                    description: pattern.description,
                    frequency: pattern.frequency,
                    trend: pattern.trend,
                    confidence: (pattern.confidence || 0) * 100,
                    relatedSessions: pattern.relatedSessions || 0,
                    onClick: 'refresh_analysis'
                }
            });
        });
    }

    // 4. SOAP Template Action Card
    if (analysis.soap) {
        components.push({
            id: 'soap-action-card',
            type: 'Card',
            props: { className: 'mt-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50' },
            children: [
                {
                    id: 'soap-action-header',
                    type: 'CardHeader',
                    props: {},
                    children: [
                        { id: 'soap-action-title', type: 'CardTitle', props: { children: 'Generate SOAP Note' } },
                        { id: 'soap-action-desc', type: 'CardDescription', props: { children: 'AI has prepared a draft based on the session so far.' } }
                    ]
                },
                {
                    id: 'soap-action-content',
                    type: 'CardContent',
                    props: {},
                    children: [
                        {
                            id: 'btn-save-soap',
                            type: 'Button',
                            props: {
                                children: 'Review & Save SOAP Note',
                                variant: 'primary',
                                className: 'w-full',
                                onClick: 'save_soap_note'
                            },
                            actionPayload: {
                                subjective: analysis.soap.subjective,
                                objective: analysis.soap.objective,
                                assessment: analysis.soap.assessment,
                                plan: analysis.soap.plan,
                                aiGenerated: true
                            }
                        }
                    ]
                }
            ]
        });
    }

    return components;
}
