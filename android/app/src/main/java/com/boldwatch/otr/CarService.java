package com.boldwatch.otr;

import android.util.Log;
import com.google.android.apps.auto.sdk.CarActivity;
import com.google.android.apps.auto.sdk.CarActivityService;

public class CarService extends CarActivityService {
    private static final String TAG = "DNSE_OTR_CarService";

    @Override
    public Class<? extends CarActivity> getCarActivity() {
        return OtrCarActivity.class;
    }

    @Override
    public void onCreate() {
        Log.i(TAG, "Creating DNSE_OTR CarService");
        super.onCreate();
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Destroying DNSE_OTR CarService");
        super.onDestroy();
    }
}
