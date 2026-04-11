/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { transformToCurrency } from "@/assets/utils";

import type { CreditFinancialInfo, ICredit } from "@/types/credits";

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
  },
  section: {
    marginBottom: 5,
  },
  header: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "column",
    marginBottom: 3,
  },
  label: {
    fontWeight: "bold",
  },
});
interface TicketProps {
  creditInfo?: ICredit;
  ref?: any;
  financialInfo?: CreditFinancialInfo
}

export const OperatorCreditPdf = (props: TicketProps) => {
  const { creditInfo, financialInfo } = props;
  const height = financialInfo ? 400: 290;

  const financialDataContent = () => {
    return (
      <Fragment>
        <View style={styles.infoRow}>
              <Text style={styles.label}>Tickets Pagados: </Text>
              <Text>{financialInfo?.totalTickets}</Text>
        </View>
        <View style={styles.infoRow}>
              <Text style={styles.label}>Pagado en efectivo: </Text>
              <Text>{transformToCurrency(financialInfo?.totalCash ?? 0)}</Text>
        </View>
        <View style={styles.infoRow}>
              <Text style={styles.label}>Pagado en terminal: </Text>
              <Text>{transformToCurrency(financialInfo?.totalTerminal ?? 0)}</Text>
        </View>
        <View style={styles.infoRow}>
              <Text style={styles.label}>Pagado en transferencia: </Text>
              <Text>{transformToCurrency(financialInfo?.totalTransfer ?? 0)}</Text>
        </View>
      </Fragment>
    )
  }
  return (
    creditInfo && (
      <Document ref={props.ref}>
        <Page size={[155, height]} style={styles.page}>
          <View style={styles.section}>
            <View
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={[styles.header]}>{"Cierre de Credito"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha:</Text>
              <Text>{new Date().toLocaleString("es-MX")}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>fecha de creacion: </Text>
              <Text>
                {new Date(creditInfo.createdAt).toLocaleString("es-MX")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Operador: </Text>
              <Text>{creditInfo.operator}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Creado por: </Text>
              <Text>{creditInfo.createdBy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Credito inicial asignado: </Text>
              <Text>{transformToCurrency(creditInfo.initial_amount)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cambio inicial asignado: </Text>
              <Text>{transformToCurrency(creditInfo.initial_change)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Credito utilizado: </Text>
              <Text>{transformToCurrency(creditInfo.creditUsed)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>credito disponible disponible: </Text>
              <Text>{transformToCurrency(creditInfo.current_amount)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>cambio disponible: </Text>
              <Text>{transformToCurrency(creditInfo.current_change)}</Text>
            </View>
            {financialInfo && financialDataContent()}
          </View>
        </Page>
      </Document>
    )
  );
};

export default OperatorCreditPdf;
