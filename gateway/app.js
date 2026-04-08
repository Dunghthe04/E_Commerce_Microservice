const express= require("express")
const cors=require("cors")
// Bỏ qua lỗi SSL self-signed trong môi trường dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const bodyParser=require("body-parser")
const passport=require("passport")
const {createProxyMiddleware}=require("http-proxy-middleware");
const config=require("./configs")
const apiGwRoute=require("./routes/apiGw")

const app =express();

//cho phép fe gọi api
app.use(cors());
//đọc json từ request limit 50 để gửi file lớn, ảnh
app.use(express.json({limit: "50mb"}))
app.use(bodyParser.json())
//khởi động passport
app.use(passport.initialize())

// Tuỳ chọn: proxy static /lib như MMS
app.use(
  "/lib",
  createProxyMiddleware({
    target: config.CDN_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/lib": "/lib" },
  })
);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));
// Cổng API chính
app.use("/api", apiGwRoute);
app.listen(config.SERVER_PORT, () => {
  console.log(`Gateway chạy ở cổng ${config.SERVER_PORT}`);
});