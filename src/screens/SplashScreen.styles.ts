import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        width: '100%',
    },
    logoContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    gifContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gifStyle: {
        width: 280,
        height: 160,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 64,
        fontWeight: '300',
        letterSpacing: 1,
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 96,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: colors.accent,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: colors.accentForeground,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    pilotButton: {
        marginTop: 20,
        padding: 10,
    },
    pilotButtonText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});
