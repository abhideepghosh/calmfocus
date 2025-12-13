const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidPermissions = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        if (!androidManifest.manifest['uses-permission']) {
            androidManifest.manifest['uses-permission'] = [];
        }

        const permissions = androidManifest.manifest['uses-permission'];

        if (!permissions.some(p => p.$['android:name'] === 'android.permission.PACKAGE_USAGE_STATS')) {
            // tools:ignore="ProtectedPermissions" is often needed for this one in strict environments, but let's try standard first
            // actually for usage stats we usually need the xmlns:tools definition which might not be there.
            // Let's just add the permission simply first.
            permissions.push({ $: { 'android:name': 'android.permission.PACKAGE_USAGE_STATS' } });
        }
        if (!permissions.some(p => p.$['android:name'] === 'android.permission.SYSTEM_ALERT_WINDOW')) {
            permissions.push({ $: { 'android:name': 'android.permission.SYSTEM_ALERT_WINDOW' } });
        }
        if (!permissions.some(p => p.$['android:name'] === 'android.permission.FOREGROUND_SERVICE')) {
            permissions.push({ $: { 'android:name': 'android.permission.FOREGROUND_SERVICE' } });
        }

        return config;
    });
};

module.exports = withAndroidPermissions;
