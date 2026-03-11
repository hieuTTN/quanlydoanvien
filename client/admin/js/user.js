var token = localStorage.getItem("token");
var size = 10;
async function loadRoles() {
    try {
        const response = await fetch('http://localhost:8080/api/authority/admin/all', {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
        const list = await response.json();
        let optionsHtml = '<option value="">-- Chọn quyền --</option>';
        list.forEach(item => {
            optionsHtml += `<option value="${item.name}" data-description="${item.description}">${item.name}</option>`;
        });
        document.getElementById("roles").innerHTML = optionsHtml;
        $('#roles').select2({
            theme: "bootstrap-5",
            width: '100%', 
            templateResult: formatRole,
            templateSelection: (data) => data.text 
        });
    } catch (error) {
        console.error("Lỗi tải quyền:", error);
    }
}

function formatRole(state) {
    if (!state.id) return state.text;
    
    // Lấy mô tả từ data-attribute
    var desc = $(state.element).data('description');
    
    // Trả về HTML tùy chỉnh
    var $state = $(
        `<span>
            <div style="font-weight: bold;">${state.text}</div>
            <div style="font-size: 0.85em; color: #6c757d; font-style: italic;">${desc}</div>
        </span>`
    );
    return $state;
}

async function loadOrganizations() {
    try {
        const response = await fetch('http://localhost:8080/api/organizations/all/find-all-list', {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
        const list = await response.json();
        let optionsHtml = '<option value="">-- Chọn đơn vị --</option>';
        list.forEach(item => {
            optionsHtml += `<option value="${item.id}" data-description="Đơn vị: ${item.typeDisplayName}">${item.name}</option>`;
        });
        document.getElementById("organizations").innerHTML = optionsHtml;
        $('#organizations').select2({
            theme: "bootstrap-5",
            width: '100%', 
            templateResult: formatOrganization,
            templateSelection: (data) => data.text 
        });
    } catch (error) {
        console.error("Lỗi tải đơn vị:", error);
    }
}

async function loadOrganizationSelect() {
    try {
        const response = await fetch('http://localhost:8080/api/organizations/all/find-by-type?organizationType=DOAN', {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
        const list = await response.json();
        let optionsHtml = '<option value="">-- Chọn đơn vị --</option>';
        list.forEach(item => {
            optionsHtml += `<option value="${item.id}" data-description="Đơn vị: ${item.typeDisplayName}">${item.name}</option>`;
        });
        document.getElementById("organizationSelect").innerHTML = optionsHtml;
        $('#organizationSelect').select2({
            theme: "bootstrap-5",
            width: '100%', 
            templateResult: formatOrganization,
            templateSelection: (data) => data.text 
        });
    } catch (error) {
        console.error("Lỗi tải đơn vị:", error);
    }
}

function formatOrganization(state) {
    if (!state.id) return state.text;       
    var desc = $(state.element).data('description');    
    var $state = $(
        `<span>
            <div style="font-weight: bold;">${state.text}</div>
            <div style="font-size: 0.85em; color: #6c757d; font-style: italic;">${desc}</div>
        </span>`
    );
    return $state;
}

async function loadUsers(page) {
    var search = document.getElementById("search").value
    var status = document.getElementById("status").value
    var role = document.getElementById("roles").value
    var organization = document.getElementById("organizations").value
    var url = 'http://localhost:8080/api/user/admin/search?page=' + page + '&size=' + size + '&keyword=' + search;
    if (status) {
        url += '&actived=' + status;
    }
    if (role) {
        url += '&authority=' + role;
    }
    if (organization) {
        url += '&organizationId=' + organization;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;
    if(list.length == 0){
        document.getElementById("list-user").innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        var authoName = (list[i].userAuthorities || []).map(a => {
            // Kiểm tra thêm sự tồn tại của các object con
            const authName = a.authority ? a.authority.name : 'Unknown';
            const orgName = a.organization ? a.organization.name : 'No Org';
            return authName + ' (' + orgName + ')';
        }).join('<br> ');
        main += ` <tr id="user-row-${list[i].id}">
                    <td><img src="${list[i].avatar || '/image/default-avatar.jpg'}" class="rounded-circle" width="35"></td>
                    <td>${list[i].id}</td>
                    <td>${list[i].fullName}</td>
                    <td>${list[i].email}</td>
                    <td>${authoName}</td>
                    <td id="status-${list[i].id}"><span class="badge bg-${list[i].actived === true ? 'success' : 'danger'}">${list[i].actived === true ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                    <td class="text-end">
                        <button onclick="loadUserDetail(${list[i].id})" data-bs-toggle="modal" data-bs-target="#userDetailModal" class="btn btn-sm btn-info text-white"><i class="bi bi-eye"></i></button>
                        <a href="add-user.html?id=${list[i].id}" class="btn btn-sm btn-warning"><i class="bi bi-pencil"></i></a>
                        ${list[i].actived === true 
                            ? `<button id="toggle-${list[i].id}" onclick="toggleUserStatus(${list[i].id}, 1)" class="btn btn-sm btn-danger"><i class="bi bi-lock"></i></button>`
                            : `<button id="toggle-${list[i].id}" onclick="toggleUserStatus(${list[i].id}, 0)" class="btn btn-sm btn-success"><i class="bi bi-unlock"></i></button>`
                        }
                        <button onclick="deleteUser(${list[i].id})" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`
    }
    document.getElementById("list-user").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadUsers(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
}


async function loadUserDetail(userId){

    try{

        const res = await fetch(`http://localhost:8080/api/user/admin/${userId}`, {

            method: "GET",
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
            }),
        });

        const user = await res.json();
        renderUserDetail(user);

        const modal = new bootstrap.Modal(
            document.getElementById("userDetailModal")
        );

        modal.show();

    }
    catch(err){

        alert("Không load được user");

        console.error(err);

    }

}



function renderUserDetail(user){

    document.getElementById("detailAvatar").src =
        user.avatar || "/image/default-avatar.jpg";

    document.getElementById("detailEmail").innerText =
        user.email || "";

    document.getElementById("detailFullName").innerText =
        user.fullName || "";

    document.getElementById("detailPhone").innerText =
        user.phone || "";

    document.getElementById("detailIdc").innerText =
        user.idc || "";

    document.getElementById("detailGender").innerText =
        user.gender || "";

    document.getElementById("detailDob").innerText =
        user.dob || "";

    document.getElementById("detailAge").innerText =
        calculateAge(user.dob) || "";

    document.getElementById("detailAddress").innerText =
        user.address+", " + user.wards.name+", "+user.wards.provinceName || "";

    document.getElementById("detailActived").innerHTML =
        user.actived
        ? '<span class="badge bg-success">Active</span>'
        : '<span class="badge bg-danger">Inactive</span>';



    renderAuthority(user.userAuthorities);

}

function calculateAge(dob) {
    if (!dob) return "";
    const birthDate = new Date(dob);    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}



function renderAuthority(authorities){

    const tbody =
        document.getElementById("detailAuthorityTable");

    tbody.innerHTML = "";

    if(!authorities) return;


    authorities.forEach(a=>{

        tbody.innerHTML += `
            <tr>
                <td>${a.authority?.name ?? ""}</td>
                <td>${a.organization?.name ?? ""}</td>
                <td>
                    ${a.isHead
                        ? '<span class="badge bg-primary">Yes</span>'
                        : ''}
                </td>
                <td>
                    ${a.isDefault
                        ? '<span class="badge bg-success">Default</span>'
                        : ''}
                </td>
            </tr>
        `;

    });

}

/**
 *  chức năng liên quan đến thêm/sửa user sẽ được viết ở đây
 */
// Biến toàn cục lưu trữ danh sách quyền và tổ chức
let ALL_ROLES = [];

let ALL_ORGANIZATIONS = [];

async function initData(){

    ALL_ROLES = await fetch("http://localhost:8080/api/authority/admin/all", {
        method: "GET",
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    })
    .then(r=>r.json());

    console.log(ALL_ROLES);
    

    ALL_ORGANIZATIONS = await fetch("http://localhost:8080/api/organizations/all/find-all-list", {
        method: "GET",
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    })  
    .then(r=>r.json());

}

function addAuthorityRow(){

    const tbody =
        document.getElementById("authorityTable");


    const tr = document.createElement("tr");


    tr.innerHTML = `

        <td>
            <select class="form-select role-select">

                <option value="">Chọn Role</option>

                ${ALL_ROLES.map(r=>`
                    <option value="${r.name}"
                            data-type="${r.organizationType}">
                        ${r.name}
                    </option>
                `).join("")}

            </select>
        </td>


        <td>

            <input class="form-control org-type" readonly>

        </td>


        <td>

            <select class="form-select org-select">

                <option value="">Chọn organization</option>

            </select>

        </td>


        <td class="text-center">
            <input type="checkbox" class="isHead">
        </td>

        <td class="text-center">
            <input type="checkbox" class="isDefault">
        </td>


        <td>

            <button type="button"
                    class="btn btn-danger btn-sm"
                    onclick="this.closest('tr').remove()">

                X

            </button>

        </td>

    `;


    tbody.appendChild(tr);


    bindRoleChange(tr);

}

function bindRoleChange(tr){

    const roleSelect =
        tr.querySelector(".role-select");

    const orgTypeInput =
        tr.querySelector(".org-type");

    const orgSelect =
        tr.querySelector(".org-select");


    roleSelect.onchange = function(){

        const selected =
            this.selectedOptions[0];

        const type =
            selected.dataset.type;


        orgTypeInput.value = type;


        orgSelect.innerHTML =
            '<option value="">Chọn organization</option>';


        ALL_ORGANIZATIONS
            .filter(o=>o.type === type)
            .forEach(o=>{

                orgSelect.innerHTML += `
                    <option value="${o.id}">
                        ${o.name}
                    </option>
                `;

            });

    }

}

async function chooseAvatar(){
    document.getElementById("btn-submit").disabled = true
    document.getElementById("btn-submit").innerText = "Đang tải ảnh..."
    const filePath = document.getElementById('fileanhdaidientl')
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        const linkImage = await res.text();
        document.getElementById("avatar").value = linkImage;
        document.getElementById("btnchoosefile").style.backgroundImage = `url('${linkImage}')`;
    }
    document.getElementById("btn-submit").disabled = false
    document.getElementById("btn-submit").innerText = "Lưu User"
}

async function saveUser() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var user = {
        id: id,
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        idc: document.getElementById("idc").value,
        gender: document.getElementById("gender").value,
        password: document.getElementById("password").value,
        dob: document.getElementById("dob").value,
        address: document.getElementById("stressName").value,     
        actived: document.getElementById("actived").checked,     
        avatar: document.getElementById("avatar").value,
        wardCode: document.getElementById("xa").value,
        authorities: []
    }
    var authorityRows = document.querySelectorAll("#authorityTable tr"); 
    authorityRows.forEach(row => {
        var role = row.querySelector(".role-select").value;
        var orgId = row.querySelector(".org-select").value;
        var isHead = row.querySelector(".isHead").checked;
        var isDefault = row.querySelector(".isDefault").checked;
        if (role) {
            user.authorities.push({
                authorityName: role,
                organizationId: orgId,
                isHead: isHead,
                isDefault: isDefault
            });
        }
    });
    const res = await fetch('http://localhost:8080/api/user/admin/create-update', {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(user)
    });
    if (res.status < 300) {
        swal({
            title: "Thông báo",
            text: "thêm/sửa user thành công!",
            type: "success"
        },
        function() {
            window.location.replace('user.html')
        });
    } 
    else if(res.status == 417){
        var result = await res.json();
        console.log(result);
        swal("Thông báo", result.defaultMessage || "Có lỗi xảy ra", "error");
    }
    else {
        var result = await res.json();
        console.log(result.defaultMessage);
        
        if(result && result.message){
            toastr.error(result.message);
        } 
        else if(result && result.defaultMessage){
            toastr.error(result.defaultMessage);
        }
        else {
            toastr.error("Tạo user thất bại");
        }
    }

}


async function loadAUser() {
    var id = window.location.search.split('=')[1];
    if (id != null) {
        var url = `http://localhost:8080/api/user/admin/${id}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        
        document.getElementById("fullName").value = result.fullName
        document.getElementById("email").value = result.email
        document.getElementById("phone").value = result.phone
        document.getElementById("idc").value = result.idc
        document.getElementById("gender").value = result.gender
        document.getElementById("dob").value = result.dob
        document.getElementById("stressName").value = result.address
        document.getElementById("actived").checked = result.actived
        document.getElementById("avatar").value = result.avatar
        if(result.avatar){
            document.getElementById("btnchoosefile").style.backgroundImage = `url('${result.avatar}')`;
        }
        try {
            $("#tinh").val(result.wards.provinceCode).trigger('change');
            await loadHuyenOnchange();
            setTimeout(() => {
                $("#xa").val(result.wards.code).trigger('change');
            }, 500);
        } catch (error) {
            console.error("Lỗi khi load địa chỉ:", error);
        }
        var authos = result.userAuthorities;
        var authorityRows = document.querySelectorAll("#authorityTable tr");
        for (i = 0; i < authos.length; i++) {
            addAuthorityRow();
        }
        authorityRows = document.querySelectorAll("#authorityTable tr");
        
        for (i = 0; i < authos.length; i++) {
            var a = authos[i];
            var row = authorityRows[i];
            row.querySelector(".role-select").value = a.authority.name;
            row.querySelector(".role-select").dispatchEvent(new Event('change'));
            row.querySelector(".org-select").value = a.organization ? a.organization.id : "";
            row.querySelector(".isHead").checked = a.isHead;
            row.querySelector(".isDefault").checked = a.isDefault;
        }
    }
}

async function toggleUserStatus(userId, type) {
    const res = await fetch(`http://localhost:8080/api/user/admin/lockOrUnlockUser?id=${userId}`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    }); 
    if (res.status < 300) {
        if(type == 1){
            toastr.success("Khóa user thành công");
            document.getElementById(`toggle-${userId}`).setAttribute("onclick", `toggleUserStatus(${userId}, 0)`);
            document.getElementById(`toggle-${userId}`).classList.remove("btn-danger");
            document.getElementById(`toggle-${userId}`).classList.add("btn-success");
            document.getElementById(`toggle-${userId}`).innerHTML = '<i class="bi bi-unlock"></i>';
            document.getElementById(`status-${userId}`).innerHTML = '<span class="badge bg-danger">Đã khóa</span>';
        } else {
            toastr.success("Mở khóa user thành công");
            document.getElementById(`toggle-${userId}`).setAttribute("onclick", `toggleUserStatus(${userId}, 1)`);
            document.getElementById(`toggle-${userId}`).classList.remove("btn-success");
            document.getElementById(`toggle-${userId}`).classList.add("btn-danger");
            document.getElementById(`toggle-${userId}`).innerHTML = '<i class="bi bi-lock"></i>';
            document.getElementById(`status-${userId}`).innerHTML = '<span class="badge bg-success">Đang hoạt động</span>';
        }
    } else {
        toastr.error("Cập nhật trạng thái thất bại");
    }
}
async function deleteUser(id) {
    // 1. Hiển thị thông báo xác nhận trước khi làm gì khác
    swal({
        title: "Bạn có chắc chắn muốn xóa?",
        text: "Hành động này không thể hoàn tác!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        closeOnConfirm: false // Chờ phản hồi từ server mới đóng alert
    },
    async function(isConfirm) {
        // Nếu người dùng chọn "Xóa"
        if (isConfirm) {
            var url = 'http://localhost:8080/api/user/admin/delete?id=' + id;
            
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + token
                    })
                });

                if (response.status < 300) {
                    swal("Đã xóa!", "Người dùng đã được xóa khỏi hệ thống.", "success");
                    document.getElementById(`user-row-${id}`).remove();
                } else if (response.status == exceptionCode) {
                    var result = await response.json();
                    swal("Lỗi!", result.defaultMessage, "error");
                } else {
                    swal("Thất bại!", "Có lỗi xảy ra trong quá trình xóa.", "error");
                }
            } catch (error) {
                swal("Lỗi!", "Không thể kết nối đến máy chủ.", "error");
            }
        }
    });
}


async function readFileExcel() {
    var organizationId = document.getElementById('organizationSelect').value;
    if(!organizationId){
        toastr.error("Vui lòng chọn đơn vị trước khi nhập khẩu");
        return;
    }
    const filePath = document.getElementById('formFile')
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = 'http://localhost:8080/api/user/admin/import?organizationId=' + organizationId;
    const res = await fetch(urlUpload, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
        body: formData
    });
    if (res.status < 300) {
        const result = await res.json();
        showImportResult(result);
    } else if (res.status == 417) {
        const result = await res.json();
        showImportResult(result);
    } else {
        toastr.error("Import thất bại");
    }
}


function showImportResult(result) {

    const container = document.getElementById("importResult");
    const messageDiv = document.getElementById("importMessage");
    const successCount = document.getElementById("importSuccessCount");
    const failCount = document.getElementById("importFailCount");
    const totalCount = document.getElementById("importTotalCount");
    const duplicateSection = document.getElementById("duplicateSection");
    const duplicateList = document.getElementById("duplicateList");

    // show container
    container.style.display = "block";

    // message
    messageDiv.innerText = result.message || "";

    if (result.skipped === 0) {
        messageDiv.className = "alert alert-success";
    } else if (result.inserted === 0) {
        messageDiv.className = "alert alert-danger";
    } else {
        messageDiv.className = "alert alert-warning";
    }

    // counts
    totalCount.innerText = result.total ?? 0;
    successCount.innerText = result.inserted ?? 0;
    failCount.innerText = result.skipped ?? 0;

    // skipped emails
    duplicateList.innerHTML = "";

    if (result.skippedEmails && result.skippedEmails.length > 0) {

        duplicateSection.style.display = "block";

        result.skippedEmails.forEach(email => {

            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-danger";
            li.innerHTML = `<i class="bi bi-x-circle me-2"></i>${email}`;

            duplicateList.appendChild(li);

        });

    } else {

        duplicateSection.style.display = "none";

    }

}