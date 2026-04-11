/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithTimeout, GET, LOCALHOST, PATCH, POST, DELETE} from "./authApi";
import { headers } from "./locationApi";
import { Response } from "./usersApi";

interface IQueryParams {
    fromDate: string
    toDate: string
    page?:number
    limit?:number
}

export async function getCreditsPaginated(page:number, limit:number, token:string, params: IQueryParams){
    const from = params?.fromDate || null;
    const to = params.toDate || null;
    const dateParam = from  && to ? `&fromDate=${from}&toDate=${to}` : null;
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/get_credits?page=${page}&limit=${limit}${dateParam}`, {
            method: GET,
            headers: headers(token), 
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function getPersonalCreditInfoRequest(token:string, shouldRequestClosedCredit:boolean = false){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/check?checkClosed=${shouldRequestClosedCredit}`, {
            method: GET,
            headers: headers(token), 
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function getCreditById(requestId:string, token:string){
    if (!requestId) return
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/get_credit/${requestId}`, {
            method: GET,
            headers: headers(token), 
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function getCreditFinancialData(requestId:string, token:string){
    if (!requestId) return
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/ticketRoute/getCreditFinancialData?creditId=${requestId}`, {
            method: GET,
            headers: headers(token), 
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}

export async function getOperatorsReqPaginated (page:number, limit:number, token:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/getUsers?page=${page}&limit=${limit}&onlyOperators=true`, {
            method: GET,
            headers: headers(token), 
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function addCreditRequest(token:string, data:object){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/add_credit`, {
            method: POST,
            headers: headers(token), 
            body: JSON.stringify(data)
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}

export async function cancelCreditRequest(token:string, data:object, requestId:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/cancel_credit/${requestId}`, {
            method: PATCH,
            headers: headers(token), 
            body: JSON.stringify(data)
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}

export async function closeCreditRequest(token:string, data:object, requestId:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/close_credit/${requestId}`, {
            method: PATCH,
            headers: headers(token), 
            body: JSON.stringify(data)
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function getUserCredits(token:string, page:number, limit:number ){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/credits_route/getUserCredits?page=${page}&limit=${limit}`, {
            method: GET,
            headers: headers(token),
        })
        return req as Response;
    } catch (error) {
        return error;
    }
}