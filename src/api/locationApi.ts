import {
  fetchWithTimeout,
  headersDefault,
  GET,
  LOCALHOST,
  POST,
  DELETE,
  PATCH,
} from "./authApi";
import { Response } from "./usersApi";

export const headers = (token: string) => ({
  ...headersDefault,
  Authorization: `Bearer ${token}`,
});

export async function getLocations(token: string, page: number, limit: number) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/getLocations?page=${page}&limit=${limit}`,
      {
        method: GET,
        headers: headers(token),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function getStoresInLocation(locationId:string, token: string, page: number, limit: number) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/getStores/${locationId}?page=${page}&limit=${limit}`,
      {
        method: GET,
        headers: headers(token),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}

export async function getMyLocations(token: string, page: number, limit: number) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/getMyLocations?page=${page}&limit=${limit}`,
      {
        method: GET,
        headers: headers(token),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}
export async function createLocation(token: string, data: object) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/createLocation`,
      {
        method: POST,
        headers: headers(token),
        body: JSON.stringify(data),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}
export async function getLocationById(token: string, id: string) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/getLocation/${id}`,
      {
        method: GET,
        headers: headers(token),
      }
    );
    return req as Response;
  } catch (error) {
    return error;
  }
}
export async function deleteLocationById(token: string, id: string) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/deleteLocation/${id}`,
      {
        method: DELETE,
        headers: headers(token),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}
export async function updateLocationById(
  token: string,
  id: string,
  data: object
) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/locations_route/updateLocation/${id}`,
      {
        method: PATCH,
        headers: headers(token),
        body: JSON.stringify(data),
      }
    );
    return req as Response;
  } catch (error) {
    return error;
  }
}


export async function getBarrierHistorySummary(token: string, locationId:string, fromDate: string, toDate: string) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/barrier_register_route/get_summary/${locationId}?fromDate=${fromDate}&toDate=${toDate}`,
      {
        method: GET,
        headers: headers(token),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}


export async function getBarrierHistory(
  token: string,
  locationId: string,
  page: number,
  limit: number,
  fromDate: string,
  toDate: string,
) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/barrier_register_route/get_history/${locationId}?page=${page}&limit=${limit}&dateFrom=${fromDate}&dateTo=${toDate}`,
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
export async function getAllTicketsForPrinting(
  token: string,
  locationId: string,
  fromDate: string,
  toDate: string,
) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/ticketRoute/getAllTickets/${locationId}?fromDate=${fromDate}&toDate=${toDate}`,
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