import { Outlet } from "umi";
import Header from "@/components/Header";
import { usePlotDataStore } from "@/models/usePlotData";
import { useEffect } from "react";
import "./index.less";

const FullNavLayout = () => {
    const { fetchInitialData , fetchData} = usePlotDataStore();
    useEffect(() => {
        fetchInitialData();
        fetchData();
    }, []);
    return (
        <>
            <Header />

            <div className='main-container'>
                <Outlet />
            </div>
        </>
    );
}

export default FullNavLayout;