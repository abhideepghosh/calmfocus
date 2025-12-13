const { withDangerousMod, withMainApplication, withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFocusModule = (config) => {
    // 1. Copy source files
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            // Target path in the android project
            const packagePath = 'app/src/main/java/com/calmfocus/app';
            const destDir = path.join(config.modRequest.platformProjectRoot, packagePath);

            // Source files
            const sourceDir = path.join(projectRoot, 'native-code/android');
            const files = ['FocusModule.java', 'FocusPackage.java', 'FocusService.java', 'BlockOverlayActivity.java'];

            files.forEach(file => {
                const src = path.join(sourceDir, file);
                const dest = path.join(destDir, file);
                if (fs.existsSync(src)) {
                    fs.copyFileSync(src, dest);
                } else {
                    console.warn(`Warning: Could not find native source file: ${src}`);
                }
            });

            return config;
        },
    ]);

    // 2. Patch MainApplication.kt to register package
    config = withMainApplication(config, (config) => {
        let src = config.modResults.contents;

        // Add import
        if (!src.includes('import com.calmfocus.app.FocusPackage')) {
            src = src.replace('package com.calmfocus.app', 'package com.calmfocus.app\nimport com.calmfocus.app.FocusPackage');
        }

        // Add Package to getPackages()
        // Pattern: PackageList(this).packages
        // Replacement: PackageList(this).packages.toMutableList().apply { add(FocusPackage()) }
        // Or simpler if it's just a return: return PackageList(this).packages

        // Check if we already added it
        if (!src.includes('FocusPackage()')) {
            // This regex looks for the standard getPackages implementation in Expo's template
            // Note: The template might vary, so we try to be robust.
            // Usually: override fun getPackages(): List<ReactPackage> = PackageList(this).packages
            // OR:
            // override fun getPackages(): List<ReactPackage> {
            //   return PackageList(this).packages
            // }

            if (src.includes('PackageList(this).packages')) {
                src = src.replace(
                    /PackageList\(this\).packages/g,
                    'PackageList(this).packages.apply { add(FocusPackage()) }'
                );
            } else {
                console.warn('Could not find PackageList(this).packages in MainApplication.kt to patch.');
            }
        }

        config.modResults.contents = src;
        return config;
    });

    // 3. Update AndroidManifest.xml
    config = withAndroidManifest(config, (config) => {
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

        // Add Service
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'service', // This helper is typically for metadata, but we can manually add children
            'FocusService' // Value - irrelevant here as we do manual push below
        );

        // Helper doesn't exist for adding Services/Activities directly easily, so we access the raw array
        if (!mainApplication.service) {
            mainApplication.service = [];
        }

        // FocusService
        if (!mainApplication.service.some(s => s.$['android:name'] === '.FocusService')) {
            mainApplication.service.push({
                $: {
                    'android:name': '.FocusService',
                    'android:enabled': 'true',
                    'android:exported': 'false', // Internal use
                    'android:foregroundServiceType': 'dataSync' // Optional, but good for O+
                }
            });
        }

        // BlockOverlayActivity
        if (!mainApplication.activity) {
            mainApplication.activity = [];
        }

        if (!mainApplication.activity.some(a => a.$['android:name'] === '.BlockOverlayActivity')) {
            mainApplication.activity.push({
                $: {
                    'android:name': '.BlockOverlayActivity',
                    'android:theme': '@android:style/Theme.NoTitleBar.Fullscreen',
                    'android:excludeFromRecents': 'true',
                    'android:launchMode': 'singleInstance'
                }
            });
        }

        return config;
    });

    return config;
};

module.exports = withFocusModule;
