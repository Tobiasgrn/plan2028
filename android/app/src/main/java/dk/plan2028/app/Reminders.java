package dk.plan2028.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Planlægger påmindelser. Web-appen sender en liste med tidspunkter og tekster,
 * og listen gemmes, så den kan lægges ind igen efter genstart af telefonen.
 */
final class Reminders {

    private static final int MAX = 40;
    private static final int BASE = 1000;

    private Reminders() {
    }

    static void schedule(Context c, String json) {
        WidgetData.prefs(c).edit().putString("sched", json).apply();
        apply(c, json);
    }

    static void reapply(Context c) {
        apply(c, WidgetData.prefs(c).getString("sched", "[]"));
    }

    private static void apply(Context c, String json) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        for (int i = 0; i < MAX; i++) {
            PendingIntent old = PendingIntent.getBroadcast(c, BASE + i, new Intent(c, ReminderReceiver.class),
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (old != null) {
                am.cancel(old);
                old.cancel();
            }
        }

        JSONArray arr;
        try {
            arr = new JSONArray(json);
        } catch (JSONException e) {
            return;
        }
        long now = System.currentTimeMillis();
        int n = 0;
        for (int i = 0; i < arr.length() && n < MAX; i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o == null) continue;
            long at = o.optLong("at", 0);
            if (at <= now) continue;
            Intent it = new Intent(c, ReminderReceiver.class);
            it.putExtra("title", o.optString("title", "Plan 2028"));
            it.putExtra("text", o.optString("text", ""));
            it.putExtra("open", o.optString("open", "hjem"));
            it.putExtra("kind", o.optString("kind", ""));
            PendingIntent pi = PendingIntent.getBroadcast(c, BASE + n, it,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            n++;
        }
    }
}
