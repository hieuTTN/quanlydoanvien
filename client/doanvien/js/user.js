async function changePassword() {
    var token = localStorage.getItem("token");
    var oldpass = document.getElementById("oldpass").value
    var newpass = document.getElementById("newpass").value
    var renewpass = document.getElementById("renewpass").value
    var url = 'http://localhost:8080/api/user/all/change-password';
    if (newpass != renewpass) {
        swal("Lỗi", "Mật khẩu mới không trùng khớp", "error");
        return;
    }
    var passw = {
        "oldPass": oldpass,
        "newPass": newpass
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(passw)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "cập nhật mật khẩu thành công, hãy đăng nhập lại",
                type: "success"
            },
            function() {
            });
    }
    if (response.status == 417) {
        var result = await response.json()
        swal("Lỗi", result.defaultMessage, "error");
    }
}

async function loadInitInfor() {
    const response = await fetch(`http://localhost:8080/api/user/all/user-logged`, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    var result = await response.json();
    if(result.avatar != null && result.avatar != '') {
        document.getElementById('avatar').src = result.avatar;
    }
    document.getElementById('fullname').value = result.fullName;
    document.getElementById('phone').value = result.phone;
    document.getElementById('gender').value = result.gender;
    document.getElementById('address').value = result.address;
    document.getElementById('avatarUrl').value = result.avatar;
    document.getElementById('birthday').value = result.dob;
    document.getElementById('job').value = result.job;
    document.getElementById('religion').value = result.religion;
    if(result.wards != null) {
        document.getElementById('tinh').value = result.wards.provinceCode;
        $("#tinh").val(result.wards.provinceCode).change()
        await loadHuyenOnchange();
        document.getElementById('xa').value = result.wards.code;
        $("#xa").val(result.wards.code).change()
    }
}

async function updateInfor() {
    var user = {
        fullName: document.getElementById("fullname").value,
        phone: document.getElementById("phone").value,
        gender: document.getElementById("gender").value,
        dob: document.getElementById("birthday").value,
        address: document.getElementById("address").value,     
        avatar: document.getElementById("avatarUrl").value,
        job: document.getElementById("job").value,
        religion: document.getElementById("religion").value,
        wards: {
            code: document.getElementById("xa").value
        },
    }
    const res = await fetch('http://localhost:8080/api/user/all/update-infor', {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(user)
    });
    if (res.status < 300) {
        swal({
            title: "Thông báo",
            text: "cập nhật thông tin thành công!",
            type: "success"
        },
        function() {
            window.location.reload();
        });
    } 
    else if(res.status == 417){
        var result = await res.json();
        console.log(result);
        swal("Thông báo", result.defaultMessage || "Có lỗi xảy ra", "error");
    }
    else {
        var result = await res.json();
        console.log(result.defaultMessage);
        
        if(result && result.message){
            toastr.error(result.message);
        } 
        else if(result && result.defaultMessage){
            toastr.error(result.defaultMessage);
        }
        else {
            toastr.error("Cập nhật thông tin thất bại");
        }
    }

}