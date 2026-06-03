import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export class DocumentGenerator {
  /**
   * Generates a PDF from a given HTML element ID
   */
  static async exportToPDF(elementId: string, filename: string = 'export.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  /**
   * Generates an Excel file from an array of objects
   */
  static exportToExcel(data: any[], filename: string = 'export.xlsx', sheetName: string = 'Data') {
    if (!data || data.length === 0) {
      console.warn('No data to export to Excel');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
  }

  /**
   * Generates an SVG file from a given HTML element ID (usually an SVG element like a Recharts chart)
   */
  static exportToSVG(elementId: string, filename: string = 'export.svg') {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }

    try {
      // Find the first SVG element inside the container, or use the container if it is an SVG
      const svgElement = element.tagName.toLowerCase() === 'svg' ? element : element.querySelector('svg');
      
      if (!svgElement) {
         console.error('No SVG element found inside the provided ID');
         return;
      }

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      // Add name spaces
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      // Add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      // Convert svg source to URI data scheme.
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

      // Create a link element and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error generating SVG:', error);
    }
  }
}
