"use client";

import { useImageContext } from "@/context/image-context";
import { useLanguage } from "@/context/language-context";
import { AIService } from "@/services/AI-service";
import { Warning } from "@phosphor-icons/react";
import {
  Camera,
  Eye,
  X,
  PaperPlaneRight,
  LockSimple,
  ChatCircle,
  Code,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AssistantStream } from "openai/lib/AssistantStream";
// @ts-expect-error - OpenAI SDK type definitions are not complete
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import ProductRecommendations from "../components/product-recommendations";
import { InputText } from "primereact/inputtext";
import { useUserContext } from "@/context/profile-context";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "primereact/toast";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
  images?: string[];
};

type AssistantMessageProps = {
  text: string;
  onPreview: (content: string) => void;
  isActive?: boolean;
};

const UserMessage = ({ text, images }: { text: string; images?: string[] }) => {
  const { t } = useLanguage();
  const { user } = useUserContext();

  const displayName = user ? (
    `${user.firstName} ${user.lastName}`.trim()
  ) : (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
  );

  return (
    <div className="flex flex-col gap-3 mb-8 group">
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-medium text-gray-600">{t("chat.you")}</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold text-sm">
          {user?.avatar ? (
            <Image
              src={user?.avatar}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            displayName.toString().split(" ").map((name: string, index: number) => (
              <span key={index} className="text-sm">
                {name.charAt(0)}
              </span>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[85%] lg:max-w-2xl">
          {text && (
            <div className="bg-gradient-to-r from-primary-blue to-primary-darkblue text-white p-4 rounded-2xl rounded-br-md shadow-lg">
              <div className="whitespace-pre-line text-sm leading-relaxed">{text}</div>
            </div>
          )}
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-end">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative group/image"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden rounded-xl border-2 border-white shadow-lg">
                    <Image
                      src={url}
                      alt={`${t("chat.imagePlaceholder")} ${index + 1}`}
                      width={112}
                      height={112}
                      unoptimized
                      className="object-cover w-full h-full group-hover/image:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AssistantMessage = ({
  text,
  onPreview,
  isActive = false,
}: AssistantMessageProps) => {
  const { t } = useLanguage();

  const handlePreviewClick = () => {
    if (isActive) {
      onPreview("");
    } else {
      onPreview(text);
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-8 group">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white">
          <Image
            src="/broglow-app-logo.png"
            alt="BroGlow app logo"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        <span className="text-sm font-medium text-gray-700">{t("chat.ai")}</span>
      </div>
      <div className="flex justify-start">
        <div
          onClick={handlePreviewClick}
          className={`max-w-[85%] lg:max-w-2xl cursor-pointer transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-primary-blue/10 to-primary-darkblue/10 border-2 border-primary-blue/20"
              : "bg-white hover:bg-gray-50 border border-gray-200"
          } rounded-2xl rounded-bl-md shadow-lg p-4`}
        >
          <div className="prose prose-sm max-w-none">
            <Markdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">{children}</pre>,
              }}
            >
              {text}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-white">
          <Code size={16} weight="bold" />
        </div>
        <span className="text-sm font-medium text-gray-700">{t("chat.code")}</span>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[85%] lg:max-w-2xl bg-gray-900 text-green-400 rounded-xl p-4 shadow-lg overflow-x-auto">
          <pre className="text-sm font-mono">
            {text.split("\n").map((line, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-4 select-none">{String(index + 1).padStart(2, ' ')}</span>
                <span>{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white">
          <Image
            src="/broglow-app-logo.png"
            alt="BroGlow app logo"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        <span className="text-sm font-medium text-gray-700">{t("chat.ai")}</span>
      </div>
      <div className="flex justify-start">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-lg p-4">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

type ExtendedMessageProps = MessageProps & {
  onPreview?: (content: string) => void;
  isActive?: boolean;
};

const Message = ({
  role,
  text,
  images,
  onPreview,
  isActive,
}: ExtendedMessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} images={images} />;
    case "assistant":
      return (
        <AssistantMessage
          text={text}
          onPreview={onPreview!}
          isActive={isActive}
        />
      );
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

// Remove the optional functionCallHandler prop from ChatProps
export default function ChatPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { images: contextImages, clearImages } = useImageContext();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [userInput, setUserInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [aiLimitWarning, setAiLimitWarning] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const toast = useToast();

  // Product recommendation states
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [hasCheckedRecommendations, setHasCheckedRecommendations] = useState(false);
  const [showRecommendButton, setShowRecommendButton] = useState(false);

  // State cho tone (phong thái)
  const [selectedTone, setSelectedTone] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define the functionCallHandler inside the component
  const functionCallHandler = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toolCall: RequiredActionFunctionToolCall
  ): Promise<string> => {
    // Default implementation
    return Promise.resolve("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format API messages to MessageProps
  const formatAPIMessagesToProps = async (
    apiMessages: any[]
  ): Promise<MessageProps[]> => {
    const formattedMessages: MessageProps[] = [];

    for (const message of apiMessages) {
      const role = message.role as "user" | "assistant";
      let text = "";
      let images: string[] | undefined = undefined;

      if (message.content && Array.isArray(message.content)) {
        const imageFiles = message.content
          .filter((item: any) => item.type === "image_file")
          .map((item: any) => item.image_file.file_id);

        if (imageFiles.length > 0) {
          const imageUrlPromises = imageFiles.map(async (fileId: string) => {
            try {
              return await AIService.getFile(fileId);
            } catch (error) {
              console.error(`Error fetching file ${fileId}:`, error);
              return null;
            }
          });

          images = (await Promise.all(imageUrlPromises)).filter(
            (url): url is string => url !== null
          );
        }

        const textItems = message.content.filter(
          (item: any) => item.type === "text"
        );
        text = textItems
          .map((item: any) =>
            typeof item.text === "object" ? item.text.value || "" : item.text
          )
          .join("");
      } else if (typeof message.content === "string") {
        text = message.content;
      }

      if (text.includes("[object Object]")) {
        const objectPattern = /^\[object Object\](\[object Object\])*$/;
        if (objectPattern.test(text)) {
          text = "";
        }
      }

      formattedMessages.push({ role, text, images });
    }

    return formattedMessages;
  };

  // Add a function to fetch product recommendations
  const fetchProductRecommendations = async (threadId: string) => {
    if (!threadId || !isOwner) return;

    try {
      setIsLoadingProducts(true);
      const productIds = await AIService.getProductRecommendations(threadId);

      if (productIds && productIds.length > 0) {
        const productsData = await Promise.all(
          productIds.map(id => AIService.getProductById(id))
        );

        // Filter out any null results
        const validProducts = productsData.filter(product => product !== null);
        setRecommendedProducts(validProducts);
      }
    } catch (error: any) {
      console.log("Failed to fetch product recommendations:", error);
      if (error.statusCode === 403) {
        setAiLimitWarning("Bạn đã đạt giới hạn sử dụng hôm nay, vui lòng nâng cấp gói để sử dụng tiếp!");
      } else if (error.statusCode === 400) {
        toast.showWarning(
          {
            summary: "Không có thông tin",
            detail: "Bạn vui lòng quét da để mình gợi ý sản phẩm nhé!",
          }
        );
      } else {
        toast.showError(
          error.message.content || "Lỗi khi tải sản phẩm"
        );
      }
    } finally {
      setIsLoadingProducts(false);
      setHasCheckedRecommendations(true);
    }
  };

  // Update the useEffect that handles thread loading
  useEffect(() => {
    // Fetch message history
    const fetchMessageHistory = async (threadId: string) => {
      setIsLoading(true);
      try {
        const response = await AIService.listMessagesByThread(threadId);

        if (response.data?.success && Array.isArray(response.data?.data)) {
          const formattedMessages = await formatAPIMessagesToProps(
            response.data.data
          );
          setMessages(formattedMessages);

          const lastAssistantMessage = formattedMessages
            .filter((msg) => msg.role === "assistant")
            .pop();

          if (lastAssistantMessage && lastAssistantMessage.text) {
            setPreviewContent(lastAssistantMessage.text);
          }

          // Show recommendation button if there are assistant messages
          const hasAssistantMessages = formattedMessages.some(msg => msg.role === "assistant");
          if (hasAssistantMessages) {
            setShowRecommendButton(true);
          }
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching message history:", error);
      } finally {
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    // Check thread ownership
    const checkOwnership = async (threadId: string) => {
      try {
        const ownership = await AIService.isThreadOwner(threadId);
        setIsOwner(ownership);
        if (!ownership) {
          setInputDisabled(true);
        }
      } catch (error) {
        console.error("Error checking thread ownership:", error);
      }
    };

    if (id) {
      const currentThreadId = typeof id === "string" ? id : id[0];
      setThreadId(currentThreadId);
      checkOwnership(currentThreadId);
      if (contextImages.length === 0) fetchMessageHistory(currentThreadId);
    } else {
      const createThread = async () => {
        try {
          const res = await AIService.createThread();
          setThreadId(res.id);
          setIsOwner(true);
        } catch (error) {
          console.error("Lỗi khi tạo thread:", error);
        }
      };
      createThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle recommendation button click
  const handleLoadRecommendations = () => {
    if (threadId && !hasCheckedRecommendations && !isLoadingProducts) {
      fetchProductRecommendations(threadId);
    }
  };

  // Upload file utility
  const uploadFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "vision");

      const response = await AIService.uploadFile(formData);
      if (!response.id) {
        throw new Error("Upload file failed");
      }
      return response.id;
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      throw error;
    }
  };

  // Handle context images
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (threadId && contextImages.length > 0) {
      const imageUrls = contextImages.map((img) => img.previewUrl);
      appendMessage("user", "", imageUrls);
      sendMessage("", contextImages);
      clearImages();
    }
  }, [threadId, contextImages, clearImages]);

  // Stream event handlers
  const handleTextCreated = () => {
    appendMessage("assistant", "");
    setIsTyping(false);
  };

  const handleTextDelta = (delta: any) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  const handleImageFileDone = async (image: any) => {
    try {
      const imageUrl = await AIService.getFile(image.file_id);
      appendToLastMessage(`\n![${image.file_id}](${imageUrl})\n`);
    } catch (error) {
      console.error("Error handling image file:", error);
    }
  };

  const toolCallCreated = (toolCall: any) => {
    if (toolCall.type !== "code_interpreter") return;
    appendMessage("code", "");
  };

  const toolCallDelta = (delta: any) => {
    if (delta.type !== "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall: any) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  const handleRunCompleted = () => {
    setInputDisabled(false);
    setIsTyping(false);
    // Show recommendation button after AI has responded
    setShowRecommendButton(true);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
    stream.on("imageFileDone", handleImageFileDone);
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);
    stream.on("event", (event: any) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  // Utility Helpers
  const appendToLastMessage = (text: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      const updated = { ...last, text: last.text + text };
      return [...prev.slice(0, -1), updated];
    });
  };

  const appendMessage = (
    role: "user" | "assistant" | "code",
    text: string,
    images?: string[]
  ) => {
    setMessages((prev) => [...prev, { role, text, images }]);
  };

  const annotateLastMessage = (annotations: any[]) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      let updatedText = last.text;
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedText = updatedText.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prev.slice(0, -1), { ...last, text: updatedText }];
    });
  };

  const submitActionResult = async (runId: string, toolCallOutputs: any) => {
    try {
      const response = await AIService.submitToolOutputs(
        threadId,
        runId,
        toolCallOutputs
      );

      const webStream = new Response(response).body;

      if (!webStream) {
        console.error("Web stream chuyển đổi thất bại");
        return;
      }

      const stream = AssistantStream.fromReadableStream(webStream);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Lỗi khi submit tool outputs:", error);
    }
  };

  // Tải tone từ localStorage khi component được load
  useEffect(() => {
    if (threadId) {
      const savedTone = localStorage.getItem(`thread_${threadId}_tone`);
      if (savedTone) {
        setSelectedTone(savedTone);
      }
    }
  }, [threadId]);

  // Send message method
  const sendMessage = async (
    text: string,
    attachedImgs: { file: File; previewUrl: string }[] = []
  ) => {
    setInputDisabled(true);
    setIsTyping(true);
    try {
      let content: any[] = [];

      if (text.trim() !== "") {
        content.push({ type: "text", text });
      }

      if (attachedImgs.length > 0) {
        const uploadPromises = attachedImgs.map(async (img) => {
          const fileId = await uploadFile(img.file);
          return {
            type: "image_file",
            image_file: { file_id: fileId, detail: "auto" },
          };
        });
        const uploadedContent = await Promise.all(uploadPromises);
        content = [...content, ...uploadedContent];
      }

      if (content.length === 0) {
        console.error("Không thể gửi tin nhắn rỗng");
        setInputDisabled(false);
        setIsTyping(false);
        return;
      }

      const response = await AIService.sendMessage(
        threadId,
        content,
        selectedTone || undefined
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        if (errorData.error.toString().includes("403")) setAiLimitWarning("Bạn đã đạt giới hạn sử dụng hôm nay, vui lòng nâng cấp gói để sử dụng tiếp!");
        throw new Error(`Server responded with ${response.status}`);
      }

      const webStream = response.body;
      if (!webStream) {
        console.error("Web stream không khả dụng");
        setIsTyping(false);
        return;
      }

      const stream = AssistantStream.fromReadableStream(webStream);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setIsTyping(false);
    } finally {
      setInputDisabled(false);
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId) {
      console.error("Thread ID chưa được thiết lập, không thể gửi tin nhắn.");
      return;
    }
    if (!userInput.trim() && attachedImages.length === 0) return;
    appendMessage(
      "user",
      userInput,
      attachedImages.map((img) => img.previewUrl)
    );
    await sendMessage(userInput, attachedImages);
    setAttachedImages([]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  // Image upload handlers
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setAttachedImages((prev) => [...prev, ...newImages]);
      e.target.value = "";
    }
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Toast ref={toast.toast} />

      <div className="flex flex-col lg:flex-row lg:gap-6 max-w-7xl w-full mx-auto lg:py-5 flex-grow overflow-hidden">
        {/* Chat container */}
        <div className="flex flex-col h-screen lg:h-auto w-full bg-white lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-200">
          {/* Mobile header - shown only on mobile */}
          <div className="lg:hidden">
            {/* Mobile Recommendation Button */}
            {showRecommendButton && isOwner && !hasCheckedRecommendations && !isLoadingProducts && (
              <div className="px-4 py-3 bg-gradient-to-r from-primary-blue/5 to-primary-darkblue/5 border-b border-primary-blue/20">
                <button
                  onClick={handleLoadRecommendations}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white text-sm font-semibold rounded-full cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out"
                >
                  <Eye size={16} weight="bold" className="text-white" />
                  {t("chat.viewProductRecommendations") || "View Product Recommendations"}
                </button>
              </div>
            )}

            {/* Mobile Loading state for recommendations */}
            {isLoadingProducts && (
              <div className="px-4 py-3 bg-gradient-to-r from-primary-blue/5 to-primary-darkblue/5 border-b border-primary-blue/20">
                <div className="flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-xl border border-primary-blue/20 shadow-sm">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-blue border-t-transparent rounded-full"></div>
                  <span className="text-sm text-primary-blue font-semibold">Loading recommendations...</span>
                </div>
              </div>
            )}

            {/* Mobile Show when recommendations are loaded */}
            {recommendedProducts.length > 0 && (
              <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <div className="flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-xl border border-green-200 shadow-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-semibold">
                    {recommendedProducts.length} recommendation{recommendedProducts.length !== 1 ? 's' : ''} available
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Chat Header */}
          <div className="hidden lg:flex flex-col bg-gradient-to-r from-primary-blue/5 to-primary-darkblue/5 rounded-t-2xl border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary-blue to-primary-darkblue text-white">
                  <Image
                    src="/broglow-app-logo.png"
                    alt="BroGlow app logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {t("chat.ai")}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t("chat.aiAssistant")}
                  </p>
                </div>
              </div>

              {/* Recommendation Button in Header */}
              {showRecommendButton && isOwner && !hasCheckedRecommendations && !isLoadingProducts && (
                <button
                  onClick={handleLoadRecommendations}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 shadow-lg border border-primary-blue/20 cursor-pointer"
                >
                  <Eye size={18} weight="bold" className="text-white" />
                  {t("chat.viewProductRecommendations") || "View Recommendations"}
                </button>
              )}

              {/* Loading state for recommendations */}
              {isLoadingProducts && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary-blue/10 to-primary-darkblue/10 rounded-xl border border-primary-blue/20">
                  <div className="animate-spin w-5 h-5 border-2 border-primary-blue border-t-transparent rounded-full"></div>
                  <span className="text-sm text-primary-blue font-semibold">Loading...</span>
                </div>
              )}

              {/* Show when recommendations are loaded */}
              {recommendedProducts.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-semibold">
                    {recommendedProducts.length} recommendation{recommendedProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Messages display */}
          <div className="flex-grow overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-gray-50/50 to-white">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
                  <p className="text-gray-600 font-medium"> {t("common.loading")} {t("thread.conversation")}...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-blue/10 to-primary-darkblue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatCircle size={32} className="text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {t("chat.startConversation")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("thread.startFirstChatDescription")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Warning Messages */}
                {!isOwner && (
                  <div className="sticky top-0 z-10 rounded-xl mb-6 px-4 py-3 flex gap-3 items-center shadow-sm border border-orange-200 bg-orange-50">
                    <LockSimple
                      size={20}
                      weight="fill"
                      className="text-orange-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {t("chat.viewOnlyMode")}
                      </span>
                      <span className="text-sm text-gray-600">
                        {t("chat.noPermissionToSend")}
                      </span>
                    </div>
                  </div>
                )}

                {aiLimitWarning && aiLimitWarning.length > 0 && (
                  <div className="sticky top-0 z-10 rounded-xl mb-6 px-4 py-3 flex gap-3 items-center shadow-sm border border-amber-200 bg-amber-50">
                    <Warning
                      size={20}
                      weight="fill"
                      className="text-amber-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {t("chat.aiWarning")}
                      </span>
                      <span className="text-sm text-gray-600">
                        {aiLimitWarning}
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className="animate-fadeIn"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeIn 0.5s ease-out forwards',
                        opacity: 0
                      }}
                    >
                      <Message
                        role={msg.role}
                        text={msg.text}
                        images={msg.images}
                        onPreview={
                          msg.role === "assistant" ? setPreviewContent : undefined
                        }
                        isActive={
                          msg.role === "assistant" && msg.text === previewContent
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Display typing indicator if AI is typing */}
                {isTyping && <TypingIndicator />}

                {/* Show product recommendations after loading */}
                {!isTyping && recommendedProducts.length > 0 && (
                  <ProductRecommendations
                    products={recommendedProducts}
                    isLoading={false}
                  />
                )}

                {!isTyping && isLoadingProducts && (
                  <ProductRecommendations
                    products={[]}
                    isLoading={true}
                  />
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <div className="border-t border-gray-200 bg-white rounded-b-2xl">
            <form
              onSubmit={handleSubmit}
              className="p-4 lg:p-6"
            >
              {/* Attached images preview */}
              {attachedImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {attachedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm">
                        <Image
                          src={img.previewUrl}
                          alt={`${t("chat.imagePlaceholder")} ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachedImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-200 focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/20 transition-all duration-200">
                <InputText
                  placeholder={
                    isOwner
                      ? t("chat.enterRequest")
                      : t("chat.viewOnlyPlaceholder")
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 !p-0 !border-none !shadow-none !ring-0 !bg-transparent !text-gray-900 placeholder:text-gray-500"
                  disabled={inputDisabled || isLoading || !isOwner}
                />

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={inputDisabled || isLoading || !isOwner}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={
                    !inputDisabled && !isLoading && isOwner
                      ? handleImageUploadClick
                      : undefined
                  }
                  disabled={inputDisabled || isLoading || !isOwner}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    !inputDisabled && !isLoading && isOwner
                      ? "text-gray-600 hover:text-primary-blue hover:bg-primary-blue/10 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Camera size={20} weight="fill" />
                </button>

                <button
                  type="submit"
                  title={t("chat.sendMessage")}
                  aria-label={t("chat.sendMessage")}
                  disabled={
                    inputDisabled ||
                    isLoading ||
                    (!userInput.trim() && attachedImages.length === 0) ||
                    !isOwner
                  }
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    !inputDisabled &&
                    !isLoading &&
                    isOwner &&
                    (userInput.trim() || attachedImages.length > 0)
                      ? "text-primary-blue hover:bg-primary-blue/10 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
