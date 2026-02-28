import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  let sameSite: "lax" | "none" = "lax";
  let secure = false;
  let domain: string | undefined = undefined;

  try {
    const frontendUrl = process.env.FRONTEND_URL;
    const backendUrl = process.env.BACKEND_URL;
    const cookieDomain = process.env.REFRESH_COOKIE_DOMAIN;

    if (frontendUrl && backendUrl) {
      const frontend = new URL(frontendUrl);
      const backend = new URL(backendUrl);

      secure = backend.protocol === "https:";

      const isCrossSite =
        frontend.protocol !== backend.protocol ||
        frontend.hostname !== backend.hostname;

      if (isCrossSite) {
        sameSite = "none";
        // Para subdomínios, permitir cookie amplo se fornecido
        if (cookieDomain) {
          domain = cookieDomain;
        }
      }
    }
  } catch (_) {}

  if (sameSite === "none" && !secure) {
    sameSite = "lax";
  }

  const options: any = {
    httpOnly: true,
    sameSite,
    secure,
    path: "/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  if (domain) options.domain = domain;
  res.cookie("jrt", token, options);
};
