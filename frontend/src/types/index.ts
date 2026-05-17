export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: 'website' | 'instagram' | 'referral';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'sales_user';
  token?: string;
}
