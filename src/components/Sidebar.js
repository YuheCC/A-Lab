const Sidebar = ({ activePage, handleNavigation, children, style }) => {
    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'row', paddingTop: 20, height: 'calc(100vh - 170px)' }}>
            <div className="about-text-section left-text" style={{ width: '7%', minWidth: 100, overflowY: 'auto', padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '0 8px 8px 0', marginLeft: '0', marginRight: '20px' }}>
                <h1
                    style={{
                        textDecoration: 'none',
                        color: 'rgb(51, 51, 51)',
                        fontSize: '9.5px',
                        transition: 'font-size 0.3s',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        fontWeight: 'normal'
                    }}
                    onClick={() => {
                        if (activePage === 'about') {
                            // Already on the about page, just scroll to the top
                            const contentWrapper = document.querySelector('.about-content-wrapper');
                            if (contentWrapper) {
                                contentWrapper.scrollTop = 0;
                            }
                        } else {
                            // Navigate to about page first, then scroll
                            handleNavigation('about');
                            setTimeout(() => {
                                const contentWrapper = document.querySelector('.about-content-wrapper');
                                if (contentWrapper) {
                                    contentWrapper.scrollTop = 0;
                                }
                            }, 100);
                        }
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                >
                    Motivation
                </h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    <a
                        href="#features"
                        style={{
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '9.5px',
                            transition: 'font-size 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                        onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigation('about');
                            setTimeout(() => {
                                const featuresSection = document.getElementById('features-section');
                                if (featuresSection) {
                                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }, 100);
                        }}
                    >
                        Features
                    </a>
                    <a
                        href="#pricing"
                        style={{
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '9.5px',
                            transition: 'font-size 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                        onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigation('pricing');
                        }}
                    >
                        Pricing
                    </a>
                    <a
                        href="#news"
                        style={{
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '9.5px',
                            transition: 'font-size 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                        onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigation('about');
                            setTimeout(() => {
                                const newsfeedSection = document.getElementById('newsfeed');
                                if (newsfeedSection) {
                                    newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }, 100);
                        }}
                    >
                        News Feed
                    </a>
                </div>
            </div>
            <div style={{ overflowY: 'auto', flexGrow: 1, ...style }}>
                { children }
            </div>
        </div>
        )
}

export default Sidebar;