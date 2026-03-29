const requiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  database: {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    name: process.env['DB_NAME'] ?? 'revolutistics',
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'postgres',
  },
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
