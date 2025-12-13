import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { NativeModules, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Timer } from '../../components/ui/Timer';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';

export default function Home() {
    const router = useRouter();
    const {
        isFocusModeActive, setFocusModeActive,
        timerDuration,
        blockedApps,
        timerEndTime, setTimerEndTime
    } = useStore();

    const [remaining, setRemaining] = React.useState(timerDuration);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (isFocusModeActive && timerEndTime) {
            const tick = () => {
                const now = Date.now();
                const diff = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
                setRemaining(diff);
                if (diff <= 0) {
                    setFocusModeActive(false);
                    setTimerEndTime(null);
                }
            };
            tick();
            interval = setInterval(tick, 1000);
        } else {
            setRemaining(timerDuration);
        }
        return () => clearInterval(interval);
    }, [isFocusModeActive, timerEndTime, timerDuration, setFocusModeActive, setTimerEndTime]);

    const toggleFocus = () => {
        if (isFocusModeActive) {
            setFocusModeActive(false);
            setTimerEndTime(null);
            if (Platform.OS === 'android' && NativeModules.FocusModule) {
                NativeModules.FocusModule.stopMonitoring();
            }
        } else {
            const endTime = Date.now() + timerDuration * 1000;
            setTimerEndTime(endTime);
            setFocusModeActive(true);

            if (Platform.OS === 'android' && NativeModules.FocusModule) {
                // Pass blocked apps list to native service
                NativeModules.FocusModule.startMonitoring(JSON.stringify(blockedApps));
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.headerTitle}>Calm Focus</Text>
                </View>
                <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.main}>
                <View style={styles.timerContainer}>
                    <Timer duration={timerDuration} remaining={remaining} />
                </View>

                {isFocusModeActive && (
                    <View style={styles.statusBadge}>
                        <MaterialCommunityIcons name="shield-check" size={16} color={Colors.light.success} />
                        <Text style={styles.statusText}>
                            {blockedApps.length} Apps Blocked
                        </Text>
                    </View>
                )}

                <View style={styles.actionContainer}>
                    <Button
                        title={isFocusModeActive ? "STOP SESSION" : "START FOCUS"}
                        onPress={toggleFocus}
                        variant={isFocusModeActive ? "outline" : "primary"}
                        style={styles.mainButton}
                    />
                </View>
            </View>

            <View style={styles.grid}>
                <TouchableOpacity
                    style={[styles.card, isFocusModeActive && styles.cardDisabled]}
                    onPress={() => router.push('/locker')}
                    disabled={isFocusModeActive}
                    activeOpacity={0.7}
                >
                    <View style={[styles.cardIcon, { backgroundColor: Colors.light.destructive + '15' }]}>
                        <MaterialCommunityIcons name="lock-outline" size={28} color={Colors.light.destructive} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>App Locker</Text>
                        <Text style={styles.cardSub}>{blockedApps.length} Selected</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.textTertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push('/browser')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.cardIcon, { backgroundColor: Colors.light.success + '15' }]}>
                        <MaterialCommunityIcons name="web" size={28} color={Colors.light.success} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Safe Browser</Text>
                        <Text style={styles.cardSub}>Search & Surf</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.textTertiary} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    greeting: {
        ...Typography.body.sm,
        color: Colors.light.textSecondary,
    },
    headerTitle: {
        ...Typography.heading.h2,
        color: Colors.light.text,
    },
    settingsButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.full,
        ...Shadows.sm,
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    timerContainer: {
        marginBottom: Spacing.xl,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.success + '20', // transparent success
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.lg,
        gap: Spacing.xs,
    },
    statusText: {
        ...Typography.body.sm,
        color: Colors.light.success,
        fontWeight: '600',
    },
    actionContainer: {
        width: '100%',
        marginBottom: Spacing.xl,
    },
    mainButton: {
        width: '100%',
        marginBottom: Spacing.md,
    },
    grid: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.card,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    cardDisabled: {
        opacity: 0.6,
        backgroundColor: Colors.light.background,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...Typography.body.lg,
        fontWeight: '700',
        color: Colors.light.text,
    },
    cardSub: {
        ...Typography.body.sm,
        color: Colors.light.textSecondary,
    },
});
