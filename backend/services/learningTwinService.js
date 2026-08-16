import LearningTwin from "../models/LearningTwin.js";
import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";
import Achievement from "../models/Achievement.js";

/**
 * Log daily activity and update streaks
 */
export const recordActivity = async (userId, { minutes = 15, topic = "", isQuiz = false, isNote = false, isProject = false } = {}) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const log = await ActivityLog.findOneAndUpdate(
      { userId, date: today },
      {
        $inc: {
          minutesLearned: minutes,
          actionsCount: 1,
          quizzesAttempted: isQuiz ? 1 : 0,
          notesGenerated: isNote ? 1 : 0,
          projectsWorkedOn: isProject ? 1 : 0
        },
        ...(topic ? { $addToSet: { topicsCompleted: topic } } : {})
      },
      { upsert: true, new: true }
    );

    // Update User Stats & Streaks
    const user = await User.findById(userId);
    if (user) {
      user.stats.totalLearningMinutes = (user.stats.totalLearningMinutes || 0) + minutes;
      if (isQuiz) user.stats.quizzesCompletedCount = (user.stats.quizzesCompletedCount || 0) + 1;
      if (topic) user.stats.completedTopicsCount = (user.stats.completedTopicsCount || 0) + 1;

      // Calculate streak
      const lastActive = user.stats.lastActiveDate ? new Date(user.stats.lastActiveDate) : null;
      const now = new Date();
      if (lastActive) {
        const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.stats.streakDays = (user.stats.streakDays || 1) + 1;
        } else if (diffDays > 1) {
          user.stats.streakDays = 1;
        }
      }
      user.stats.lastActiveDate = now;
      await user.save();
    }

    // Check achievement triggers
    await checkAndAwardAchievements(userId);

    return log;
  } catch (err) {
    console.error("Failed to record activity:", err);
  }
};

/**
 * Update Topic Mastery in Learning Twin
 */
export const updateTopicMastery = async (userId, { topic, technology = "", quizScore = null, confidence = null, explainScore = null, misconceptions = [] }) => {
  try {
    let twin = await LearningTwin.findOne({ userId });
    if (!twin) {
      twin = new LearningTwin({ userId, topics: new Map() });
    }

    const currentTopicData = twin.topics.get(topic) || {
      technology,
      mastery: 0,
      confidence: confidence || 50,
      quizAccuracy: quizScore !== null ? quizScore : 0,
      explainBackScore: explainScore !== null ? explainScore : 0,
      lastPracticedAt: new Date(),
      needsReview: false,
      attemptsCount: 0
    };

    // Calculate new estimated mastery (Weighted: Quiz 40%, ExplainBack 30%, Practice 30%)
    let quizAcc = currentTopicData.quizAccuracy;
    if (quizScore !== null) {
      quizAcc = Math.round((currentTopicData.quizAccuracy * currentTopicData.attemptsCount + quizScore) / (currentTopicData.attemptsCount + 1));
      currentTopicData.attemptsCount += 1;
      currentTopicData.quizAccuracy = quizAcc;
    }

    if (confidence !== null) {
      currentTopicData.confidence = confidence;
    }

    if (explainScore !== null) {
      currentTopicData.explainBackScore = explainScore;
    }

    // Mastery formula
    const expScore = currentTopicData.explainBackScore || quizAcc;
    currentTopicData.mastery = Math.min(100, Math.round(quizAcc * 0.5 + expScore * 0.3 + 20));
    currentTopicData.lastPracticedAt = new Date();
    currentTopicData.needsReview = currentTopicData.mastery < 65;

    twin.topics.set(topic, currentTopicData);

    // Record confidence vs actual calibration
    if (confidence !== null && quizScore !== null) {
      twin.confidenceLogs.push({
        topic,
        confidence,
        actualScore: quizScore,
        recordedAt: new Date()
      });
    }

    // Record misconceptions
    if (misconceptions && misconceptions.length > 0) {
      misconceptions.forEach(m => {
        twin.misconceptions.push({
          topic,
          description: typeof m === "string" ? m : m.description || JSON.stringify(m),
          detectedAt: new Date(),
          resolved: false,
          recommendedReview: `Review fundamentals of ${topic}`
        });
      });
    }

    // Refresh weak and strong topics
    const weak = [];
    const strong = [];
    for (const [tName, data] of twin.topics.entries()) {
      if (data.mastery >= 75) strong.push(tName);
      else if (data.mastery < 60) weak.push(tName);
    }
    twin.weakTopics = weak;
    twin.strongTopics = strong;

    await twin.save();
    return twin;
  } catch (error) {
    console.error("Failed to update topic mastery in Learning Twin:", error);
  }
};

/**
 * Check & Award Gamification Badges
 */
export const checkAndAwardAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const achievementsToGrant = [];

    if (user.stats.completedTopicsCount >= 1) {
      achievementsToGrant.push({
        key: "first_step",
        title: "First Steps",
        description: "Completed your first learning pathway topic!",
        icon: "🌱",
        category: "Learning"
      });
    }

    if (user.stats.streakDays >= 7) {
      achievementsToGrant.push({
        key: "streak_7",
        title: "7-Day Learner",
        description: "Maintained a daily learning streak for 7 consecutive days!",
        icon: "🔥",
        category: "Consistency"
      });
    }

    if (user.stats.quizzesCompletedCount >= 5) {
      achievementsToGrant.push({
        key: "quiz_master",
        title: "Quiz Explorer",
        description: "Completed 5 adaptive skill checks!",
        icon: "🎯",
        category: "Quizzes"
      });
    }

    for (const ach of achievementsToGrant) {
      await Achievement.findOneAndUpdate(
        { userId, key: ach.key },
        { ...ach, userId },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("Error checking achievements:", err);
  }
};
