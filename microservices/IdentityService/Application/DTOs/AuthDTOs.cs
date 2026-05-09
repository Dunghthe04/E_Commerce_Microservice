namespace IdentityService.Application.DTOs;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FullName);
public record AuthResponse(bool IsSuccess, string Message, string? Token = null);
