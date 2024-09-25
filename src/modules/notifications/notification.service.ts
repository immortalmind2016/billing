import { inject, injectable } from 'inversify';

@injectable()
export class NotificationService {
  constructor(@inject('Env') private env: Env) {}

  async sendNotification(data: any) {
    const axios = require('axios');
    
    try {
      const response = await axios.post('https://api.sendinblue.com/v3/smtp/email', {
        sender: { email: this.env.SENDINBLUE_FROM_EMAIL },
        to: [{ email: data.to }],
        subject: data.subject,
        textContent: data.content
      }, {
        headers: {
          'api-key': this.env.SENDINBLUE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        console.log('Email sent successfully');
        return true;
      } else {
        console.error('Failed to send email:', response.data);
        return false;
      }
    } catch (error:any) {
      console.error('Error sending email:', error.response ? error.response.data : error.message);
      return false;
    }
  }

 
}
