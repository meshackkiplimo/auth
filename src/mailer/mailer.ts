import nodemailer from 'nodemailer';


export  const sendMail = async (
    email: string,
    subject: string,
    message: string,
    html: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            host:process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 465,
            service:'gmail',
            secure: process.env.SMTP_SECURE === 'true', 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }


        })
        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: subject,
            text: message,
            html: html
        }
        const mailRes = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", mailRes);
        if(mailRes.accepted.length>0){
            return {
                success: true,
                message: "Email sent successfully",
                info: mailRes
            };
        }else if(mailRes.rejected.length>0){
            return {
                success: false,
                message: "Email sending failed",
                info: mailRes
            };
        
        
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
        
    }
    }
}
b


    
