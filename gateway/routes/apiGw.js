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
router.use(passport.authenticate("jwt", { session: false }), forwardRequest);
module.exports=router