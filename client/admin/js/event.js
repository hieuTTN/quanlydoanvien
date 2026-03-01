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
