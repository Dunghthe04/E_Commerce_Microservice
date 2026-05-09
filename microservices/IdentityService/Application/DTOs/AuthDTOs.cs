namespace IdentityService.Application.DTOs;

/* nhận dữ liệu từ client(front end)
 * trả dữ liệu về client
 * không cho client đụng trực tiếp Entity/Database model
 * DTO đại diện dữ liệu INPUT.
 */
// Mẫu đơn nhận khi đăng nhập
public record LoginRequest(string Email, string Password);

// Mẫu đơn nhận khi đăng ký
public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string? PhoneNumber, // Có thể để trống
    string? Address,     // Có thể để trống
    int? Role 
);

// Kết quả trả về sau khi xử lý (Thành công hay thất bại)
public record AuthResponse(bool IsSuccess, string Message, string? Token = null);

