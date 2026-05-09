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
// ================= API GATEWAY CONTROLLER =================
//
//File này là bộ điều phối của API Gateway
//
//Nhiệm vụ chính:
//1. Nhận request từ client
//2. Xác định xem request đi đến service nào
//3. Tạo path cần forward
//4. forward request đến service tương ứng
//5. Trả response từ service về cho client
//
//controller được gọi ở router 
//
//Ngoài ra 
//Gateway cần INTERCEPT LOGIN để tự tạo token sau khi login thành công từ IdentityService

// ================= IMPORT =================
//config chứa các URL của các service
const config=require("../configs");
//file chuyển forward request sang service
const forwardApi= require("../handles/forwardAPI");
//Jwt để tạo token khi intercept login
const jwt = require("jsonwebtoken");
//axios để gọi HTTP request sang service tương ứng
const axios = require("axios");
// ================= MAIN GATEWAY CONTROLLER =================
//
// Hàm chính xử lý request từ client
//
// Flow:
//
// Client
//   ↓
// Gateway Route
//   ↓
// Passport JWT
//   ↓
// forwardRequest(), gọi đến forwardApi để forward request sang service tương ứng
//   ↓
// Forward sang service tương ứng

async function forwardRequest(req, res) {
   try{
        // ================= PARSE URL =================
        //
        // Ví dụ URL:
        // /api/CATALOG/products/1
        //
        // split("/") =>
        // ["", "api", "CATALOG", "products", "1"]
        const parts=req.originalUrl.split("/");
        //lấy ra key service
        const serviceKey=parts[2].toUpperCase();
        //lấy ra url của service tương ứng từ config
        //ví dụ serviceKey=CATALOG => serviceUrl=http://localhost:5103
        const serviceUrl=config[serviceKey];
        //nếu k có service tương ứng
        if(!serviceUrl){
            return res.status(404).json({
                message: `Không tìm thấy service ${serviceKey}`
            });
        }

        // ================= TẠO FORWARD PATH =================
        //lấy ra phần path đăng sau service
        //ví dụ /products/1
        // parts.slice(3)
        // =>
        // ["products", "1"]
        //
        // Kết quả:
        // /products/1
        req.forwardPath=`/${parts.slice(3).join("/")}`;

        // ================= INTERCEPT LOGIN =================
        // Nếu request là:
        // POST /api/IDENTITY/login
        //
        // Gateway sẽ:
        //
        // 1. Tự gọi IdentityService
        // 2. Check username/password
        // 3. Nếu đúng -> Gateway tự tạo JWT
        // 4. Trả token về client
        //
        // Nghĩa là:
        // JWT được tạo ở Gateway
        //
        // ==========================================================
        if(serviceKey==="IDENTITY" && req.forwardPath.toUpperCase()==="/LOGIN" && req.method==="POST"){
            try{
                // ================= URL LOGIN SERVICE =================
                // Tạo url đầy đủ để gọi đến IdentityService login
                // Ví dụ:
                // http://localhost:5002/login
                const targetUrl=`${serviceUrl}${req.forwardPath}`;
                // ================= CALL IDENTITY SERVICE =================
                //
                // Gửi username/password sang backend
                // để check user hợp lệ hay không
                const response= await axios.post(targetUrl, req.body);

                // ================= LOGIN SUCCESS =================
                //
                // Nếu backend xác thực thành công tạo token và trả về cho client
                if(response.data && response.data.isAuthenticated){
                    // ==================================================
                    // ================= CREATE JWT =====================
                    // ==================================================
                    //
                    //JWT gồm: HEADER.PAYLOAD.SIGNATURE
                    //SIGNATURE được tạo bởi: HEADER+PAYLOAD + JWT_SECRET
                    const token= jwt.sign(
                        // ================= PAYLOAD =================
                        //
                        // Dữ liệu lưu bên trong JWT
                        //
                        // Ví dụ:
                        // {
                        //   sub: "admin",
                        //   username: "admin"
                        // }
                        {sub: response.data.user, username: response.data.user},
                        // ================= SECRET =================
                        process.env.JWT_SECRET || config.JWT_SECRET,
                        // ================= EXPIRES =================
                        {expiresIn: "10d"}
                     );

                     // Trả token về client
                     return res.json({
                        message: "Đăng nhập thành công (Gateway generated token)",
                        token: token,
                        user: response.data.user
                     })
                }
                //LOGIN FAIL
                return res.statis(401).json({message: "Sai tài khoản hoặc mật khẩu"});

            }catch(err){
             // ================= LOGIN SERVICE ERROR =================
                console.error(
                    "Login Interception Error:",
                    err.message,
                    err.stack
                );

                return res.status(
                    err.response?.status || 500
                ).json({

                    message:
                        "Lỗi khi gọi IdentityService login",

                    error: err.message
                });
            }

        }
        // ================= NORMAL REQUEST =================
        //
        // Các request thông thường:
        //
        // GET  -> forwardGet()
        // POST -> forwardPost()
        //
        // ==========================================================
        // ================= FORWARD GET =================
        if(req.method==="GET")
            return forwardApi.forwardGet(serviceUrl, req, res);
        // ================= FORWARD POST =================
        if(req.method==="POST")
            return forwardApi.forwardPost(serviceUrl, req, res);
   }catch(error){
     // ================= GATEWAY INTERNAL ERROR =================
        console.error("Gateway error:", error);

        return res.status(500).json({

            message: "Lỗi hệ thống nội bộ xử lý gateway"

        });
   }
}