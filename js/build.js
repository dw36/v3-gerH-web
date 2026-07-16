// ==========================================
// ADU Build Cottage
// ==========================================
let catalog = {};
let selectedModel = null;
let selectedItems = [];

// Elements
const productArea = document.getElementById("productArea");
const selectedModelText = document.getElementById("selectedModel");
const selectedItemsDiv = document.getElementById("selectedItems");
const grandTotal = document.getElementById("grandTotal");

// ===============================
// Load Catalog
// ===============================
fetch("data/catalog.json")
.then(res=>res.json())
.then(data=>{
  catalog=data;
  
  // INITIAL RUN STATE SETUP: Check if a quote is already cached in localStorage first
  const saved = localStorage.getItem("aduQuote");
  if (saved) {
    const quote = JSON.parse(saved);
    selectedModel = quote.model;
    selectedItems = quote.items || [];
  } else {
    // If NO saved quote, find the radio button that is pre-checked on the HTML page
    const defaultRadio = document.querySelector(".model-option:checked");
    if (defaultRadio) {
      const modelName = defaultRadio.dataset.name;
      selectedModel = {
        name: modelName,
        price: Number(defaultRadio.value)
      };
      // Pull down the preset components from catalog arrays straight away
      const matchingModel = catalog.models.find(m => m.name === modelName);
      if (matchingModel && matchingModel.includes) {
        selectedItems = [...matchingModel.includes];
      }
    }
  }

  // Render components and initialize listeners safely
  buildProducts();
  setupModelSelection();
  loadQuoteVisuals(); // Update form inputs to highlight correct elements
});

// ===============================
// Build Products
// ===============================
function buildProducts(){
  if(!productArea) return;
  productArea.innerHTML="";
  catalog.categories.forEach(category=>{
    let html=`
    <div class="card shadow-sm mb-4">
    <div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-3">
    <h3>${category.title}</h3>
    </div>
    <div class="row">
    `;
    category.items.forEach(item=>{
      // Sync checkbox state dynamically using name comparisons
      const isChecked = selectedItems.some(i => i.name === item.name);

      html+=`
      <div class="col-md-6 col-xl-4 mb-4 product-card">
      <div class="card h-100">
      <img
      src="images/products/${category.folder}/${item.image}"
      class="card-img-top"
      alt="${item.name}">
      <div class="card-body d-flex flex-column">
      <h5>${item.name}</h5>
      <p class="text-success fw-bold">
      $${item.price.toLocaleString()}
      </p>
      <div class="form-check mt-auto">
      <input
      class="form-check-input addon"
      type="checkbox"
      data-name="${item.name}"
      data-price="${item.price}"
      ${isChecked ? "checked" : ""}
      >
      <label class="form-check-label">
      Add to Cottage
      </label>
      </div>
      </div>
      </div>
      </div>
      `;
    });
    html+=`
    </div>
    </div>
    </div>
    `;
    productArea.innerHTML+=html;
  });
  setupAddons();
}

// ===============================
// Model Selection
// ===============================
function setupModelSelection(){
  document.querySelectorAll(".model-option").forEach(radio=>{
    radio.addEventListener("change",function(){
      const modelName = this.dataset.name;
      selectedModel={
        name:modelName,
        price:Number(this.value)
      };

      // Reset initial tracking configuration states
      selectedItems = [];

      // Extract template bundles array elements from static catalog lookup files
      const matchingModel = catalog.models.find(m => m.name === modelName);
      if (matchingModel && matchingModel.includes) {
        selectedItems = [...matchingModel.includes];
      }

      buildProducts(); // Forces active configurations to highlight checkbox visuals
      updateQuote();
    });
  });
}

// ===============================
// Add-on Selection
// ===============================
function setupAddons(){
  document.querySelectorAll(".addon").forEach(box=>{
    box.addEventListener("change",function(){
      const item={
        name:this.dataset.name,
        price:Number(this.dataset.price)
      };
      if(this.checked){
        if(!selectedItems.some(i => i.name === item.name)) {
          selectedItems.push(item);
        }
      }else{
        selectedItems=selectedItems.filter(i=>i.name!==item.name);
      }
      updateQuote();
    });
  });
}

// ===============================
// Search
// ===============================
const searchBox=document.getElementById("searchBox");
if(searchBox){
  searchBox.addEventListener("keyup",function(){
    const keyword=this.value.toLowerCase();
    document.querySelectorAll(".product-card").forEach(card=>{
      const text=card.innerText.toLowerCase();
      card.style.display=text.includes(keyword)?"":"none";
    });
  });
}

// ===============================
// Update Quote
// ===============================
function updateQuote(){
  let total=0;
  if(selectedModel){
    total+=selectedModel.price;
    if(selectedModelText) {
      selectedModelText.innerHTML=`
      <strong>${selectedModel.name}</strong><br>
      $${selectedModel.price.toLocaleString()}
      `;
    }
  }else{
    if(selectedModelText) selectedModelText.innerHTML="None Selected";
  }

  // Filter package core presets to only output extra items in sidebar layout tables
  let baselineItemNames = [];
  if (selectedModel) {
    const matchingModel = catalog.models.find(m => m.name === selectedModel.name);
    if (matchingModel && matchingModel.includes) {
      baselineItemNames = matchingModel.includes.map(i => i.name);
    }
  }

  const customAddonsOnly = selectedItems.filter(i => !baselineItemNames.includes(i.name));

  if(customAddonsOnly.length===0){
    if(selectedItemsDiv) {
      selectedItemsDiv.innerHTML=`
      <p class="text-muted">
      No extra add-ons selected.
      </p>
      `;
    }
  }else{
    let html="";
    customAddonsOnly.forEach(item=>{
      total+=item.price;
      html+=`
      <div class="d-flex justify-content-between border-bottom py-2">
      <span>${item.name}</span>
      <strong>
      $${item.price.toLocaleString()}
      </strong>
      </div>
      `;
    });
    if(selectedItemsDiv) selectedItemsDiv.innerHTML=html;
  }
  if(grandTotal) grandTotal.innerHTML="$"+total.toLocaleString();
  saveQuote();
}

// ===============================
// Save / Load Quote
// ===============================
function saveQuote(){
  if(!grandTotal) return;
  localStorage.setItem(
    "aduQuote",
    JSON.stringify({
      model:selectedModel,
      items:selectedItems,
      total:grandTotal.innerText
    })
  );
}

function loadQuoteVisuals(){
  document.querySelectorAll(".model-option").forEach(radio=>{
    if(selectedModel && radio.dataset.name===selectedModel.name){
      radio.checked = true;
    }
  });
  
  document.querySelectorAll(".addon").forEach(box=>{
    box.checked = selectedItems.some(
      i=>i.name===box.dataset.name
    );
  });
  updateQuote();
}
