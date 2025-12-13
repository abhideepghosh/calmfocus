import { Linking, NativeModules, Platform } from 'react-native';

const { FocusModule } = NativeModules;

export const PermissionService = {
    requestUsageStatsPermission: async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                // Check if already granted
                const granted = await FocusModule.checkUsagePermission();
                if (granted) return true;

                // Open settings
                FocusModule.openUsageSettings();
                return false; // User needs to toggle it
            } catch (e) {
                console.warn('Failed to request usage stats', e);
                // Fallback
                try {
                    await Linking.openSettings();
                } catch (err) { }
                return false;
            }
        }
        return true;
    },

    requestOverlayPermission: async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await FocusModule.checkOverlayPermission();
                if (granted) return true;

                FocusModule.openOverlaySettings();
                return false;
            } catch (e) {
                console.warn('Failed to open overlay settings', e);
                return false;
            }
        }
        return true;
    }
};
