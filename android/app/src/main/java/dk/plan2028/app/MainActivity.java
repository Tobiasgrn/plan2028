package dk.plan2028.app;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowManager;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.provider.Settings;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Iterator;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {

    private static final String NOTIFY_PERMISSION = "android.permission.POST_NOTIFICATIONS";
    private static final int REQ_NOTIFY = 7;
    private static final int REQ_HEALTH = 8;
    private static final int REQ_SAVE = 9;
    private static final int REQ_PHOTO = 10;
    private static final String ACTION_PERMISSION_USAGE = "android.intent.action.VIEW_PERMISSION_USAGE";

    private WebView web;
    // Holder udskrifts-WebView i live, indtil Android har lavet PDF'en.
    private WebView printView;
    private boolean ready = false;
    // Indholdet, der venter på, at brugeren vælger, hvor filen skal gemmes.
    private String pendingSave;
    // Billedvælgeren til tøj: svaret går tilbage til <input type="file"> på siden.
    private ValueCallback<Uri[]> photoCallback;
    private Uri photoOut;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean night = (getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        int bg = night ? Color.BLACK : Color.parseColor("#F2F2F7");
        int bar = night ? Color.parseColor("#141416") : Color.parseColor("#FAFAFC");

        Window window = getWindow();
        window.setStatusBarColor(bg);
        window.setNavigationBarColor(bar);
        if (!night) {
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }

        web = new WebView(this);
        web.setBackgroundColor(bg);
        web.setVerticalScrollBarEnabled(false);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " Plan2028App");

        web.addJavascriptInterface(new Bridge(), "Plan2028");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                if ("file".equals(scheme) || "about".equals(scheme) || "data".equals(scheme)) return false;
                // Kort og billeder inde i forhåndsvisningen af en hjemmeside må gerne indlæses.
                if (!request.isForMainFrame() && ("http".equals(scheme) || "https".equals(scheme))) return false;
                try {
                    if ("sms".equals(scheme) || "smsto".equals(scheme)) {
                        String ssp = uri.getSchemeSpecificPart();
                        String number = ssp == null ? "" : ssp.split("\\?")[0];
                        // sms:-adresser er "opaque", så teksten hentes direkte fra adressen.
                        String body = ssp != null && ssp.contains("?body=") ? ssp.substring(ssp.indexOf("?body=") + 6) : null;
                        Intent sms = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + number));
                        if (body != null) sms.putExtra("sms_body", body);
                        startActivity(sms);
                    } else if ("mailto".equals(scheme)) {
                        startActivity(new Intent(Intent.ACTION_SENDTO, uri));
                    } else {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    }
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                markReady();
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                return openPhotoChooser(callback, params);
            }
        });

        setContentView(web);

        // Hold systemets splash-skærm, indtil appen har tegnet sit første billede.
        final View content = findViewById(android.R.id.content);
        content.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
            @Override
            public boolean onPreDraw() {
                if (!ready) return false;
                content.getViewTreeObserver().removeOnPreDrawListener(this);
                return true;
            }
        });
        content.postDelayed(this::markReady, 1500);

        if (Build.VERSION.SDK_INT >= 31) {
            getSplashScreen().setOnExitAnimationListener(splash -> {
                View icon = splash.getIconView();
                if (icon != null) icon.animate().scaleX(1.35f).scaleY(1.35f).setDuration(340).start();
                splash.animate().alpha(0f).setDuration(340).withEndAction(splash::remove).start();
            });
        }

        String open = openTarget(getIntent());
        if (savedInstanceState != null && open == null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl("file:///android_asset/index.html" + (open != null ? "#" + Uri.encode(open) : ""));
        }
    }

    /** Hvilken skærm appen skal åbne på: fra widget, genvej, notifikation eller Health Connect. */
    private static String openTarget(Intent i) {
        if (i == null) return null;
        String open = i.getStringExtra("open");
        if (open == null && ACTION_PERMISSION_USAGE.equals(i.getAction())) open = "privacy";
        return open;
    }

    private void markReady() {
        if (ready) return;
        ready = true;
        View content = findViewById(android.R.id.content);
        if (content != null) content.invalidate();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String open = openTarget(intent);
        if (open != null && web != null) {
            web.evaluateJavascript("window.appOpen && window.appOpen(" + JSONObject.quote(open) + ")", null);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.evaluateJavascript("window.appPending && window.appPending()", null);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        WidgetData.updateAll(getApplicationContext());
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (web != null) web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (web == null) {
            finish();
            return;
        }
        web.evaluateJavascript(
                "(function(){try{return window.appBack?String(window.appBack()):'false'}catch(e){return 'false'}})()",
                value -> {
                    if (!"\"true\"".equals(value)) finish();
                });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_HEALTH) {
            boolean all = grantResults.length > 0;
            for (int g : grantResults) all = all && g == PackageManager.PERMISSION_GRANTED;
            if (web != null) web.evaluateJavascript("window.appHealthPerm && window.appHealthPerm('" + (all ? "granted" : "denied") + "')", null);
            return;
        }
        if (requestCode != REQ_NOTIFY) return;
        boolean ok = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
        if (ok) Reminders.reapply(getApplicationContext());
        if (web != null) {
            web.evaluateJavascript("window.appNotify && window.appNotify('" + (ok ? "granted" : "denied") + "')", null);
        }
    }

    /** Kamera direkte (capture) eller et valg mellem kamera og galleri. */
    private boolean openPhotoChooser(ValueCallback<Uri[]> callback, WebChromeClient.FileChooserParams params) {
        if (photoCallback != null) photoCallback.onReceiveValue(null);
        photoCallback = callback;
        photoOut = null;
        try {
            Intent cam = cameraIntent();
            boolean multi = params != null && params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE;
            Intent go;
            if (params != null && params.isCaptureEnabled() && cam != null) {
                go = cam;
            } else {
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("image/*");
                if (multi) pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                go = Intent.createChooser(pick, "Billede af tøj");
                if (cam != null) go.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cam});
            }
            startActivityForResult(go, REQ_PHOTO);
        } catch (Exception e) {
            photoCallback = null;
            photoOut = null;
            callback.onReceiveValue(null);
        }
        return true;
    }

    private Intent cameraIntent() {
        try {
            PhotoProvider.cleanOld(this);
            Uri out = PhotoProvider.uriFor("p" + System.currentTimeMillis() + ".jpg");
            Intent cam = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (cam.resolveActivity(getPackageManager()) == null) return null;
            cam.putExtra(MediaStore.EXTRA_OUTPUT, out);
            cam.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            cam.setClipData(ClipData.newRawUri("", out));
            // Når kameraet vælges inde fra en vælger, får det ikke altid adgangen med. Så giv den direkte.
            for (android.content.pm.ResolveInfo ri : getPackageManager().queryIntentActivities(cam, PackageManager.MATCH_DEFAULT_ONLY)) {
                if (ri.activityInfo != null) grantUriPermission(ri.activityInfo.packageName, out, Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }
            photoOut = out;
            return cam;
        } catch (Exception e) {
            return null;
        }
    }

    private void photoResult(int resultCode, Intent data) {
        Uri[] res = null;
        if (resultCode == RESULT_OK) {
            ClipData clip = data != null ? data.getClipData() : null;
            if (clip != null && clip.getItemCount() > 0) {
                int n = Math.min(clip.getItemCount(), 12), k = 0;
                Uri[] all = new Uri[n];
                for (int i = 0; i < n; i++) {
                    Uri u = clip.getItemAt(i).getUri();
                    if (u != null && (!u.equals(photoOut) || hasPhoto())) all[k++] = u;
                }
                if (k > 0) {
                    res = new Uri[k];
                    System.arraycopy(all, 0, res, 0, k);
                }
            }
            if (res == null && data != null && data.getData() != null && (!data.getData().equals(photoOut) || hasPhoto())) res = new Uri[]{data.getData()};
            // Kameraet gemmer selv billedet hos PhotoProvider og sender ofte intet tilbage.
            if (res == null && hasPhoto()) res = new Uri[]{photoOut};
        }
        if (photoCallback != null) photoCallback.onReceiveValue(res);
        photoCallback = null;
        photoOut = null;
    }

    private boolean hasPhoto() {
        if (photoOut == null) return false;
        try {
            File f = PhotoProvider.fileFor(this, photoOut);
            return f.exists() && f.length() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_PHOTO) {
            photoResult(resultCode, data);
            return;
        }
        if (requestCode != REQ_SAVE) return;
        boolean ok = false;
        if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingSave != null) {
            try (OutputStream os = getContentResolver().openOutputStream(data.getData(), "wt")) {
                if (os != null) {
                    os.write(pendingSave.getBytes(StandardCharsets.UTF_8));
                    ok = true;
                }
            } catch (Exception ignored) {
            }
        }
        pendingSave = null;
        if (web != null) web.evaluateJavascript("window.appSaved && window.appSaved(" + ok + ")", null);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    private static String readAll(InputStream in) throws java.io.IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
        in.close();
        return new String(bo.toByteArray(), StandardCharsets.UTF_8);
    }

    private String notifyState() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(NOTIFY_PERMISSION) != PackageManager.PERMISSION_GRANTED) {
            return "ask";
        }
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        return nm != null && nm.areNotificationsEnabled() ? "granted" : "off";
    }

    /** Det, web-appen kan kalde som window.Plan2028.*. Kører på en baggrundstråd. */
    private class Bridge {
        @JavascriptInterface
        public void widget(final String json) {
            WidgetData.save(getApplicationContext(), json);
        }

        @JavascriptInterface
        public String takePending() {
            return WidgetData.takePending(getApplicationContext());
        }

        @JavascriptInterface
        public void schedule(final String json) {
            Reminders.schedule(getApplicationContext(), json);
        }

        @JavascriptInterface
        public String notifyState() {
            return MainActivity.this.notifyState();
        }

        @JavascriptInterface
        public void requestNotify() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(NOTIFY_PERMISSION) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{NOTIFY_PERMISSION}, REQ_NOTIFY);
                } else if (web != null) {
                    web.evaluateJavascript("window.appNotify && window.appNotify('" + MainActivity.this.notifyState() + "')", null);
                }
            });
        }

        @JavascriptInterface
        public void openNotifySettings() {
            runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                    i.putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
                    startActivity(i);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public String healthState() {
            if (Build.VERSION.SDK_INT < 34) return "unsupported";
            Context c = getApplicationContext();
            if (!Health.available(c)) return "unsupported";
            return Health.granted(c) ? "granted" : "ask";
        }

        @JavascriptInterface
        public void healthConnect() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT < 34) return;
                requestPermissions(Health.PERMS, REQ_HEALTH);
            });
        }

        @JavascriptInterface
        public void healthSync() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT < 34 || !Health.granted(getApplicationContext())) return;
                Health.sync(getApplicationContext(), json -> {
                    if (web != null) web.evaluateJavascript("window.appHealth && window.appHealth(" + JSONObject.quote(json) + ")", null);
                });
            });
        }

        @JavascriptInterface
        public void openHealthSettings() {
            runOnUiThread(() -> {
                String[] actions = {"android.health.connect.action.MANAGE_HEALTH_PERMISSIONS", "android.health.connect.action.HEALTH_HOME_SETTINGS"};
                for (String a : actions) {
                    try {
                        Intent i = new Intent(a);
                        i.putExtra(Intent.EXTRA_PACKAGE_NAME, getPackageName());
                        startActivity(i);
                        return;
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        @JavascriptInterface
        public void haptic(final String kind) {
            runOnUiThread(() -> {
                if (web == null) return;
                int c;
                if ("confirm".equals(kind)) {
                    c = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.CONTEXT_CLICK;
                } else if ("reject".equals(kind)) {
                    c = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.REJECT : HapticFeedbackConstants.LONG_PRESS;
                } else if ("heavy".equals(kind)) {
                    c = HapticFeedbackConstants.LONG_PRESS;
                } else {
                    c = HapticFeedbackConstants.CLOCK_TICK;
                }
                web.performHapticFeedback(c);
            });
        }

        @JavascriptInterface
        public void share(final String text) {
            runOnUiThread(() -> {
                Intent s = new Intent(Intent.ACTION_SEND);
                s.setType("text/plain");
                s.putExtra(Intent.EXTRA_TEXT, text);
                try {
                    startActivity(Intent.createChooser(s, "Del"));
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void copy(final String text) {
            runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("Plan 2028", text));
            });
        }

        /**
         * Slår et firma op i CVR via cvrapi.dk, så appen kan se, om det er reklamebeskyttet.
         * Kører på en baggrundstråd og svarer tilbage med window.appCvr(id, json).
         */
        @JavascriptInterface
        public void cvrLookup(final String id, final String query) {
            new Thread(() -> {
                String body;
                HttpURLConnection c = null;
                try {
                    URL u = new URL("https://cvrapi.dk/api?search=" + URLEncoder.encode(query == null ? "" : query, "UTF-8") + "&country=dk");
                    c = (HttpURLConnection) u.openConnection();
                    c.setConnectTimeout(8000);
                    c.setReadTimeout(8000);
                    c.setRequestProperty("User-Agent", "Plan2028 - privat app til egen kundeliste");
                    int code = c.getResponseCode();
                    InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                    body = in == null ? "{\"error\":\"HTTP " + code + "\"}" : readAll(in);
                } catch (Exception e) {
                    body = "{\"error\":\"NET\"}";
                } finally {
                    if (c != null) c.disconnect();
                }
                final String out = body;
                runOnUiThread(() -> {
                    if (web != null) web.evaluateJavascript("window.appCvr && window.appCvr(" + JSONObject.quote(id) + "," + JSONObject.quote(out) + ")", null);
                });
            }).start();
        }

        /**
         * Netværkskald for web-appen (GitHub og CVR). Kun til de to adresser, så siden
         * ikke kan bruges til at kalde andre steder. Svarer med window.appHttp(id, status, body).
         */
        @JavascriptInterface
        public void http(final String id, final String method, final String url, final String headers, final String body) {
            final boolean allowed = url != null && (url.startsWith("https://api.github.com/") || url.startsWith("https://cvrapi.dk/api"));
            new Thread(() -> {
                int status = 0;
                String out = "";
                HttpURLConnection c = null;
                if (allowed) {
                    try {
                        c = (HttpURLConnection) new URL(url).openConnection();
                        String m = method == null ? "GET" : method.toUpperCase();
                        c.setRequestMethod(m);
                        c.setConnectTimeout(15000);
                        c.setReadTimeout(30000);
                        c.setRequestProperty("User-Agent", "Plan2028 Android-app");
                        if (headers != null && !headers.isEmpty()) {
                            JSONObject h = new JSONObject(headers);
                            Iterator<String> it = h.keys();
                            while (it.hasNext()) {
                                String k = it.next();
                                c.setRequestProperty(k, h.optString(k, ""));
                            }
                        }
                        if (body != null && !body.isEmpty() && !"GET".equals(m)) {
                            c.setDoOutput(true);
                            try (OutputStream os = c.getOutputStream()) {
                                os.write(body.getBytes(StandardCharsets.UTF_8));
                            }
                        }
                        status = c.getResponseCode();
                        InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
                        out = in == null ? "" : readAll(in);
                    } catch (Exception e) {
                        status = 0;
                        out = "";
                    } finally {
                        if (c != null) c.disconnect();
                    }
                }
                final int st = status;
                final String res = out;
                runOnUiThread(() -> {
                    if (web != null) web.evaluateJavascript("window.appHttp && window.appHttp(" + JSONObject.quote(id) + "," + st + "," + JSONObject.quote(res) + ")", null);
                });
            }).start();
        }

        /** Tydelig vibration, fx når løbeturen skifter mellem løb og gang. Mønster: "0,400,200,400". */
        @JavascriptInterface
        public void vibrate(final String pattern) {
            try {
                String[] parts = (pattern == null ? "0,300" : pattern).split(",");
                long[] ms = new long[parts.length];
                for (int i = 0; i < parts.length; i++) ms[i] = Math.max(0, Math.min(2000, Long.parseLong(parts[i].trim())));
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) v.vibrate(VibrationEffect.createWaveform(ms, -1));
            } catch (Exception ignored) {
            }
        }

        /** Holder skærmen tændt under en løbetur, så timeren og vibrationerne fortsætter. */
        @JavascriptInterface
        public void keepAwake(final boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        /** Gemmer en fil (fx hjemmesiden som index.html) der, hvor brugeren vælger. */
        @JavascriptInterface
        public void saveFile(final String name, final String mime, final String content) {
            runOnUiThread(() -> {
                pendingSave = content;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType(mime == null || mime.isEmpty() ? "text/html" : mime);
                i.putExtra(Intent.EXTRA_TITLE, name == null || name.isEmpty() ? "index.html" : name);
                try {
                    startActivityForResult(i, REQ_SAVE);
                } catch (Exception e) {
                    pendingSave = null;
                    if (web != null) web.evaluateJavascript("window.appSaved && window.appSaved(false)", null);
                }
            });
        }

        /** Åbner Androids udskriftsdialog med fakturaen. Vælg "Gem som PDF" som printer. */
        @JavascriptInterface
        public void printHtml(final String html, final String name) {
            runOnUiThread(() -> {
                try {
                    final WebView pv = new WebView(MainActivity.this);
                    printView = pv;
                    pv.setWebViewClient(new WebViewClient() {
                        @Override
                        public void onPageFinished(WebView view, String url) {
                            try {
                                PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                                String job = (name == null || name.isEmpty()) ? "Faktura" : name;
                                PrintDocumentAdapter ad = view.createPrintDocumentAdapter(job);
                                PrintAttributes attrs = new PrintAttributes.Builder()
                                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                        .build();
                                if (pm != null) pm.print(job, ad, attrs);
                            } catch (Exception ignored) {
                            }
                        }
                    });
                    pv.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
                } catch (Exception ignored) {
                }
            });
        }
    }
}
