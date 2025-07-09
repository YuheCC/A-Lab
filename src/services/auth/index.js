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

    return request({
        url: "/register",
        method: "POST",
        data: formData,
    });
}

export async function resetPassword(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request({
        url: "/reset-password",
        method: "POST",
        data: formData,
    });
}

export async function forgotPassword(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request({
        url: "/forgot-password",
        method: "POST",
        data: formData,
    });
}

export async function redeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    return request({
        url: "/redeem-code",
        method: "POST",
        data: formData,
    });
}

export async function verify() {    
    return request({
        url: "/verify-token",
        method: "GET",
    });
}