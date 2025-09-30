import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminSecurityLogs.css'; // For custom styling

const AdminSecurityLogs = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [failedLogins, setFailedLogins] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    try {
      // Fetching the data for login history, failed logins, and fraud alerts
      const loginHistoryResponse = await axios.get('http://192.168.100.30:5000/api/admin/security/login-history');
      const failedLoginsResponse = await axios.get('http://192.168.100.30:5000/api/admin/security/failed-logins');
      const fraudAlertsResponse = await axios.get('http://192.168.100.30:5000/api/admin/security/fraud-alerts');

      setLoginHistory(loginHistoryResponse.data);
      setFailedLogins(failedLoginsResponse.data);
      setFraudAlerts(fraudAlertsResponse.data);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    }
  };

  return (
    <div className="security-logs-container">
      <h2>Security Logs</h2>
      
      <section className="security-section">
        <h3>Login History</h3>
        <table className="security-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loginHistory.map((log, index) => (
              <tr key={index}>
                <td>{log.date}</td>
                <td>{log.user}</td>
                <td>{log.ipAddress}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="security-section">
        <h3>Failed Login Attempts</h3>
        <table className="security-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>IP Address</th>
              <th>Attempt</th>
            </tr>
          </thead>
          <tbody>
            {failedLogins.map((log, index) => (
              <tr key={index}>
                <td>{log.date}</td>
                <td>{log.user}</td>
                <td>{log.ipAddress}</td>
                <td>{log.attempt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="security-section">
        <h3>Fraud Detection Alerts</h3>
        <table className="security-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Alert Type</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fraudAlerts.map((alert, index) => (
              <tr key={index}>
                <td>{alert.date}</td>
                <td>{alert.type}</td>
                <td>{alert.details}</td>
                <td>{alert.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminSecurityLogs;
