package com.calmfocus.app;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Arrays;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONException;

public class FocusService extends Service {
    private Handler handler = new Handler(Looper.getMainLooper());
    private boolean isRunning = false;
    private Set<String> blockedPackages = new HashSet<>();
    private static final String CHANNEL_ID = "FocusServiceChannel";

    private Runnable checkRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isRunning) return;
            checkCurrentApp();
            handler.postDelayed(this, 1000); // Check every second
        }
    };

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

    private void checkCurrentApp() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            UsageStatsManager mUsageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
            long time = System.currentTimeMillis();
            
            // queryEvents is more accurate for real-time foreground detection than queryUsageStats
            android.app.usage.UsageEvents events = mUsageStatsManager.queryEvents(time - 1000 * 5, time); // Look back 5 seconds
            android.app.usage.UsageEvents.Event currentEvent = new android.app.usage.UsageEvents.Event();
            String topPackageName = null;

            // Iterate to find the latest MOVE_TO_FOREGROUND event
            while (events.hasNextEvent()) {
                events.getNextEvent(currentEvent);
                if (currentEvent.getEventType() == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    topPackageName = currentEvent.getPackageName();
                }
            }

            if (topPackageName != null && blockedPackages.contains(topPackageName)) {
                // Double check if we are already overlaying to avoid spamming activities
                // In a real scenario, we might want to check if the top app is NOT our overlay
                // For now, simpler is better: if blocked app is top, show overlay.
                
                Intent intent = new Intent(this, BlockOverlayActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                intent.putExtra("BLOCKED_PACKAGE", topPackageName);
                startActivity(intent);
            }
        }
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

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Focus Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
