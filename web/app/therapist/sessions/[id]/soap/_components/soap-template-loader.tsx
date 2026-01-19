/**
 * SOAP Template Loader
 * 
 * Displays available AI-generated SOAP templates and allows merging them into the editor.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface SOAPData {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface SoapTemplateLoaderProps {
    template: SOAPData;
    onApply: (data: SOAPData) => void;
}

export function SoapTemplateLoader({ template, onApply }: SoapTemplateLoaderProps) {
    return (
        <Card className="border-sparkle bg-sparkle/5 dark:bg-sparkle/10 border-indigo-200 dark:border-indigo-900 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                    <CardTitle className="text-lg">AI-Generated Template</CardTitle>
                </div>
                <CardDescription>
                    Analysis from your Session Copilot is available as a SOAP draft.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                        <span className="font-bold uppercase text-muted-foreground opacity-70">Subjective</span>
                        <p className="line-clamp-2 italic">{template.subjective}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="font-bold uppercase text-muted-foreground opacity-70">Objective</span>
                        <p className="line-clamp-2 italic">{template.objective}</p>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-0"
                    onClick={() => onApply(template)}
                    leftIcon={<Check className="w-4 h-4" />}
                >
                    Apply All Suggestions
                </Button>
            </CardContent>
        </Card>
    );
}
