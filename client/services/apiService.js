// In development, use localhost. In production, use relative paths
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const API_ENDPOINTS = {
    calculate: `${API_BASE_URL}/api/respiratory/calculate`,
    history: `${API_BASE_URL}/api/respiratory/history`,
    clearHistory: `${API_BASE_URL}/api/respiratory/clear`
};

class ApiService {
    async calculateRespiratoryFailure(data) {
        try {
            console.log('Sending respiratory failure calculation request:', data);
            const response = await fetch(API_ENDPOINTS.calculate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || `Server error: ${response.status}`;
                } catch (e) {
                    errorMessage = errorText || `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Response data:', result);

            if (!result.success) {
                throw new Error(result.error || 'Unknown error occurred');
            }

            return result.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getRespiratoryHistory() {
        try {
            console.log('Fetching respiratory history');
            const response = await fetch(API_ENDPOINTS.history, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || `Server error: ${response.status}`;
                } catch (e) {
                    errorMessage = errorText || `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('History data:', result);

            if (!result.success) {
                throw new Error(result.error || 'Failed to load history');
            }

            return result.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async clearHistory() {
        try {
            console.log('Clearing respiratory calculations');
            const response = await fetch(API_ENDPOINTS.clearHistory, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || `Server error: ${response.status}`;
                } catch (e) {
                    errorMessage = errorText || `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to clear history');
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService();
