import React, { useEffect, useState } from 'react';
import { View, Text, Alert, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { Button } from '../../../components/Button';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraPermissions, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';

type VideoCallWaitingRoomRouteProp = RouteProp<RootStackParamList, 'VideoCallWaitingRoom'>;

export const VideoCallWaitingRoomScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<VideoCallWaitingRoomRouteProp>();
    const { appointmentId, roomId } = route.params;

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [audioPermission, setAudioPermission] = useState<Audio.PermissionResponse | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    useEffect(() => {
        const getPermissions = async () => {
            if (!cameraPermission?.granted) {
                await requestCameraPermission();
            }

            const audioStatus = await Audio.requestPermissionsAsync();
            setAudioPermission(audioStatus);

            if (!cameraPermission?.granted && !audioStatus.granted) {
                // Alert handled by UI state
            }
        };

        getPermissions();
    }, []);

    const hasPermissions = cameraPermission?.granted && audioPermission?.granted;

    const handleJoin = () => {
        // In real app, fetch token here
        navigation.replace('VideoCall', {
            appointmentId,
            roomId,
            token: 'mock-token'
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-row justify-between items-center p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="close" size={24} color="white" />
                </Button>
                <Text className="text-white font-bold text-lg">Waiting Room</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 justify-center px-4">
                <View className="aspect-[3/4] bg-gray-800 rounded-3xl overflow-hidden mb-8 relative shadow-xl">
                    {hasPermissions && cameraOn ? (
                         <CameraView
                             style={{ flex: 1 }}
                             facing="front"
                         />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <View className="w-24 h-24 rounded-full bg-gray-700 items-center justify-center mb-4">
                                <MaterialCommunityIcons name="camera-off" size={32} color="white" />
                            </View>
                            <Text className="text-gray-400">
                                {hasPermissions ? "Camera is off" : "Permission required"}
                            </Text>
                        </View>
                    )}

                    <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-6">
                        <Button
                            variant="secondary"
                            size="icon"
                            onPress={() => setMicOn(!micOn)}
                            className={`rounded-full w-14 h-14 ${!micOn ? 'bg-red-500' : 'bg-gray-700/80'}`}
                        >
                            <MaterialCommunityIcons name={micOn ? "microphone" : "microphone-off"} size={24} color="white" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onPress={() => setCameraOn(!cameraOn)}
                            className={`rounded-full w-14 h-14 ${!cameraOn ? 'bg-red-500' : 'bg-gray-700/80'}`}
                        >
                            <MaterialCommunityIcons name={cameraOn ? "video" : "video-off"} size={24} color="white" />
                        </Button>
                    </View>
                </View>

                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    className="bg-gray-800 p-4 rounded-2xl mb-6"
                >
                    <Text className="text-white font-bold text-lg mb-1">Ready to join?</Text>
                    <Text className="text-gray-400 text-sm">
                        Checking network quality... Excellent
                    </Text>
                </MotiView>

                <Button
                    onPress={handleJoin}
                    className="w-full mb-4 bg-primary"
                    size="lg"
                >
                    Join Session
                </Button>
            </View>
        </SafeAreaView>
    );
};
