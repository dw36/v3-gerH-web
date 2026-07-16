exports.handler = async (event, context) => {
  // Allow browser cross-origin preflight checks (CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ message: "Successful preflight" }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      console.error("Missing configuration error: DISCORD_WEBHOOK_URL is not set.");
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Backend configuration error." }),
      };
    }

    // 1. Setup multi-part FormData payload required for sending files to Discord
    const formData = new FormData();

    // Attach your clean text details as the main text message
    if (data.content) {
      formData.append("content", data.content);
    }

    // 2. Decode the incoming base64 text back into a real binary file attachment
    if (data.pdfBase64) {
      // Isolates pure base64 text payload from frontend array split
      const base64Data = Array.isArray(data.pdfBase64) ? data.pdfBase64[1] : data.pdfBase64;
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      
      // Wrap binary data in an explicit web-compatible file structure
      const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const filename = data.quoteNo ? `${data.quoteNo}.pdf` : 'Cottage_Quote.pdf';
      
      formData.append("files[0]", fileBlob, filename);
    }

    // 3. Dispatch data package directly to private Discord API Endpoint
    const discordResponse = await fetch(discordWebhookUrl, {
      method: "POST",
      body: formData, // Sending FormData automatically strips custom content-type headers to prevent crashes
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      throw new Error(`Discord channel API returned code status: ${discordResponse.status} - ${errorText}`);
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Quote request pushed to Discord successfully with PDF!" }),
    };

  } catch (error) {
    console.error("Discord Hook Integration Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to dispatch channel alert notification.", details: error.message }),
    };
  }
};
