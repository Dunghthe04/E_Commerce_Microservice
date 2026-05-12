using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IdentityService.Controllers;

//Định nghĩa URL route cho controller
//[controller] sẽ tự động thay bằng tên controller => vd Authcontroller ==> api/Auth
[Route("api/[controller]")]
//Đánh dấu đây là ApiController -> ASp.NET tự hỗ trợ, validate model, parseJson request, binding dữ liệu tự động, trả lỗi 400 nếu model invalid
//Giảm code boilerplate.| Không cần tự check if(!ModelState.IsValid)
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.IsSuccess) return Unauthorized(result);
        return Ok(result);
    }
}

