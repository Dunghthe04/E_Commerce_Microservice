using Microsoft.AspNetCore.Identity;

namespace IdentityService.Domain.Entities;


// Kế thừa IdentityUser để tận dụng các trường có sẵn như Email, PasswordHash, Phone...
public class ApplicationUser: IdentityUser
{
    //Thêm các trường tùy chỉnh
    public String? FullName { get; set; }
    public DateTime CreatedDate { get; set; }= DateTime.Now;
}