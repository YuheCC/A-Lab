import request from "@/services/request";

export async function getMoleculeList(params?: any) {
    return request("/molecule-list", {
        method: "GET",
        params,
    });
}

export async function findMoleculeFriends(params?: any) {
    return request("/find-friend-with-image", {
        method: "POST",
        data: params,
    });
}   