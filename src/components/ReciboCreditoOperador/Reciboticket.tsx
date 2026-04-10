/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { transformToCurrency } from "@/assets/utils";
import { ICredit } from "@/types/credits";
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
}

export const OperatorCreditPdf = (props: TicketProps) => {
  const { creditInfo } = props;

  return (
    creditInfo && (
      <Document ref={props.ref}>
        <Page size={[155, 290]} style={styles.page}>
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
          </View>
        </Page>
      </Document>
    )
  );
};

export default OperatorCreditPdf;
