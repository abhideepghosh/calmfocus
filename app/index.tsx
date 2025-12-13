import { Redirect, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import { useStore } from '../store/useStore';

export default function Index() {
    const hasCompletedOnboarding = useStore((state) => state.hasCompletedOnboarding);
    const rootNavigationState = useRootNavigationState();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for navigation to be ready
        if (rootNavigationState?.key) {
            setIsReady(true);
        }
    }, [rootNavigationState]);

    if (!isReady) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (!hasCompletedOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
});
