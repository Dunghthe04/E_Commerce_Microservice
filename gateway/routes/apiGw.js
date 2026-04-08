//route của api gateway
//nó gọi passport -> check xem token hợp lệ k-> nếu hợp lệ gọi aoiGw xử lý và forward
const express=require("express");
const passport=require("passport")
require("../middlewares/passport");
const {forwardRequest} =require("../controllers/apiGw")

const router=express.Router();

// Express 5 khong ho tro pattern "/*" (dễ sinh lỗi path-to-regexp).
// Dùng router.use(...) không truyền path để bắt mọi đường dẫn
// (vì router này đang được mount dưới app.use("/api", apiGwRoute)).
router.use((req, res, next) => {
    // Cho phép gọi login mà không cần token
    if (req.originalUrl.toUpperCase().includes("/IDENTITY/LOGIN")) {
        return next();
    }
    // Các endpoint khác phải qua Passport JWT
    // Passport sẽ lấy token từ header Authorization
    // → tách token thành HEADER + PAYLOAD + SIGNATURE
    // → tự tạo signature mới từ HEADER + PAYLOAD + JWT_SECRET
    // → so sánh signature mới với signature trong token
    // → nếu giống → hợp lệ, gán payload vào req.user
    // → nếu khác → 401 Unauthorized
    passport.authenticate("jwt", { session: false })(req, res, next);
}, forwardRequest);
module.exports=router