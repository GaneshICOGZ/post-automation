import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postsAPI, trendsAPI } from '../api/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

const CreatePost = () => {
  const [searchParams] = useSearchParams();
  const summaryId = searchParams.get('summary_id');

  // Step 1: Topic & Description
  const [step1Data, setStep1Data] = useState({
    topic: '',
    description: ''
  });

  // Step 2: Generated Summary
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [summaryIdState, setSummaryIdState] = useState(null);

  // Step 3: Platform Selection
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  // Step 4: Generated Platform Content
  const [platformContent, setPlatformContent] = useState([]);

  // Step 5: Publishing
  const [publishing, setPublishing] = useState(false);

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuggestions();
    if (summaryId) {
      loadExistingPost(summaryId);
    }
  }, [summaryId]);

  const loadSuggestions = async () => {
    try {
      const response = await trendsAPI.getSuggestions();
      setSuggestions(response.data.topics || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const loadExistingPost = async (id) => {
    try {
      const response = await postsAPI.getPostWithPlatforms(id);
      const postData = response.data;

      setStep1Data({
        topic: postData.summary.topic,
        description: postData.summary.description || ''
      });
      setGeneratedSummary(postData.summary.summary_text);
      setSummaryIdState(id);
      setPlatformContent(postData.platforms);
      setCurrentStep(postData.summary.summary_approved ? 4 : 3);
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  };

  const handleStep1Change = (e) => {
    const { name, value } = e.target;
    setStep1Data(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuggestionClick = (topic) => {
    setStep1Data(prev => ({
      ...prev,
      topic: topic
    }));
  };

  const generateSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await postsAPI.generateSummary(step1Data);
      setGeneratedSummary(response.data.summary_text);
      setCurrentStep(2);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const approveSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await postsAPI.approveSummary({
        topic: step1Data.topic,
        description: step1Data.description,
        summary_text: generatedSummary
      });
      setSummaryIdState(response.data.summary_id);
      setCurrentStep(3);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to approve summary');
    } finally {
      setLoading(false);
    }
  };

  const generatePlatformContent = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await postsAPI.generateContent(summaryIdState, selectedPlatforms);
      setPlatformContent(response.data.platforms);
      setCurrentStep(4);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to generate platform content');
    } finally {
      setLoading(false);
    }
  };

  const approvePlatformContent = async (platformIndex) => {
    const platform = platformContent[platformIndex];

    try {
      // Create a unique platform ID for this approval
      const platformId = `${summaryIdState}_${platform.name}_${Date.now()}`;

      await postsAPI.approveContent({
        platform_id: platformId,
        post_text: platform.content || platform.post_text,
        image_url: platform.image || platform.image_url,
        summary_id: summaryIdState,
        platform_name: platform.name
      });

      // Update local state
      const updatedPlatforms = [...platformContent];
      updatedPlatforms[platformIndex] = {
        ...platform,
        id: platformId,
        approved: true,
        post_text: platform.content || platform.post_text,
        image_url: platform.image || platform.image_url
      };
      setPlatformContent(updatedPlatforms);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to approve platform content');
    }
  };

  const publishPlatforms = async () => {
    const approvedPlatforms = platformContent.filter(p => p.approved);
    if (approvedPlatforms.length === 0) {
      setError('Please approve at least one platform before publishing');
      return;
    }

    setPublishing(true);
    setError('');

    try {
      const platformIds = approvedPlatforms.map(p => p.id);
      await postsAPI.publishMultiple(platformIds);
      alert('Posts published successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to publish posts');
    } finally {
      setPublishing(false);
    }
  };

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'blue' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'blue' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'blue' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'pink' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create AI Content</h1>
          <p className="text-gray-600">Generate, customize, and publish content across multiple platforms</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < 5 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Topic & Description */}
        {currentStep === 1 && (
          <Card title="Step 1: Define Your Content" subtitle="Enter the topic and description for your post">
            {/* Topic Suggestions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Trending Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.topic)}
                    className="p-3 border border-gray-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{suggestion.topic}</div>
                    <div className="text-sm text-gray-500 mt-1">{suggestion.category}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Topic"
                name="topic"
                placeholder="Enter your post topic"
                value={step1Data.topic}
                onChange={handleStep1Change}
                required
              />

              <Textarea
                label="Description"
                name="description"
                placeholder="Provide a detailed description of your content..."
                value={step1Data.description}
                onChange={handleStep1Change}
                rows={4}
                required
              />

              <div className="flex justify-end">
                <Button onClick={generateSummary} loading={loading} size="lg">
                  Generate AI Summary
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Review Summary */}
        {currentStep === 2 && generatedSummary && (
          <Card title="Step 2: Review AI Summary" subtitle="Review and approve the generated summary">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Generated Summary:</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{generatedSummary}</p>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="secondary"
              >
                ← Back to Edit
              </Button>
              <Button onClick={approveSummary} loading={loading} size="lg">
                Approve Summary
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Select Platforms */}
        {currentStep === 3 && (
          <Card title="Step 3: Select Platforms" subtitle="Choose platforms for content generation">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatforms(prev =>
                      prev.includes(platform.id)
                        ? prev.filter(p => p !== platform.id)
                        : [...prev, platform.id]
                    );
                  }}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div className="font-medium text-gray-900">{platform.name}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="secondary"
              >
                ← Back to Summary
              </Button>
              <Button
                onClick={generatePlatformContent}
                loading={loading}
                size="lg"
                disabled={selectedPlatforms.length === 0}
              >
                Generate Platform Content
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review Platform Content */}
        {currentStep === 4 && platformContent.length > 0 && (
          <Card title="Step 4: Review Platform Content" subtitle="Review and approve content for each platform">
            <div className="space-y-6 mb-6">
              {platformContent.map((platform, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{platforms.find(p => p.id === platform.name)?.icon}</span>
                      <span className="font-medium text-gray-900">
                        {platforms.find(p => p.id === platform.name)?.name}
                      </span>
                    </div>
                    {platform.approved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Approved
                      </span>
                    ) : (
                      <Button
                        onClick={() => approvePlatformContent(index)}
                        size="sm"
                      >
                        Approve
                      </Button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{platform.content}</p>
                  </div>

                  {platform.image && (
                    <div className="text-xs text-gray-500">
                      Image: {platform.image}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="secondary"
              >
                ← Back to Platforms
              </Button>
              <Button
                onClick={publishPlatforms}
                loading={publishing}
                size="lg"
                variant="success"
                disabled={!platformContent.some(p => p.approved)}
              >
                {publishing ? 'Publishing...' : 'Publish All'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
