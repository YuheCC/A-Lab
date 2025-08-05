import request from "@/services/request";

export async function login(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request("/login", {
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
    return request('/register', {
        method: "POST",
        data: formData,
    });
}

export async function resetPassword(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/reset-password', {
        method: "POST",
        data: formData,
    });
}

export async function resetPasswordByToken(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/reset-password-token', {
        method: "POST",
        data: formData,
    });
}

export async function redeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/redeem-code', {
        method: "POST",
        data: formData,
    });
}

export async function verify() {    
    return request('/verify-token', {
        method: "GET",
    });
}

export async function verifyCode(params) {
    return request('/verify-register-code', {
        method: "GET",
        params,
    });
}

export async function verifyRedeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/redeem-new', {
        method: "POST",
        data: formData,
    });
}

export async function sendEducationCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/bind-edu-email', {
        method: "POST",
        data: formData,
    });
}

export async function verifyEducationCode(params) {
    return request('/verify-edu-code', {
        method: "GET",
        params,
    });
}

export async function sendForgotPasswordCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/forgot-password', {
        method: "POST",
        data: formData,
    });
}

export async function verifyForgotPasswordCode(params) {
    return request('/verify-forgot-password-code', {
        method: "GET",
        params,
    });
}

export async function contactSales(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request('/contact-sales', {
        method: "POST",
        data: formData,
    });
}