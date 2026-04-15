using IdentityService.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;// thư viện quản lý identity và các bảng liên quan đến identity
using Microsoft.EntityFrameworkCore;// thư viện quản lý kết nối và các bảng trong Database

namespace IdentityService.Data;

//IdentityDbContext<ApplicationUser> là một class có sẵn trong thư viện Microsoft.AspNetCore.Identity.EntityFrameworkCore
//Nó chứa các bảng liên quan đến identity như Users, Roles, claim...
//Bảng user thì có sẵn các cột như Id, Email, Password, FullName, UserName...
public class ApplicationDBContext: IdentityDbContext<ApplicationUser>{
    
    //Nghĩa là khi khởi tạo ApplicationDBContext thì sẽ gọi đến constructor của IdentityDbContext
    //DbContextOptions<ApplicationDBContext> options: được truyền từ progeams.cs
    public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options): base(options){ // truyền lên cho lớp cha dùng

    }    
    
    //Quy định database sẽ được tạo như thế nào
    //Dùng đển chạy migration, add-migration, update-database
    protected override void OnModelCreating(ModelBuilder builder){
      base.OnModelCreating(builder);   
    }
}