//Mục đích chuyển tiêp request của user đến service tương ứng
// axios để chuyển sang service
const axios=require("axios");

//Hàm buil URL nối base url service với path cần forward vd http://localhost:5189/api/identity/login
const buildUrl=(serviceUrl, req)=>{
  return `${serviceUrl}${req.forwardPath}`
}

//Forward GET-> gọi GET request tới service với url đầy đủ
async function forwardGet(serviceUrl, req,res){
    try {
        // gọi request sang service
        const response= await axios.get(buildUrl(serviceUrl,req),{
            // bỏ host cũ đi vì cổng là của gateway -> cổng service
            headers:{...req.headers, host: undefined},
            params: req.query, //giữ các query url
        })
        //Trả kết quả nguyên vẹn từ service về clien
        //vd status=200+ data
        return res.status(response.status).json(response.data);
    } catch (error) {
        //Nếu axios throw lỗi (microservice lỗi, mạng, timeout…)
        return res.status(error.response?.status || 502).json(
            error.response?.data || {message: "Downstream service lỗi"}
        );
    }
}

//Forward POST-> gọi POST request tới service với url đầy đủ
async function forwardPost(serviceUrl, req,res){
    try {
        // gọi request sang service
        const response= await axios.post(buildUrl(serviceUrl,req), req.body, {
            // bỏ host cũ đi vì cổng là của gateway -> cổng service
            headers:{...req.headers, host: undefined},
            params: req.query, //giữ các query url
        })
        //Trả kết quả nguyên vẹn từ service về clien
        //vd status=200+ data
        return res.status(response.status).json(response.data);
    } catch (error) {
        //Nếu axios throw lỗi (microservice lỗi, mạng, timeout…)
        return res.status(error.response?.status || 502).json(
            error.response?.data || {message: "Downstream service lỗi"}
        );
    }
}
module.exports={forwardGet,forwardPost}