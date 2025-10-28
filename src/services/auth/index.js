import request from "@/services/request";

export async function login(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request("/api/user/login", {
        method: "POST",
        data: formData,
    });
}

export async function register(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });
    console.log(formData)
    return request('/api/user/register', {
        method: "POST",
        data: formData,
    });
}

export async function resetPassword(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/reset-password', {
        method: "POST",
        data: formData,
    });
}

export async function resetPasswordByToken(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/reset-password-token', {
        method: "POST",
        data: formData,
    });
}

export async function redeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/redeem-code', {
        method: "POST",
        data: formData,
    });
}

export async function verify() {    
    return request('/api/user/verify-token', {
        method: "GET",
    });
}

export async function verifyCode(params) {
    return request('/api/user/verify-register-code', {
        method: "GET",
        params,
    });
}

export async function verifyRedeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/redeem-new', {
        method: "POST",
        data: formData,
    });
}

export async function sendEducationCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/bind-edu-email', {
        method: "POST",
        data: formData,
    });
}

export async function verifyEducationCode(params) {
    return request('/api/user/verify-edu-code', {
        method: "GET",
        params,
    });
}

export async function sendForgotPasswordCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/forgot-password', {
        method: "POST",
        data: formData,
    });
}

export async function verifyForgotPasswordCode(params) {
    return request('/api/user/verify-forgot-password-code', {
        method: "GET",
        params,
    });
}

export async function contactSales(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/api/user/contact-sales', {
        method: "POST",
        data: formData,
    });
}