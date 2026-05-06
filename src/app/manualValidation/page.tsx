/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { manualVehicleValidation } from "@/api/ticketsApi";
import { Response } from "@/api/usersApi";
import Toggle from "@/components/Toggle/ToggleComp";
import { useAuth } from "@/context/AuthContext";
import { Html5Qrcode } from "html5-qrcode";
import { TrashIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function Page() {
  // declarations
  const params = useSearchParams();
  const router = useRouter();

  const { token, userType, isLoadingGlobal, handleToast, setLoadingGlobal } =
    useAuth();

  // end of declaration

  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<Html5Qrcode>(null);

  // state declaration

  const [error, setError] = useState<string | null>(null);
  const [LocationId, setLocationId] = useState<string | null>(null);
  const [autoValidation, setAutoValidation] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setIsScanning] = useState(false);
  const [shouldDisplayQrReader, setshouldDisplayQrReader] = useState(false);

  // end of state declaration

  // functions
  const startScanner = async () => {
    setResult(null);
    setError(null);
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

  async function manualValidationReq() {
    try {
      setLoadingGlobal(true);
      const req = (await manualVehicleValidation(
        token as string,
        LocationId as string,
        result as string,
      )) as Response;
      if (scanning) {
        setIsScanning(false);
        stopScanner(true);
      }
      if (!req.state)
        return handleToast(
          "error",
          req?.message ||
            req?.error ||
            "Error haciendo validacion manual, comuniquese con administracion",
        );
      setResult("");
      handleToast("success", "Validacion Manual correcta");
    } catch (error: any) {
      handleToast(
        "error",
        error?.message ||
          error?.error ||
          "Error haciendo validacion manual, comuniquese con administracion",
      );
    } finally {
      setLoadingGlobal(false);
    }
  }
  // end of functions

  // useEffect
  useEffect(() => {
    const locationIdP = params.get("locationId");
    if (!locationIdP) return router.back();
    setLocationId(locationIdP);
  }, []);

  useEffect(() => {
    if (autoValidation) {
      navigator.mediaDevices.getUserMedia({ video: true });
    }
  }, [autoValidation]);

  useEffect(() => {
    if (!result) return;

    const delayDebounce = setTimeout(() => {
      if (result.length >= 32) {
        manualValidationReq();
      }
    }, 300); // wait 300ms after typing stops

    return () => clearTimeout(delayDebounce);
  }, [result]);

  // end of useEffect

  // start  render elements

  const qrReader = () => {
    return (
      !error && (
        <div id={"qr-reader"} ref={qrRef} style={{ width: "300px" }}></div>
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

  const autoValidationContent = () => {
    return (
      autoValidation && (
        <>
          {autoValidationElement()}
          {qrReader()}
        </>
      )
    );
  };

  const ManualValidation = () => {
    return (
      !autoValidation && (
        <div className="">
          <p>Buscar ticket por Id</p>
          <div className="input-row">
            <input
              type="text"
              className="main-input"
              placeholder="ticketId"
              value={result || ""}
              onChange={(e) => {
                const formattedValue = e.target.value.replace(/'/g, "-");
                setResult(formattedValue);
              }}
            />
            <div className="input-buttons">
              <button
                className="icon-button-container"
                onClick={() => {
                  setResult("");
                }}
              >
                <TrashIcon />
              </button>
              <button
                onClick={() => manualValidationReq()}
                className="primary-button"
                disabled={isLoadingGlobal || result === ""}
              >
                Buscar Ticket
              </button>
            </div>
          </div>
        </div>
      )
    );
  };

  return (
    <div className="main-content">
      <h1 className="main-header">Validacion manual de vehiculo</h1>
      <b>
        Coloque o escanee el ID del ticket para marcar como ingresado al
        vehiculo{" "}
      </b>

      <Toggle
        checked={autoValidation}
        onChange={() => {
          setAutoValidation((prev) => !prev);
        }}
        leftLabel="Validacion Manual"
        rightLabel="Validacion Automatica"
      />

      {autoValidationContent()}
      {ManualValidation()}
    </div>
  );
}
