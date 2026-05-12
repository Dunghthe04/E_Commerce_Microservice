using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace IdentityService.Infrastructure.Services;

public class AuthService : IAuthService
{
    //Một object Microsoft cung cấp để quản lý user/login/register/password trong ASP.NET Identity
    //Công cụ Microsoft để thao tác với bảng ApplicationUser
    //Có thể Tìm,Tạo user,Check password,Hash password tự động
    private readonly UserManager<ApplicationUser> _userManager;
    //Service đọc config
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var userExists = await _userManager.FindByEmailAsync(request.Email);
        if (userExists != null)
            return new AuthResponse(false, "User already exists!");

        var user = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Email,
            FullName = request.FullName,
            SecurityStamp = Guid.NewGuid().ToString()
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return new AuthResponse(false, "User creation failed! " + string.Join(", ", result.Errors.Select(e => e.Description)));

        return new AuthResponse(true, "User created successfully!");
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return new AuthResponse(false, "Invalid credentials!");

        var token = GenerateJwtToken(user);
        return new AuthResponse(true, "Login successful", token);
    }

    //Hàm tạo token sau khi login thành công
    private string GenerateJwtToken(ApplicationUser user)
    {
        //lấy ra đối tượng Jwt khai báo ở appsettings
        var jwtSetting = _configuration.GetSection("JwtSettings");

        //ép secret_key từ string về dạng byte vì thuật toán mã hóa HMACSHA56 đọc byte
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSetting["Key"]!));
        //Dung thuật toán HmacSha256 để tạo chữ ký từ scret_key
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //Tạo payload(claims)
        var claims = new List<Claim>
        {
            //clam là mẩu thông tin của user
            //Sub(Subject) Thường dùng để định danh ID User
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            //Email và fullName: thông tin thêm của user
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("FullName", user.FullName??""),
            // Jti (JWT ID): Mã ID duy nhất của token này (có thể dùng để chặn token - revoke/blacklist)
            new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
        };

        //Tạo đối tượng token gom Payload(claims), thời gian sống(Expires), và chữ ký(signature), còn header microsoft tự tạo
        var token = new JwtSecurityToken(
            issuer: jwtSetting["Issuer"], // Ai tạo ra token này?
            audience: jwtSetting["Audience"],// Token này dành cho ai đọc?
            claims: claims,// Dữ liệu payload ở trên
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSetting["DurationInMinutes"])),
            signingCredentials: creds // Chữ ký bảo mật (Kèm Secret Key)

            );
        // ================= 4. Xuất Token thành chuỗi String =================
        // Bên C#, đối tượng token ở trên chỉ là class. Ta phải dùng JwtSecurityTokenHandler để "biên dịch" (WriteToken)
        // class đó thành chuỗi ký tự String dài ngoằng mà frontend nhận được.
        // Đây chính là kết quả cuối cùng giống hệt giá trị trả về của jwt.sign(...)
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}