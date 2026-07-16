document.addEventListener("DOMContentLoaded", () => {
  const submit = document.getElementById("submitQuote");
  if (!submit) return;

  submit.addEventListener("click", async (e) => {
    e.preventDefault();

    // Fetch individual element value details
    const customerName = document.getElementById("customerName").value;
    const companyName = document.getElementById("companyName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const country = document.getElementById("country").value;
    const contactMethod = document.getElementById("contactMethod").value;
    const comments = document.getElementById("comments").value;

    if (!customerName || !email) {
      alert("Please enter your name and email.");
      return;
    }

    // Pull current dynamic data states out of your local selection storage cache
    const quote = JSON.parse(localStorage.getItem("aduQuote")) || {};
    const quoteIdElement = document.getElementById("quoteNumber");
    const quoteNumber = quoteIdElement ? quoteIdElement.innerText : "N/A";
    const cottageModel = quote.model ? quote.model.name : "None Selected";
    
    let itemsDetails = "";
    if (quote.items && quote.items.length) {
      itemsDetails = quote.items.map(i => `- ${i.name} ($${i.price.toLocaleString()})`).join("\n");
    } else {
      itemsDetails = "- No add-ons selected.";
    }

    const finalComments = `
--- QUOTE INFORMATION ---
Quote Number: ${quoteNumber}
Selected Cottage: ${cottageModel}
Add-ons:
${itemsDetails}

--- CUSTOMER COMMENTS ---
${comments || "None"}
    `;

    try {
      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName,
          companyName,
          email,
          phone,
          whatsapp,
          country,
          contactMethod,
          comments: finalComments,
          // Change this line inside your js/email.js file request block payload:
pdfBase64: await generateInvoicePDFBase64("invoiceSummaryElementIdTag") 

        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert("Thank you!\n\nYour quotation has been submitted successfully.");
      } else {
        alert("Unable to send quotation: " + (result.error || "Server issue"));
      }
    } catch (e) {
      console.error(e);
      alert("Communication error. The server could not be reached.");
    }
  });
});
