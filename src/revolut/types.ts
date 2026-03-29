export interface RevolutAmount {
  amount: number;
  currency: string;
}

export interface RevolutCounterparty {
  id?: string;
  name?: string;
  account_id?: string;
  account_type?: string;
}

export interface RevolutLegs {
  leg_id: string;
  amount: number;
  currency: string;
  bill_amount?: number;
  bill_currency?: string;
  account_id: string;
  counterparty?: RevolutCounterparty;
  description?: string;
}

export interface RevolutTransaction {
  id: string;
  type: string;
  state: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  reference?: string;
  legs: RevolutLegs[];
  merchant?: {
    name?: string;
    city?: string;
    category_code?: string;
    country?: string;
  };
}
