async function thongke() {
    var url = 'http://localhost:8080/api/statistic/admin/thongke';
    const response = await fetch(url, {
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    document.getElementById("totalUsers").innerHTML = result.tongDoanVien
    document.getElementById("totalUnits").innerHTML = result.tongDonVi
    document.getElementById("totalEvents").innerHTML = result.tongSuKien
    document.getElementById("totalRegistrations").innerHTML = result.tongDangKy

    var suKienMoiNhat = result.suKienMoiNhat;
    var main = ``
    for(var i = 0; i < suKienMoiNhat.length; i++){
        main += `
        <tr>
            <td>${suKienMoiNhat[i].name}</td>
            <td>${suKienMoiNhat[i].startTime}</td>
            <td><span class="badge bg-success">${suKienMoiNhat[i].statusName}</span></td>
        </tr>`
    }
    document.getElementById("recentEventsTable").innerHTML = main;

    var dangKySuKienMoiNhat = result.dangKySuKienMoiNhat;
    console.log(dangKySuKienMoiNhat);
    
    var main = ``
    for(var i = 0; i < dangKySuKienMoiNhat.length; i++){
        main += `
        <tr>
            <td>${dangKySuKienMoiNhat[i].fullName}<br>${dangKySuKienMoiNhat[i].email}</td>
            <td>${dangKySuKienMoiNhat[i].event.name}</td>
            <td><span class="badge bg-success">${dangKySuKienMoiNhat[i].registrationTime}</span></td>
        </tr>`
    }
    document.getElementById("recentRegistrationsTable").innerHTML = main;
    if(dangKySuKienMoiNhat.length == 0){
        document.getElementById("recentRegistrationsTable").innerHTML = `<tr><td colspan="3" class="text-center">Không có đăng ký mới</td></tr>`;
    }

    var eventRegistrationCount = result.eventRegistrationCount;
    if(eventRegistrationCount == null || (eventRegistrationCount.daDuyet == 0 && eventRegistrationCount.dangCho == 0 && eventRegistrationCount.tuChoi == 0)){
        document.getElementById('noti-regis').style.display = 'block';
    }
    else{
        new Chart(document.getElementById('registrationChart'), {
        type: 'doughnut',
        data: {
            labels: ['Đã duyệt','Đang chờ','Từ chối'],
            datasets: [{
                data: [eventRegistrationCount.daDuyet, eventRegistrationCount.dangCho, eventRegistrationCount.tuChoi],
                backgroundColor: ['#198754','#ffc107','#dc3545']
            }]
        }
    });
    }
}

async function thongKeSuKienThang() {
    var nam = document.getElementById("select-event-year").value;
    var url = 'http://localhost:8080/api/statistic/admin/su-kien-thang?year=' + nam;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();
    

    var lb = 'số sự kiện năm ' + nam;
    document.getElementById("bieudo").innerHTML = `<canvas id="chart-event"></canvas>`
    const ctx = document.getElementById("chart-event").getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["tháng 1", "tháng 2", "tháng 3", "tháng 4",
                "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
            ],
            datasets: [{
                label: lb,
                backgroundColor: 'rgba(161, 198, 247, 1)',
                borderColor: 'rgb(47, 128, 237)',
                data: list.map(item => item.value),
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                }]
            }
        },
    });
}

async function thongKeDoanVienMoi() {
    var nam = document.getElementById("select-user-year").value;
    var url = 'http://localhost:8080/api/statistic/admin/doan-vien-moi?year=' + nam;
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var list = await response.json();

    var lb = 'số đoàn viên mới năm ' + nam;
    document.getElementById("bieudo-user").innerHTML = `<canvas id="chart-user"></canvas>`
    const ctx = document.getElementById("chart-user").getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["tháng 1", "tháng 2", "tháng 3", "tháng 4",
                "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
            ],
            datasets: [{
                label: lb,
                backgroundColor: 'rgba(161, 198, 247, 1)',
                borderColor: 'rgb(47, 128, 237)',
                data: list.map(item => item.value),
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                }]
            }
        },
    });
}