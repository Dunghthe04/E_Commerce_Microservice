using IdentityService.DTOs;
using IdentityService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IdentityService.Services;

/// <summary>
/// Giao diện định nghĩa các dịch vụ xác thực.
/// Đăng ký user
/// Đăng nhập user
/// Tạo JWT Token
/// </summary>

//các pthuc sẽ thực hiện
public interface IAuthService{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(RegisterRequest request);
}

/// <summary>
/// Lớp triển khai logic đăng ký, đăng nhập và tạo JWT Token.
/// </summary>
public class AuthService : IAuthService
{
    //lấy các chức năng của Identity
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    /// <summary>
    /// Logic Đăng ký tài khoản mới.
    /// </summary>
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // 1. Kiểm tra xem user đã tồn tại chưa
        var userExists = await _userManager.FindByNameAsync(request.UserName);
        if (userExists != null)
            return new AuthResponse(false, "User already exists!");

        // 2. Tạo đối tượng User mới
        ApplicationUser user = new()
        {
            Email = request.Email,
            SecurityStamp = Guid.NewGuid().ToString(),
            UserName = request.UserName,
            FullName = request.FullName
        };

        // 3. Lưu vào Database (Mật khẩu sẽ được UserManager tự động băm/hash)
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return new AuthResponse(false, "User creation failed! Errors: " + string.Join(", ", result.Errors.Select(e => e.Description)));

        return new AuthResponse(true, "User created successfully!");
    }

    /// <summary>
    /// Logic Đăng nhập và trả về Token.
    /// </summary>
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // 1. Tìm user theo tên đăng nhập
        var user = await _userManager.FindByNameAsync(request.UserName);
        
        // 2. Kiểm tra user tồn tại và mật khẩu có đúng không (userManager.CheckPasswordAsync sẽ tự hash pass để so sánh)
        if (user != null && await _userManager.CheckPasswordAsync(user, request.Password))
        {
            // 3. Tạo danh sách các thông tin định danh (Claims) để lưu vào Token
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            // 4. Tạo JWT Token
            var token = CreateToken(authClaims);

            // 5. Trả về token dưới dạng chuỗi string
            return new AuthResponse(true, "Login successful", new JwtSecurityTokenHandler().WriteToken(token));
        }
        return new AuthResponse(false, "Invalid username or password");
    }

    /// <summary>
    /// Hàm phụ trợ để ký và tạo cấu trúc cho JWT Token.
    /// </summary>
    private JwtSecurityToken CreateToken(List<Claim> authClaims)
    {
        // Lấy Secret Key từ file cấu hình (phải khớp với Gateway)
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]!));

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"], // Người phát hành
            audience: _configuration["JwtSettings:Audience"], // Đối tượng sử dụng
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:DurationInMinutes"])), // Thời hạn
            claims: authClaims, // Thông tin người dùng
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256) // Thuật toán ký
            );

        return token;
    }
}
