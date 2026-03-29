const requiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

// Prisma reads DATABASE_URL from the environment directly.
requiredEnvVar('DATABASE_URL');

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  revolut: {
    /** Revolut Open Banking AISP base URL */
    apiBaseUrl:
      process.env['REVOLUT_API_BASE_URL'] ??
      'https://openbanking.revolut.com/api',
    /** OAuth 2.0 token endpoint */
    tokenUrl:
      process.env['REVOLUT_TOKEN_URL'] ?? 'https://oba.revolut.com/token',
    /** OAuth 2.0 client credentials */
    clientId: requiredEnvVar('REVOLUT_CLIENT_ID'),
    clientSecret: requiredEnvVar('REVOLUT_CLIENT_SECRET'),
    /** Initial access token (obtained via authorization code flow) */
    accessToken: requiredEnvVar('REVOLUT_ACCESS_TOKEN'),
    /** Optional refresh token — enables automatic access token renewal */
    refreshToken: process.env['REVOLUT_REFRESH_TOKEN'],
  },
  sync: {
    intervalSeconds: parseInt(process.env['SYNC_INTERVAL_SECONDS'] ?? '300', 10),
    transactionLookbackDays: parseInt(
      process.env['SYNC_LOOKBACK_DAYS'] ?? '30',
      10
    ),
  },
};
