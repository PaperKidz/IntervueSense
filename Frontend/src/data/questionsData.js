// src/data/questionsData.js

export const practiceQuestions = {
  '1': { // Module 1: Introduction to Interviews
    '1.1': { // Tell Me About Yourself
      'p1': {
        id: 1,
        question: "Tell me about yourself and your background.",
        expectedDuration: 120,
        tips: [
          "Start with your current role or situation",
          "Highlight 2-3 key accomplishments",
          "Connect your past to the role you're applying for",
          "Keep it under 2 minutes"
        ]
      },
      'p2': {
        id: 2,
        question: "What are your key strengths and how have you demonstrated them?",
        expectedDuration: 120,
        tips: [
          "Choose strengths relevant to the role",
          "Provide specific examples",
          "Show measurable impact",
          "Be genuine and authentic"
        ]
      },
      'p3': {
        id: 3,
        question: "Walk me through your career journey and the key decisions you've made.",
        expectedDuration: 120,
        tips: [
          "Create a narrative arc",
          "Explain your decision-making process",
          "Show growth and learning",
          "Connect to your career goals"
        ]
      }
    },
    '1.2': { // Behavioral Questions
      'p4': {
        id: 4,
        question: "Describe a time when you had to resolve a conflict within your team.",
        expectedDuration: 120,
        tips: [
          "Use the STAR method (Situation, Task, Action, Result)",
          "Focus on your specific role",
          "Show emotional intelligence",
          "Highlight the positive outcome"
        ]
      },
      'p5': {
        id: 5,
        question: "Tell me about a situation where you demonstrated leadership, even without a formal title.",
        expectedDuration: 120,
        tips: [
          "Leadership can be informal",
          "Show initiative and influence",
          "Describe how you motivated others",
          "Quantify the impact"
        ]
      },
      'p6': {
        id: 6,
        question: "Share an example of a significant failure and how you grew from it.",
        expectedDuration: 120,
        tips: [
          "Choose a real failure, not a humble-brag",
          "Take ownership of your mistakes",
          "Focus on what you learned",
          "Show how you've improved"
        ]
      }
    }
  },
  '2': { // Module 2
    '2.1': { // Section 2.1
      'p1': {
        id: 7,
        question: "Tell me about yourself and what brings you to this opportunity.",
        expectedDuration: 120,
        tips: [
          "Tailor your answer to this specific role",
          "Show enthusiasm for the opportunity",
          "Highlight relevant experience",
          "End with why you're interested"
        ]
      },
      'p2': {
        id: 8,
        question: "What unique value do you bring that sets you apart from other candidates?",
        expectedDuration: 120,
        tips: [
          "Identify your unique combination of skills",
          "Use concrete examples",
          "Align with company needs",
          "Be confident, not arrogant"
        ]
      },
      'p3': {
        id: 9,
        question: "Where do you see yourself in 5 years and how does this role fit into that vision?",
        expectedDuration: 120,
        tips: [
          "Show ambition but be realistic",
          "Align with company growth opportunities",
          "Demonstrate commitment",
          "Focus on skills, not titles"
        ]
      }
    },
    '2.2': { // Section 2.2
      'p4': {
        id: 10,
        question: "Describe a time when you had to work with a difficult stakeholder or client.",
        expectedDuration: 120,
        tips: [
          "Show professionalism and patience",
          "Explain your strategy",
          "Highlight communication skills",
          "End with a positive resolution"
        ]
      },
      'p5': {
        id: 11,
        question: "Tell me about a time when you had to make a difficult decision with limited information.",
        expectedDuration: 120,
        tips: [
          "Explain your decision-making process",
          "Show analytical thinking",
          "Discuss how you mitigated risks",
          "Reflect on the outcome"
        ]
      },
      'p6': {
        id: 12,
        question: "Share an example of when you had to adapt to a significant change at work.",
        expectedDuration: 120,
        tips: [
          "Show flexibility and resilience",
          "Describe your adaptation strategy",
          "Highlight positive outcomes",
          "Show what you learned"
        ]
      }
    }
  }
};

// Helper function to get a specific question
export const getQuestionByIds = (moduleId, sectionId, practiceId) => {
  const question = practiceQuestions[moduleId]?.[sectionId]?.[practiceId];
  
  if (!question) {
    console.error('Question not found for:', { moduleId, sectionId, practiceId });
    // Return default question
    return {
      id: 0,
      question: "Tell me about yourself.",
      expectedDuration: 120,
      tips: ["Be concise", "Be relevant", "Be authentic"]
    };
  }
  
  return question;
};

// Helper to get all questions for a section
export const getSectionQuestions = (moduleId, sectionId) => {
  const questions = practiceQuestions[moduleId]?.[sectionId];
  
  if (!questions) {
    return [];
  }
  
  return Object.values(questions);
};

// Helper to get question count
export const getQuestionCount = (moduleId, sectionId) => {
  const questions = practiceQuestions[moduleId]?.[sectionId];
  return questions ? Object.keys(questions).length : 0;
};