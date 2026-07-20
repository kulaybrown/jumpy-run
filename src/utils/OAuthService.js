import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '../supabaseClient';

// Your native Android deep-link configuration
export const NATIVE_OAUTH_REDIRECT_URL = 'com.iamthelosworld.jumpyrun://auth/callback';

/**
 * Starts the Google Sign-In flow for both Android and Desktop Web
 */
export const startGoogleOAuth = async () => {
  const isNative = Capacitor.isNativePlatform();
  
  // 🛠️ FIXED: Appends the pathname (/jumpy-run) so users don't land on an empty root domain
  const redirectTo = isNative
    ? NATIVE_OAUTH_REDIRECT_URL
    : window.top.location.origin + '/jumpy-run';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (error) throw error;

  if (isNative && data?.url) {
    await Browser.open({ url: data.url });
  } else if (data?.url) {
    window.top.location.href = data.url;
  }
};

/**
 * Handles incoming deep-link callback strings exclusively for the Android App build.
 * With PKCE flow, Supabase sends back "...callback?code=XXXX" instead of
 * "...callback#access_token=XXXX&refresh_token=YYYY", so we exchange the code
 * for a session first. The old hash-based parsing is kept as a fallback only.
 */
export const handleAndroidAuthCallback = async (url) => {
  console.log("📥 DEEP LINK RECEIVED:", url);

  if (!url || !url.startsWith(NATIVE_OAUTH_REDIRECT_URL)) {
    console.log("❌ URL doesn't match expected prefix:", NATIVE_OAUTH_REDIRECT_URL);
    return false;
  }

  try {
    const parsedUrl = new URL(url);

    // ✅ PKCE flow — this is the path that actually runs now
    const code = parsedUrl.searchParams.get('code');
    if (code) {
      console.log("🔑 Exchanging PKCE code for session...");
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      console.log("✅ Session established from code exchange");
      return true;
    }

    // 🕰️ Fallback — old implicit flow hash tokens, in case flowType ever reverts
    const hashParams = new URLSearchParams(parsedUrl.hash.replace('#', ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) throw error;
      return true;
    }

    console.log("❌ No code or access_token found in callback URL");
    return false;
  } catch (err) {
    console.error("🚨 Mobile deep link parser failure:", err);
    return false;
  } finally {
    // Always dismiss the native browser overlay sheet on mobile once done
    await Browser.close().catch(() => {});
  }
};