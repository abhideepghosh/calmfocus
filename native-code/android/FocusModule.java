package com.calmfocus.app;

import java.util.HashSet;
import java.util.List;

import android.content.Context;

import com.calmfocus.app.FocusService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import android.app.AppOpsManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;

public class FocusModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    FocusModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    private static final String PREFS_NAME = "FocusPrefs";
    private static final String BLOCKED_APPS_KEY = "blocked_apps";

    @Override
    public String getName() {
        return "FocusModule";
    }

    @ReactMethod
    public void isAccessibilityEnabled(Promise promise) {
        int accessibilityEnabled = 0;
        final String service = reactContext.getPackageName() + "/"
                + AppBlockingAccessibilityService.class.getCanonicalName();
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                    reactContext.getApplicationContext().getContentResolver(),
                    android.provider.Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException e) {
            e.printStackTrace();
        }

        android.text.TextUtils.SimpleStringSplitter mStringColonSplitter = new android.text.TextUtils.SimpleStringSplitter(
                ':');

        if (accessibilityEnabled == 1) {
            String settingValue = Settings.Secure.getString(
                    reactContext.getApplicationContext().getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (settingValue != null) {
                mStringColonSplitter.setString(settingValue);
                while (mStringColonSplitter.hasNext()) {
                    String accessibilityService = mStringColonSplitter.next();
                    if (accessibilityService.equalsIgnoreCase(service)) {
                        promise.resolve(true);
                        return;
                    }
                }
            }
        }
        promise.resolve(false);
    }

    @ReactMethod
    public void openAccessibilitySettings() {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    /**
     * Checks if the user has granted the "Display over other apps" permission.
     */
    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        promise.resolve(Settings.canDrawOverlays(reactContext));
    }

    /**
     * Opens the system settings screen for Overlay permissions for this app.
     */
    @ReactMethod
    public void openOverlaySettings() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactContext.getPackageName()));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    /**
     * Starts the FocusService to monitor app usage.
     * 
     * @param blockedAppsJson JSON string of package names to block.
     */
    @ReactMethod
    public void startMonitoring(String blockedAppsJson) {
        // Save to SharedPrefs for AccessibilityService to pick up
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(BLOCKED_APPS_KEY, blockedAppsJson)
                .apply();

        // also start the foreground service for notification persistence
        Intent serviceIntent = new Intent(reactContext, FocusService.class);
        serviceIntent.putExtra("BLOCKED_APPS", blockedAppsJson);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent);
        } else {
            reactContext.startService(serviceIntent);
        }
    }

    /**
     * Stops the FocusService.
     */
    @ReactMethod
    public void stopMonitoring() {
        // Clear blocked apps in SharedPrefs
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .remove(BLOCKED_APPS_KEY)
                .apply();

        Intent serviceIntent = new Intent(reactContext, FocusService.class);
        reactContext.stopService(serviceIntent);
    }

    /**
     * Returns a list of installed applications that have a launchable activity.
     */
    @ReactMethod
    public void getInstalledApps(Promise promise) {
        PackageManager pm = reactContext.getPackageManager();
        Intent intent = new Intent(Intent.ACTION_MAIN, null);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);

        // This returns a list of ResolveInfo objects
        List<android.content.pm.ResolveInfo> apps = pm.queryIntentActivities(intent, 0);

        WritableArray appList = Arguments.createArray();

        // Use a set to avoid duplicates if multiple activities point to same package
        HashSet<String> addedPackages = new HashSet<>();

        for (android.content.pm.ResolveInfo resolveInfo : apps) {
            String packageName = resolveInfo.activityInfo.packageName;

            if (!addedPackages.contains(packageName)) {
                // Determine label: loadLabel returns CharSequence
                String label = resolveInfo.loadLabel(pm).toString();

                WritableMap app = Arguments.createMap();
                app.putString("packageName", packageName);
                app.putString("name", label);

                appList.pushMap(app);
                addedPackages.add(packageName);
            }
        }
        promise.resolve(appList);
    }
}
