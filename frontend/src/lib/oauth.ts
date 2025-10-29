export function fbAuthUrl({ appId, redirectUri, userId }: { appId: string; redirectUri: string; userId: string }) {
  const state = JSON.stringify({ user_id: userId });
  const encodedState = encodeURIComponent(state);

  const base = "https://www.facebook.com/v18.0/dialog/oauth";
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: encodedState,
    scope: "pages_manage_posts,pages_read_engagement",
  });

  return `${base}?${params.toString()}`;
}

export function igAuthUrl({ appId, redirectUri, userId }: { appId: string; redirectUri: string; userId: string }) {
  const state = JSON.stringify({ user_id: userId });
  const encodedState = encodeURIComponent(state);

  const base = "https://www.facebook.com/v18.0/dialog/oauth";
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: encodedState,
    scope: "instagram_basic,instagram_content_publish,pages_show_list",
  });

  return `${base}?${params.toString()}`;
}

export function linkedinAuthUrl({ clientId, redirectUri, state, scopes }: { clientId: string; redirectUri: string; state: string; scopes: string[] }) {
  const base = "https://www.linkedin.com/oauth/v2/authorization";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(" ")
  });
  return `${base}?${params.toString()}`;
}

export function xAuthUrl({ clientId, redirectUri, userId, codeChallenge }: { clientId: string; redirectUri: string; userId: string; codeChallenge: string }) {
  const base = "https://twitter.com/i/oauth2/authorize";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state: JSON.stringify({ user_id: userId }),
    code_challenge: codeChallenge,
    code_challenge_method: "plain"
  });
  return `${base}?${params.toString()}`;
}

export function generateCodeChallenge() {
  // For demo; in production, generate securely
  return "challenge123";
}
