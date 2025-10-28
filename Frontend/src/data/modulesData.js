// src/data/modulesData.js
export const modules = [
  {
    id: '1',
    title: 'Introduction to Interviews',
    description: 'Master the basics of personal and behavioral interview rounds',
    sections: [
      {
        id: '1.1',
        title: 'Tell Me About Yourself',
        // We don't need the 'id: t1' anymore
        theory: { title: 'Understanding Personal Narratives', duration: '12 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        practices: [
          { id: 'p1', title: 'Craft Your Story', duration: '120s' },
          { id: 'p2', title: 'Strengths Showcase', duration: '120s' },
          { id: 'p3', title: 'Career Journey', duration: '120s' }
        ]
      },
      {
        id: '1.2',
        title: 'Behavioral Questions',
        // We don't need the 'id: t2' anymore
        theory: { title: 'STAR Method Mastery', duration: '15 min', type: 'text', content: 'The STAR method is...' },
        practices: [
          { id: 'p4', title: 'Conflict Resolution', duration: '120s' },
          { id: 'p5', title: 'Leadership Moments', duration: '120s' },
          { id: 'p6', title: 'Failure & Growth', duration: '120s' }
        ]
      },
      // ... (rest of your sections)
    ]
  },
    {id: '2',
    title: 'Introduction to Interviews',
    description: 'Master the basics of personal and behavioral interview rounds',
    sections: [
      {
        id: '1.1',
        title: 'Tell Me About Yourself',
        // We don't need the 'id: t1' anymore
        theory: { title: 'Understanding Personal Narratives', duration: '12 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        practices: [
          { id: 'p1', title: 'Craft Your Story', duration: '120s' },
          { id: 'p2', title: 'Strengths Showcase', duration: '120s' },
          { id: 'p3', title: 'Career Journey', duration: '120s' }
        ]
      },
      {
        id: '1.2',
        title: 'Behavioral Questions',
        // We don't need the 'id: t2' anymore
        theory: { title: 'STAR Method Mastery', duration: '15 min', type: 'text', content: 'The STAR method is...' },
        practices: [
          { id: 'p4', title: 'Conflict Resolution', duration: '120s' },
          { id: 'p5', title: 'Leadership Moments', duration: '120s' },
          { id: 'p6', title: 'Failure & Growth', duration: '120s' }
        ]
      },
      // ... (rest of your sections)
    ]},
];

// Helper functions (keep these)
export const getModuleById = (moduleId) => modules.find(m => m.id === moduleId) || null;

export const getSectionById = (moduleId, sectionId) => {
  const module = getModuleById(moduleId);
  return module?.sections.find(s => s.id === sectionId) || null;
};

export const getTheoryBySection = (moduleId, sectionId) => {
  const section = getSectionById(moduleId, sectionId);
  return section?.theory || null;
};

// ... (keep any other helpers)

// 1. --- THIS IS THE FIX ---
// This creates a flat list of ALL items in the entire course, in order.
// We will now *always* use the string 'theory' as the itemId for theory lessons.
export const allItems = modules.flatMap(module =>
  module.sections.flatMap(section => [
    // Add the theory item
    { 
      moduleId: module.id, 
      sectionId: section.id, 
      itemId: 'theory', // <-- THIS IS THE FIX
      itemType: 'theory' 
    },
    // Add all practice items
    ...section.practices.map(practice => ({
      moduleId: module.id,
      sectionId: section.id,
      itemId: practice.id,
      itemType: 'practice',
    })),
  ])
);

