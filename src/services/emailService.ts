
export interface EmailData {
  to_email: string;
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
}

class EmailService {
  async sendRegistrationNotification(userDetails: {
    fullName: string;
    email: string;
    registrationDate: string;
    ipAddress?: string;
  }): Promise<boolean> {
    try {
      // Prepare email data for the admin
      const emailData = {
        to_email: 'sshaikh41790@gmail.com',
        from_name: userDetails.fullName,
        from_email: userDetails.email,
        subject: 'New User Registration Notification',
        message: `
🔔 NEW USER REGISTRATION

User Details:
📝 Name: ${userDetails.fullName}
📧 Email: ${userDetails.email}
📅 Registration Date: ${new Date(userDetails.registrationDate).toLocaleString()}
🌐 IP Address: ${userDetails.ipAddress || 'Unknown'}

This user has successfully registered on your platform.

---
Sent from your registration system
        `
      };

      console.log('📧 Sending registration notification email to admin:', {
        to: emailData.to_email,
        from: emailData.from_email,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });

      // Send the email notification to the backend
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Registration email sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send registration email:', response.statusText);
        // Even if email fails, don't block registration
        return true;
      }
    } catch (error) {
      console.error('❌ Error sending registration email:', error);
      // Don't block registration if email fails
      return true;
    }
  }
}

export const emailService = new EmailService();
