const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/leadModel');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

class MatchTestingService {
    async runTestSuite(options = {}) {
        const {
            testType = 'all',
            sampleSize = 100,
            scenarios = ['standard', 'edge', 'error']
        } = options;

        const results = {
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                duration: 0
            },
            tests: [],
            coverage: {},
            performance: {},
            recommendations: []
        };

        const startTime = Date.now();

        try {
            switch (testType) {
                case 'unit':
                    results.tests = await this.runUnitTests(sampleSize);
                    break;
                case 'integration':
                    results.tests = await this.runIntegrationTests(sampleSize);
                    break;
                case 'performance':
                    results.tests = await this.runPerformanceTests(sampleSize);
                    break;
                case 'all':
                    results.tests = [
                        ...(await this.runUnitTests(sampleSize)),
                        ...(await this.runIntegrationTests(sampleSize)),
                        ...(await this.runPerformanceTests(sampleSize))
                    ];
                    break;
            }

            results.summary.total = results.tests.length;
            results.summary.passed = results.tests.filter(t => t.status === 'passed').length;
            results.summary.failed = results.tests.filter(t => t.status === 'failed').length;
            results.summary.duration = Date.now() - startTime;

            results.coverage = await this.calculateTestCoverage(results.tests);
            results.performance = await this.analyzeTestPerformance(results.tests);
            results.recommendations = this.generateTestRecommendations(results);

            await this.saveTestResults(results);
            return results;

        } catch (error) {
            console.error('Test suite error:', error);
            throw new Error(`Test suite failed: ${error.message}`);
        }
    }

    async runUnitTests(sampleSize) {
        const tests = [];
        
        // Test match scoring algorithm
        tests.push(await this.testMatchScoring());
        
        // Test match validation
        tests.push(await this.testMatchValidation());
        
        // Test match filtering
        tests.push(await this.testMatchFiltering());
        
        // Test data generation for sample matches
        for (let i = 0; i < sampleSize; i++) {
            tests.push(await this.testSampleMatch());
        }

        return tests;
    }

    async runIntegrationTests(sampleSize) {
        const tests = [];
        
        // Test complete match workflow
        tests.push(await this.testMatchWorkflow());
        
        // Test business-lead interaction
        tests.push(await this.testBusinessLeadInteraction());
        
        // Test notification system
        tests.push(await this.testNotificationSystem());
        
        // Test payment integration
        tests.push(await this.testPaymentIntegration());

        return tests;
    }

    async runPerformanceTests(sampleSize) {
        const tests = [];
        
        // Test match creation performance
        tests.push(await this.testMatchCreationPerformance(sampleSize));
        
        // Test search performance
        tests.push(await this.testSearchPerformance(sampleSize));
        
        // Test concurrent matches
        tests.push(await this.testConcurrentMatches(sampleSize));

        return tests;
    }

    async testMatchScoring() {
        const testCases = this.generateTestCases('scoring', 10);
        const results = [];

        for (const testCase of testCases) {
            try {
                const score = await this.calculateMatchScore(testCase.business, testCase.lead);
                const expected = this.calculateExpectedScore(testCase.business, testCase.lead);
                
                results.push({
                    type: 'scoring',
                    status: Math.abs(score - expected) < 0.1 ? 'passed' : 'failed',
                    expected,
                    actual: score,
                    data: testCase
                });
            } catch (error) {
                results.push({
                    type: 'scoring',
                    status: 'failed',
                    error: error.message,
                    data: testCase
                });
            }
        }

        return results;
    }

    async testMatchValidation() {
        const testCases = [
            { type: 'valid', data: this.generateValidMatchData() },
            { type: 'invalid_business', data: this.generateInvalidBusinessData() },
            { type: 'invalid_lead', data: this.generateInvalidLeadData() },
            { type: 'invalid_score', data: this.generateInvalidScoreData() }
        ];

        return Promise.all(testCases.map(async testCase => {
            try {
                const isValid = await this.validateMatch(testCase.data);
                return {
                    type: 'validation',
                    subType: testCase.type,
                    status: isValid === (testCase.type === 'valid') ? 'passed' : 'failed',
                    data: testCase.data
                };
            } catch (error) {
                return {
                    type: 'validation',
                    subType: testCase.type,
                    status: 'failed',
                    error: error.message,
                    data: testCase.data
                };
            }
        }));
    }

    async calculateTestCoverage(tests) {
        const coverage = {
            total: tests.length,
            byType: {},
            byComponent: {},
            byScenario: {}
        };

        tests.forEach(test => {
            coverage.byType[test.type] = (coverage.byType[test.type] || 0) + 1;
            if (test.component) {
                coverage.byComponent[test.component] = (coverage.byComponent[test.component] || 0) + 1;
            }
            if (test.scenario) {
                coverage.byScenario[test.scenario] = (coverage.byScenario[test.scenario] || 0) + 1;
            }
        });

        return coverage;
    }

    async analyzeTestPerformance(tests) {
        const performanceTests = tests.filter(t => t.type === 'performance');
        
        return {
            averageResponseTime: this.calculateAverageResponseTime(performanceTests),
            maxResponseTime: this.calculateMaxResponseTime(performanceTests),
            throughput: this.calculateThroughput(performanceTests),
            concurrentUsers: this.calculateConcurrentUsers(performanceTests)
        };
    }

    generateTestRecommendations(results) {
        const recommendations = [];

        // Coverage recommendations
        if (results.coverage.total < 100) {
            recommendations.push({
                type: 'coverage',
                priority: 'high',
                message: 'Increase test coverage to improve system reliability'
            });
        }

        // Performance recommendations
        if (results.performance.averageResponseTime > 1000) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: 'Optimize match creation process to improve response time'
            });
        }

        // Error handling recommendations
        const failedTests = results.tests.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                message: 'Address failed tests to improve system stability',
                tests: failedTests.map(t => t.id)
            });
        }

        return recommendations;
    }

    generateTestCases(type, count) {
        return Array(count).fill(null).map(() => ({
            business: this.generateTestBusiness(),
            lead: this.generateTestLead(),
            expectedOutcome: this.generateExpectedOutcome()
        }));
    }

    generateTestBusiness() {
        return {
            name: faker.company.name(),
            category: faker.commerce.department(),
            location: {
                city: faker.location.city(),
                state: faker.location.state(),
                country: faker.location.country()
            },
            capacity: faker.number.int({ min: 1, max: 100 }),
            rating: faker.number.float({ min: 1, max: 5, precision: 0.1 })
        };
    }

    generateTestLead() {
        return {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            requirements: Array(3).fill(null).map(() => faker.commerce.productName()),
            budget: faker.number.int({ min: 1000, max: 100000 }),
            urgency: faker.number.int({ min: 1, max: 5 })
        };
    }

    async saveTestResults(results) {
        // Implementation for saving test results to database
        // This would typically involve creating a TestResult model and saving the data
    }
}

module.exports = new MatchTestingService(); 