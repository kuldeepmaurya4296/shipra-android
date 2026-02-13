import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 16,
    },
    brandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    tagline: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },

    // ─── Location Card ───
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    locationCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pickupDot: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupDotInner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    pickupDotCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.success,
    },
    dropDot: {
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: '#ef4444',
        marginLeft: 4,
    },
    locationLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.mutedForeground,
        letterSpacing: 1.5,
    },
    pickupActions: {
        flexDirection: 'row',
        gap: 8,
    },
    gpsBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    editBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },

    // Loading
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    loadingText: {
        fontSize: 14,
        color: colors.mutedForeground,
    },

    // Location Display
    locationDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    locationDisplayContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationAddress: {
        fontSize: 15,
        color: colors.foreground,
        fontWeight: '500',
        flex: 1,
    },
    gpsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    gpsBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.success,
        letterSpacing: 0.5,
    },

    // Search
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
        borderWidth: 1.5,
        borderColor: colors.primary,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.foreground,
    },
    suggestionsBox: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderTopWidth: 0,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        maxHeight: 220,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        gap: 10,
    },
    suggestionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    suggestionSub: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    useGPSButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    useGPSText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Connector
    connector: {
        alignItems: 'flex-start',
        paddingLeft: 8,
        gap: 4,
        marginVertical: 6,
    },
    connectorDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.mutedForeground,
        opacity: 0.4,
    },

    // ─── Map ───
    mapCard: {
        height: 220,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    mapOverlayBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    mapOverlayText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // ─── Fare Card ───
    fareCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    fareHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    fareHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fareTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
    },
    fareAmountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    fareCurrency: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 2,
    },
    fareAmount: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
    },
    fareStats: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
    },
    fareStat: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    fareStatValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    fareStatLabel: {
        fontSize: 10,
        color: colors.mutedForeground,
    },
    fareStatDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },
    nearestBirdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    nearestBirdIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nearestBirdInfo: {
        flex: 1,
    },
    nearestBirdName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.foreground,
    },
    nearestBirdDist: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginTop: 1,
    },
    fareNoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    fareNote: {
        fontSize: 11,
        color: colors.mutedForeground,
        fontStyle: 'italic',
    },

    // ─── Book Button ───
    bookButton: {
        marginBottom: 16,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    bookButtonDisabled: {
        elevation: 2,
        shadowOpacity: 0.1,
    },
    bookButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },

    // ─── Bird Status ───
    birdCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 20,
    },
    birdContent: {
        gap: 12,
    },
    birdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    birdTitle: {
        fontWeight: 'bold',
        color: colors.mutedForeground,
        fontSize: 14,
    },
    badge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    badgeText: {
        color: colors.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    birdInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    birdName: {
        fontWeight: '600',
        color: colors.foreground,
    },
    // Stops
    stopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    stopDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6', marginRight: 12, marginLeft: 6 },
    stopInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: colors.border },
    stopInput: { flex: 1, fontSize: 13, color: colors.foreground, marginLeft: 8 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4, marginTop: 4 },
    addStopBtn: { flexDirection: 'row', alignItems: 'center' },
    addStopText: { fontSize: 12, color: colors.primary, fontWeight: 'bold', marginLeft: 6 },
    optimizeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    optimizeText: { fontSize: 11, color: colors.primary, fontWeight: 'bold', marginLeft: 6 },
    // Quick Select
    quickSelectLayer: {
        flexDirection: 'row',
        marginTop: 12,
        marginBottom: 8,
    },
    gpsChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.primary,
        marginRight: 8,
        gap: 6,
    },
    gpsChipText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    verbiportChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        gap: 6,
    },
    verbiportChipText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.foreground,
    },
});
