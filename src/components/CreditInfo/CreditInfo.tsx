import React, { useEffect, useState } from "react";

import "./creditInfoStyle.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useAuth } from "@/context/AuthContext";
import { fetchCreditInfo } from "@/store/slices/creditSlice";
import { transformToCurrency } from "@/assets/utils";
import { PrinterIcon } from "lucide-react";

interface ICreditProps {
  shouldDisplayCreditInfo?: boolean | false;
}
export default function CreditInfoComponent(props: ICreditProps) {
  const { setLoadingGlobal, token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { creditInfo, hasCredit } = useSelector(
    (state: RootState) => state.creditInfo,
  );
  
  function getPersonalCreditInfo() {
    setLoadingGlobal(true);
    dispatch(fetchCreditInfo({ token: token as string, shouldRequestClosedCredit: props.shouldDisplayCreditInfo }))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  useEffect(() => {
    getPersonalCreditInfo();
  }, []);

  return (
    <div className="credit-info-content">
      <div className="credit-info-header-row">
        <h1 className="secondary-header">Informacion de ultimo credito</h1>
        <button className="icon-button-container">
          <PrinterIcon />
        </button>
      </div>
      {hasCredit || props.shouldDisplayCreditInfo ? (
        <div className="content">
          <label>
            <b>{"Estatus: "}</b>
            {creditInfo?.status}
          </label>
          <label>
            <b>{"$ Credito disponible: "}</b>
            {creditInfo?.current_amount ? transformToCurrency(creditInfo?.current_amount) : transformToCurrency(0)}
          </label>
          <label>
            <b>{"$ Cambio Disponible: "}</b>
            {creditInfo?.current_change ? transformToCurrency(creditInfo?.current_change) : transformToCurrency(0)}
          </label>
          {props.shouldDisplayCreditInfo && (
            <div className="close-credit-information">
              <label>
                <b>{"Estatus de cierre: "}</b>
                {creditInfo?.closed_status}
              </label>
              <label>
                <b>{"Cobrado Por: "}</b>
                {creditInfo?.chargedBy}
              </label>
              <label>
                <b>{"$ Credito asignado: "}</b>
                { creditInfo?.initial_amount ? transformToCurrency(creditInfo?.initial_amount) : transformToCurrency(0)}
              </label>
              <label>
                <b>{"$ Credito usado: "}</b>
                { creditInfo?.finalAmount ? transformToCurrency(creditInfo?.finalAmount) : transformToCurrency(0)}
              </label>
              <label>
                <b>{"Credito entregado: "}</b>
                {creditInfo?.credit_delivered ? transformToCurrency(creditInfo.credit_delivered) : transformToCurrency(0)}
              </label>
              <label>
                <b>{"Comentario: "}</b>
                {creditInfo?.comment}
              </label>
              <label>
                <b>{"Fecha de captura: "}</b>
                {creditInfo?.closed_date}
              </label>
              <label>
                <b>{"Fecha de cierre: "}</b>
                {creditInfo?.chargeAt}
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="no-credit">
          No puedes generar pagos, no cuentas con credito, solicita credito a tu
          administrador.
        </div>
      )}
      <button
        onClick={() => getPersonalCreditInfo()}
        className="primary-button"
      >
        Refrescar info
      </button>
    </div>
  );
}
