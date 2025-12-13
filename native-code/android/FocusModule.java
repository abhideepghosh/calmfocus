package com.calmfocus.app;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.app.AppOpsManager;
import android.os.Process;
import android.net.Uri;
import com.facebook.react.bridge.Promise;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import java.util.List;
import java.util.ArrayList;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

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
            granted = (reactContext.checkCallingOrSelfPermission(android.Manifest.permission.PACKAGE_USAGE_STATS) == PackageManager.PERMISSION_GRANTED);
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
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        WritableArray appList = Arguments.createArray();

        for (ApplicationInfo appInfo : packages) {
            // Filter out system apps if desired, or keep all. 
            // For now, let's keep non-system apps or apps that have a launch intent.
            if (pm.getLaunchIntentForPackage(appInfo.packageName) != null) {
                WritableMap app = Arguments.createMap();
                app.putString("packageName", appInfo.packageName);
                app.putString("name", pm.getApplicationLabel(appInfo).toString());
                // Icon handling is complex to send over bridge, usually we send a URI or handle it differently.
                // For simplicity, we just send existence. The JS side can use package name to fetch icon if using a library,
                // or we can implement a custom content provider. 
                // Let's stick to basics.
                appList.pushMap(app);
            }
        }
        promise.resolve(appList);
    }
}
