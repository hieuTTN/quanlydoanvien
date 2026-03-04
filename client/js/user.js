async function login() {
    var url = 'http://localhost:8080/api/user/public/login-not-capcha'
    var user = {
        "username": document.getElementById("username").value,
        "password": document.getElementById("password").value,
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(user)
    });
    var result = await response.json();
    console.log(result);
    
    if (response.status < 300) {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);
        var userAuthorities = result.user.userAuthorities;
        var roleNames = userAuthorities.map(auth => auth.authority.name);
        console.log(roleNames);
        var listButton = ``;
        if (roleNames.includes("ROLE_ADMIN")) {
            listButton += `<a href="/admin/index.html" class="role-btn btn-admin">Trang quản trị</a>`;
        }
        if (roleNames.includes("ROLE_CHAU_TRUONG")) {
            listButton += `<a href="/chau/index.html" class="role-btn btn-chau">Quản lý châu</a>`;
        }
        if (roleNames.includes("ROLE_DAO_TRUONG")) {
            listButton += `<a href="/dao/index.html" class="role-btn btn-dao">Quản lý đạo</a>`;
        }
        if (roleNames.includes("ROLE_LIEN_DOAN_TRUONG")) {
            listButton += `<a href="/lien-doan/index.html" class="role-btn btn-lien-doan">Quản lý liên đoàn</a>`;
        }
        if (roleNames.includes("ROLE_DOAN_TRUONG")) {
            listButton += `<a href="/doan/index.html" class="role-btn btn-lien-doan">Quản lý đoàn</a>`;
        }
        if (roleNames.includes("ROLE_DOAN_SINH")) {
            listButton += `<a href="/doanvien/index.html" class="role-btn btn-doan-sinh">Trang cá nhân đoàn sinh</a>`;
        }
        // Hiển thị các nút chức năng dựa trên vai trò của người dùng
        Swal.fire({
            title: "Đăng nhập thành công!",
            html: `
                <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    ${listButton}
                </div>
            `,
            icon: "success",
            showConfirmButton: false, // Ẩn nút xác nhận (OK)
            showCancelButton: true,   // Hiển thị nút Hủy
            cancelButtonText: "Hủy đăng nhập",  // Đặt tên cho nút
            allowOutsideClick: false
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
            }
        });
    }
    else{
        toastr.warning(result.defaultMessage);
         document.getElementById('message').innerText = result.defaultMessage;
    }
}

async function forgorPassword() {
    var email = document.getElementById("email").value
    var url = 'http://localhost:8080/api/user/public/quen-mat-khau?email=' + email
    const res = await fetch(url, {
        method: 'POST'
    });
    if (res.status < 300) {
        swal({
                title: "",
                text: "Kiểm tra email của bạn",
                type: "success"
            },
            function() {
                window.location.replace("login.html")
            });
    }
    if (res.status == 417) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}

async function datLaiMatKhau() {
    var password = document.getElementById("newPassword").value
    var repassword = document.getElementById("confirmPassword").value
    if(password != repassword){
        Swal("Lỗi", "Mật khẩu không trùng khớp", "error");
        return;
    }
    var uls = new URL(document.URL)
    var email = uls.searchParams.get("email");
    var key = uls.searchParams.get("key");
    var url = 'http://localhost:8080/api/user/public/dat-lai-mat-khau?email=' + email+'&key='+key+'&password='+password
    const res = await fetch(url, {
        method: 'POST'
    });
    if (res.status < 300) {
        swal({
                title: "",
                text: "Đặt lại mật khẩu thành công",
                type: "success"
            },
            function() {
                window.location.replace("login.html")
            });
    }
    if (res.status == 417) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}