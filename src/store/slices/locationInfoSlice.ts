import {
  getBarrierHistory,
  getBarrierHistorySummary,
  getLocationById,
} from "@/api/locationApi";
import { getFinancialData, getTicketsFromLocation } from "@/api/ticketsApi";
import { Response } from "@/api/usersApi";
import { ITicket } from "@/types/ticket";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type Data = {
  id: string;
  name: string;
};
type Params = {
  token: string;
  locationId: string;
};

type LocationDataType = {
  _id: number;
  totalCarsIn: number;
  totalCash: number;
  totalOut: number;
  totalPaid: number;
  totalPayed: number;
  totalTerminal: number;
  totalTerminalTransfer: number;
  totalTickets: number;
  totalTransfer: number;
};

export interface LocationInfo {
  loading: boolean;
  data: LocationDataType | null;
  error: boolean | null;
  errorMessage: string | null;
}
interface BarrierSummary {
  id: string;
  total: number;
}
export interface BarrierSummaryType {
  loading: boolean;
  barrierSummary: BarrierSummary | null;
  error: boolean | null;
  errorMessage: string | null;
}

export interface BarrierHistoryType {
  createdAt: string;
  gateLabel: string;
  locationId: string;
  requestId: string;
}

type LocationState = {
  loading: boolean;
  error: unknown;
  locationData: {
    address: string | null;
    contact: string | null;
    createdAt: string | null;
    createdBy: string | null;
    kioscos: Data[] | null;
    locationId: string | null;
    operators: Data[] | null;
    title: string | null;
    totalKiosks: number | null;
    updatedAt: string | null;
    updatedBy: string | null;
  };
};

interface ITicketsInitialState {
  loading: boolean;
  error: boolean | null;
  tickets: ITicket[];
  errorMessage: string | null;
  canLoadMore: boolean;
}
interface IBarrierHistoryType {
  loading: boolean;
  error: boolean | null;
  historyList: BarrierHistoryType[];
  errorMessage: string | null;
  canLoadMoreBarrierList: boolean;
}

export interface ITicketsParams {
  token: string;
  locationId: string;
  page: number;
  limit: number;
  fromDate: string;
  toDate: string;
  field?:string;
}

const initialState: LocationState = {
  loading: false,
  error: false,
  locationData: {
    address: null,
    contact: null,
    createdAt: null,
    createdBy: null,
    kioscos: null,
    locationId: null,
    operators: null,
    title: null,
    totalKiosks: null,
    updatedAt: null,
    updatedBy: null,
  },
};

const initialStateLocationInformation: LocationInfo = {
  loading: false,
  data: null,
  error: null,
  errorMessage: null,
};
const initialStateBarrierHistory: BarrierSummaryType = {
  loading: false,
  barrierSummary: null,
  error: null,
  errorMessage: null,
};

const initialTicketsState: ITicketsInitialState = {
  loading: false,
  error: null,
  tickets: [],
  errorMessage: null,
  canLoadMore: false,
};
const initialBarrierHistoryState: IBarrierHistoryType = {
  loading: false,
  error: null,
  historyList: [],
  errorMessage: null,
  canLoadMoreBarrierList: false,
};

export const fetchLocationInfo = createAsyncThunk(
  "locationInfo/fetch",
  async (params: Params) => {
    const { token, locationId } = params;
    const request = (await getLocationById(token, locationId)) as Response;
    return {
      locationData: request.data,
    };
  },
);

export const fetchTickets = createAsyncThunk(
  "locationTickets/fetch",
  async (params: ITicketsParams) => {
    const { token, locationId, page, limit, fromDate, toDate } = params;
    const req = (await getTicketsFromLocation(
      token,
      locationId,
      page,
      limit,
      fromDate,
      toDate,
    )) as Response;
    return { req, page };
  },
);

export const fetchBarrierHistory = createAsyncThunk(
  "barrierHistory/fetch",
  async (params: ITicketsParams) => {
    const { token, locationId, page, limit, fromDate, toDate } = params;
    const req = (await getBarrierHistory(
      token,
      locationId,
      page,
      limit,
      fromDate,
      toDate,
    )) as Response;
    return { req, page };
  },
);

export const fetchLocationFinancialData = createAsyncThunk(
  "locationsFinancialData",
  async (params: ITicketsParams) => {
    const { token, locationId, fromDate, toDate, field } = params;
    const req = (await getFinancialData(
      token,
      locationId,
      fromDate,
      toDate,
      field
    )) as Response;
    return req;
  },
);
export const fetchExitBarrierHistory = createAsyncThunk(
  "exitBarrierHistory",
  async (params: ITicketsParams) => {
    const { token, locationId, fromDate, toDate } = params;
    const req = (await getBarrierHistorySummary(
      token,
      locationId,
      fromDate,
      toDate,
    )) as Response;
    return req;
  },
);

const locationInfoSlice = createSlice({
  name: "locationInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationInfo.fulfilled, (state, action) => {
        state.loading = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = action.payload.locationData as any;
        state.locationData = data;
      })
      .addCase(fetchLocationInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  },
});

const ticketsSlice = createSlice({
  name: "locationTickets",
  initialState: initialTicketsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload.req as Response;
        const page = action.payload.page as number;
        if (!res.state) {
          state.error = true;
          state.errorMessage =
            res?.message || "Error desconocido obteniendo tickets";
        } else {
          const tickets = res.data as ITicket[];
          if (tickets.length === 0) {
            state.canLoadMore = false;
            if (page === 1) {
              state.tickets = [];
            }
          } else {
            state.canLoadMore = true;
            if (state.tickets && state.tickets.length > 0 && page > 1) {
              state.tickets = [...state.tickets, ...tickets];
            } else {
              state.tickets = tickets;
            }
          }
        }
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.errorMessage =
          action.error.message || "Error obteniendo tickets, desconocido";
      });
  },
});

const BarrierListSlice = createSlice({
  name: "BarrierListSlice",
  initialState: initialBarrierHistoryState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBarrierHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarrierHistory.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload.req as Response;
        const page = action.payload.page as number;
        if (!res.state) {
          state.error = true;
          state.errorMessage =
            res?.message || "Error desconocido obteniendo historial de salida";
        } else {
          const list = res.data as BarrierHistoryType[];
          if (list.length === 0) {
            state.canLoadMoreBarrierList = false;
            if (page === 1) {
              state.historyList = [];
            }
          } else {
            state.canLoadMoreBarrierList = true;
            if (state.historyList && state.historyList.length > 0 && page > 1) {
              state.historyList = [...state.historyList, ...list];
            } else {
              state.historyList = list;
            }
          }
        }
      })
      .addCase(fetchBarrierHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.errorMessage =
          action.error.message || "Error obteniendo tickets, desconocido";
      });
  },
});

const financialDataSlice = createSlice({
  name: "financialData",
  initialState: initialStateLocationInformation,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationFinancialData.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationFinancialData.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        if (!res.state) {
          state.error = true;
          state.errorMessage =
            res.message || "Error desconocido obteniendo datos financieros";
        } else {
          state.error = null;
          state.errorMessage = null;
          const data = res.data as LocationDataType;
          state.data = data;
        }
      })
      .addCase(fetchLocationFinancialData.rejected, (state, action) => {
        state.error = true;
        state.errorMessage =
          action.error.message ||
          "Error desconocido obteniendo datos financieros";
      });
  },
});

const barrierHistorySlice = createSlice({
  name: "barrierHistory",
  initialState: initialStateBarrierHistory,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExitBarrierHistory.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExitBarrierHistory.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        if (!res.state) {
          state.error = true;
          state.errorMessage =
            res.message || "Error desconocido obteniendo datos financieros";
        } else {
          state.error = null;
          state.errorMessage = null;
          const data = res.data as BarrierSummary[];
          state.barrierSummary = data[0];
        }
      })
      .addCase(fetchExitBarrierHistory.rejected, (state, action) => {
        state.error = true;
        state.errorMessage =
          action.error.message ||
          "Error desconocido obteniendo datos de apertura de barreara";
      });
  },
});

const ticketReducer = ticketsSlice.reducer;
const locationInfoReducer = locationInfoSlice.reducer;
const financialDataReducer = financialDataSlice.reducer;
const barrierHistoryReducer = barrierHistorySlice.reducer;
const barrierListHistoryReducer = BarrierListSlice.reducer;

export {
  locationInfoReducer,
  ticketReducer,
  financialDataReducer,
  barrierHistoryReducer,
  barrierListHistoryReducer,
};
