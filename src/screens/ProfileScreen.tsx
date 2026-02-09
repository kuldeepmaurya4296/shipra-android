import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import NavigationBar from '../components/NavigationBar';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { User, LogOut, ChevronRight, Settings, Edit2, Check, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
    const [callingNumber, setCallingNumber] = useState(user?.callingNumber || '');
    const [sameAsWhatsapp, setSameAsWhatsapp] = useState(false);

    const [aadharNumber, setAadharNumber] = useState(user?.aadharNumber || '');
    const [panNumber, setPanNumber] = useState(user?.panNumber || '');

    const [currentAddress, setCurrentAddress] = useState(user?.currentAddress || '');
    const [permanentAddress, setPermanentAddress] = useState(user?.permanentAddress || '');
    const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

    const [otherDetails, setOtherDetails] = useState(user?.otherDetails || '');

    // Sync state when user updates (e.g. initial load)
    React.useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setWhatsappNumber(user.whatsappNumber || '');
            setCallingNumber(user.callingNumber || '');
            setAadharNumber(user.aadharNumber || '');
            setPanNumber(user.panNumber || '');
            setCurrentAddress(user.currentAddress || '');
            setPermanentAddress(user.permanentAddress || '');
            setOtherDetails(user.otherDetails || '');
        }
    }, [user]);

    // Handle "Same As" logic
    React.useEffect(() => {
        if (sameAsWhatsapp) {
            setCallingNumber(whatsappNumber);
        }
    }, [sameAsWhatsapp, whatsappNumber]);

    React.useEffect(() => {
        if (sameAsCurrentAddress) {
            setPermanentAddress(currentAddress);
        }
    }, [sameAsCurrentAddress, currentAddress]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
        }
    };

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        setUpdating(true);
        try {
            await updateProfile({
                name,
                email,
                whatsappNumber,
                callingNumber,
                aadharNumber,
                panNumber,
                currentAddress,
                permanentAddress,
                otherDetails
            });
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    // showIfEmpty: true for required fields (name, email), false for optional fields
    const renderInput = (
        label: string,
        value: string,
        setValue: (text: string) => void,
        placeholder: string,
        multiline = false,
        editable = true,
        showIfEmpty = false,
        keyboardType: any = 'default',
        maxLength: number | undefined = undefined,
        autoCapitalize: 'none' | 'sentences' | 'words' | 'characters' = 'sentences'
    ) => {
        // In view mode, hide empty optional fields
        if (!isEditing && !value && !showIfEmpty) {
            return null;
        }

        return (
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                {isEditing ? (
                    <TextInput
                        style={[styles.input, multiline && styles.textArea, !editable && styles.disabledInput]}
                        value={value}
                        onChangeText={setValue}
                        placeholder={placeholder}
                        multiline={multiline}
                        editable={editable}
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType={keyboardType}
                        maxLength={maxLength}
                        autoCapitalize={autoCapitalize}
                    />
                ) : (
                    <Text style={styles.valueText}>{value || '-'}</Text>
                )}
            </View>
        );
    };

    // Helper to check if a section has any filled values (for view mode)
    const hasContactInfo = whatsappNumber || callingNumber;
    const hasIdentityInfo = aadharNumber || panNumber;
    const hasAddressInfo = currentAddress || permanentAddress;
    const hasOtherInfo = otherDetails;

    return (
        <SafeAreaView style={styles.container}>
            {/* ... header ... */}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ... warning banner ... */}
                {/* ... avatar ... */}

                {/* Form Section */}
                <View style={styles.formContainer}>
                    {/* Personal Details - Always visible */}
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    {renderInput('Full Name', name, setName, 'Enter full name', false, true, true)}
                    {renderInput('Email Address', email, setEmail, 'Enter email address', false, true, true, 'email-address', undefined, 'none')}

                    {/* Contact Information - Show section if editing OR has data */}
                    {(isEditing || hasContactInfo) && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            {renderInput('WhatsApp Number', whatsappNumber, setWhatsappNumber, '+91 XXXXX XXXXX', false, true, false, 'phone-pad', 10)}

                            {isEditing && (
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setSameAsWhatsapp(!sameAsWhatsapp)}
                                >
                                    <View style={[styles.checkbox, sameAsWhatsapp && styles.checkboxChecked]}>
                                        {sameAsWhatsapp && <Check size={14} color="#fff" />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Calling number is same as WhatsApp</Text>
                                </TouchableOpacity>
                            )}

                            {renderInput('Calling Number', callingNumber, setCallingNumber, '+91 XXXXX XXXXX', false, !sameAsWhatsapp, false, 'phone-pad', 10)}
                        </>
                    )}

                    {/* Identity Proofs - Show section if editing OR has data */}
                    {(isEditing || hasIdentityInfo) && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Identity Proofs</Text>
                            {renderInput('Aadhar Number', aadharNumber, (text) => setAadharNumber(text.replace(/[^0-9]/g, '')), 'XXXX XXXX XXXX', false, true, false, 'numeric', 12)}
                            {renderInput('PAN Number', panNumber, (text) => setPanNumber(text.toUpperCase()), 'ABCDE1234F', false, true, false, 'default', 10, 'characters')}
                        </>
                    )}

                    {/* Address Details - Show section if editing OR has data */}
                    {(isEditing || hasAddressInfo) && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Address Details</Text>
                            {renderInput('Current Address', currentAddress, setCurrentAddress, 'House No, Street, City...', true)}

                            {isEditing && (
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setSameAsCurrentAddress(!sameAsCurrentAddress)}
                                >
                                    <View style={[styles.checkbox, sameAsCurrentAddress && styles.checkboxChecked]}>
                                        {sameAsCurrentAddress && <Check size={14} color="#fff" />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Permanent address is same as Current</Text>
                                </TouchableOpacity>
                            )}

                            {renderInput('Permanent Address', permanentAddress, setPermanentAddress, 'House No, Street, City...', true, !sameAsCurrentAddress)}
                        </>
                    )}

                    {/* Other Information - Show section if editing OR has data */}
                    {(isEditing || hasOtherInfo) && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Other Information</Text>
                            {renderInput('Other Details', otherDetails, setOtherDetails, 'Any other relevant information...', true)}
                        </>
                    )}
                </View>

                {/* Actions */}
                {isEditing ? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setIsEditing(false)}
                            disabled={updating}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSaveProfile}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <NavigationBar
                currentScreen="profile"
                onNavigate={(screen) => {
                    if (screen === 'home') navigation.navigate('Home');
                    if (screen === 'history') navigation.navigate('History');
                    if (screen === 'profile') navigation.navigate('Profile');
                }}
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    editButton: {
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    content: {
        padding: 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    userNameHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    userEmailHeader: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: colors.foreground,
    },
    valueText: {
        fontSize: 16,
        color: colors.foreground,
        fontWeight: '500',
        paddingVertical: 8,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    disabledInput: {
        backgroundColor: '#e5e7eb',
        color: '#9ca3af',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    checkboxLabel: {
        fontSize: 14,
        color: colors.foreground,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        color: colors.foreground,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
    warningBanner: {
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    warningText: {
        color: '#92400e',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    warningSubtext: {
        color: '#b45309',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
});
