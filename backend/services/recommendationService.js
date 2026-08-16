import LearningTwin from "../models/LearningTwin.js";
import Pathway from "../models/Pathway.js";

/**
 * Compute the single Smart Next Action for the user dashboard
 */
export const getSmartNextAction = async (userId) => {
  try {
    const twin = await LearningTwin.findOne({ userId });
    const courses = await Pathway.find({ userId, isArchived: false });

    // 1. High Priority: Active Misconceptions or Weak Topics
    if (twin && twin.misconceptions && twin.misconceptions.length > 0) {
      const activeMisconception = twin.misconceptions.find(m => !m.resolved);
      if (activeMisconception) {
        return {
          type: "MISCONCEPTION_REVIEW",
          topic: activeMisconception.topic,
          title: `Fix Misconception: ${activeMisconception.topic}`,
          reason: `You recently struggled with: "${activeMisconception.description.substring(0, 80)}"`,
          estimatedMinutes: 10,
          actionLabel: "Review & Fix",
          actionUrl: `/explain/${encodeURIComponent(activeMisconception.topic)}`,
          priority: "High",
          badge: "Needs Review ⚠"
        };
      }
    }

    if (twin && twin.weakTopics && twin.weakTopics.length > 0) {
      const weakTopic = twin.weakTopics[0];
      const topicData = twin.topics?.get(weakTopic);
      const acc = topicData?.quizAccuracy || 50;
      return {
        type: "WEAKNESS_PRACTICE",
        topic: weakTopic,
        title: `Boost Mastery in ${weakTopic}`,
        reason: `Your recent quiz accuracy for this topic is ${acc}%. Practice will solidify your understanding.`,
        estimatedMinutes: 15,
        actionLabel: "Take Adaptive Quiz",
        actionUrl: `/quizzes?topic=${encodeURIComponent(weakTopic)}`,
        priority: "High",
        badge: "Low Mastery 🔴"
      };
    }

    // 2. Next Priority: In-progress Course Next Step
    if (courses && courses.length > 0) {
      const activeCourse = courses.find(c => c.progress < 100) || courses[0];
      
      // Determine next incomplete step
      const steps = [];
      const raw = Array.isArray(activeCourse.pathway) ? activeCourse.pathway : (activeCourse.pathway?.children || []);
      raw.forEach((section, sIdx) => {
        if (section.children && section.children.length > 0) {
          section.children.forEach((child, cIdx) => {
            steps.push({ id: `${sIdx}-${cIdx}`, name: child.name });
          });
        } else if (section.name) {
          steps.push({ id: `${sIdx}-0`, name: section.name });
        }
      });

      const completedSet = new Set(activeCourse.completedSteps || []);
      const nextStep = steps.find(s => !completedSet.has(s.id)) || steps[0];

      if (nextStep) {
        return {
          type: "CONTINUE_ROADMAP",
          topic: nextStep.name,
          courseId: activeCourse._id,
          technology: activeCourse.technology,
          title: `Next Topic: ${nextStep.name}`,
          reason: `Continue your ${activeCourse.technology} roadmap (${activeCourse.progress}% complete).`,
          estimatedMinutes: 20,
          actionLabel: "Continue Learning",
          actionUrl: `/courses/${activeCourse._id}`,
          priority: "Medium",
          badge: "In Progress 🚀"
        };
      }
    }

    // 3. Fallback: Generate a Roadmap
    return {
      type: "GENERATE_ROADMAP",
      title: "Start Your Learning Journey",
      reason: "Explore popular technologies and generate a customized AI learning pathway.",
      estimatedMinutes: 5,
      actionLabel: "Explore Roadmaps",
      actionUrl: "/explore",
      priority: "Low",
      badge: "Get Started ✨"
    };
  } catch (error) {
    console.error("Failed to compute Smart Next Action:", error);
    return null;
  }
};
