package dk.plan2028.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Lægger påmindelser ind igen efter genstart eller opdatering af appen. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Reminders.reapply(context);
        WidgetData.updateAll(context);
    }
}
