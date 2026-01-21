import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  let sameSite: "lax" | "none" = "lax";
  let secure = false;

  try {
    const frontendUrl = process.env.FRONTEND_URL;
    const backendUrl = process.env.BACKEND_URL;

    if (frontendUrl && backendUrl) {
      const frontend = new URL(frontendUrl);
      const backend = new URL(backendUrl);

      secure = backend.protocol === "https:";

      const isCrossSite =
        frontend.protocol !== backend.protocol || frontend.hostname !== backend.hostname;

      if (isCrossSite) {
        sameSite = "none";
      }
    }
  } catch (_) {}

  if (sameSite === "none" && !secure) {
    sameSite = "lax";
  }

  res.cookie("jrt", token, { httpOnly: true, sameSite, secure, path: "/" });
};
