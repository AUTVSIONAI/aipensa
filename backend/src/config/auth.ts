if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

export default {
  secret: process.env.JWT_SECRET,
  expiresIn: "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: "7d"
};
