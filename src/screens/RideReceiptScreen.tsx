import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { CheckCircle, Share2, MapPin, User, Plane, Printer } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import RNPrint from 'react-native-print';
import { styles } from './RideReceiptScreen.styles';

type Props = StackScreenProps<RootStackParamList, 'RideReceipt'>;

export default function RideReceiptScreen({ route, navigation }: Props) {
    const { booking } = route.params;
    const { user } = useAuth();

    // Determine the passenger name (User or Pilot viewing)
    // If User is viewing, passenger is 'user'. If Pilot is viewing, passenger is 'booking.userId.name'
    const passengerName = booking.userId?.name || user?.name || 'Guest User';
    // Ensure safe access to pilot name
    const pilotName = booking.pilotId?.name || 'Assigned Pilot';

    const generateHtml = () => {
        const dateStr = new Date(booking.date).toLocaleDateString();
        const timeStr = new Date(booking.date).toLocaleTimeString();
        const totalAmount = booking.amount;

        return `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .logo { font-size: 28px; font-weight: bold; color: #4F46E5; margin-bottom: 5px; }
                    .sub-logo { font-size: 14px; color: #666; }
                    .status { text-align: center; margin-bottom: 30px; }
                    .status-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .detail-item { margin-bottom: 15px; }
                    .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                    .value { font-size: 16px; font-weight: 500; }
                    .route-box { background: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #e5e7eb; }
                    .route-row { display: flex; align-items: center; justify-content: space-between; }
                    .location { font-size: 18px; font-weight: bold; }
                    .arrow { color: #ccc; margin: 0 15px; font-size: 20px; }
                    .fare-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .fare-table th { text-align: left; color: #666; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .fare-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .fare-total td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; border-bottom: none; padding-top: 15px; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">SHIPRA AVIATION</div>
                    <div class="sub-logo">Official Ride Receipt</div>
                </div>

                <div class="status">
                    <span class="status-badge">RIDE COMPLETED</span>
                </div>

                <div class="route-box">
                    <div class="label">FLIGHT ROUTE</div>
                    <div class="route-row">
                        <span class="location">${booking.from}</span>
                        <span class="arrow">✈</span>
                        <span class="location">${booking.to}</span>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <div class="label">Date</div>
                        <div class="value">${dateStr}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Time</div>
                        <div class="value">${timeStr}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Passenger</div>
                        <div class="value">${passengerName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Pilot</div>
                        <div class="value">${pilotName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Aircraft</div>
                        <div class="value">${booking.birdId?.name || booking.birdNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Reference ID</div>
                        <div class="value">#${booking._id.substr(-6).toUpperCase()}</div>
                    </div>
                </div>

                <table class="fare-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Flight Base Fare</td>
                            <td style="text-align: right;">₹${totalAmount}</td>
                        </tr>
                        <tr>
                            <td>Taxes & Fees</td>
                            <td style="text-align: right;">₹0.00</td>
                        </tr>
                        <tr class="fare-total">
                            <td>TOTAL PAID</td>
                            <td style="text-align: right;">₹${totalAmount}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    <p>Thank you for choosing Shipra Aviation.</p>
                    <p>For support, contact help@shipra.com</p>
                </div>
            </body>
            </html>
        `;
    };

    const handleDownload = async () => {
        try {
            await RNPrint.print({
                html: generateHtml()
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to generate PDF');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Shipra Ride Receipt\nAmount: ₹${booking.amount}\n` +
                    `From: ${booking.from}\nTo: ${booking.to}\n` +
                    `Date: ${new Date(booking.date).toLocaleDateString()}`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receipt</Text>
                <TouchableOpacity onPress={handleShare}>
                    <Share2 size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statusContainer}>
                    <CheckCircle size={64} color={colors.success} />
                    <Text style={styles.completedText}>Ride Completed</Text>
                    <Text style={styles.dateText}>{new Date(booking.date).toLocaleString()}</Text>
                </View>

                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Total Paid</Text>
                    <Text style={styles.amountValue}>₹{booking.amount}</Text>
                    <Text style={styles.paymentMethod}>Paid via Online</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ride Details</Text>

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <MapPin size={20} color={colors.primary} />
                        </View>
                        <View style={styles.detailsCol}>
                            <View style={styles.timelineItem}>
                                <Text style={styles.locationLabel}>From</Text>
                                <Text style={styles.locationValue}>{booking.from}</Text>
                            </View>
                            <View style={styles.timelineLine} />
                            <View style={styles.timelineItem}>
                                <Text style={styles.locationLabel}>To</Text>
                                <Text style={styles.locationValue}>{booking.to}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Plane size={16} color={colors.mutedForeground} />
                            <Text style={styles.detailText}>
                                {booking.birdId?.name || booking.birdNumber}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <User size={16} color={colors.mutedForeground} />
                            <Text style={styles.detailText}>
                                Pilot: {pilotName}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fare Breakdown</Text>
                    <View style={styles.fareRow}>
                        <Text style={styles.fareLabel}>Base Fare</Text>
                        <Text style={styles.fareValue}>₹{booking.amount}</Text>
                    </View>
                    <View style={styles.fareRow}>
                        <Text style={styles.fareLabel}>Taxes & Fees</Text>
                        <Text style={styles.fareValue}>₹0.00</Text>
                    </View>
                    <View style={[styles.divider, { marginVertical: 8 }]} />
                    <View style={styles.fareRow}>
                        <Text style={[styles.fareLabel, styles.totalText]}>Total</Text>
                        <Text style={[styles.fareValue, styles.totalText]}>₹{booking.amount}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Passenger Details</Text>
                    <View style={styles.detailRow}>
                        <User size={16} color={colors.mutedForeground} />
                        <Text style={styles.detailText}>{passengerName}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                    <Printer size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.downloadButtonText}>Print / Save as PDF</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    Booking ID: {booking._id}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles have been moved to RideReceiptScreen.styles.ts
