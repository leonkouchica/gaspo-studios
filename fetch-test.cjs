const http = require('http');

http.get('http://localhost:8081/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    if (data.includes("Something went wrong")) {
      console.log("Found error message in HTML!");
      const match = data.match(/<span className="text-red-500 font-mono">(.*?)<\/span>/);
      if (match) console.log("Error details:", match[1]);
      else {
        // extract all text around the error
        const idx = data.indexOf("Something went wrong");
        console.log(data.substring(Math.max(0, idx - 100), idx + 500));
      }
    } else {
      console.log("No error found in HTML. Length:", data.length);
    }
  });
}).on('error', err => {
  console.error("Request failed:", err.message);
});
