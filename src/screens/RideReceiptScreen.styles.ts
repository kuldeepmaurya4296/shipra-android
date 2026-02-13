import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    completedText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.success,
        marginTop: 8,
    },
    dateText: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginTop: 4,
    },
    amountCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    amountLabel: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 8,
    },
    paymentMethod: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '500',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    iconBox: {
        width: 40,
        alignItems: 'center',
    },
    detailsCol: {
        flex: 1,
    },
    timelineItem: {
        marginBottom: 24,
    },
    timelineLine: {
        position: 'absolute',
        left: -29,
        top: 24,
        bottom: 24,
        width: 2,
        backgroundColor: colors.border,
        height: 30
    },
    locationLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    locationValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: colors.foreground,
        marginLeft: 8
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    fareLabel: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    fareValue: {
        fontSize: 14,
        color: colors.foreground,
        fontWeight: '500',
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    downloadButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerText: {
        textAlign: 'center',
        color: colors.mutedForeground,
        fontSize: 12,
        marginTop: 24,
    },
});
