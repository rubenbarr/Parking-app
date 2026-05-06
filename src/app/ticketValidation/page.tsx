/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/context/AuthContext";
import { cancelValidationReq, validateTicketReq } from "@/api/ticketsApi";
import { Response } from "@/api/usersApi";
import { getMyLocations, getStoresInLocation } from "@/api/locationApi";
import { Location } from "@/types/Locations";
import { RefreshCwIcon, Trash2Icon, TrashIcon } from "lucide-react";

import type { IStore, Validations } from "@/types/stores";
import Toggle from "@/components/Toggle/ToggleComp";

interface location {
  id: string;
  value: string;
}

interface Store {
  id: string;
  value: string;
  validations: Validations[];
}

export default function TicketValidation() {
  const { userType, token, setLoadingGlobal, isLoadingGlobal, handleToast } =
    useAuth();

  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<Html5Qrcode>(null);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setIsScanning] = useState(false);
  const [shouldDisplayQrReader, setshouldDisplayQrReader] = useState(false);

  const [locationsPage, SetLocationsPage] = useState(1);
  const [locationsLimit, setLocationsLimit] = useState(50);

  const [locations, setLocations] = useState<location[]>([
    { id: "", value: "Selecciona una ubicacion" },
  ]);
  const [selectedLocation, setSelectedLocation] = useState({
    id: "",
    value: "Selecciona una establecimiento",
  });

  const [storesPage, SetStoresPage] = useState(1);
  const [storesLimit, setStoresLimit] = useState(50);

  const [stores, setStores] = useState<location[]>([
    { id: "", value: "Selecciona una ubicacion" },
  ]);
  const [selectedStore, setSelectedStore] = useState<Store>({
    id: "",
    value: "Selecciona un establecimiento",
    validations: [],
  });
  const [validations, setValidations] = useState<Validations[]>([
    { type: "", rate: 0, time: 0, unit: "", discount: false },
  ]);
  const [selectedValidation, setSelectedValidation] = useState<Validations>({
    type: "Selecciona un tipo de validacion",
    rate: 0,
    time: 0,
    unit: "",
    discount: false,
  });

  const [autoValidation, setAutoValidation] = useState(false);
  const [autoCancelValidation, setAutoCancelValidation] = useState(false);
  const [validationPayload, setValidationPayload] = useState({
    storeId: "",
    type: "",
    locationId: "",
  });

  const [handleValidation, setHandleValidation] = useState(true);
  const [handleCancelValidation, setHandleCancValidation] = useState(true);

  async function getLocations() {
    setLoadingGlobal(true);
    try {
      const req = (await getMyLocations(
        token as string,
        locationsPage,
        locationsLimit,
      )) as Response;
      if (!req.state)
        return handleToast("error", "Hubo un error, comuniquese con ");
      const data = req.data as Location[];
      if (data.length > 0 && locationsPage === 1 && locations.length <= 1) {
        const locations = data.map((item) => ({
          id: item.locationId,
          value: item.title,
        }));
        setLocations([
          { id: "", value: "Selecciona una ubicacion" },
          ...locations,
        ]);
      }
    } catch (error) {
      handleToast("error", "Hubo un error, comuniquese con ");
    } finally {
      setLoadingGlobal(false);
    }
  }

  async function getStoresReq(selected: Store) {
    if (!selected.value || selected.id == "") return;
    setLoadingGlobal(true);
    try {
      const req = (await getStoresInLocation(
        selected.id,
        token as string,
        locationsPage,
        locationsLimit,
      )) as Response;
      if (!req.state)
        return handleToast("error", "Hubo un error, comuniquese con ");
      const data = req.data as IStore[];
      if (data.length > 0 && storesPage === 1 && stores.length <= 1) {
        const stores = data.map((item) => ({
          id: item.storeId,
          value: item.title,
          validations: item.validations,
        }));
        setStores([
          { id: "", value: "Selecciona una establecimiento" },
          ...stores,
        ]);
      }
    } catch (error) {
      handleToast("error", "Hubo un error, comuniquese con ");
    } finally {
      setLoadingGlobal(false);
    }
  }

  const stopScanner = async (eraseResult: boolean) => {
    try {
      if (eraseResult) setResult(null);
      if (scanning && qrInstance.current) {
        await qrInstance.current.stop();
        setIsScanning(false);
        setError(null);
      }
    } catch (error) {
      handleToast("error", "ups, ubo error refresque la pagina");
    }
  };

  const startScanner = async () => {
    setResult(null);
    setError(null);

    const payloadForValidation = {
      storeId: selectedStore.id,
      type: selectedValidation.type,
      locationId: selectedLocation.id
    }
      setValidationPayload(payloadForValidation);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setError(
          "Es posible que tu navegador no soporte tu camara, cambia de navegador a google Chrome",
        );
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      if (videoDevices.length === 0) {
        setError(
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
      setError(
        "Error activando tu camara, comunicate con administracion" + `${error}`,
      );
      setshouldDisplayQrReader(false);
    }
  };

  const validateTicket = async () => {
    if (!result) return;
    try {
      setLoadingGlobal(true);
      const data = (await validateTicketReq(
        token as string,
        result as string,
        validationPayload,
      )) as Response;
      if (!data.state) {
        setError(
          data?.message ||
            "Hubo un error validando ticket, consulte a administracion",
        );
        handleToast(
          "error",
          data?.message ||
            "Hubo un error validando ticket, consulte a administracion",
        );
      } else {
        handleToast("success", "Ticket Validado correctamente");
        setError("Se valido correctamente el ticket");
        cleanup();
      }
    } catch (error: unknown | Response | any) {
      const errorMessage =
        error?.message ||
        "Hubo un error validando ticket, consulte a administracion";
      setError(errorMessage);
      handleToast("error", errorMessage);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const cancelTicketValidation = async () => {
    if (!result) return;
    try {
      setLoadingGlobal(true);
      const data = (await cancelValidationReq(
        token as string,
        result as string,
      )) as Response;
      if (!data.state) {
        setError(
          data?.message ||
            "Hubo un error cancelando validacion ticket, consulte a administracion",
        );
        handleToast(
          "error",
          data?.message ||
            "Hubo un error cancelando validacion, consulte a administracion",
        );
      } else {
        handleToast("success", "Validacion de ticket cancelada correctamente");
        // setError("Se valido correctamente el ticket");
        cleanup();
      }
    } catch (error: unknown | Response | any) {
      const errorMessage =
        error?.message ||
        "Hubo un error validando ticket, consulte a administracion";
      setError(errorMessage);
      handleToast("error", errorMessage);
    } finally {
      setLoadingGlobal(false);
    }
  };

  function onLocationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const selected = locations.find((l) => l.value === value) as Store;
    if (selected) {
      setSelectedLocation(selected);
      getStoresReq(selected);
    }
  }
  function onStoreChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const storeSelected = stores.find((l) => l.value === value) as Store;
    if (storeSelected) {
      if (storeSelected.id != "") {
        setValidations([
          {
            type: "Selecciona un tipo de validacion",
            rate: 0,
            time: 0,
            unit: "",
            discount: false,
          },
          ...storeSelected.validations,
        ]);
      }
      setSelectedStore(storeSelected);
    }
  }
  function onValidationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const validationSelected = validations.find((l) => l.type === value);
    if (validationSelected) {
      setSelectedValidation(validationSelected);
    }
  }

  function cleanup() {
    setSelectedLocation({
      id: "",
      value: "Selecciona una establecimiento",
    });
    setSelectedStore({
      id: "",
      value: "Selecciona un establecimiento",
      validations: [],
    });
    setSelectedValidation({
      type: "Selecciona un tipo de validacion",
      rate: 0,
      time: 0,
      unit: "",
      discount: false,
    });
    setResult("");
    setHandleValidation(true);
    setHandleCancValidation(false);
  }

  async function refresh() {
    cleanup();
    await getLocations();
  }

  // =========== use effects handles

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
    if (result && result.length >= 36) {
      if (handleValidation) {
          validateTicket();
        } else {
          cancelTicketValidation();
        }
        stopScanner(false);
      }
    }, 400);
    return () => clearTimeout(debounceTimer)
  }, [result]);

  // useEffect(() => {
  //   if(autoValidation || autoCancelValidation) { 
  //     navigator.mediaDevices.getUserMedia({ video: true });
  //   }
  // }, [autoValidation, autoCancelValidation]);

  useEffect(() => {
    // if(autoValidation || autoCancelValidation) { 
      navigator.mediaDevices.getUserMedia({ video: true });
    // }
  }, []);
  
  useEffect(() => {
    getLocations();
  },[])



    // =========== END use effects handles

  const qrReader = () => {
    return (
      !error && (
        <div id={"qr-reader"} ref={qrRef} style={{ width: "300px" }}></div>
      )
    );
  };

  const ErrorLabel = () => {
    if (error) {
      return (
        <div>
          <label>{error}</label>
        </div>
      );
    }
  };

  const LocationListElements = () => {
    return (
      userType && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>Ubicaciones asignadas, Seleccione una ubicacion:</b>
          <select
            name={"locations"}
            onChange={onLocationChange}
            className={"main-input"}
            value={selectedLocation.value}
          >
            {locations &&
              locations.map((i) => (
                <option key={i.id} value={i.value}>
                  {i.value}
                </option>
              ))}
          </select>
        </div>
      )
    );
  };

  const StoresListElement = () => {
    return (
      selectedLocation.id !== "" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>Lista de establecimientos, Seleccione 1:</b>
          {stores.length === 0 ||
          (stores.length === 1 && stores[0].id == "") ? (
            <h1>No cuentas con establecimientos asignados</h1>
          ) : (
            <select
              name={"stores"}
              onChange={onStoreChange}
              className={"main-input"}
              value={selectedStore.value}
            >
              {stores &&
                stores.map((i) => (
                  <option key={i.id} value={i.value}>
                    {i.value}
                  </option>
                ))}
            </select>
          )}
        </div>
      )
    );
  };
  const ValidationsItems = () => {
    return (
      selectedStore.id !== "" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>Seleccione una validation</b>
          <select
            name={"validaciones"}
            onChange={onValidationChange}
            className={"main-input"}
            value={selectedValidation.type}
          >
            {validations &&
              validations.map((i, index) => (
                <option key={index++} value={i.type}>
                  {i.type}
                </option>
              ))}
          </select>
        </div>
      )
    );
  };

  const StoreInformationElement = () => {
    return (
      selectedStore.id !== "" && (
        <div>
          <b>{"Establecimiento: "} </b>
          <h1>{selectedStore.value}</h1>
          {ValidationsItems()}
        </div>
      )
    );
  };

  const autoValidationElement = () => {
    if (!scanning) {
      return (
        <button className="primary-button" onClick={startScanner}>
          Validar Ticket con camara
        </button>
      );
    }
    return (
      <button className="primary-button" onClick={() => stopScanner(true)}>
        Cerrar camara y cancelar
      </button>
    );
  };

  const manualValidationElement = () => {
    if (
      selectedLocation.id == "" ||
      selectedStore.id === "" ||
      selectedValidation.type === "Selecciona un tipo de validacion"
    )
      return;
    return (
      <div>
        <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:10, marginBottom:10}}>
          <b>Coloque la id del codigo</b>
          <div
            className="icon-button-container"
            onClick={() => setResult("")}
            >
          <TrashIcon />
          </div>
        </div>
        <input
          type="text"
          className="main-input"
          value={result || ""}
          onChange={(e) => {
              const payloadForValidation = {
              storeId: selectedStore.id,
              type: selectedValidation.type,
              locationId: selectedLocation.id
            }
            setValidationPayload(payloadForValidation);
            const val = e.target.value.replace("'","-");
            setResult(val)}}
        />
      </div>
    );
  };
  const ValidationButtonElement = () => {
    if (
      selectedLocation.id == "" ||
      selectedStore.id === "" ||
      selectedValidation.type == "Selecciona un tipo de validacion"
    )
      return;
    else {
      return (
        <>
          <Toggle
            checked={autoValidation}
            onChange={() => {
              setAutoValidation((prev) => !prev);
            }}
            leftLabel="Validacion Manual"
            rightLabel="Validacion Automatica"
          />
          {autoValidation ? autoValidationElement() : manualValidationElement()}
        </>
      );
    }
  };

  const validationContent = () => {
    return (
      <>
        <div className="actions">
          <button className="primary-button secondary center" onClick={refresh}>
            <RefreshCwIcon />
          </button>
        </div>
        {/* {ErrorLabel()} */}
        {qrReader()}
        {LocationListElements()}
        {StoresListElement()}
        {StoreInformationElement()}
        {ValidationButtonElement()}
      </>
    );
  };

  const autoCancellationContent = () => {
    return autoCancelValidation ? (
      <>
        <button
          className="primary-button secondary"
          onClick={() => {
            if(handleCancelValidation) {
              startScanner();
            } else {
              stopScanner(true);
            }
            setHandleCancValidation((prep) => !prep);
          }}
        >
          {handleCancelValidation
            ? "Cancelar ticket Con camara"
            : "Cerrar camara y cancelar"}
        </button>
        {qrReader()}
      </>
    ) : (
      <div>
        <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:10, marginBottom:10}}>
          <b>Validacion manual, coloque el id del ticket</b>
          <div
            className="icon-button-container"
            onClick={() => setResult("")}
            >
          <TrashIcon />
          </div>
        </div>
        <input
          type="text"
          className="main-input"
          value={result || ""}
          onChange={(e) => {
            const val = e.target.value.replace("'","-");
            setResult(val)}}
        />
      </div>
    );
  };
  const cancelationContent = () => {
    return (
      <div>
        <b>Cancelacion de Validacion</b>
        <>
          <Toggle
            checked={autoCancelValidation}
            onChange={() => {
              setAutoCancelValidation((prev) => !prev);
            }}
            leftLabel="Cancelacion Manual"
            rightLabel="Cancelacion Automatica"
          />
        </>
        {autoCancellationContent()}
      </div>
    );
  };
  return (
    <div className="main-content">
      <h2 className="main-header">Validacion de ticket</h2>
      <button
        className="primary-button secondary"
        onClick={() => {
          setResult("")
          setHandleValidation((prep) => !prep);
        }}
      >
        {handleValidation ? "Cancelar validacion" : "Validar ticket"}
      </button>
      {handleValidation ? validationContent() : cancelationContent()}
    </div>
  );
}
