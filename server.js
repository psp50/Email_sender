import nodemailer from 'nodemailer';
import http from 'http';
import Url from 'url'
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.Senders_emailid,
        pass: process.env.Senders_password
    }
});

const handleIncomingData = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
    );
}


const server = http.createServer(async (req,res) =>{
    const {method,url} = req;
    const {pathname} = Url.parse(url);

    if(method === "POST" && pathname === "/send-email"){
        const { to = "",subject = "", text = "",html = "" } = await handleIncomingData(req);
        const mailoptions = {
            from: process.env.Senders_emailid,
            to,
            subject,
            text,
            html
        };
        transporter.sendMail(mailoptions, (error, info) => {
            if (error) {
                console.log(error);
                res.statusCode = 500;
                res.end("Failed to send email");
            } else {
                console.log('Email sent: ' + info.response);
                res.statusCode = 200;
                res.end("Email sent successfully");
            }
        });
        return;
    }
    res.statusCode = 404;
    res.end("Not Found");
})

server.listen(3000,()=> console.log("server is UP!"));