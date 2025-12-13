package com.calmfocus.app;

import java.util.HashSet;
import java.util.List;

import javax.naming.Context;

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

    @Override
    public String getName() {
        return "FocusModule";
    }

    @ReactMethod
    public void checkUsagePermission(Promise promise) {
        boolean granted = false;
        AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), reactContext.getPackageName());

        if (mode == AppOpsManager.MODE_DEFAULT) {
            granted = (reactContext.checkCallingOrSelfPermission(
                    android.Manifest.permission.PACKAGE_USAGE_STATS) == PackageManager.PERMISSION_GRANTED);
        } else {
            granted = (mode == AppOpsManager.MODE_ALLOWED);
        }
        promise.resolve(granted);
    }

    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        promise.resolve(Settings.canDrawOverlays(reactContext));
    }

    @ReactMethod
    public void openUsageSettings() {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void openOverlaySettings() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactContext.getPackageName()));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void startMonitoring(String blockedAppsJson) {
        Intent serviceIntent = new Intent(reactContext, FocusService.class);
        serviceIntent.putExtra("BLOCKED_APPS", blockedAppsJson);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent);
        } else {
            reactContext.startService(serviceIntent);
        }
    }

    @ReactMethod
    public void stopMonitoring() {
        Intent serviceIntent = new Intent(reactContext, FocusService.class);
        reactContext.stopService(serviceIntent);
    }

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
