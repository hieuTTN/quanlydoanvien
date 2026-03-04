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
    document.getElementById("regEmail").value = result.email;
    document.getElementById("regFullName").value = result.fullName;
    document.getElementById("regPhone").value = result.phone;
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
     swal({
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