const zxcvbn = require('zxcvbn');
const bcrypt = require('bcryptjs');

class PasswordService {
    static validatePassword(password, email, username) {
        // Use zxcvbn for comprehensive password strength checking
        const result = zxcvbn(password, [email, username]); // User data as forbidden inputs

        // Password requirements
        const requirements = {
            minLength: password.length >= 12,
            maxLength: password.length <= 128,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            noCommonWords: result.score >= 3,
            noPersonalInfo: !result.feedback.suggestions.includes('personal_info')
        };

        // Check if password meets all requirements
        const isValid = Object.values(requirements).every(Boolean);

        // Generate detailed feedback
        const feedback = {
            score: result.score,
            isValid,
            requirements,
            suggestions: result.feedback.suggestions,
            warnings: result.feedback.warning ? [result.feedback.warning] : [],
            timeToBreak: result.crack_times_display.offline_slow_hashing_1e4_per_second
        };

        if (!requirements.minLength) {
            feedback.warnings.push('Password must be at least 12 characters long');
        }
        if (!requirements.hasUppercase) {
            feedback.warnings.push('Password must contain uppercase letters');
        }
        if (!requirements.hasLowercase) {
            feedback.warnings.push('Password must contain lowercase letters');
        }
        if (!requirements.hasNumbers) {
            feedback.warnings.push('Password must contain numbers');
        }
        if (!requirements.hasSpecialChars) {
            feedback.warnings.push('Password must contain special characters');
        }

        return feedback;
    }

    static async hashPassword(password) {
        // Increase salt rounds for better security (default is 10)
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    static async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    static enforcePasswordHistory(newPassword, passwordHistory) {
        // Check if the new password matches any of the last 5 passwords
        return !passwordHistory.some(async (oldHash) => {
            return await bcrypt.compare(newPassword, oldHash);
        });
    }
}

module.exports = PasswordService; 