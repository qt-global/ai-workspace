import type { Message } from "@langchain/langgraph-sdk";
import { beforeEach, expect, rs, test } from "@rstest/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { I18nContext } from "@/core/i18n/context";
import { enUS } from "@/core/i18n/locales/en-US";
import { DEFAULT_LOCAL_SETTINGS } from "@/core/settings/local";

const streamMockState = rs.hoisted(() => ({
  isLoading: false,
  messages: [] as Message[],
  onFinish: undefined as
    | ((state: { values: { messages: Message[] } }) => void)
    | undefined,
  stop: rs.fn(async () => undefined),
  submit: rs.fn(async () => undefined),
}));

rs.mock("@/core/uploads", () => ({
  promptInputFilePartToFile: rs.fn(
    async (filePart: { file?: File }) => filePart.file ?? null,
  ),
  uploadFiles: rs.fn(async () => ({
    files: [
      {
        artifact_url: "/api/artifacts/thread-1/id.jpg",
        filename: "id.jpg",
        path: "/uploads/id.jpg",
        size: 1,
        virtual_path: "/mnt/user-data/uploads/id.jpg",
      },
    ],
    message: "Uploaded",
    skipped_files: [],
    success: true,
  })),
}));

rs.mock("@langchain/langgraph-sdk/react", () => ({
  useStream: (options: {
    onFinish?: (state: { values: { messages: Message[] } }) => void;
  }) => {
    streamMockState.onFinish = options.onFinish;
    return {
      isLoading: streamMockState.isLoading,
      messages: streamMockState.messages,
      stop: streamMockState.stop,
      submit: streamMockState.submit,
      values: {
        artifacts: [],
        messages: streamMockState.messages,
        title: "",
        todos: [],
      },
    };
  },
}));

beforeEach(() => {
  streamMockState.isLoading = false;
  streamMockState.messages = [];
  streamMockState.onFinish = undefined;
  streamMockState.stop.mockClear();
  streamMockState.submit.mockClear();
});

async function renderThreadStream() {
  const { useThreadStream } = await import("@/core/threads/hooks");
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        I18nContext.Provider,
        {
          value: {
            locale: "en-US",
            setLocale: () => undefined,
            t: enUS,
          },
        },
        children,
      ),
    );
  return renderHook(
    () =>
      useThreadStream({
        context: DEFAULT_LOCAL_SETTINGS.context,
        isMock: true,
        threadId: "thread-1",
      }),
    { wrapper },
  );
}

test("keeps early streamed steps behind a local user message after finish", async () => {
  const { rerender, result } = await renderThreadStream();

  await act(async () => {
    await result.current.sendMessage("thread-1", {
      files: [],
      text: "Build a presentation",
    });
  });

  const earlyAssistantStep = {
    id: "early-assistant-step",
    type: "ai",
    content: "Reading the presentation skill",
  } as Message;
  const injectedHuman = {
    id: "current-request__user",
    type: "human",
    content: "Build a presentation",
  } as Message;
  streamMockState.messages = [earlyAssistantStep, injectedHuman];
  streamMockState.isLoading = true;
  rerender();

  expect(result.current.thread.messages).toEqual([
    injectedHuman,
    earlyAssistantStep,
  ]);

  act(() => {
    streamMockState.onFinish?.({
      values: { messages: streamMockState.messages },
    });
    streamMockState.isLoading = false;
    rerender();
  });

  expect(result.current.thread.messages).toEqual([
    injectedHuman,
    earlyAssistantStep,
  ]);
});

test("clears the optimistic upload pair when the run finishes without a live human message", async () => {
  const { rerender, result } = await renderThreadStream();

  await act(async () => {
    await result.current.sendMessage("thread-1", {
      files: [
        {
          file: new File(["x"], "id.jpg", { type: "image/jpeg" }),
          filename: "id.jpg",
          mediaType: "image/jpeg",
          type: "file",
          url: "blob:id.jpg",
        },
      ],
      text: "",
    });
  });

  expect(result.current.thread.messages.map((message) => message.id)).toEqual([
    expect.stringMatching(/^opt-human-/),
    expect.stringMatching(/^opt-ai-/),
  ]);

  act(() => {
    streamMockState.onFinish?.({ values: { messages: [] } });
    rerender();
  });

  expect(result.current.thread.messages).toEqual([]);
});
