var token = localStorage.getItem("token");
var size = 10;
async function loadLogs(page) {
    var search = document.getElementById("search").value
    var logLevel = document.getElementById("logLevel").value == "" ? null : document.getElementById("logLevel").value;
    let dateRange = $('#dateRange').val();
    let from = null, to = null;

    if (dateRange) {
        let dates = dateRange.split(' - ');
        from = moment(dates[0], 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss');
        to = moment(dates[1], 'DD/MM/YYYY').endOf('day').format('YYYY-MM-DDTHH:mm:ss');
    }
    var url = 'http://localhost:8080/api/logs/admin/find-all?page=' + page + '&size=' + size + '&keyword=' + search;
    if (logLevel) {
        url += '&logLevel=' + logLevel;
    }
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
        document.getElementById("logTableBody").innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr>
                    <td>${list[i].createdDate}</td>
                    <td>${list[i].fullName}<br>${list[i].username}</td>
                    <td>${list[i].actionContent}</td>
                    <td><span class="badge bg-${list[i].logLevel === 'ERROR' ? 'danger' : list[i].logLevel === 'WARNING' ? 'warning' : 'info'}">${list[i].logLevel}</span></td>
                </tr>`
    }
    document.getElementById("logTableBody").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadLogs(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
}