import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTrendingTopics, generateSummary, approveSummary, generateContent, approveContent, publishPost } from '../api/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';

const CreatePost = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Multi-step workflow state
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [topic, setTopic] = useState(location.state?.initialTopic || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generated content state
  const [summary, setSummary] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [summaryApproved, setSummaryApproved] = useState(false);
  const [platformContent, setPlatformContent] = useState({});
  const [publishedPosts, setPublishedPosts] = useState({});

  // Current data IDs
  const [summaryId, setSummaryId] = useState(null);
  const [platformIds, setPlatformIds] = useState({});

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', description: 'Social networking platform' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', description: 'Microblogging platform' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', description: 'Professional networking' },
    { id: 'instagram', name: 'Instagram', icon: '📷', description: 'Photo & video sharing' }
  ];

  const steps = [
    { id: 1, title: 'Choose Topic', description: 'Select topic and add description' },
    { id: 2, title: 'Generate Summary', description: 'AI generates content summary' },
    { id: 3, title: 'Approve Summary', description: 'Review and approve summary' },
    { id: 4, title: 'Select Platforms', description: 'Choose where to publish' },
    { id: 5, title: 'Generate Content', description: 'AI creates platform-specific posts' },
    { id: 6, title: 'Review & Publish', description: 'Edit content and publish' }
  ];

  // Step 1: Handle topic submission (only topic required)
  const handleGenerateSummary = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate summary with just topic (description optional)
      const response = await generateSummary(topic, '');
      setGeneratedSummary(response.summary_text);
      setSummaryId(response.summary_id);
      setSummary(response.summary_text);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Approve summary
  const handleApproveSummary = async () => {
    if (!summary.trim()) {
      setError('Please enter a summary');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await approveSummary(summaryId, summary);
      setSummaryApproved(true);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message || 'Failed to approve summary');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Select platforms and generate content
  const handleGenerateContent = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateContent(summaryId, selectedPlatforms);

      // Process the generated content for each platform
      const contentMap = {};
      const idMap = {};

      response.platforms.forEach(platform => {
        contentMap[platform.platform_name] = {
          postText: platform.post_text,
          imageUrl: platform.image_url,
          approved: false
        };
        idMap[platform.platform_name] = platform.platform_id;
      });

      setPlatformContent(contentMap);
      setPlatformIds(idMap);
      setCurrentStep(5);

    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Approve and publish content
  const handleApproveAndPublish = async () => {
    if (Object.keys(platformContent).length === 0) {
      setError('No content to publish');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = {};

      for (const [platformName, content] of Object.entries(platformContent)) {
        try {
          // Approve the content first
          await approveContent(platformIds[platformName], content.postText, content.imageUrl);

          // Then publish it
          await publishPost(platformIds[platformName]);

          results[platformName] = { success: true, message: 'Published successfully' };
        } catch (err) {
          results[platformName] = { success: false, message: err.message };
        }
      }

      setPublishedPosts(results);
      setCurrentStep(6);

      // After publishing, navigate to history with results
      setTimeout(() => {
        navigate('/history', {
          state: {
            newPublishedPosts: Object.keys(results).filter(platform =>
              results[platform].success
            ).length
          }
        });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to publish content');
    } finally {
      setLoading(false);
    }
  };

  // Update platform content
  const updatePlatformContent = (platformName, field, value) => {
    setPlatformContent(prev => ({
      ...prev,
      [platformName]: {
        ...prev[platformName],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex flex-col items-center ${
                step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-xs font-medium text-center">
                  <div className="font-semibold">{step.title}</div>
                  <div className="text-gray-500 mt-1">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 mt-5 ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Step Content */}
      <Card className="p-8">
        {/* Step 1: Choose Topic */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What's your content about?</h2>
              <div className="space-y-4">
                <Input
                  label="Topic"
                  placeholder="Enter your main topic or use trending topics below"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
                {/* Description removed as requested */}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">💡 Trending Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "AI in digital marketing",
                  "Sustainable business practices",
                  "Social media advertising trends",
                  "Remote work productivity"
                ].map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => setTopic(trend)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <p className="font-medium text-gray-900">{trend}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleGenerateSummary}
                disabled={loading || !topic.trim()}
                size="lg"
              >
                {loading ? 'Generating Summary...' : 'Generate Summary →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Generate Summary */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Generated Summary</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Your Topic: {topic}</h3>
                <p className="text-blue-800 whitespace-pre-wrap">{generatedSummary}</p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                💡 This AI-generated summary captures the essence of your content. You can modify it in the next step.
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="secondary"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                size="lg"
              >
                Continue to Edit →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Edit Summary */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review and Edit Summary</h2>
              <Textarea
                label="Content Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
                placeholder="Edit the AI-generated summary to make it perfect for your content"
                required
              />
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="secondary"
              >
                ← Back
              </Button>
              <Button
                onClick={handleApproveSummary}
                disabled={loading || !summary.trim()}
                size="lg"
              >
                {loading ? 'Approving...' : 'Approve Summary →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Select Platforms */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Where do you want to publish?</h2>
              <p className="text-gray-600 mb-6">Select the platforms where you'd like to share your content. AI will optimize each post for the selected platform.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatforms(prev =>
                        prev.includes(platform.id)
                          ? prev.filter(p => p !== platform.id)
                          : [...prev, platform.id]
                      );
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{platform.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="secondary"
              >
                ← Back
              </Button>
              <Button
                onClick={handleGenerateContent}
                disabled={loading || selectedPlatforms.length === 0}
                size="lg"
              >
                {loading ? 'Generating Content...' : 'Generate Platform Content →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review Generated Content */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Generated Content</h2>
              <p className="text-gray-600 mb-6">AI has created optimized content for each platform. Review, edit, and approve what looks good.</p>
            </div>

            <div className="space-y-6">
              {Object.entries(platformContent).map(([platformName, content]) => (
                <div key={platformName} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">
                      {platforms.find(p => p.id === platformName.toLowerCase())?.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{platformName}</h3>
                  </div>

                  <div className="space-y-4">
                    {content.imageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Generated Image</label>
                        <div className="flex items-center space-x-4">
                          <img
                            src={content.imageUrl}
                            alt="Generated content"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <Input
                            placeholder="Edit image URL if needed"
                            value={content.imageUrl}
                            onChange={(e) => updatePlatformContent(platformName, 'imageUrl', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <Textarea
                      label={`Content for ${platformName}`}
                      value={content.postText}
                      onChange={(e) => updatePlatformContent(platformName, 'postText', e.target.value)}
                      rows={4}
                      placeholder={`Edit the generated content for ${platformName}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(4)}
                variant="secondary"
              >
                ← Back
              </Button>
              <Button
                onClick={handleApproveAndPublish}
                disabled={loading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Publishing...' : '🚀 Publish All Posts'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Publishing Results */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Publishing Complete!</h2>
              <p className="text-gray-600">Your content has been published to the selected platforms.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(publishedPosts).map(([platform, result]) => (
                <div
                  key={platform}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {platforms.find(p => p.id === platform.toLowerCase())?.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform}</h3>
                      <p className={`text-sm ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => navigate('/history')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View History
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreatePost;
