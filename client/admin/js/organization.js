var token = localStorage.getItem("token");
var size = 10;
async function loadToChuc(page) {
    var search = document.getElementById("search").value
    var url = 'http://localhost:8080/api/organizations/all/find-all?page=' + page + '&size=' + size + '&name=' + search;
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
        document.getElementById("list-to-chuc").innerHTML = '<tr><td colspan="4" class="text-center">Không có dữ liệu</td></tr>';
        document.getElementById("pagination").innerHTML = '';
        return;
    }
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += ` <tr>
                    <td>${list[i].name}</td>
                    <td>${list[i].parentName == null?'Không có tổ chức cha':list[i].parentName}</td>
                    <td><i class="${list[i].typeIcon}"></i> ${list[i].typeDisplayName}</td>
                    <td>${list[i].path}<br>${list[i].breadcrumb}</td>
                    <td class="sticky-col">
                        <button onclick="deleteOrganization(${list[i].id})" class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></button>
                        <a href="add-tochuc.html?id=${list[i].id}" class="btn btn-sm btn-primary"><i class="fa fa-edit"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("list-to-chuc").innerHTML = main
    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadToChuc(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }
    document.getElementById("pagination").innerHTML = mainpage
}

function refresh() {
    document.getElementById("search").value = '';
    loadToChuc(0);
}

async function loadType() {
    var url = 'http://localhost:8080/api/organizations/all/types';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var list = await response.json();
    var main = '<option value="" selected disabled>Chọn loại hình tổ chức</option>';
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].code}" data-level="${list[i].level}">${list[i].displayName}</option>`
    }
    document.getElementById("type").innerHTML = main
}

async function saveToChuc() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var url = 'http://localhost:8080/api/organizations/admin/create';
    if (id != null) {
        url = 'http://localhost:8080/api/organizations/admin/update';
    }

    var payload = {
        "id": id,
        "name": document.getElementById("tentochuc").value,
        "type": document.getElementById("type").value,
        "parentId": document.getElementById("parentOrg").value,
    }

    const response = await fetch(url, {
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
                text: "thêm/sửa tổ chức thành công!",
                type: "success"
            },
            function() {
                window.location.replace('tochuc.html');
            });
    }
    else{
        var result = await response.json()
        log(result)
        toastr.warning(result.defaultMessage);
    }
}

var listOrg = []
async function loadParentOrg() {
    var url = 'http://localhost:8080/api/organizations/all/find-all-list';
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var list = await response.json();
    listOrg = list;
}

function renderParentOrg() {
    var typeSelect = document.getElementById("type");
    var selectedType = typeSelect.options[typeSelect.selectedIndex].getAttribute("data-level");
    var main = '<option value="">-- Chọn đơn vị quản lý trực tiếp --</option>';
    var count = 0;
    for (i = 0; i < listOrg.length; i++) {
        if (listOrg[i].typeLevel == Number(selectedType) -Number(1)) {
            ++count;
            main += `<option value="${listOrg[i].id}">${listOrg[i].name}</option>`
        }
    }
    if(count == 0){
        main = '<option value="">-- Không có đơn vị quản lý trực tiếp phù hợp --</option>';
    }
    document.getElementById("parentOrg").innerHTML = main;
}

async function loadAToChuc() {
    var id = window.location.search.split('=')[1];
    if (id != null) {
        var url = 'http://localhost:8080/api/organizations/all/find-by-id?id=' + id;
        const response = await fetch(url, {
            method: 'GET'
        });
        var result = await response.json();
        console.log(result);
        
        document.getElementById("tentochuc").value = result.name
        document.getElementById("type").value = result.type
        renderParentOrg();
        document.getElementById("parentOrg").value = result.parentId
    }
}

async function deleteOrganization(id) {
    var con = confirm("Xác nhận xóa tổ chức này?")
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/organizations/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa tổ chức thành công!");
        loadToChuc(0);
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}