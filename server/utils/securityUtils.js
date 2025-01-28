const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const he = require('he');

const securityUtils = {
    // Sanitize HTML content
    sanitizeHtml: (dirty) => {
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        });
    },

    // Encode text content
    encodeText: (text) => {
        return he.encode(text);
    },

    // Sanitize and encode JSON response
    sanitizeResponse: (data) => {
        if (typeof data === 'string') {
            return he.encode(data);
        }
        if (Array.isArray(data)) {
            return data.map(item => securityUtils.sanitizeResponse(item));
        }
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = securityUtils.sanitizeResponse(value);
            }
            return sanitized;
        }
        return data;
    }
};

module.exports = securityUtils; 