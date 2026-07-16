// ===============================
// ADU Build Cottage
// ===============================

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

buildProducts();

setupModelSelection();

loadQuote();

});

// ===============================
// Build Products
// ===============================

function buildProducts(){

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

selectedModel={

name:this.dataset.name,

price:Number(this.value)

};

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

selectedItems.push(item);

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

selectedModelText.innerHTML=`

<strong>${selectedModel.name}</strong><br>

$${selectedModel.price.toLocaleString()}

`;

}else{

selectedModelText.innerHTML="None Selected";

}

if(selectedItems.length===0){

selectedItemsDiv.innerHTML=`

<p class="text-muted">

No add-ons selected.

</p>

`;

}else{

let html="";

selectedItems.forEach(item=>{

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

selectedItemsDiv.innerHTML=html;

}

grandTotal.innerHTML="$"+total.toLocaleString();

saveQuote();

}

// ===============================
// Save / Load Quote
// ===============================

function saveQuote(){

localStorage.setItem(

"aduQuote",

JSON.stringify({

model:selectedModel,

items:selectedItems,

total:grandTotal.innerText

})

);

}

function loadQuote(){

const saved=localStorage.getItem("aduQuote");

if(!saved) return;

const quote=JSON.parse(saved);

selectedModel=quote.model;

selectedItems=quote.items||[];

document.querySelectorAll(".model-option").forEach(radio=>{

if(selectedModel && radio.dataset.name===selectedModel.name){

radio.checked=true;

}

});

document.querySelectorAll(".addon").forEach(box=>{

box.checked=selectedItems.some(

i=>i.name===box.dataset.name

);

});

updateQuote();

}