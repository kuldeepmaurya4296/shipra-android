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
    loadingContainer: {
        marginTop: 100,
        alignItems: 'center',
        gap: 16
    },
    scanningText: {
        fontSize: 16,
        color: colors.mutedForeground,
        fontWeight: '500'
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    statusOk: {
        color: colors.success,
        fontWeight: 'bold',
        fontSize: 14
    },
    statusWarn: {
        color: colors.accent,
        fontWeight: 'bold',
        fontSize: 14
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.5
    },
    summaryContainer: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        gap: 12
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.success
    },
    summaryDesc: {
        textAlign: 'center',
        color: colors.foreground,
        lineHeight: 20
    }
});
