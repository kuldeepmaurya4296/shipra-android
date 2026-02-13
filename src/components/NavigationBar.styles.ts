import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 16,
    },
    activeIconContainer: {
        backgroundColor: colors.muted,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 2,
    },
});
