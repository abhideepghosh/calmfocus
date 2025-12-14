import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { PermissionService } from '../../services/PermissionService';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

export default function Onboarding() {
    const router = useRouter();
    const setHasCompletedOnboarding = useStore(s => s.setHasCompletedOnboarding);
    const [step, setStep] = useState(0);

    const handlePermissions = async () => {
        Alert.alert(
            "Permission Required",
            "To block apps effectively, we need 'Accessibility Service' permission. Please find 'Calm Focus' in the list and enable it.",
            [
                {
                    text: "OK",
                    onPress: async () => {
                        await PermissionService.requestUsageStatsPermission();
                        if (Platform.OS === 'android') {
                            setTimeout(async () => {
                                await PermissionService.requestOverlayPermission();
                                setTimeout(() => {
                                    PermissionService.requestAccessibilityPermission();
                                }, 1000);
                            }, 1000);
                        }
                        setStep(1);
                    }
                }
            ]
        );
    };

    const finish = () => {
        setHasCompletedOnboarding(true);
        router.replace('/home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <LinearGradient
                        colors={[Colors.light.primary, Colors.light.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconContainer}
                    >
                        <MaterialCommunityIcons name="shield-check" size={64} color="white" />
                    </LinearGradient>
                    <Text style={styles.headline}>Your Data Stays Here.</Text>
                    <Text style={styles.body}>
                        Calm Focus works entirely offline. We cannot see what apps you use or what websites you visit. No accounts, no cloud.
                    </Text>
                </View>

                <View style={styles.footer}>
                    {step === 0 ? (
                        <TouchableOpacity onPress={handlePermissions} activeOpacity={0.8}>
                            <LinearGradient
                                colors={[Colors.light.primary, '#4A90E2']}
                                style={styles.button}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>Grant Permissions</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={finish} activeOpacity={0.8}>
                            <LinearGradient
                                colors={[Colors.light.success, '#66BB6A']}
                                style={styles.button}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>Start Focusing</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {step === 0 && Platform.OS === 'android' && (
                        <Text style={styles.subtext}>
                            Required to detect distractions and show the focus shield.
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'space-between',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        ...Shadows.lg,
        transform: [{ rotate: '-10deg' }]
    },
    headline: {
        ...Typography.heading.h1,
        color: Colors.light.text,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    body: {
        ...Typography.body.lg,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
    },
    footer: {
        marginBottom: Spacing.xl,
    },
    button: {
        flexDirection: 'row',
        height: 56,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    buttonText: {
        ...Typography.body.lg,
        fontWeight: '700',
        color: 'white',
    },
    subtext: {
        ...Typography.body.xs,
        color: Colors.light.textTertiary,
        textAlign: 'center',
        marginTop: Spacing.md,
    }
});
