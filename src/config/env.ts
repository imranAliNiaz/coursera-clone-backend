const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key] || defaultValue;
  // Remove possible literal quotes (occurs sometimes in Railway/Docker envs)
  return value.replace(/^["']|["']$/g, "");
};

export const env = {
  PORT: getEnv("PORT", "3000"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET", "change_me"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),
};
