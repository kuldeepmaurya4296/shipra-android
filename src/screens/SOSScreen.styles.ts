import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    sosButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    sosInnerCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sosText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#b91c1c',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 32,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
        letterSpacing: 1,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    instructionContainer: {
        width: '100%',
        marginBottom: 'auto',
    },
    instructionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    checkIcon: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    instructionText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
        marginBottom: 20,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
