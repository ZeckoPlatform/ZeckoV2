const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const Bid = require('../models/bidModel');

class ExportService {
    async exportBidHistory(userId, options) {
        const { format, startDate, endDate, includeDetails } = options;

        // Build query
        const query = { bidder: userId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Fetch bids with populated data
        const bids = await Bid.find(query)
            .populate('product', 'title images category startPrice')
            .sort('-createdAt');

        switch (format) {
            case 'csv':
                return this.generateCSV(bids, includeDetails);
            case 'xlsx':
                return this.generateExcel(bids, includeDetails);
            case 'pdf':
                return this.generatePDF(bids, includeDetails);
            default:
                throw new Error('Unsupported export format');
        }
    }

    async generateCSV(bids, includeDetails) {
        const fields = includeDetails ? [
            'Date',
            'Auction Title',
            'Bid Amount',
            'Status',
            'Category',
            'Start Price',
            'Final Price'
        ] : [
            'Date',
            'Auction Title',
            'Bid Amount',
            'Status'
        ];

        const data = bids.map(bid => {
            const basic = {
                Date: bid.createdAt.toISOString(),
                'Auction Title': bid.product.title,
                'Bid Amount': bid.amount,
                'Status': this.getBidStatus(bid)
            };

            if (includeDetails) {
                return {
                    ...basic,
                    'Category': bid.product.category.name,
                    'Start Price': bid.product.startPrice,
                    'Final Price': bid.product.bidding.finalPrice
                };
            }

            return basic;
        });

        const parser = new Parser({ fields });
        return parser.parse(data);
    }

    async generateExcel(bids, includeDetails) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bid History');

        // Define columns
        const columns = includeDetails ? [
            { header: 'Date', key: 'date' },
            { header: 'Auction Title', key: 'title' },
            { header: 'Bid Amount', key: 'amount' },
            { header: 'Status', key: 'status' },
            { header: 'Category', key: 'category' },
            { header: 'Start Price', key: 'startPrice' },
            { header: 'Final Price', key: 'finalPrice' }
        ] : [
            { header: 'Date', key: 'date' },
            { header: 'Auction Title', key: 'title' },
            { header: 'Bid Amount', key: 'amount' },
            { header: 'Status', key: 'status' }
        ];

        worksheet.columns = columns;

        // Add rows
        bids.forEach(bid => {
            const basic = {
                date: bid.createdAt,
                title: bid.product.title,
                amount: bid.amount,
                status: this.getBidStatus(bid)
            };

            if (includeDetails) {
                worksheet.addRow({
                    ...basic,
                    category: bid.product.category.name,
                    startPrice: bid.product.startPrice,
                    finalPrice: bid.product.bidding.finalPrice
                });
            } else {
                worksheet.addRow(basic);
            }
        });

        return workbook.xlsx.writeBuffer();
    }

    async generatePDF(bids, includeDetails) {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {});

        // Add title
        doc.fontSize(16).text('Bid History Report', { align: 'center' });
        doc.moveDown();

        // Add bids
        bids.forEach(bid => {
            doc.fontSize(12).text(`Auction: ${bid.product.title}`);
            doc.fontSize(10).text(`Date: ${bid.createdAt.toLocaleDateString()}`);
            doc.text(`Bid Amount: $${bid.amount}`);
            doc.text(`Status: ${this.getBidStatus(bid)}`);

            if (includeDetails) {
                doc.text(`Category: ${bid.product.category.name}`);
                doc.text(`Start Price: $${bid.product.startPrice}`);
                if (bid.product.bidding.finalPrice) {
                    doc.text(`Final Price: $${bid.product.bidding.finalPrice}`);
                }
            }

            doc.moveDown();
        });

        doc.end();

        return Buffer.concat(buffers);
    }

    getBidStatus(bid) {
        if (bid.product.bidding.winner?.equals(bid.bidder)) {
            return 'Won';
        }
        if (bid.product.bidding.ended) {
            return 'Lost';
        }
        if (bid.amount === bid.product.bidding.currentBid) {
            return 'Current Highest';
        }
        return 'Outbid';
    }
}

module.exports = new ExportService(); 