class RespiratoryController {
    constructor(respiratoryService) {
        this.respiratoryService = respiratoryService;
    }

    async calculate(req, res) {
        try {
            const result = await this.respiratoryService.calculateRespiratoryFailure(req.body);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async getHistory(req, res) {
        try {
            const calculations = await this.respiratoryService.getRecentCalculations();
            res.json({
                success: true,
                data: calculations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async clearHistory(req, res) {
        try {
            await this.respiratoryService.clearHistory();
            res.json({
                success: true,
                message: 'History cleared successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default RespiratoryController;
