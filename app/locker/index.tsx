import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, NativeModules, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';

const { FocusModule } = NativeModules;

interface AppItem {
    packageName: string;
    name: string;
    // icon? 
}

export default function Locker() {
    const { blockedApps, toggleBlockedApp, theme } = useStore();
    const [installedApps, setInstalledApps] = useState<AppItem[]>([]);
    const [loading, setLoading] = useState(true);

    const themeColors = Colors[theme] || Colors.light;

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        if (Platform.OS === 'android' && FocusModule) {
            try {
                const apps = await FocusModule.getInstalledApps();
                // Sort alphabet
                apps.sort((a: AppItem, b: AppItem) => a.name.localeCompare(b.name));
                setInstalledApps(apps);
            } catch (e) {
                console.warn('Failed to load apps', e);
            } finally {
                setLoading(false);
            }
        } else {
            // Mock for iOS or dev without native module
            setInstalledApps([
                { packageName: 'com.instagram.android', name: 'Instagram (Mock)' },
                { packageName: 'com.tiktok.android', name: 'TikTok (Mock)' },
            ]);
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: AppItem }) => {
        const isBlocked = blockedApps.includes(item.packageName);
        return (
            <View style={[styles.item, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={[styles.iconPlaceholder, { backgroundColor: themeColors.secondary }]}>
                    <Text style={[styles.iconText, { color: themeColors.secondaryForeground }]}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.appName, { color: themeColors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.pkgNameDisplay, { color: themeColors.textTertiary }]} numberOfLines={1}>{item.packageName}</Text>
                </View>
                <Switch
                    value={isBlocked}
                    onValueChange={() => toggleBlockedApp(item.packageName)}
                    trackColor={{ false: themeColors.input, true: themeColors.destructive }}
                    thumbColor="#FFF"
                />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
            ) : (
                <FlatList
                    data={installedApps}
                    keyExtractor={item => item.packageName}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={[styles.headerText, { color: themeColors.textSecondary }]}>
                                Select apps to lock completely during Focus Mode.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor set dynamically
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: Spacing.md,
    },
    listHeader: {
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.xs,
    },
    headerText: {
        ...Typography.body.md,
        // color set dynamically
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        // backgroundColor set dynamically
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
        borderWidth: 1,
        // borderColor set dynamically
    },
    iconPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 10,
        // backgroundColor set dynamically
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    iconText: {
        fontSize: 20,
        fontWeight: 'bold',
        // color set dynamically
    },
    info: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    appName: {
        ...Typography.body.lg,
        fontWeight: '600',
        // color set dynamically
    },
    pkgNameDisplay: {
        ...Typography.body.xs,
        // color set dynamically
        marginTop: 2,
    },
});
