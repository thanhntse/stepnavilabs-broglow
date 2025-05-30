"use client";

import CopyButton from "@/components/copy-button";
import Header from "@/components/header";
import { useImageContext } from "@/context/image-context";
import { useLanguage } from "@/context/language-context";
import { ConversationTone } from "@/enums/tone.enum";
import { AIService } from "@/services/AI-service";
import { Warning } from "@phosphor-icons/react";
import {
  Camera,
  Eye,
  X,
  PaperPlaneRight,
  LockSimple,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AssistantStream } from "openai/lib/AssistantStream";
// @ts-expect-error - OpenAI SDK type definitions are not complete
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import FullScreenPreview from "../components/fullscreen-chat-preview";

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

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="text-sm font-semibold ml-auto">{t("chat.you")}</div>
      <div className="p-3 bg-orange-light self-end rounded-2xl rounded-tr max-w-[90vw] sm:max-w-2xl ml-auto w-fit">
        <div className="whitespace-pre-line text-sm text-black">{text}</div>
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 max-w-full">
            {images.map((url, index) => (
              <div
                key={index}
                className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px]"
              >
                <Image
                  src={url}
                  alt={`${t("chat.imagePlaceholder")} ${index}`}
                  width={120}
                  height={120}
                  unoptimized
                  className="object-cover rounded-md w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
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
      // If already active, clear the preview
      onPreview("");
    } else {
      // Otherwise set this message as preview
      onPreview(text);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 p-1.5 rounded-full bg-white border border-gray-200 text-center">
          <Image src="/logo-icon.svg" width={14} height={14} alt="logo-icon" />
        </div>
        <span className="text-sm font-semibold">{t("chat.ai")}</span>
      </div>
      <div
        onClick={handlePreviewClick}
        className={`p-3 ${isActive ? "bg-orange-light" : "bg-white"} self-start rounded-xl max-w-2xl border border-gray-300 cursor-pointer hover:bg-orange-light`}
      >
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className="p-4 bg-gray-200 self-start rounded-xl max-w-2xl font-mono text-black mb-6">
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span className="text-gray-600">{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const TypingIndicator = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 p-1.5 rounded-full bg-white border border-gray-200 text-center">
          <Image src="/logo-icon.svg" width={14} height={14} alt="logo-icon" />
        </div>
        <span className="text-sm font-semibold">{t("chat.ai")}</span>
      </div>
      <div className="p-3 bg-white self-start rounded-xl max-w-2xl border border-gray-300">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
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

  // State cho tone (phong thái)
  const [selectedTone, setSelectedTone] = useState<string | null>(null);

  // Danh sách phong thái AI từ enum ConversationTone
  const tones = [
    { label: t("aiTones.youngtive"), value: ConversationTone.YOUNGTIVE },
    { label: t("aiTones.professional"), value: ConversationTone.PROFESSIONAL },
    { label: t("aiTones.friendly"), value: ConversationTone.FRIENDLY },
    { label: t("aiTones.concise"), value: ConversationTone.DIRECT },
    { label: t("aiTones.detailed"), value: ConversationTone.ANALYTICAL },
  ];

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);

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

  // Update prompt count method
  const updatePromptCount = async () => {
    try {
      const prompt = await AIService.getAIUsage();
      return prompt.data;
    } catch (error) {
      console.error("Failed to update prompt count:", error);
      return 0;
    }
  };

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

  // Create or load thread
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

  // Sửa lại hàm xử lý thay đổi phong thái, bỏ phần hiển thị toast
  const handleToneChange = (value: string | null) => {
    // Cập nhật phong thái mới
    setSelectedTone(value);

    // Lưu ngay vào localStorage
    if (threadId) {
      if (value) {
        localStorage.setItem(`thread_${threadId}_tone`, value);
      } else {
        localStorage.removeItem(`thread_${threadId}_tone`);
      }
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
        if (errorData.statusCode === 403) setAiLimitWarning(errorData.message);
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
    <div className="flex flex-col h-screen">
      <div className="hidden lg:block">
        <Header variant="default" updatePromptCount={updatePromptCount} />
      </div>

      <section className="flex flex-col lg:flex-row lg:gap-6 max-w-7xl w-full mx-auto lg:py-5 flex-grow overflow-y-auto">
        {/* Chat container */}
        <div className="flex flex-col h-screen lg:h-auto lg:w-2/3">
          {/* Mobile header - shown only on mobile */}
          <div className="lg:hidden">
            <Header variant="default" updatePromptCount={updatePromptCount} />

            {/* Dropdown phong thái mobile */}
            <div className="px-4 py-2 flex items-center justify-between bg-primary-pastel border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 p-1.5 rounded-full bg-white border border-gray-200 text-center">
                  <Image
                    src="/logo-icon.svg"
                    width={14}
                    height={14}
                    alt="logo-icon"
                  />
                </div>
                <span className="text-base font-semibold">
                  {t("chat.ai")}{" "}
                  <sup className="text-[0.5em] align-super">TM</sup>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Dropdown
                  value={selectedTone}
                  onChange={(e) => handleToneChange(e.value)}
                  options={tones}
                  placeholder={t("home.aiToneDefault")}
                  className="!w-36 bg-white text-gray-700 rounded-lg"
                  showClear
                  pt={{
                    root: { className: "!border !border-gray-300 !h-8" },
                    input: {
                      className:
                        "!text-gray-700 !text-sm !py-1.5 !pl-3 !w-full",
                    },
                    panel: {
                      className: "!border !border-gray-300 !rounded-lg",
                    },
                    item: { className: "!hover:bg-orange-light !text-sm" },
                    trigger: { className: "!text-gray-600 !w-10" },
                    clearIcon: {
                      className:
                        "!text-gray-500 !hover:text-primary-orange !w-4 !h-4",
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col bg-primary-pastel rounded-t-lg border border-gray-300 border-b-0">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-6 h-6 p-1.5 rounded-full bg-white border border-gray-300 text-center">
                  <Image
                    src="/logo-icon.svg"
                    width={14}
                    height={14}
                    alt="logo-icon"
                  />
                </div>
                <span className="text-lg font-semibold">
                  {t("chat.ai")}{" "}
                  <sup className="text-[0.5em] align-super">TM</sup>
                </span>
              </div>

              {/* Dropdown phong thái desktop */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    {t("home.aiToneSelector")}:
                  </span>
                  <Dropdown
                    value={selectedTone}
                    onChange={(e) => handleToneChange(e.value)}
                    options={tones}
                    placeholder={t("home.aiToneDefault")}
                    className="!w-52 bg-white rounded-lg"
                    showClear
                    pt={{
                      root: { className: "!border !border-gray-300 !h-11" },
                      input: {
                        className: "!text-gray-700 !text-sm !font-medium",
                      },
                      trigger: { className: "!text-gray-600" },
                      panel: {
                        className: "!border !border-gray-200 !rounded-lg",
                      },
                      item: {
                        className:
                          "!hover:bg-orange-light !hover:text-gray-800",
                      },
                      clearIcon: {
                        className: "!text-gray-500 !hover:text-primary-orange",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages display */}
          <div className="flex-grow overflow-y-auto p-3 lg:p-6 lg:border-l lg:border-r lg:border-gray-300">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                {t("chat.startConversation")}
              </div>
            ) : (
              <>
                {!isOwner && (
                  <div className="sticky -top-2 lg:-top-4 bg-white rounded-lg mb-4 px-4 py-3 flex gap-3 items-center shadow-sm border border-gray-200">
                    <LockSimple
                      size={22}
                      weight="fill"
                      className="text-primary-orange"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {t("chat.viewOnlyMode")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {t("chat.noPermissionToSend")}
                      </span>
                    </div>
                  </div>
                )}
                {aiLimitWarning && aiLimitWarning.length > 0 && (
                  <div className="sticky -top-2 lg:-top-4 bg-white rounded-lg mb-4 px-4 py-3 flex gap-3 items-center shadow-sm border border-gray-200">
                    <Warning
                      size={22}
                      weight="fill"
                      className="text-amber-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {t("chat.aiWarning")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {aiLimitWarning}
                      </span>
                    </div>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <Message
                    key={index}
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
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          {/* Message input */}
          <div className="">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center rounded-b-lg lg:border border-gray-300 border-t-0 p-3 lg:px-6 lg:pb-6 relative"
            >
              <div className="w-full rounded-lg border border-gray-300 px-4 py-2">
                {/* Attached images preview */}
                {attachedImages.length > 0 && (
                  <div className="flex gap-2">
                    {attachedImages.map((img, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={img.previewUrl}
                          alt={`${t("chat.imagePlaceholder")} ${index}`}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachedImage(index)}
                          className="absolute top-0 right-0 bg-white text-primary-dark rounded-full shadow p-1 cursor-pointer hover:bg-gray-100 ease-in-out duration-200"
                        >
                          <X size={8} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center">
                  <InputText
                    placeholder={
                      isOwner
                        ? t("chat.enterRequest")
                        : t("chat.viewOnlyPlaceholder")
                    }
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full !p-2 !pr-0 !border-none !shadow-none !ring-0"
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
                  <div
                    onClick={
                      !inputDisabled && !isLoading && isOwner
                        ? handleImageUploadClick
                        : undefined
                    }
                    className={`p-3.5 ${!inputDisabled && !isLoading && isOwner ? "text-gray-500 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                  >
                    <Camera size={20} weight="fill" className="w-5 h-5" />
                  </div>
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
                    className={`p-3.5 rounded-full ${
                      !inputDisabled &&
                      !isLoading &&
                      isOwner &&
                      (userInput.trim() || attachedImages.length > 0)
                        ? "text-primary-orange cursor-pointer hover:bg-orange-50"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <PaperPlaneRight
                      size={20}
                      weight="fill"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </form>
            <div className="lg:hidden p-3 bg-gray-100">
              <button
                onClick={() => setShowFullScreenPreview(true)}
                className="flex items-center justify-center w-full gap-2 font-semibold text-primary-dark px-4 py-2 rounded-full bg-white hover:bg-primary-orange hover:text-white ease-in-out duration-200 cursor-pointer"
              >
                {t("common.preview")} <Eye weight="fill" />
              </button>
            </div>
          </div>
        </div>
        {/* Preview section */}
        <div className="hidden h-full w-1/3 lg:flex flex-col gap-6">
          <div className="h-fit bg-gray-100 rounded-lg p-1">
            {/* Preview header */}
            <div className="flex justify-between items-center px-4 py-2 w-full">
              <div className="font-semibold">{t("common.preview")}</div>
              <div className="flex gap-3">
                <CopyButton content={previewContent} />
                {/* <ShareButton content={previewContent} /> */}
              </div>
            </div>
            {/* Preview content */}
            <div className="w-full h-[60vh] p-4 bg-white overflow-y-auto text-primary-dark leading-6">
              <Markdown>{previewContent}</Markdown>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6 justify-center text-sm font-semibold">
              <div>{t("common.home")}</div>
              <div>{t("common.hausto")}</div>
            </div>
            <div className="text-xs text-gray-200 flex flex-col items-center gap-1.5">
              {t("common.poweredBy")}
              <Image
                src="/logo-overlay.svg"
                width={77}
                height={14}
                alt="Logo"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Full screen preview */}
      {showFullScreenPreview && (
        <FullScreenPreview
          content={previewContent}
          onClose={() => setShowFullScreenPreview(false)}
        />
      )}
    </div>
  );
}
