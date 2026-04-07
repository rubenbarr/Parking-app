"use client";

import { transformToCurrency } from "@/assets/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { createLostTicket } from "@/api/ticketsApi";
import { useAuth } from "@/context/AuthContext";
import { Response } from "@/api/usersApi";
import { PDFViewer } from "@react-pdf/renderer";
import { ReciboTicketLost } from "@/components/ReciboTicketPermido/ReciboticketPerdido";

interface ICashMethod {
  method: "cash";
  montoPagado: number;
  totalPayed: number;
}

interface IBankMethod {
  method: string;
  montoPagado: number;
  reference: string;
}

interface TicketProps {
  ticketId: string;
  title: string;
  message: string;
  totalPaid: number;
  paidAt: string;
}

export default function TicketLost() {
  const router = useRouter();
  const params = useSearchParams();
  const { token, handleToast, setLoadingGlobal } = useAuth();

  const ticketPaymentAmount = 300;

  const [userInfo, setUserInfo] = useState({
    fullname: "",
    carModel: "",
    plates: "",
  });

  const [cashMethod, setCashMethod] = useState<ICashMethod>({
    method: "cash",
    montoPagado: 0,
    totalPayed: 0,
  });

  const [bankMethod, setBankMethod] = useState<IBankMethod>({
    method: "",
    montoPagado: 0,
    reference: "",
  });

  const initialUserInfo = {
    fullname: "",
    carModel: "",
    plates: "",
  };
  const initialCashMethod = {
    method: "cash",
    montoPagado: 0,
    totalPayed: 0,
  };
  const initialBankMethod = {
    method: "",
    montoPagado: 0,
    reference: "",
  };

  const [ticketInfo, setTicketInfo] = useState<TicketProps | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  useEffect(() => {
    const locId = params.get("locationId");
    if (!locId) {
      router.replace("/ticketPayment");
    } else {
      setLocationId(locId);
    }
  }, []);

  // ========= derived values =========
  const totalPaid = useMemo(() => {
    return (cashMethod.montoPagado || 0) + (bankMethod.montoPagado || 0);
  }, [cashMethod.montoPagado, bankMethod.montoPagado]);

  const totalRemaining = ticketPaymentAmount - totalPaid;

  const change = useMemo(() => {
    const total = cashMethod.totalPayed || 0;
    const amount = cashMethod.montoPagado || 0;
    return Math.max(total - amount, 0);
  }, [cashMethod.totalPayed, cashMethod.montoPagado]);

  const invalidCash = useMemo(() => {
    return cashMethod.montoPagado > cashMethod.totalPayed;
  }, [cashMethod]);

  const canSubmit = useMemo(() => {
    const validUserInfo = Object.values(userInfo).every(Boolean);

    return (
      validUserInfo &&
      totalRemaining === 0 &&
      !invalidCash &&
      cashMethod.montoPagado === cashMethod.totalPayed
    );
  }, [userInfo, totalRemaining, invalidCash, cashMethod.totalPayed]);

  // ========= handlers =========
  const handleSubmit = async () => {
    const dataPayment = [
      ...(Object.values(bankMethod).every(Boolean) ? [bankMethod] : []),
      ...(Object.values(cashMethod).every(Boolean) ? [cashMethod] : []),
    ];

    const payload = {
      amount: ticketPaymentAmount,
      totalPayed: ticketPaymentAmount,
      dataPayment,
      userInfo,
    };

    const ticket = {
      ticketId: "",
      title: "Recibo de pago",
      message: "Este recibo de pago es del pago de un ticket perdido",
      totalPaid: ticketPaymentAmount,
      paidAt: new Date().toLocaleString(),
    };

    try {
      if (!canSubmit) return;
      setLoadingGlobal(true);
      const req = (await createLostTicket(
        token as string,
        locationId as string,
        payload,
      )) as Response;
      console.log(req);
      if (!req.state) {
        return handleToast(
          "error",
          req.message ||
            req.error ||
            "Hubo un error desconocido, intente nuevamente o comuniquese con administracion",
        );
      }
      ticket.ticketId = req.data as unknown as string;
      setTicketInfo(ticket);
    } catch (error) {
      handleToast(
        "error",
        "Hubo un error, intente nuevamente o comuniquese con administracion",
      );
    } finally {
      setLoadingGlobal(false);
    }
  };

  const resetForm = () => {
    setUserInfo(initialUserInfo);
    setCashMethod(initialCashMethod);
    setBankMethod(initialBankMethod);
    setTicketInfo(null);
  };

  const updateUser = (field: keyof typeof userInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value.trimStart() }));
  };

  const updateCash = (field: keyof ICashMethod, value: string | number) => {
    if (field === "montoPagado" || field === "totalPayed") {
      setCashMethod((prev) => ({
        ...prev,
        [field]: parseFloat(value as string),
      }));
    }
  };

  const updateBank = (field: keyof IBankMethod, value: string | number) => {
    if (field === "method" && value === "") {
      setBankMethod((prev) => ({ ...prev, montoPagado: 0 }));
    }
    if (field === "montoPagado") {
      setBankMethod((prev) => ({
        ...prev,
        [field]: parseFloat(value as string),
      }));
    } else {
      setBankMethod((prev) => ({ ...prev, [field]: value }));
    }
  };

  // ========= UI =========

  const PDFViewerComponent = () => {
    return (
      ticketInfo && (
        <PDFViewer style={{ width: "100%", height: "50vh" }}>
          <ReciboTicketLost ticket={ticketInfo as TicketProps} />
        </PDFViewer>
      )
    );
  };
  return (
    <div>
      {PDFViewerComponent()}
      <h1 className="main-header">Boleto perdido</h1>

      <div className="options-header">
        <a className="content-action" onClick={() => router.back()}>
          Regresar
        </a>
      </div>

      <div className="form-container mt-5">
        <b>Informacion de usuario</b>

        <div className="form-info-header">
          <p>
            Capture la informacion completa del usuario, nombre completo y
            placas
          </p>
        </div>

        <div className="input-container">
          <div className="input-form">
            <label>Nombre</label>
            <input
              type="text"
              value={userInfo.fullname}
              onChange={(e) => updateUser("fullname", e.target.value)}
            />
          </div>

          <div className="input-form">
            <label>Marca/modelo y color</label>
            <input
              type="text"
              value={userInfo.carModel}
              onChange={(e) => updateUser("carModel", e.target.value)}
            />
          </div>

          <div className="input-form">
            <label>Placas</label>
            <input
              type="text"
              value={userInfo.plates}
              onChange={(e) => updateUser("plates", e.target.value)}
            />
          </div>
        </div>

        <div className="form-info">
          <b>Pago del boleto perdido</b>

          <div className="flex bg-gray-200 justify-around">
            <div className="flex gap-2">
              <b>Total:</b>
              <b style={{ color: "gray" }}>
                {transformToCurrency(ticketPaymentAmount)}
              </b>
            </div>

            <div className="flex gap-2">
              <b>Pagado:</b>
              <h1>{transformToCurrency(totalPaid)}</h1>
            </div>

            <div className="flex gap-2">
              <b>Restante:</b>
              <h1 className={cn({ "alarm yellow": totalRemaining < 0 })}>
                {transformToCurrency(totalRemaining)}
              </h1>
            </div>
          </div>
        </div>

        {totalRemaining < 0 && (
          <p className="alarm yellow">
            La cantidad pagada es incorrecta, verifique los datos
          </p>
        )}

        {invalidCash && (
          <p className="alarm yellow">
            El total recibido debe ser mayor o igual al monto
          </p>
        )}

        {/* CASH */}
        <div>
          <b className="section-title">Pago en efectivo</b>

          <div className="input-container">
            <div className="input-form">
              <label>Monto</label>
              <input
                type="number"
                min={0}
                value={cashMethod.montoPagado}
                onChange={(e) => updateCash("montoPagado", e.target.value)}
              />
            </div>

            <div className="input-form">
              <label>Total recibido</label>
              <input
                type="number"
                inputMode="decimal"
                value={cashMethod.totalPayed}
                onChange={(e) => updateCash("totalPayed", e.target.value)}
              />
            </div>

            <div className="input-form">
              <label>Cambio</label>
              <h1>{transformToCurrency(change)}</h1>
            </div>
          </div>
        </div>

        {/* BANK */}
        <div>
          <b className="section-title">Pago digital</b>

          <div className="input-container">
            <div className="input-form">
              <label>Metodo</label>
              <select
                value={bankMethod.method}
                onChange={(e) => updateBank("method", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="terminal">Terminal</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div className="input-form">
              <label>Monto</label>
              <input
                type="number"
                min={0}
                value={bankMethod.montoPagado}
                onChange={(e) => updateBank("montoPagado", e.target.value)}
                disabled={!bankMethod.method}
              />
            </div>

            <div className="input-form">
              <label>Referencia</label>
              <input
                type="text"
                value={bankMethod.reference}
                onChange={(e) => updateBank("reference", e.target.value)}
                disabled={!bankMethod.method}
              />
            </div>
          </div>
        </div>

        <div className="form-button">
          {!ticketInfo ? (
            <button
              className="primary-button"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Guardar
            </button>
          ) : (
            <button className="primary-button" onClick={resetForm}>
              Generar nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
