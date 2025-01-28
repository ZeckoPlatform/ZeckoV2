const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const SecurityLog = require('../models/securityLogModel');
const SecurityRule = require('../models/securityRuleModel');
const SecurityAlert = require('../models/securityAlertModel');

class MatchSecurityService {
    constructor() {
        this.rateLimiters = new Map();
        this.securityRules = new Map();
        this.initializeSecurity();
    }

    async initializeSecurity() {
        await this.loadSecurityRules();
        this.setupRateLimiters();
        this.startSecurityMonitoring();
    }

    async validateRequest(req, context = {}) {
        const validationResults = await Promise.all([
            this.validateAuthentication(req),
            this.validateAuthorization(req, context),
            this.validateRateLimit(req),
            this.validateInputs(req),
            this.validateBusinessRules(req, context)
        ]);

        const failures = validationResults.filter(result => !result.valid);
        
        if (failures.length > 0) {
            await this.logSecurityEvent({
                type: 'validation_failure',
                details: failures,
                request: this.sanitizeRequest(req)
            });
            
            throw new Error(failures.map(f => f.error).join(', '));
        }

        return true;
    }

    async validateAuthentication(req) {
        try {
            const token = this.extractToken(req);
            if (!token) {
                return { valid: false, error: 'No authentication token provided' };
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Invalid authentication token' };
        }
    }

    async validateAuthorization(req, context) {
        try {
            const { user } = req;
            const { resource, action } = context;

            const hasPermission = await this.checkPermission(user, resource, action);
            if (!hasPermission) {
                return { valid: false, error: 'Unauthorized access' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Authorization check failed' };
        }
    }

    validateRateLimit(req) {
        const limiter = this.getRateLimiter(req.path);
        return new Promise((resolve) => {
            limiter(req, {}, (error) => {
                if (error) {
                    resolve({ valid: false, error: 'Rate limit exceeded' });
                } else {
                    resolve({ valid: true });
                }
            });
        });
    }

    async validateInputs(req) {
        try {
            // Sanitize and validate request inputs
            const sanitizedBody = this.sanitizeInputs(req.body);
            const sanitizedQuery = this.sanitizeInputs(req.query);
            const sanitizedParams = this.sanitizeInputs(req.params);

            // Check for suspicious patterns
            const suspiciousPatterns = this.detectSuspiciousPatterns({
                body: sanitizedBody,
                query: sanitizedQuery,
                params: sanitizedParams
            });

            if (suspiciousPatterns.length > 0) {
                return {
                    valid: false,
                    error: 'Suspicious input patterns detected',
                    patterns: suspiciousPatterns
                };
            }

            // Update request with sanitized inputs
            req.body = sanitizedBody;
            req.query = sanitizedQuery;
            req.params = sanitizedParams;

            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Input validation failed' };
        }
    }

    async validateBusinessRules(req, context) {
        try {
            const rules = await this.getBusinessRules(context);
            const violations = [];

            for (const rule of rules) {
                const isValid = await this.evaluateRule(rule, req, context);
                if (!isValid) {
                    violations.push(rule.message);
                }
            }

            return violations.length === 0
                ? { valid: true }
                : { valid: false, error: violations.join(', ') };
        } catch (error) {
            return { valid: false, error: 'Business rule validation failed' };
        }
    }

    async monitorSecurityEvents() {
        try {
            const events = await this.getRecentSecurityEvents();
            const analysis = this.analyzeSecurityEvents(events);

            if (analysis.threats.length > 0) {
                await this.handleSecurityThreats(analysis.threats);
            }

            if (analysis.anomalies.length > 0) {
                await this.handleSecurityAnomalies(analysis.anomalies);
            }

            await this.updateSecurityMetrics(analysis);
        } catch (error) {
            console.error('Security monitoring error:', error);
        }
    }

    async handleSecurityThreats(threats) {
        for (const threat of threats) {
            await this.createSecurityAlert({
                type: 'threat',
                severity: threat.severity,
                details: threat
            });

            if (threat.severity === 'high') {
                await this.executeAutomatedResponse(threat);
            }
        }
    }

    async handleSecurityAnomalies(anomalies) {
        for (const anomaly of anomalies) {
            await this.createSecurityAlert({
                type: 'anomaly',
                severity: anomaly.severity,
                details: anomaly
            });

            await this.updateSecurityRules(anomaly);
        }
    }

    async logSecurityEvent(event) {
        await SecurityLog.create({
            timestamp: new Date(),
            ...event
        });
    }

    setupRateLimiters() {
        // API rate limiter
        this.rateLimiters.set('api', rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }));

        // Authentication rate limiter
        this.rateLimiters.set('auth', rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 5, // limit each IP to 5 failed attempts per windowMs
            skipSuccessfulRequests: true
        }));
    }

    getRateLimiter(path) {
        if (path.startsWith('/api/auth')) {
            return this.rateLimiters.get('auth');
        }
        return this.rateLimiters.get('api');
    }

    sanitizeInputs(data) {
        if (!data) return data;

        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else if (typeof value === 'object') {
                sanitized[key] = this.sanitizeInputs(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    sanitizeString(str) {
        // Remove potentially dangerous characters and patterns
        return str.replace(/[<>]/g, '');
    }

    detectSuspiciousPatterns(data) {
        const patterns = [];
        const suspiciousRegexes = [
            /script/i,
            /exec/i,
            /\b(and|or)\b.*?=/i,
            /<[^>]*>/
        ];

        const checkValue = (value) => {
            if (typeof value === 'string') {
                suspiciousRegexes.forEach(regex => {
                    if (regex.test(value)) {
                        patterns.push({
                            pattern: regex.toString(),
                            value
                        });
                    }
                });
            }
        };

        const traverse = (obj) => {
            for (const value of Object.values(obj)) {
                if (typeof value === 'object') {
                    traverse(value);
                } else {
                    checkValue(value);
                }
            }
        };

        traverse(data);
        return patterns;
    }

    async createSecurityAlert(alert) {
        await SecurityAlert.create({
            timestamp: new Date(),
            ...alert
        });
    }

    startSecurityMonitoring() {
        setInterval(() => this.monitorSecurityEvents(), 5 * 60 * 1000); // Every 5 minutes
    }

    sanitizeRequest(req) {
        return {
            method: req.method,
            path: req.path,
            query: this.sanitizeInputs(req.query),
            body: this.sanitizeInputs(req.body),
            headers: this.sanitizeHeaders(req.headers),
            ip: req.ip
        };
    }

    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        delete sanitized.authorization;
        delete sanitized.cookie;
        return sanitized;
    }
}

module.exports = new MatchSecurityService(); 