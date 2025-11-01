// ✅ Private local video importer (safe, bundled by Vite)
const importVideo = (name) => new URL(`./videos/${name}`, import.meta.url).href;

export const modules = [
  {
    id: "1",
    title: "Introduction to Interviews",
    description: "Master the basics of personal and behavioral interview rounds",
    sections: [
      {
        id: "1.1",
        title: "Tell Me About Yourself",
        theory: {
          title: "Understanding Personal Narratives",
          duration: "12 min",
          type: "video",
          videoUrl: importVideo("video.mp4"), // ✅ Secure local import
        },
        practices: [
          { id: "p1", title: "Craft Your Story", duration: "120s", description: "Practice structuring your personal introduction" },
          { id: "p2", title: "Strengths Showcase", duration: "120s", description: "Demonstrate your key strengths with examples" },
          { id: "p3", title: "Career Journey", duration: "120s", description: "Articulate your career path and decisions" },
        ],
      },
      {
        id: "1.2",
        title: "Behavioral Questions",
        theory: {
          title: "STAR Method Mastery",
          duration: "15 min",
          type: "text",
          content:
            "The STAR method (Situation, Task, Action, Result) is a structured approach to answering behavioral interview questions...",
        },
        practices: [
          { id: "p4", title: "Conflict Resolution", duration: "120s", description: "Handle team conflicts professionally" },
          { id: "p5", title: "Leadership Moments", duration: "120s", description: "Show leadership skills in action" },
          { id: "p6", title: "Failure & Growth", duration: "120s", description: "Turn setbacks into learning experiences" },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Advanced Interview Techniques",
    description: "Deepen your interview skills with advanced scenarios",
    sections: [
      {
        id: "2.1",
        title: "Personal Branding",
        theory: {
          title: "Crafting Your Unique Value Proposition",
          duration: "14 min",
          type: "video",
          // ✅ Use embed URL form for proper rendering
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        practices: [
          { id: "p1", title: "Your Unique Story", duration: "120s", description: "Differentiate yourself from other candidates" },
          { id: "p2", title: "Value Proposition", duration: "120s", description: "Articulate what makes you unique" },
          { id: "p3", title: "Future Vision", duration: "120s", description: "Share your career aspirations" },
        ],
      },
      {
        id: "2.2",
        title: "Complex Scenarios",
        theory: {
          title: "Handling Difficult Questions",
          duration: "16 min",
          type: "text",
          content:
            "Advanced techniques for handling complex behavioral scenarios...",
        },
        practices: [
          { id: "p4", title: "Difficult Stakeholders", duration: "120s", description: "Navigate challenging relationships" },
          { id: "p5", title: "Critical Decisions", duration: "120s", description: "Make tough calls under pressure" },
          { id: "p6", title: "Change Management", duration: "120s", description: "Adapt to organizational changes" },
        ],
      },
    ],
  },
];

// ✅ Helper functions
export const getModuleById = (id) => modules.find((m) => m.id === id) || null;
export const getSectionById = (mId, sId) =>
  getModuleById(mId)?.sections.find((s) => s.id === sId) || null;
export const getTheoryBySection = (mId, sId) =>
  getSectionById(mId, sId)?.theory || null;
export const getPracticeById = (mId, sId, pId) =>
  getSectionById(mId, sId)?.practices.find((p) => p.id === pId) || null;

export const allItems = modules.flatMap((m) =>
  m.sections.flatMap((s) => [
    { moduleId: m.id, sectionId: s.id, itemId: "theory", itemType: "theory", title: s.theory.title },
    ...s.practices.map((p) => ({
      moduleId: m.id,
      sectionId: s.id,
      itemId: p.id,
      itemType: "practice",
      title: p.title,
    })),
  ])
);
