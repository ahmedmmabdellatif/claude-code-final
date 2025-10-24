import db from '../db';

export async function check30DayQuestionnaires() {
  console.log('[Questionnaire Scheduler] Checking for 30-day follow-ups...');

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clients = await db.clientProfile.findMany({
      where: {
        planStatus: 'active',
        startDate: {
          lte: thirtyDaysAgo,
        },
      },
      include: {
        user: true,
        questionnaires: {
          where: {
            templateType: 'monthly',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    console.log(`[Questionnaire Scheduler] Found ${clients.length} active clients`);

    const notificationPromises = [];

    for (const client of clients) {
      const lastMonthlyQuestionnaire = client.questionnaires[0];
      
      const shouldTrigger = !lastMonthlyQuestionnaire || 
        (new Date().getTime() - lastMonthlyQuestionnaire.createdAt.getTime()) > (30 * 24 * 60 * 60 * 1000);

      if (shouldTrigger) {
        console.log(`[Questionnaire Scheduler] Triggering 30-day questionnaire for client ${client.id}`);

        const existingNotification = await db.notification.findFirst({
          where: {
            userId: client.userId,
            type: 'task_reminder',
            read: false,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
            data: {
              path: '/questionnaire?type=monthly',
            } as any,
          },
        });

        if (!existingNotification) {
          const notificationPromise = db.notification.create({
            data: {
              userId: client.userId,
              type: 'task_reminder',
              title: '30-Day Check-In',
              body: 'Time for your monthly progress questionnaire! Help us track your journey and adjust your plan.',
              data: {
                action: 'open_questionnaire',
                templateType: 'monthly',
                priority: 'high',
              },
            },
          });

          notificationPromises.push(notificationPromise);
        }
      }
    }

    await Promise.all(notificationPromises);

    console.log(`[Questionnaire Scheduler] Created ${notificationPromises.length} notifications`);

    return {
      success: true,
      clientsChecked: clients.length,
      notificationsCreated: notificationPromises.length,
    };
  } catch (error) {
    console.error('[Questionnaire Scheduler] Error:', error);
    throw error;
  }
}

export async function scheduleMonthlyQuestionnaireForClient(clientId: string) {
  console.log(`[Questionnaire Scheduler] Scheduling monthly questionnaire for client ${clientId}`);

  try {
    const client = await db.clientProfile.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    await db.notification.create({
      data: {
        userId: client.userId,
        type: 'task_reminder',
        title: '30-Day Check-In',
        body: 'Complete your monthly progress questionnaire to help your coach adjust your plan.',
        data: {
          action: 'open_questionnaire',
          templateType: 'monthly',
          priority: 'high',
        },
      },
    });

    console.log(`[Questionnaire Scheduler] Notification created for client ${clientId}`);

    return { success: true };
  } catch (error) {
    console.error('[Questionnaire Scheduler] Error:', error);
    throw error;
  }
}
