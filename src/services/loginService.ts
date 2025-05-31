
import { dashboardService } from './dashboardService';
import { persistenceService, UserData, LoginAttempt } from './persistenceService';

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
      // Enhanced email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        await this.logLoginAttempt(credentials.email, '', false);
        return { success: false, message: 'Invalid email format.' };
      }

      // Get user from enhanced database
      const userData = persistenceService.getUserByEmail(credentials.email);
      
      if (!userData) {
        await this.logLoginAttempt(credentials.email, '', false);
        return { success: false, message: 'No account found with this email. Please register first.' };
      }

      // Validate password (exact match)
      if (userData.password !== credentials.password) {
        await this.logLoginAttempt(credentials.email, userData.fullName, false);
        return { success: false, message: 'Incorrect password.' };
      }

      // Get current IP
      let currentIp = 'Unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        currentIp = ipData.ip;
      } catch (ipError) {
        console.log('Could not fetch current IP:', ipError);
      }

      // Update last login date
      userData.lastLoginDate = new Date().toISOString();
      persistenceService.saveUser(userData);

      // Track successful login
      dashboardService.trackLogin(userData.email, userData.fullName, currentIp);
      await this.logLoginAttempt(credentials.email, userData.fullName, true);

      // Send notification email
      await this.sendLoginNotification({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        registrationDate: userData.registrationDate,
        approved: true
      }, currentIp);

      return { 
        success: true, 
        user: {
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
          registrationDate: userData.registrationDate,
          approved: true
        }, 
        message: 'Login successful!' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  }

  private async logLoginAttempt(email: string, userName: string, success: boolean): Promise<void> {
    const attempt: LoginAttempt = {
      id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      userName,
      loginTime: new Date().toISOString(),
      success
    };

    persistenceService.saveLoginAttempt(attempt);
  }

  private async sendLoginNotification(user: StoredUser, currentIp: string): Promise<void> {
    try {
      const emailData = {
        to_email: 'mysteriousmee47@gmail.com',
        from_name: user.fullName,
        from_email: user.email,
        subject: `🔐 User Login: ${user.fullName}`,
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

      console.log('📧 Sending login notification email to mysteriousmee47@gmail.com:', {
        user: user.email,
        name: user.fullName,
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
        console.error('❌ Failed to send login notification email');
      }
    } catch (error) {
      console.error('❌ Error sending login notification email:', error);
    }
  }
}

export const loginService = new LoginService();
