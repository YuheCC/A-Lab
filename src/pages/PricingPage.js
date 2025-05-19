// Pricing Page component
const PricingPage = ({ onSignIn, handleNavigation, activePage }) => {
  return (
    <div className="pricing-container" style={{ display: 'flex', width: '100%', padding: '0' }}>
      <div className="pricing-cards" style={{ width: '100%' }}>
        <div className="pricing-card">
          {/* <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm4-9H8v2h8Z"/>
            </svg>
          </div> */}
          <h2>Research (academia only)</h2>
          <p className="pricing-description">
            Access to Partial Molecular Universe (1M)
          </p>
          <div className="pricing-price">
            <span className="price-amount">$0</span>
            <span className="price-period">/ month</span>
          </div>
          <button
            className="pricing-cta research"
            onClick={onSignIn}
          >
            Get Started
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (≤ 100 queries/month)</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Explorer</h2>
          <p className="pricing-description">
            Access to Partial Molecular Universe (1M)
          </p>
          <div className="pricing-price">
            <span className="price-amount">$150</span>
            <span className="price-period">/ month</span>
          </div>
          <button
            className="pricing-cta professional"
            onClick={() => window.open('https://buy.stripe.com/6oE165fCb3Tf0qA5kl', '_blank')}
          >
            Get Started
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap)</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Team</h2>
          <p className="pricing-description">
            Access to Partial Molecular Universe (1M)
          </p>
          <div className="pricing-price">
            <span className="price-amount">$1,000</span>
            <span className="price-period">/ month (Up to 10 users)</span>
          </div>
          <button className="pricing-cta unlimited"
            onClick={() => window.open('https://buy.stripe.com/dR67utfCb3TffludQS', '_blank')}
          >
            Get Started
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap)</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Enterprise</h2>
          <p className="pricing-description">
            Access to Whole Molecular Universe (100M)
          </p>
          <div className="pricing-price">
            <span className="price-amount"></span>
            <span className="price-period"></span>
          </div>
          <button
            className="pricing-cta strategic"
            onClick={() => window.location.href = 'mailto:partnership@ses.ai?subject=Joint Development Inquiry'}
          >
            Contact Sales
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap, battery-specific LLM)</li>
              <li>More molecule properties (inc. melting and boiling point predictions)</li>
              <li>Expert consulting</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Joint Development</h2>
          <p className="pricing-description">
            Access to Whole Molecular Universe (100M)
          </p>
          <div className="pricing-price">
            <span className="price-amount"></span>
            <span className="price-period"></span>
          </div>
          <button
            className="pricing-cta joint"
            onClick={() => window.location.href = 'mailto:Yumin.Zhang@ses.ai?subject=Joint Development Inquiry'}
          >
            Contact Sales
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap, battery-specific LLM)</li>
              <li>More molecule properties (inc. melting and boiling point predictions)</li>
              <li>Customized statement-of-work (inc. molecule synthesis, electrolyte formulation development and cell validation)</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;