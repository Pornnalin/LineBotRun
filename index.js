const express = require("express");
const https = require("https");
const app = express();

app.use(express.json());

const TOKEN = process.env.LINE_ACCESS_TOKEN;

app.post("/webhook", (req, res) => {
  const event = req.body.events?.[0];

  console.log("📥 Incoming event:", JSON.stringify(event, null, 2));

  if (event?.type === "message" && event.message?.text === "แชร์ location") {
    const replyToken = event.replyToken;

    const replyBody = JSON.stringify({
      replyToken,
      messages: [
        {
          type: "text",
          text: "กรุณาแชร์ตำแหน่งของคุณ",
          quickReply: {
            items: [
              {
                type: "action",
                action: {
                  type: "location",
                  label: "แชร์โลเคชั่น",
                },
              },
            ],
          },
        },
      ],
    });

    const options = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        "Content-Length": Buffer.byteLength(replyBody),
      },
    };

    const reqLine = https.request(options, (resLine) => {
      let data = "";
      resLine.on("data", (chunk) => (data += chunk));
      resLine.on("end", () => console.log("📨 LINE response:", data));
    });

    reqLine.on("error", (err) => console.error("❌ LINE error:", err));
    reqLine.write(replyBody);
    reqLine.end();
  }

  res.status(200).send("OK");
});
console.log("🚀 Server is running...");

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
