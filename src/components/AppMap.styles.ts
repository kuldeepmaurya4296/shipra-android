import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
