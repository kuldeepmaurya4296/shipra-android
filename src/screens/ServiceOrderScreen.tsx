import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ArrowLeft, CheckCircle, Droplet, Wrench } from 'lucide-react-native';
import { styles } from './ServiceOrderScreen.styles';

type Props = StackScreenProps<RootStackParamList, 'ServiceOrder'>;

export default function ServiceOrderScreen({ navigation, route }: Props) {
    const { type, bookingId } = route.params;
    const isFuel = type === 'fuel';
    const title = isFuel ? 'Order Hydrogen Refuel' : 'Maintenance Request';

    const [notes, setNotes] = useState('');
    const [ordered, setOrdered] = useState(false);

    const handleOrder = () => {
        // Simulate API call
        setTimeout(() => {
            setOrdered(true);
            Alert.alert('Success', `Your ${isFuel ? 'Hydrogen' : 'Maintenance'} order has been placed. Ground crew notified.`);
        }, 1000);
    };

    if (ordered) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <CheckCircle size={80} color={colors.success} />
                    <Text style={styles.successTitle}>Order Confirmed</Text>
                    <Text style={styles.successText}>Ground crew is en route to your bird.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.primaryButton}>
                        <Text style={styles.buttonText}>Return to Bird</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconContainer}>
                    {isFuel ? (
                        <Droplet size={64} color={colors.primary} />
                    ) : (
                        <Wrench size={64} color={colors.primary} />
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Bird ID</Text>
                    <Text style={styles.value}>Pushpako2 (Bird #42)</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Current Location</Text>
                    <Text style={styles.value}>In-Transit / En-route</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Urgency</Text>
                    <View style={styles.chipRow}>
                        <View style={styles.chipActive}><Text style={styles.chipTextActive}>Standard</Text></View>
                        <View style={styles.chip}><Text style={styles.chipText}>Urgent</Text></View>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Additional Notes</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g., Check rotor 3 noise..."
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity onPress={handleOrder} style={styles.primaryButton}>
                    <Text style={styles.buttonText}>Confirm Order</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
