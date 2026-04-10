/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import cn from "classnames";
import {
  addCreditRequest,
  cancelCreditRequest,
  closeCreditRequest,
  getCreditById,
  getCreditsPaginated,
  getOperatorsReqPaginated,
} from "@/api/credits";
import { Response } from "@/api/usersApi";
import { transformDate, transformToCurrency } from "@/assets/utils";
import { UserTemplate } from "@/types/user";
import "./creditsStyle.scss";
import { PDFViewer } from "@react-pdf/renderer";
import OperatorCreditPdf from "@/components/ReciboCreditoOperador/Reciboticket";
import { ICredit } from "@/types/credits";
import { PrinterIcon } from "lucide-react";

interface CreditList {
  createdAt: string;
  createdBy: string;
  current_amount: number | null;
  finalAmount: string | number | null;
  initial_amount: number | null | string;
  creditCharged: number | null;
  operator: string;
  requestId: string;
  status: string;
  updatedAt: string;
  userId: string;
  creditUsed?: string;
  initial_change?: string | number | null;
  current_change ?: number | null;
  change_delivered ? : number | null;
}

interface IOperator {
  userId: string;
  fullname: string;
}

interface IClosedCredit {
  credit_delivered: string | number;
  closed_date: string;
  receptor: string;
  closed_status: string;
  comment: string;
  change_delivered: string;
}

export default function Page() {
  //initial states
  const initialCreditInfo = {
    createdAt: "",
    createdBy: "",
    current_amount: null,
    finalAmount: null,
    initial_amount: null,
    initial_change: null,
    operator: "",
    requestId: "",
    status: "",
    updatedAt: "",
    userId: "",
    creditCharged: null,
  };

  const initialCreditCloseInfo = {
    credit_delivered: "",
    closed_date: "",
    receptor: "",
    closed_status: "",
    comment: "",
    change_delivered: ""
  };

  //initial states END

  //utils
  const { userType, token, handleToast, setLoadingGlobal } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const searchParams = useSearchParams();
  const handleRouter = (id: string) => {
    return router.push(`/credits?requestId=${id}`);
  };

  //end of utils

  //State
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [creditList, setCreditList] = useState<CreditList[]>([]);
  const [creditListFiltered, setCreditListFiltered] = useState<CreditList[]>(
    [],
  );
  const [creditInfo, setCreditInfo] = useState<CreditList>(initialCreditInfo);
  const [creditsPage, setCreditsPage] = useState(1);
  const [creditsLimit, setCreditsLimit] = useState(20);
  const [shouldDisplayCreditInfo, setShouldDisplayCreditInfo] = useState({
    timer: false,
    inPlace: false,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [operators, setOperators] = useState<IOperator[]>([]);
  const [operatorsFiltered, setOperatorsFiltered] = useState<IOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [shouldDisplayOperators, setShouldDisplayOperators] = useState(false);
  const [canSubmitCredit, setCanSubmitCredit] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [canLoadMoreOperators, setCanLoadMoreOperators] = useState(true);
  const [validOperator, setValidOperator] = useState(false);
  const [operatorsPage, setOperatorsPage] = useState(1);
  const [operatorslimit, setOperatorsLimit] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const inputOperatorsRef = useRef(false);
  const [cancelationComment, setCancelationComment] = useState<string | null>(
    null,
  );
  const [closeCreditInfo, setCloseCreditInfo] = useState<IClosedCredit>(
    initialCreditCloseInfo,
  );
  const [canSubmitCreditClose, setCanSubmitCreditClose] = useState(false);
  const [shouldDisplayWarningTextAmount, setShouldDisplayWarningTextAmount] =
    useState(false);
  const [amountWarningText, setAmountWarningText] = useState("");
  const [invalidCloseDate, SetInvalidCloseDate] = useState(false);
  const [creditListFilter, setCreditListFilter] = useState("");
  const [creditId, setCreditId] = useState<string | null>(null);
  const [displayPdfView, SetDisplayPdfView] = useState<boolean>(false);

  //end of state

  //begin API calls

  async function getCredits(
    page: number,
    limit: number,
    shouldLoadMore: boolean,
    shouldDisplayLoading: boolean = false,
  ) {
    if (shouldDisplayLoading) {
      setLoadingGlobal(true);
    }
    let currentPage = page;
    if (shouldLoadMore) {
      currentPage = page + 1;
      setCreditsPage(currentPage);
      setLoadingGlobal(true);
    }
    const req = (await getCreditsPaginated(
      currentPage,
      limit,
      token as string,
      { fromDate, toDate },
    )) as Response;
    setLoadingGlobal(false);
    if (req.state) {
      const data = req.data as CreditList[];
      if (data.length > 0) {
        if (shouldLoadMore) {
          setCreditList((prev) => [...data, ...prev]);
          setCreditListFiltered((prev) => [...data, ...prev]);
        } else {
          setCreditList(data);
          setCreditListFiltered(data);
        }
        setCanLoadMore(true);
      } else setCanLoadMore(false);
    } else {
      handleToast("error", "Hubo un error obteniendo creditos");
    }
  }
  async function getCreditInfo(creditId: string) {
    try {
      setLoadingGlobal(true);
      const req = (await getCreditById(creditId, token as string)) as Response;
      if (req.state) {
        const data = req.data as CreditList[];
        setCreditInfo(data[0]);
        setIsEdit(true);

        const creditInfoData = data[0] as any;
        addCloseCreditInfo(creditInfoData, data[0].status);
        handleShouldDisplayCreditInfo("show", true);
      } else {
        setIsEdit(false);
        handleShouldDisplayCreditInfo("hide", false);
        router.replace("/credits");
      }
    } catch (error) {
      setIsEdit(false);
      handleShouldDisplayCreditInfo("hide", false);
      router.replace("/credits");
    } finally {
      setLoadingGlobal(false);
    }
  }
  async function getOperators(page: number, limit: number) {
    const req = (await getOperatorsReqPaginated(
      page,
      limit,
      token as string,
    )) as Response;
    if (req.state) {
      const data = req.data as UserTemplate[];
      if (data.length !== 0) {
        if (page === 1) {
          setOperators(data as any);
          setOperatorsFiltered(data as any);
        } else {
          setOperators((prev) => [...prev, ...(data as any)]);
          setOperatorsFiltered((prev) => [...prev, ...(data as any)]);
        }
      } else {
        setCanLoadMoreOperators(false);
      }
    } else {
      handleToast("error", "Hubo un error obteniendo creditos");
    }
  }

  async function addCredit() {
    if (!canSubmitCredit) return;
    setLoadingGlobal(true);
    const currentAmount = creditInfo.initial_amount as string;
    const initial_change = creditInfo?.initial_change as unknown as string;
    const newData = {
      userId: creditInfo.userId,
      amount: parseFloat(currentAmount.replace("$", "").replace(",", "")),
      initial_change: parseFloat(
        initial_change.replace("$", "").replace(",", ""),
      ),
    };
    const req = (await addCreditRequest(token as string, newData)) as Response;
    setLoadingGlobal(false);
    if (req.state) {
      setCreditInfo(initialCreditInfo);
      handleShouldDisplayCreditInfo("hide", false);
      await getCredits(creditsPage, creditsLimit, false);
      handleToast("success", "Credito asignado correctamente");
    } else {
      handleToast(
        "error",
        req.message ||
          "Hubo un error, intente más tarde o comunique con administración",
      );
    }
  }

  async function refreshPage() {
    try {
      setLoadingGlobal(true);
      await Promise.all([
        getCredits(creditsPage, creditsLimit, false),
        getCreditById(creditId as string, token as string),
      ]);
    } catch (error) {
    } finally {
      setLoadingGlobal(false);
    }
  }

  async function cancelCredit() {
    if (creditInfo.status !== "disponible") return;
    setLoadingGlobal(true);
    const req = (await cancelCreditRequest(
      token as string,
      { comentario: cancelationComment },
      creditInfo.requestId,
    )) as Response;
    if (req.state) {
      setShowModal(false);
      handleToast("success", req.message ?? "Credito cancelado correctamente");
      setCancelationComment(null);
      setIsEdit(false);
      setCreditInfo(initialCreditInfo);
      handleShouldDisplayCreditInfo("hide", false);
      getCredits(creditsPage, creditsLimit, false);
    } else {
      handleToast(
        "error",
        req.message ??
          "Hubo un error, intente más tarde o comuniquese con administración",
      );
    }
    setLoadingGlobal(false);
  }

  async function closeCredit() {
    if (!canSubmitCreditClose || !isEdit) return;
    try {
      setLoadingGlobal(true);
      const req = (await closeCreditRequest(
        token as string,
        closeCreditInfo,
        creditInfo.requestId,
      )) as Response;
      if (req.state) {
        router.push("/credits");
        setIsEdit(false);
        refreshPage();
        setCloseCreditInfo(initialCreditCloseInfo);
        handleShouldDisplayCreditInfo("hide", false);
        handleToast("success", "Se cerró corectamente el crédito");
      } else {
        handleToast(
          "error",
          req?.message ||
            "Hubo un error, intente nuevamente o comuniquese con administracion",
        );
      }
    } catch (error) {
      handleToast(
        "error",
        "Hubo un error, intente nuevamente o comuniquese con administracion",
      );
    } finally {
      setLoadingGlobal(false);
    }
  }

  //============= end of api calls  ================

  // utils and functions //
  function addCloseCreditInfo(data: IClosedCredit, status:string) {
    if (status === 'cobrado') {

      const { credit_delivered, closed_date, receptor, closed_status, comment, change_delivered } =
      data;
      
      const closeInfo = {
        credit_delivered,
        closed_date,
        receptor,
        closed_status,
        comment,
        change_delivered,
      };
      
      setCloseCreditInfo(closeInfo as IClosedCredit);
    } else {
      setCloseCreditInfo(initialCreditCloseInfo)
    }
  }

  const handleLoadMore = async () => {
    setShouldDisplayOperators(true);
    const nextPage = operatorsPage + 1;
    setOperatorsPage(nextPage);
    setLoadingOperators(true);
    await getOperators(nextPage, operatorslimit);
    setLoadingOperators(false);
  };

  const handleFilteredOperators = (val: string) => {
    setValidOperator(val === selectedOperator);
    setCreditInfo((prev) => ({ ...prev, operator: val }));
    setOperatorsFiltered(
      operators.filter((i) =>
        i.fullname.toLocaleLowerCase().includes(val.toLocaleLowerCase()),
      ),
    );
    if (val === "") setOperatorsFiltered(operators);
  };

  const handleCreditAmountInput = (val: string, key: keyof CreditList) => {
    if (isNaN(val as any)) return;
    setCreditInfo((prev) => ({ ...prev, [key]: val }));
  };

  function transformToCurrencyFunc(key: keyof CreditList) {
    const currentAmount = transformToCurrency(creditInfo[key] as number);
    setCreditInfo((prev) => ({ ...prev, [key]: currentAmount }));
  }

  function transformBackCurrency(key: keyof CreditList) {
    const initial = creditInfo[key] as string;
    if (initial === "" || !initial) return;
    const transform = initial.replace("$", "").replace(",", "");
    setCreditInfo((prev) => ({ ...prev, [key]: transform }));
  }

  const handleFinalAmountToDeliver = () => {

    const deliverAmount = closeCreditInfo?.credit_delivered
      ? parseFloat(closeCreditInfo?.credit_delivered as string)
      : 0;

    const finalAmount = creditInfo?.finalAmount || creditInfo?.creditUsed || 0;
    const sFinalAmount = new String(finalAmount)
      .replace("$", "")
      .replace(",", "");
      const sCurrentCreditUsed = new String(creditInfo.current_amount)
      .replace("$", "")
      .replace(",","")

    if (closeCreditInfo?.credit_delivered === "") return setShouldDisplayWarningTextAmount(false);
    else {
      if(creditInfo.status === 'cerrado') {
        if (deliverAmount > parseInt(sFinalAmount)) {
          setAmountWarningText("La cantidad recibida es mayor");
          setCloseCreditInfo((prev) => ({ ...prev, closed_status: "exceso pago" }));
        } else if (deliverAmount < parseInt(sFinalAmount)) {
          setCloseCreditInfo((prev) => ({ ...prev, closed_status: "incompleto" }));
          setAmountWarningText("La cantidad recibida es menor, incompleto.");
        } else if (deliverAmount === parseInt(sFinalAmount)) {
          setCloseCreditInfo((prev) => ({ ...prev, closed_status: "completo" }));
        }
        setShouldDisplayWarningTextAmount(
          deliverAmount > parseFloat(sFinalAmount) ||
          deliverAmount < parseFloat(sFinalAmount),
        );
      } else {
        if (deliverAmount > parseFloat(sFinalAmount)) {
          setAmountWarningText("La cantidad recibida es mayor");
          setCloseCreditInfo((prev) => ({ ...prev, closed_status: "exceso pago" }));
        } else if (deliverAmount < parseFloat(sFinalAmount)) {
          setCloseCreditInfo((prev) => ({ ...prev, closed_status: "incompleto" }));
          setAmountWarningText("La cantidad recibida es menor, incompleto.");
        } else if (deliverAmount === parseFloat(sFinalAmount)) {
          setCloseCreditInfo((prev) => ({ ...prev, closed_status: "completo" }));
        }
        setShouldDisplayWarningTextAmount(
        deliverAmount > parseFloat(sFinalAmount) ||
        deliverAmount < parseFloat(sFinalAmount),
        );
      }
    }
  };

  function checkCanSubmitCreditClose() {
    const hasNotEmptyVals = Object.values(closeCreditInfo).every(
      (v) => v !== "",
    );

    const currenDate = new Date();
    currenDate.setHours(0, 0, 0, 0);

    let isFuture = false;

    if (closeCreditInfo.closed_date !== "") {
      const closeDate = new Date(`${closeCreditInfo.closed_date}`);
      isFuture = closeDate > currenDate;
      SetInvalidCloseDate(isFuture);
    }
    setCanSubmitCreditClose(hasNotEmptyVals && !isFuture);
  }

  const handleShouldDisplayCreditInfo = (caseType: string, state: boolean) => {
    switch (caseType) {
      case "show":
        setShouldDisplayCreditInfo((prev) => ({ ...prev, timer: state }));
        setTimeout(() => {
          setShouldDisplayCreditInfo((prev) => ({ ...prev, inPlace: state }));
        }, 100);
        break;

      case "hide":
        setShouldDisplayCreditInfo((prev) => ({ ...prev, inPlace: state }));
        setTimeout(() => {
          setShouldDisplayCreditInfo((prev) => ({ ...prev, timer: state }));
        }, 100);
        break;
      default:
        break;
    }
  };

  async function handleRequests() {
    await Promise.all([
      getCredits(creditsPage, creditsLimit, false),
      getOperators(operatorsPage, operatorslimit),
    ]);
  }

  const shouldDisableCloseCreditInput = () => {
    return (
      creditInfo?.status === "disponible" ||
      creditInfo?.status === "cancelado" ||
      creditInfo.status === "cobrado"
    );
  };

  function handleFilteredCreditList(filterVal: string) {
    if (filterVal === "") setCreditListFiltered(creditList);
    else {
      const filteredValues = creditListFiltered.filter(
        (item) =>
          item.operator.includes(filterVal.trim()) ||
          (item?.finalAmount &&
            typeof item?.finalAmount === "string" &&
            item?.finalAmount?.includes(filterVal.trim())) ||
          item.status.includes(filterVal.trim()),
      );
      setCreditListFiltered(filteredValues);
    }
  }

  // useEffect events

  useEffect(() => {
    if (!userType || userType !== "global-admin") router.replace("/dashboard");
  }, [userType, router]);

  useEffect(() => {
    // getCredits();
    // getOperators(operatorsPage, operatorslimit);
    handleRequests();
    const requestId = searchParams.get("requestId");
    if (requestId) {
      getCreditInfo(requestId);
      setCreditId(requestId);
    } else {
      setIsEdit(false);
      handleShouldDisplayCreditInfo("hide", false);
    }
  }, []);

  useEffect(() => {
    setCanSubmitCredit(
      validOperator &&
        creditInfo.operator !== "" &&
        creditInfo.initial_amount !== "" &&
        creditInfo.initial_amount !== "$0.00" &&
        creditInfo.initial_amount !== "0.00" &&
        creditInfo.initial_change !== "" &&
        creditInfo.initial_change !== "$0.00" &&
        creditInfo.initial_change !== "0.00",
    );
  }, [creditInfo]);

  useEffect(() => {
    handleFinalAmountToDeliver();
    checkCanSubmitCreditClose();
  }, [closeCreditInfo?.credit_delivered]);

  useEffect(() => {
    checkCanSubmitCreditClose();
  }, [closeCreditInfo]);

  // rendering components

  const deleteCreditRequestModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-body">
        <div className="modal-container">
          <h1>Cancelación de crédito</h1>
          <div className="content">
            <p>
              ¿Deséa cancelar crédito? coloque la justificación de la
              cancelación
            </p>
            <input
              placeholder="Justificación de cancelación"
              className="main-input white"
              value={cancelationComment ?? ""}
              onChange={(e) => setCancelationComment(e.target.value)}
            />
          </div>

          <div className="actions-modal-buttons">
            <button
              className="primary-button"
              onClick={() => setShowModal(false)}
            >
              Salir
            </button>
            <button
              className="primary-button"
              onClick={() => cancelCredit()}
              disabled={!cancelationComment}
            >
              Cancelar credito
            </button>
          </div>
        </div>
      </div>
    );
  };

  const selectContainer = () => {
    if (!shouldDisplayOperators || isEdit) return null;
    return (
      <div
        className={cn("select-container", {
          "no-item": operatorsFiltered && operatorsFiltered.length === 0,
        })}
      >
        {" "}
        {loadingOperators && (
          <div className="loading-operators-icon">cargando...</div>
        )}
        {operatorsFiltered && operatorsFiltered.length > 0 ? (
          <>
            {operatorsFiltered.map((i) => (
              <div
                className={cn("select-item", {
                  selected: i.fullname === creditInfo.operator,
                })}
                key={i.userId}
                onClick={() => {
                  setValidOperator(true);
                  setSelectedOperator(i.fullname);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();

                  setCreditInfo((prev) => ({
                    ...prev,
                    operator: i.fullname,
                    userId: i.userId as any,
                  }));
                }}
              >
                <label className="item">{i.fullname}</label>
              </div>
            ))}
            {canLoadMoreOperators && (
              <div
                className={cn("select-item")}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleLoadMore();
                }}
              >
                <label className="item">cargar más</label>
              </div>
            )}
          </>
        ) : (
          <div className="select-item">
            <label>sin elementos</label>
          </div>
        )}
      </div>
    );
  };
  const creditContainerInfo = () => {
    if (!shouldDisplayCreditInfo.timer) return null;
    return (
      <div
        className={cn("credit-container", {
          inPlace: shouldDisplayCreditInfo.inPlace,
        })}
      >
        <div className="buttons-container">
          <button
            className="primary-button secondary"
            onClick={() => {
              handleShouldDisplayCreditInfo("hide", false);
              setCreditInfo(initialCreditInfo);
              setIsEdit(false);
              router.replace("/credits");
            }}
          >
            Cancelar
          </button>
          {isEdit ? (
            <button
              className={cn("primary-button", {
                disable: creditInfo?.status !== "disponible",
              })}
              disabled={creditInfo?.status !== "disponible"}
              onClick={() => setShowModal(true)}
            >
              Cancelar
            </button>
          ) : (
            <button
              className={cn("primary-button", { disable: !canSubmitCredit })}
              disabled={!canSubmitCredit}
              onClick={addCredit}
            >
              Guardar
            </button>
          )}
        </div>
        <div className="credit-info-header">
          <h2>Información de credito</h2>
          <label>{isEdit ? "Crédito asignado" : "Nuevo Crédito"}</label>
        </div>
        <div className="main-content-credit">
          <div className="content-info">
            <label>Operador</label>
            <input
              placeholder="seleccionar operador"
              className="main-input white"
              type="text"
              value={creditInfo.operator}
              onChange={(e) => handleFilteredOperators(e.target.value)}
              onFocus={() => setShouldDisplayOperators(true)}
              onBlur={() => {
                if (!inputOperatorsRef.current) {
                  setShouldDisplayOperators(false);
                }
                inputOperatorsRef.current = false;
              }}
              disabled={isEdit}
            />
            {selectContainer()}
          </div>
          <div className="content-info">
            <label>$ Crédito Asignado</label>
            <input
              disabled={isEdit}
              placeholder="$ cantidad de crédito"
              type="text"
              className="main-input white"
              value={creditInfo.initial_amount ?? ""}
              onChange={(e) =>
                handleCreditAmountInput(e.target.value, "initial_amount")
              }
              onBlur={() => transformToCurrencyFunc("initial_amount")}
              onFocus={() => transformBackCurrency("initial_amount")}
            />
          </div>
          <div className="content-info">
            <label>$ Cambio Asignado</label>
            <input
              disabled={isEdit}
              placeholder="$ cantidad de crédito"
              type="text"
              className="main-input white"
              value={creditInfo.initial_change ?? ""}
              onChange={(e) =>
                handleCreditAmountInput(e.target.value, "initial_change")
              }
              onBlur={() => transformToCurrencyFunc("initial_change")}
              onFocus={() => transformBackCurrency("initial_change")}
            />
          </div>
        </div>
        {isEdit && (
          <>
            <div className="main-content-credit secondary">
              <div className="content-info">
                <label>Crédito Actual</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={
                    creditInfo?.current_amount
                      ? transformToCurrency(creditInfo?.current_amount)
                      : transformToCurrency(0)
                  }
                />
              </div>
              <div className="content-info">
                <label>Crédito Final</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={
                    creditInfo?.finalAmount
                      ? transformToCurrency(creditInfo?.finalAmount as number)
                      : ""
                  }
                />
              </div>
              <div className="content-info">
                <label>Total Cobrado</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={
                    creditInfo?.creditUsed
                      ? transformToCurrency(creditInfo.creditUsed as any)
                      : transformToCurrency(0)
                  }
                />
              </div>
              <div className="content-info">
                <label>Estatus</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={creditInfo?.status}
                />
              </div>
              <div className="content-info">
                <label>Cambio usado</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={ creditInfo.current_change ? transformToCurrency(creditInfo?.current_change as number) : "$0.0"}
                />
              </div>
              <div className="content-info">
                <label>Creado Por</label>
                <input
                  placeholder=""
                  className="main-input white"
                  type="text"
                  disabled
                  value={creditInfo?.createdBy}
                />
              </div>
              <div className="content-info">
                <label>Fecha de creación</label>
                <input
                  placeholder=""
                  type="text"
                  className="main-input white"
                  disabled
                  value={creditInfo?.createdAt ? transformDate(creditInfo.createdAt) : ""}
                />
              </div>
            </div>
            {creditInfo?.status == "disponible" ||
            creditInfo?.status == "cancelado" ? null : (
              <div className="credit-options-container">
                <div className="options-header">
                  <label>
                    {" "}
                    <b>
                      {creditInfo.status === "cobrado"
                        ? "Información de cierre de crédito"
                        : "Cerrar Crédito"}
                    </b>
                  </label>
                </div>
                <div className="content">
                  <div className="content-info">
                    <label>Cantidad Entregada</label>
                    <input
                      className="main-input white"
                      placeholder="$ Cantidad"
                      disabled={shouldDisableCloseCreditInput()}
                      type="text"
                      value={closeCreditInfo.credit_delivered}
                      onChange={(e) => {
                        if (!isNaN(e.target?.value as any)) {
                          setCloseCreditInfo((prev) => ({
                            ...prev,
                            credit_delivered: e.target.value,
                          }));
                        }
                      }}
                    />
                    {shouldDisplayWarningTextAmount && (
                      <label
                        style={{ color: "red" }}
                        className="informative-input-labe"
                      >
                        {amountWarningText}
                      </label>
                    )}
                  </div>
                  <div className="content-info">
                    <label>Fecha de retiro/cierre</label>
                    <input
                      className="main-input white"
                      type="date"
                      disabled={shouldDisableCloseCreditInput()}
                      value={closeCreditInfo.closed_date}
                      onChange={(e) =>
                        setCloseCreditInfo((prev) => ({
                          ...prev,
                          closed_date: e.target.value,
                        }))
                      }
                    />
                    {invalidCloseDate && (
                      <label
                        style={{ color: "red" }}
                        className="informative-input-labe"
                      >
                        Fecha invalida!
                      </label>
                    )}
                  </div>
                  <div className="content-info">
                    <label>Cambio Entregado</label>
                    <input
                      className="main-input white"
                      type="text"
                      disabled={shouldDisableCloseCreditInput()}
                      value={closeCreditInfo.change_delivered}
                      placeholder="$ entregado"
                      onChange={(e) =>
                        !isNaN(e.target.value as any) && setCloseCreditInfo((prev) => ({
                          ...prev,
                          change_delivered: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="content-info">
                    <label>Entrega</label>
                    <input
                      className="main-input white"
                      type="text"
                      disabled={shouldDisableCloseCreditInput()}
                      value={closeCreditInfo.receptor}
                      placeholder="Persona que entrega"
                      onChange={(e) =>
                        setCloseCreditInfo((prev) => ({
                          ...prev,
                          receptor: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="content-info">
                    <label>Comentarios</label>
                    <input
                      className="main-input white"
                      type="text"
                      disabled={shouldDisableCloseCreditInput()}
                      value={closeCreditInfo.comment}
                      onChange={(e) =>
                        setCloseCreditInfo((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <button
                  className="primary-button"
                  disabled={
                    shouldDisableCloseCreditInput() || !canSubmitCreditClose
                  }
                  onClick={closeCredit}
                >
                  Cerrar crédito
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

const PDFViewerComponent = () => {
  return (
    displayPdfView && creditInfo && (
      <PDFViewer style={{ width: "100%", height: "50vh" }}>
        <OperatorCreditPdf
          creditInfo={creditInfo as any}
        />
      </PDFViewer>
    )
  );
};
const printActionButtons = () => {
  return (
    <>
    { displayPdfView 
      ?
      <button className='primary-button' onClick={() => {SetDisplayPdfView(false)}}>Ocultar impresion</button> 
      :
      <button className='trash-icon-container' onClick={() => {SetDisplayPdfView(true)}}>
      <PrinterIcon/>
      </button> }
        </>
    )
}
  if (!userType || userType !== "global-admin") return null;
  else {
    return (
      <div className="main-content">
        {PDFViewerComponent()}
        {creditInfo.requestId && printActionButtons()}
        {deleteCreditRequestModal()}
        <div className="main-header">Manejo de créditos</div>
        <div className="primary-content dataSet">
          <div className="header-content with-options">
            <button
              className={cn("primary-button")}
              onClick={() => {
                handleShouldDisplayCreditInfo("show", true);
                setIsEdit(false);
                setCreditInfo(initialCreditInfo);
                router.replace("/credits");
              }}
            >
              Generar nuevo crédito
            </button>
            <button onClick={refreshPage} className="primary-button reset">
              Refrescar datos
            </button>
          </div>
          {creditContainerInfo()}
          <div className="content-row">
            <label>Buscar por fecha</label>
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
                  getCredits(1, creditsLimit, false, true);
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
          <input
            className="filter-input"
            placeholder="Filtrar por operador o cantidad o estatus"
            value={creditListFilter}
            onChange={(e) => {
              setCreditListFilter(e.target.value);
              handleFilteredCreditList(e.target.value);
            }}
          />
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="">Item</th>
                  <th className="">Fecha/Creación</th>
                  <th className="">$ Inicial</th>
                  <th className="">$ Restante</th>
                  <th className="">$ final</th>
                  <th className="">Cambio asignado</th>
                  <th className="">Cambio Disponible</th>
                  <th className="">Cambio Entregado</th>
                  <th className="">Operador</th>
                  <th className="">estatus</th>
                  <th className="">Creado Por</th>
                </tr>
              </thead>
              <tbody>
                {creditListFiltered.length > 0 ? (
                  creditListFiltered.map((item: CreditList, index: number) => (
                    <tr
                      key={item.requestId}
                      className=""
                      onClick={() => {
                        handleRouter(item.requestId);
                        getCreditInfo(item.requestId);
                        // setIsEdit(true);
                        // setCreditInfo({
                        //   ...item,
                        //   initial_amount: transformToCurrency(
                        //     item.initial_amount as number
                        //   ),
                        // });
                        // handleShouldDisplayCreditInfo("show", true);
                      }}
                    >
                      <td>{(index = index + 1)}</td>
                      <td className="">{transformDate(item.createdAt)}</td>
                      <td className="">
                        {transformToCurrency(
                          item.initial_amount as number,
                        )}{" "}
                      </td>
                      <td className="">
                        {transformToCurrency(item.current_amount as number)}
                      </td>
                      <td className="">
                        {item.finalAmount
                          ? transformToCurrency(item?.finalAmount as number)
                          : ""}
                      </td>
                      <td className="">
                        {item.initial_change
                          ? transformToCurrency(item?.initial_change as number)
                          : ""}
                      </td>
                      <td className="">
                        {item.current_change
                          ? transformToCurrency(item?.current_change as number)
                          : ""}
                      </td>
                      <td className="">
                        {item.change_delivered
                          ? transformToCurrency(item?.change_delivered as number)
                          : ""}
                      </td>
                      <td className="">{item.operator}</td>
                      <td className="">{item.status}</td>
                      <td className="">{item.createdBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={"load-more-container"}>
            {canLoadMore ? (
              <button
                className={"load-more-button"}
                onClick={() => getCredits(creditsPage, creditsLimit, true)}
              >
                Cargar mas
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
