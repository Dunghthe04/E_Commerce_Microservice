namespace IdentityService.DTOs;

/// <summary>
/// DTO cho yêu cầu đăng ký người dùng mới.
/// Controller nhận DTO từ front end, gọi service xử lý, service trả về DTO cho controller, controller trả về DTO cho client

/// </summary>
/// <param name="Email">Địa chỉ email</param>
/// <param name="Password">Mật khẩu (sẽ được hash trước khi lưu)</param>
/// <param name="FullName">Họ tên người dùng</param>
/// <param name="UserName">Tên đăng nhập duy nhất</param>
public record RegisterRequest(string Email, string Password, string FullName, string UserName);

/// <summary>
/// DTO cho yêu cầu đăng nhập.
/// </summary>
public record LoginRequest(string UserName, string Password);

/// <summary>
/// Cấu trúc dữ liệu trả về sau khi thực hiện Auth.
/// </summary>
/// <param name="IsSuccess">Thành công hay thất bại</param>
/// <param name="Message">Thông báo chi tiết</param>
/// <param name="Token">Chuỗi JWT Token nếu đăng nhập thành công</param>
public record AuthResponse(bool IsSuccess, string Message, string? Token = null);
