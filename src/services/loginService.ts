
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StoredUser {
  fullName: string;
  email: string;
  password: string;
  registrationDate: string;
  approved: boolean;
  ipAddress?: string;
}

class LoginService {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: StoredUser; message: string }> {
    try {
      // Get stored user from localStorage
      const storedUserData = localStorage.getItem('registeredUser');
      
      if (!storedUserData) {
        return { success: false, message: 'No registered user found. Please register first.' };
      }

      const storedUser: StoredUser = JSON.parse(storedUserData);
      
      // Check email match (case insensitive)
      if (storedUser.email.toLowerCase() !== credentials.email.toLowerCase()) {
        return { success: false, message: 'Email does not match.' };
      }

      // Check password match (exact match)
      if (storedUser.password !== credentials.password) {
        return { success: false, message: 'Password does not match.' };
      }

      // Login successful - send notification email
      await this.sendLoginNotification(storedUser);

      return { success: true, user: storedUser, message: 'Login successful!' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  }

  private async sendLoginNotification(user: StoredUser): Promise<void> {
    try {
      // Get user's current IP address
      let currentIp = 'Unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        currentIp = ipData.ip;
      } catch (ipError) {
        console.log('Could not fetch current IP:', ipError);
      }

      const emailData = {
        to_email: 'mytheriousmee47@gmail.com',
        from_name: user.fullName,
        from_email: user.email,
        subject: 'User Login Notification',
        message: `
🔐 USER LOGIN NOTIFICATION

Login Details:
📝 Name: ${user.fullName}
📧 Email: ${user.email}
🕐 Login Time: ${new Date().toLocaleString()}
🌐 IP Address: ${currentIp}
📅 Original Registration: ${new Date(user.registrationDate).toLocaleString()}

This user has successfully logged into your platform.

---
Sent from your login system
        `
      };

      console.log('📧 Sending login notification email:', {
        to: emailData.to_email,
        from: emailData.from_email,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/send-login-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Login notification email sent successfully');
      } else {
        console.error('❌ Failed to send login notification email:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error sending login notification email:', error);
    }
  }
}

export const loginService = new LoginService();
