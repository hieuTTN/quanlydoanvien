var token = localStorage.getItem("token");
var size = 10;
async function loadLogs(page) {
    let dateRange = $('#dateRange').val();
    let from = null, to = null;

    if (dateRange) {
        let dates = dateRange.split(' - ');
        from = moment(dates[0], 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss');
        to = moment(dates[1], 'DD/MM/YYYY').endOf('day').format('YYYY-MM-DDTHH:mm:ss');
    }
    var url = 'http://localhost:8080/api/logs/all/find-all?page=' + page + '&size=' + size;
    if (from && to) {
        url += '&from=' + from + '&to=' + to;
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
        document.getElementById("list-log").innerHTML = '<li class="list-group-item text-center">Không có dữ liệu</li>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<li class="list-group-item card shadow rounded-4 mt-3" style="background-color: ${setBackGroundColorByLevel(list[i].logLevel)};">
                    <div class="fw-semibold">
                        ${list[i].actionContent}
                    </div>
                    <small class="text-muted">
                        ${list[i].createdDate} - ${list[i].username} 
                    </small>
                </li>`
    }
    document.getElementById("list-log").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadLogs(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
}

function setBackGroundColorByLevel(level) {
    switch (level) {
        case 'INFO':
            return '#dbeafe';   // xanh dương nhạt
        case 'WARNING':
            return '#fef3c7';   // vàng nhạt
        case 'ERROR':
            return '#fee2e2';   // đỏ nhạt
        default:
            return '#f8f9fa';   // xám rất nhạt
    }
}