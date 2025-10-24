import { publicProcedure } from '../../../create-context';
import { check30DayQuestionnaires } from '../../../../services/questionnaireScheduler';

export const checkQuestionnairesProcedure = publicProcedure.mutation(async () => {
  console.log('[Cron] Running 30-day questionnaire check...');

  try {
    const result = await check30DayQuestionnaires();
    
    return {
      ...result,
      message: `Checked ${result.clientsChecked} clients, created ${result.notificationsCreated} notifications`,
    };
  } catch (error) {
    console.error('[Cron] Error checking questionnaires:', error);
    throw new Error(
      `Failed to check questionnaires: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
});
