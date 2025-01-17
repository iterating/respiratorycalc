import { createClient } from '@supabase/supabase-js';
import RespiratoryFailure from '../../domain/entities/RespiratoryFailure.js';

class SupabaseRespiratory {
    constructor() {
        this.supabase = null;
    }

    async initialize() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        await this.createTableIfNotExists();
    }

    async createTableIfNotExists() {
        const { error } = await this.supabase.rpc('create_respiratory_table');
        if (error && !error.message.includes('already exists')) {
            throw error;
        }
    }

    async save(calculation) {
        if (!this.supabase) {
            throw new Error('Database not initialized');
        }

        const data = {
            ph: calculation.ph,
            pa_co2: calculation.paCO2,
            pa_o2: calculation.paO2,
            fi_o2: calculation.fio2,
            bicarbonate: calculation.bicarbonate,
            pf_ratio: calculation.pfRatio,
            type: calculation.type,
            has_respiratory_failure: calculation.hasRespiratoryFailure,
            criteria: JSON.stringify(calculation.criteria)
        };

        const { data: savedData, error } = await this.supabase
            .from('respiratory_calculations')
            .insert([data])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapToEntity(savedData);
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
