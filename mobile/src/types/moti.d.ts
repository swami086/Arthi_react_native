import { ViewStyle, ImageStyle, TextStyle } from 'react-native';

declare module 'moti' {
    export interface MotiProps<T = ViewStyle | ImageStyle | TextStyle> {
        variants?: any;
        transition?: any;
        from?: any;
        animate?: any;
        exit?: any;
        exitTransition?: any;
        state?: any;
    }
}
