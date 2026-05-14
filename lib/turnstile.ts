type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string | undefined | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const bypass = process.env.DEV_BYPASS_TURNSTILE === "true";
  const devNoKeys =
    process.env.NODE_ENV === "development" &&
    (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  if (bypass || devNoKeys) {
    return { ok: true as const, bypass: true };
  }

  if (!token || !secret) {
    return { ok: false as const, reason: "missing_token_or_secret" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!res.ok) {
    return { ok: false as const, reason: "upstream_error" };
  }

  const data = (await res.json()) as TurnstileVerifyResponse;
  if (!data.success) {
    return {
      ok: false as const,
      reason: data["error-codes"]?.join(",") ?? "verify_failed",
    };
  }

  return { ok: true as const, bypass: false };
}
