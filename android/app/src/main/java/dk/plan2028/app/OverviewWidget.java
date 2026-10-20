package dk.plan2028.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** 4×2 widget: nedtælling, flyttekonto, træning, timer og to genveje. */
public class OverviewWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) {
            manager.updateAppWidget(id, WidgetData.overview(context));
        }
    }
}
