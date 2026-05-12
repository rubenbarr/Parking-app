/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ITicket } from "@/types/ticket";
import { transformToCurrency } from "@/assets/utils";
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
  },
  section: {
    marginTop:5,
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
  bottom: {
    fontSize: 9,
  }
});

interface TicketProps {
  ticket: ITicket;
  locationTitle: string;
  ref?: any
}

export const TicketPDF = (props: TicketProps) => {
  const { ticket, locationTitle } = props;

  const getCurrency = (data:ITicket) => {
    if (!data) return transformToCurrency(0)
    const total = data.dataPayment.reduce(
                (acc, payment) =>  acc + payment.amount,
                0,
              )
    return transformToCurrency(total)
  }
  return (
    <Document ref= {props.ref}>
      <Page size={[155, 300]} style={styles.page}>
        <View style={styles.section}>
          <View style={{display:"flex", width:"100%", alignItems:"center", justifyContent:"center"}}>
            <Text style={[styles.header]}>{locationTitle}</Text>
          </View>
          <View style={{display:"flex", width:"100%", alignItems:"center", justifyContent:"center"}}>
            <Text style={{fontWeight:"bold"}}>Recibo de pago</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de entrada: </Text>
            <Text>{new Date(ticket.fechaEntrada).toLocaleString("es-MX")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de último pago: </Text>
            <Text>
              {new Date(ticket.fecha_ultimo_pago).toLocaleString("es-MX")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Veces que se pagó: </Text>
            <Text>{ticket.dataPayment.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Horas cobradas: </Text>
            <Text>{ticket.total_time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total pagado: </Text>
            <Text>
              {getCurrency(ticket)}{" "}
              MXN
            </Text>
          </View>
          <View style={styles.section}>
            {/* <Text>{"RFC: COTJ92052353"}</Text> */}
            <Text style={styles.bottom}>
                Gracias por usar nuestro servicio. Vuelva pronto
            </Text>
          </View>
          <View>
            <Text style={styles.bottom}>
              Para facturar tiene hasta el último día de mes trascurrido, mande correo a
            </Text>
            <Text style={styles.bottom}>
               angelopolispaseo@gmail.com con tus datos fiscales y  foto de este comprobante
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TicketPDF;
