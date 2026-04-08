import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherDashboard.css';

const WeatherDashboard = ({ onLogout }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const user = localStorage.getItem('user');

    const fetchWeatherData = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            // Gọi endpoint bảo mật thông qua Gateway
            const response = await axios.get('http://localhost:8080/api/IDENTITY/weatherforecast', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setData(response.data);
        } catch (err) {
            setError(err.response?.status === 401 ? 'Phiên đăng nhập hết hạn' : 'Lỗi lấy dữ liệu');
            if (err.response?.status === 401) {
                onLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="user-info">
                    Hello, <strong>{user}</strong>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </header>

            <main>
                <h2>Protected Weather Data</h2>
                <p>Data fetched from <code>IdentityService</code> through <code>Gateway</code> (JWT verified)</p>
                
                {loading && <div className="loader">Loading...</div>}
                
                {error && <div className="error-box">{error}</div>}

                {!loading && data.length > 0 && (
                    <table className="weather-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Temp (C)</th>
                                <th>Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{item.temperatureC}°C</td>
                                    <td><span className="summary-badge">{item.summary}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <button className="refresh-btn" onClick={fetchWeatherData} disabled={loading}>
                    Refresh Data
                </button>
            </main>
        </div>
    );
};

export default WeatherDashboard;
