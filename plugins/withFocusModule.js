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
            const files = ['FocusModule.java', 'FocusPackage.java', 'FocusService.java', 'BlockOverlayActivity.java', 'AppBlockingAccessibilityService.java'];

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
        if (!src.includes('FocusPackage()')) {
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

        // AppBlockingAccessibilityService
        if (!mainApplication.service) {
            mainApplication.service = [];
        }

        if (!mainApplication.service.some(s => s.$['android:name'] === '.AppBlockingAccessibilityService')) {
            mainApplication.service.push({
                $: {
                    'android:name': '.AppBlockingAccessibilityService',
                    'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
                    'android:exported': 'true'
                },
                'intent-filter': [
                    {
                        action: [
                            { $: { 'android:name': 'android.accessibilityservice.AccessibilityService' } }
                        ]
                    }
                ],
                'meta-data': [
                    {
                        $: {
                            'android:name': 'android.accessibilityservice',
                            'android:resource': '@xml/accessibility_service_config'
                        }
                    }
                ]
            });
        }

        // FocusService
        if (!mainApplication.service.some(s => s.$['android:name'] === '.FocusService')) {
            mainApplication.service.push({
                $: {
                    'android:name': '.FocusService',
                    'android:enabled': 'true',
                    'android:exported': 'false',
                    'android:foregroundServiceType': 'dataSync'
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
