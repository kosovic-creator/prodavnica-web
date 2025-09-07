/* eslint-disable @typescript-eslint/no-unused-vars */
import nodemailer from 'nodemailer';

// Funkcija za slanje emaila
async function sendOrderConfirmationEmail(userEmail: string, orderId: number) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'drasko.kosovic@gmail.com',
            pass: 'dfhc myjw hdqp qznu'
        }
    });

    const mailOptions = {
        from: 'drasko.kosovic@gmail.com',
        to: userEmail,
        subject: 'Potvrda porudžbine',
        text: `Vaša porudžbina #${orderId} je potvrđena. Hvala na kupovini!`
    };

    await transporter.sendMail(mailOptions);
}

// // U funkciji za završetak kupovine:
// exports.completeOrder = async (req, res) => {
//     // ...existing code...
//     const order = await Order.create({ /* podaci o porudžbini */ });
//     await sendOrderConfirmationEmail(req.user.email, order.id);
//     res.status(201).json({ message: 'Porudžbina potvrđena', order });
//     // ...existing code...
// }