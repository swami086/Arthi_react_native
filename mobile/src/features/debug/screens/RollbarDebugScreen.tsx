import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { reportError, reportInfo, reportWarning, withRollbarSpan, endSpan, getTraceId } from '../../../services/rollbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../api/supabase';
import { tokens } from '../../../design-system/tokens';

export const RollbarDebugScreen = () => {
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [buggyState, setBuggyState] = useState(false);

    const handleHandledError = () => {
        try {
            throw new Error('Test Handled Exception from RollbarDebugScreen');
        } catch (error) {
            reportError(error, 'RollbarDebug:HandledError');
            setLastAction('Reported Handled Error');
        }
    };

    const handleInfoLog = () => {
        reportInfo('Test Info Log', 'RollbarDebug:Info', { test: true });
        setLastAction('Reported Info Log');
    };

    const handleWarningLog = () => {
        reportWarning('Test Warning Log', 'RollbarDebug:Warning', { level: 'medium' });
        setLastAction('Reported Warning Log');
    };

    const handleUncaughtError = () => {
        const a: any = {};
        a.b.c = 0; // Throws TypeError
    };

    const handleRenderError = () => {
        setLastAction('Triggering Render Error...');
        setTimeout(() => {
            setBuggyState(true);
        }, 100);
    };

    const handleDistributedTracingTest = async () => {
        setLastAction('Starting Distributed Trace Test...');
        try {
            const { data, error } = await supabase.functions.invoke('rollbar-test', {
                body: { message: 'Tracing test from mobile', simulate_error: false },
                headers: withRollbarSpan('mobileTraceTest')
            });

            if (error) throw error;
            endSpan();
            setLastAction(`Distributed Trace Success! Trace: ${data.trace_id}`);
        } catch (error) {
            reportError(error, 'RollbarDebug:DistributedTracingTest');
            setLastAction('Distributed Trace Failed (Reported)');
        }
    };

    if (buggyState) {
        throw new Error('Test Render Error from RollbarDebugScreen');
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Rollbar Verification</Text>

                <View style={styles.statusBox}>
                    <Text style={styles.statusTitle}>Last Action:</Text>
                    <Text style={styles.statusText}>{lastAction || 'None'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Frontend Tests</Text>

                <TouchableOpacity style={styles.button} onPress={handleHandledError}>
                    <Text style={styles.buttonText}>Report Handled Error</Text>
                    <Text style={styles.buttonSubtext}>v.s. try-catch block</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={handleInfoLog}>
                    <Text style={styles.buttonText}>Report Info Log</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={handleWarningLog}>
                    <Text style={styles.buttonText}>Report Warning Log</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={handleUncaughtError}>
                    <Text style={styles.buttonText}>Trigger Uncaught Error</Text>
                    <Text style={styles.buttonSubtext}>Event handler crash</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.criticalButton]} onPress={handleRenderError}>
                    <Text style={styles.buttonText}>Trigger Render Error</Text>
                    <Text style={styles.buttonSubtext}>Caught by ErrorBoundary</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.distributedButton]} onPress={handleDistributedTracingTest}>
                    <Text style={styles.buttonText}>Test Distributed Tracing</Text>
                    <Text style={styles.buttonSubtext}>Frontend {'->'} Edge Function</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Backend Verification</Text>
                <Text style={styles.instructions}>
                    To verify backend (Edge Functions), run the following curl command in your terminal:
                </Text>
                <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>
                        curl -X POST https://pqjwldzyogmdangllnlr.supabase.co/functions/v1/rollbar-test \<br />
                        -H "Authorization: Bearer YOUR_ANON_KEY" \<br />
                        -H "Content-Type: application/json" \<br />
                        -d '{"{"}"message": "Hello from Terminal"{"}"}'
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        color: '#555',
    },
    statusBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    statusTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007bff',
    },
    button: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoButton: {
        borderLeftColor: '#17a2b8',
    },
    warningButton: {
        borderLeftColor: '#ffc107',
    },
    errorButton: {
        borderLeftColor: '#dc3545',
    },
    criticalButton: {
        borderLeftColor: '#6f42c1',
    },
    distributedButton: {
        borderLeftColor: '#28a745',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    instructions: {
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
        lineHeight: 20,
    },
    codeBlock: {
        backgroundColor: '#2d2d2d',
        padding: 15,
        borderRadius: 8,
    },
    codeText: {
        color: '#f8f8f2',
        fontFamily: 'monospace',
        fontSize: 12,
    },
});

export default RollbarDebugScreen;
