import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { SafetyService } from '../../services/SafetyService';
import { useStore } from '../../store/useStore';

export default function Browser() {
    const router = useRouter();
    const { theme } = useStore();
    const themeColors = Colors[theme as 'light' | 'dark'] || Colors.light;

    const [url, setUrl] = useState('https://google.com');
    const [currentUrl, setCurrentUrl] = useState('https://google.com');
    const [isBlocked, setIsBlocked] = useState(false);
    const webViewRef = useRef<WebView>(null);

    // ...

    useEffect(() => {
        return () => {
            // Cleanup on exit
            if (webViewRef.current) {
                webViewRef.current?.clearCache(true);
                webViewRef.current?.clearHistory();
                // Cookies are handled by incognito=true on session level usually, 
                // but we can also use CookieManager if needed.
                // For now, clearCache and incognito is robust.
            }
        };
    }, []);

    const handleGo = () => {
        let submitUrl = url;
        if (!submitUrl.trim().startsWith('http')) {
            submitUrl = 'https://' + submitUrl.trim();
        }
        setCurrentUrl(submitUrl);
        setIsBlocked(false);
    };

    if (isBlocked) {
        return (
            <View style={styles.blockedContainer}>
                <View style={styles.IconWrapper}>
                    <MaterialCommunityIcons name="shield-alert" size={64} color="#FFF" />
                </View>
                <Text style={styles.blockedTitle}>Page Blocked</Text>
                <Text style={styles.blockedSub}>This content is restricted during focus mode.</Text>
                <View style={styles.quoteBox}>
                    <Text style={styles.quote}>"Stay focused on your goals."</Text>
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => { setIsBlocked(false); router.back(); }} activeOpacity={0.9}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
                    <MaterialCommunityIcons name="close" size={24} color={themeColors.text} />
                </TouchableOpacity>

                <View style={[styles.urlBar, { backgroundColor: themeColors.input }]}>
                    <View style={styles.lockIcon}>
                        <MaterialCommunityIcons name="lock" size={14} color={themeColors.success} />
                    </View>
                    <TextInput
                        style={[styles.input, { color: themeColors.text }]}
                        value={url}
                        onChangeText={setUrl}
                        onSubmitEditing={handleGo}
                        autoCapitalize="none"
                        keyboardType="url"
                        placeholder="Search or enter website name"
                        autoCorrect={false}
                        placeholderTextColor={themeColors.textTertiary}
                    />
                </View>
                <TouchableOpacity onPress={handleGo} style={styles.goBtn}>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={themeColors.text} />
                </TouchableOpacity>
            </View>

            <WebView
                ref={webViewRef}
                source={{ uri: currentUrl }}
                style={{ flex: 1 }}
                incognito={true} // Enable private browsing
                cacheEnabled={false} // Disable cache
                onNavigationStateChange={(navState) => {
                    // Update URL bar
                    if (navState.url) {
                        setUrl(navState.url);
                        SafetyService.checkUrl(navState.url).then(safe => {
                            if (!safe) setIsBlocked(true);
                        });
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor set dynamically
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderBottomWidth: 1,
        // borderBottomColor: Colors.light.border,
        // backgroundColor: Colors.light.background,
    },
    navIcon: {
        padding: Spacing.sm,
    },
    goBtn: {
        padding: Spacing.sm,
    },
    urlBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: Colors.light.input,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 44,
        marginHorizontal: Spacing.xs,
    },
    lockIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        // color: Colors.light.text,
    },
    // Blocked State styles - keeping custom colors for immediate impact, but matched to theme
    blockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.destructive,
        padding: Spacing.xl,
    },
    IconWrapper: {
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 100,
    },
    blockedTitle: {
        ...Typography.heading.hero,
        color: '#FFF',
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    blockedSub: {
        ...Typography.body.lg,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    quoteBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xxl,
    },
    quote: {
        ...Typography.body.lg,
        fontStyle: 'italic',
        color: '#FFF',
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#FFF',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        ...Shadows.md,
    },
    backButtonText: {
        color: Colors.light.destructive,
        fontWeight: '800',
        fontSize: 16,
    }
});
