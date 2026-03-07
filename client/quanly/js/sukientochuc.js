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

async function loadStatus() {
    try {
        const response = await fetch('http://localhost:8080/api/events/all/statuses', {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
        const list = await response.json();
        
        let optionsHtml = '<option value="">-- Chọn trang thái --</option>';
        list.forEach(item => {
            optionsHtml += `<option value="${item.name}" data-description="${item.name}" data-color="${item.color}">${item.displayName}</option>`;
        });
        document.getElementById("status").innerHTML = optionsHtml;
        $('#status').select2({
            theme: "bootstrap-5",
            width: '100%', 
            templateResult: formatStatus,
            templateSelection: (data) => data.text 
        });
    } catch (error) {
        console.error("Lỗi tải status:", error);
    }
}

function formatStatus(state) {
    if (!state.id) return state.text;
    
    // Lấy mô tả từ data-attribute
    var desc = $(state.element).data('description');
    var color = $(state.element).data('color');
    
    // Trả về HTML tùy chỉnh
    var $state = $(
        `<span>
            <div style="font-weight: bold; color: ${color}">${state.text}</div>
            <div style="font-size: 0.85em; color: #6c757d; font-style: italic;">${desc}</div>
        </span>`
    );
    return $state;
}


var size = 10;
async function loadEvents(page) {
    var search = document.getElementById("search").value
    var organizer = document.getElementById("organization").value
    var status = document.getElementById("status").value == "" ? null : document.getElementById("status").value;
    
    var url = 'http://localhost:8080/api/events/all/get-by-param-and-organizer?page=' + page + '&size=' + size+'&organizer='+organizer
    if(search && search != ""){
        url += '&search='+search
    }
    if(status && status != ""){
        url += '&status='+status
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        })
    });
    var result = await response.json();
    var list = result.content;
    var totalPage = result.totalPages;
    if(list.length == 0){
        document.getElementById("list-event").innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr> 
                    <td><img src="${list[i].bannerUrl || '/image/default-avatar.jpg'}" width="100"></td>
                    <td>${list[i].name}</td>
                    <td>${list[i].organizer == null ? 'Chưa có đơn vị tổ chức' : list[i].organizer.name}</td>
                    <td>
                        ${list[i].startTime ? moment(list[i].startTime).format('DD/MM/YYYY HH:mm') : ''}<br>
                        ${list[i].endTime ? moment(list[i].endTime).format('DD/MM/YYYY HH:mm') : ''}
                    </td>
                    <td>${list[i].registrationDeadline ? moment(list[i].registrationDeadline).format('DD/MM/YYYY HH:mm') : ''}</td>
                    <td>${list[i].addressDetail}, ${list[i].wards.name}, ${list[i].wards.provinceName}</td>
                    <td>${list[i].maxParticipants}</td>
                    <td>${list[i].fee == 0 ? 'Miễn phí' : formatmoney(list[i].fee)}</td>
                    <td><span class="badge" style="background-color: ${list[i].color}; color: #fff;">${list[i].statusName}</span></td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="add-sukien.html?id=${list[i].id}" class="btn btn-sm btn-warning"><i class="fa fa-edit"></i></a>
                            <button onclick="deleteEvent(${list[i].id})" class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button>
                        </div>
                        <div class="d-flex gap-1" style="margin-top: 5px;">
                            <button onclick="loadDetailEvent(${list[i].id})" data-bs-toggle="modal" data-bs-target="#eventDetailModal" class="btn btn-sm btn-info text-white"><i class="fa fa-eye"></i></button>
                            <button onclick="showThanhVien(0,${list[i].id}, '${list[i].name}')" data-bs-toggle="modal" data-bs-target="#staticBackdrop" class="btn btn-sm btn-primary text-white"><i class="fa fa-users"></i></button>
                        </div>
                    </td>
                </tr>`
    }
    document.getElementById("list-event").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadEvents(${(Number(i) - 1)})" class="page-item ${i== Number(page) + 1?'active':''}"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
}

function formatmoney(money) {
    const VND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
    return VND.format(money);
}


async function loadStatusAdd() {
    try {
        const response = await fetch('http://localhost:8080/api/events/all/statuses', {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    const list = await response.json();
    const container = document.getElementById("statusContainer");
    container.innerHTML = "";

    list.forEach((status, index) => {
        const btn = document.createElement("div");
        btn.className = "status-btn";
        btn.id = `status-${status.name}`;
        btn.innerText = status.displayName;

        // animation delay nhẹ
        btn.style.animation = `popIn 0.3s ease forwards`;
        btn.style.animationDelay = `${index * 0.05}s`;

        btn.addEventListener("click", () => {
            document.querySelectorAll(".status-btn").forEach(b => {
                b.classList.remove("active");
                b.style.background = "#f8f9fa";
                b.style.borderColor = "transparent";
                b.style.color = "#000";
            });

            btn.classList.add("active");
            btn.style.background = status.color;
            btn.style.borderColor = status.color;
            btn.style.color = "#fff";

            var selectedStatus = status.name;
            document.getElementById("status").value = selectedStatus;
            console.log("Đã chọn:", selectedStatus);
        });

        container.appendChild(btn);
    });
    
    } catch (error) {
        console.error("Lỗi tải status:", error);
    }
}

async function loadOrganizations() {
    try {
        const response = await fetch('http://localhost:8080/api/organizations/all/find-by-user', {
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

async function saveEvent() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = id == null ? 'http://localhost:8080/api/events/manager/create' : `http://localhost:8080/api/events/manager/update/${id}`;
    let dateRange = $('#dateRange').val();
    let from = null, to = null;

    if (dateRange) {
        let dates = dateRange.split(' - ');

        from = moment(dates[0], 'DD/MM/YYYY HH:mm')
            .format('YYYY-MM-DDTHH:mm:ss');

        to = moment(dates[1], 'DD/MM/YYYY HH:mm')
            .format('YYYY-MM-DDTHH:mm:ss');
    }
    var payload = {
        name: document.getElementById("name").value,
        description: tinyMCE.get('editor').getContent(),
        startTime: from,
        endTime: to,
        registrationDeadline: document.getElementById("endDate").value,
        location: document.getElementById("linkmap").value,
        maxParticipants: document.getElementById("maxParticipants").value,
        fee: document.getElementById("fee").value,     
        attachmentUrl: document.getElementById("attachmentUrl").value,     
        bannerUrl: document.getElementById("avatar").value,
        organizerId: document.getElementById("organizations").value,
        addressDetail: document.getElementById("stressName").value,
        status: document.getElementById("status").value,
        wards: {
            code: document.getElementById("xa").value
        },
    }
    console.log(payload);
    
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    if (res.status < 300) {
        swal({
            title: "Thông báo",
            text: "thêm/sửa sự kiện thành công!",
            type: "success"
        },
        function() {
            window.location.replace('sukientochuc.html?organization='+payload.organizerId)
        });
    } 
    else if(res.status == 417){
        var result = await res.json();
    }
    else {
        var result = await res.json();
        console.log(result);
        
        if(result && result.message){
            toastr.error(result.message);
        } 
        else if(result && result.defaultMessage){
            toastr.error(result.defaultMessage);
        }
        else {
            toastr.error("Tạo sự kiện thất bại");
        }
    }

}

async function loadAEvent() {
    var id = window.location.search.split('=')[1];
    if (id != null) {
        var url = `http://localhost:8080/api/events/all/find-by-id?id=${id}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        
        document.getElementById("name").value = result.name
        tinyMCE.get('editor').setContent(result.description || '');
        const picker = $('#dateRange').data('daterangepicker');

        if (result.startTime && result.endTime) {

            const start = moment(result.startTime);
            const end = moment(result.endTime);

            picker.setStartDate(start);
            picker.setEndDate(end);

            // 🔥 CÁI NÀY QUAN TRỌNG
            $('#dateRange').val(
                start.format('DD/MM/YYYY HH:mm') +
                ' - ' +
                end.format('DD/MM/YYYY HH:mm')
            );
        }
        document.getElementById("endDate").value = result.registrationDeadline ? moment(result.registrationDeadline).format('YYYY-MM-DDTHH:mm') : '';
        document.getElementById("linkmap").value = result.location || '';
        document.getElementById("maxParticipants").value = result.maxParticipants || '';
        document.getElementById("fee").value = result.fee || 0;
        document.getElementById("attachmentUrl").value = result.attachmentUrl || '';
        document.getElementById("avatar").value = result.bannerUrl || '';
        document.getElementById("stressName").value = result.addressDetail || '';
        if(result.organizer){
            $("#organizations").val(result.organizer.id).trigger('change');
        }

        if(result.status){
            document.getElementById("status").value = result.status;
            document.getElementById(`status-${result.status}`).click();
        }
        if(result.bannerUrl){
            document.getElementById("btnchoosefile").style.backgroundImage = `url('${result.bannerUrl}')`;
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
    }
}

async function loadDetailEvent(id) {
    var url = `http://localhost:8080/api/events/all/find-by-id?id=${id}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var event = await response.json();
    document.getElementById("eventName").innerText = event.name;
    // Status badge
    const statusBadge = document.getElementById("eventStatus");
    statusBadge.innerText = event.statusName;
    statusBadge.style.backgroundColor = event.color;

    document.getElementById("eventStart").innerText =
        formatDateTime(event.startTime);

    document.getElementById("eventEnd").innerText =
        formatDateTime(event.endTime);

    document.getElementById("eventDeadline").innerText =
        formatDateTime(event.registrationDeadline);

    document.getElementById("eventLocation").innerHTML =
        event.location || "";

    document.getElementById("eventAddressDetail").innerText =
        event.addressDetail || "";

    document.getElementById("eventOrganizer").innerText =
        event.organizer?.name || "";

    document.getElementById("eventTarget").innerText =
        event.targetAudience || "";

    document.getElementById("eventMax").innerText =
        event.maxParticipants || "Không giới hạn";

    document.getElementById("eventFee").innerText =
        event.fee ? event.fee.toLocaleString() + " VNĐ" : "Miễn phí";

    document.getElementById("eventCreatedBy").innerText =
        event.createdBy?.fullName || "";

    document.getElementById("eventWard").innerText =
        event.wards?.name + ", " + event.wards?.provinceName || "";

    document.getElementById("eventDescription").innerHTML =
        event.description || "";

    // Banner
    document.getElementById("eventBanner").src =
        event.bannerUrl || "/images/no-image.png";

    // Attachment
    const attachmentBtn = document.getElementById("eventAttachment");
    if (event.attachmentUrl) {
        attachmentBtn.href = event.attachmentUrl;
        attachmentBtn.style.display = "inline-block";
    } else {
        attachmentBtn.style.display = "none";
    }

    // Update history table
    const tbody = document.getElementById("eventUpdateTableBody");
    tbody.innerHTML = "";

    event.eventUpdateByList.forEach((update, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${update.user?.fullName || ""}</td>
                <td>${formatDateTime(update.createdDate)}</td>
                <td>${update.content || ""}</td>
            </tr>
        `;
    });

}


function formatDateTime(dateTime) {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString("vi-VN");
}

async function deleteEvent(id) {
    swal({
        title: "Bạn có chắc muốn xóa sự kiện này?", 
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
            const response = await fetch(`http://localhost:8080/api/events/manager/delete?id=${id}`, {
                method: 'DELETE',
                headers: new Headers({
                    'Authorization': 'Bearer ' + token
                })
            });
            if (response.status < 300) {
                swal("Đã xóa!", "Sự kiện đã được xóa thành công.", "success");
                loadEvents(0);
            } else {
                swal("Lỗi!", "Xóa sự kiện thất bại. Vui lòng thử lại.", "error");
            }
        }
    });
}

async function showThanhVien(page,id, name) {
    document.getElementById("tensukien").innerHTML = name
    // var search = document.getElementById("").value
    // var status = document.getElementById("").value
    var url = `http://localhost:8080/api/event-registration/manager-admin/regis-by-event?page=${page}&size=10&eventId=${id}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    console.log(result);
    
    var list = result.content;
    var totalPage = result.totalPages;
    if(list.length == 0){
        document.getElementById("list-member").innerHTML = '<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination-member").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td>${list[i].id}</td>
                    <td>
                        <div class="fw-bold">${list[i].fullName ? list[i].fullName: list[i].user.fullName}</div>
                        <small class="text-muted">${list[i].email ? list[i].email: list[i].user.email}</small><br>
                        <small class="text-muted">${list[i].phone ? list[i].phone: list[i].user.phone}</small>
                    </td>
                    <td><a href="chitietsukien.html?id=${list[i].event.id}" target="_blank" class="text-truncate d-inline-block" style="max-width: 150px;">${list[i].event.name}</span></td>
                    <td>${list[i].registrationTime}</td>
                    <td>
                        ${list[i].status.name != "REJECTED"
                            ? `<span class="badge ${list[i].status.colorClass}">
                                <i class="${list[i].status.icon}"></i> ${list[i].status.displayName}
                            </span>`
                            : `
                            <div class="dropdown">
                                <span class="badge ${list[i].status.colorClass} dropdown-toggle" 
                                    data-bs-toggle="dropdown" style="cursor:pointer">
                                    <i class="${list[i].status.icon}"></i> ${list[i].status.displayName}
                                </span>
                                <ul class="dropdown-menu">
                                    <li class="dropdown-item text-danger">
                                        <strong>Lý do:</strong><br>
                                        ${list[i].rejectReason || 'Không có'}
                                    </li>
                                </ul>
                            </div>
                        `}
                    </td>
                    <td>
                    ${list[i].status.name != "APPROVED"?'':`<input type="checkbox" ${list[i].attended == true?'checked':''} onchange="confirmThamGia(${list[i].id})">`}
                    </td>
                    <td>
                        ${list[i].status.name == "PENDING"?
                        `<button onclick="changeStatus(${list[i].id}, 'REJECTED',${id}, ${page}, '${name}')" class="btn btn-sm btn-danger" title="Từ chối">Từ chối</button>
                        <button onclick="changeStatus(${list[i].id}, 'APPROVED',${id}, ${page}, '${name}')" class="btn btn-sm btn-primary" title="Duyệt">Duyệt</button>
                        `:''}
                        ${list[i].status.name == "APPROVED"?
                        `<button onclick="changeStatus(${list[i].id}, 'REJECTED',${id}, ${page}, '${name}')" class="btn btn-sm btn-danger" title="Từ chối">Từ chối</button>
                        <button onclick="changeStatus(${list[i].id}, 'PENDING',${id}, ${page}, '${name}')" class="btn btn-sm btn-secondary" title="Duyệt">Hủy duyệt</button>
                        `:''}
                        ${list[i].status.name == "REJECTED"?
                        `<button onclick="changeStatus(${list[i].id}, 'APPROVED',${id}, ${page}, '${name}')" class="btn btn-sm btn-primary" title="Duyệt">Duyệt lại</button>
                        `:''}
                        <button onclick="writeDanhGia(${list[i].id},${id}, ${page}, '${name}')"" class="btn btn-sm btn-warning"><i class="fa fa-edit"></i></button>
                    </td>
                </tr>`
    }
    document.getElementById("list-member").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="showThanhVien(${(Number(i) - 1)}, ${id}, '${name}')" class="page-item ${i==Number(page)+1?'active':''}"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination-member").innerHTML = mainpage
    
    loadStatistic(id);
}

async function loadStatistic(eventId){
    var url = `http://localhost:8080/api/event-registration/manager-admin/statistic?eventId=${eventId}`;
    const response = await fetch(url,{
        headers:{
            'Authorization':'Bearer ' + token
        }
    });
    var result = await response.json();
     let total = 0;
    for(let key in result){
        total += result[key];
    }

    let html = `
    <div class="row g-3">

        <div class="col-md-2">
            <div class="card shadow border-0 text-center p-3">
                <i class="fas fa-users fa-2x text-primary mb-2"></i>
                <div class="text-muted">Tổng đăng ký</div>
                <h3 class="fw-bold text-primary">${total}</h3>
            </div>
        </div>

        <div class="col-md-2">
            <div class="card shadow border-0 text-center p-3 bg-warning bg-opacity-10">
                <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                <div>Chờ duyệt</div>
                <h3 class="fw-bold text-warning">${result.PENDING || 0}</h3>
            </div>
        </div>

        <div class="col-md-2">
            <div class="card shadow border-0 text-center p-3 bg-success bg-opacity-10">
                <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                <div>Đã duyệt</div>
                <h3 class="fw-bold text-success">${result.APPROVED || 0}</h3>
            </div>
        </div>

        <div class="col-md-2">
            <div class="card shadow border-0 text-center p-3 bg-danger bg-opacity-10">
                <i class="fas fa-times-circle fa-2x text-danger mb-2"></i>
                <div>Từ chối</div>
                <h3 class="fw-bold text-danger">${result.REJECTED || 0}</h3>
            </div>
        </div>

        <div class="col-md-2">
            <div class="card shadow border-0 text-center p-3 bg-secondary bg-opacity-10">
                <i class="fas fa-pause-circle fa-2x text-secondary mb-2"></i>
                <div>Danh sách chờ</div>
                <h3 class="fw-bold text-secondary">${result.WAITLIST || 0}</h3>
            </div>
        </div>

        <div class="col-md-2">
            <div class="card shadow border-0 text-center p-3 bg-dark bg-opacity-10">
                <i class="fas fa-ban fa-2x text-dark mb-2"></i>
                <div>Đã hủy</div>
                <h3 class="fw-bold text-dark">${result.CANCEL || 0}</h3>
            </div>
        </div>

    </div>
    `;

    document.getElementById("event-statistic").innerHTML = html;
}

async function changeStatus(id, status, idevent, page, name) {
    if(status == 'REJECTED'){
        Swal.fire({
            target: '#staticBackdrop',
            title: 'Nhập lý do từ chối',
            input: 'textarea',
            inputPlaceholder: 'Nhập lý do...',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => {
                if (!value) {
                    return 'Bạn phải nhập lý do!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                actionUpdateStatus(id, status, result.value,idevent, page, name)
            }
        });
    }
    else{
        actionUpdateStatus(id, status, "",idevent, page, name)
    }

}

async function actionUpdateStatus(id, status, rejectReason, idevent, page, name) {
    
     var payload = {
        "id": id,
        "status": status,
        "rejectReason": rejectReason,
    }
    
    const response = await fetch(`http://localhost:8080/api/event-registration/manager-admin/update-status`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    if (response.status < 300) {
        Swal.fire('Thành công!', 'Đã cập nhật trạng thái', 'success')
        showThanhVien(page, idevent, name)
    }
    else if (response.status == 417) {
        var result = await response.json()
        Swal.fire('Thất bại!', result.defaultMessage, 'warning')
    }
    else{
        Swal.fire('Thất bại!', "Có lỗi xảy ra khi update", 'error')
    }
}

async function confirmThamGia(id) {
    const response = await fetch(`http://localhost:8080/api/event-registration/manager-admin/confirm?id=${id}`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        }),
    });
    if (response.status < 300) {
        Swal.fire('Thành công!', 'Đã xác nhận tham gia', 'success')
    }
    else if (response.status == 417) {
        var result = await response.json()
        Swal.fire('Thất bại!', result.defaultMessage, 'warning')
    }
    else{
        Swal.fire('Thất bại!', "Có lỗi xảy ra khi update", 'error')
    }
}

async function writeDanhGia(id, idevent, page, name) {
    Swal.fire({
        target: '#staticBackdrop',
        title: 'Viết đánh giá',
        input: 'textarea',
        inputPlaceholder: 'Nhập đánh giá...',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        inputValidator: (value) => {
            if (!value) {
                return 'Bạn phải nhập đánh giá!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            actionDanhGia(id, result.value,idevent, page, name)
        }
    });
}

async function actionDanhGia(id, rate, idevent, page, name) {
     var payload = {
        "id": id,
        "rate": rate,
    }
    const response = await fetch(`http://localhost:8080/api/event-registration/manager-admin/rate`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    if (response.status < 300) {
        Swal.fire('Thành công!', 'Đã cập nhật đánh giá', 'success')
        showThanhVien(page, idevent, name)
    }
    else if (response.status == 417) {
        var result = await response.json()
        Swal.fire('Thất bại!', result.defaultMessage, 'warning')
    }
    else{
        Swal.fire('Thất bại!', "Có lỗi xảy ra khi update", 'error')
    }
}