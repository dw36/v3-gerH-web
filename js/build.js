// ==========================================
// ADU Build Cottage - Complete System Engine
// ==========================================
let catalog = {};
let selectedModel = null;
let selectedItems = [];

// DOM Elements
const productArea = document.getElementById("productArea");
const selectedModelText = document.getElementById("selectedModel");
const selectedItemsDiv = document.getElementById("selectedItems");
const grandTotal = document.getElementById("grandTotal");

// ===============================
// Load Catalog Configuration
// ===============================
fetch("data/catalog.json")
  .then(res => {
    if (!res.ok) throw new Error("Catalog fetch failed");
    return res.json();
  })
  .then(data => {
    catalog = data;
    
    // Format numbers to include thousands separators safely
    const format = (num) => Number(num || 0).toLocaleString();
    
    // Dynamically update model card prices on the page right away matching input node ID trees
    if (catalog.models) {
      catalog.models.forEach(model => {
        const labelEl = document.getElementById(`label-${model.id}br`);
        const footerEl = document.getElementById(`footer-${model.id}br`);
        if (labelEl) labelEl.textContent = format(model.price);
        if (footerEl) footerEl.textContent = format(model.price);
      });
    }

    // Check browser cache for saved configuration states
    const saved = localStorage.getItem("aduQuote");
    if (saved) {
      const quote = JSON.parse(saved);
      selectedModel = quote.model;
      selectedItems = quote.items || [];
    } else {
      // Fallback to whichever radio card is marked as active in HTML layout
      const defaultRadio = document.querySelector(".model-option:checked");
      if (defaultRadio) {
        const modelId = defaultRadio.dataset.id;
        const match = catalog.models.find(m => String(m.id) === String(modelId));
        if (match) {
          selectedModel = { id: match.id, name: match.name, price: match.price };
          if (match.includes) selectedItems = [...match.includes];
        }
      }
    }

    // Initialize view elements on app start cleanly
    buildProducts();
    setupModelSelection();
    setupAddonsListener(); // Bind events via parent delegation structure safely
    loadQuoteVisuals(); 
  })
  .catch(err => console.error("Error setting up application pipeline:", err));

// ===============================
// Build and Render Product List
// ===============================
function buildProducts(){
  if(!productArea || !catalog.categories) return;
  
  let totalHtml = "";
  catalog.categories.forEach(category => {
    let html = `
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>${category.title}</h3>
        </div>
        <div class="row">
    `;
    
    category.items.forEach(item => {
      const isChecked = selectedItems.some(i => i.name === item.name);
      html += `
      <div class="col-md-6 col-xl-4 mb-4 product-card">
        <div class="card h-100">
          <img src="images/products/${category.folder}/${item.image}" class="card-img-top" alt="${item.name}">
          <div class="card-body d-flex flex-column">
            <h5>${item.name}</h5>
            <p class="text-success fw-bold">$${item.price.toLocaleString()}</p>
            <div class="form-check mt-auto">
              <input class="form-check-input addon" type="checkbox" data-name="${item.name}" data-price="${item.price}" ${isChecked ? "checked" : ""}>
              <label class="form-check-label">Add to Cottage</label>
            </div>
          </div>
        </div>
      </div>
      `;
    });
    
    html += `</div></div></div>`;
    totalHtml += html;
  });
  
  productArea.innerHTML = totalHtml;
}

// ===============================
// Model Option Event Handlers
// ===============================
function setupModelSelection(){
  document.querySelectorAll(".model-option").forEach(radio => {
    radio.addEventListener("change", function() {
      const modelId = this.dataset.id;
      const match = catalog.models.find(m => String(m.id) === String(modelId));
      
      if (match) {
        selectedModel = { id: match.id, name: match.name, price: match.price };
        selectedItems = match.includes ? [...match.includes] : [];
      }
      buildProducts(); 
      updateQuote();
    });
  });
}

// ===========================================
// Safe Checkbox Event Listener Delegation
// ===========================================
function setupAddonsListener(){
  if (!productArea) return;
  
  productArea.addEventListener("change", function(event) {
    if (event.target.classList.contains("addon")) {
      const box = event.target;
      const item = {
        name: box.dataset.name,
        price: Number(box.dataset.price)
      };
      
      if (box.checked) {
        if (!selectedItems.some(i => i.name === item.name)) {
          selectedItems.push(item);
        }
      } else {
        selectedItems = selectedItems.filter(i => i.name !== item.name);
      }
      updateQuote();
    }
  });
}

// ===============================
// Dynamic Search Box Parsing
// ===============================
const searchBox = document.getElementById("searchBox");
if (searchBox) {
  searchBox.addEventListener("keyup", function() {
    const keyword = this.value.toLowerCase();
    document.querySelectorAll(".product-card").forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(keyword) ? "" : "none";
    });
  });
}

// ===============================
// Calculate Totals and Render DOM
// ===============================
function updateQuote(){
  let total = 0; 
  if (selectedModel) {
    total += selectedModel.price;
    if (selectedModelText) {
      selectedModelText.innerHTML = `
        <strong>${selectedModel.name}</strong><br>
        $${selectedModel.price.toLocaleString()}
      `;
    }
  } else {
    if (selectedModelText) selectedModelText.innerHTML = "None Selected";
  }

  if (selectedItems.length === 0) {
    if (selectedItemsDiv) {
      selectedItemsDiv.innerHTML = `<p class="text-muted">No extra add-ons selected.</p>`;
    }
  } else {
    let html = "";
    selectedItems.forEach(item => {
      total += item.price; 
      html += `
      <div class="d-flex justify-content-between border-bottom py-2">
        <span>${item.name}</span>
        <strong>$${item.price.toLocaleString()}</strong>
      </div>
      `;
    });
    if (selectedItemsDiv) selectedItemsDiv.innerHTML = html;
  }
  
  if (grandTotal) grandTotal.innerHTML = "$" + total.toLocaleString();
  saveQuote();
}

// ===============================
// Browser Cache Records Storage
// ===============================
function saveQuote(){
  if (!grandTotal) return;
  localStorage.setItem(
    "aduQuote",
    JSON.stringify({
      model: selectedModel,
      items: selectedItems,
      total: grandTotal.innerText
    })
  );
}

function loadQuoteVisuals(){
  document.querySelectorAll(".model-option").forEach(radio => {
    if (selectedModel && String(radio.dataset.id) === String(selectedModel.id)) {
      radio.checked = true;
    }
  });
  updateQuote();
}
