package dk.plan2028.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.service.quicksettings.TileService;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/**
 * Fælles data for widgets, Quick Settings-feltet og påmindelser.
 * Web-appen sender sine tal hertil, hver gang noget ændres. Træning logget uden for appen
 * lægges i en kø ("pending"), som appen henter, næste gang den åbnes.
 */
public final class WidgetData {

    private static final String PREFS = "plan2028_widget";
    private static final LocalDate START = LocalDate.of(2026, 10, 18);
    private static final LocalDate MOVE = LocalDate.of(2028, 7, 1);

    private WidgetData() {
    }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static String today() {
        return LocalDate.now().toString();
    }

    static String mondayNow() {
        return LocalDate.now().with(DayOfWeek.MONDAY).toString();
    }

    static String monthNow() {
        return today().substring(0, 7);
    }

    static JSONObject read(Context c) {
        try {
            return new JSONObject(prefs(c).getString("data", "{}"));
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    private static JSONArray readPending(SharedPreferences p) {
        try {
            return new JSONArray(p.getString("pending", "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    private static boolean hasPendingToday(SharedPreferences p) {
        JSONArray a = readPending(p);
        String t = today();
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null && "trained".equals(o.optString("type", "")) && t.equals(o.optString("d", ""))) return true;
        }
        return false;
    }

    static synchronized void save(Context c, String json) {
        JSONObject d;
        try {
            d = new JSONObject(json);
        } catch (JSONException e) {
            return;
        }
        SharedPreferences p = prefs(c);
        boolean pendingToday = hasPendingToday(p);
        boolean trained = today().equals(d.optString("today", "")) && d.optBoolean("todayTrained", false);
        if (pendingToday && !trained) {
            try {
                d.put("todayTrained", true);
                d.put("train", d.optInt("train", 0) + 1);
            } catch (JSONException ignored) {
            }
        }
        p.edit()
                .putString("data", d.toString())
                .putString("lastTrained", trained || pendingToday ? today() : "")
                .apply();
        updateAll(c);
    }

    static synchronized String takePending(Context c) {
        SharedPreferences p = prefs(c);
        String s = p.getString("pending", "[]");
        p.edit().putString("pending", "[]").apply();
        return s;
    }

    static boolean trainedToday(Context c) {
        SharedPreferences p = prefs(c);
        return today().equals(p.getString("lastTrained", "")) || hasPendingToday(p);
    }

    static int weekTrain(JSONObject d) {
        return mondayNow().equals(d.optString("week", "")) ? d.optInt("train", 0) : 0;
    }

    /** Ugemålet (antal træningsdage), som web-appen sender med. */
    static int weekGoal(JSONObject d) {
        int g = d.optInt("tgoal", 4);
        return g < 1 ? 4 : g;
    }

    static String weekLabel(Context c) {
        JSONObject d = read(c);
        return weekTrain(d) + "/" + weekGoal(d) + " denne uge";
    }

    /** Logger dagens træning fra widget, notifikation eller Quick Settings uden at åbne appen. */
    static synchronized String logTrained(Context c) {
        if (trainedToday(c)) return "Dagens pas er allerede logget";
        SharedPreferences p = prefs(c);
        JSONObject d = read(c);
        int train = weekTrain(d) + 1;
        JSONArray pend = readPending(p);
        try {
            pend.put(new JSONObject().put("type", "trained").put("d", today()));
            d.put("train", train);
            d.put("week", mondayNow());
            d.put("today", today());
            d.put("todayTrained", true);
        } catch (JSONException e) {
            return "Kunne ikke logge passet";
        }
        p.edit()
                .putString("data", d.toString())
                .putString("pending", pend.toString())
                .putString("lastTrained", today())
                .apply();
        updateAll(c);
        try {
            TileService.requestListeningState(c, new ComponentName(c, TrainTileService.class));
        } catch (Exception ignored) {
        }
        int goal = weekGoal(d);
        return train >= goal ? "Ugens mål er nået · " + train + "/" + goal : "Pas logget · " + train + "/" + goal;
    }

    static long daysToMove() {
        return Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), MOVE));
    }

    static int journeyPct() {
        long total = ChronoUnit.DAYS.between(START, MOVE);
        long done = ChronoUnit.DAYS.between(START, LocalDate.now());
        return (int) Math.max(0, Math.min(100, done * 100 / Math.max(1, total)));
    }

    private static String num(long n) {
        return NumberFormat.getIntegerInstance(new Locale("da", "DK")).format(n);
    }

    private static PendingIntent open(Context c, String target, int code) {
        Intent i = new Intent(c, MainActivity.class);
        i.putExtra("open", target);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(c, code, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent trainedAction(Context c) {
        Intent i = new Intent(c, WidgetActionReceiver.class);
        i.setAction(WidgetActionReceiver.ACTION_TRAINED);
        return PendingIntent.getBroadcast(c, 16, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static RemoteViews overview(Context c) {
        JSONObject d = read(c);
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_overview);
        v.setTextViewText(R.id.w_days, num(daysToMove()));
        v.setProgressBar(R.id.w_journey, 100, journeyPct(), false);

        String next = d.optString("next", "");
        boolean nextValid = !next.isEmpty() && d.optString("nextDate", "").compareTo(today()) >= 0;
        v.setTextViewText(R.id.w_next, nextValid ? next : c.getString(R.string.w_until_sub));

        v.setTextViewText(R.id.w_move, num(d.optLong("move", 0)) + " kr.");
        String eta = d.optString("eta", "");
        v.setTextViewText(R.id.w_move_pct, eta.isEmpty() ? d.optInt("pct", 0) + " % af målet" : eta);

        v.setTextViewText(R.id.w_train, weekTrain(d) + " / " + weekGoal(d));
        int streak = d.optInt("streak", 0);
        v.setTextViewText(R.id.w_streak, streak == 1 ? "1 uge i træk" : streak + " uger i træk");

        double hours = monthNow().equals(d.optString("month", "")) ? d.optDouble("hours", 0) : 0;
        String h = (hours == Math.floor(hours)) ? String.valueOf((long) hours) : String.valueOf(hours).replace('.', ',');
        v.setTextViewText(R.id.w_hours, h + " t");

        boolean done = trainedToday(c);
        v.setTextViewText(R.id.w_btn_trained, c.getString(done ? R.string.w_btn_trained_done : R.string.w_btn_trained));
        v.setInt(R.id.w_btn_trained, "setBackgroundResource", done ? R.drawable.widget_pill_on : R.drawable.widget_pill);
        v.setTextColor(R.id.w_btn_trained, done ? Color.WHITE : c.getColor(R.color.w_ink));

        v.setOnClickPendingIntent(R.id.w_top, open(c, "hjem", 10));
        v.setOnClickPendingIntent(R.id.w_col_move, open(c, "penge", 11));
        v.setOnClickPendingIntent(R.id.w_col_train, open(c, "traening", 12));
        v.setOnClickPendingIntent(R.id.w_col_hours, open(c, "vagter", 13));
        v.setOnClickPendingIntent(R.id.w_btn_shift, open(c, "vagt", 14));
        v.setOnClickPendingIntent(R.id.w_btn_trained, trainedAction(c));
        return v;
    }

    static RemoteViews countdown(Context c) {
        JSONObject d = read(c);
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_countdown);
        v.setTextViewText(R.id.c_days, num(daysToMove()));
        int pct = d.optInt("pct", 0);
        v.setProgressBar(R.id.c_move_bar, 100, pct, false);
        v.setTextViewText(R.id.c_move, "Flyttekonto " + pct + " %");
        v.setTextViewText(R.id.c_eta, d.optString("eta", ""));
        v.setOnClickPendingIntent(R.id.c_root, open(c, "hjem", 20));
        return v;
    }

    static void updateAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        if (m == null) return;
        for (int id : m.getAppWidgetIds(new ComponentName(c, OverviewWidget.class))) {
            m.updateAppWidget(id, overview(c));
        }
        for (int id : m.getAppWidgetIds(new ComponentName(c, CountdownWidget.class))) {
            m.updateAppWidget(id, countdown(c));
        }
    }
}
