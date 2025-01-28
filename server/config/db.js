const mongoose = require('mongoose');
const EventEmitter = require('events');

class DatabaseService extends EventEmitter {
    constructor() {
        super();
        this.maxRetries = 5;
        this.retryCount = 0;
        this.isConnected = false;
    }

    async connect() {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                heartbeatFrequencyMS: 30000,
                maxPoolSize: 10,
                minPoolSize: 1,
                maxIdleTimeMS: 30000,
                retryWrites: true,
                w: 'majority'
            });

            this.connection = conn;
            this.isConnected = true;
            this.retryCount = 0;
            
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            this.setupEventHandlers();
            
            return conn;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            return this.handleConnectionError(error);
        }
    }

    setupEventHandlers() {
        mongoose.connection.on('error', err => {
            console.error('MongoDB error:', err);
            this.emit('error', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            this.isConnected = false;
            this.handleReconnect();
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established successfully');
            this.emit('connected');
        });

        // Monitor connection pool
        setInterval(() => {
            if (this.isConnected) {
                this.checkConnectionPool();
            }
        }, 60000); // Check every minute
    }

    async handleConnectionError(error) {
        if (this.retryCount < this.maxRetries) {
            const backoffDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
            this.retryCount++;
            
            console.log(`Retrying connection (${this.retryCount}/${this.maxRetries}) in ${backoffDelay}ms`);
            
            return new Promise(resolve => {
                setTimeout(async () => {
                    resolve(await this.connect());
                }, backoffDelay);
            });
        } else {
            console.error('Max retry attempts reached');
            this.emit('maxRetriesReached', error);
            throw error;
        }
    }

    handleReconnect() {
        if (!this.isConnected) {
            this.connect().catch(console.error);
        }
    }

    async checkConnectionPool() {
        try {
            const pool = mongoose.connection.client.topology.s.pool;
            
            // Emit pool stats
            this.emit('poolStats', {
                totalConnections: pool.totalConnectionCount,
                activeConnections: pool.activeConnectionCount,
                availableConnections: pool.availableConnectionCount,
                pendingConnections: pool.pendingConnectionCount
            });
            
            // Alert if pool is near capacity
            if (pool.activeConnectionCount / pool.totalConnectionCount > 0.8) {
                console.warn('Connection pool nearing capacity');
                this.emit('poolNearCapacity');
            }
        } catch (error) {
            console.error('Error checking connection pool:', error);
        }
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected' };
            }
            
            await mongoose.connection.db.admin().ping();
            const pool = mongoose.connection.client.topology.s.pool;
            
            return {
                status: 'connected',
                poolStats: {
                    totalConnections: pool.totalConnectionCount,
                    activeConnections: pool.activeConnectionCount,
                    availableConnections: pool.availableConnectionCount
                },
                latency: await this.measureLatency()
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async measureLatency() {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        return Date.now() - start;
    }

    async disconnect() {
        if (this.isConnected) {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('MongoDB disconnected successfully');
        }
    }
}

const dbService = new DatabaseService();

module.exports = dbService; 