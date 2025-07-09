import { Outlet } from "umi";
import Header from "@/components/Header";

const FullNavLayout = () => {
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