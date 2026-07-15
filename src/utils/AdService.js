import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

/**
 * Initializes the native AdMob SDK (Only runs on Android/iOS)
 */
export const initializeAds = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await AdMob.initialize();
      console.log("🤖 Native AdMob Initialized successfully.");
    } catch (err) {
      console.error("AdMob Native Init Failed:", err);
    }
  } else {
    console.log("🌐 Web Testing Environment: Skipping native AdMob init.");
  }
};

/**
 * Orchestrates showing the Rewarded Video Ad
 */
export const showRewardedAd = async (onSuccess, onSkipped) => {
  if (Capacitor.isNativePlatform()) {
    // 📱 NATIVE ADMOB FOR ANDROID
    let settled = false;

    try {
      const listenerHandles = await Promise.all([
        AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          if (settled) return;
          settled = true;
          console.log("🏅 Ad completed natively! Reward:", reward);
          void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
            onSuccess();
          });
        }),
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (settled) return;
          settled = true;
          console.log("❌ Native rewarded ad dismissed before reward.");
          void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
            onSkipped();
          });
        }),
        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
          if (settled) return;
          settled = true;
          console.error("Native rewarded ad failed to load:", error);
          void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
            onSkipped();
          });
        }),
        AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error) => {
          if (settled) return;
          settled = true;
          console.error("Native rewarded ad failed to show:", error);
          void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
            onSkipped();
          });
        })
      ]);

      // Prepare the Reward unit (using standard test ID)
      await AdMob.prepareRewardVideoAd({
        adId: 'ca-app-pub-9125531137074419/8168780965',
      });

      // Show the ad over the native screen
      await AdMob.showRewardVideoAd();

    } catch (err) {
      settled = true;
      console.error("Native AdMob Error:", err);
      onSkipped(); // Fallback if ad loading fails
    }
  } else {
    // 🌐 WEB AD SIMULATION (For testing on GitHub Pages)
    console.log("📺 Web Staging: Triggering mock ad countdown.");
    
    // Simulate your 5-second countdown timer, then trigger reward
    setTimeout(() => {
      onSuccess();
    }, 5000);
  }
};