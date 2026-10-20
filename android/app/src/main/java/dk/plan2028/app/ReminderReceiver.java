package dk.plan2028.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Icon;

/** Viser en påmindelse som notifikation. */
public class ReminderReceiver extends BroadcastReceiver {

    static final String CHANNEL = "reminders";
    static final int ID_PAY = 1;
    static final int ID_TRAIN = 2;
    static final int ID_WEEK = 3;

    @Override
    public void onReceive(Context c, Intent i) {
        String kind = i.getStringExtra("kind");
        if ("train".equals(kind) && WidgetData.trainedToday(c)) return;

        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel ch = new NotificationChannel(CHANNEL, c.getString(R.string.n_channel),
                NotificationManager.IMPORTANCE_DEFAULT);
        ch.setDescription(c.getString(R.string.n_channel_desc));
        nm.createNotificationChannel(ch);

        int id = "pay".equals(kind) ? ID_PAY : "train".equals(kind) ? ID_TRAIN : ID_WEEK;
        String open = i.getStringExtra("open");
        if (open == null) open = "hjem";
        Intent tap = new Intent(c, MainActivity.class);
        tap.putExtra("open", open);
        tap.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(c, 100 + id, tap,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String title = i.getStringExtra("title");
        String text = i.getStringExtra("text");
        if (title == null) title = "Plan 2028";
        if (text == null) text = "";

        Notification.Builder b = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(R.drawable.ic_stat)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setColor(0xFF2F6BFF)
                .setAutoCancel(true)
                .setContentIntent(content);

        if ("train".equals(kind)) {
            Intent act = new Intent(c, WidgetActionReceiver.class);
            act.setAction(WidgetActionReceiver.ACTION_TRAINED);
            act.putExtra("fromNotification", true);
            PendingIntent done = PendingIntent.getBroadcast(c, 200, act,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            b.addAction(new Notification.Action.Builder(
                    Icon.createWithResource(c, R.drawable.ic_tile), c.getString(R.string.n_action_trained), done).build());
        }

        try {
            nm.notify(id, b.build());
        } catch (SecurityException ignored) {
            // Notifikationer er ikke tilladt. Appen spørger, når brugeren slår påmindelser til.
        }
    }
}
