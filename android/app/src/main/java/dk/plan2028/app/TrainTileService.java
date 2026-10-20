package dk.plan2028.app;

import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;
import android.widget.Toast;

/** Felt i panelet, når man swiper ned: tryk for at logge dagens træning. */
public class TrainTileService extends TileService {

    @Override
    public void onStartListening() {
        super.onStartListening();
        refresh();
    }

    @Override
    public void onClick() {
        super.onClick();
        String msg = WidgetData.logTrained(this);
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
        refresh();
    }

    private void refresh() {
        Tile t = getQsTile();
        if (t == null) return;
        boolean done = WidgetData.trainedToday(this);
        t.setState(done ? Tile.STATE_ACTIVE : Tile.STATE_INACTIVE);
        t.setLabel(getString(R.string.tile_label));
        if (Build.VERSION.SDK_INT >= 29) t.setSubtitle(WidgetData.weekLabel(this));
        t.updateTile();
    }
}
