var list = []

async function loadAddress() {
    var urladd = 'http://localhost:8080/api/address/public/province';
    const response = await fetch(urladd, {
        method: 'GET'
    });
    list = await response.json();
    var main = '<option value="0" disabled selected>Chọn tỉnh</option>'
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].code}" data-name="${list[i].name}">${list[i].name}</option>`
    }
    document.getElementById("tinh").innerHTML = main
    $('#tinh').select2({
        theme: "bootstrap-5",
        width: '100%', 
        templateSelection: (data) => data.text 
    });
}

async function loadHuyenOnchange() {
    var tinh = document.getElementById("tinh").value;
    var urladd = `http://localhost:8080/api/address/public/wards-by-province?id=${tinh}`;
    const response = await fetch(urladd, {
        method: 'GET'
    });
    list = await response.json();
    var main = ''
    for (i = 0; i < list.length; i++) {
        main += `<option value="${list[i].code}" data-name="${list[i].name}">${list[i].name}</option>`
    }
    document.getElementById("xa").innerHTML = main
    $('#xa').select2({
        theme: "bootstrap-5",
        width: '100%', 
        templateSelection: (data) => data.text 
    });
}