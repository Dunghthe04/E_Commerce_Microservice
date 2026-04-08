const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const passport = require("passport")
const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("./configs")
const apiGwRoute = require("./routes/apiGw")

const app = express();

// --- LOGGING & CORS MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`>>> [GATEWAY LOG] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    console.log(`>>> [GATEWAY LOG] Handled Preflight OPTIONS for ${req.url}`);
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "50mb" }))
app.use(bodyParser.json())
app.use(passport.initialize())

app.use(
  "/lib",
  createProxyMiddleware({
    target: config.CDN_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/lib": "/lib" },
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", apiGwRoute);

const PORT = 8081; // Đổi sang 8081 để test
app.listen(PORT, () => {
  console.log(`Gateway đang chạy ở cổng ${PORT} (Đã thêm Log chẩn đoán)`);
});