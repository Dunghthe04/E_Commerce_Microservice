// ================= FORWARD API LAYER =================
//
// Mục tiêu: nhận request từ apiGw route, gọi đến service tương ứng bằng axios, rồi trả kết quả về client.
//
// Flow:
// Gateway nhận request từ client
//      ↓
// Forward request sang microservice tương ứng
//      ↓
// Nhận response từ service
//      ↓
// Trả response về lại client
//
// File này KHÔNG xử lý business logic.
// Nó chỉ đóng vai trò:
// "HTTP Proxy / Forward Request"
//
// Ví dụ:
//
// Client gọi:
// GET /api/catalog/products
//
// Route nhận request, rồi gọi controller xử lý, controller sẽ gọi formatGet or formatPost để forward request sang service tương ứng, vd CatalogService:
// GET http://localhost:5103/api/products
//
// Sau khi nhận response từ CatalogService, controller sẽ trả về response cho client.
// =====================================================

// Axios dùng để gọi HTTP request sang microservice tương ứng
const axios= require("axios");

// ================= BUILD FULL URL =================
// Ghép 
//- base url của service tương ứng (ví dụ http://localhost:5103) với
//- path cần forward (ví dụ /api/products/1) thành url đầy đủ (http://localhost:5103/api/products/1)
const buildUrl=(serviceUrl, req)=>{
    return `${serviceUrl}${req.forwardPath}`;
}

// ================= FORWARD GET REQUEST =================
// Hàm được gọi khi có request GET từ route apiGw, nó sẽ gọi GET request sang service tương ứng với url đầy đủ, rồi trả kết quả về client
//
// Forward GET request sang microservice
//
// Flow:
// Client
//   ↓
// Gateway
//   ↓
// axios GET tới service
//   ↓
// Service response
//   ↓
// Trả lại client
async function forwardGet(serviceUrl, req,res){
    try{
      // ================= CALL SERVICE =================
      // Gateway gọi HTTP GET sang service tương ứng
      const response= await axios.get(
        //lấy ra url đầy đủ đường dẫn service và path cần forward
        buildUrl(serviceUrl, req),
        {
            // ================= FORWARD HEADERS =================
            //
            //Copy tất cả header từ request gửi đến gateway
            //
            // Ví dụ:
            // Authorization
            // Content-Type
            // Accept
            header:{
                // clone toàn bộ header cũ(các header, params...) vào header mới
                ...req.headers,
                //bỏ host cũ vì host là của gateway, khi forward sang service sẽ dùng host của service
                host: undefined,// underfined vì axios sẽ tự động gán host mới dựa trên url của service 
            },
            // ================= FORWARD QUERY =================
            //
            //Nếu có query url, vd /api/products?page=2&size=10 thì giữ nguyên query này khi forward sang service
            params: req.query,
        }
      );
      // ================= RETURN RESPONSE =================
      //
      //Trả nguyên response từ service về client, bao gồm status code và data
      //
      // Ví dụ:
      // status = 200
      // data   = { products: [] }
      return res.status(response.status).json(response.data);
    }catch(error){
          // ================= HANDLE ERROR =================
    //
    // Nếu service lỗi:
    // - timeout
    // - network error
    // - service down
    // - 500 internal server error
    //
    // Axios sẽ throw exception
    return res
      .status(error.response?.status || 502)
      .json(

        // Nếu service có trả lỗi
        error.response?.data ||

        // Nếu service chết hoàn toàn
        {
          message: "Downstream service lỗi"
        }
      );
    }
}

// ================= FORWARD POST REQUEST =================
//
// Logic giống forwardGet()
// nhưng dùng HTTP POST
async function forwardPost(serviceUrl, req, res) {

  try {

    // ================= CALL SERVICE =================
    //
    // axios.post(url, body, config)
    const response = await axios.post(

      // URL service
      buildUrl(serviceUrl, req),

      // Body client gửi lên
      //
      // Ví dụ:
      // {
      //   username: "admin",
      //   password: "123"
      // }
      req.body,

      {
        // Forward headers
        headers: {
          ...req.headers,
          host: undefined,
        },

        // Forward query params
        params: req.query,
      }
    );


    // ================= RETURN RESPONSE =================
    //
    // Trả nguyên response từ service về client
    return res
      .status(response.status)
      .json(response.data);

  } catch (error) {

    // ================= HANDLE ERROR =================
    return res
      .status(error.response?.status || 502)
      .json(
        error.response?.data ||
        {
          message: "Downstream service lỗi"
        }
      );
  }
}

// Export để controller gateway sử dụng
module.exports = {
  forwardGet,
  forwardPost
};