import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, User, Phone, MapPin, FileText, Mail, Save } from 'lucide-react-native';

export default function PilotEditProfileScreen({ navigation }: any) {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        whatsappNumber: user?.whatsappNumber || '',
        callingNumber: user?.callingNumber || '',
        currentAddress: user?.currentAddress || '',
        permanentAddress: user?.permanentAddress || '',
        aadharNumber: user?.aadharNumber || '',
        panNumber: user?.panNumber || '',
        otherDetails: user?.otherDetails || '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            await updateProfile(formData);
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, field: string, icon: any, placeholder: string, keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default', multiline = false) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                {icon}
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    value={(formData as any)[field]}
                    onChangeText={(text) => handleChange(field, text)}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    placeholderTextColor={colors.mutedForeground}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Email - Read Only */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email (Cannot be changed)</Text>
                    <View style={[styles.inputWrapper, styles.disabledInput]}>
                        <Mail size={20} color={colors.mutedForeground} />
                        <Text style={[styles.input, { color: colors.mutedForeground, paddingTop: 12 }]}>
                            {user?.email}
                        </Text>
                    </View>
                </View>

                {renderInput('Full Name', 'name', <User size={20} color={colors.mutedForeground} />, 'Captain Name')}
                {renderInput('Phone Number', 'phone', <Phone size={20} color={colors.mutedForeground} />, '10-digit mobile number', 'phone-pad')}
                {renderInput('WhatsApp Number', 'whatsappNumber', <Phone size={20} color="#25D366" />, 'WhatsApp number', 'phone-pad')}
                {renderInput('Calling Number', 'callingNumber', <Phone size={20} color={colors.primary} />, 'Alternative calling number', 'phone-pad')}

                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Address Details</Text>

                {renderInput('Current Address', 'currentAddress', <MapPin size={20} color={colors.mutedForeground} />, 'Where you currently live', 'default', true)}
                {renderInput('Permanent Address', 'permanentAddress', <MapPin size={20} color={colors.mutedForeground} />, 'Permanent residence', 'default', true)}

                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Identity Documents</Text>

                {renderInput('Aadhar Number', 'aadharNumber', <FileText size={20} color={colors.mutedForeground} />, '12-digit Aadhar', 'numeric')}
                {renderInput('PAN Number', 'panNumber', <FileText size={20} color={colors.mutedForeground} />, '10-character PAN')}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 16,
        marginTop: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.foreground,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: colors.foreground,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
        borderColor: 'transparent',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    saveButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
