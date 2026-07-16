import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

let crazySdkInitPromise = null;

const isCrazyGamesEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const sdk = window.CrazyGames?.SDK;
  return !!sdk && (sdk.environment === 'local' || sdk.environment === 'crazygames');
};

const ensureCrazyGamesInitialized = async () => {
  if (!isCrazyGamesEnvironment()) return false;

  if (!crazySdkInitPromise) {
    crazySdkInitPromise = window.CrazyGames.SDK.init().catch((err) => {
      console.error('CrazyGames SDK init failed:', err);
      crazySdkInitPromise = null;
      throw err;
    });
  }

  await crazySdkInitPromise;
  return true;
};

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
    try {
      const initialized = await ensureCrazyGamesInitialized();
      if (initialized) {
        console.log('🎮 CrazyGames SDK initialized for web ads.');
        return;
      }
    } catch (err) {
      console.warn('CrazyGames SDK unavailable; using local web ad fallback.', err);
    }

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
    let rewardEarned = false;
    let adDismissed = false;

    try {
      const listenerHandles = await Promise.all([
        AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          if (settled) return;
          rewardEarned = true;
          console.log("🏅 Ad completed natively! Reward:", reward);

          // Some native SDK flows emit Rewarded before the ad UI is dismissed.
          // Resume gameplay only after both reward and dismiss have been observed.
          if (adDismissed) {
            settled = true;
            void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
              onSuccess();
            });
          }
        }),
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (settled) return;
          adDismissed = true;

          if (rewardEarned) {
            settled = true;
            console.log("✅ Native rewarded ad dismissed after reward.");
            void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
              onSuccess();
            });
          } else {
            settled = true;
            console.log("❌ Native rewarded ad dismissed before reward.");
            void Promise.allSettled(listenerHandles.map((handle) => handle.remove())).finally(() => {
              onSkipped();
            });
          }
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
  } else if (isCrazyGamesEnvironment()) {
    try {
      await ensureCrazyGamesInitialized();

      window.CrazyGames.SDK.ad.requestAd('rewarded', {
        adStarted: () => {
          console.log('🎬 CrazyGames rewarded ad started.');
        },
        adFinished: () => {
          console.log('🏅 CrazyGames rewarded ad finished.');
          onSuccess();
        },
        adError: (errorData) => {
          console.warn('⚠️ CrazyGames rewarded ad error:', errorData);
          onSkipped();
        }
      });
    } catch (err) {
      console.error('CrazyGames rewarded ad request failed:', err);
      onSkipped();
    }
  } else {
    // 🌐 WEB AD SIMULATION (For non-CrazyGames domains)
    console.log("📺 Web Staging: Triggering mock ad countdown.");

    setTimeout(() => {
      onSuccess();
    }, 5000);
  }
};