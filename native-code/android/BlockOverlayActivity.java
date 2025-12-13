package com.calmfocus.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.content.Intent;

public class BlockOverlayActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Simple customized layout strictly in code to avoid XML resource copying issues
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setBackgroundColor(Color.parseColor("#FAFAFA")); // Off-white
        layout.setPadding(50, 50, 50, 50);

        TextView title = new TextView(this);
        title.setText("Focus Mode Active");
        title.setTextSize(24);
        title.setTextColor(Color.parseColor("#1A1A1A"));
        title.setGravity(Gravity.CENTER);
        layout.addView(title);

        TextView subtitle = new TextView(this);
        String blockedPkg = getIntent().getStringExtra("BLOCKED_PACKAGE");
        subtitle.setText("This app is locked until the timer ends.");
        subtitle.setTextSize(16);
        subtitle.setTextColor(Color.parseColor("#666666"));
        subtitle.setGravity(Gravity.CENTER);
        subtitle.setPadding(0, 20, 0, 40);
        layout.addView(subtitle);

        Button closeBtn = new Button(this);
        closeBtn.setText("Close App");
        closeBtn.setBackgroundColor(Color.parseColor("#4A90E2"));
        closeBtn.setTextColor(Color.WHITE);
        
        closeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Go to Home screen
                Intent startMain = new Intent(Intent.ACTION_MAIN);
                startMain.addCategory(Intent.CATEGORY_HOME);
                startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(startMain);
                finish();
            }
        });
        layout.addView(closeBtn);

        setContentView(layout);
    }
    
    @Override
    public void onBackPressed() {
        // Do nothing or go home
        Intent startMain = new Intent(Intent.ACTION_MAIN);
        startMain.addCategory(Intent.CATEGORY_HOME);
        startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(startMain);
    }
}
