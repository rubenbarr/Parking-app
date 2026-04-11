export interface ICredit {
  creditUsed: number;
  current_amount: number;
  initial_amount: number;
  requestId: string;
  status: string;
  chargedBy: string;
  closed_date: string;
  closed_status: string;
  comment: string;
  credit_delivered: number;
  finalAmount: number;
  receptor: string;
  chargeAt: string;
  createdAt: string;
  createdBy: string;
  initial_change: number;
  current_change: number;
  change_delivered: number;
  operator:string;
}


export interface CreditFinancialInfo {
        totalCash: number;
        totalPaid: number;
        totalPayed: number;
        totalTerminal: number;
        totalTerminalTransfer: number;
        totalTickets: number;
        totalTransfer: number;
}