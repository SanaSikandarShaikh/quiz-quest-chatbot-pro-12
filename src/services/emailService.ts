
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
      // Prepare email data for mysteriousmee47@gmail.com
      const emailData = {
        to_email: 'mysteriousmee47@gmail.com', // Always send to your email
        from_name: userDetails.fullName,
        from_email: userDetails.email,
        subject: `🔔 New Registration: ${userDetails.fullName}`,
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

      console.log('📧 Sending registration notification email to mysteriousmee47@gmail.com:', {
        user: emailData.from_email,
        name: emailData.from_name,
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
        console.log('✅ Registration email sent successfully to mysteriousmee47@gmail.com');
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
