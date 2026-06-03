import jsPDF from 'jspdf';
import { SalesOrder } from '@services/salesService';

export const generateInvoicePDF = (order: SalesOrder, customer: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(24, 144, 255);
  doc.text("SRI GANGA FOODS", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Premium Sweets & Snacks", 105, 26, { align: "center" });
  doc.text("GST: 33AAACCS7198R1Z5", 105, 32, { align: "center" });
  
  // Line
  doc.setDrawColor(200);
  doc.line(20, 38, 190, 38);
  
  // Invoice Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`INVOICE / RECEIPT`, 20, 50);
  doc.setFontSize(10);
  doc.text(`Order Number: ${order.order_number}`, 20, 58);
  doc.text(`Date: ${new Date(order.order_date).toLocaleDateString()}`, 20, 64);
  doc.text(`Status: ${order.status.toUpperCase()}`, 20, 70);
  
  // Customer Details
  doc.text(`Billed To:`, 130, 50);
  doc.setFontSize(11);
  doc.text(`${customer.name}`, 130, 58);
  doc.setFontSize(10);
  doc.text(`${customer.phone || 'N/A'}`, 130, 64);
  const addressLines = doc.splitTextToSize(customer.shipping_address || customer.billing_address || 'No Address', 60);
  doc.text(addressLines, 130, 70);
  
  // Line
  doc.line(20, 85, 190, 85);
  
  // Table Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("No.", 20, 95);
  doc.text("Item Description", 40, 95);
  doc.text("Total", 170, 95);
  
  doc.line(20, 100, 190, 100);
  
  doc.setTextColor(0);
  doc.text("1", 20, 110);
  doc.text("Food Order (Various Items)", 40, 110);
  doc.text(`Rs. ${Number(order.total_amount).toLocaleString()}`, 170, 110);
  
  doc.line(20, 120, 190, 120);
  
  // Total
  doc.setFontSize(14);
  doc.text("Grand Total:", 120, 135);
  doc.text(`Rs. ${Number(order.total_amount).toLocaleString()}`, 170, 135);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for choosing Sri Ganga Foods!", 105, 280, { align: "center" });
  
  doc.save(`Invoice_${order.order_number}.pdf`);
};
