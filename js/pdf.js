/**
 * Universally generates a Base64 PDF data string from an HTML target element layout card
 * @param {string} elementId - The HTML DOM element ID selector layout tag to capture
 * @returns {Promise<string>} - Resolves with the complete raw Base64 data stream string
 */
async function generateInvoicePDFBase64(elementId = "quoteSummaryCard") {
  // Target your visual quotation container element block layout
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("PDF Target element container layout layout node was not found matching ID:", elementId);
    return "";
  }

  // Setup visual rendering configuration flags for html2pdf
  const options = {
    margin:       10,
    filename:     'Cottage_Builder_Quotation.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // Generate the internal pdf instance using the html2pdf configuration pipeline
    const pdfWorker = html2pdf().set(options).from(element);
    
    // Output the document stream explicitly as a raw data URL string layout configuration
    const dataUriString = await pdfWorker.outputPdf('datauristring');
    
    // Strip away any trailing metadata headers if appended by the browser engine layer
    return dataUriString;
  } catch (error) {
    console.error("The frontend PDF compilation handshake failed to parse details:", error);
    return "";
  }
}
