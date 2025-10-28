// src/components/pages/TheoryPage.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { getTheoryBySection } from '../../data/modulesData';
import { ArrowLeft, PlayCircle, FileText, CheckCircle } from 'lucide-react';

const TheoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeTheory } = useProgress(); // We will add 'completeTheory' in Step 4

  const moduleId = searchParams.get('module');
  const sectionId = searchParams.get('section');

  const theory = getTheoryBySection(moduleId, sectionId);

  if (!theory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Theory lesson not found.</p>
        <button 
          onClick={() => navigate('/maindash')} 
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleComplete = async () => {
  try {
    await completeTheory(moduleId, sectionId);
    alert('Progress saved!');
    navigate(`/maindash?module=${moduleId}`);
  } catch (err) {
    console.error(err);
    alert('Failed to save progress');
  }
};

  const backToModule = () => {
    navigate(`/maindash?module=${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Back Button */}
        <button onClick={backToModule} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Module</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {theory.type === 'video' ? 
              <PlayCircle className="w-6 h-6 text-indigo-600" /> : 
              <FileText className="w-6 h-6 text-indigo-600" />
            }
            <h1 className="text-3xl font-semibold text-gray-900">{theory.title}</h1>
          </div>
          <p className="text-gray-600">Module {moduleId} &bull; Section {sectionId} &bull; {theory.duration}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
          {theory.type === 'video' ? (
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded"
                src={theory.videoUrl} // Using the URL from our data file
                title={theory.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="prose lg:prose-xl">
              <p>{theory.content}</p> {/* Placeholder for text content */}
            </div>
          )}
        </div>

        {/* Completion Button */}
        <div className="text-center">
          <button 
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="w-5 h-5" />
            Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TheoryPage;