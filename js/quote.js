// ============================================================
// Cottage Rendering Image Database Lookup Maps
// ============================================================
const cottageRenderings = {
  "1": { // Map by numerical IDs to match your catalog structures smoothly
    title: "1 BR 300sqft Configurations",
    exterior: "images/canvas-exterior.jpg",
    interior: "images/canvas-skeleton.jpg",
    layout: "images/canvas-blueprint.jpg"
  },
  "2": {
    title: "2 BR 600sqft Configurations",
    exterior: "images/equipped-exterior.jpg",
    interior: "images/equipped-skeleton.jpg",
    layout: "images/equipped-blueprint.jpg"
  },
  "3": {
    title: "3 BR 900sqft Configurations",
    exterior: "images/turnkey-exterior.jpg",
    interior: "images/turnkey-skeleton.jpg",
    layout: "images/turnkey-blueprint.jpg"
  }
};

// ===============================
// Load Quote
// ===============================
const modelText = document.getElementById("selectedModel");
const itemsDiv = document.getElementById("selectedItems");
const totalText = document.getElementById("grandTotal");
const quoteNumber = document.getElementById("quoteNumber");

const renderingTitle = document.getElementById("renderingTitle");
const viewExterior = document.getElementById("viewExterior");
const viewInterior = document.getElementById("viewInterior");
const viewLayout = document.getElementById("viewLayout");

const quote = JSON.parse(localStorage.getItem("aduQuote"));
const today = new Date();
const number = today.getFullYear().toString() + String(today.getMonth() + 1).padStart(2, "0") + String(today.getDate()).padStart(2, "0") + "-" + Math.floor(Math.random() * 9000 + 1000);

if (quoteNumber) {
  quoteNumber.innerText = "ADU-" + number;
}

if (quote) {
  if (quote.model && modelText) {
    modelText.innerHTML = `
      <strong>${quote.model.name}</strong><br>
      $${Number(quote.model.price || 0).toLocaleString()}
    `;
    
    // DYNAMIC RENDERING UPDATER
    const assets = cottageRenderings[String(quote.model.id)];
    if (assets) {
      if (renderingTitle) renderingTitle.innerText = assets.title;
      if (viewExterior) viewExterior.src = assets.exterior;
      if (viewInterior) viewInterior.src = assets.interior;
      if (viewLayout) viewLayout.src = assets.layout;
    }
  }
  
  let total = 0;
  if (quote.model) {
    total += Number(quote.model.price || 0);
  }
  
  let html = "";
  if (quote.items && quote.items.length) {
    quote.items.forEach(item => {
      total += Number(item.price || 0);
      html += `
      <div class="d-flex justify-content-between border-bottom py-2">
        <span>${item.name}</span>
        <strong>$${Number(item.price || 0).toLocaleString()}</strong>
      </div>
      `;
    });
  } else {
    html = `<p class="text-muted">No add-ons selected.</p>`;
  }
  
  if (itemsDiv) itemsDiv.innerHTML = html;
  if (totalText) totalText.innerText = "$" + total.toLocaleString();
}

// ===============================
// Send Quote Request via WhatsApp
// ===============================
const submitBtn = document.getElementById('submitQuote');
if (submitBtn) {
  submitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const fullName = (document.getElementById('customerName')?.value || '').trim();
    const company = (document.getElementById('companyName')?.value || '').trim();
    const email = (document.getElementById('email')?.value || '').trim();
    const phone = document.getElementById('phone')?.value || '';
    const whatsappField = (document.getElementById('whatsapp')?.value || '').trim();
    const country = (document.getElementById('country')?.value || '').trim();
    const contactMethod = document.getElementById('contactMethod')?.value || 'Not Specified';
    const comments = (document.getElementById('comments')?.value || '').trim();
    
    const quoteNo = document.getElementById('quoteNumber')?.innerText || 'N/A';
    const finalTotal = document.getElementById('grandTotal')?.innerText || '$0';
    
    if (!fullName || !email) {
      alert('Please fill out your Full Name and Email address first.');
      return;
    }
    
    const modelElement = document.getElementById("selectedModel");
    const modelInfo = modelElement ? modelElement.innerText.replace(/\n/g, ' ') : 'None Selected';
    
    const itemsElement = document.getElementById("selectedItems");
    let itemsInfo = '';
    if (itemsElement) {
      itemsInfo = Array.from(itemsElement.querySelectorAll('.d-flex'))
        .map(el => `• ${el.innerText.replace(/\n/g, ': ')}`)
        .join('\n');
    }
    if (!itemsInfo) itemsInfo = 'No add-ons selected.';
    
    const textMessage = `
*🏡 NEW COTTAGE QUOTE REQUEST*
----------------------------------------
*Quote No:* ${quoteNo}
*Total Amount:* ${finalTotal}
*👤 CUSTOMER PROFILE:*
• *Name:* ${fullName}
• *Company:* ${company || 'N/A'}
• *Email:* ${email}
• *Phone:* ${phone || 'N/A'}
• *WhatsApp:* ${whatsappField || 'N/A'}
• *Country:* ${country || 'N/A'}
• *Preferred Contact:* ${contactMethod}
*🏠 CONFIGURATION:*
• *Selected Model:* ${modelInfo}
*➕ SELECTED ADD-ONS:*
${itemsInfo}
*💬 COMMENTS:*
"${comments || 'None'}"
----------------------------------------
    `.trim();

    const baseDomain = "https://whatsapp.com";
    const urlParams = "?phone=85258071002&text=" + encodeURIComponent(textMessage);
    
    window.open(baseDomain + urlParams, '_blank');
    
    const storageFields = ["customerName", "companyName", "email", "phone", "whatsapp", "country", "contactMethod", "comments"];
    storageFields.forEach(id => localStorage.removeItem(id));
    localStorage.removeItem("aduQuote");
    
    window.location.reload();
  });
}
