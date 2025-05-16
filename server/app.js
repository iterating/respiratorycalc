import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import dependencies
import SupabaseRespiratory from './src/database/SupabaseRespiratory.js';
import InMemoryRespiratoryRepository from './src/database/memory/InMemoryRespiratoryRepository.js';
import LocalStorageRespiratoryRepository from './src/database/localstorage/LocalStorageRespiratoryRepository.js';
import RespiratoryService from './src/services/RespiratoryService.js';
import RespiratoryController from './src/presentation/controllers/RespiratoryController.js';
import createRespiratoryRouter from './src/presentation/routes/respiratoryRoutes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Initialize instances
let repository;
let service;
let controller;
let router;

// Initialize application components
async function initialize() {
    try {
        // Initialize repository based on environment
        const storageType = process.env.STORAGE_TYPE || 'localstorage';
        let repository;
        
        switch (storageType) {
            case 'supabase':
                repository = new SupabaseRespiratory();
                break;
            case 'memory':
                repository = new InMemoryRespiratoryRepository();
                break;
            case 'localstorage':
            default:
                repository = new LocalStorageRespiratoryRepository();
                break;
        }
        
        await repository.initialize();
        console.log(`Repository (${storageType}) initialized successfully`);

        // Initialize service
        service = new RespiratoryService(repository);
        console.log('Service initialized successfully');

        // Initialize controller
        controller = new RespiratoryController(service);
        console.log('Controller initialized successfully');

        // Create router
        router = createRespiratoryRouter(controller);
        console.log('Router initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        throw error;
    }
}

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to ensure initialization
app.use(async (req, res, next) => {
    try {
        if (!router) {
            await initialize();
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Mount routes
app.use('/api/respiratory', (req, res, next) => {
    if (!router) {
        return res.status(500).json({
            success: false,
            error: 'Server not initialized'
        });
    }
    router(req, res, next);
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Initialize on startup
if (process.env.NODE_ENV !== 'test') {
    initialize().catch(console.error);
}

export default app;
