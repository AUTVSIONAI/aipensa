const normalizeOrigin = (value?: string) =>
  value ? value.replace(/\/$/, "") : value;

const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL),
  normalizeOrigin(process.env.BACKEND_URL),
  ...(process.env.EXTRA_CORS_ORIGINS?.split(",").map(s => s.trim()) || []),
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : [])
].filter(Boolean) as string[];

export { normalizeOrigin, allowedOrigins };
