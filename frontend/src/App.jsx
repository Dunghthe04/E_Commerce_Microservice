import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [token, setToken] = useState('')
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')

  const gatewayUrl = 'http://localhost:8081/api'

  const handleLogin = async () => {
    try {
      setMessage('Đang đăng nhập...')
      const response = await fetch(`${gatewayUrl}/IDENTITY/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setMessage('Đăng nhập thành công!')
      } else {
        setMessage('Đăng nhập thất bại!')
      }
    } catch (error) {
      setMessage(`Lỗi: ${error.message}`)
    }
  }

  const fetchProducts = async () => {
    try {
      setMessage('Đang lấy danh sách sản phẩm...')
      const response = await fetch(`${gatewayUrl}/CATALOG/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        setMessage('Lấy dữ liệu thành công!')
      } else {
        const errData = await response.json()
        setMessage(`Lỗi: ${errData.message || response.statusText}`)
      }
    } catch (error) {
      setMessage(`Lỗi: ${error.message}`)
    }
  }

  return (
    <div className="test-container">
      <h1>Smart-POS Test Connection</h1>

      <div className="card">
        <h2>1. Đăng nhập (Identity Service)</h2>
        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
        {token && (
          <div className="token-box">
            <strong>Token:</strong>
            <code title={token}>{token.substring(0, 50)}...</code>
          </div>
        )}
      </div>

      <div className="card">
        <h2>2. Gọi Service (Catalog Service)</h2>
        <button onClick={fetchProducts} disabled={!token}>
          Fetch Products
        </button>

        {products.length > 0 && (
          <ul className="product-list">
            {products.map(p => (
              <li key={p.id}>{p.name} - ${p.price}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="status-message">
        <strong>Status:</strong> {message}
      </div>

      <style>{`
        .test-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
          font-family: sans-serif;
        }
        .card {
          border: 1px solid #ccc;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .form-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          padding: 0.5rem 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background: #ccc;
        }
        .token-box {
          word-break: break-all;
          font-size: 0.8rem;
          background: #eee;
          padding: 0.5rem;
          margin-top: 0.5rem;
        }
        .product-list {
          text-align: left;
          margin-top: 1rem;
        }
        .status-message {
          margin-top: 1rem;
          padding: 0.5rem;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  )
}

export default App
