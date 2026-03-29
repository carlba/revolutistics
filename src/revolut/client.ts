import got from 'got';

import type { RevolutTransaction } from './types.js';

export class RevolutClient {
  private readonly http;

  constructor(baseUrl: string, accessToken: string) {
    this.http = got.extend({
      prefixUrl: baseUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getTransactions(params: {
    from?: Date;
    to?: Date;
    count?: number;
    cursor?: string;
    type?: string;
  }): Promise<RevolutTransaction[]> {
    const searchParams: Record<string, string> = {};
    if (params.from) searchParams['from'] = params.from.toISOString();
    if (params.to) searchParams['to'] = params.to.toISOString();
    if (params.count) searchParams['count'] = String(params.count);
    if (params.cursor) searchParams['cursor'] = params.cursor;
    if (params.type) searchParams['type'] = params.type;

    return this.http
      .get('transactions', { searchParams })
      .json<RevolutTransaction[]>();
  }
}
