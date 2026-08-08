import path from "path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatBangkokDate } from "@/lib/timezone";
import { COMPANY_INFO } from "@/features/invoices/company-info";

Font.register({
  family: "NotoSansThai",
  src: path.join(process.cwd(), "src/features/invoices/fonts/NotoSansThai-Regular.ttf"),
});

const BLUE = "#1E3A8A";
const LIGHT_BLUE = "#D9E1F2";
const YELLOW = "#FFF176";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansThai", fontSize: 9, color: "#111" },
  headerBand: {
    backgroundColor: BLUE,
    color: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 700, padding: 10 },
  headerContact: { flex: 1, fontSize: 8, textAlign: "center", padding: 10, lineHeight: 1.5 },
  infoRow: { flexDirection: "row", borderBottom: "1px solid #ccc" },
  infoLabel: {
    width: 130,
    backgroundColor: LIGHT_BLUE,
    padding: 5,
    fontWeight: 700,
  },
  infoValue: { flex: 1, padding: 5 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: LIGHT_BLUE, borderBottom: "1px solid #999" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #eee" },
  colDetails: { flex: 3, padding: 5 },
  colPrice: { flex: 1.3, padding: 5, textAlign: "center" },
  colQty: { flex: 1, padding: 5, textAlign: "center" },
  colTotal: { flex: 1.3, padding: 5, textAlign: "center" },
  cellHeader: { fontWeight: 700, textAlign: "center" },
  totalRow: {
    flexDirection: "row",
    backgroundColor: YELLOW,
    borderBottom: "1px solid #999",
  },
  totalLabel: { flex: 5.6, padding: 6, fontWeight: 700 },
  totalValue: { flex: 1.3, padding: 6, fontWeight: 700, textAlign: "center" },
  noteBox: { backgroundColor: "#FCF3D9", padding: 8, fontSize: 7.5, lineHeight: 1.5 },
  paymentRow: { backgroundColor: YELLOW, padding: 6, textAlign: "center", fontWeight: 700 },
  bankHeaderRow: { flexDirection: "row", backgroundColor: LIGHT_BLUE, borderBottom: "1px solid #999" },
  bankRow: { flexDirection: "row", borderBottom: "1px solid #eee" },
  bankCell: { flex: 1, padding: 5, textAlign: "center" },
  footerBand: {
    backgroundColor: BLUE,
    color: "#fff",
    padding: 8,
    fontSize: 8,
    lineHeight: 1.5,
  },
});

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Payment on arrival (Cash)",
  CARD: "Payment on arrival (Card)",
  OTHER: "Other",
};

export interface InvoicePdfProps {
  invoiceNumber: string;
  agencyName: string;
  customerName: string | null;
  visitDate: Date;
  paymentMethod: string;
  lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  totalAmount: number;
}

export function InvoicePdfDocument({
  invoiceNumber,
  agencyName,
  customerName,
  visitDate,
  paymentMethod,
  lines,
  totalAmount,
}: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>{COMPANY_INFO.name}</Text>
          <Text style={styles.headerContact}>
            {COMPANY_INFO.addressLine}
            {"\n"}
            {`Tel: ${COMPANY_INFO.tel}  Email: ${COMPANY_INFO.email}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Travel Agent&apos;s Name</Text>
          <Text style={styles.infoValue}>{agencyName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer&apos;s Name</Text>
          <Text style={styles.infoValue}>{customerName ?? ""}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visit Date</Text>
          <Text style={styles.infoValue}>{formatBangkokDate(visitDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Voucher # / GroupCode</Text>
          <Text style={styles.infoValue}>{invoiceNumber}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDetails, styles.cellHeader, { textAlign: "left" }]}>
              Details
            </Text>
            <Text style={[styles.colPrice, styles.cellHeader]}>Unit price (THB)</Text>
            <Text style={[styles.colQty, styles.cellHeader]}>Qty</Text>
            <Text style={[styles.colTotal, styles.cellHeader]}>THB</Text>
          </View>
          {lines.map((line, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDetails}>{line.name}</Text>
              <Text style={styles.colPrice}>{line.unitPrice.toFixed(0)}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colTotal}>{line.lineTotal.toFixed(0)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total of Payment (THB)</Text>
            <Text style={styles.totalValue}>{totalAmount.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text>
            Note: We cannot provide service to your customer until we get your payment slip. In
            case your customer arrives at the water park before we receive your payment slip
            sent to email {COMPANY_INFO.email} we will ask your customer to contact your office
            directly. สวนน้ำไม่สามารถให้บริการลูกค้าของท่านได้จนกว่าทางสวนน้ำจะได้รับหลักฐานการโอนเงินอย่างสมบูรณ์
            ในกรณีที่ลูกค้าของท่านมาถึง หน้าสวนน้ำ แต่ทางสวนน้ำยังไม่ได้รับใบโอนเงินทางอีเมล์ {COMPANY_INFO.email}{" "}
            สวนน้ำต้องขออภัยอย่างสูงที่ต้องแจ้งให้ลูกค้าของท่าน ติดต่อกลับไปหาท่านโดยตรง{"\n\n"}
            Also please do not forget, for customer&apos;s smooth admission and the necessity for
            us to support each transaction with its booking details the customer/your
            driver/your guide must show your company&apos;s tour voucher with their booking
            details on it (either a printed copy or an e-copy on the screen of their telephone)
            at Ticketing Office and receive wristband(s) to enter the
            park.นอกจากนี้โปรดอย่าลืมสำหรับการตอบรับที่ราบรื่นของลูกค้าสิ่งสำคัญสำหรับเราเพื่อตรวจรายละเอียดการจองของลูกค้า/คนขับรถ/ไกด์ของคุณต้องแสดงเวาเช่อร์/บัตรกำนัลทัวร์ของบริษัทพร้อมกับรายละเอียดการจองตามรายละเอียดดังกล่าวโดยการ
            (ปริ้นหรือแสดงบัตรอิเล็กทรอนิกส์บนหน้าจอโทรศัพท์) ที่สำนักงานจำหน่ายตั๋ว และรับสายรัดข้อมือเพื่อเข้าสวนน้ำ
          </Text>
        </View>

        <View style={styles.paymentRow}>
          <Text>Payment Method: {PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}</Text>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={{ textAlign: "center", fontWeight: 700, fontSize: 8, marginBottom: 2 }}>
            RWP Bank Account Info: *The Amount above is NET amount, not including the bank
            transfer fee.
          </Text>
          <View style={styles.bankHeaderRow}>
            <Text style={[styles.bankCell, styles.cellHeader]}>Account Name</Text>
            <Text style={[styles.bankCell, styles.cellHeader]}>Bank Name</Text>
            <Text style={[styles.bankCell, styles.cellHeader]}>Branch</Text>
            <Text style={[styles.bankCell, styles.cellHeader]}>Account Number</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankCell}>{COMPANY_INFO.bank.accountName}</Text>
            <Text style={styles.bankCell}>{COMPANY_INFO.bank.bankName}</Text>
            <Text style={styles.bankCell}>{COMPANY_INFO.bank.branch}</Text>
            <Text style={styles.bankCell}>{COMPANY_INFO.bank.accountNumber}</Text>
          </View>
          <Text style={{ textAlign: "center", fontSize: 7.5, marginTop: 4 }}>
            *Please kindly send the payment slip to email | กรุณาส่งหลักฐานการโอนเงินไปยังอีเมล์{" "}
            {COMPANY_INFO.email}
          </Text>
        </View>

        <View style={[styles.footerBand, { marginTop: 10 }]}>
          <Text>{COMPANY_INFO.hoursLine1}</Text>
          <Text>{COMPANY_INFO.hoursLine2}</Text>
        </View>
      </Page>
    </Document>
  );
}
