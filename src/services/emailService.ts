
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
  }): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to_email: 'sshaikh41790@gmail.com',
        from_name: userDetails.fullName,
        from_email: userDetails.email,
        subject: 'New User Registration',
        message: `
          New user registration details:
          
          Name: ${userDetails.fullName}
          Email: ${userDetails.email}
          Registration Date: ${new Date(userDetails.registrationDate).toLocaleString()}
          
          Please review and approve the new user registration.
        `
      };

      // Log the email data for now (in production, integrate with EmailJS or backend)
      console.log('📧 Registration email prepared for admin:', emailData);
      
      // Simulate successful email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would integrate with EmailJS like this:
      // await emailjs.send('your_service_id', 'your_template_id', emailData, 'your_public_key');
      
      return true;
    } catch (error) {
      console.error('Failed to send registration email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
