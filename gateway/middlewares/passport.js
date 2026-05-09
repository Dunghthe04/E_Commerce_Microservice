// ========================= PASSPORT JWT CONFIG =========================
// File này cấu hình Passport để xác thực JWT cho các request gửi đến gateway(mỗi request gửi đi sẽ kèm theo token trong header Authorization).
//
// Mục tiêu:
// -Client gửi request đến gateway lên thông qua header Authorization: Bearer <token>.
// -Passport kiểm tra xem token đó có hợp lệ không
// -Nếu hợp lệ, Passport sẽ gán dữ liệu token vào req.user 
// -Sau đó gateway sẽ forward request sang service tương ứng C# 
//
// Ví dụ: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE2ODg4ODQwMDAsImV4cCI6MTY4OTk0ODAwMH0.abc123signature

//Passport là middleware xác thực cho Nodejs/expressjs
const partport= require("passport");

//passport-jwt sẽ cung cấp:
// -JwtStrategy: chiến lược xác thực JWT cho passport, nghĩa là khi có request đến, passport sẽ sử dụng chiến lược này để xác thực JWT
// -ExtractJwt: giúp lấy token từ header Authorization của request gửi đến gateway

const {Strategy: JwtStrategy, ExtractJwt}= require("passport-jwt");

//Secret key dùng để verify JWT, phải giống secret khi tạo token lúc login
const {JWT_SECRET} =require("../configs");

//Đăng kí JWT Strategy cho passport
//Nghĩa là: khi có request gọi lên, passport sẽ sử dụng chiến lược này để xác thực JWT
passport.use(
   //JwtStrategy có 2 tham số: 1 là cấu hình JWT, 2 là hàm verify callback xử lý khi token hợp lệ
   new JwtStrategy(
     //================= CONFIG JWT =================
     {
        //Lấy token từ header:
        //Authorization: Bearer <token>
        //Ví dụ Authorization: Bearer abc1234
        //Passport sẽ tự động lấy token abc1234 để xác thực
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        //Sử dụng JWT_SECRET để xác thực token
        secretOrKey: JWT_SECRET,
     },
     //================= VERIFY CALLBACK =================
     //
     //Hàm này sẽ chạy sau khi:
     // -Token được verify thành công
     // -Token hợp lệ
     //
     //Payload là dữ liệu decode từ token
     // Ví dụ payload:
     // {
     //   id: 1,
     //   role: "admin"
     // }
     // done: callback của passport sẽ trả về kết quả xác thực
     async(payload,done)=>{
       //done có 2 tham số: 1 là lỗi, 2 là dữ liệu người dùng (nếu xác thực thành công)
        try{
          //done(error, user)
          //
          //null   =không có lỗi
          //
          //passport sẽ gán payload vào req.user nếu xác thực thành công
          // req.user=payload
          return done(null, payload);
        }catch(error){
          // Nếu có lỗi -> reject request
          return done(error, false);
        }
     }
   )
);

module.exports=passport;