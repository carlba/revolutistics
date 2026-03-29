import got, { type Got } from 'got';

import type {
  OBAccount,
  OBAccountResponse,
  OBTransaction,
  OBTransactionResponse,
  OBTokenResponse,
} from './types.js';

export class RevolutOpenBankingClient {
  private readonly http: Got;
  private accessToken: string;

  constructor(
    private readonly baseUrl: string,
    private readonly tokenUrl: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    initialAccessToken: string,
    private readonly refreshToken?: string
  ) {
    this.accessToken = initialAccessToken;
    this.http = got.extend({ prefixUrl: baseUrl });
  }

  /** Exchange the stored refresh token for a fresh access token. */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error(
        'Cannot refresh access token: REVOLUT_REFRESH_TOKEN is not set'
      );
    }

    const response = await got
      .post(this.tokenUrl, {
        form: {
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
      })
      .json<OBTokenResponse>();

    this.accessToken = response.access_token;
  }

  private authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  /** Retrieve all accounts accessible via the current consent. */
  async getAccounts(): Promise<OBAccount[]> {
    const response = await this.http
      .get('aisp/accounts', { headers: this.authHeaders() })
      .json<OBAccountResponse>();
    return response.Data.Account;
  }

  /**
   * Retrieve transactions for a given account.
   * Automatically follows `Links.Next` to collect all pages.
   */
  async getTransactions(
    accountId: string,
    params: {
      fromBookingDateTime?: Date;
      toBookingDateTime?: Date;
    }
  ): Promise<OBTransaction[]> {
    const searchParams: Record<string, string> = {};
    if (params.fromBookingDateTime) {
      searchParams['fromBookingDateTime'] =
        params.fromBookingDateTime.toISOString();
    }
    if (params.toBookingDateTime) {
      searchParams['toBookingDateTime'] = params.toBookingDateTime.toISOString();
    }

    const transactions: OBTransaction[] = [];
    let nextUrl: string | undefined;

    do {
      const response: OBTransactionResponse = nextUrl
        ? await got.get(nextUrl, { headers: this.authHeaders() }).json()
        : await this.http
            .get(`aisp/accounts/${accountId}/transactions`, {
              headers: this.authHeaders(),
              searchParams,
            })
            .json<OBTransactionResponse>();

      transactions.push(...response.Data.Transaction);
      // Links.Next from the Open Banking standard is always an absolute URL
      nextUrl = response.Links.Next;
    } while (nextUrl);

    return transactions;
  }
}
