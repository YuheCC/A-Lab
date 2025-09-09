import request from "@/services/request";

export async function getBatterySystemList(params?: any) {
    return request("/api/batterySystem/list", {
        method: "GET",
        params,
    });
}