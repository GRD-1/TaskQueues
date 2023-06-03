import express from 'express';
import { SelfWrittenQueueController } from '../controllers/self-written-queue.controller';
import { NpmQueueController } from '../controllers/npm-queue.controller';
const mainRoute = express.Router();

mainRoute.get('/', (req, res) => {
  res.sendFile(`${process.env.Project_ROOT}/static/index.html`);
});

mainRoute.get('/max-balance', (req, res) => {
  const selfWrittenQueueController = new SelfWrittenQueueController();
  const npmQueueController = new NpmQueueController();
  switch (req.query.queue) {
    case 'self-written-queue':
      selfWrittenQueueController.getMaxChangedAccount(req, res);
      break;
    case 'npm-queue':
      npmQueueController.getMaxChangedAccount(req, res);
      break;
    default:
      npmQueueController.getMaxChangedAccount(req, res);
  }
});

export default mainRoute;
