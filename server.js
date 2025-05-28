const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Local storage paths
const DATA_DIR = path.join(__dirname, 'local_data');
const CHAT_HISTORY_FILE = path.join(DATA_DIR, 'chat_history.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'mytheriousmee47@gmail.com', // Your email
      pass: 'your-app-password' // You need to set your Gmail app password here
    }
  });
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Initialize data files
async function initializeDataFiles() {
  try {
    await fs.access(CHAT_HISTORY_FILE);
  } catch {
    await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify([]));
  }
  
  try {
    await fs.access(SESSIONS_FILE);
  } catch {
    await fs.writeFile(SESSIONS_FILE, JSON.stringify([]));
  }
}

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  const { to_email, from_name, from_email, subject, message } = req.body;
  
  console.log('\n📧 EMAIL NOTIFICATION REQUEST');
  console.log('==================');
  console.log('Timestamp:', new Date().toISOString());
  console.log('To:', to_email);
  console.log('From:', from_email);
  console.log('Subject:', subject);
  console.log('==================\n');

  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: 'mytheriousmee47@gmail.com',
      to: 'mytheriousmee47@gmail.com', // Always send to your email
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            🔔 New User Registration
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">User Details:</h3>
            <p><strong>📝 Name:</strong> ${from_name}</p>
            <p><strong>📧 Email:</strong> ${from_email}</p>
            <p><strong>📅 Registration Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This user has successfully registered on your platform.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Sent from your registration system
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log('✅ EMAIL SENT SUCCESSFULLY to mytheriousmee47@gmail.com');
    console.log('Registration notification sent');
    console.log('==================\n');
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ EMAIL SENDING ERROR:', error.message);
    // Don't fail the registration if email fails
    console.log('⚠️ Continuing without email notification');
    res.json({ success: true, message: 'Registration completed (email notification failed)' });
  }
});

// Login email sending endpoint
app.post('/api/send-login-email', async (req, res) => {
  const { to_email, from_name, from_email, subject, message } = req.body;
  
  console.log('\n🔐 LOGIN EMAIL NOTIFICATION REQUEST');
  console.log('==================');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User Email:', from_email);
  console.log('User Name:', from_name);
  console.log('Sending to: mytheriousmee47@gmail.com');
  console.log('==================\n');

  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: 'mytheriousmee47@gmail.com',
      to: 'mytheriousmee47@gmail.com', // Always send to your email
      subject: `🔐 User Login: ${from_name}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            🔐 User Login Notification
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">Login Details:</h3>
            <p><strong>📝 Name:</strong> ${from_name}</p>
            <p><strong>📧 Email:</strong> ${from_email}</p>
            <p><strong>🕐 Login Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>🌐 Login from IP:</strong> Will be detected automatically</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This user has successfully logged into your platform.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Sent from your login system
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log('✅ LOGIN EMAIL SENT SUCCESSFULLY to mytheriousmee47@gmail.com');
    console.log('Login notification sent for user:', from_email);
    console.log('==================\n');
    
    res.json({ success: true, message: 'Login email sent successfully' });
  } catch (error) {
    console.error('❌ LOGIN EMAIL SENDING ERROR:', error.message);
    console.log('⚠️ Login will continue without email notification');
    res.json({ success: true, message: 'Login successful (email notification failed)' });
  }
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;
  
  console.log('\n🤖 GEMINI API REQUEST');
  console.log('==================');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Prompt:', prompt);
  console.log('==================\n');

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAfHYZ4RPOavnbAVnkEzGurKOYVW1U3RnE', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    console.log('✅ GEMINI API RESPONSE');
    console.log('Response:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    console.log('==================\n');
    
    res.json({ text });
  } catch (error) {
    console.error('❌ GEMINI API ERROR:', error.message);
    res.status(500).json({ 
      text: 'Sorry, I encountered an error processing your request.', 
      error: error.message 
    });
  }
});

// Chat history endpoints
app.get('/api/chat-history', async (req, res) => {
  try {
    const data = await fs.readFile(CHAT_HISTORY_FILE, 'utf8');
    const chatHistories = JSON.parse(data);
    console.log('📖 GET Chat Histories - Count:', chatHistories.length);
    res.json(chatHistories);
  } catch (error) {
    console.error('Error reading chat history:', error);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

app.post('/api/chat-history', async (req, res) => {
  try {
    const newChatHistory = req.body;
    const data = await fs.readFile(CHAT_HISTORY_FILE, 'utf8');
    const chatHistories = JSON.parse(data);
    
    const existingIndex = chatHistories.findIndex(h => h.id === newChatHistory.id);
    
    if (existingIndex >= 0) {
      chatHistories[existingIndex] = newChatHistory;
      console.log('📝 UPDATE Chat History - ID:', newChatHistory.id);
    } else {
      chatHistories.push(newChatHistory);
      console.log('✨ NEW Chat History - ID:', newChatHistory.id);
    }
    
    await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(chatHistories, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving chat history:', error);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

app.delete('/api/chat-history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(CHAT_HISTORY_FILE, 'utf8');
    const chatHistories = JSON.parse(data);
    const filtered = chatHistories.filter(h => h.id !== id);
    
    await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(filtered, null, 2));
    console.log('🗑️ DELETE Chat History - ID:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
});

// Sessions endpoints
app.get('/api/sessions', async (req, res) => {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf8');
    const sessions = JSON.parse(data);
    console.log('📋 GET Sessions - Count:', sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error('Error reading sessions:', error);
    res.status(500).json({ error: 'Failed to load sessions' });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const sessions = req.body;
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    console.log('💾 SAVE Sessions - Count:', sessions.length);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving sessions:', error);
    res.status(500).json({ error: 'Failed to save sessions' });
  }
});

// Start server
async function startServer() {
  await ensureDataDir();
  await initializeDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🚀 Local Backend Server running on http://localhost:${PORT}`);
    console.log('📁 Data stored in:', DATA_DIR);
    console.log('📧 Email notifications enabled');
    console.log('🔍 All requests will be logged in terminal\n');
  });
}

startServer();
