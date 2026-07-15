import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '../supabaseClient';

export const NATIVE_OAUTH_REDIRECT_URL = 'com.iamthelosworld.jumpyrun://auth/callback';

export const startGoogleOAuth = async () => {
  const isNative = Capacitor.isNativePlatform();
  const redirectTo = isNative ? NATIVE_OAUTH_REDIRECT_URL : window.location.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: isNative
    }
  });

  if (error) throw error;

  if (isNative && data?.url) {
    await Browser.open({ url: data.url });
  }
};

export const handleOAuthCallbackUrl = async (url) => {
  if (!url || !url.startsWith(NATIVE_OAUTH_REDIRECT_URL)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
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

    const code = parsedUrl.searchParams.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      return true;
    }

    return false;
  } finally {
    await Browser.close().catch(() => {});
  }
};