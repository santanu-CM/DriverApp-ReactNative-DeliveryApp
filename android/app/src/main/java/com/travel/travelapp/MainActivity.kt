package com.travel.travelapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this, R.style.SplashTheme, true); // 👈 Show splash screen before calling super
    super.onCreate(savedInstanceState)
  }

  override fun getMainComponentName(): String = "Group Travel"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
