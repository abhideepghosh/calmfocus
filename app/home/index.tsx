import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, NativeModules, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Timer } from '../../components/ui/Timer';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';

export default function Home() {
    const router = useRouter();
    const {
        isFocusModeActive, setFocusModeActive,
        timerDuration, setTimerDuration,
        blockedApps,
        timerEndTime, setTimerEndTime,
        theme, toggleTheme
    } = useStore();

    const [remaining, setRemaining] = React.useState(timerDuration);

    // Sync remaining with duration when not running logic
    useEffect(() => {
        if (!isFocusModeActive) {
            setRemaining(timerDuration);
        }
    }, [timerDuration, isFocusModeActive]);

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
        }
        return () => clearInterval(interval);
    }, [isFocusModeActive, timerEndTime, setFocusModeActive, setTimerEndTime]);

    const toggleFocus = () => {
        if (isFocusModeActive) {
            setFocusModeActive(false);
            setTimerEndTime(null);
            if (Platform.OS === 'android' && NativeModules.FocusModule) {
                NativeModules.FocusModule.stopMonitoring();
            }
        } else {
            const endTime = Date.now() + remaining * 1000;
            setTimerEndTime(endTime);
            setFocusModeActive(true);

            if (Platform.OS === 'android' && NativeModules.FocusModule) {
                // Pass blocked apps list to native service
                NativeModules.FocusModule.startMonitoring(JSON.stringify(blockedApps));
            }
        }
    };

    const handleDurationChange = (newDuration: number) => {
        if (!isFocusModeActive) {
            setTimerDuration(newDuration);
            setRemaining(newDuration);
        }
    };

    const showInfo = () => {
        Alert.alert(
            "Privacy First",
            "This app is completely offline and stores no data. Your privacy is paramount."
        );
    };

    // Ensure we use the correct colors based on theme if we implemented full theming
    // For now, assuming Colors[theme] pattern or just keeping existing Colors.light references 
    // but toggling logic exists. 
    // Since Colors.light is hardcoded in styles, real dark mode requires dynamic styles.
    // For this task, I will stick to adding the BUTTON for dark mode as requested, 
    // and basic connection, assuming global styles update or context. 
    // With `useStore` I can conditionally pick colors.

    // Quick Fix: Dynamic Styles
    const themeColors = Colors[theme] || Colors.light;
    const isDark = theme === 'dark';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <View>
                    {/* Updated Header: "Calm Focus" bold, removed greeting */}
                    <Text style={[styles.headerTitle, { color: themeColors.text }]}>Calm Focus</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={toggleTheme}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={isDark ? "weather-sunny" : "weather-night"}
                            size={24}
                            color={themeColors.text}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={showInfo}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="information-variant" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.main}>
                <View style={styles.timerContainer}>
                    <Timer
                        duration={timerDuration}
                        remaining={remaining}
                        onChange={isFocusModeActive ? undefined : handleDurationChange}
                        colors={themeColors}
                    />
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
                        colors={themeColors}
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
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    iconButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.light.card, // Static for now or dynamic if inline
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
