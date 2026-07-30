const http = require("http");

http
  .get("http://localhost:8082/", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
    });
  })
  .on("error", (err) => {
    console.error("Request failed:", err.message);
  });
