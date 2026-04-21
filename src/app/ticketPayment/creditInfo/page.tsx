/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { getCreditById, getCreditFinancialData } from '@/api/credits';
import { getTicketsPayedByCredit } from '@/api/ticketsApi';
import { Response } from '@/api/usersApi';
import { transformToCurrency } from '@/assets/utils';
import CreditInfoComponent from '@/components/CreditInfo/CreditInfo'
import OperatorCreditPdf from '@/components/ReciboCreditoOperador/Reciboticket';
import { useAuth } from '@/context/AuthContext';
import { CreditFinancialInfo, ICredit } from '@/types/credits';
import { IDataPayment, IPayment, ITicket } from '@/types/ticket';
import { PDFViewer } from '@react-pdf/renderer';
import { PrinterIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

  const initialFinancialData = {
        totalCash: 0,
        totalPaid: 0,
        totalPayed: 0,
        totalTerminal: 0,
        totalTerminalTransfer: 0,
        totalTickets: 0,
        totalTransfer: 0,
  };

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  const  {setLoadingGlobal, isLoadingGlobal, token, handleToast } = useAuth();

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [canloadMore, setCanLoadmore] = useState<boolean>(true);
  const [displayPdfView,setDisplayPdfView] = useState<boolean>(true);

  const [mypayments, setMyPayments] = useState<ITicket[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [creditId, setCreditId] = useState<string | null>( )
  const [creditInfo, setCreditInfo] = useState<ICredit>()
  const [creditFinancialInfo, setCreditFinancialInfo] = useState<CreditFinancialInfo>(initialFinancialData);
  
  const getDate = (date: string) => {
    return new Date(date).toLocaleString()
    return date;
  };
    async function getTicketsPayed(page: number, credit: string) {
      setLoadingGlobal(true);
      const req = (await getTicketsPayedByCredit(
        token as string,
        page,
        limit,
        credit
      )) as Response;
      if (req) {
        setLoadingGlobal(false);
        if (req.state) {
          const data = req.data as [];
          if (data.length === 0) {
            return setCanLoadmore(false);
          } 
          if (mypayments?.length === 0) {
            return setMyPayments(data);
          }
          if (page === 1 && mypayments?.length !== 0) {
            return setMyPayments(data);
          } else {
            return setMyPayments((prev) => [...prev, ...data]);
          }
        } else {
          handleToast(
            "error",
            `Hubo un error buscando los pagos realizados, error: ${req.message}`,
          );
        }
      }
    }

      async function getCreditFinancialDataReq(creditId: string) {
    
        try {
          setLoadingGlobal(true);
          const req = (await getCreditFinancialData(creditId, token as string)) as Response;
          if (req.state) {
            const data = req.data as CreditFinancialInfo;
            setCreditFinancialInfo(data);
    
          } else {
            handleToast('error', 'error obteniendo informacion de credito, refresque la pagina')
            setDisplayPdfView(false);
          }
        } catch (error) {
          handleToast('error', 'error obteniendo informacion de credito, refresque la pagina');
          setDisplayPdfView(false);
        } finally {
          setLoadingGlobal(false);
        }
      }

  async function loadMoreLocations() {
    const nextPage = page + 1;
    setPage(nextPage);
    await getTicketsPayed(nextPage, creditId as string);
  }

  async function getCreditInfoById(creditId:string) {
    if (!creditId) return;
    try {
      const req = await getCreditById(creditId, token as string) as Response;
      if (!req.state) {
        handleToast("error", req?.message || "Hubo un error obteniendo informacion del credito intente mas tarde ")  
      } else {
        const data = req.data as ICredit[];
        setCreditInfo(data[0]);
      }
    } catch (error:any) {
      handleToast("error", error?.message || "Hubo un error obteniendo informacion del credito intente mas tarde ")
    }
    
  }
  useEffect(() => {
    const id = params.get("id")
    if (!id) return router.replace("/ticketPayment")
    setCreditId(id)
    getTicketsPayed(page, id as string)
    getCreditInfoById(id)
    getCreditFinancialDataReq(id)
  },[])


    const myPaymentsList = () => {
      return (
        <>
          <div className="header-container">
            <h1 className="main-header">Lista de pagos realizados</h1>
            <label>
              Esta lista corresponde a los tickets que realizó con su ultimo
              crédito
            </label>
          </div>
          <button className="primary-button" onClick={()=> getTicketsPayed(1, creditId as string)}>Refrescar</button>
  
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="">item</th>
                  <th className="">Puerta/Entrada</th>
                  <th className="">Fecha/Entrada</th>
                  <th className="">Fecha/Pago</th>
                  <th className="">TotalPagado</th>
                  <th className="">Total de cobros</th>
                  <th>Coche dentro</th>
                  <th>Fecha de salida</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={5}>Cargando datos...</td>{" "}
                  </tr>
                ) : mypayments?.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Sin datos</td>
                  </tr>
                ) : (
                  mypayments?.map((item, index) => {
                    const dataPayment = item?.dataPayment || [] as IDataPayment[];
                    const lastItem = dataPayment.length === 0 ? null : dataPayment[dataPayment.length -1];
                    const fechaPago = lastItem ? getDate(lastItem.fechaPago) : ""
                    const montoTotalPagado = lastItem ? dataPayment.reduce((acc, currentVal ) => acc += currentVal.amount, 0) : 0
                    return (
                    <tr key={index}>
                      <td>{(index += 1)}</td>
                      <td>{item.gateLabel}</td>
                      <td>
                        {item.fechaEntrada ? getDate(item.fechaEntrada) : ""}
                      </td>
                      <td>{fechaPago }</td>
                      <td>
                         {transformToCurrency(montoTotalPagado)}
                      </td>
                      <td>{dataPayment.length}</td>
                      <td>{item.cocheDentro ? "Si" : "No"}</td>
                      <td>{item?.fechaSalida || ""}</td>
                    </tr>
                  )
                  })
                )}
              </tbody>
            </table>
          </div>
          {canloadMore && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button className="primary-button" onClick={loadMoreLocations}>
                cargar más
              </button>
            </div>
          )}
        </>
      );
    };
  
      const PDFViewerComponent = () => {
        return (
          displayPdfView && creditInfo && (
            <PDFViewer style={{ width: "100%", height: "50vh" }}>
              <OperatorCreditPdf
                creditInfo={creditInfo}
                financialInfo={ creditFinancialInfo}
              />
            </PDFViewer>
          )
        );
      };
  return (
  <div className="main-content">
    {PDFViewerComponent()}
    <div className="options-header">
      <a
        className="content-action"
        onClick={() => router.push("/ticketPayment")}
      >
        Regresar
      </a>
    </div>
    { displayPdfView 
      ?
     <button className='primary-button' onClick={() => {setDisplayPdfView(false)}}>Ocultar impresion</button> 
     :
    <button className='trash-icon-container' onClick={() => {setDisplayPdfView(true)}}>
      <PrinterIcon/>
    </button> }
    {myPaymentsList()}
  </div>
  )
}
