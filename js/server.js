const express=require("express");
const cors=require("cors");
const bodyParser=require("body-parser");
const nodemailer=require("nodemailer");
const PDFDocument=require("pdfkit");
const fs=require("fs");
const path=require("path");

const app=express();

app.use(cors());

app.use(bodyParser.json());

const transporter=nodemailer.createTransport({

service:"gmail",

auth:{

user:"YOUR_GMAIL@gmail.com",

pass:"YOUR_APP_PASSWORD"

}

});

app.post("/api/send-quote",(req,res)=>{

const {customer,quote}=req.body;

const pdfPath=path.join(__dirname,"quote.pdf");

const doc=new PDFDocument();

doc.pipe(fs.createWriteStream(pdfPath));

doc.fontSize(24).text("ADU Build Cottage");

doc.moveDown();

doc.fontSize(18).text("Quotation");

doc.moveDown();

doc.fontSize(12);

doc.text("Customer: "+customer.name);

doc.text("Company: "+customer.company);

doc.text("Email: "+customer.email);

doc.text("Phone: "+customer.phone);

doc.text("WhatsApp: "+customer.whatsapp);

doc.text("Country: "+customer.country);

doc.text("Preferred Contact: "+customer.contactMethod);

doc.moveDown();
if(quote.model){

doc.fontSize(16).text("Selected Cottage");

doc.fontSize(12);

doc.text(

quote.model.name+

"   $"+

quote.model.price.toLocaleString()

);

doc.moveDown();

}

doc.fontSize(16).text("Selected Add-ons");

doc.fontSize(12);

if(quote.items && quote.items.length){

quote.items.forEach(item=>{

doc.text(

item.name+

"   $"+

item.price.toLocaleString()

);

});

}else{

doc.text("No add-ons selected.");

}

doc.moveDown();

doc.fontSize(18);

doc.text("Grand Total: "+quote.total);

doc.end();

doc.on("finish",()=>{

transporter.sendMail({

from:"YOUR_GMAIL@gmail.com",

to:"cdzrzr02@gmail.com",

subject:"New Cottage Quote Request",

text:"Customer quotation attached.",

attachments:[

{

filename:"Quotation.pdf",

path:pdfPath

}

]

},(err,info)=>{

if(err){

console.log(err);

return res.status(500).json({

success:false

});

}

res.json({

success:true,

message:"Quote sent successfully."

});

});

});

});

const PORT=3000;

app.listen(PORT,()=>{

console.log(

"ADU Build Cottage Server Running"

);

console.log(

"http://localhost:"+PORT

);

});
