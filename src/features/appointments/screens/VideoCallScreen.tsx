import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { WebView } from 'react-native-webview';
import { updateVideoRoomStatus } from '../../../api/videoService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type VideoCallRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;

export const VideoCallScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<VideoCallRouteProp>();
    const { appointmentId, roomId, meetingUrl } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        updateVideoRoomStatus(roomId, 'active', {
            joined_at: new Date().toISOString(),
        });

        // No cleanup here that ends the call on backend automatically, 
        // relying on user explicit exit or backend timeout logic usually,
        // but for now we keep the status update on unmount.
        return () => {
            updateVideoRoomStatus(roomId, 'ended', {
                left_at: new Date().toISOString(),
            });
        };
    }, [roomId]);

    const handleExit = () => {
        Alert.alert(
            'End Call',
            'Are you sure you want to exit the meeting?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Exit',
                    style: 'destructive',
                    onPress: () => {
                        // Mark room as ended securely on backend through existing useEffect cleanup or explicit call
                        updateVideoRoomStatus(roomId, 'ended', {
                            left_at: new Date().toISOString(),
                        }).then(() => {
                            navigation.replace('PostSessionFeedback', { appointmentId });
                        });
                    }
                }
            ]
        );
    };

    const handleWebViewError = (error: any) => {
        console.error('WebView error:', error);
        setHasError(true);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    // Force a specific viewport and zoom level to fit the Desktop UI on mobile
    const injectedJavaScript = `
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=0.6, maximum-scale=2.0, user-scalable=yes';
      var head = document.getElementsByTagName('head')[0];
      head.appendChild(meta);
      
      // Optional: hide generic google meet mobile promo banner if it appears
      // specific class names change often, so general zoom is safer
      document.body.style.zoom = '0.8';
      true;
    `;

    if (hasError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load meeting</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleExit} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Google Meet</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <WebView
                source={{ uri: meetingUrl }}
                style={styles.webview}
                onError={handleWebViewError}
                onLoadEnd={handleLoadEnd}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                startInLoadingState={false}
                scalesPageToFit={false} // Disable native scaling to let meta tag work
                injectedJavaScript={injectedJavaScript}
                textZoom={100}
                // Use a generic Desktop Chrome UA
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                originWhitelist={['*']}
                onPermissionRequest={(event: any) => {
                    const { resources, grant } = event;
                    if (resources.includes('audio') || resources.includes('video')) {
                        grant(resources);
                    }
                }}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Connecting to Meet...</Text>
                </View>
            )}

            {/* Floating End Call Control */}
            <SafeAreaView style={styles.controlsContainer} edges={['bottom']}>
                <TouchableOpacity
                    onPress={handleExit}
                    style={styles.endCallButton}
                >
                    <MaterialCommunityIcons name="phone-hangup" size={28} color="white" />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202124', // Google Meet dark bg
    },
    safeArea: {
        backgroundColor: '#202124',
        zIndex: 10,
    },
    header: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#202124',
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    webview: {
        flex: 1,
        backgroundColor: '#202124',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 20,
        pointerEvents: 'box-none',
    },
    endCallButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202124',
        zIndex: 5,
    },
    loadingText: {
        color: '#9aa0a6',
        marginTop: 12,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202124',
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#4285F4',
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
    }
});
