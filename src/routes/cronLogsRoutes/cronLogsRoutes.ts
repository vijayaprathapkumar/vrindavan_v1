// routes/cronLogsRoutes.ts
import { Router } from 'express';
import { getCronLogsController } from '../../controllers/cronLogsController/cronLogsController';

const router = Router();

router.get('/', getCronLogsController);

export default router;
