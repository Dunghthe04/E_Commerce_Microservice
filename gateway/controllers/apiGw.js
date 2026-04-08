//Trung gian gateway, nhận request từ client -
// ==>quyết định service -> set path cần forward và gọi file forward để bắn tới service
const config = require("../configs");
const forwardApi = require("../handles/forwardAPI")
const jwt = require("jsonwebtoken");
const axios = require("axios");

//hàm xử lý nhận request client, xử lý rồi gọi đến forward để forward tương ứng
async function forwardRequest(req, res) {
    try {
        //lấy ra oath gốc /api/CATALOG/products/1
        const parts = req.originalUrl.split("/");
        //lấy ra key service
        const serviceKey = (parts[2] || "").toUpperCase();
        
        //lấy ra url của service tương ứng
        const serviceUrl = config[serviceKey]

        //nếu k có service
        if (!serviceUrl) {
            return res.status(404).json({
                message: `Không tìm thấy service ${serviceKey}`
            })
        }

        //lấy ra phần path đăng sau service
        req.forwardPath = `/${parts.slice(3).join("/")}`;

        // INTERCEPT LOGIN: Nếu là login tới IdentityService, chúng ta sẽ tự cấp token sau khi service OK
        if (serviceKey === "IDENTITY" && req.forwardPath.toUpperCase() === "/LOGIN" && req.method === "POST") {
            try {
                const targetUrl = `${serviceUrl}${req.forwardPath}`;
                //Gọi đến backend check xem đúng user k, 
                const response = await axios.post(targetUrl, req.body);
                //nếu đúng
                if (response.data && response.data.isAuthenticated) {
                    // 3️⃣ Gateway tạo JWT
                    // Token gồm: HEADER + PAYLOAD + SIGNATURE
                    // Signature được tạo bởi: payload + JWT_SECRET
                    const token = jwt.sign(
                        //body
                        { sub: response.data.user, username: response.data.user },//BODY/PAYLOAD
                        config.JWT_SECRET,//MÃ JWT_SECRET
                        { expiresIn: "10d" }//THỜI GIAN
                    );
                    return res.json({
                        message: "Đăng nhập thành công (Gateway generated token)",
                        token: token,
                        user: response.data.user
                    });
                }
                return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
            } catch (err) {
                console.error("Login Interception Error:", err.message, err.stack);
                return res.status(err.response?.status || 500).json({ 
                    message: "Lỗi khi gọi IdentityService login",
                    error: err.message 
                });
            }
        }

        //điều hướng theo pthuc bình thường
        if (req.method === "GET") return forwardApi.forwardGet(serviceUrl, req, res);
        if (req.method === "POST") return forwardApi.forwardPost(serviceUrl, req, res);

        return res.status(405).json({
            message: "Phương thức không được hỗ trợ"
        })
    } catch (error) {
        console.error("Gateway error:", error);
        return res.status(500).json({
            message: "Lỗi hệ thống nội bộ xử lý gateway"
        })
    }

}
module.exports={forwardRequest};