var token = localStorage.getItem("token");
var size = 10;
async function loadEventRegis(page) {
    var search = document.getElementById("search").value;
    var status = document.getElementById("statusFilter").value;
    var url = 'http://localhost:8080/api/event-registration/all/my-regis?page=' + page + '&size=' + size;
    if (search) {
        url += '&search=' + search;
    }
    if (status != "") {
        url += '&status=' + status;
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
        document.getElementById("list-event-regis").innerHTML = '<tr><td colspan="5" class="text-center">Không có sự kiện nào</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td><a href="chitietsukien.html?id=${list[i].event.id}">${list[i].event.name}</a></td>
                    <td>${moment(list[i].event.registrationDeadline).format('HH:mm YYYY-MM-DD')}</td>
                    <td>
                        <span class="badge" style="background-color: ${setBackGroundColorByStatus(list[i].status)}">
                            ${list[i].status}
                        </span>
                    </td>
                    <td>
                        ${list[i].event.organizer ? list[i].event.organizer.name : 'Không có'}
                    </td>
                    <td>
                        ${list[i].status === 'PENDING' ? `<button class="btn btn-danger btn-sm" onclick="cancelRegis(${list[i].id})">Hủy</button>` : ''}
                    </td>
                </tr>`
    }
    document.getElementById("list-event-regis").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadEventRegis(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
}

async function cancelRegis(id) {
    swal({
        title: "Bạn có chắc muốn hủy đăng ký sự kiện này?", 
        text: "Sau khi hủy sẽ không thể khôi phục lại được!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Có, tôi muốn hủy!",
        cancelButtonText: "Không, giữ lại!",
        closeOnConfirm: false,
        closeOnCancel: true
    },
    async function(isConfirm){
        if (isConfirm) {
            const response = await fetch(`http://localhost:8080/api/event-registration/all/cancel?id=${id}`, {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + token
                })
            });
            if (response.status < 300) {
                swal("Đã hủy!", "Đăng ký sự kiện đã được hủy thành công.", "success");
                loadEventRegis(0);
            } else {
                swal("Lỗi!", "Hủy đăng ký sự kiện thất bại. Vui lòng thử lại.", "error");
            }
        }
    });
}

function setBackGroundColorByStatus(status) {
    switch (status) {
        case 'APPROVED':
            return '#337d51';   // xanh lá
        case 'PENDING':
            return '#ffc107';   // vàng nhạt
        case 'REJECTED':
            return '#dc3545';   // đỏ nhạt
        case 'CANCEL':
            return '#6c757d';   // xám nhạt
        default:
            return '#f8f9fa';   // xám rất nhạt
    }
}