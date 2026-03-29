const requiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

const dbHost = process.env['DB_HOST'] ?? 'localhost';
const dbPort = process.env['DB_PORT'] ?? '5432';
const dbName = process.env['DB_NAME'] ?? 'revolutistics';
const dbUser = process.env['DB_USER'] ?? 'postgres';
const dbPassword = process.env['DB_PASSWORD'] ?? 'postgres';

// Prisma reads DATABASE_URL from the environment. Construct it from individual
// DB_* vars if the caller has not already set it.
if (!process.env['DATABASE_URL']) {
  process.env['DATABASE_URL'] =
    `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  revolut: {
    apiBaseUrl:
      process.env['REVOLUT_API_BASE_URL'] ?? 'https://b2b.revolut.com/api/1.0',
    accessToken: requiredEnvVar('REVOLUT_ACCESS_TOKEN'),
  },
  sync: {
    intervalSeconds: parseInt(process.env['SYNC_INTERVAL_SECONDS'] ?? '300', 10),
    transactionLookbackDays: parseInt(
      process.env['SYNC_LOOKBACK_DAYS'] ?? '30',
      10
    ),
  },
};
