var token = localStorage.getItem("token");
var size = 10;
async function loadEvents(page) {
    var search = document.getElementById("search").value
    var status = document.getElementById("status").value == "" ? null : document.getElementById("status").value;
    let dateRange = $('#dateRange').val();
    let from = null, to = null;

    if (dateRange) {
        let dates = dateRange.split(' - ');
        from = moment(dates[0], 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss');
        to = moment(dates[1], 'DD/MM/YYYY').endOf('day').format('YYYY-MM-DDTHH:mm:ss');
    }
    var payload = {
        keyword: search,
        status: status,
        startFrom: from,
        startTo: to,
        organizerId: document.getElementById("organizations").value == "" ? null : document.getElementById("organizations").value,
    }
    var url = 'http://localhost:8080/api/events/all/search?page=' + page + '&size=' + size;
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;
    if(list.length == 0){
        document.getElementById("logTableBody").innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr> 
                    <td><img src="${list[i].bannerUrl || '/image/default-avatar.jpg'}" class="rounded-circle" width="35"></td>
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
                        <button onclick="loadUserDetail(${list[i].id})" data-bs-toggle="modal" data-bs-target="#userDetailModal" class="btn btn-sm btn-info text-white"><i class="bi bi-eye"></i></button>
                        <a href="add-sukien.html?id=${list[i].id}" class="btn btn-sm btn-warning"><i class="bi bi-pencil"></i></a>
                        <button onclick="deleteUser(${list[i].id})" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`
    }
    document.getElementById("list-event").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadEvents(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
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


async function loadStatusAdd() {
    try {
        const response = await fetch('http://localhost:8080/api/events/all/statuses', {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    const list = await response.json();
    console.log(list);
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


async function saveEvent() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = id == null ? 'http://localhost:8080/api/events/admin/create' : `http://localhost:8080/api/events/admin/update/${id}`;
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
            window.location.replace('sukien.html')
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