package dk.plan2028.app;

import android.content.Context;
import android.content.pm.PackageManager;
import android.health.connect.AggregateRecordsRequest;
import android.health.connect.AggregateRecordsResponse;
import android.health.connect.HealthConnectException;
import android.health.connect.HealthConnectManager;
import android.health.connect.ReadRecordsRequestUsingFilters;
import android.health.connect.ReadRecordsResponse;
import android.health.connect.TimeInstantRangeFilter;
import android.health.connect.datatypes.ExerciseSessionRecord;
import android.health.connect.datatypes.StepsRecord;
import android.os.OutcomeReceiver;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.concurrent.Executor;

/**
 * Læser skridt og træningspas fra Health Connect (Android 14+), hvor Samsung Health deler sine data.
 * Kaldes kun, når Build.VERSION.SDK_INT >= 34. Appen skriver aldrig i sundhedsdata.
 */
final class Health {

    static final String READ_STEPS = "android.permission.health.READ_STEPS";
    static final String READ_EXERCISE = "android.permission.health.READ_EXERCISE";
    static final String[] PERMS = {READ_STEPS, READ_EXERCISE};

    interface Done {
        void result(String json);
    }

    private Health() {
    }

    static HealthConnectManager manager(Context c) {
        try {
            return c.getSystemService(HealthConnectManager.class);
        } catch (Exception e) {
            return null;
        }
    }

    static boolean available(Context c) {
        return manager(c) != null;
    }

    static boolean granted(Context c) {
        return c.checkSelfPermission(READ_STEPS) == PackageManager.PERMISSION_GRANTED
                && c.checkSelfPermission(READ_EXERCISE) == PackageManager.PERMISSION_GRANTED;
    }

    static void sync(Context c, Done done) {
        HealthConnectManager m = manager(c);
        if (m == null) {
            done.result("{\"error\":\"unsupported\"}");
            return;
        }
        final Executor ex = c.getMainExecutor();
        final ZoneId zone = ZoneId.systemDefault();
        final LocalDate today = LocalDate.now();
        final JSONObject steps = new JSONObject();
        final JSONArray sessions = new JSONArray();
        final int[] left = {8};
        final boolean[] failed = {false};

        final Runnable finish = () -> {
            if (--left[0] > 0) return;
            try {
                JSONObject o = new JSONObject();
                o.put("steps", steps);
                o.put("sessions", sessions);
                if (failed[0] && steps.length() == 0 && sessions.length() == 0) o.put("error", "read");
                done.result(o.toString());
            } catch (JSONException e) {
                done.result("{\"error\":\"json\"}");
            }
        };

        // Skridt pr. dag de sidste 7 dage. Aggregering undgår dobbelttælling fra telefon og ur.
        for (int i = 0; i < 7; i++) {
            final LocalDate day = today.minusDays(i);
            Instant from = day.atStartOfDay(zone).toInstant();
            Instant to = i == 0 ? Instant.now() : day.plusDays(1).atStartOfDay(zone).toInstant();
            TimeInstantRangeFilter f = new TimeInstantRangeFilter.Builder().setStartTime(from).setEndTime(to).build();
            AggregateRecordsRequest<Long> req = new AggregateRecordsRequest.Builder<Long>(f)
                    .addAggregationType(StepsRecord.STEPS_COUNT_TOTAL)
                    .build();
            m.aggregate(req, ex, new OutcomeReceiver<AggregateRecordsResponse<Long>, HealthConnectException>() {
                @Override
                public void onResult(AggregateRecordsResponse<Long> r) {
                    Long v = r.get(StepsRecord.STEPS_COUNT_TOTAL);
                    try {
                        steps.put(day.toString(), v == null ? 0L : v);
                    } catch (JSONException ignored) {
                    }
                    finish.run();
                }

                @Override
                public void onError(HealthConnectException e) {
                    failed[0] = true;
                    finish.run();
                }
            });
        }

        // Træningspas de sidste 16 uger.
        TimeInstantRangeFilter range = new TimeInstantRangeFilter.Builder()
                .setStartTime(today.minusDays(112).atStartOfDay(zone).toInstant())
                .setEndTime(Instant.now())
                .build();
        ReadRecordsRequestUsingFilters<ExerciseSessionRecord> req =
                new ReadRecordsRequestUsingFilters.Builder<>(ExerciseSessionRecord.class)
                        .setTimeRangeFilter(range)
                        .setPageSize(500)
                        .build();
        m.readRecords(req, ex, new OutcomeReceiver<ReadRecordsResponse<ExerciseSessionRecord>, HealthConnectException>() {
            @Override
            public void onResult(ReadRecordsResponse<ExerciseSessionRecord> r) {
                for (ExerciseSessionRecord s : r.getRecords()) {
                    try {
                        Instant st = s.getStartTime();
                        Instant en = s.getEndTime();
                        JSONObject o = new JSONObject();
                        o.put("d", st.atZone(zone).toLocalDate().toString());
                        o.put("start", st.toEpochMilli());
                        o.put("mins", Math.max(0L, Duration.between(st, en).toMinutes()));
                        CharSequence title = s.getTitle();
                        o.put("title", title == null ? "" : title.toString());
                        sessions.put(o);
                    } catch (JSONException ignored) {
                    }
                }
                finish.run();
            }

            @Override
            public void onError(HealthConnectException e) {
                failed[0] = true;
                finish.run();
            }
        });
    }
}
