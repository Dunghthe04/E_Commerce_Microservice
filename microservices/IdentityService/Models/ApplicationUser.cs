using Microsoft.AspNetCore.Identity;

namespace IdentityService.Models;

/// <summary>
/// Lớp đại diện cho người dùng ứng dụng, kế thừa từ IdentityUser có sẵn của Microsoft.
/// IdentityUser đã có sẵn các trường như Id, UserName, Email, PasswordHash...
/// </summary>
public class ApplicationUser : IdentityUser
{
    // Bổ sung thêm trường Họ tên đầy đủ (ngoài các trường mặc định)
    public string? FullName { get; set; }
    
    // Ngày tạo tài khoản
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
