import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ArrowLeft, CheckCircle, AlertTriangle, Battery, Gauge, Cpu, Wifi } from 'lucide-react-native';
import { styles } from './DiagnosisScreen.styles';

type Props = StackScreenProps<RootStackParamList, 'Diagnosis'>;

export default function DiagnosisScreen({ navigation, route }: Props) {
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setScanning(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const SystemItem = ({ label, icon: Icon, status }: { label: string, icon: any, status: 'ok' | 'warning' }) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <Icon size={24} color={colors.primary} />
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                {status === 'ok' ? (
                    <>
                        <Text style={styles.statusOk}>Optimal</Text>
                        <CheckCircle size={20} color={colors.success} />
                    </>
                ) : (
                    <>
                        <Text style={styles.statusWarn}>Check</Text>
                        <AlertTriangle size={20} color={colors.accent} />
                    </>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>System Diagnosis</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {scanning ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.scanningText}>Running System Diagnostics...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.card}>
                            <SystemItem label="Core Functions" icon={Cpu} status="ok" />
                            <View style={styles.divider} />
                            <SystemItem label="Battery Cells" icon={Battery} status="ok" />
                            <View style={styles.divider} />
                            <SystemItem label="Rotor Velocity" icon={Gauge} status="ok" />
                            <View style={styles.divider} />
                            <SystemItem label="Nav/Comms Link" icon={Wifi} status="ok" />
                            <View style={styles.divider} />
                            <SystemItem label="Cabin Pressure" icon={Gauge} status="ok" />
                        </View>

                        <View style={styles.summaryContainer}>
                            <CheckCircle size={48} color={colors.success} />
                            <Text style={styles.summaryTitle}>All Systems Nominal</Text>
                            <Text style={styles.summaryDesc}>Bird is airworthy and performing at peak efficiency.</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
