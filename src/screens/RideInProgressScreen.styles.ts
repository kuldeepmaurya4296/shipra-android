import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginTop: 4,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    routeContainer: {
        height: 180,
        marginHorizontal: 24,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 4,
    },
    skyBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    cloud: {
        position: 'absolute',
        top: 40,
        right: 50,
        width: 80,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    sectionLabel: {
        marginLeft: 24,
        marginBottom: 12,
        marginTop: 24,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        letterSpacing: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        gap: 16,
    },
    gridItem: {
        width: '47%', // roughly half - gap
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginBottom: 8,
    },
    gridValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    controlsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16
    },
    controlCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center'
    },
    controlTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.mutedForeground,
        marginBottom: 12
    },
    tempControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    tempBtn: {
        width: 32,
        height: 32,
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tempBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground
    },
    tempValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground
    },
    lockBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 8,
        width: '100%',
        justifyContent: 'center'
    },
    locked: {
        backgroundColor: '#ef4444'
    },
    unlocked: {
        backgroundColor: '#f3f4f6'
    },
    lockText: {
        fontWeight: 'bold',
        color: colors.foreground
    },
    serviceList: {
        marginBottom: 20
    },
    serviceItem: {
        alignItems: 'center',
        gap: 8,
        width: 80
    },
    serviceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center'
    },
    serviceLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.foreground
    },
    actionContainer: {
        padding: 24,
        paddingTop: 12,
        gap: 16,
    },
    completeButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    sosButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
