const basePrice = 16900;

const shipping = 12800;

document.getElementById("summary").innerHTML = `
<h5>Base Cottage</h5>

<p>$${basePrice.toLocaleString()}</p>

<h5>Shipping</h5>

<p>$${shipping.toLocaleString()}</p>

<hr>

<h4>Total</h4>

<h3>$${(basePrice+shipping).toLocaleString()}</h3>
`;