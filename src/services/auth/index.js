import request from "@/services/request";
import { buildAutoFetchURL } from "@/services/config/autoFetch";

export async function login(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('login');
    return request(url, {
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
    const url = buildAutoFetchURL('register');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function resetPassword(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('resetPassword');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function resetPasswordByToken(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('resetPasswordToken');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function redeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('redeemCode');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function verify() {    
    const url = buildAutoFetchURL('verifyToken');
    return request(url, {
        method: "GET",
    });
}

export async function verifyCode(params) {
    const url = buildAutoFetchURL('verifyRegisterCode');
    return request(url, {
        method: "GET",
        params,
    });
}

export async function verifyRedeemCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('redeemNew');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function sendEducationCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('bindEduEmail');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function verifyEducationCode(params) {
    const url = buildAutoFetchURL('verifyEduCode');
    return request(url, {
        method: "GET",
        params,
    });
}

export async function sendForgotPasswordCode(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('forgotPassword');
    return request(url, {
        method: "POST",
        data: formData,
    });
}

export async function verifyForgotPasswordCode(params) {
    const url = buildAutoFetchURL('verifyForgotPasswordCode');
    return request(url, {
        method: "GET",
        params,
    });
}

export async function contactSales(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const url = buildAutoFetchURL('contactSales');
    return request(url, {
        method: "POST",
        data: formData,
    });
}