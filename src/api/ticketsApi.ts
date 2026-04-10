/* eslint-disable @typescript-eslint/no-explicit-any */
import { validationPayload } from "@/types/stores";
import { fetchWithTimeout, GET, LOCALHOST, PATCH, POST } from "./authApi";
import { headers } from "./locationApi";

export async function getTicketInfoById(
  token: string,
  ticketId: string,
  locationId: string,
  shouldDisplay:boolean = false
) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/checkTicket/${ticketId}?shouldDisplay=${shouldDisplay}`,
      {
        method: POST,
        headers: { ...headers(token), locationId, external: true as any  },
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function getTicketsPayedByCredit(
  token: string,
  page: number = 1,
  limit: number = 1,
  creditId: string | null = null,
) {
  const creditQuery = creditId ? `&creditId=${creditId}` : null;
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/getTicketsByCredit?page=${page}&limit=${limit}${creditQuery}`,
      {
        method: GET,
        headers: { ...headers(token) },
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function payTicket(token: string, ticketId: string, data: object) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/payTicketDashboard/${ticketId}`,
      {
        method: POST,
        headers: { ...headers(token) },
        body: JSON.stringify(data),
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function validateTicketReq(token: string, ticketId: string, validationPayload: validationPayload) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/ticketValidation/${ticketId}`,
      {
        method: PATCH,
        headers: { ...headers(token) },
        body: JSON.stringify(validationPayload)
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}
export async function cancelValidationReq(token: string, ticketId: string) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/cancelTicketValidation/${ticketId}`,
      {
        method: PATCH,
        headers: { ...headers(token) }
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function getTicketsFromLocation(
  token: string,
  locationId: string,
  page: number,
  limit: number,
  fromDate: string,
  toDate: string,
) {
  const OLD_RESOURSCE = 'getTickets';
  const NEW_RESOURSE = 'getTicketsDateTime'
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/${NEW_RESOURSE}?locationId=${locationId}&page=${page}&limit=${limit}&dateFrom=${fromDate}&dateTo=${toDate}`,
      {
        method: GET,
        headers: { ...headers(token) },
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}


export async function getFinancialData(
  token: string,
  locationId: string,
  fromDate: string,
  toDate: string,
) {
  const OLD_RESOURSCE = 'getLocationsData';
  const NEW_RESOURSE = 'getLocationsDataNew'
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/indicators_route/${NEW_RESOURSE}/${locationId}?fromDate=${fromDate}&toDate=${toDate}`,
      {
        method: GET,
        headers: { ...headers(token) },
      },
    );
    return req;
  } catch (error) {
    return error;
  }

}
export async function manualVehicleValidation(
  token: string,
  locationId: string,
  ticketId: string
) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/manualValidation/${ticketId}?locationId=${locationId}`,
      {
        method: POST,
        headers: { ...headers(token) },
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function cancelTicket(
  token: string,
  locationId: string,
  ticketId: string,
  comment: string
) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/cancelTicket/${ticketId}`,
      {
        method: PATCH,
        headers: { ...headers(token) },
        body: JSON.stringify({
          locationId,
          comment
        })
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}


export async function createLostTicket(token: string, locationId: string, payload: object) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/createLostTicket/${locationId}`,
      {
        method: POST,
        headers: { ...headers(token) },
        body: JSON.stringify(payload)
      },
    );
    return req;
  } catch (error) {
    return error;
  }
}