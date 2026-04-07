"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, lazy, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import cn from "classnames";

import { useAuth } from "@/context/AuthContext";

import {
  fetchExitBarrierHistory,
  fetchLocationFinancialData,
  fetchLocationInfo,
  fetchTickets,
  ITicketsParams,
  fetchBarrierHistory,
} from "@/store/slices/locationInfoSlice";

import { transformToCurrency } from "@/assets/utils";
import { ArrowRightIcon, ArrowUp, TrashIcon } from "lucide-react";
import { ITicket } from "@/types/ticket";
import { getTicketInfoById } from "@/api/ticketsApi";
import { Response } from "@/api/usersApi";

import "./locationInfoStyle.scss";
import Toggle from "@/components/Toggle/ToggleComp";
import { Html5Qrcode } from "html5-qrcode";

export default function Page() {
  const { isLoadingGlobal, setLoadingGlobal, token, handleToast } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const transformDate = (date: string) => {
    const newDate = new Date(date).toLocaleString();
    return newDate;
  };

  const { locationData } = useSelector(
    (state: RootState) => state.locationInfo,
  );

  const { historyList, canLoadMoreBarrierList } = useSelector(
    (state: RootState) => state.barrierListHistoryReducer,
  );

  const { tickets, loading, error, errorMessage, canLoadMore } = useSelector(
    (state: RootState) => state.ticketsInfo,
  );

  const { data } = useSelector(
    (state: RootState) => state.financialDataReducer,
  );

  const { barrierSummary } = useSelector(
    (state: RootState) => state.barrierHistoryReducer,
  );

  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentDate, setCurrenDate] = useState(new Date().toLocaleString());
  const [locationId, setLocationId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsLimit, setTicketsLimit] = useState(100);
  const [shouldDisplayOperatorsTable, setShouldDisplayOperatorsTable] =
    useState(false);
  const [shouldDisplayKioscoTable, setShouldDisplayKioscoTable] =
    useState(false);
  const [shouldDisplayBarrierTable, setShouldDisplayBarrierTable] =
    useState(false);
  const [ticketInfo, setTicketInfo] = useState<ITicket | null>(null);

  const [ticketId, setTicketId] = useState("");
  const [errorCam, setErrorCam] = useState<string | null>(null);

  const [result, setResult] = useState<string | null>(null);
  const [scanning, setIsScanning] = useState(false);
  const [shouldDisplayQrReader, setshouldDisplayQrReader] = useState(false);
  const [autoFind, setAutoFind] = useState<boolean>(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<Html5Qrcode>(null);

  //  end of declaration state

  function getLocationInfo(token: string, locationId: string) {
    setLoadingGlobal(true);
    dispatch(fetchLocationInfo({ token, locationId }))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function dispatchTickets(params: ITicketsParams) {
    setLoadingGlobal(true);
    dispatch(fetchTickets(params))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function dispatchBarrierList(params: ITicketsParams) {
    setLoadingGlobal(true);
    dispatch(fetchBarrierHistory(params))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function dispatchFinancialData(params: ITicketsParams) {
    setLoadingGlobal(true);
    dispatch(fetchLocationFinancialData(params))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function dispatchBarrierSummary(params: ITicketsParams) {
    setLoadingGlobal(true);
    dispatch(fetchExitBarrierHistory(params))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  function loadMore() {
    if (token && locationId) {
      const page = ticketsPage + 1;
      setTicketsPage(page);
      dispatchTickets({
        token,
        locationId,
        page,
        limit: ticketsLimit,
        fromDate,
        toDate,
      });
    }
  }
  function loadMoreBarrierList() {
    if (token && locationId) {
      const page = ticketsPage + 1;
      setTicketsPage(page);
      dispatchBarrierList({
        token,
        locationId,
        page,
        limit: ticketsLimit,
        fromDate,
        toDate,
      });
    }
  }

  async function getTicketByIdReq(ticketId: string) {
    try {
      setLoadingGlobal(true);
      setTicketInfo(null);
      if (!token || !locationId) return;

      const req = (await getTicketInfoById(
        token as string,
        ticketId,
        locationId as string,
        true,
      )) as Response;
      if (!req.state)
        return handleToast(
          "error",
          req?.message ||
            req?.error ||
            "Error obteniendo informacion de ticket, comuniquese con administracion",
        );

      setTicketInfo(req.data as ITicket);
    } catch (error) {
      handleToast("error", "Error obteniendo informacion");
      setTicketInfo(null);
    } finally {
      setLoadingGlobal(false);
      if (scanning) {
        stopScanner(true);
      }
    }
  }

  useEffect(() => {
    const locationId = searchParams.get("locationId");
    if (locationId) {
      setLocationId(locationId);
      getLocationInfo(token as string, locationId);
      if (token && locationId) {
        dispatchTickets({
          token,
          locationId,
          page: ticketsPage,
          limit: ticketsLimit,
          fromDate,
          toDate,
        });
        dispatchBarrierList({
          token,
          locationId,
          page: ticketsPage,
          limit: ticketsLimit,
          fromDate,
          toDate,
        });
        dispatchFinancialData({
          token,
          locationId,
          page: ticketsPage,
          limit: ticketsLimit,
          fromDate,
          toDate,
        });
        dispatchBarrierSummary({
          token,
          locationId,
          page: ticketsPage,
          limit: ticketsLimit,
          fromDate,
          toDate,
        });
      }
    } else router.replace("/locations");
  }, []);

    useEffect(() => {
      if (!result) return;
  
      const delayDebounce = setTimeout(() => {
        if (result.length >= 32) {
          setTicketId(result);
          getTicketByIdReq(result)
        }
      }, 300); // wait 300ms after typing stops
  
      return () => clearTimeout(delayDebounce);
    }, [result]);

  function getTickets() {
    if (!token || !locationId) return;
    dispatchTickets({
      token,
      locationId,
      page: 1,
      limit: ticketsLimit,
      fromDate,
      toDate,
    });
  }
  function getBarrierlist() {
    if (!token || !locationId) return;
    dispatchBarrierList({
      token,
      locationId,
      page: 1,
      limit: ticketsLimit,
      fromDate,
      toDate,
    });
  }

  function getBarrierSumReq() {
    if (!token || !locationId) return;
    dispatchBarrierSummary({
      token,
      locationId,
      page: ticketsPage,
      limit: ticketsLimit,
      fromDate,
      toDate,
    });
  }
  function getFinancialData() {
    if (!token || !locationId) return;
    dispatchFinancialData({
      token,
      locationId,
      page: 1,
      limit: ticketsLimit,
      fromDate,
      toDate,
    });
  }

  const startScanner = async () => {
    setResult(null);
    setErrorCam(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setErrorCam("Error");
        handleToast(
          "error",
          "Es posible que tu navegador no soporte tu camara, cambia de navegador a google Chrome",
        );
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      if (videoDevices.length === 0) {
        setErrorCam("Error");
        handleToast(
          "error",
          "No se encontro camara para navegar, no es posible realizar validacion",
        );
        return;
      }

      const isMobile = /Android|iPhone|IPad|Ipod/i.test(navigator.userAgent);

      let cameraId = videoDevices[0].deviceId;

      if (isMobile) {
        const backCamera = videoDevices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment"),
        );
        if (backCamera) cameraId = backCamera.deviceId;
      }

      qrInstance.current = new Html5Qrcode("qr-reader");
      setIsScanning(true);
      await qrInstance.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await stopScanner(false);
          setResult(decodedText);
        },
        (errorMessage) => {},
      );
      setshouldDisplayQrReader(true);
    } catch (error) {
      setErrorCam("Error");
      handleToast(
        "error",
        "Error activando tu camara, comunicate con administracion" + `${error}`,
      );
      setshouldDisplayQrReader(false);
    }
  };

  const stopScanner = async (eraseResult: boolean) => {
    try {
      if (eraseResult) setResult(null);
      if (scanning && qrInstance.current) {
        await qrInstance.current.stop();
        setIsScanning(false);
        setErrorCam(null);
      }
    } catch (error) {
      handleToast("error", "ups, ubo error refresque la pagina");
    }
  };

  const LocationGeneralData = () => {
    return (
      <div className="entity-content">
        <div className="main-entity-content">
          <label>
            {" "}
            <b>{"Ubicación: "}</b>
            {locationData.title}
          </label>
          <label>
            {" "}
            <b>{"Contacto: "}</b>
            {locationData.contact}
          </label>
          <label>
            {" "}
            <b>{"Dirección: "}</b>
            {locationData.address}
          </label>
          <label>
            {" "}
            <b>{"Total de kioscos: "}</b>
            {locationData.kioscos && Array.isArray(locationData.kioscos)
              ? locationData.kioscos.length
              : ""}
          </label>
          <label>
            {" "}
            <b>{"Total de operadores: "}</b>
            {locationData.operators && Array.isArray(locationData.operators)
              ? locationData.operators.length
              : ""}
          </label>
        </div>
      </div>
    );
  };

  const autoValidationElement = () => {
    if (!scanning) {
      return (
        <button className="primary-button" onClick={() => {startScanner(); setTicketId(""); setTicketInfo(null)}}>
          Activar camara para buscar
        </button>
      );
    }
    return (
      <button className="primary-button" onClick={() => stopScanner(true)}>
        Cerrar camara
      </button>
    );
  };

  const qrReader = () => {
    return (
      !error && (
        <div id={"qr-reader"} ref={qrRef} style={{ width: "300px" }}></div>
      )
    );
  };

  const autoValidationContent = () => {
    return (
      autoFind && (
        <>
          {autoValidationElement()}
          {ticketId && <div className="">
            <p>Ticket Id: </p>
            <b>{ticketId !== "" && ticketId}</b>
          </div>}
          {qrReader()}
        </>
      )
    );
  };

  const manualFindContent = () => {
    return (
      !autoFind && (
        <div className="input-row">
          <b>Busqueda de ticket</b>
          <p>Buscar ticket por Id</p>

          <input
            type="text"
            className="main-input"
            placeholder="ticketId"
            value={ticketId}
            onChange={(e) => {
              const formattedValue = e.target.value.replace(/'/g, "-");
              setTicketId(formattedValue);
            }}
          />
          <div className="input-buttons">
            <button
              className="trash-icon-container"
              onClick={() => {
                setTicketId("");
              }}
            >
              <TrashIcon />
            </button>
            <button
              onClick={() => getTicketByIdReq(ticketId)}
              className="primary-button"
              disabled={isLoadingGlobal || ticketId === ""}
            >
              Buscar Ticket
            </button>
          </div>
        </div>
      )
    );
  };

  const ticketInformationcontainer = () => {
    return (
      <div className="entity-content">
        <Toggle
          checked={autoFind}
          onChange={() => setAutoFind(!autoFind)}
          leftLabel="Buscar Manualmente"
          rightLabel="Buscar con camara"
        />
        {manualFindContent()}
        {autoValidationContent()}
        {ticketInfo && (
          <div className="main-entity-content">
            <label>
              <b>{"Fecha de entrada: "}</b>
              {transformDate(ticketInfo?.fechaEntrada)}
            </label>
            <label>
              <b>{"Estado: "}</b>
              {ticketInfo?.estado}
            </label>
            {/* <label>
            <b>{"total de minutos: "}</b>
            {ticketInfo?.minutos_dentro}
          </label> */}
            <label>
              <b>{"total de horas dentro: "}</b>
              {ticketInfo?.total_time}
            </label>
            <label>
              <b>{"coche dentro: "}</b>
              {ticketInfo?.cocheDentro ? "Si" : "No"}
            </label>
            <label>
              <b>{"Salio: "}</b>
              {ticketInfo?.cerrado ? "Si" : "No"}
            </label>
            {ticketInfo?.cerrado && (
              <>
                <label>
                  <b>{"Fecha Salida: "}</b>
                  {transformDate(ticketInfo?.fechaSalida)}
                </label>
                <label>
                  <b>{"Tiempo dentro en min: "}</b>
                  {ticketInfo.global_time_in}
                </label>
              </>
            )}
            {ticketInfo?.estado === "pagado" && (
              <label>
                <b>{"Pagado por: "}</b>
                {ticketInfo?.paidBy}
              </label>
            )}
            {ticketInfo?.estado === "pagado" && (
              <div className="ticket-payment-Info">
                <label htmlFor="">Informacion de ultimo pago</label>
                <p className="info-content">
                  <b>{"Tiempo transcurrido desde ultimo pago: "}</b>
                  <label htmlFor="">
                    {ticketInfo?.tiempo_despues_de_utimo_pago}
                  </label>
                </p>
                <b>Historial de pagos de ticket</b>
                {ticketInfo?.dataPayment.map((item, index) => (
                  <div key={item.id} className="ticket-info-content">
                    <p className="info-content">
                      <b>{"No. de pago: "}</b> <label> {index + 1}</label>
                    </p>
                    <p className="info-content">
                      <b>{"Fecha de pago: "}</b>{" "}
                      <label> {transformDate(item?.fechaPago)}</label>
                    </p>
                    <p className="info-content">
                      <b>{"Total pagado: "}</b>{" "}
                      <label> {transformToCurrency(item?.totalPayed || 0)}</label>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const operatorsList = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Operadores</label>
            <button
              className="trash-icon-container"
              onClick={() => setShouldDisplayOperatorsTable((prev) => !prev)}
            >
              {shouldDisplayOperatorsTable ? <ArrowUp /> : <ArrowRightIcon />}
            </button>
          </div>
        </div>
        {shouldDisplayOperatorsTable && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="">Item</th>
                  <th className="">Operador</th>
                </tr>
              </thead>
              <tbody>
                {locationData?.operators &&
                Array.isArray(locationData.operators) &&
                locationData.operators.length !== 0 ? (
                  locationData.operators.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>Sin datos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const kioskList = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Kioscos</label>
            <button
              className="trash-icon-container"
              onClick={() => setShouldDisplayKioscoTable((prev) => !prev)}
            >
              {shouldDisplayKioscoTable ? <ArrowUp /> : <ArrowRightIcon />}
            </button>
          </div>
        </div>
        {shouldDisplayKioscoTable && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="">Item</th>
                  <th className="">Operador</th>
                </tr>
              </thead>
              <tbody>
                {locationData?.kioscos &&
                Array.isArray(locationData.kioscos) &&
                locationData.kioscos.length !== 0 ? (
                  locationData.kioscos.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>Sin datos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  const barrierHistorytable = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Historial de barreras</label>
            <button
              className="trash-icon-container"
              onClick={() => setShouldDisplayBarrierTable((prev) => !prev)}
            >
              {shouldDisplayBarrierTable ? <ArrowUp /> : <ArrowRightIcon />}
            </button>
          </div>
        </div>
        {shouldDisplayBarrierTable && (
          <Fragment>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="">Item</th>
                    <th className="">Puerta</th>
                    <th className="">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.length !== 0 ? (
                    historyList.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.gateLabel}</td>
                        <td>{transformDate(item.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>Sin datos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {canLoadMoreBarrierList && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className="primary-button"
                  onClick={loadMoreBarrierList}
                >
                  Cargar Mas
                </button>
              </div>
            )}
          </Fragment>
        )}
      </div>
    );
  };

  const financialContent = () => {
    return (
      <div className="primary-content dataSet">
        <div className="header-content">
          <div className="header-row">
            <label className="header-title">Datos Financieros</label>
          </div>
          <label>
            {" "}
            <b>{"Fecha Actual: "}</b> {currentDate}
          </label>
          <div className="financial-content-body">
            <div className="row">
              <label>Buscar por fecha</label>
              <div className="content-row">
                <div className="input-dates-row">
                  <div className="date-form-input">
                    <label htmlFor="">Desde:</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="date-form-input">
                    <label htmlFor="">Hasta:</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setTicketsPage(1);
                      getTickets();
                      getFinancialData();
                      getBarrierSumReq();
                      getBarrierlist();
                    }}
                  >
                    Buscar
                  </button>
                  <label htmlFor="">
                    {" "}
                    <b>Viendo Fecha desde: </b> {fromDate}
                  </label>
                  <label htmlFor="">
                    {" "}
                    <b>Viendo Fecha hasta: </b> {toDate}
                  </label>
                </div>
              </div>
            </div>
            <div className="row">
              <b>Información financiera</b>
              <div className="content-row">
                <label>
                  <b>{"Entradas del día: "}</b> {data?.totalCarsIn}
                </label>
                <label>
                  <b>{"Tickets pagados: "}</b>
                  {data?.totalPayed}
                </label>
                <label>
                  <b>{"Pagos del dia: "}</b>
                  {data?.totalPaid
                    ? transformToCurrency(data.totalPaid)
                    : transformToCurrency(0)}
                </label>
              </div>
            </div>
            <div className="row">
              <b>Información de conteo de entradas</b>
              <div className="content-row">
                <label>
                  <b>{"Total de conteo: "}</b> {data?.totalCarsIn}
                </label>
                {/* <label>
                  <b>{"Total de coches: "}</b>{data?.totalPayed}
                </label> */}
                {/* <label>
                  <b>{"total de Motos: "}</b>{data?.totalPaid }
                </label> */}
              </div>
            </div>
            <div className="row">
              <b>Historial de boton de barrera de salida</b>
              <div className="content-row">
                <label>
                  <b>{"Total de conteo: "}</b> {barrierSummary?.total}
                </label>
              </div>
            </div>
          </div>
        </div>
        {barrierHistorytable()}
      </div>
    );
  };

  const ticketList = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <b>Lista de tickets</b>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>item</th>
                <th>Fecha/Entrada</th>
                <th>Puerta</th>
                <th>Estado</th>
                <th>Coche/Dentro</th>
                <th>Fecha/Salida</th>
                <th>Validado</th>
                <th>fecha/Validacion</th>
                <th>Total/Pagado</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.length === 0 ? (
                <tr>
                  <td colSpan={9}>Sin datos</td>
                </tr>
              ) : (
                tickets?.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      setTicketId(item.ticketId);
                      getTicketByIdReq(item.ticketId);
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {item.fechaEntrada && transformDate(item.fechaEntrada)}
                    </td>
                    <td>{item.gateLabel}</td>
                    <td>{item.estado}</td>
                    <td>{item.fechaSalida ? "No" : "Si"}</td>
                    <td>
                      {item.fechaSalida && transformDate(item.fechaSalida)}
                    </td>
                    <td>{item?.parkingValidation ? "Si" : "No"}</td>
                    <td>
                      {item.validatedAt && transformDate(item.validatedAt)}
                    </td>
                    <td>
                      {item.dataPayment.length !== 0 &&
                        transformToCurrency(
                          item.dataPayment.reduce(
                            (acc, val, index) => (acc += val.amount),
                            0,
                          ),
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {canLoadMore && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="primary-button" onClick={loadMore}>
              Cargar Mas
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="kiosco-info-container">
        <div className="header-container">
          <h1 className="main-header">Información de Ubicación</h1>
          <button className="primary-button">Refrescar Datos</button>
        </div>
        <button
          className="primary-button"
          onClick={() => router.push(`/payTicket/location?id=${locationId}`)}
        >
          {" "}
          Pagar boleto
        </button>
        {LocationGeneralData()}
        {operatorsList()}
        {kioskList()}
        {financialContent()}
        {ticketInformationcontainer()}
        {ticketList()}
      </div>
    </>
  );
}
