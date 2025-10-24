import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import { todayTasksProcedure } from "./routes/plans/today/route";
import {
  listPlanVersionsProcedure,
  getPlanVersionDetailProcedure,
  comparePlanVersionsProcedure,
  createPlanVersionProcedure,
  revertToPlanVersionProcedure,
} from "./routes/plans/versions/route";
import { statsProcedure } from "./routes/tracking/stats/route";
import { listMessagesProcedure } from "./routes/messages/list/route";
import { sendMessageProcedure } from "./routes/messages/send/route";
import { getUnreadCountProcedure, markMessagesAsReadProcedure } from "./routes/messages/getUnreadCount/route";
import { setTypingStatusProcedure, getTypingStatusProcedure } from "./routes/messages/typing/route";
import { updatePresenceProcedure, getPresenceProcedure, heartbeatProcedure } from "./routes/messages/presence/route";
import { registerPushTokenProcedure, unregisterPushTokenProcedure, getUserPushTokensProcedure } from "./routes/pushTokens/register/route";
import { completeWorkoutProcedure } from "./routes/workouts/complete/route";
import { addMeasurementProcedure } from "./routes/measurements/add/route";
import { listMeasurementsProcedure } from "./routes/measurements/list/route";
import { listNotificationsProcedure } from "./routes/notifications/list/route";
import { markNotificationReadProcedure } from "./routes/notifications/markRead/route";
import { triggerNotificationProcedure, sendPushNotificationProcedure, getNotificationQueueProcedure } from "./routes/notifications/trigger/route";
import { listClientsProcedure } from "./routes/coach/clients/route";
import { clientDetailProcedure } from "./routes/coach/client-detail/route";
import { aiSuggestionsProcedure } from "./routes/coach/ai-suggestions/route";
import { assignPlanProcedure } from "./routes/coach/assign-plan/route";
import { createClientProcedure } from "./routes/coach/create-client/route";
import {
  listExercisesProcedure,
  createExerciseProcedure,
  updateExerciseProcedure,
  deleteExerciseProcedure
} from "./routes/cms/exercises/route";
import {
  listFoodsProcedure,
  createFoodProcedure,
  updateFoodProcedure,
  deleteFoodProcedure
} from "./routes/cms/foods/route";
import {
  listWarmupExercisesProcedure,
  createWarmupExerciseProcedure,
  updateWarmupExerciseProcedure,
  deleteWarmupExerciseProcedure,
} from "./routes/cms/warmup-exercises/route";
import {
  listWorkoutExercisesProcedure,
  createWorkoutExerciseProcedure,
  updateWorkoutExerciseProcedure,
  deleteWorkoutExerciseProcedure,
} from "./routes/cms/workout-exercises/route";
import {
  listStretchingExercisesProcedure,
  createStretchingExerciseProcedure,
  updateStretchingExerciseProcedure,
  deleteStretchingExerciseProcedure,
} from "./routes/cms/stretching-exercises/route";
import {
  listCardioProtocolsProcedure,
  createCardioProtocolProcedure,
  updateCardioProtocolProcedure,
  deleteCardioProtocolProcedure,
} from "./routes/cms/cardio-protocols/route";
import {
  listFoodNutritionProcedure,
  createFoodNutritionProcedure,
  updateFoodNutritionProcedure,
  deleteFoodNutritionProcedure,
} from "./routes/cms/nutrition/route";
import {
  listRecipesProcedure,
  createRecipeProcedure,
  updateRecipeProcedure,
  deleteRecipeProcedure,
} from "./routes/cms/recipes/route";
import {
  listSupplementsProcedure,
  createSupplementProcedure,
  updateSupplementProcedure,
  deleteSupplementProcedure,
} from "./routes/cms/supplements/route";
import { getHydrationGuidelinesProcedure } from "./routes/cms/hydration/route";
import { coachAlertsProcedure, resolveAlertProcedure } from "./routes/coach/alerts/route";
import { getTemplateProcedure } from "./routes/questionnaires/getTemplate/route";
import { submitProcedure } from "./routes/questionnaires/submit/route";
import { getResponsesProcedure } from "./routes/questionnaires/getResponses/route";
import { compareProcedure } from "./routes/questionnaires/compare/route";
import { checkMonthlyProcedure, triggerMonthlyNotificationProcedure } from "./routes/questionnaires/checkMonthly/route";
import { createGoalProcedure } from "./routes/goals/create/route";
import { listGoalsProcedure } from "./routes/goals/list/route";
import { updateGoalProcedure } from "./routes/goals/update/route";
import { completeGoalProcedure } from "./routes/goals/complete/route";
import { deleteGoalProcedure } from "./routes/goals/delete/route";
import { generateAlertsProcedure } from "./routes/alerts/generate/route";
import { listAlertsProcedure } from "./routes/alerts/list/route";
import { resolveAlertProcedure as resolveAlertNewProcedure } from "./routes/alerts/resolve/route";
import {
  listOffersProcedure,
  getOfferProcedure,
  createOfferProcedure,
  updateOfferProcedure,
  deleteOfferProcedure,
} from "./routes/payments/offers/route";
import {
  createPaymentIntentProcedure,
  confirmPaymentProcedure,
  getPaymentStatusProcedure,
  listPaymentsProcedure,
  getSubscriptionProcedure,
  cancelSubscriptionProcedure,
} from "./routes/payments/checkout/route";
import {
  uploadMediaProcedure,
  listMediaProcedure,
  deleteMediaProcedure,
} from "./routes/media/upload/route";
import { extractLabelsProcedure } from "./routes/labels/extract/route";
import { getClientLabelsProcedure, getLabelSummaryProcedure } from "./routes/labels/get/route";
import { updateLabelProcedure, deleteLabelProcedure, addLabelProcedure } from "./routes/labels/update/route";
import { submitOnboardingProcedure, getOnboardingProcedure } from "./routes/onboarding/submit/route";
import { checkQuestionnairesProcedure } from "./routes/cron/check-questionnaires/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerProcedure,
  }),
  plans: createTRPCRouter({
    today: todayTasksProcedure,
    listVersions: listPlanVersionsProcedure,
    getVersionDetail: getPlanVersionDetailProcedure,
    compareVersions: comparePlanVersionsProcedure,
    createVersion: createPlanVersionProcedure,
    revertToVersion: revertToPlanVersionProcedure,
  }),
  tracking: createTRPCRouter({
    stats: statsProcedure,
  }),
  messages: createTRPCRouter({
    list: listMessagesProcedure,
    send: sendMessageProcedure,
    getUnreadCount: getUnreadCountProcedure,
    markAsRead: markMessagesAsReadProcedure,
    setTyping: setTypingStatusProcedure,
    getTyping: getTypingStatusProcedure,
    updatePresence: updatePresenceProcedure,
    getPresence: getPresenceProcedure,
    heartbeat: heartbeatProcedure,
  }),
  workouts: createTRPCRouter({
    complete: completeWorkoutProcedure,
  }),
  measurements: createTRPCRouter({
    add: addMeasurementProcedure,
    list: listMeasurementsProcedure,
  }),
  notifications: createTRPCRouter({
    list: listNotificationsProcedure,
    markRead: markNotificationReadProcedure,
    trigger: triggerNotificationProcedure,
    sendPush: sendPushNotificationProcedure,
    getQueue: getNotificationQueueProcedure,
  }),
  coach: createTRPCRouter({
    clients: listClientsProcedure,
    clientDetail: clientDetailProcedure,
    createClient: createClientProcedure,
    aiSuggestions: aiSuggestionsProcedure,
    assignPlan: assignPlanProcedure,
    alerts: coachAlertsProcedure,
    resolveAlert: resolveAlertProcedure,
  }),
  alerts: createTRPCRouter({
    generate: generateAlertsProcedure,
    list: listAlertsProcedure,
    resolve: resolveAlertNewProcedure,
  }),
  cms: createTRPCRouter({
    // Legacy exercises and foods (keep for backwards compatibility)
    listExercises: listExercisesProcedure,
    createExercise: createExerciseProcedure,
    updateExercise: updateExerciseProcedure,
    deleteExercise: deleteExerciseProcedure,
    listFoods: listFoodsProcedure,
    createFood: createFoodProcedure,
    updateFood: updateFoodProcedure,
    deleteFood: deleteFoodProcedure,

    // Warmup Exercises
    listWarmupExercises: listWarmupExercisesProcedure,
    createWarmupExercise: createWarmupExerciseProcedure,
    updateWarmupExercise: updateWarmupExerciseProcedure,
    deleteWarmupExercise: deleteWarmupExerciseProcedure,

    // Workout Exercises
    listWorkoutExercises: listWorkoutExercisesProcedure,
    createWorkoutExercise: createWorkoutExerciseProcedure,
    updateWorkoutExercise: updateWorkoutExerciseProcedure,
    deleteWorkoutExercise: deleteWorkoutExerciseProcedure,

    // Stretching Exercises
    listStretchingExercises: listStretchingExercisesProcedure,
    createStretchingExercise: createStretchingExerciseProcedure,
    updateStretchingExercise: updateStretchingExerciseProcedure,
    deleteStretchingExercise: deleteStretchingExerciseProcedure,

    // Cardio Protocols
    listCardioProtocols: listCardioProtocolsProcedure,
    createCardioProtocol: createCardioProtocolProcedure,
    updateCardioProtocol: updateCardioProtocolProcedure,
    deleteCardioProtocol: deleteCardioProtocolProcedure,

    // Food Nutrition
    listFoodNutrition: listFoodNutritionProcedure,
    createFoodNutrition: createFoodNutritionProcedure,
    updateFoodNutrition: updateFoodNutritionProcedure,
    deleteFoodNutrition: deleteFoodNutritionProcedure,

    // Recipes
    listRecipes: listRecipesProcedure,
    createRecipe: createRecipeProcedure,
    updateRecipe: updateRecipeProcedure,
    deleteRecipe: deleteRecipeProcedure,

    // Supplements
    listSupplements: listSupplementsProcedure,
    createSupplement: createSupplementProcedure,
    updateSupplement: updateSupplementProcedure,
    deleteSupplement: deleteSupplementProcedure,

    // Hydration Guidelines (read-only)
    getHydrationGuidelines: getHydrationGuidelinesProcedure,
  }),
  questionnaires: createTRPCRouter({
    getTemplate: getTemplateProcedure,
    submit: submitProcedure,
    getResponses: getResponsesProcedure,
    compare: compareProcedure,
    checkMonthly: checkMonthlyProcedure,
    triggerMonthlyNotification: triggerMonthlyNotificationProcedure,
  }),
  goals: createTRPCRouter({
    create: createGoalProcedure,
    list: listGoalsProcedure,
    update: updateGoalProcedure,
    complete: completeGoalProcedure,
    delete: deleteGoalProcedure,
  }),
  pushTokens: createTRPCRouter({
    register: registerPushTokenProcedure,
    unregister: unregisterPushTokenProcedure,
    getTokens: getUserPushTokensProcedure,
  }),
  payments: createTRPCRouter({
    listOffers: listOffersProcedure,
    getOffer: getOfferProcedure,
    createOffer: createOfferProcedure,
    updateOffer: updateOfferProcedure,
    deleteOffer: deleteOfferProcedure,
    createPaymentIntent: createPaymentIntentProcedure,
    confirmPayment: confirmPaymentProcedure,
    getPaymentStatus: getPaymentStatusProcedure,
    listPayments: listPaymentsProcedure,
    getSubscription: getSubscriptionProcedure,
    cancelSubscription: cancelSubscriptionProcedure,
  }),
  media: createTRPCRouter({
    upload: uploadMediaProcedure,
    list: listMediaProcedure,
    delete: deleteMediaProcedure,
  }),
  labels: createTRPCRouter({
    extract: extractLabelsProcedure,
    get: getClientLabelsProcedure,
    getSummary: getLabelSummaryProcedure,
    update: updateLabelProcedure,
    delete: deleteLabelProcedure,
    add: addLabelProcedure,
  }),
  onboarding: createTRPCRouter({
    submit: submitOnboardingProcedure,
    get: getOnboardingProcedure,
  }),
  cron: createTRPCRouter({
    checkQuestionnaires: checkQuestionnairesProcedure,
  }),
});

export type AppRouter = typeof appRouter;
