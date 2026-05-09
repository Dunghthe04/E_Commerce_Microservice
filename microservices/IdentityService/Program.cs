using IdentityService.Data;
using IdentityService.Models;
using IdentityService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. ĐĂNG KÝ DỊCH VỤ (Dependency Injection) ---

// Khai báo Controller
builder.Services.AddControllers();

// Cấu hình Database EF Core (Kết nối SQL Server từ Docker)
builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình ASP.NET Core Identity (Quản lý User/Password)
// Tọa hệ thống quản lý user+ role
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDBContext>()
    .AddDefaultTokenProviders();

// Cấu hình Xác thực JWT (Authentication)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Tắt HTTPS yêu cầu trong môi trường DEV
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]!))
    };
});

// Đăng ký dịch vụ AuthService để Controller có thể Inject vào sử dụng
// Khi cần IAuthService thì sẽ trả về AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// --- 2. CẤU HÌNH PIPELINE (Middlewares) ---

if (app.Environment.IsDevelopment())
{
    // Có thể thêm Swagger ở đây
}

// Kích hoạt Middleware Xác thực (Phải đặt TRƯỚC Authorization)
app.UseAuthentication();

// Kích hoạt Middleware Phân quyền
app.UseAuthorization();

// Map các route của Controller
app.MapControllers();

// Chạy ứng dụng
app.Run();
