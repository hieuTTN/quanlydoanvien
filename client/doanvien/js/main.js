$( document ).ready(function() {
    var menu = 
    `<div class="container">
        <a class="navbar-brand" href="index.html">
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
                    <a class="nav-link active" href="#"><i class="bi bi-house"></i> Trang chủ</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="sukien.html"><i class="bi bi-calendar-event"></i> Sự kiện</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#"><i class="bi bi-people"></i> Đơn vị</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#"><i class="bi bi-award"></i> Thành tích</a>
                </li>
            </ul>

            <div class="d-flex align-items-center gap-3">

                <div class="notification-icon">
                    <i class="fa fa-bell"></i>
                    <span class="notification-badge">3</span>
                </div>

                <div class="dropdown">
                    <img src="/image/default-avatar.jpg" id="avatar-header" width="40" class="avatar-mini rounded-circle dropdown-toggle" data-bs-toggle="dropdown">

                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <a class="dropdown-item" href="#">
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