package com.calmfocus.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;
import android.content.Context;
import org.json.JSONArray;
import org.json.JSONException;
import java.util.HashSet;
import java.util.Set;

public class AppBlockingAccessibilityService extends AccessibilityService {

    private Set<String> blockedPackages = new HashSet<>();
    private static final String PREFS_NAME = "FocusPrefs";
    private static final String BLOCKED_APPS_KEY = "blocked_apps";

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        loadBlockedApps();
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            if (event.getPackageName() != null) {
                String packageName = event.getPackageName().toString();
                checkAndBlock(packageName);
            }
        }
    }

    @Override
    public void onInterrupt() {
        // Required method
    }

    private void loadBlockedApps() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String blockedJson = prefs.getString(BLOCKED_APPS_KEY, "[]");
        blockedPackages.clear();
        try {
            JSONArray arr = new JSONArray(blockedJson);
            for (int i = 0; i < arr.length(); i++) {
                blockedPackages.add(arr.getString(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void checkAndBlock(String packageName) {
        // Reload every time to be sure? Or use a listener?
        // optimizing: load blocked apps on every check might be too heavy?
        // Ideally FocusModule should notify us, but SharedPreferences is a simple bridge.
        // Let's reload to be safe and responsive to changes immediately.
        loadBlockedApps(); 

        if (blockedPackages.contains(packageName) && !packageName.equals(getPackageName())) {
            // 1. Go Home
            performGlobalAction(GLOBAL_ACTION_HOME);

            // 2. Show Overlay
            Intent intent = new Intent(this, BlockOverlayActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("BLOCKED_PACKAGE", packageName);
            startActivity(intent);
        }
    }
}
