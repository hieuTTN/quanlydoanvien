var token = localStorage.getItem("token");
$( document ).ready(function() {
    var menu = 
    `<div class="container">
        <a class="navbar-brand" href="/index.html">
            <div class="d-flex left-header align-items-center gap-2">
                <img src="/image/logo.webp" class="img-header-logo"> 
                <div>
                    <span class="fw-bold">PATHFINDER SCOUTES VIETNAM</span>
                    <span class="small-text-header">HƯỚNG ĐẠO VIỆT NAM</span>
                </div>
            </div>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">

            <ul class="navbar-nav mx-auto">
                <li class="nav-item">
                    <a class="nav-link" href="index.html" data-url-header="index.html"><i class="bi bi-house"></i> Trang chủ</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="sukien.html" data-url-header="sukien.html"><i class="bi bi-calendar-event"></i> Sự kiện chung</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="doanvien.html"><i class="bi bi-people"></i> Quản lý</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#"><i class="bi bi-award" ></i> Thành tích</a>
                </li>
            </ul>

            <div class="d-flex align-items-center gap-3">

                <div class="dropdown">
                    <img src="/image/default-avatar.jpg" id="avatar-header" width="40" class="avatar-mini rounded-circle dropdown-toggle" data-bs-toggle="dropdown">

                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <a class="dropdown-item" href="my-infor.html">
                                <i class="bi bi-person"></i> Hồ sơ
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="#">
                                <i class="bi bi-gear"></i> Cài đặt
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item text-danger" href="#" onclick="logout()">
                                <i class="bi bi-box-arrow-right"></i> Đăng xuất
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="pointer" data-bs-toggle="dropdown">
                    <span class="hello-doanvien">Xin chào</span>
                    <span class="user-name" id="fullname-header"></span>
                </div>
            </div>

        </div>
    </div>`;
    document.getElementById("menu-doanvien").innerHTML = menu;


    var user = localStorage.getItem('user');
    user = JSON.parse(user);
    document.getElementById('fullname-header').textContent = user.fullName;
    if(user.avatar != null && user.avatar != '') {
        document.getElementById('avatar-header').src = user.avatar;
    }


    window.addEventListener("scroll", function() {
        const navbar = document.querySelector(".member-navbar");
        navbar.classList.toggle("scrolled", window.scrollY > 20);
    });

});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}

function loadSideBar() {
    var sidebar =
    `<div class="account-sidebar">

        <div class="account-user-box text-center">
            <img src="/image/default-avatar.jpg" id="avatar-sidebar" class="account-avatar mb-3">
            <h6 id="fullname-account"></h6>
            <small class="text-muted" id="username-sidebar"></small>
        </div>

        <ul class="account-menu">
            <li>
                <a href="my-infor.html" data-url="my-infor.html" class="account-menu-item">
                    <i class="fas fa-user"></i>
                    Thông tin tài khoản
                </a>
            </li>
            <li>
                <a href="doanvien.html" data-url="doanvien.html" class="account-menu-item">
                    <i class="fas fa-users"></i>
                    Quản lý đoàn viên
                </a>
            </li>
            <li>
                <a href="sukientochuc.html" data-url="sukientochuc.html" class="account-menu-item">
                    <i class="fas fa-calendar"></i>
                    Quản lý sự kiện
                </a>
            </li>
            <li>
                <a href="nhatkyhoatdong.html" data-url="nhatkyhoatdong.html" class="account-menu-item">
                    <i class="fas fa-history"></i>
                    Nhật ký hoạt động
                </a>
            </li>
            <li>
                <a href="changepassword.html" data-url="changepassword.html" class="account-menu-item">
                    <i class="fas fa-lock"></i>
                    Đổi mật khẩu
                </a>
            </li>
            <li>
                <a href="#" onclick="logout()" class="account-menu-item">
                    <i class="fa fa-sign-out" aria-hidden="true"></i>
                    Đăng xuất
                </a>
            </li>
        </ul>

    </div>`
    document.getElementById("sidebarmain").innerHTML = sidebar;
    var inforTop =
    `<div class="p-2 bg-white rounded shadow mb-3">
        <div class="text-center">
            <h2 id="fullName1"></h2>
        </div>
        <div id="breadcrumb" class="d-flex justify-content-center"></div>
    </div>`
    document.getElementById("infor-top").innerHTML = inforTop
    setActiveSidebar();
    loadMyInforSidebar();

}

function setActiveSidebar() {

    // Lấy file hiện tại (vd: my-infor.html)
    var currentPath = window.location.pathname;
    var currentPage = currentPath.substring(currentPath.lastIndexOf("/") + 1);

    // Nếu đang ở root không có file
    if (currentPage === "") {
        currentPage = "my-infor.html";
    }

    // Lặp qua các item
    document.querySelectorAll(".account-menu-item").forEach(function(item) {

        var itemUrl = item.getAttribute("data-url");

        // reset active
        item.classList.remove("account-active");

        // so sánh
        if (itemUrl === currentPage) {
            item.classList.add("account-active");
        }
    });
}

async function loadMyInforSidebar() {
    const response = await fetch(`http://localhost:8080/api/user/all/user-logged`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("username-sidebar").textContent = result.email;
    document.getElementById("fullname-account").textContent = result.fullName;
    if(result.avatar != null && result.avatar != '') {
        document.getElementById('avatar-sidebar').src = result.avatar;
    }
    document.getElementById("fullName1").innerHTML = result.fullName


    var uls = new URL(document.URL)
    var organization = uls.searchParams.get("organization");

    const fileName = uls.pathname.split('/').pop();
    const res = await fetch(`http://localhost:8080/api/organizations/all/find-by-user`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await res.json();
    var main = '';
    for(let i=0; i < list.length; i++){
        // let btnClass = (organization == null) ? (i == 0 ? 'btn-primary' : 'btn-secondary') : 
        //             (list[i].id == organization ? 'btn-primary' : 'btn-secondary');

        let btnClass = (organization == null) ? 'btn-secondary' : 
                    (list[i].id == organization ? 'btn-primary' : 'btn-secondary');
        main += `
        <div class="dropdown dropdown-hover d-inline-block m-2">
            <button class="btn ${btnClass} dropdown-toggle" type="button" data-bs-toggle="dropdown">
                ${list[i].typeDisplayName}: ${list[i].name}
            </button>
            <ul class="dropdown-menu">
                <li class="${fileName == 'doanvien.html' && list[i].id == organization?'active-child':''}"><a class="dropdown-item" href="doanvien.html?organization=${list[i].id}">Đoàn viên</a></li>
                <li class="${fileName == 'sukientochuc.html' && list[i].id == organization?'active-child':''}"><a class="dropdown-item" href="sukientochuc.html?organization=${list[i].id}">Sự kiện</a></li>
            </ul>
        </div>`;
    }
    document.getElementById("breadcrumb").innerHTML = main;
}