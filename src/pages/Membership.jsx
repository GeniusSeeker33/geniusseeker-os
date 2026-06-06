const tiers = [
  {
    name: "Builder",
    price: "$5,000 / year",
    geniusDollars: "Includes 2,500 Genius Dollars",
    featured: false,
    features: [
      "GeniusSeeker employer access",
      "Starter employee rewards bank",
      "Livestream event access",
      "Employee recognition campaigns",
      "Basic corporate partner listing",
    ],
  },
  {
    name: "Innovator",
    price: "$15,000 / year",
    geniusDollars: "Includes 10,000 Genius Dollars",
    featured: true,
    features: [
      "Everything in Builder",
      "Expanded employee rewards bank",
      "Quarterly leadership circle access",
      "Corporate livestream sponsorship",
      "Custom employee milestone campaigns",
    ],
  },
  {
    name: "Legacy",
    price: "$50,000 / year",
    geniusDollars: "Includes 35,000 Genius Dollars",
    featured: false,
    features: [
      "Everything in Innovator",
      "Premium rewards bank",
      "Annual Earthtone retreat credit",
      "Executive leadership circle access",
      "Strategic talent ecosystem partnership",
    ],
  },
];

const howItWorks = [
  {
    title: "Companies Fund Genius Dollars",
    text: "Corporate partners purchase Genius Dollars through GeniusSeeker to reward employees, leaders, sales teams, referrals, and milestone achievements.",
  },
  {
    title: "Employees Earn Rewards",
    text: "Employees earn Genius Dollars through hiring referrals, training completion, sales growth, innovation projects, leadership development, and service milestones.",
  },
  {
    title: "Earthtone Delivers Experiences",
    text: "Genius Dollars are redeemed for livestreams, studio experiences, retreats, leadership circles, music events, and creative gatherings at Earthtone Analog.",
  },
];

const economy = [
  {
    title: "1 Genius Dollar",
    text: "Equals $1 in redeemable Earthtone experience value.",
  },
  {
    title: "No Free Redemptions",
    text: "Every reward is funded by the corporate partner before it is redeemed.",
  },
  {
    title: "Earthtone Gets Paid",
    text: "Earthtone earns revenue when Genius Dollars are used for events, retreats, livestreams, and studio experiences.",
  },
];

export default function Membership() {
  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <a className="marketing-brand" href="/">
          <span className="marketing-logo">GS</span>
          <span>
            <strong>GeniusSeeker</strong>
            <small>Connecting Genius</small>
          </span>
        </a>

        <a className="primary-btn" href="mailto:partners@geniusseeker.com">
          Become a Partner
        </a>
      </header>

      <div className="marketing-container">
        <section className="marketing-hero">
          <p className="eyebrow">Corporate Rewards powered by Genius Dollars</p>
          <h1>
            Fund your team's growth in Genius Dollars — $1 = $1 USD, redeemable
            for real experiences.
          </h1>
          <p className="marketing-lede">
            Reward employees, leaders, sales teams, and referrals with a currency
            that converts directly into livestreams, retreats, leadership circles,
            and studio experiences at Earthtone Analog.
          </p>
          <div className="marketing-hero-actions">
            <a className="primary-btn" href="mailto:partners@geniusseeker.com">
              Become a Partner
            </a>
            <span className="status-pill payout">1 Genius Dollar = $1 USD</span>
          </div>
        </section>

      <section className="card">
        <div className="section-header">
          <h3>Corporate Membership Tiers</h3>
          <p>
            Annual partnership levels. Each tier includes a funded Genius Dollars
            balance your team can earn and redeem.
          </p>
        </div>

        <div className="grid tier-grid">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={tier.featured ? "card tier-card featured" : "card tier-card"}
            >
              <div className="tier-head">
                <p className="eyebrow">{tier.name}</p>
                {tier.featured && (
                  <span className="status-pill payout">Most Popular</span>
                )}
              </div>

              <h3 className="tier-price">{tier.price}</h3>
              <p className="tier-dollars">{tier.geniusDollars}</p>

              <ul className="feature-list">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h3>How It Works</h3>
          <p>Corporate Rewards powered by Genius Dollars.</p>
        </div>

        <div className="grid stats-grid">
          {howItWorks.map((step, index) => (
            <div key={step.title} className="card economy-card">
              <span className="score-pill">Step {index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <p className="eyebrow">Genius Dollar Economy</p>
          <h3>Simple, Transparent, Redeemable</h3>
          <p>
            Genius Dollars are the reward currency of the GeniusSeeker ecosystem.
            Companies fund them. Employees earn them. Earthtone Analog redeems them
            for real-world experiences.
          </p>
        </div>

        <div className="grid stats-grid">
          {economy.map((item) => (
            <div key={item.title} className="card economy-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Built So Earthtone Never Loses Money</h3>
        </div>

        <p className="economy-paragraph">
          Corporate partners fund Genius Dollars in advance. Employees redeem those
          Genius Dollars for approved experiences. Earthtone Analog earns revenue from
          every livestream, event, retreat, leadership circle, and studio experience
          delivered.
        </p>
      </section>

        <section className="marketing-cta card">
          <div>
            <p className="eyebrow">Corporate Rewards powered by Genius Dollars</p>
            <h3>Ready to fund your team's next milestone?</h3>
          </div>
          <a className="primary-btn" href="mailto:partners@geniusseeker.com">
            Become a Partner
          </a>
        </section>
      </div>

      <footer className="marketing-footer">
        <p className="muted-small">
          © {new Date().getFullYear()} GeniusSeeker · Corporate Rewards powered by
          Genius Dollars
        </p>
      </footer>
    </div>
  );
}
