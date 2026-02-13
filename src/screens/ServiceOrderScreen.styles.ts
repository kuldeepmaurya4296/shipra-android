import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 48,
        gap: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    content: {
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginBottom: 8
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16
    },
    chipRow: {
        flexDirection: 'row',
        gap: 12
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    chipActive: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.primary,
    },
    chipText: {
        color: colors.mutedForeground,
        fontWeight: '600'
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600'
    },
    inputContainer: {
        marginBottom: 32
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: colors.foreground,
        minHeight: 120,
        textAlignVertical: 'top'
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
        marginTop: 16
    },
    successText: {
        fontSize: 16,
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: 32
    }
});
