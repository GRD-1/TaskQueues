// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import { SelfWrittenQueueController } from '../controllers/self-written-queue.controller';
import { NpmQueueController } from '../controllers/npm-queue.controller';
const mainRout = express.Router();

// root
mainRout.get('/', (req, res) => {
  res.send(
    `<main style="text-align: center; margin: 20vh 0; display: flex; align-items: center; flex-direction: column;">
            <h1 style="display: block;">Главная страница приложения Balance-rating</h1>
            <div style="width: 1000px; text-align: left;">
              <br>чтобы получить адрес, баланс которого изменился больше остальных 
              используйте запрос: <a href = "http://localhost:3000/max-balance">http://localhost:3000/max-balance</a>
              <br>источник данных ограничивает количество входящих запросов в мин. 
              время выполнения запроса ~25сек. Наберитесь терпения!
              <br>
              <br>количество блоков для анализа можно менять через параметр [blocksAmount] строки запроса, 
              <br>например: <a href = "http://localhost:3000/max-balance?blocksAmount=4">http://localhost:3000/max-balance?blocksAmount=4</a> (по умолчанию 100)
              <br>
              <br>для сравнения производительности метод реализован с использованием разных библиотек для очереди задач.
              <br>параметр строки запроса [queue] позволяет переключаться между ними, например:
              <br><a href = "http://localhost:3000/max-balance?queue=self-written-queue">http://localhost:3000/max-balance?queue=self-written-queue</a>
              <br><a href = "http://localhost:3000/max-balance?queue=npm-queue">http://localhost:3000/max-balance?queue=npm-queue</a>
              <br>(по умолчанию используется 'npm queue')
            </div>
          </main>`,
  );
});

mainRout.get('/max-balance', (req, res) => {
  const selfWrittenQueueController = new SelfWrittenQueueController();
  const npmQueueController = new NpmQueueController();
  switch (req.query.queue) {
    case 'self-written-queue':
      selfWrittenQueueController.getTheMaxChangedAccount(req, res);
      break;
    case 'npm-queue':
      npmQueueController.getTheMaxChangedAccount(req, res);
      break;
    default:
      npmQueueController.getTheMaxChangedAccount(req, res);
  }
});

export default mainRout;
