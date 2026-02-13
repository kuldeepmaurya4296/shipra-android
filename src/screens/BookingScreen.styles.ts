import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, color: colors.mutedForeground },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 16 },
    backButton: { padding: 8, borderRadius: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.foreground },
    content: { padding: 20, paddingBottom: 100 },

    // Cards
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
    mapCard: { height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 16, backgroundColor: '#e2e8f0' },
    mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Error Banner
    errorBanner: { flexDirection: 'row', backgroundColor: '#fee2e2', borderRadius: 12, padding: 12, marginBottom: 16, gap: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
    errorTitle: { fontWeight: 'bold', color: '#991b1b', fontSize: 14 },
    errorText: { color: '#7f1d1d', fontSize: 12, marginTop: 2 },

    // Route
    routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    routeArrow: { justifyContent: 'center', alignItems: 'center', paddingTop: 12 },
    label: { fontSize: 10, fontWeight: 'bold', color: colors.mutedForeground, marginBottom: 4 },
    addressText: { fontSize: 14, fontWeight: '600', color: colors.foreground, maxWidth: 140 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

    // Stats
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statVal: { fontSize: 14, fontWeight: '600', color: colors.foreground },
    statDivider: { width: 1, height: 20, backgroundColor: colors.border },

    // Bird
    birdCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, marginBottom: 16, gap: 16, borderWidth: 1, borderColor: '#d1fae5' },
    birdIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' },
    birdName: { fontSize: 16, fontWeight: 'bold', color: '#065f46' },
    birdStatus: { fontSize: 12, color: '#047857' },

    // Pricing
    priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
    priceLabel: { fontSize: 14, color: colors.mutedForeground, fontWeight: '600' },
    priceVal: { fontSize: 24, fontWeight: 'bold', color: colors.primary },

    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
    paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'center' },
    paymentMethodText: { fontSize: 12, color: colors.mutedForeground },
    payButton: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disabledBtn: { opacity: 0.5, backgroundColor: '#9ca3af' },
    retryButton: { backgroundColor: '#ea580c' },

    // Timeline
    timelineContainer: { gap: 16, paddingLeft: 4, paddingVertical: 4 },
    timelineItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    timelineDotStart: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 },
    timelineDotStop: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8b5cf6', marginTop: 5, borderWidth: 1, borderColor: '#fff', elevation: 2 },
    timelineDotEnd: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, marginTop: 4 },
});
