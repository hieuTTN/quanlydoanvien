var exceptionCode = 417;
var token = localStorage.getItem("token");
$( document ).ready(function() {
    var menu = 
    `<div class="sidebar-title p-4 text-white fw-bold fs-4">ĐOÀN TNCS HCM</div>
    <div class="menu" id="main-menu">
        <a href="index.html" class="menu-item"><i class="bi bi-speedometer2"></i> <span class="nav-text">Dashboard</span></a>

        <a href="#" class="menu-item" data-bs-toggle="collapse" data-bs-target="#menu1">
            <i class="bi bi-person-badge"></i> <span class="nav-text">Quản lý tài khoản</span> 
            <i class="bi bi-chevron-down ms-auto nav-text"></i>
        </a>
        <div class="collapse" id="menu1">
            <a href="user.html" class="menu-item ps-5"><i class="bi bi-list-ul"></i> <span class="nav-text">Danh sách</span></a>
            <a href="add-user.html" class="menu-item ps-5"><i class="bi bi-person-plus"></i> <span class="nav-text">Thêm mới</span></a>
        </div>

        <a href="#" class="menu-item" data-bs-toggle="collapse" data-bs-target="#menu2">
            <i class="bi bi-diagram-3"></i> <span class="nav-text">Quản lý tổ chức</span> 
            <i class="bi bi-chevron-down ms-auto nav-text"></i>
        </a>
        <div class="collapse" id="menu2">
            <a href="tochuc.html" class="menu-item ps-5"><i class="bi bi-building"></i> <span class="nav-text">Danh sách</span></a>
            <a href="add-tochuc.html" class="menu-item ps-5"><i class="bi bi-plus-circle"></i> <span class="nav-text">Thêm mới</span></a>
        </div>

        <a href="#" class="menu-item" data-bs-toggle="collapse" data-bs-target="#menu3">
            <i class="bi bi-calendar-event"></i> <span class="nav-text">Quản lý sự kiện</span> 
            <i class="bi bi-chevron-down ms-auto nav-text"></i>
        </a>
        <div class="collapse" id="menu3">
            <a href="sukien.html" class="menu-item ps-5"><i class="bi bi-building"></i> <span class="nav-text">Danh sách</span></a>
            <a href="add-sukien.html" class="menu-item ps-5"><i class="bi bi-plus-circle"></i> <span class="nav-text">Thêm mới</span></a>
        </div>

        <a href="log.html" class="menu-item"><i class="bi bi-file-earmark-text"></i> <span class="nav-text">Quản lý log</span></a>

        <a href="#" class="menu-item" data-bs-toggle="collapse" data-bs-target="#menu4">
            <i class="bi bi-gear"></i> <span class="nav-text">Cài đặt</span> 
            <i class="bi bi-chevron-down ms-auto nav-text"></i>
        </a>
        <div class="collapse" id="menu4">
            <a href="doimatkhau.html" class="menu-item ps-5"><i class="bi bi-key"></i> <span class="nav-text">Đổi mật khẩu</span></a>
            <a href="infor.html" class="menu-item ps-5"><i class="bi bi-person-circle"></i> <span class="nav-text">Thông tin cá nhân</span></a>
            <a href="#" onclick="logout()" class="menu-item ps-5"><i class="bi bi-box-arrow-right"></i> <span class="nav-text">Đăng xuất</span></a>
        </div>
    </div>`
    document.getElementById('sidebar').innerHTML = menu;

    var topHeader = 
    `<div class="d-flex align-items-center gap-3">
        <button id="toggle-sidebar" class="btn btn-light border-0">
            <i class="bi bi-list fs-4"></i>
        </button>
        <div class="search-bar">
            <input type="text" class="form-control" placeholder="Tìm kiếm...">
        </div>
    </div>
    <div class="d-flex align-items-center gap-4">
        <div class="notification-icon">
            <i class="bi bi-bell"></i><span class="badge rounded-pill bg-danger badge-notif">3</span>
        </div>
        <div class="user-profile">
            <img src="/image/default-avatar.jpg" id="avatar-header" width="40" class="rounded-circle" >
            <div>
                <div class="fw-bold small" id="fullname-header">Nguyễn Văn A</div>
                <div class="text-muted" style="font-size: 0.7rem;">Quản trị viên</div>
            </div>
        </div>
    </div>`
    document.getElementById('top-header').innerHTML = topHeader;
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('top-header');
    const content = document.getElementById('main-content');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // Lưu trạng thái vào trình duyệt để khi load lại trang không bị mất
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarState', isCollapsed);
    });

    var user = localStorage.getItem('user');
    user = JSON.parse(user);
    document.getElementById('fullname-header').textContent = user.fullName;
    if(user.avatar != null && user.avatar != '') {
        document.getElementById('avatar-header').src = user.avatar;
    }

    // Giữ trạng thái khi load lại trang
    // window.onload = () => {
    //     if (localStorage.getItem('sidebarState') === 'true') {
    //         sidebar.classList.add('collapsed');
    //     }
    // };
});

function loadInforHeader() {
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}