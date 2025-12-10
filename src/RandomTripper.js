import { useState } from 'react';

export default function RandomTripper() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [foundDomain, setFoundDomain] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('random');
  const [wordList, setWordList] = useState([]);

  const generateRandomString = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const fetchRandomWords = async () => {
    try {
      const length = Math.floor(Math.random() * 4) + 3;
      const response = await fetch(`https://random-word-api.herokuapp.com/word?number=100&length=${length.toString()}`);
      const words = await response.json();
      return words;
    } catch (error) {
      console.error('Failed to fetch words:', error);
      return ['blue', 'red', 'green', 'cat', 'dog', 'happy', 'cloud', 'sun', 'book', 'music'];
    }
  };

  const generateWordDomain = () => {
    if (wordList.length === 0) return null;
    
    const tlds = ['com', 'net', 'org', 'jp'];
    const separator = Math.random() > 0.5 ? '-' : '';
    const numWords = Math.floor(Math.random() * 2) + 1;
    
    const selectedWords = [];
    for (let i = 0; i < numWords; i++) {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      selectedWords.push(word);
    }
    
    const name = selectedWords.join(separator);
    const tld = tlds[Math.floor(Math.random() * tlds.length)];
    return `${name}.${tld}`;
  };

  const generateRandomDomain = () => {
    const tlds = ['com', 'net', 'org', 'jp'];
    const length = Math.floor(Math.random() * 5) + 4;
    const name = generateRandomString(length);
    const tld = tlds[Math.floor(Math.random() * tlds.length)];
    return `${name}.${tld}`;
  };

  const checkDomainExists = async (domain) => {
    try {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
        { 
          headers: { 'Accept': 'application/dns-json' },
          signal: AbortSignal.timeout(5000)
        }
      );
      const data = await response.json();
      return data.Status === 0 && data.Answer?.length > 0;
    } catch (error) {
      console.error('DNS lookup error:', error);
      return false;
    }
  };

  const startRandomTrip = async () => {
    setLoading(true);
    setStatus('ランダムドメインを探索中...');
    setHistory([]);

    if (mode === 'words') {
      setStatus('単語リストを取得中...');
      const words = await fetchRandomWords();
      setWordList(words);
      setStatus(`${words.length}単語を生成しました。探索を開始します...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const domain = mode === 'random' 
        ? generateRandomDomain() 
        : generateWordDomain();
      
      if (!domain) {
        setStatus('すみません、もう一度試してください');
        setLoading(false);
        return;
      }
      
      attempts++;
      
      setStatus(`${attempts}/${maxAttempts}: ${domain} をチェック中...`);
      setHistory(prev => [...prev, { domain, status: 'checking' }]);

      const exists = await checkDomainExists(domain);

      setHistory(prev => 
        prev.map((item, idx) => 
          idx === prev.length - 1 
            ? { ...item, status: exists ? 'exists' : 'not-found' }
            : item
        )
      );

      if (exists) {
        setStatus(`✓ 発見! ${domain}`);
        setFoundDomain(domain);
        setShowModal(true);
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setStatus(`${maxAttempts}回試行しましたが、存在するドメインが見つかりませんでした。`);
    setLoading(false);
  };

  const handleTrip = () => {
    if (foundDomain) {
      window.open(`https://${foundDomain}`, '_blank');
      setShowModal(false);
      setFoundDomain(null);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFoundDomain(null);
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', monospace;
          background-image: url(/64585u64585u6458.png);
          min-height: 100vh;
          color: #fff;
          overflow-x: hidden;
        }

        .container {
          padding: 40px 20px;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }

        .title {
          font-size: 32px;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
          animation: flicker 3.5s infinite;
        }
        

        @keyframes flicker {
          0%   { opacity: 1; }
          5%   { opacity: 0.4; }
          7%   { opacity: 1; }
          8%   { opacity: 0.2; }
          10%  { opacity: 1; }

          20%  { opacity: 0.8; }
          22%  { opacity: 0.3; }
          24%  { opacity: 1; }

          70%  { opacity: 0.9; }
          72%  { opacity: 0.3; }
          73%  { opacity: 1; }

          100% { opacity: 1; }
        }
        .subtitle {
          text-align: center;
          font-size: 14px;
          margin-bottom: 30px;
          opacity: 0.9;
          line-height: 1.6;
        }

        .mode-selector {
          background: rgba(0, 0, 0, 0.3);
          border: 3px solid #fff;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 8px 0 rgba(0, 0, 0, 0.3);
        }

        .mode-option {
          display: block;
          margin-bottom: 15px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-option:last-child {
          margin-bottom: 0;
        }

        .mode-option:hover {
          transform: translateX(5px);
        }

        .mode-option input[type="radio"] {
          margin-right: 10px;
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .start-button {
          width: 100%;
          padding: 20px;
          font-size: 18px;
          font-family: 'Courier New', monospace;
          background: linear-gradient(180deg, ##719a32 0%, ##719a32 100%);
          color: white;
          border: 4px solid #fff;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 8px 0 #2d6b2f, 0 12px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.1s;
          text-transform: uppercase;
          font-weight: bold;
        }

        .start-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 0 #2d6b2f, 0 14px 25px rgba(0, 0, 0, 0.4);
        }

        .start-button:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0 4px 0 #2d6b2f, 0 6px 10px rgba(0, 0, 0, 0.3);
        }

        .start-button:disabled {
          background: #888;
          cursor: not-allowed;
          box-shadow: 0 8px 0 #555, 0 12px 20px rgba(0, 0, 0, 0.3);
        }

        .status-box {
          margin-top: 20px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.5);
          border: 3px solid #FFD700;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.6;
          animation: glow 1.5s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { box-shadow: 0 0 10px #FFD700; }
          to { box-shadow: 0 0 20px #FFD700, 0 0 30px #FFD700; }
        }

        .history-section {
          margin-top: 30px;
        }

        .history-title {
          font-size: 20px;
          margin-bottom: 15px;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
        }

        .history-list {
          max-height: 400px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.3);
          border: 3px solid #fff;
          border-radius: 10px;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .history-list::-webkit-scrollbar {
          width: 12px;
        }

        .history-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .history-list::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .history-item {
          padding: 12px 15px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .history-item:last-child {
          border-bottom: none;
        }

        .status-checking {
          color: #FFD700;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.5; }
        }

        .status-exists {
          color: #4CAF50;
          font-weight: bold;
        }

        .status-not-found {
          color: #ff6b6b;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border: 5px solid #FFD700;
          border-radius: 15px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3);
          animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes popIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-title {
          font-size: 28px;
          margin-bottom: 20px;
          text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.3);
        }

        .modal-domain {
          font-size: 22px;
          font-weight: bold;
          margin: 20px 0;
          padding: 15px;
          background: rgba(0, 0, 0, 0.3);
          border: 3px solid #fff;
          border-radius: 10px;
          word-break: break-all;
          animation: domainPulse 1s ease-in-out infinite;
        }

        @keyframes domainPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .modal-text {
          font-size: 14px;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .modal-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .modal-button {
          padding: 15px 30px;
          font-size: 16px;
          font-family: 'Courier New', monospace;
          border: 4px solid #fff;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.1s;
          text-transform: uppercase;
          box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3);
          font-weight: bold;
        }

        .modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 rgba(0, 0, 0, 0.3);
        }

        .modal-button:active {
          transform: translateY(2px);
          box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3);
        }

        .cancel-button {
          background: #888;
          color: white;
        }

        .trip-button {
          background: linear-gradient(180deg, #FF6B6B 0%, #FF5252 100%);
          color: white;
          animation: tripPulse 1s ease-in-out infinite;
        }

        @keyframes tripPulse {
          0%, 100% { 
            box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 107, 107, 0.5);
          }
          50% { 
            box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 107, 107, 0.8);
          }
        }

        @media (max-width: 600px) {
          .title {
            font-size: 24px;
          }
          
          .subtitle {
            font-size: 12px;
          }
          
          .mode-option {
            font-size: 12px;
          }
          
          .start-button {
            font-size: 14px;
            padding: 15px;
          }
          
          .modal-content {
            padding: 30px 20px;
            margin: 20px;
          }
          
          .modal-title {
            font-size: 20px;
          }
          
          .modal-domain {
            font-size: 16px;
          }
          
          .modal-button {
            padding: 12px 20px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="container">
        <h1 className="title">DOMAIN TRIPPER</h1>
        <p className="subtitle">世界にはどんなドメインがあるのか、あなたもTrip...</p>

        <div className="mode-selector">
          <label className="mode-option">
            <input
              type="radio"
              value="random"
              checked={mode === 'random'}
              onChange={(e) => setMode(e.target.value)}
              disabled={loading}
            />
            ランダム (例: abc123.com)
          </label>
          <label className="mode-option">
            <input
              type="radio"
              value="words"
              checked={mode === 'words'}
              onChange={(e) => setMode(e.target.value)}
              disabled={loading}
            />
            単語ベース (例: blue-cat.com)
          </label>
        </div>

        <button 
          onClick={startRandomTrip}
          disabled={loading}
          className="start-button"
        >
          {loading ? '探索中...' : 'Start Trip!'}
        </button>

        {status && (
          <div className="status-box">
            {status}
          </div>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <h3 className="history-title">LOG</h3>
            <div className="history-list">
              {history.map((item, idx) => (
                <div key={idx} className="history-item">
                  <span>{item.domain}</span>
                  <span className={
                    item.status === 'checking' ? 'status-checking' :
                    item.status === 'exists' ? 'status-exists' :
                    'status-not-found'
                  }>
                    {item.status === 'checking' && 'チェック中...'}
                    {item.status === 'exists' && '✓ 存在'}
                    {item.status === 'not-found' && '✗ 未発見'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Found!</h2>
              <div className="modal-domain">
                {foundDomain}
              </div>
              <p className="modal-text">
                このドメインに"Trip"しますか？
              </p>
              <div className="modal-buttons">
                <button
                  onClick={handleCancel}
                  className="modal-button cancel-button"
                >
                  やめとく
                </button>
                <button
                  onClick={handleTrip}
                  className="modal-button trip-button"
                >
                  Trip! 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}