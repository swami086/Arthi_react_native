import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { Button } from '../../../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import Daily from '@daily-co/react-native-daily-js'; // Commented out until package is properly linked

type VideoCallRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;

export const VideoCallScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<VideoCallRouteProp>();
    const { appointmentId, roomId, token } = route.params;
    const [callState, setCallState] = useState('joining'); // joining, joined, left, error
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    useEffect(() => {
        // Initialize Daily call object
        // const callObject = Daily.createCallObject();

        // Join call
        // callObject.join({ url: `https://safespace.daily.co/${roomId}`, token });

        // Event listeners
        // callObject.on('joined-meeting', () => setCallState('joined'));

        // Cleanup
        return () => {
            // callObject.leave();
            // callObject.destroy();
        };
    }, []);

    const handleEndCall = () => {
        Alert.alert(
            "End Session",
            "Are you sure you want to end this session?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "End",
                    style: "destructive",
                    onPress: () => {
                        // Leave call logic
                        navigation.replace('PostSessionFeedback', { appointmentId });
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Remote Video (Full Screen) */}
            <View className="flex-1 items-center justify-center">
                <Text className="text-white text-lg">Remote Participant Video</Text>
            </View>

            {/* Local Video (Floating) */}
            <View className="absolute top-12 right-4 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700">
                <View className="flex-1 items-center justify-center">
                     <Text className="text-gray-400 text-xs">You</Text>
                </View>
                {!cameraOn && (
                     <View className="absolute inset-0 bg-gray-900 items-center justify-center">
                         <MaterialCommunityIcons name="camera-off" size={20} color="white" />
                     </View>
                )}
            </View>

            {/* Controls */}
            <SafeAreaView className="absolute bottom-0 w-full bg-gray-900/80 pt-4 pb-8 rounded-t-3xl">
                <View className="flex-row justify-center space-x-6 items-center">
                    <Button
                        variant="secondary"
                        size="icon"
                        onPress={() => setMicOn(!micOn)}
                        className={`rounded-full w-14 h-14 ${!micOn ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <MaterialCommunityIcons
                            name={micOn ? "microphone" : "microphone-off"}
                            size={24}
                            color={!micOn ? "black" : "white"}
                        />
                    </Button>

                    <Button
                        variant="secondary"
                        size="icon"
                        onPress={handleEndCall}
                        className="rounded-full w-16 h-16 bg-red-500 shadow-lg shadow-red-500/30"
                    >
                        <MaterialCommunityIcons name="phone-hangup" size={32} color="white" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="icon"
                        onPress={() => setCameraOn(!cameraOn)}
                        className={`rounded-full w-14 h-14 ${!cameraOn ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <MaterialCommunityIcons
                            name={cameraOn ? "video" : "video-off"}
                            size={24}
                            color={!cameraOn ? "black" : "white"}
                        />
                    </Button>
                </View>
            </SafeAreaView>
        </View>
    );
};
