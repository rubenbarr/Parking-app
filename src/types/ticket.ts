export interface IPayment {
  bills: {
    "100": number;
    "20": number;
    "200": number;
    "50": number;
    "500": number;
  };
  coins: {
    "0.5": number;
    "1": number;
    "10": number;
    "2": number;
    "5": number;
  };
}
export interface IDataPayment {
  amount: number;
  change: number;
  fechaPago: string;
  montoPagado: number;
  paymentData: IPayment;
  paidBy: string;
  totalPayed:number;
  id: string;
}
interface validationRule {
      "rate": number
      "time": number
      "type": string
      "unit": string
      "discount": boolean
}
export interface ITicket {
  cerrado: boolean;
  cocheDentro: boolean;
  creditUsed: string;
  dataPayment: IDataPayment[];
  estado: string;
  fecha_ultimo_pago: string;
  fechaCocheHaEntrado: string;
  fechaEntrada: string;
  fechaSalida: string;
  fecha_pago: false;
  gateLabel: string;
  location: string;
  message: string
  nuevaCantidadPago: number;
  repago:boolean;
  ticketId: string;
  total_payment: number;
  tolerancia: boolean;
  tiempo_restante:number;
  total_time:number;
  tiempo_restante_tolerancia?: string;
  total_a_pagar: number
  tiempo_para_salir: number
  tiempo_despues_de_utimo_pago: string;
  parkingValidation: boolean;
  validatedAt: string;
  validatedBy: string;
  hasValidation: boolean;
  validationRule: validationRule
  storeName: string
  minutos_dentro: string
  global_time_in: number
  paidBy:string;
}

export interface  IBankMethod {
  method: string;
  montoPagado: number;
  reference: string;
}
