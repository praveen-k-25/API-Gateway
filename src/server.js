require("dotenv").config();
const http = require("http");
const https = require("https");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const gatewayRateLImiter = require("./utils/rateLimiter");

const app = express();
const PORT = process.env.PORT || 4000;
app.use(
  cors({
    origin: ["https://api-gateway-aojr.onrender.com", "http://localhost:5173"],
  })
);
app.use(helmet());
app.use((req, res, next) => gatewayRateLImiter(req, res, next));
const proxyServer = (req, res, targetUrl) => {
  const url = new URL(req.url, targetUrl);
  const options = {
    protocol: url.protocol,
    port: url.port,
    hostname: url.hostname,
    path: url.pathname,
    method: req.method,
    headers: {...req.headers, host: url.hostname},
  };
  console.log(options);
  const proxy = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, {end: true}); // alternate of
    /* 
      req.on("data", (chunk)=>{
        proxy.write(chunk);
      })
      req.on("end",()=>{
        proxy.end();
      })
    */
  });

  req.pipe(proxy, {end: true}); // alternate to
  /* 
    proxyRes.on("data", (chunk)=>{
      res.write(chunk);
    })
    proxyRes.on("end",()=>{
      res.end();
    })
  */

  // error handling
  proxy.on("error", (err) => {
    logger.error("Proxy request error:", err);
    if (!res.headersSent) {
      res.writeHead(502, {"Content-Type": "text/plain"});
    }
    res.end("Bad Gateway");
  });

  req.on("error", (err) => {
    console.error("Client request error:", err.message);
  });

  res.on("error", (err) => {
    console.error("Client response error:", err.message);
  });

  // timeout
  proxy.setTimeout(10000, () => {
    proxy.destroy();
    if (!res.headersSent) {
      res.writeHead(504, {"Content-Type": "text/plain"});
    }
    res.end("Gateway Timeout");
  });
};

app.use("/IDENTITY/", (req, res) => {
  proxyServer(req, res, process.env.IDENTITY_SERVICE_URL);
});
app.use("/POST/", (req, res) => {
  proxyServer(req, res, process.env.IDENTITY_SERVICE_URL);
});
app.use("/SEARCH/", (req, res) => {
  proxyServer(req, res, process.env.IDENTITY_SERVICE_URL);
});
app.use("/MEDIA/", (req, res) => {
  proxyServer(req, res, process.env.IDENTITY_SERVICE_URL);
});
app.use("/GEO_LOCATION/", (req, res) => {
  proxyServer(req, res, process.env.GEO_LOCATION_SERVICE_URL);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
