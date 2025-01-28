const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const loadTemplate = async (templateName) => {
    const filePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    const template = await fs.readFile(filePath, 'utf-8');
    return handlebars.compile(template);
};

exports.sendOrderConfirmation = async (order) => {
    const template = await loadTemplate('orderConfirmation');
    const html = template({
        orderNumber: order.orderNumber,
        items: order.items,
        total: order.total,
        shipping: order.shipping
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customer.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html
    });
};

exports.sendOrderStatusUpdate = async (order) => {
    const template = await loadTemplate('orderStatus');
    const html = template({
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.shipping.trackingNumber
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customer.email,
        subject: `Order #${order.orderNumber} Status Update`,
        html
    });
};

exports.sendVendorNotification = async (order) => {
    const template = await loadTemplate('vendorOrder');
    const html = template({
        orderNumber: order.orderNumber,
        items: order.items,
        shipping: order.shipping
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.vendor.email,
        subject: `New Order #${order.orderNumber}`,
        html
    });
}; 