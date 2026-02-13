import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import NavigationBar from '../components/NavigationBar';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { User, LogOut, ChevronRight, Settings, Edit2, Check, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { styles } from './ProfileScreen.styles';

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
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(!isEditing)}
                    disabled={updating}
                >
                    {isEditing ? (
                        <X size={20} color={colors.foreground} />
                    ) : (
                        <Edit2 size={20} color={colors.foreground} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <User size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.userNameHeader}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmailHeader}>{user?.email || 'email@example.com'}</Text>
                </View>

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
