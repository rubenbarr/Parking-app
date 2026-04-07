/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import QRCodeLib from "qrcode";

import { transformToCurrency } from "@/assets/utils";

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
  ticketId: string;
  title: string;
  message: string;
  totalPaid: number;
  paidAt: string;
}

export const ReciboTicketLost = ({ ticket }: { ticket: TicketProps }) => {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    QRCodeLib.toDataURL(ticket.ticketId).then(setQr);
  }, [ticket.ticketId]);
  return (
    ticket && (
      <Document>
        <Page size={[155, 265]} style={styles.page}>
          <View style={styles.section}>
            <View
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap:5
              }}
            >
              <View>
                {qr && (
                  <Image
                    alt={"qr image"}
                    src={qr}
                    style={{ width: 80, height: 80, marginBottom: 10 }}
                  />
                )}
              </View>
              <Text>{ticket.title}</Text>
              <Text>{ticket.message}</Text>
              <Text>fecha de pago:</Text>
              <Text>{ticket.paidAt}</Text>
              <Text>Monto pagado </Text>
              <Text>{transformToCurrency(ticket.totalPaid)}</Text>
            </View>
          </View>
        </Page>
      </Document>
    )
  );
};
