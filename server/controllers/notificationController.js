const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = {
  // Get user notifications
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ 
        user: req.user.id,
        read: false 
      }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add proposal notification handling
  getProposalNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({
        recipient: req.user._id,
        type: { $in: ['proposal_received', 'proposal_accepted', 'proposal_rejected'] }
      })
      .sort({ createdAt: -1 })
      .limit(50);

      res.json(notifications);
    } catch (error) {
      console.error('Get proposal notifications error:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  },

  sendEmailNotification: catchAsync(async (req, res, next) => {
    const { type, title, message, data } = req.body;
    const user = await User.findById(req.user._id)
        .select('email biddingPreferences');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if user has email notifications enabled
    if (!user.biddingPreferences?.emailNotifications) {
        return res.status(200).json({
            status: 'success',
            message: 'Email notifications disabled by user'
        });
    }

    const emailContent = formatEmailContent(type, title, message, data);

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: title,
        html: emailContent
    });

    res.status(200).json({
        status: 'success',
        message: 'Email notification sent'
    });
  }),

  formatEmailContent: (type, title, message, data) => {
    let template = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${title}</h2>
            <p style="color: #666;">${message}</p>
    `;

    switch (type) {
        case 'BID_OUTBID':
            template += `
                <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
                    <p>Current highest bid: ${data.currentBid}</p>
                    <p>Your previous bid: ${data.previousBid}</p>
                    <a href="${process.env.CLIENT_URL}/auctions/${data.auctionId}" 
                       style="background: #4CAF50; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Place New Bid
                    </a>
                </div>
            `;
            break;
        case 'AUCTION_ENDING':
            template += `
                <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
                    <p>Time remaining: ${data.timeRemaining}</p>
                    <p>Current highest bid: ${data.currentBid}</p>
                    <a href="${process.env.CLIENT_URL}/auctions/${data.auctionId}" 
                       style="background: #2196F3; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Auction
                    </a>
                </div>
            `;
            break;
        // Add more cases as needed
    }

    template += `
            <p style="color: #999; font-size: 12px;">
                You can manage your notification preferences in your account settings.
            </p>
        </div>
    `;

    return template;
  }
}; 