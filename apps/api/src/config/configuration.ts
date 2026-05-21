export default () => ({
  api: {
    port: parseInt(process.env.API_PORT ?? '3001', 10),
    prefix: process.env.API_PREFIX ?? 'api',
    env: process.env.NODE_ENV ?? 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  web: {
    url: process.env.WEB_URL ?? 'http://localhost:3000',
  },
  portal: {
    url: process.env.PORTAL_URL ?? 'http://127.0.0.1:5500',
    jwt: {
      secret: process.env.PORTAL_JWT_SECRET ?? 'dev_portal_jwt_secret_change_in_prod',
      expiresIn: process.env.PORTAL_JWT_EXPIRES_IN ?? '15m',
      refreshSecret: process.env.PORTAL_JWT_REFRESH_SECRET ?? 'dev_portal_refresh_secret_change_in_prod',
      refreshExpiresIn: process.env.PORTAL_JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_in_prod',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
});
