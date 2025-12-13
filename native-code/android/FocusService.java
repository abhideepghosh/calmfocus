package com.calmfocus.app;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import android.os.Handler;

import android.app.Notification;
import android.content.Context;

import org.json.JSONArray;
import org.json.JSONException;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import androidx.core.app.NotificationCompat;

public class FocusService extends android.app.Service {
    private static final String CHANNEL_ID = "FocusServiceChannel";
    private Handler handler = new Handler(Looper.getMainLooper());
    private boolean isRunning = false;
    private Set<String> blockedPackages = new HashSet<>();

    private Runnable checkRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isRunning)
                return;
            checkCurrentApp();
            handler.postDelayed(this, 1000); // Check every second
        }
    };

    /**
     * Called when the service is started.
     * Parses the list of blocked apps and starts the foreground notification.
     */
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String blockedJson = intent.getStringExtra("BLOCKED_APPS");
        if (blockedJson != null) {
            parseBlockedApps(blockedJson);
        }

        createNotificationChannel();
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Focus Mode Active")
                .setContentText("Monitoring usage to keep you focused.")
                .setSmallIcon(android.R.drawable.ic_lock_lock) // Use a distinct icon if available
                .build();
        startForeground(1, notification);

        if (!isRunning) {
            isRunning = true;
            handler.post(checkRunnable);
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        isRunning = false;
        handler.removeCallbacks(checkRunnable);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // We don't bind
    }

    /**
     * Parses the JSON string of blocked package names.
     */
    private void parseBlockedApps(String json) {
        blockedPackages.clear();
        try {
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                blockedPackages.add(arr.getString(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * Checks the currently active application.
     * Uses UsageEvents for high precision (immediate changes) and falls back to
     * UsageStats.
     * If a blocked app is detected, it launches the BlockOverlayActivity.
     */
    private void checkCurrentApp() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            UsageStatsManager mUsageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
            long time = System.currentTimeMillis();
            String topPackageName = null;

            // 1. Try UsageEvents for immediate transitions (last 5 seconds)
            android.app.usage.UsageEvents events = mUsageStatsManager.queryEvents(time - 1000 * 5, time);
            android.app.usage.UsageEvents.Event currentEvent = new android.app.usage.UsageEvents.Event();

            while (events.hasNextEvent()) {
                events.getNextEvent(currentEvent);
                if (currentEvent.getEventType() == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    topPackageName = currentEvent.getPackageName();
                }
            }

            // 2. Fallback: If no event found (e.g. user is staring at same app for > 5s),
            // queryUsageStats
            if (topPackageName == null) {
                List<UsageStats> stats = mUsageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY,
                        time - 1000 * 10, time);
                if (stats != null) {
                    SortedMap<Long, UsageStats> mySortedMap = new TreeMap<>();
                    for (UsageStats usageStats : stats) {
                        mySortedMap.put(usageStats.getLastTimeUsed(), usageStats);
                    }
                    if (!mySortedMap.isEmpty()) {
                        topPackageName = mySortedMap.get(mySortedMap.lastKey()).getPackageName();
                    }
                }
            }

            if (topPackageName != null && blockedPackages.contains(topPackageName)) {
                Intent intent = new Intent(this, BlockOverlayActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                intent.putExtra("BLOCKED_PACKAGE", topPackageName);
                startActivity(intent);
            }
        }
    }

    /**
     * Creates the notification channel required for Android Oreo and above.
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Focus Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
