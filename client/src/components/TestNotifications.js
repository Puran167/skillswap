import React, { useState } from 'react';
import axios from 'axios';

const TestNotifications = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/test/test-email',
        {
          email,
          subject: 'Test Email from SkillSwap',
          message: message || 'This is a test email to verify email notifications are working.'
        },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      if (response.data.success) {
        setResult('✅ Test email sent successfully!');
      }
    } catch (error) {
      setResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="test-notifications" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Test Email Notifications</h2>
      <form onSubmit={sendTestEmail}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to test"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Test Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional custom message"
            rows="4"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          color: result.includes('✅') ? '#155724' : '#721c24'
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>Email Notifications Features:</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ Welcome email on user registration</li>
          <li>✅ Login notification email</li>
          <li>✅ New message email notifications</li>
          <li>✅ Session reminder emails (automated)</li>
          <li>✅ Swap request notifications</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: '10px 0' }}>
          All email notifications are sent automatically when relevant actions occur.
          Users can manage their notification preferences in their profile settings.
        </p>
      </div>
    </div>
  );
};

export default TestNotifications;
