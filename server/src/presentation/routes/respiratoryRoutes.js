import express from 'express';

function createRespiratoryRouter(respiratoryController) {
    const router = express.Router();

    router.post('/calculate', async (req, res) => {
        await respiratoryController.calculate(req, res);
    });

    router.get('/history', async (req, res) => {
        await respiratoryController.getHistory(req, res);
    });

    router.delete('/clear', async (req, res) => {
        await respiratoryController.clearHistory(req, res);
    });

    return router;
}

export default createRespiratoryRouter;
