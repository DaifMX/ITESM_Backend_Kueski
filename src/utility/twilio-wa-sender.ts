const twilioSend = (message: string) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: message,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+5213324945924'
        })
        .then((message: any) => message.sid);
};