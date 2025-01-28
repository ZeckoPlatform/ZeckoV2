const User = require('../models/userModel');
const Lead = require('../models/Lead');
const BusinessModel = require('../models/businessModel');

class SmartMatchService {
    constructor() {
        this.weightFactors = {
            expertise: 0.25,
            availability: 0.15,
            locationMatch: 0.10,
            responseTime: 0.15,
            completionRate: 0.15,
            customerRating: 0.20
        };
    }

    async calculateMatchScore(businessId, leadId) {
        const business = await BusinessModel.findById(businessId)
            .populate('reviews')
            .populate('completedProjects');
        const lead = await Lead.findById(leadId);

        if (!business || !lead) {
            throw new Error('Business or Lead not found');
        }

        // Calculate individual scores
        const expertiseScore = this.calculateExpertiseScore(business, lead);
        const availabilityScore = this.calculateAvailabilityScore(business);
        const locationScore = this.calculateLocationScore(business, lead);
        const responseScore = this.calculateResponseTimeScore(business);
        const completionScore = this.calculateCompletionRateScore(business);
        const ratingScore = this.calculateCustomerRatingScore(business);

        // Calculate weighted final score
        const finalScore = (
            expertiseScore * this.weightFactors.expertise +
            availabilityScore * this.weightFactors.availability +
            locationScore * this.weightFactors.locationMatch +
            responseScore * this.weightFactors.responseTime +
            completionScore * this.weightFactors.completionRate +
            ratingScore * this.weightFactors.customerRating
        );

        return {
            totalScore: Math.round(finalScore * 100) / 100,
            details: {
                expertise: expertiseScore,
                availability: availabilityScore,
                location: locationScore,
                responseTime: responseScore,
                completionRate: completionScore,
                customerRating: ratingScore
            }
        };
    }

    calculateExpertiseScore(business, lead) {
        const categoryMatch = business.categories.some(
            cat => lead.categories.includes(cat.toString())
        );
        const skillsMatch = business.skills.filter(
            skill => lead.requiredSkills.includes(skill)
        ).length / lead.requiredSkills.length;

        return (categoryMatch ? 0.6 : 0) + (skillsMatch * 0.4);
    }

    calculateAvailabilityScore(business) {
        const currentProjects = business.activeProjects.length;
        const maxCapacity = business.maxProjectCapacity || 5;
        return Math.max(0, 1 - (currentProjects / maxCapacity));
    }

    calculateLocationScore(business, lead) {
        // Using the Haversine formula for distance calculation
        const distance = this.calculateDistance(
            business.location.coordinates,
            lead.location.coordinates
        );
        
        // Score decreases as distance increases
        return Math.max(0, 1 - (distance / 100)); // 100km as base distance
    }

    calculateResponseTimeScore(business) {
        const avgResponseTime = business.averageResponseTime || 24; // hours
        return Math.max(0, 1 - (avgResponseTime / 48)); // 48 hours as base time
    }

    calculateCompletionRateScore(business) {
        const completed = business.completedProjects.length;
        const total = completed + business.cancelledProjects.length;
        return total > 0 ? completed / total : 0.5; // Default score for new businesses
    }

    calculateCustomerRatingScore(business) {
        if (!business.reviews || business.reviews.length === 0) {
            return 0.5; // Default score for new businesses
        }
        
        const avgRating = business.reviews.reduce(
            (sum, review) => sum + review.rating, 0
        ) / business.reviews.length;
        
        return avgRating / 5; // Normalize to 0-1 scale
    }

    calculateDistance(coords1, coords2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(coords2[0] - coords1[0]);
        const dLon = this.toRad(coords2[1] - coords1[1]);
        const lat1 = this.toRad(coords1[0]);
        const lat2 = this.toRad(coords2[0]);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * 
                Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(value) {
        return value * Math.PI / 180;
    }

    async findMatches(leadId, threshold = 0.7) {
        const lead = await Lead.findById(leadId);
        if (!lead) {
            throw new Error('Lead not found');
        }

        // Find businesses in the same category
        const potentialMatches = await BusinessModel.find({
            categories: { $in: lead.categories },
            isActive: true,
            subscriptionStatus: 'active'
        });

        const matches = [];
        for (const business of potentialMatches) {
            const matchScore = await this.calculateMatchScore(business._id, leadId);
            if (matchScore.totalScore >= threshold) {
                matches.push({
                    business: business._id,
                    score: matchScore.totalScore,
                    details: matchScore.details
                });
            }
        }

        // Sort matches by score
        return matches.sort((a, b) => b.score - a.score);
    }
}

module.exports = new SmartMatchService(); 