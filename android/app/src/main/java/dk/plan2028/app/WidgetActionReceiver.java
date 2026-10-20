package dk.plan2028.app;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

/** "Trænet i dag" fra widget eller notifikation, uden at åbne appen. */
public class WidgetActionReceiver extends BroadcastReceiver {

    static final String ACTION_TRAINED = "dk.plan2028.app.TRAINED";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ACTION_TRAINED.equals(intent.getAction())) return;
        String msg = WidgetData.logTrained(context);
        if (intent.getBooleanExtra("fromNotification", false)) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(ReminderReceiver.ID_TRAIN);
        }
        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
    }
}
