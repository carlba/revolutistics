/** Monetary amount as defined by OBActiveOrHistoricCurrencyAndAmount */
export interface OBAmount {
  Amount: string;
  Currency: string;
}

/** UK Open Banking bank transaction code */
export interface OBBankTransactionCode {
  Code: string;
  SubCode: string;
}

/** Proprietary bank transaction code (Revolut-specific) */
export interface OBProprietaryBankTransactionCode {
  Code: string;
  Issuer: string;
}

/** Single transaction as returned by the AISP /transactions endpoint (OBTransaction6) */
export interface OBTransaction {
  AccountId: string;
  TransactionId: string;
  TransactionReference?: string;
  Amount: OBAmount;
  CreditDebitIndicator: 'Credit' | 'Debit';
  Status: 'Booked' | 'Pending';
  BookingDateTime: string;
  ValueDateTime?: string;
  TransactionInformation?: string;
  BankTransactionCode?: OBBankTransactionCode;
  ProprietaryBankTransactionCode?: OBProprietaryBankTransactionCode;
  SupplementaryData?: Record<string, unknown>;
}

/** Envelope returned by GET /aisp/accounts/{AccountId}/transactions */
export interface OBTransactionResponse {
  Data: {
    Transaction: OBTransaction[];
  };
  Links: {
    Self: string;
    Next?: string;
    Last?: string;
  };
  Meta: {
    TotalPages: number;
  };
}

/** Single account as returned by the AISP /accounts endpoint (OBAccount6) */
export interface OBAccount {
  AccountId: string;
  Currency: string;
  AccountType: string;
  AccountSubType: string;
  Description?: string;
  Nickname?: string;
}

/** Envelope returned by GET /aisp/accounts */
export interface OBAccountResponse {
  Data: {
    Account: OBAccount[];
  };
  Links: {
    Self: string;
  };
  Meta: {
    TotalPages: number;
  };
}

/** Shape of a successful token response from the OAuth token endpoint */
export interface OBTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}
