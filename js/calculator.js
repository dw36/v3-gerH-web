// =======================================================
// ADU Build Cottage - Dynamic Invoice Summary Engine
// =======================================================

// Read user choices out of browser cache storage state
const savedQuote = localStorage.getItem("aduQuote");

fetch("data/catalog.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load catalog config.");
    return res.json();
  })
  .then(catalog => {
    // Fallback defaults if no profile is active in cache records
    let basePrice = 16900; 
    let shippingPrice = 12800; 
    let modelName = "1 BR 300sqft";

    if (savedQuote) {
      const quote = JSON.parse(savedQuote);
      if (quote.model && quote.model.id) {
        // Find matching data configuration object inside centralized dataset profile using unified IDs
        const matchedModel = catalog.models.find(m => String(m.id) === String(quote.model.id));
        if (matchedModel) {
          basePrice = matchedModel.price; // Correct mapping selector path matching your catalog file structure
          shippingPrice = matchedModel.shippingPrice;
          modelName = matchedModel.name;
        }
      }
    }

    // Render calculated details directly into display containers layout structure smoothly
    const summaryDiv = document.getElementById("summary");
    if (summaryDiv) {
      summaryDiv.innerHTML = `
        <h5>Base Cottage (${modelName})</h5>
        <p>$${basePrice.toLocaleString()}</p>
        <h5>Shipping</h5>
        <p>$${shippingPrice.toLocaleString()}</p>
        <hr>
        <h4>Total</h4>
        <h3>$${(basePrice + shippingPrice).toLocaleString()}</h3>
      `;
    }
  })
  .catch(err => console.error("Error computing dynamic layout calculation:", err));
