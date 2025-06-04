import { NavLink, useLocation } from "react-router";

const Header = () => {
    const { pathname } = useLocation();
    return (
        <header className="App-header">
            <div className="header-content">
                <div className="header-links">
                    <NavLink className='header-link' to="/">Map</NavLink>
                    <NavLink className='header-link' to="/ask">Ask</NavLink>
                    <NavLink className='header-link' to="/search">Search</NavLink>
                    <NavLink className='header-link' to="/filter">Filter</NavLink>
                    <NavLink className='header-link' to="/favorites">Favorites</NavLink>
                </div>
            </div>
            <div className="stats-container">
                {pathname === '/explorer' && (
                    <>
                        {/* <div>Showing: {filteredGraphData.length} of {graphData.length} nodes</div> */}
                        {/* <div>Filters: {activeFilterCount} active</div> */}
                        {/* {loading && <div>Loading...</div>} */}
                    </>
                )}
            </div>
        </header>
    )
}

export default Header;