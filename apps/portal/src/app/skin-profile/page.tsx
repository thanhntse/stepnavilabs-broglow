"use client";

import { useLanguage } from "@/context/language-context";
import { SkinProfileService, SkinQuestion, SkinProfileAnswer, SubmitSkinProfileDto, SkinProfile } from "@/services/skin-profile-service";
import { ArrowLeft, ArrowRight, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SkinProfilePage() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [questions, setQuestions] = useState<SkinQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SkinProfileAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<SkinProfile | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadQuestions();
    checkExistingProfile();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await SkinProfileService.getQuestions({
        sortBy: "order",
        sortOrder: "asc",
        limit: 50,
      });
      setQuestions(response.data.filter(q => q.isActive));
    } catch (error) {
      console.error("Error loading questions:", error);
      showError({ detail: "Failed to load questions" });
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingProfile = async () => {
    try {
      const profile = await SkinProfileService.getUserSkinProfile();
      setUserProfile(profile);
      setShowResults(true);
    } catch {
      // Profile doesn't exist, user needs to take assessment
      console.log("No existing profile found");
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, answer };
        return newAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData: SubmitSkinProfileDto = { answers };
      const profile = await SkinProfileService.submitSkinProfile(submitData);
      setUserProfile(profile);
      setShowResults(true);
      showSuccess({ detail: "Skin profile submitted successfully" });
    } catch (error) {
      console.error("Error submitting skin profile:", error);
      showError({ detail: "Failed to submit skin profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await SkinProfileService.deleteUserSkinProfile();
      setUserProfile(null);
      setShowResults(false);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      showSuccess({ detail: "Skin profile deleted successfully" });
    } catch (error) {
      console.error("Error deleting skin profile:", error);
      showError({ detail: "Failed to delete skin profile" });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?._id);

  if (isLoading) {
    return (
      <>
        <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  if (showResults && userProfile) {
    return (
      <>
        <div className="min-h-[calc(100vh-100px)] bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-8 text-white">
                <div className="flex items-center gap-4">
                  <Sparkle size={32} />
                  <div>
                    <h1 className="text-2xl font-bold">{t("common.skinProfileTitle")}</h1>
                    <p className="text-purple-100">{t("common.assessmentComplete")}</p>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skin Type */}
                  {userProfile.skinType && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Skin Type</h3>
                      <p className="text-blue-700">{userProfile.skinType}</p>
                    </div>
                  )}

                  {/* Concerns */}
                  {userProfile.concerns && userProfile.concerns.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Skin Concerns</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.concerns.map((concern, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {userProfile.recommendations && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Recommendations</h3>
                    <p className="text-green-700 whitespace-pre-wrap">{userProfile.recommendations}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setAnswers([]);
                      setCurrentQuestionIndex(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                  >
                    <Sparkle size={18} />
                    Retake Assessment
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    Delete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Sparkle size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("common.noQuestions")}</h2>
            <p className="text-gray-600">{t("common.skinProfileDescription")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-100px)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <Sparkle size={32} />
                <div>
                  <h1 className="text-2xl font-bold">{t("common.skinProfileTitle")}</h1>
                  <p className="text-purple-100">{t("common.skinProfileDescription")}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= currentQuestionIndex ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="p-6">
              {currentQuestion && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {currentQuestion.question}
                    </h2>
                    {currentQuestion.isRequired && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {t("common.required")}
                      </span>
                    )}
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    {currentQuestion.questionType === "text" && (
                      <textarea
                        value={currentAnswer?.answer as string || ""}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Enter your answer..."
                      />
                    )}

                    {currentQuestion.questionType === "single_choice" && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${currentQuestion._id}`}
                              value={option}
                              checked={currentAnswer?.answer === option}
                              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                              className="text-purple-500 focus:ring-purple-500"
                            />
                            <span className="flex-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {currentQuestion.questionType === "multiple_choice" && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              value={option}
                              checked={(currentAnswer?.answer as string[] || []).includes(option)}
                              onChange={(e) => {
                                const currentAnswers = (currentAnswer?.answer as string[]) || [];
                                const newAnswers = e.target.checked
                                  ? [...currentAnswers, option]
                                  : currentAnswers.filter(a => a !== option);
                                handleAnswerChange(currentQuestion._id, newAnswers);
                              }}
                              className="text-purple-500 focus:ring-purple-500"
                            />
                            <span className="flex-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft size={18} />
                      {t("common.previousQuestion")}
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                            {t("common.loading")}
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            {t("common.submitAssessment")}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        disabled={!currentAnswer?.answer}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("common.nextQuestion")}
                        <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
