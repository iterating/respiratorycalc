import { neon } from '@neondatabase/serverless';
import RespiratoryFailure from '../domain/entities/RespiratoryFailure.js';

class NeonRespiratory {
    constructor() {
        this.sql = null;
    }

    async initialize() {
        const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

        if (!databaseUrl) {
            console.error('Missing Neon database URL:', { 
                hasUrl: !!databaseUrl,
            });
            throw new Error('Missing DATABASE_URL environment variable. Please check your configuration.');
        }

        console.log('Initializing Neon database connection');

        this.sql = neon(databaseUrl);
        await this.createTableIfNotExists();
    }

    async createTableIfNotExists() {
        try {
            await this.sql`
                CREATE TABLE IF NOT EXISTS respiratory_calculations (
                    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                    ph numeric,
                    pa_co2 numeric,
                    pa_o2 numeric,
                    fi_o2 numeric,
                    bicarbonate numeric,
                    pf_ratio numeric,
                    type text,
                    has_respiratory_failure boolean,
                    criteria jsonb,
                    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
                );
            `;
            console.log('Table check/creation completed');
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }

    async save(calculation) {
        if (!this.sql) {
            throw new Error('Database not initialized');
        }

        const result = await this.sql`
            INSERT INTO respiratory_calculations (
                ph, pa_co2, pa_o2, fi_o2, bicarbonate, pf_ratio, type, 
                has_respiratory_failure, criteria
            )
            VALUES (
                ${calculation.ph},
                ${calculation.paCO2},
                ${calculation.paO2},
                ${calculation.fio2},
                ${calculation.bicarbonate},
                ${calculation.pfRatio},
                ${calculation.type},
                ${calculation.hasRespiratoryFailure},
                ${JSON.stringify(calculation.criteria)}
            )
            RETURNING *
        `;

        if (!result || result.length === 0) {
            throw new Error('Failed to save calculation');
        }

        return this.mapToEntity(result[0]);
    }

    async getRecentCalculations(limit = 10) {
        if (!this.sql) {
            throw new Error('Database not initialized');
        }

        const result = await this.sql`
            SELECT * FROM respiratory_calculations
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;

        return result.map(this.mapToEntity);
    }

    async clearHistory() {
        if (!this.sql) {
            throw new Error('Database not initialized');
        }

        await this.sql`
            DELETE FROM respiratory_calculations
        `;
    }

    mapToEntity(data) {
        const entity = new RespiratoryFailure(
            data.ph,
            data.pa_co2,
            data.pa_o2,
            data.fi_o2,
            data.bicarbonate
        );
        
        // Override calculated values with stored values
        entity.pfRatio = data.pf_ratio;
        entity.type = data.type;
        entity.hasRespiratoryFailure = data.has_respiratory_failure;
        entity.criteria = typeof data.criteria === 'string' ? JSON.parse(data.criteria) : data.criteria;
        entity.createdAt = data.created_at ? new Date(data.created_at) : new Date();
        
        return entity;
    }
}

export default NeonRespiratory;
