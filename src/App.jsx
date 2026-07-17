import { useState } from 'react';
import './App.css';

function Dashboard({ setActiveTab }) {
  const [hovered, setHovered] = useState(null);

  const selectMode = (mode) => {
    setHovered(mode);
    if (mode === 'search') setActiveTab('search-tests');
    else if (mode === 'content') setActiveTab('content');
  };

  return (
    <div className="dashboard">
      <section className="hero">
        <div className="hero-content">
          <h1>GET YOUR CONTENT FOUND BY AI SEARCH ENGINES</h1>
          <p>Test search visibility • Optimize content • Track progress • Dominate AI results</p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">24</span>
          <span className="stat-label">Search Tests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">12</span>
          <span className="stat-label">Content Analyses</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">78</span>
          <span className="stat-label">Avg AEO Score</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">5</span>
          <span className="stat-label">Top Rankings</span>
        </div>
      </section>

      <section>
        <div className="card">
          <h2>Choose Your AEO Monitoring Mode</h2>
          <div className="mode-grid">
            <button
              type="button"
              className={`mode-card ${hovered === 'search' ? 'active' : ''}`}
              onClick={() => selectMode('search')}
            >
              <span className="mode-icon" aria-hidden="true">🔍</span>
              <h3>TEST SEARCH VISIBILITY</h3>
              <p>
                Enter search queries to see if your website appears in ChatGPT and Perplexity
                results. Track your rankings over time.
              </p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Example:</strong> "How to build a SaaS business"
              </div>
            </button>

            <button
              type="button"
              className={`mode-card ${hovered === 'content' ? 'active' : ''}`}
              onClick={() => selectMode('content')}
            >
              <span className="mode-icon" aria-hidden="true">📝</span>
              <h3>ANALYZE CONTENT</h3>
              <p>
                Paste your existing blog posts, articles, or web pages to get detailed AEO
                optimization recommendations and improve your rankings.
              </p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Paste:</strong> Blog posts, articles, product descriptions
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('search-tests')}>
            🚀 START SEARCH TEST
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('content')}>
            📊 ANALYZE CONTENT
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('history')}>
            📈 VIEW HISTORY
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('pricing')}>
            💰 UPGRADE PLAN
          </button>
        </div>
      </section>
    </div>
  );
}

function SearchTests() {
  const [query, setQuery] = useState('');
  const [website, setWebsite] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    if (!query || !website) {
      alert('Please enter both a search query and website URL');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/search-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, website }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-tests">
      <div className="card">
        <h2>🔍 TEST SEARCH VISIBILITY</h2>
        <p>Enter a search query and your website to see if you appear in AI search results.</p>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="search-query" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Search Query
          </label>
          <input
            id="search-query"
            type="text"
            className="input"
            placeholder="e.g., How to build a successful SaaS business"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label htmlFor="search-website" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Your Website URL
          </label>
          <input
            id="search-website"
            type="text"
            className="input"
            placeholder="e.g., yourblog.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <button className="btn btn-primary" onClick={runTest} disabled={loading}>
            {loading ? '🔄 TESTING...' : '🚀 TEST VISIBILITY'}
          </button>
          {error && (
            <p style={{ color: 'var(--error-red)', marginTop: '1rem', fontWeight: 'bold' }}>⚠️ {error}</p>
          )}
        </div>

        {result && (
          <div className="results">
            <h3>Search Visibility Results</h3>
            <div className="card" style={{ backgroundColor: 'var(--mint)', marginBottom: '1rem' }}>
              <strong>Query:</strong> "{result.query}"
              <br />
              <strong>Website:</strong> {result.website}
            </div>

            <div className="stats-grid">
              <div
                className="stat-card"
                style={{ backgroundColor: result.chatgpt.found ? 'var(--mint)' : 'var(--mauve)' }}
              >
                <span className="stat-number">
                  {result.chatgpt.found ? `#${result.chatgpt.position}` : 'NOT FOUND'}
                </span>
                <span className="stat-label">ChatGPT</span>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {result.chatgpt.confidence}% confidence
                </div>
              </div>
              <div
                className="stat-card"
                style={{ backgroundColor: result.perplexity.found ? 'var(--mint)' : 'var(--mauve)' }}
              >
                <span className="stat-number">
                  {result.perplexity.found ? `#${result.perplexity.position}` : 'NOT FOUND'}
                </span>
                <span className="stat-label">Perplexity</span>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {result.perplexity.confidence}% confidence
                </div>
              </div>
            </div>

            <div className="card">
              <h4>💡 Recommendations</h4>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {result.chatgpt.found && (
                  <li>You rank #{result.chatgpt.position} in ChatGPT for this query - solid visibility.</li>
                )}
                {!result.chatgpt.found && (
                  <li>ChatGPT didn't cite your site for this query - try a more specific, answer-shaped query or add clearer direct-answer content.</li>
                )}
                {result.perplexity.found && (
                  <li>You rank #{result.perplexity.position} in Perplexity for this query - solid visibility.</li>
                )}
                {!result.perplexity.found && (
                  <li>Perplexity didn't cite your site for this query - consider adding more citable data, sources, or specifics.</li>
                )}
                <li>Track this query periodically to monitor changes over time.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentAnalysis() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!content.trim()) {
      alert('Please paste some content to analyze');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-analysis">
      <div className="card">
        <h2>📝 ANALYZE YOUR CONTENT</h2>
        <p>
          <strong>💡 PASTE YOUR EXISTING CONTENT</strong> - Copy your blog post, article, or
          webpage text and paste it below to get detailed AEO optimization recommendations.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            margin: '2rem 0',
          }}
        >
          <div style={{ textAlign: 'center', padding: '1rem', border: '2px solid var(--black)', backgroundColor: 'var(--mint)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📰</div>
            <strong>Blog Posts</strong>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', border: '2px solid var(--black)', backgroundColor: 'var(--periwinkle)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            <strong>Articles</strong>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', border: '2px solid var(--black)', backgroundColor: 'var(--mint)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌐</div>
            <strong>Web Pages</strong>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', border: '2px solid var(--black)', backgroundColor: 'var(--periwinkle)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛍️</div>
            <strong>Product Descriptions</strong>
          </div>
        </div>

        <textarea
          className="textarea"
          aria-label="Content to analyze"
          placeholder={`📝 Copy your blog post, article, or webpage text and paste it here...\n\nExample: 'Building a successful SaaS business requires careful planning and execution. First, you need to identify a real problem that people are willing to pay to solve...'\n\nThe more content you provide, the more detailed analysis you'll receive!`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ minHeight: '200px' }}
        />
        <button
          className="btn btn-primary"
          onClick={analyze}
          disabled={loading}
          style={{ fontSize: '1.2rem', padding: '1.5rem 3rem' }}
        >
          {loading ? '🔄 ANALYZING YOUR CONTENT...' : '🚀 ANALYZE MY CONTENT'}
        </button>
        {error && (
          <p style={{ color: 'var(--error-red)', marginTop: '1rem', fontWeight: 'bold' }}>⚠️ {error}</p>
        )}
      </div>

      {result && (
        <div className="results">
          <div className="card" style={{ backgroundColor: 'var(--mint)' }}>
            <h3>🎯 AEO Analysis Results</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{result.score}</span>
                <span className="stat-label">AEO Score</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{result.grade}</span>
                <span className="stat-label">Grade</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{content.split(' ').length}</span>
                <span className="stat-label">Words</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{result.recommendations.length}</span>
                <span className="stat-label">Recommendations</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4>📊 Category Breakdown</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{result.categories.structure}</span>
                <span className="stat-label">Structure</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{result.categories.clarity}</span>
                <span className="stat-label">Clarity</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{result.categories.completeness}</span>
                <span className="stat-label">Completeness</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{result.categories.actionability}</span>
                <span className="stat-label">Actionability</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            <div className="card" style={{ backgroundColor: 'var(--mint)' }}>
              <h4>✅ Strengths</h4>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {result.strengths.map((s, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ backgroundColor: 'var(--mauve)' }}>
              <h4>⚠️ Areas for Improvement</h4>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {result.weaknesses.map((w, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <h4>🚀 Optimization Recommendations</h4>
            <ol style={{ paddingLeft: '1.5rem' }}>
              {result.recommendations.map((r, i) => (
                <li key={i} style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                  {r}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function History() {
  const [tab, setTab] = useState('content');

  const contentHistory = [
    { id: 1, title: 'SaaS Marketing Strategies Guide', type: 'Blog Post', score: 78, date: '2024-01-15', improvement: '+12' },
    { id: 2, title: 'Growth Hacking for Startups', type: 'Article', score: 85, date: '2024-01-14', improvement: '+8' },
    { id: 3, title: 'Product Launch Checklist', type: 'Web Page', score: 72, date: '2024-01-13', improvement: '+15' },
  ];

  const searchHistory = [
    { id: 1, query: 'saas marketing strategies', website: 'myblog.com', chatgpt: '#5', perplexity: '#1', googleai: 'Not Found', date: '2024-01-15' },
    { id: 2, query: 'growth hacking techniques', website: 'myblog.com', chatgpt: '#1', perplexity: '#3', googleai: '#8', date: '2024-01-14' },
    { id: 3, query: 'startup product launch', website: 'myblog.com', chatgpt: '#3', perplexity: '#2', googleai: 'Not Found', date: '2024-01-13' },
  ];

  return (
    <div className="history">
      <div className="card">
        <h2>📈 ANALYSIS HISTORY</h2>
        <p>Track your AEO progress over time and see how your optimizations improve your scores.</p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${tab === 'content' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('content')}
          >
            📝 CONTENT HISTORY
          </button>
          <button
            className={`btn ${tab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('search')}
          >
            🔍 SEARCH HISTORY
          </button>
        </div>

        {tab === 'content' && (
          <div>
            <h3>Content Analysis History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contentHistory.map((item) => (
                <div className="card" style={{ backgroundColor: 'var(--white)' }} key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                      <div style={{ color: 'var(--slate-blue)', fontWeight: 'bold' }}>{item.type}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.date}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="stat-number" style={{ fontSize: '2rem' }}>{item.score}</div>
                      <div className="stat-label">AEO Score</div>
                      <div style={{ color: 'green', fontWeight: 'bold' }}>{item.improvement} improvement</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>VIEW</button>
                      <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>REANALYZE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div>
            <h3>Search Visibility History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '4px solid var(--black)' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slate-blue)', color: 'white' }}>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'left' }}>Query</th>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'left' }}>Website</th>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center' }}>ChatGPT</th>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center' }}>Perplexity</th>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center' }}>Google AI</th>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center' }}>Date</th>
                    <th style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchHistory.map((item) => (
                    <tr style={{ backgroundColor: 'var(--white)' }} key={item.id}>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)', fontWeight: 'bold' }}>"{item.query}"</td>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)' }}>{item.website}</td>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center', color: item.chatgpt.includes('Not') ? 'var(--error-red)' : 'green', fontWeight: 'bold' }}>{item.chatgpt}</td>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center', color: item.perplexity.includes('Not') ? 'var(--error-red)' : 'green', fontWeight: 'bold' }}>{item.perplexity}</td>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center', color: item.googleai.includes('Not') ? 'var(--error-red)' : 'green', fontWeight: 'bold' }}>{item.googleai}</td>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center', fontSize: '0.9rem' }}>{item.date}</td>
                      <td style={{ padding: '1rem', border: '2px solid var(--black)', textAlign: 'center' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>RETEST</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>📊 Progress Trends</h3>
        <div className="stats-grid">
          <div className="stat-card" style={{ backgroundColor: 'var(--mint)' }}>
            <span className="stat-number">+18%</span>
            <span className="stat-label">Avg Score Improvement</span>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'var(--periwinkle)' }}>
            <span className="stat-number">7</span>
            <span className="stat-label">Top 3 Rankings</span>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'var(--mint)' }}>
            <span className="stat-number">24</span>
            <span className="stat-label">Total Analyses</span>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'var(--periwinkle)' }}>
            <span className="stat-number">12</span>
            <span className="stat-label">Queries Tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const [selected, setSelected] = useState('professional');

  const plans = [
    {
      id: 'free', name: 'FREE', price: '$0', period: '/month',
      description: 'Perfect for trying out AEO',
      features: ['5 search tests/month', '3 content analyses/month', 'Basic AEO scores', 'Limited history', 'Email support'],
      searchTests: 5, contentAnalyses: 3, buttonText: 'START FREE', popular: false,
    },
    {
      id: 'starter', name: 'STARTER', price: '$49', period: '/month',
      description: 'Great for solo founders',
      features: ['50 search tests/month', '25 content analyses/month', 'Advanced analytics', 'Full history tracking', 'Email support', 'Export reports'],
      searchTests: 50, contentAnalyses: 25, buttonText: 'CHOOSE STARTER', popular: false,
    },
    {
      id: 'professional', name: 'PROFESSIONAL', price: '$149', period: '/month',
      description: 'Perfect for growing startups',
      features: ['200 search tests/month', '100 content analyses/month', 'API access', 'Priority support', 'Custom reports', 'Team collaboration', 'Advanced insights'],
      searchTests: 200, contentAnalyses: 100, buttonText: 'CHOOSE PROFESSIONAL', popular: true,
    },
    {
      id: 'agency', name: 'AGENCY', price: '$399', period: '/month',
      description: 'For marketing agencies',
      features: ['1000 search tests/month', '500 content analyses/month', 'White-label capabilities', 'Unlimited team members', 'Custom integrations', 'Dedicated support', 'Custom training'],
      searchTests: 1000, contentAnalyses: 500, buttonText: 'CHOOSE AGENCY', popular: false,
    },
  ];

  return (
    <div className="pricing">
      <div className="hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="hero-content">
          <h1>CHOOSE YOUR AEO PLAN</h1>
          <p>Start free, upgrade as you grow. All plans include SSL, analytics, and our core AEO features.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card ${selected === plan.id ? 'selected' : ''}`}
            style={{
              backgroundColor: plan.popular ? 'var(--mint)' : 'var(--white)',
              position: 'relative',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            {plan.popular && (
              <div
                style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: 'var(--slate-blue)', color: 'white', padding: '0.5rem 1rem',
                  border: '3px solid var(--black)', fontWeight: 'bold', fontSize: '0.9rem',
                }}
              >
                🔥 MOST POPULAR
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--slate-blue)', marginBottom: '0.5rem' }}>
                {plan.price}
                <span style={{ fontSize: '1rem', color: '#666' }}>{plan.period}</span>
              </div>
              <p style={{ color: '#666' }}>{plan.description}</p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', border: '2px solid var(--black)', backgroundColor: 'var(--white)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--slate-blue)' }}>{plan.searchTests}</div>
                  <div style={{ fontSize: '0.9rem' }}>Search Tests</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', border: '2px solid var(--black)', backgroundColor: 'var(--white)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--slate-blue)' }}>{plan.contentAnalyses}</div>
                  <div style={{ fontSize: '0.9rem' }}>Content Analyses</div>
                </div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>✅ {f}</li>
              ))}
            </ul>
            <button
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
              onClick={() => setSelected(plan.id)}
              aria-pressed={selected === plan.id}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ backgroundColor: 'var(--periwinkle)' }}>
        <h3>💰 Revenue Potential Calculator</h3>
        <p>See how AEO Monitor can impact your business growth:</p>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">$450K</span>
            <span className="stat-label">Conservative Year 1 ARR</span>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>500 subscribers × $75 avg</div>
          </div>
          <div className="stat-card">
            <span className="stat-number">$2.4M</span>
            <span className="stat-label">Optimistic Year 2 ARR</span>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>2000 subscribers × $100 avg</div>
          </div>
          <div className="stat-card">
            <span className="stat-number">85%</span>
            <span className="stat-label">Customer Retention</span>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>High value, sticky product</div>
          </div>
          <div className="stat-card">
            <span className="stat-number">$25</span>
            <span className="stat-label">Low CAC</span>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Organic discovery reduces costs</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🎯 Target Customers & Willingness to Pay</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', border: '3px solid var(--black)', backgroundColor: 'var(--mint)' }}>
            <h4>SaaS Startups</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black)' }}>$50-200/month</div>
            <p>High value: Organic discovery reduces CAC. Need to appear when customers search for solutions.</p>
          </div>
          <div style={{ padding: '1.5rem', border: '3px solid var(--black)', backgroundColor: 'var(--periwinkle)' }}>
            <h4>Content Agencies</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black)' }}>$100-500/month</div>
            <p>High value: New service offering for clients. Staying ahead of AI search trends.</p>
          </div>
          <div style={{ padding: '1.5rem', border: '3px solid var(--black)', backgroundColor: 'var(--mint)' }}>
            <h4>Solo Creators</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--black)' }}>$25-100/month</div>
            <p>High value: Thought leadership positioning. Limited budget but need competitive edge.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--slate-blue)', color: 'white' }}>
        <h3>🚀 Ready to Dominate AI Search Results?</h3>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Join thousands of businesses using AEO Monitor to get found by AI search engines.
        </p>
        <button className="btn btn-secondary" style={{ fontSize: '1.3rem', padding: '1.5rem 3rem' }}>
          🎯 START YOUR FREE TRIAL
        </button>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'search-tests':
        return <SearchTests />;
      case 'content':
        return <ContentAnalysis />;
      case 'history':
        return <History />;
      case 'pricing':
        return <Pricing />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">AEO MONITOR</h1>
          <nav className="nav">
            <button onClick={() => setActiveTab('dashboard')} className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
              📊 DASHBOARD
            </button>
            <button onClick={() => setActiveTab('search-tests')} className={`nav-btn ${activeTab === 'search-tests' ? 'active' : ''}`}>
              🔍 SEARCH TESTS
            </button>
            <button onClick={() => setActiveTab('content')} className={`nav-btn ${activeTab === 'content' ? 'active' : ''}`}>
              📝 CONTENT
            </button>
            <button onClick={() => setActiveTab('history')} className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}>
              📈 HISTORY
            </button>
            <button onClick={() => setActiveTab('pricing')} className={`nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}>
              💰 PRICING
            </button>
          </nav>
        </div>
      </header>
      <main className="main">{renderTab()}</main>
    </div>
  );
}

export default App;
