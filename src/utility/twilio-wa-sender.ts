const twilioSend = (message: string, phoneNumber: bigint) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: message,
            from: 'whatsapp:+14155238886',
            to: `whatsapp:+521${phoneNumber}`
        })
        .then((message: any) => message.sid);
};