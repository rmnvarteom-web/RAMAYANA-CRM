import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatBangkokDate } from "@/lib/timezone";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700 },
  label: { color: "#666", fontSize: 9 },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #333",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 700,
  },
  tableRow: { flexDirection: "row", paddingVertical: 3, borderBottom: "1px solid #eee" },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalLabel: { fontSize: 13, fontWeight: 700, marginRight: 12 },
  totalValue: { fontSize: 13, fontWeight: 700 },
});

export interface InvoicePdfProps {
  invoiceNumber: string;
  issuedAt: Date;
  agencyName: string;
  agencyEmail: string;
  visitDate: Date;
  paymentMethod: string;
  lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  totalAmount: number;
}

export function InvoicePdfDocument({
  invoiceNumber,
  issuedAt,
  agencyName,
  agencyEmail,
  visitDate,
  paymentMethod,
  lines,
  totalAmount,
}: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>RAMAYANA CRM</Text>
            <Text style={styles.label}>Tax invoice / receipt</Text>
          </View>
          <View>
            <Text style={styles.label}>Invoice number</Text>
            <Text>{invoiceNumber}</Text>
            <Text style={styles.label}>Issued</Text>
            <Text>{formatBangkokDate(issuedAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Billed to</Text>
          <Text>{agencyName}</Text>
          <Text>{agencyEmail}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Visit date</Text>
            <Text>{formatBangkokDate(visitDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment method</Text>
            <Text>{paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colName}>Item</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Unit price (THB)</Text>
          <Text style={styles.colTotal}>Total (THB)</Text>
        </View>
        {lines.map((line, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.colName}>{line.name}</Text>
            <Text style={styles.colQty}>{line.quantity}</Text>
            <Text style={styles.colPrice}>{line.unitPrice.toFixed(2)}</Text>
            <Text style={styles.colTotal}>{line.lineTotal.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>THB {totalAmount.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );
}
