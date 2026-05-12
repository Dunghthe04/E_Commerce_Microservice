// ================= API GATEWAY ROUTE =================
//
// Mục tiêu: nhận request từ client, gọi passport xử lý xác thực JWT, rồi gọi controller để forward request sang service tương ứng.
//
// Flow:
// Client request
// → API Gateway route (apiGw.js) nhận request
// → Passport middleware (passport.js) xác thực JWT
// → Nếu token hợp lệ → req.user = payload, gọi forwardRequest để chuyển sang backend C#
// → Nếu token không hợp lệ → trả về 401 Unauthorized
//
// Lưu ý:
// - Endpoint /api/IDENTITY/LOGIN được phép gọi mà không cần token để đăng nhập và lấy token mới.
// - Các endpoint khác đều yêu cầu token hợp lệ trong header Authorization: Bearer <token>.

const express = require("express");
const passport = require("passport");

//import file cấu hình passport jwt strategy
require("../middlewares/passport");

//import controller để forward request sang service tương ứng
const { forwardRequest } = require("../controllers/apiGw")
const router = express.Router();

// Express 5 không hỗ trợ pattern "/*" như Express 4
// nên dùng router.use() để bắt tất cả request.
//
// Vì router này được mount:
// app.use("/api", apiGwRoute)
//
// nên mọi request /api/* sẽ chạy qua đây
router.use((req, res, next) => {
    //cho phép endpoint login mà không cần token
    //ví dụ
    //POST /api/IDENTITY/LOGIN -> cho phép gọi mà không cần token
    if (req.originalUrl.toUpperCase().includes("/IDENTITY/LOGIN")) {
        return next();
    }

    //các endpoint khác phải qua passport xác thực JWT
    //Nếu chỉ so sánh token -> có thể bị giả mạo, nên passport tạo signature để so sánh, nếu giống nhau mới hợp lệ
    //1. lấy token từ header Authorization: Bearer <token>
    //2. passport tự lấy ra token, tách thành HEADER + PAYLOAD + SIGNATURE(1 phần của token)
    //3. passport tự tạo ra signature mới(2) = HEADER + PAYLOAD + JWT_SECRET
    //4. so sánh signature(1) trong token với signature(2) mới tạo
    //5. nếu giống nhau → token hợp lệ → gán payload vào req.user → gọi next() để tiếp tục xử lý request
    //6. nếu khác nhau → token không hợp lệ → trả về 401 Unauthorized
    passport.authenticate("jwt", { session: false })(req, res, next);
},
    forwardRequest);

module.exports = router;