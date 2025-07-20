"use client";

import { useLanguage } from "@/context/language-context";
import { RoutineService, RoutineQuestion, RoutineAnswer, CreateRoutineAnswersDto } from "@/services/routine-service";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Sparkle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RoutinePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [questions, setQuestions] = useState<RoutineQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<RoutineAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");
  const [threadId, setThreadId] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await RoutineService.getQuestions({
        sortBy: "order",
        sortOrder: "asc",
        limit: 50,
      });
      setQuestions(response.data.filter(q => q.isActive));
    } catch (error) {
      console.error("Error loading questions:", error);
      showError({ detail: t("errors.failedToLoadQuestions") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      const answerArray = Array.isArray(answer) ? answer : [answer];

      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, answers: answerArray };
        return newAnswers;
      } else {
        return [...prev, { questionId, answers: answerArray }];
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
      const submitData: CreateRoutineAnswersDto = { answers };
      const response = await RoutineService.getSuggestions(submitData);

      // Extract threadId from the response
      let extractedThreadId = "";

      // Read the response stream to extract threadId and content
      const reader = response.responseStream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // Extract threadId from the first message
              if (data.threadId && !extractedThreadId) {
                extractedThreadId = data.threadId;
                setThreadId(data.threadId);
              } else if (data.event && data.event !== 'thread.run.failed') {
                // Handle the actual content
                if (data.content && data.content.length > 0) {
                  const content = data.content[0];
                  if (content.text && content.text.value) {
                    setSuggestionText(prev => prev + content.text.value);
                  }
                }
              }
            } catch {
              // If not JSON, treat as regular text
              setSuggestionText(prev => prev + line);
            }
          }
        });
      }

      setShowSuggestions(true);
      showSuccess({ detail: t("errors.routineSuggestionsGenerated") });
    } catch (error) {
      console.error("Error getting routine suggestions:", error);
      showError({ detail: t("errors.failedToGetRoutineSuggestions") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowSuggestions(false);
    setSuggestionText("");
    setThreadId("");
  };

  const handleContinueChat = () => {
    if (threadId) {
      router.push(`/thread/${threadId}`);
    } else {
      showError({ detail: "Thread ID not available" });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?._id);

  // Helper function to get question type for display
  const getQuestionType = (question: RoutineQuestion) => {
    switch (question.type) {
      case 'SINGLE_CHOICE':
        return 'single_choice';
      case 'MULTIPLE_CHOICE':
        return 'multiple_choice';
      case 'TEXT':
        return 'text';
      case 'SCALE':
        return 'scale';
      default:
        return 'text';
    }
  };

  // Helper function to get options for display
  const getQuestionOptions = (question: RoutineQuestion) => {
    if (!question.options) return [];
    return question.options.map(option => {
      return {
        label: option.label,
        value: option.value,
        description: option.description,
      }
    });
  };

  // Helper function to check if current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;

    const answer = currentAnswer?.answers;
    if (!answer || answer.length === 0) return false;

    // For required questions, check if answer exists
    if (currentQuestion.isRequired) {
      return answer.length > 0 && answer.some(a => a.trim().length > 0);
    }

    // For optional questions, always allow next
    return true;
  };

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

  if (showSuggestions) {
    return (
      <>
        <div className="min-h-[calc(100vh-100px)] bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
                <div className="flex items-center gap-4">
                  <Clock size={32} />
                  <div>
                    <h1 className="text-2xl font-bold">{t("common.routineTitle")}</h1>
                    <p className="text-orange-100">{t("common.assessmentComplete")}</p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("common.personalizedRoutine")}</h2>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-800 font-sans text-sm leading-relaxed">
                        {suggestionText || t("common.loadingSuggestions")}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleContinueChat}
                    disabled={!threadId}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkle size={18} />
                    {t("common.continueChat")}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Clock size={18} />
                    {t("common.startNewAssessment")}
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
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("common.noQuestions")}</h2>
            <p className="text-gray-600">{t("common.routineDescription")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-100px)] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <Clock size={32} />
                <div>
                  <h1 className="text-2xl font-bold">{t("common.routineTitle")}</h1>
                  <p className="text-orange-100">{t("common.routineDescription")}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t("common.question")} {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= currentQuestionIndex ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
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
                    {currentQuestion.description && (
                      <p className="text-gray-600 mb-2">{currentQuestion.description}</p>
                    )}
                    {currentQuestion.isRequired && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {t("common.required")}
                      </span>
                    )}
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    {getQuestionType(currentQuestion) === "text" && (
                      <textarea
                        value={currentAnswer?.answers?.[0] || ""}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder={t("common.enterAnswer")}
                      />
                    )}

                    {getQuestionType(currentQuestion) === "single_choice" && getQuestionOptions(currentQuestion).length > 0 && (
                      <div className="space-y-3">
                        {getQuestionOptions(currentQuestion).map((option, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${currentQuestion._id}`}
                              value={option.value}
                              checked={currentAnswer?.answers?.[0] === option.value}
                              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              {option.description && (
                                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {getQuestionType(currentQuestion) === "multiple_choice" && getQuestionOptions(currentQuestion).length > 0 && (
                      <div className="space-y-3">
                        {getQuestionOptions(currentQuestion).map((option, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={(currentAnswer?.answers || []).includes(option.value)}
                              onChange={(e) => {
                                const currentAnswers = currentAnswer?.answers || [];
                                const newAnswers = e.target.checked
                                  ? [...currentAnswers, option.value]
                                  : currentAnswers.filter(a => a !== option.value);
                                handleAnswerChange(currentQuestion._id, newAnswers);
                              }}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              {option.description && (
                                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {getQuestionType(currentQuestion) === "scale" && getQuestionOptions(currentQuestion).length > 0 && (
                      <div className="space-y-3">
                        {getQuestionOptions(currentQuestion).map((option, index) => (
                          <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${currentQuestion._id}`}
                              value={option.value}
                              checked={currentAnswer?.answers?.[0] === option.value}
                              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              {option.description && (
                                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                              )}
                            </div>
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
                        className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                            {t("common.loadingSuggestions")}
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            {t("common.getSuggestions")}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        disabled={currentQuestion.isRequired && !isCurrentQuestionAnswered()}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
