import axios from 'axios';

import type { RevolutTransaction } from './types.js';

export class RevolutClient {
  private readonly httpClient;

  constructor(
    private readonly baseUrl: string,
    private readonly accessToken: string
  ) {
    this.httpClient = axios.create({
      baseURL: baseUrl,
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
    const query: Record<string, string> = {};
    if (params.from) query['from'] = params.from.toISOString();
    if (params.to) query['to'] = params.to.toISOString();
    if (params.count) query['count'] = String(params.count);
    if (params.cursor) query['cursor'] = params.cursor;
    if (params.type) query['type'] = params.type;

    const response = await this.httpClient.get<RevolutTransaction[]>(
      '/transactions',
      { params: query }
    );
    return response.data;
  }
}
