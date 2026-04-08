//Trung gian gateway, nhận request từ client -
// ==>quyết định service -> set path cần forward và gọi file forward để bắn tới service
const config = require("../configs");
const forwardApi = require("../handles/forwardAPI")

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
            //vừa trả về status và json lỗi
            return res.status(404).json({
                message: `Không tìm thấy service ${serviceKey}`
            })
        }
        //lấy ra phần path đăng sau service
        req.forwardPath = `/${parts.slice(3).join("/")}`;

        //điều hướng theo pthuc
        if (req.method === "OPTIONS") return res.sendStatus(200);
        if (req.method === "GET") return forwardApi.forwardGet(serviceUrl, req, res);
        if (req.method === "POST") return forwardApi.forwardPost(serviceUrl, req, res);

        return res.status(405).json({
            message: "Phương thức không được hỗ trợ"
        })
    } catch (error) {
        return res.status(405).json({
            message: "Lỗi hệ thống nội bộ xử lý gateway"
        })
    }

}
module.exports = { forwardRequest };