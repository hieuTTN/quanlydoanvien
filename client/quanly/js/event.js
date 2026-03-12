var token = localStorage.getItem("token");
var size = 10;
async function loadEvents(page) {
    // var search = document.getElementById("search").value
    var payload = {
        // keyword: search,
    }
    
    var url = 'http://localhost:8080/api/events/all/get-by-param?page=' + page + '&size=' + size+'&search=';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        }),
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `
            <div class="col-lg-4 col-md-4 col-sm-12 col-12">
                <div class="single-blog-list">
                    <a href="chitietsukien.html?id=${list[i].id}">
                        <img src="${list[i].bannerUrl || '/image/default-avatar.jpg'}" class="img-blog-list" loading="lazy" decoding="async">
                    </a>
                    <a href="chitietsukien.html?id=${list[i].id}" class="title-blog-list">${list[i].name}</a>
                    <div class="d-flex">
                        <span class="item-sm-last-blog-index">
                            <i class="fa fa-calendar order1-item"></i>
                            <span>${list[i].startTime ? moment(list[i].startTime).format('DD/MM/YYYY HH:mm') : ''}</span>
                        </span>
                        <span class="item-sm-last-blog-index">
                            <i class="fa fa-eye"></i>
                            <span>${list[i].numView} lượt xem</span>
                            <span class="badge bg-primary" style="background-color: ${list[i].color} !important;">${list[i].statusName}</span>
                        </span>
                    </div>
                    <hr>
                    <span class="blog-description-list">${list[i].addressDetail}, ${list[i].wards?.name}, ${list[i].wards?.provinceName}</span>
                </div>
            </div>`
    }
    document.getElementById("event-list").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadEvents(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
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
        document.getElementById("ten-su-kien").innerText = result.name;
        document.getElementById("eventName").innerText = result.name;
        document.getElementById("eventTime").innerText = 'Bắt đầu: '+ (result.startTime ? moment(result.startTime).format('DD/MM/YYYY HH:mm') : '') + (result.endTime ? (' - Kết thúc: ' + moment(result.endTime).format('DD/MM/YYYY HH:mm')) : '') ;
        document.getElementById("eventLocation").innerText = result.addressDetail + ', ' + result.wards?.name + ', ' + result.wards?.provinceName;
        document.getElementById("eventDescription").innerHTML = result.description;
        document.getElementById("eventFee").innerText = result.fee ? (result.fee.toLocaleString('vi-VN') + ' VND') : 'Miễn phí';
        document.getElementById("eventSlot").innerText = result.maxParticipants - result.currentPeople;
        document.getElementById("eventOrganizer").innerText = result.organizer == null ? '' : result.organizer.name;
        document.getElementById("eventTarget").innerText = result.targetAudience;
        // document.getElementById("eventStatus").innerHTML = `<span class="badge bg-primary" style="background-color: ${result.color} !important;">${result.statusName}</span>`;
        document.getElementById("eventStatus").innerHTML = `<span class="event-detail-status badge bg-primary" style="background-color: ${result.color} !important;">${result.statusName}</span>`;
        document.getElementById("eventCountdown").innerText = result.registrationDeadline ? moment(result.registrationDeadline).format('DD/MM/YYYY HH:mm') +' - '+ moment(result.registrationDeadline).locale('vi').fromNow() : '';
        if(result.bannerUrl != null) {
            document.getElementById("eventBanner").style.backgroundImage = `url(${result.bannerUrl})`;
        }
        if(result.location != null){
            document.getElementById("google-map-section").innerHTML = result.location;
        }
    }
}

async function loadMyInfor() {
    const response = await fetch(`http://localhost:8080/api/user/all/user-logged`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    console.log(result);
    var authos = result.userAuthorities;
    var btnRegisDoan = '';
    for(i=0; i<authos.length; i++){
        if(authos[i].authority.name == "ROLE_DOAN_TRUONG"){
            btnRegisDoan += `<button onclick="regisFullEvent(${authos[i].organization.id},'${authos[i].organization.name}')" class="badge bg-primary btn ms-2">Đăng ký cho cả ${authos[i].organization.name}</button>`
        }
    }

    document.getElementById("regEmail").value = result.email;
    document.getElementById("regFullName").value = result.fullName;
    document.getElementById("regPhone").value = result.phone;
    document.getElementById("listbtngroup").innerHTML = btnRegisDoan;
}

async function checkRegis() {
    var id = window.location.search.split('=')[1];
    const response = await fetch(`http://localhost:8080/api/event-registration/all/check-regis?id=${id}`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("checkStatus").innerHTML = `
    <span class="badge" style="background-color: ${result.color}">
        ${result.message}
    </span>
`;
}

async function regisEvent() {
     swal.fire({
        title: "Bạn có chắc muốn đăng ký sự kiện này?", 
        text: "Sau khi đăng ký sẽ không thể hủy bỏ!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Có, tôi muốn đăng ký!",
        cancelButtonText: "Không, quay lại!",
        closeOnConfirm: false,
        closeOnCancel: true
    }, async function(isConfirm){
        if (isConfirm) {
            var id = window.location.search.split('=')[1];
            var payload = {
                email: document.getElementById("regEmail").value,
                fullName: document.getElementById("regFullName").value,
                phone: document.getElementById("regPhone").value,
                event:{id: id}
            }
            const response = await fetch(`http://localhost:8080/api/event-registration/all/create`, {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(payload)
            });
            if (response.status < 300) {
                swal("Thành công!", "Đăng ký sự kiện thành công!", "success");
                checkRegis();
            }
            else {
                if(response.status == 417){
                    var result = await response.json();
                    swal("Thất bại!", result.defaultMessage, "warning");
                }
                else{
                    swal("Thất bại!", "Đăng ký sự kiện thất bại!", "error");
                }
            }
        } 
        else {
            swal("Đã hủy", "Sự kiện của bạn vẫn an toàn :)", "warning");
        }
    });
}

async function regisFullEvent(idToChuc, name) {
    document.getElementById("idtochuc").value = idToChuc
    const result = await Swal.fire({
        title: "Đăng ký sự kiện",
        text: "Bạn muốn đăng ký sự kiện này cho tổ chức " + name + " như thế nào?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Đăng ký tất cả",
        denyButtonText: "Chọn thành viên",
        cancelButtonText: "Hủy",
        reverseButtons: true
    });

    if (result.isConfirmed) {
        createByAll(idToChuc);
    }

    else if (result.isDenied) {
        getAllUserToChuc(idToChuc);
    }

}

async function createByAll(idToChuc) {
    var id = window.location.search.split('=')[1];
    const response = await fetch(`http://localhost:8080/api/event-registration/manager/create?organizationId=${idToChuc}&eventId=${id}`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        }),
    });
    var result = await response.json();
    if (response.status < 300) {
        // đóng swal này
        swal.close();
        showResultModal(result);
    }
    else {
        if(response.status == 417){
            var result = await response.json();
            swal.fire("Thất bại!", result.defaultMessage, "warning");
        }
        else{
            swal.fire("Thất bại!", "Đăng ký sự kiện thất bại!", "error");
        }
    }
}

function showResultModal(data){

    document.getElementById("successCount").innerText = data.success;
    document.getElementById("failCount").innerText = data.fail;
    document.getElementById("totalCount").innerText = data.total;

    const failTable = document.getElementById("failUserTable");
    failTable.innerHTML = "";

    if(data.userFail && data.userFail.length > 0){

        document.getElementById("failSection").style.display = "block";

        data.userFail.forEach(u => {

            let avatar = u.avatar ? u.avatar : "/image/default-avatar.jpg";

            failTable.innerHTML += `
            <tr>
                <td>
                    <img src="${avatar}" 
                         class="rounded-circle"
                         width="40"
                         height="40">
                </td>

                <td class="fw-semibold">${u.fullName ?? ''}</td>

                <td class="text-muted">${u.email ?? ''}</td>

                <td>${u.phone ?? ''}</td>
            </tr>
            `;
        });

    }
    else{
        document.getElementById("failSection").style.display = "none";
    }

    let modal = new bootstrap.Modal(document.getElementById("resultModal"));
    modal.show();
}

async function getAllUserToChuc(idToChuc) {
    var search = document.getElementById("searchUser").value
    var gender = document.getElementById("gender").value
    var url = `http://localhost:8080/api/user/manager/filter-list?organizationId=${idToChuc}`;
    if(search != null && search != ''){
        url += `&keyword=${search}`
    }
    if(gender != null && gender != ''){
        url += `&gender=${gender}`
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        }),
    });
    var list = await response.json();
    renderUserList(list)
}

function renderUserList(list){

    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    list.forEach(u => {

        tbody.innerHTML += `
        <tr class="user-row">

            <td>
                <div class="form-check">
                    <input class="form-check-input user-checkbox"
                           type="checkbox"
                           value="${u.id}">
                </div>
            </td>

            <td>
                <img src="${u.avatar || '/image/default-avatar.jpg'}"
                     class="rounded-circle"
                     width="40">
            </td>

            <td class="fw-semibold">${u.fullName}</td>
            <td class="fw-semibold">${u.gender}</td>

            <td>${u.email || ""}</td>

            <td>${u.phone || ""}</td>

        </tr>
        `;
    });
    const modalEl = document.getElementById("userSelectModal");

    if (modalEl.classList.contains("show")) {
    } else {
        let modal = new bootstrap.Modal(document.getElementById("userSelectModal"));
        modal.show();
    }
    document.getElementById("checkAllUsers").addEventListener("change", function(){
        document.querySelectorAll(".user-checkbox").forEach(cb=>{
            cb.checked = this.checked;
        });
    });
}

async function createByChooseUser() {
    var id = window.location.search.split('=')[1];
    const ids = [];

    document.querySelectorAll(".user-checkbox:checked").forEach(cb => {
        ids.push(cb.value);
    });
    if(ids.length == 0){
        swal.fire("Thông báo!", "Bạn phải chọn ít nhất 1 đoàn viên", "error");
        return;
    }
    const response = await fetch(`http://localhost:8080/api/event-registration/manager/create-by-list-user?eventId=${id}`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(ids)
    });
    var result = await response.json();
    if (response.status < 300) {
        const modalEl = document.getElementById("userSelectModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        showResultModal(result);
    }
    else {
        if(response.status == 417){
            var result = await response.json();
            swal.fire("Thất bại!", result.defaultMessage, "warning");
        }
        else{
            swal.fire("Thất bại!", "Đăng ký sự kiện thất bại!", "error");
        }
    }
}