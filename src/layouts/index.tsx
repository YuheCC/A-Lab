import { Outlet } from "umi";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

const FullNavLayout = () => {
    return (
        <>
            <Navbar/>
            <Header />

            <div className='main-container'>
                <Outlet />
            </div>
        </>
    );
}

export default FullNavLayout;