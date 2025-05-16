import { createClient } from '@supabase/supabase-js';
import RespiratoryFailure from '../domain/entities/RespiratoryFailure.js';

class SupabaseRespiratory {
    constructor() {
        this.supabase = null;
    }

    async initialize() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables:', { 
                hasUrl: !!supabaseUrl, 
                hasKey: !!supabaseKey,
            });
            throw new Error('Missing Supabase environment variables. Please check your configuration.');
        }

        console.log('Initializing Supabase with:', {
            url: supabaseUrl,
            hasKey: !!supabaseKey
        });

        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
        });
        await this.createTableIfNotExists();
    }

    async createTableIfNotExists() {
        const { error } = await this.supabase.from('respiratory_calculations')
            .select('id')
            .limit(1);

        // If we get an error about the relation not existing, create the table
        if (error && error.message && error.message.includes('relation "respiratory_calculations" does not exist')) {
            const { error: createError } = await this.supabase.sql`
                CREATE TABLE IF NOT EXISTS respiratory_calculations (
                    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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
            
            if (createError) {
                console.error('Error creating table:', createError);
                throw createError;
            }
        } else if (error) {
            console.error('Error checking table:', error);
            throw error;
        }
    }

    async save(calculation) {
        if (!this.supabase) {
            throw new Error('Database not initialized');
        }

        const { data, error } = await this.supabase
            .from('respiratory_calculations')
            .insert([{
                ph: calculation.ph,
                pa_co2: calculation.paCO2,
                pa_o2: calculation.paO2,
                fi_o2: calculation.fio2,
                bicarbonate: calculation.bicarbonate,
                pf_ratio: calculation.pfRatio,
                type: calculation.type,
                has_respiratory_failure: calculation.hasRespiratoryFailure,
                criteria: JSON.stringify(calculation.criteria)
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapToEntity(data);
    }

    async getRecentCalculations(limit = 10) {
        if (!this.supabase) {
            throw new Error('Database not initialized');
        }

        const { data, error } = await this.supabase
            .from('respiratory_calculations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data.map(this.mapToEntity);
    }

    async clearHistory() {
        if (!this.supabase) {
            throw new Error('Database not initialized');
        }

        const { error } = await this.supabase
            .from('respiratory_calculations')
            .delete()
            .neq('id', 0);

        if (error) {
            throw error;
        }
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

export default SupabaseRespiratory;
