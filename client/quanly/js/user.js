async function changePassword() {
    var token = localStorage.getItem("token");
    var oldpass = document.getElementById("oldpass").value
    var newpass = document.getElementById("newpass").value
    var renewpass = document.getElementById("renewpass").value
    var url = 'http://localhost:8080/api/user/all/change-password';
    if (newpass != renewpass) {
        swal("Lỗi", "Mật khẩu mới không trùng khớp", "error");
        return;
    }
    var passw = {
        "oldPass": oldpass,
        "newPass": newpass
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(passw)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "cập nhật mật khẩu thành công, hãy đăng nhập lại",
                type: "success"
            },
            function() {
            });
    }
    if (response.status == 417) {
        var result = await response.json()
        swal("Lỗi", result.defaultMessage, "error");
    }
}

async function loadInitInfor() {
    const response = await fetch(`http://localhost:8080/api/user/all/user-logged`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    if(result.avatar != null && result.avatar != '') {
        document.getElementById('avatar').src = result.avatar;
    }
    document.getElementById('fullname').value = result.fullName;
    document.getElementById('phone').value = result.phone;
    document.getElementById('gender').value = result.gender;
    document.getElementById('address').value = result.address;
    document.getElementById('avatarUrl').value = result.avatar;
    document.getElementById('birthday').value = result.dob;
    if(result.wards != null) {
        document.getElementById('tinh').value = result.wards.provinceCode;
        $("#tinh").val(result.wards.provinceCode).change()
        await loadHuyenOnchange();
        document.getElementById('xa').value = result.wards.code;
        $("#xa").val(result.wards.code).change()
    }
}

async function updateInfor() {
    var user = {
        fullName: document.getElementById("fullname").value,
        phone: document.getElementById("phone").value,
        gender: document.getElementById("gender").value,
        dob: document.getElementById("birthday").value,
        address: document.getElementById("address").value,     
        avatar: document.getElementById("avatarUrl").value,
        wards: {
            code: document.getElementById("xa").value
        },
    }
    const res = await fetch('http://localhost:8080/api/user/all/update-infor', {
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
            text: "cập nhật thông tin thành công!",
            type: "success"
        },
        function() {
            window.location.reload();
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
            toastr.error("Cập nhật thông tin thất bại");
        }
    }

}

async function loadToChuc() {
    const response = await fetch(`http://localhost:8080/api/organizations/all/find-by-user`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    var main = '';
    for(i=0; i< list.length; i++){
        main += `<option value="${list[i].id}">${list[i].typeDisplayName}: ${list[i].name}</option>`
    }
    document.getElementById("organization").innerHTML = main;
     $('#organization').select2({
        theme: "bootstrap-5",
        width: '100%', 
        templateSelection: (data) => data.text 
    });
    var uls = new URL(document.URL)
    var organization = uls.searchParams.get("organization");
    if(organization){
        document.getElementById("organization").value = organization;
        $("#organization").val(organization).change();
    }
}

var size = 10;

async function loadUsers(page) {
    var search = document.getElementById("search").value
    var gender = document.getElementById("gender").value
    var organization = document.getElementById("organization").value
    var url = 'http://localhost:8080/api/user/all/filter?page=' + page + '&size=' + size + '&keyword=' + search;
    if (gender) {
        url += '&gender=' + gender;
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
    console.log(result);
    
    var list = result.content;
    var totalPage = result.totalPages;
    var totalElements = result.totalElements;
    document.getElementById("totalElements").innerHTML = ` - Tổng <strong>${totalElements}</strong> thành viên`
    if(list.length == 0){
        document.getElementById("list-user").innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr id="user-row-${list[i].id}" onclick="toggleUserDetail(${list[i].id})" class="pointer">
                    <td><img src="${list[i].avatar || '/image/default-avatar.jpg'}" class="rounded-circle" width="35"></td>
                    <td>${list[i].fullName}</td>
                    <td>${list[i].email}</td>
                    <td>${list[i].address}, ${list[i].wards == null?'':list[i].wards.name +', '+list[i].wards.provinceName}</td>
                    <td id="status-${list[i].id}"><span class="badge bg-${list[i].actived === true ? 'success' : 'danger'}">${list[i].actived === true ? 'Hoạt động' : 'Đã khóa'}</span></td>
                    <td>
                        ${list[i].userAuthorities.map(auth => auth.authority.name).includes("ROLE_DOAN_SINH") ? '<span class="badge bg-danger">Đoàn sinh</span>':''}
                        ${list[i].userAuthorities.map(auth => auth.authority.name).includes("ROLE_DOAN_TRUONG") ? '<span class="badge bg-success">Đoàn trưởng</span>':''}
                        ${list[i].userAuthorities.map(auth => auth.authority.name).includes("ROLE_LIEN_DOAN_TRUONG") ? '<span class="badge bg-success">Liên đoàn trưởng</span>':''}
                        ${list[i].userAuthorities.map(auth => auth.authority.name).includes("ROLE_DAO_TRUONG") ? '<span class="badge bg-success">Đạo trưởng</span>':''}
                        ${list[i].userAuthorities.map(auth => auth.authority.name).includes("ROLE_CHAU_TRUONG") ? '<span class="badge bg-success">Châu trưởng</span>':''}
                    </td>
                    <td class="text-end" onclick="event.stopPropagation()">
                        <a href="add-user.html?id=${list[i].id}" class="btn btn-sm btn-warning"><i class="fa fa-edit"></i></a>
                        <button onclick="deleteUser(${list[i].id})" class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button>
                    </td>
                </tr>`
        main +=  
        `</tr>
            <tr class="user-expand-row" id="expand-${list[i].id}">
            <td colspan="7">

            <div class="user-expand-content" id="content-${list[i].id}">

            <div class="user-info-grid">

            <div class="user-info-item">
            <label>Số điện thoại</label>
            <span>${list[i].phone || ''}</span>
            </div>

            <div class="user-info-item">
            <label>Ngày sinh</label>
            <span>${list[i].dob || ''}</span>
            </div>

            <div class="user-info-item">
            <label>Giới tính</label>
            <span>${list[i].gender || ''}</span>
            </div>

            <div class="user-info-item">
            <label>Nghề nghiệp</label>
            <span>${list[i].job || ''}</span>
            </div>

            <div class="user-info-item">
            <label>Tôn giáo</label>
            <span>${list[i].religion || ''}</span>
            </div>

            <div class="user-info-item">
            <label>Mã đoàn sinh</label>
            <span>${list[i].code || ''}</span>
            </div>

            <div class="user-info-item">
                <label>CCCD</label>
                <span>${list[i].idc || ''}</span>
            </div>

                <div class="user-info-item">
                    <label>Ngày tạo</label>
                    <span>${list[i].createdDate || ''}</span>
                </div>
                </div>
                <div class="operation-history-wrapper">
                    <h6 style="margin-bottom:10px;font-weight:600;">
                    <i class="fa fa-history"></i> Tiểu sử
                    </h6>
                    <table class="operation-table">
                        <thead>
                            <tr>
                            <th width="120">Ngày</th>
                            <th width="200">Hoạt động</th>
                            <th>Nội dung</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${(list[i].operationHistories || []).map(h => `
                            <tr>
                            <td class="operation-date text-center">
                            ${h.startDate || ''}
                            </td>
                            <td class="operation-title">
                            <i class="fa fa-circle operation-icon"></i>
                            ${h.title || ''}
                            </td>
                            <td>
                            ${h.content || ''}
                            </td>
                            </tr>
                        `).join('')}
                        </tbody>
                    </table>

                </div>
            </div>
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

function toggleUserDetail(id){

    var el = document.getElementById("content-"+id)

    if(el.classList.contains("active")){
        el.classList.remove("active")
    }
    else{

        document.querySelectorAll(".user-expand-content").forEach(e=>{
            e.classList.remove("active")
        })

        el.classList.add("active")
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

let ALL_ROLES = [];

let ALL_ORGANIZATIONS = [];

async function initData(){

    ALL_ROLES = await fetch("http://localhost:8080/api/authority/all/find-by-user", {
        method: "GET",
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    })
    .then(r=>r.json());

    ALL_ORGANIZATIONS = await fetch("http://localhost:8080/api/organizations/all/find-by-user", {
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
    const res = await fetch('http://localhost:8080/api/user/all/create-update', {
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
            window.location.replace('doanvien.html')
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
        document.getElementById("lichsuhoatdong").style.display = 'block'
        var url = `http://localhost:8080/api/user/all/${id}`;
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

        loadTieuSu();
    }
}

async function deleteUser(id) {
    // 1. Hiển thị thông báo xác nhận trước khi làm gì khác
    swal({
        title: "Bạn có chắc chắn muốn xóa đoàn viên này?",
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
            var url = 'http://localhost:8080/api/user/all/delete?id=' + id;
            
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + token
                    })
                });

                if (response.status < 300) {
                    swal("Đã xóa!", "Đoàn viên đã được xóa khỏi hệ thống.", "success");
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

function addRowTieuSu(){
    const tbody = document.getElementById("listtieusu");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td style="max-width: 10%;"><input readonly style="width: 50px;" class="form-control org-type"></td>
        <td style="max-width: 15%;"><input class="form-control org-type name"></td>
        <td style="max-width: 10%;"><input type="date" class="form-control org-type start"></td>
        <td style="max-width: 10%;"><input type="date" class="form-control org-type end"></td>
        <td style="max-width: 30%;"><textarea class="form-control org-type note"></textarea></td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="saveRow(this)">
                <i class="fa fa-check"></i>
            </button>
            <button class="btn btn-sm btn-danger">X</button>
        </td>
    `;

    tbody.appendChild(tr);
}

async function saveRow(btn){
    const tr = btn.closest("tr");

    const id = tr.querySelector(".org-type").value;
    const name = tr.querySelector(".name").value;
    const start = tr.querySelector(".start").value;
    const end = tr.querySelector(".end").value;
    const note = tr.querySelector(".note").value;

    console.log(name, start, end, note);
    var uls = new URL(document.URL)
    var idUser = uls.searchParams.get("id");
    var payload = {
        id:id,
        title:name,
        content:note,
        startDate:start,
        endDate:end,
        user:{id:idUser},
    }

    const response = await fetch('http://localhost:8080/api/OperationHistory/all/create', {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "thêm tiểu sử thành công!",
                type: "success"
            },
            function() {
                loadTieuSu();
            });
    }
    else{
        toastr.warning("Thất bại");
    }
}

async function loadTieuSu(){
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    const response = await fetch('http://localhost:8080/api/OperationHistory/all/find-by-user?userID='+id, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    }); 
    var list = await response.json();
    console.log(list);
    
    if(list.length == 0){return}
    var main = '';
    for(i=0; i< list.length; i++){
        main += 
        ` <tr>
            <td style="max-width: 10%;"><input readonly style="width: 50px;" class="form-control org-type" value="${list[i].id}"></td>
            <td style="max-width: 15%;"><input class="form-control org-type name" value="${list[i].title}"></td>
            <td style="max-width: 10%;"><input type="date" class="form-control org-type start" value="${list[i].startDate}"></td>
            <td style="max-width: 10%;"><input type="date" class="form-control org-type end" value="${list[i].endDate}"></td>
            <td style="max-width: 30%;"><textarea class="form-control org-type note">${list[i].content}</textarea></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="saveRow(this)">
                    <i class="fa fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTieuSu(${list[i].id})">X</button>
            </td>
        <tr>`
    }
    document.getElementById("listtieusu").innerHTML = main
}

async function deleteTieuSu(id) {
    swal({
        title: "Bạn có chắc muốn xóa tiểu sử này?", 
        text: "Sau khi xóa sẽ không thể khôi phục lại được!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Có, tôi muốn xóa!",
        cancelButtonText: "Không, giữ lại!",
        closeOnConfirm: false,
        closeOnCancel: true
    },
    async function(isConfirm){
        if (isConfirm) {
            const response = await fetch(`http://localhost:8080/api/OperationHistory/all/delete?id=${id}`, {
                method: 'DELETE',
                headers: new Headers({
                    'Authorization': 'Bearer ' + token
                })
            });
            if (response.status < 300) {
                swal("Đã xóa!", "Tiểu sử đã được xóa thành công.", "success");
                loadTieuSu();
            } else {
                swal("Lỗi!", "Xóa tiểu sử thất bại. Vui lòng thử lại.", "error");
            }
        }
    });
}