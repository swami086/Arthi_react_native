import React, { Component, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { reportError } from "../services/rollbar";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
        reportError(error, `ErrorBoundary: ${JSON.stringify(errorInfo)}`);

    }

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong.</Text>
                    <Text style={styles.error}>{this.state.error?.message}</Text>
                    <TouchableOpacity
                        onPress={() => this.setState({ hasError: false })}
                        style={{
                            backgroundColor: '#30bae8',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8,
                            marginTop: 10
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: '#111827',
    },
    error: {
        marginBottom: 20,
        color: "#ef4444",
        textAlign: "center",
    },
});
