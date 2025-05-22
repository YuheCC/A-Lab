const Header = ({ activePage, handleNavigation }) => {
    return (
        <header className="App-header">
            <div className="header-content">
                <div className="header-links">
                    <a
                        href="/map"
                        className={`header-link ${activePage === 'map' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNavigation('map'); }}
                    >
                        Map
                    </a>
                    <a
                        href="/ask"
                        className={`header-link ${activePage === 'chatbot' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNavigation('chatbot'); }}
                    >
                        Ask
                    </a>
                    <a
                        href="/search"
                        className={`header-link ${activePage === 'search' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNavigation('search'); }}
                    >
                        Search
                    </a>
                    <a
                        href="/filter"
                        className={`header-link ${activePage === 'explorer' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNavigation('explorer'); }}
                    >
                        Filter
                    </a>
                    <a
                        href="/favorites"
                        className={`header-link ${activePage === 'favorites' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNavigation('favorites'); }}
                    >
                        Favorites
                    </a>
                </div>
            </div>
            <div className="stats-container">
                {activePage === 'explorer' && (
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