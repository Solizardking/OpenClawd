export const openClawdCatalog = {
  "generatedAt": "2026-05-07T20:29:02.622Z",
  "repositoryUrl": "https://github.com/x402agent/openclawd",
  "siteUrl": "http://localhost:3000",
  "skillsHubUrl": "http://localhost:3000/hub",
  "troubleshootingUrl": "http://localhost:3000/setup/troubleshooting",
  "packageCount": 64,
  "skillCount": 135,
  "bundledMobileSkills": [
    {
      "slug": "seeker-daemon-ops",
      "title": "Daemon Ops",
      "summary": "Bring up the Seeker daemon, validate commands, and recover common runtime issues."
    },
    {
      "slug": "session-logs",
      "title": "Session Logs",
      "summary": "Recover historical context from local OpenClawd session logs."
    },
    {
      "slug": "solana-research-brief",
      "title": "Research Brief",
      "summary": "Produce compact token briefs directly from the runtime."
    },
    {
      "slug": "pumpfun-trading",
      "title": "Pump Trading",
      "summary": "Reference pump.fun trade flow and risk controls from mobile."
    },
    {
      "slug": "github",
      "title": "GitHub",
      "summary": "Operate PRs, issues, and CI from a phone-first terminal flow."
    },
    {
      "slug": "summarize",
      "title": "Summarize",
      "summary": "Summarize articles, files, and videos without leaving the device."
    },
    {
      "slug": "weather",
      "title": "Weather",
      "summary": "Fast current weather and short forecast checks."
    },
    {
      "slug": "solana-formal-verification",
      "title": "Formal Verification",
      "summary": "Mathematically prove Solana program correctness with Lean 4 proofs and QEDGen."
    }
  ],
  "featuredSections": [
    {
      "title": "Core Runtime",
      "summary": "The main OpenClawd computer loop: agent state, config, sessions, storage, and orchestration.",
      "packages": [
        "agent",
        "agentregistry",
        "config",
        "daemon",
        "routing",
        "runtimeenv",
        "session",
        "state",
        "storage"
      ]
    },
    {
      "title": "Gateway & API",
      "summary": "Public and private control surfaces for apps, dashboards, remote gateways, and Seeker pairing.",
      "packages": [
        "gateway",
        "controlapi",
        "node",
        "identity",
        "health"
      ]
    },
    {
      "title": "Seeker & Mobile",
      "summary": "Phone-native packages for Seeker bridge, mobile voice, and the on-device OpenClawd experience.",
      "packages": [
        "seeker",
        "voice",
        "channels",
        "nanobot"
      ]
    },
    {
      "title": "Markets & Trading",
      "summary": "Chain access, market data, strategies, launches, perps, payments, and miner-linked finance flows.",
      "packages": [
        "solana",
        "onchain",
        "strategy",
        "hyperliquid",
        "aster",
        "pumplaunch",
        "x402",
        "bitaxe",
        "tamagochi"
      ]
    },
    {
      "title": "solana-claude Engine",
      "summary": "Agentic engine with OODA loops, 31 MCP tools, 7 agents, blockchain buddies, 3-tier memory, 128-bit risk engine, and AgentWallet vault.",
      "packages": [
        "agent",
        "memory",
        "solana",
        "onchain",
        "strategy",
        "x402"
      ]
    }
  ],
  "packages": [
    {
      "name": "agent",
      "path": "src/agent",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 6409,
      "category": "Core Runtime",
      "summary": "Iterative agent loop, prompts, scratchpad, tool execution, and live OODA context.",
      "keyFiles": [
        "loop.ts",
        "system-prompt.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/agent"
    },
    {
      "name": "agents",
      "path": "src/agents",
      "importPath": null,
      "fileCount": 7,
      "sizeBytes": 28625,
      "category": "Utilities",
      "summary": "agents package from the OpenClawd computer runtime.",
      "keyFiles": [
        "analyst.ts",
        "clone.ts",
        "monitor.ts",
        "runtime.ts",
        "scanner.ts",
        "skill-registry.ts",
        "trader.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/agents"
    },
    {
      "name": "animations",
      "path": "src/animations",
      "importPath": null,
      "fileCount": 5,
      "sizeBytes": 16024,
      "category": "Utilities",
      "summary": "animations package from the OpenClawd computer runtime.",
      "keyFiles": [
        "birth-ceremony.ts",
        "clawd-frames.ts",
        "index.ts",
        "spinner.ts",
        "web-frames.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/animations"
    },
    {
      "name": "assistant",
      "path": "src/assistant",
      "importPath": null,
      "fileCount": 5,
      "sizeBytes": 2637,
      "category": "Utilities",
      "summary": "assistant package from the OpenClawd computer runtime.",
      "keyFiles": [
        "AssistantSessionChooser.ts",
        "gate.ts",
        "index.ts",
        "sessionDiscovery.ts",
        "sessionHistory.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/assistant"
    },
    {
      "name": "bootstrap",
      "path": "src/bootstrap",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 56105,
      "category": "Utilities",
      "summary": "bootstrap package from the OpenClawd computer runtime.",
      "keyFiles": [
        "state.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/bootstrap"
    },
    {
      "name": "bridge",
      "path": "src/bridge",
      "importPath": null,
      "fileCount": 34,
      "sizeBytes": 480530,
      "category": "Utilities",
      "summary": "bridge package from the OpenClawd computer runtime.",
      "keyFiles": [
        "bridgeApi.ts",
        "bridgeConfig.ts",
        "bridgeDebug.ts",
        "bridgeEnabled.ts",
        "bridgeMain.ts",
        "bridgeMessaging.ts",
        "bridgePermissionCallbacks.ts",
        "bridgePointer.ts",
        "bridgeStatusUtil.ts",
        "bridgeUI.ts",
        "capacityWake.ts",
        "codeSessionApi.ts",
        "createSession.ts",
        "debugUtils.ts",
        "envLessBridgeConfig.ts",
        "flushGate.ts",
        "inboundAttachments.ts",
        "inboundMessages.ts",
        "initReplBridge.ts",
        "jwtUtils.ts",
        "peerSessions.ts",
        "pollConfig.ts",
        "pollConfigDefaults.ts",
        "remoteBridgeCore.ts",
        "replBridge.ts",
        "replBridgeHandle.ts",
        "replBridgeTransport.ts",
        "sessionIdCompat.ts",
        "sessionRunner.ts",
        "stub.ts",
        "trustedDevice.ts",
        "types.ts",
        "webhookSanitizer.ts",
        "workSecret.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/bridge"
    },
    {
      "name": "buddy",
      "path": "src/buddy",
      "importPath": null,
      "fileCount": 10,
      "sizeBytes": 117632,
      "category": "Utilities",
      "summary": "buddy package from the OpenClawd computer runtime.",
      "keyFiles": [
        "blockchain-sprites.ts",
        "blockchain-types.ts",
        "blockchain-wallet.ts",
        "companion.ts",
        "CompanionSprite.tsx",
        "index.ts",
        "prompt.ts",
        "sprites.ts",
        "types.ts",
        "useBuddyNotification.tsx"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/buddy"
    },
    {
      "name": "chess",
      "path": "src/chess",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 10443,
      "category": "Utilities",
      "summary": "chess package from the OpenClawd computer runtime.",
      "keyFiles": [
        "chess-client.ts",
        "index.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/chess"
    },
    {
      "name": "cli",
      "path": "src/cli",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 2929,
      "category": "Utilities",
      "summary": "cli package from the OpenClawd computer runtime.",
      "keyFiles": [
        "clawd.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/cli"
    },
    {
      "name": "commands",
      "path": "src/commands",
      "importPath": null,
      "fileCount": 217,
      "sizeBytes": 2495624,
      "category": "Core Runtime",
      "summary": "Shared command definitions and runtime invocation helpers.",
      "keyFiles": [
        "advisor.ts",
        "bridge-kick.ts",
        "brief.ts",
        "commit-push-pr.ts",
        "commit.ts",
        "createMovedToPluginCommand.ts",
        "init-verifiers.ts",
        "init.ts",
        "insights.ts",
        "install.tsx",
        "review.ts",
        "security-review.ts",
        "statusline.tsx",
        "ultraplan.tsx",
        "version.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/commands"
    },
    {
      "name": "components",
      "path": "src/components",
      "importPath": null,
      "fileCount": 405,
      "sizeBytes": 9556897,
      "category": "Utilities",
      "summary": "components package from the OpenClawd computer runtime.",
      "keyFiles": [
        "AgentProgressLine.tsx",
        "App.tsx",
        "ApproveApiKey.tsx",
        "AutoModeOptInDialog.tsx",
        "AutoUpdater.tsx",
        "AutoUpdaterWrapper.tsx",
        "AwsAuthStatusBox.tsx",
        "BaseTextInput.tsx",
        "BashModeProgress.tsx",
        "BridgeDialog.tsx",
        "BypassPermissionsModeDialog.tsx",
        "ChannelDowngradeDialog.tsx",
        "ClaudeInChromeOnboarding.tsx",
        "ClaudeMdExternalIncludesDialog.tsx",
        "ClickableImageRef.tsx",
        "CompactSummary.tsx",
        "ConfigurableShortcutHint.tsx",
        "ConsoleOAuthFlow.tsx",
        "ContextSuggestions.tsx",
        "ContextVisualization.tsx",
        "CoordinatorAgentStatus.tsx",
        "CostThresholdDialog.tsx",
        "CtrlOToExpand.tsx",
        "DesktopHandoff.tsx",
        "DevBar.tsx",
        "DevChannelsDialog.tsx",
        "DiagnosticsDisplay.tsx",
        "EffortCallout.tsx",
        "EffortIndicator.ts",
        "ExitFlow.tsx",
        "ExportDialog.tsx",
        "FallbackToolUseErrorMessage.tsx",
        "FallbackToolUseRejectedMessage.tsx",
        "FastIcon.tsx",
        "Feedback.tsx",
        "FileEditToolDiff.tsx",
        "FileEditToolUpdatedMessage.tsx",
        "FileEditToolUseRejectedMessage.tsx",
        "FilePathLink.tsx",
        "FullscreenLayout.tsx",
        "GlobalSearchDialog.tsx",
        "HighlightedCode.tsx",
        "HistorySearchDialog.tsx",
        "IdeAutoConnectDialog.tsx",
        "IdeOnboardingDialog.tsx",
        "IdeStatusIndicator.tsx",
        "IdleReturnDialog.tsx",
        "InterruptedByUser.tsx",
        "InvalidConfigDialog.tsx",
        "InvalidSettingsDialog.tsx",
        "KeybindingWarnings.tsx",
        "LanguagePicker.tsx",
        "LogSelector.tsx",
        "Markdown.tsx",
        "MarkdownTable.tsx",
        "MCPServerApprovalDialog.tsx",
        "MCPServerDesktopImportDialog.tsx",
        "MCPServerDialogCopy.tsx",
        "MCPServerMultiselectDialog.tsx",
        "MemoryUsageIndicator.tsx",
        "Message.tsx",
        "messageActions.tsx",
        "MessageModel.tsx",
        "MessageResponse.tsx",
        "MessageRow.tsx",
        "Messages.tsx",
        "MessageSelector.tsx",
        "MessageTimestamp.tsx",
        "ModelPicker.tsx",
        "NativeAutoUpdater.tsx",
        "NotebookEditToolUseRejectedMessage.tsx",
        "OffscreenFreeze.tsx",
        "Onboarding.tsx",
        "OutputStylePicker.tsx",
        "PackageManagerAutoUpdater.tsx",
        "PrBadge.tsx",
        "PressEnterToContinue.tsx",
        "QuickOpenDialog.tsx",
        "RemoteCallout.tsx",
        "RemoteEnvironmentDialog.tsx",
        "ResumeTask.tsx",
        "SandboxViolationExpandedView.tsx",
        "ScrollKeybindingHandler.tsx",
        "SearchBox.tsx",
        "SentryErrorBoundary.ts",
        "SessionBackgroundHint.tsx",
        "SessionPreview.tsx",
        "ShowInIDEPrompt.tsx",
        "SkillImprovementSurvey.tsx",
        "Spinner.tsx",
        "Stats.tsx",
        "StatusLine.tsx",
        "StatusNotices.tsx",
        "StructuredDiff.tsx",
        "StructuredDiffList.tsx",
        "TagTabs.tsx",
        "TaskListV2.tsx",
        "TeammateViewHeader.tsx",
        "TeleportError.tsx",
        "TeleportProgress.tsx",
        "TeleportRepoMismatchDialog.tsx",
        "TeleportResumeWrapper.tsx",
        "TeleportStash.tsx",
        "TextInput.tsx",
        "ThemePicker.tsx",
        "ThinkingToggle.tsx",
        "TokenWarning.tsx",
        "ToolUseLoader.tsx",
        "ValidationErrorsList.tsx",
        "VimTextInput.tsx",
        "VirtualMessageList.tsx",
        "WorkflowMultiselectDialog.tsx",
        "WorktreeExitDialog.tsx"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/components"
    },
    {
      "name": "constants",
      "path": "src/constants",
      "importPath": null,
      "fileCount": 22,
      "sizeBytes": 115390,
      "category": "Core Runtime",
      "summary": "Shared constants for runtime-wide behavior and naming.",
      "keyFiles": [
        "apiLimits.ts",
        "betas.ts",
        "common.ts",
        "cyberRiskInstruction.ts",
        "errorIds.ts",
        "figures.ts",
        "files.ts",
        "github-app.ts",
        "keys.ts",
        "messages.ts",
        "oauth.ts",
        "outputStyles.ts",
        "product.ts",
        "prompts.ts",
        "querySource.ts",
        "spinnerVerbs.ts",
        "system.ts",
        "systemPromptSections.ts",
        "toolLimits.ts",
        "tools.ts",
        "turnCompletionVerbs.ts",
        "xml.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/constants"
    },
    {
      "name": "context",
      "path": "src/context",
      "importPath": null,
      "fileCount": 9,
      "sizeBytes": 108568,
      "category": "Utilities",
      "summary": "context package from the OpenClawd computer runtime.",
      "keyFiles": [
        "fpsMetrics.tsx",
        "mailbox.tsx",
        "modalContext.tsx",
        "notifications.tsx",
        "overlayContext.tsx",
        "promptOverlayContext.tsx",
        "QueuedMessageContext.tsx",
        "stats.tsx",
        "voice.tsx"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/context"
    },
    {
      "name": "coordinator",
      "path": "src/coordinator",
      "importPath": null,
      "fileCount": 3,
      "sizeBytes": 38602,
      "category": "Utilities",
      "summary": "coordinator package from the OpenClawd computer runtime.",
      "keyFiles": [
        "coordinator.ts",
        "coordinatorMode.ts",
        "workerAgent.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/coordinator"
    },
    {
      "name": "daemon",
      "path": "src/daemon",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 66,
      "category": "Gateway & API",
      "summary": "The operator daemon: chat, miner commands, gateway orchestration, and runtime control.",
      "keyFiles": [
        "main.ts",
        "workerRegistry.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/daemon"
    },
    {
      "name": "docs",
      "path": "src/docs",
      "importPath": null,
      "fileCount": 0,
      "sizeBytes": 0,
      "category": "Utilities",
      "summary": "docs package from the OpenClawd computer runtime.",
      "keyFiles": [],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/docs"
    },
    {
      "name": "engine",
      "path": "src/engine",
      "importPath": null,
      "fileCount": 5,
      "sizeBytes": 52780,
      "category": "Utilities",
      "summary": "engine package from the OpenClawd computer runtime.",
      "keyFiles": [
        "permission-engine.ts",
        "query-engine.ts",
        "risk-engine.ts",
        "tool-base.ts",
        "tool-executor.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/engine"
    },
    {
      "name": "entrypoints",
      "path": "src/entrypoints",
      "importPath": null,
      "fileCount": 15,
      "sizeBytes": 164020,
      "category": "Utilities",
      "summary": "entrypoints package from the OpenClawd computer runtime.",
      "keyFiles": [
        "agentSdkTypes.ts",
        "clawd.ts",
        "cli.tsx",
        "init.ts",
        "mcp.ts",
        "sandboxTypes.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/entrypoints"
    },
    {
      "name": "environment-runner",
      "path": "src/environment-runner",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 33,
      "category": "Utilities",
      "summary": "environment-runner package from the OpenClawd computer runtime.",
      "keyFiles": [
        "main.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/environment-runner"
    },
    {
      "name": "gateway",
      "path": "src/gateway",
      "importPath": null,
      "fileCount": 3,
      "sizeBytes": 4019,
      "category": "Gateway & API",
      "summary": "Gateway transport, discovery, auth, pairing, and remote connection handling.",
      "keyFiles": [
        "device-auth.ts",
        "openrouter-handlers.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/gateway"
    },
    {
      "name": "helius",
      "path": "src/helius",
      "importPath": null,
      "fileCount": 6,
      "sizeBytes": 53776,
      "category": "Utilities",
      "summary": "helius package from the OpenClawd computer runtime.",
      "keyFiles": [
        "helius-client.js",
        "helius-client.ts",
        "index.js",
        "index.ts",
        "onchain-listener.js",
        "onchain-listener.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/helius"
    },
    {
      "name": "hooks",
      "path": "src/hooks",
      "importPath": null,
      "fileCount": 105,
      "sizeBytes": 1249762,
      "category": "Utilities",
      "summary": "hooks package from the OpenClawd computer runtime.",
      "keyFiles": [
        "fileSuggestions.ts",
        "renderPlaceholder.ts",
        "unifiedSuggestions.ts",
        "useAfterFirstRender.ts",
        "useApiKeyVerification.ts",
        "useArrowKeyHistory.tsx",
        "useAssistantHistory.ts",
        "useAwaySummary.ts",
        "useBackgroundTaskNavigation.ts",
        "useBlink.ts",
        "useCancelRequest.ts",
        "useCanUseTool.tsx",
        "useChromeExtensionNotification.tsx",
        "useClaudeCodeHintRecommendation.tsx",
        "useClipboardImageHint.ts",
        "useCommandKeybindings.tsx",
        "useCommandQueue.ts",
        "useCopyOnSelect.ts",
        "useDeferredHookMessages.ts",
        "useDiffData.ts",
        "useDiffInIDE.ts",
        "useDirectConnect.ts",
        "useDoublePress.ts",
        "useDynamicConfig.ts",
        "useElapsedTime.ts",
        "useExitOnCtrlCD.ts",
        "useExitOnCtrlCDWithKeybindings.ts",
        "useFileHistorySnapshotInit.ts",
        "useGlobalKeybindings.tsx",
        "useHistorySearch.ts",
        "useIdeAtMentioned.ts",
        "useIdeConnectionStatus.ts",
        "useIDEIntegration.tsx",
        "useIdeLogging.ts",
        "useIdeSelection.ts",
        "useInboxPoller.ts",
        "useInputBuffer.ts",
        "useIssueFlagBanner.ts",
        "useLogMessages.ts",
        "useLspPluginRecommendation.tsx",
        "useMailboxBridge.ts",
        "useMainLoopModel.ts",
        "useManagePlugins.ts",
        "useMemoryUsage.ts",
        "useMergedClients.ts",
        "useMergedCommands.ts",
        "useMergedTools.ts",
        "useMinDisplayTime.ts",
        "useNotifyAfterTimeout.ts",
        "useOfficialMarketplaceNotification.tsx",
        "usePasteHandler.ts",
        "usePluginRecommendationBase.tsx",
        "usePromptsFromClaudeInChrome.tsx",
        "usePromptSuggestion.ts",
        "usePrStatus.ts",
        "useQueueProcessor.ts",
        "useRemoteSession.ts",
        "useReplBridge.tsx",
        "useScheduledTasks.ts",
        "useSearchInput.ts",
        "useSessionBackgrounding.ts",
        "useSettings.ts",
        "useSettingsChange.ts",
        "useSkillImprovementSurvey.ts",
        "useSkillsChange.ts",
        "useSSHSession.ts",
        "useSwarmInitialization.ts",
        "useSwarmPermissionPoller.ts",
        "useTaskListWatcher.ts",
        "useTasksV2.ts",
        "useTeammateViewAutoExit.ts",
        "useTeleportResume.tsx",
        "useTerminalSize.ts",
        "useTextInput.ts",
        "useTimeout.ts",
        "useTurnDiffs.ts",
        "useTypeahead.tsx",
        "useUpdateNotification.ts",
        "useVimInput.ts",
        "useVirtualScroll.ts",
        "useVoice.ts",
        "useVoiceEnabled.ts",
        "useVoiceIntegration.tsx"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/hooks"
    },
    {
      "name": "identity",
      "path": "src/identity",
      "importPath": null,
      "fileCount": 3,
      "sizeBytes": 7045,
      "category": "Gateway & API",
      "summary": "Identity primitives for device, gateway, and agent ownership.",
      "keyFiles": [
        "balances.ts",
        "spawn-onchain.ts",
        "wallet.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/identity"
    },
    {
      "name": "ink",
      "path": "src/ink",
      "importPath": null,
      "fileCount": 100,
      "sizeBytes": 1043249,
      "category": "Utilities",
      "summary": "ink package from the OpenClawd computer runtime.",
      "keyFiles": [
        "Ansi.tsx",
        "bidi.ts",
        "clearTerminal.ts",
        "colorize.ts",
        "constants.ts",
        "cursor.ts",
        "devtools.ts",
        "dom.ts",
        "focus.ts",
        "frame.ts",
        "get-max-width.ts",
        "hit-test.ts",
        "ink.tsx",
        "instances.ts",
        "line-width-cache.ts",
        "log-update.ts",
        "measure-element.ts",
        "measure-text.ts",
        "node-cache.ts",
        "optimizer.ts",
        "output.ts",
        "parse-keypress.ts",
        "reconciler.ts",
        "render-border.ts",
        "render-node-to-output.ts",
        "render-to-screen.ts",
        "renderer.ts",
        "root.ts",
        "screen.ts",
        "searchHighlight.ts",
        "selection.ts",
        "squash-text-nodes.ts",
        "stringWidth.ts",
        "styles.ts",
        "supports-hyperlinks.ts",
        "tabstops.ts",
        "terminal-focus-state.ts",
        "terminal-querier.ts",
        "terminal.ts",
        "termio.ts",
        "useTerminalNotification.ts",
        "warn.ts",
        "widest-line.ts",
        "wrap-text.ts",
        "wrapAnsi.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/ink"
    },
    {
      "name": "jobs",
      "path": "src/jobs",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 33,
      "category": "Utilities",
      "summary": "jobs package from the OpenClawd computer runtime.",
      "keyFiles": [
        "classifier.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/jobs"
    },
    {
      "name": "keybindings",
      "path": "src/keybindings",
      "importPath": null,
      "fileCount": 15,
      "sizeBytes": 146737,
      "category": "Utilities",
      "summary": "keybindings package from the OpenClawd computer runtime.",
      "keyFiles": [
        "defaultBindings.ts",
        "KeybindingContext.tsx",
        "KeybindingProviderSetup.tsx",
        "loadUserBindings.ts",
        "match.ts",
        "parser.ts",
        "reservedShortcuts.ts",
        "resolver.ts",
        "schema.ts",
        "shortcutFormat.ts",
        "template.ts",
        "types.ts",
        "useKeybinding.ts",
        "useShortcutDisplay.ts",
        "validate.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/keybindings"
    },
    {
      "name": "memdir",
      "path": "src/memdir",
      "importPath": null,
      "fileCount": 9,
      "sizeBytes": 83102,
      "category": "Utilities",
      "summary": "memdir package from the OpenClawd computer runtime.",
      "keyFiles": [
        "findRelevantMemories.ts",
        "memdir.ts",
        "memoryAge.ts",
        "memoryScan.ts",
        "memoryShapeTelemetry.ts",
        "memoryTypes.ts",
        "paths.ts",
        "teamMemPaths.ts",
        "teamMemPrompts.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/memdir"
    },
    {
      "name": "memory",
      "path": "src/memory",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 10818,
      "category": "Intelligence",
      "summary": "Persistent epistemic memory engine for known, learned, and inferred state.",
      "keyFiles": [
        "extract-memories.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/memory"
    },
    {
      "name": "metaplex",
      "path": "src/metaplex",
      "importPath": null,
      "fileCount": 4,
      "sizeBytes": 35172,
      "category": "Utilities",
      "summary": "metaplex package from the OpenClawd computer runtime.",
      "keyFiles": [
        "agent-minter.ts",
        "agent-registry.ts",
        "index.ts",
        "metaplex-types.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/metaplex"
    },
    {
      "name": "migrations",
      "path": "src/migrations",
      "importPath": null,
      "fileCount": 11,
      "sizeBytes": 20189,
      "category": "Utilities",
      "summary": "migrations package from the OpenClawd computer runtime.",
      "keyFiles": [
        "migrateAutoUpdatesToSettings.ts",
        "migrateBypassPermissionsAcceptedToSettings.ts",
        "migrateEnableAllProjectMcpServersToSettings.ts",
        "migrateFennecToOpus.ts",
        "migrateLegacyOpusToCurrent.ts",
        "migrateOpusToOpus1m.ts",
        "migrateReplBridgeEnabledToRemoteControlAtStartup.ts",
        "migrateSonnet1mToSonnet45.ts",
        "migrateSonnet45ToSonnet46.ts",
        "resetAutoModeOptInForDefaultOffer.ts",
        "resetProToOpusDefault.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/migrations"
    },
    {
      "name": "molting",
      "path": "src/molting",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 3937,
      "category": "Utilities",
      "summary": "molting package from the OpenClawd computer runtime.",
      "keyFiles": [
        "spawn.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/molting"
    },
    {
      "name": "monitor",
      "path": "src/monitor",
      "importPath": null,
      "fileCount": 4,
      "sizeBytes": 41607,
      "category": "Utilities",
      "summary": "monitor package from the OpenClawd computer runtime.",
      "keyFiles": [
        "birdeye-stream.ts",
        "index.ts",
        "solana-tracker-stream.ts",
        "wallet-monitor.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/monitor"
    },
    {
      "name": "moreright",
      "path": "src/moreright",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 3536,
      "category": "Utilities",
      "summary": "moreright package from the OpenClawd computer runtime.",
      "keyFiles": [
        "useMoreRight.tsx"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/moreright"
    },
    {
      "name": "native-ts",
      "path": "src/native-ts",
      "importPath": null,
      "fileCount": 4,
      "sizeBytes": 128252,
      "category": "Utilities",
      "summary": "native-ts package from the OpenClawd computer runtime.",
      "keyFiles": [],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/native-ts"
    },
    {
      "name": "outputStyles",
      "path": "src/outputStyles",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 3439,
      "category": "Utilities",
      "summary": "outputStyles package from the OpenClawd computer runtime.",
      "keyFiles": [
        "loadOutputStylesDir.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/outputStyles"
    },
    {
      "name": "plugins",
      "path": "src/plugins",
      "importPath": null,
      "fileCount": 3,
      "sizeBytes": 11184,
      "category": "Utilities",
      "summary": "plugins package from the OpenClawd computer runtime.",
      "keyFiles": [
        "index.ts",
        "registry.ts",
        "types.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/plugins"
    },
    {
      "name": "proactive",
      "path": "src/proactive",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 380,
      "category": "Utilities",
      "summary": "proactive package from the OpenClawd computer runtime.",
      "keyFiles": [
        "index.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/proactive"
    },
    {
      "name": "pulse",
      "path": "src/pulse",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 1745,
      "category": "Utilities",
      "summary": "pulse package from the OpenClawd computer runtime.",
      "keyFiles": [
        "daemon.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/pulse"
    },
    {
      "name": "pump",
      "path": "src/pump",
      "importPath": null,
      "fileCount": 5,
      "sizeBytes": 51473,
      "category": "Utilities",
      "summary": "pump package from the OpenClawd computer runtime.",
      "keyFiles": [
        "client.ts",
        "index.ts",
        "math.ts",
        "scanner.ts",
        "types.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/pump"
    },
    {
      "name": "query",
      "path": "src/query",
      "importPath": null,
      "fileCount": 5,
      "sizeBytes": 23738,
      "category": "Utilities",
      "summary": "query package from the OpenClawd computer runtime.",
      "keyFiles": [
        "config.ts",
        "deps.ts",
        "stopHooks.ts",
        "tokenBudget.ts",
        "transitions.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/query"
    },
    {
      "name": "remote",
      "path": "src/remote",
      "importPath": null,
      "fileCount": 4,
      "sizeBytes": 33267,
      "category": "Utilities",
      "summary": "remote package from the OpenClawd computer runtime.",
      "keyFiles": [
        "remotePermissionBridge.ts",
        "RemoteSessionManager.ts",
        "sdkMessageAdapter.ts",
        "SessionsWebSocket.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/remote"
    },
    {
      "name": "routing",
      "path": "src/routing",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 165,
      "category": "Core Runtime",
      "summary": "Routing logic for requests, sessions, and runtime pathways.",
      "keyFiles": [
        "session-key.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/routing"
    },
    {
      "name": "schemas",
      "path": "src/schemas",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 7885,
      "category": "Utilities",
      "summary": "schemas package from the OpenClawd computer runtime.",
      "keyFiles": [
        "hooks.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/schemas"
    },
    {
      "name": "screens",
      "path": "src/screens",
      "importPath": null,
      "fileCount": 3,
      "sizeBytes": 1028861,
      "category": "Utilities",
      "summary": "screens package from the OpenClawd computer runtime.",
      "keyFiles": [
        "Doctor.tsx",
        "REPL.tsx",
        "ResumeConversation.tsx"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/screens"
    },
    {
      "name": "self-hosted-runner",
      "path": "src/self-hosted-runner",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 33,
      "category": "Utilities",
      "summary": "self-hosted-runner package from the OpenClawd computer runtime.",
      "keyFiles": [
        "main.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/self-hosted-runner"
    },
    {
      "name": "server",
      "path": "src/server",
      "importPath": null,
      "fileCount": 31,
      "sizeBytes": 3088499,
      "category": "Utilities",
      "summary": "server package from the OpenClawd computer runtime.",
      "keyFiles": [
        "connectHeadless.ts",
        "createDirectConnectSession.ts",
        "directConnectManager.ts",
        "lockfile.ts",
        "parseConnectUrl.ts",
        "server.ts",
        "serverBanner.ts",
        "serverLog.ts",
        "sessionManager.ts",
        "types.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/server"
    },
    {
      "name": "services",
      "path": "src/services",
      "importPath": null,
      "fileCount": 9,
      "sizeBytes": 16819,
      "category": "Utilities",
      "summary": "services package from the OpenClawd computer runtime.",
      "keyFiles": [
        "birdeye.ts",
        "bitaxe.test.ts",
        "bitaxe.ts",
        "helius.ts",
        "index.ts",
        "jupiter.ts",
        "memory.ts",
        "openrouter.ts",
        "pumpfun.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/services"
    },
    {
      "name": "sessions",
      "path": "src/sessions",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 504,
      "category": "Utilities",
      "summary": "sessions package from the OpenClawd computer runtime.",
      "keyFiles": [
        "session-key-utils.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/sessions"
    },
    {
      "name": "setup",
      "path": "src/setup",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 4650,
      "category": "Utilities",
      "summary": "setup package from the OpenClawd computer runtime.",
      "keyFiles": [
        "secret-guard.ts",
        "wizard.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/setup"
    },
    {
      "name": "shared",
      "path": "src/shared",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 355,
      "category": "Utilities",
      "summary": "shared package from the OpenClawd computer runtime.",
      "keyFiles": [],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/shared"
    },
    {
      "name": "shims",
      "path": "src/shims",
      "importPath": null,
      "fileCount": 3,
      "sizeBytes": 2899,
      "category": "Utilities",
      "summary": "shims package from the OpenClawd computer runtime.",
      "keyFiles": [
        "bun-bundle.ts",
        "macro.ts",
        "preload.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/shims"
    },
    {
      "name": "skills",
      "path": "src/skills",
      "importPath": null,
      "fileCount": 64,
      "sizeBytes": 222821,
      "category": "Operator Interfaces",
      "summary": "Skill loading, indexing, and install-time package discovery.",
      "keyFiles": [
        "bundledSkills.ts",
        "install.ts",
        "loadSkillsDir.ts",
        "mcpSkillBuilders.ts",
        "mcpSkills.ts",
        "registry.ts",
        "skill-registry.ts",
        "skill-tool.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/skills"
    },
    {
      "name": "ssh",
      "path": "src/ssh",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 66,
      "category": "Utilities",
      "summary": "ssh package from the OpenClawd computer runtime.",
      "keyFiles": [
        "createSSHSession.ts",
        "SSHSessionManager.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/ssh"
    },
    {
      "name": "state",
      "path": "src/state",
      "importPath": null,
      "fileCount": 8,
      "sizeBytes": 74133,
      "category": "Core Runtime",
      "summary": "Shared state containers for runtime components.",
      "keyFiles": [
        "app-state.ts",
        "AppState.tsx",
        "AppStateStore.ts",
        "database.ts",
        "onChangeAppState.ts",
        "selectors.ts",
        "store.ts",
        "teammateViewHelpers.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/state"
    },
    {
      "name": "survival",
      "path": "src/survival",
      "importPath": null,
      "fileCount": 1,
      "sizeBytes": 975,
      "category": "Utilities",
      "summary": "survival package from the OpenClawd computer runtime.",
      "keyFiles": [
        "monitor.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/survival"
    },
    {
      "name": "tasks",
      "path": "src/tasks",
      "importPath": null,
      "fileCount": 15,
      "sizeBytes": 339411,
      "category": "Utilities",
      "summary": "tasks package from the OpenClawd computer runtime.",
      "keyFiles": [
        "LocalMainSessionTask.ts",
        "pillLabel.ts",
        "stopTask.ts",
        "task-manager.ts",
        "types.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/tasks"
    },
    {
      "name": "telegram",
      "path": "src/telegram",
      "importPath": null,
      "fileCount": 7,
      "sizeBytes": 131239,
      "category": "Utilities",
      "summary": "telegram package from the OpenClawd computer runtime.",
      "keyFiles": [
        "bot.ts",
        "commands.ts",
        "index.ts",
        "pump-sniper.ts",
        "twitter.ts",
        "types.ts",
        "xai.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/telegram"
    },
    {
      "name": "tools",
      "path": "src/tools",
      "importPath": null,
      "fileCount": 200,
      "sizeBytes": 2694460,
      "category": "Intelligence",
      "summary": "Tool registry and execution surface for agents.",
      "keyFiles": [
        "tool-registry.ts",
        "utils.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/tools"
    },
    {
      "name": "types",
      "path": "src/types",
      "importPath": null,
      "fileCount": 24,
      "sizeBytes": 131404,
      "category": "Utilities",
      "summary": "types package from the OpenClawd computer runtime.",
      "keyFiles": [
        "bun-bundle.d.ts",
        "bun-globals.d.ts",
        "command.ts",
        "connectorText.ts",
        "external-modules.d.ts",
        "fileSuggestion.ts",
        "hooks.ts",
        "ids.ts",
        "index.ts",
        "logs.ts",
        "macro.d.ts",
        "message.ts",
        "messageQueueTypes.ts",
        "notebook.ts",
        "permissions.ts",
        "plugin.ts",
        "statusLine.ts",
        "textInputTypes.ts",
        "tools.ts",
        "utils.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/types"
    },
    {
      "name": "upstreamproxy",
      "path": "src/upstreamproxy",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 24751,
      "category": "Utilities",
      "summary": "upstreamproxy package from the OpenClawd computer runtime.",
      "keyFiles": [
        "relay.ts",
        "upstreamproxy.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/upstreamproxy"
    },
    {
      "name": "utils",
      "path": "src/utils",
      "importPath": null,
      "fileCount": 579,
      "sizeBytes": 6651454,
      "category": "Utilities",
      "summary": "General-purpose utility helpers shared across the runtime.",
      "keyFiles": [
        "abortController.ts",
        "activityManager.ts",
        "advisor.ts",
        "agentContext.ts",
        "agenticSessionSearch.ts",
        "agentId.ts",
        "agentSwarmsEnabled.ts",
        "analyzeContext.ts",
        "ansiToPng.ts",
        "ansiToSvg.ts",
        "api.ts",
        "apiPreconnect.ts",
        "appleTerminalBackup.ts",
        "argumentSubstitution.ts",
        "array.ts",
        "asciicast.ts",
        "attachments.ts",
        "attribution.ts",
        "attributionHooks.ts",
        "attributionTrailer.ts",
        "auth.ts",
        "authFileDescriptor.ts",
        "authPortable.ts",
        "autoModeDenials.ts",
        "autoRunIssue.tsx",
        "autoUpdater.ts",
        "aws.ts",
        "awsAuthStatusManager.ts",
        "backgroundHousekeeping.ts",
        "betas.ts",
        "billing.ts",
        "binaryCheck.ts",
        "browser.ts",
        "bufferedWriter.ts",
        "bundledMode.ts",
        "caCerts.ts",
        "caCertsConfig.ts",
        "cachePaths.ts",
        "ccshareResume.ts",
        "CircularBuffer.ts",
        "classifierApprovals.ts",
        "classifierApprovalsHook.ts",
        "claudeCodeHints.ts",
        "claudeDesktop.ts",
        "claudemd.ts",
        "cleanup.ts",
        "cleanupRegistry.ts",
        "cliArgs.ts",
        "cliHighlight.ts",
        "codeIndexing.ts",
        "collapseBackgroundBashNotifications.ts",
        "collapseHookSummaries.ts",
        "collapseReadSearch.ts",
        "collapseTeammateShutdowns.ts",
        "combinedAbortSignal.ts",
        "commandLifecycle.ts",
        "commitAttribution.ts",
        "completionCache.ts",
        "concurrentSessions.ts",
        "config.ts",
        "configConstants.ts",
        "contentArray.ts",
        "context.ts",
        "contextAnalysis.ts",
        "contextSuggestions.ts",
        "controlMessageCompat.ts",
        "conversationRecovery.ts",
        "cron.ts",
        "cronJitterConfig.ts",
        "cronScheduler.ts",
        "cronTasks.ts",
        "cronTasksLock.ts",
        "crossProjectResume.ts",
        "crypto.ts",
        "Cursor.ts",
        "cwd.ts",
        "debug.ts",
        "debugFilter.ts",
        "desktopDeepLink.ts",
        "detectRepository.ts",
        "diagLogs.ts",
        "diff.ts",
        "directMemberMessage.ts",
        "displayTags.ts",
        "doctorContextWarnings.ts",
        "doctorDiagnostic.ts",
        "earlyInput.ts",
        "editor.ts",
        "effort.ts",
        "embeddedTools.ts",
        "env.ts",
        "envDynamic.ts",
        "envUtils.ts",
        "envValidation.ts",
        "errorLogSink.ts",
        "errors.ts",
        "eventLoopStallDetector.ts",
        "exampleCommands.ts",
        "execFileNoThrow.ts",
        "execFileNoThrowPortable.ts",
        "execSyncWrapper.ts",
        "exportRenderer.tsx",
        "extraUsage.ts",
        "fastMode.ts",
        "file.ts",
        "fileHistory.ts",
        "fileOperationAnalytics.ts",
        "fileRead.ts",
        "fileReadCache.ts",
        "fileStateCache.ts",
        "findExecutable.ts",
        "fingerprint.ts",
        "forkedAgent.ts",
        "format.ts",
        "formatBriefTimestamp.ts",
        "fpsTracker.ts",
        "frontmatterParser.ts",
        "fsOperations.ts",
        "fullscreen.ts",
        "generatedFiles.ts",
        "generators.ts",
        "genericProcessUtils.ts",
        "getWorktreePaths.ts",
        "getWorktreePathsPortable.ts",
        "ghPrStatus.ts",
        "git.ts",
        "gitDiff.ts",
        "githubRepoPathMapping.ts",
        "gitSettings.ts",
        "glob.ts",
        "gracefulShutdown.ts",
        "groupToolUses.ts",
        "handlePromptSubmit.ts",
        "hash.ts",
        "headlessProfiler.ts",
        "heapDumpService.ts",
        "heatmap.ts",
        "highlightMatch.tsx",
        "hooks.ts",
        "horizontalScroll.ts",
        "http.ts",
        "hyperlink.ts",
        "ide.ts",
        "idePathConversion.ts",
        "idleTimeout.ts",
        "imagePaste.ts",
        "imageResizer.ts",
        "imageStore.ts",
        "imageValidation.ts",
        "immediateCommand.ts",
        "ink.ts",
        "inProcessTeammateHelpers.ts",
        "intl.ts",
        "iTermBackup.ts",
        "jetbrains.ts",
        "json.ts",
        "jsonRead.ts",
        "keyboardShortcuts.ts",
        "lazySchema.ts",
        "listSessionsImpl.ts",
        "localInstaller.ts",
        "lockfile.ts",
        "log.ts",
        "logoV2Utils.ts",
        "mailbox.ts",
        "managedEnv.ts",
        "managedEnvConstants.ts",
        "markdown.ts",
        "markdownConfigLoader.ts",
        "mcpInstructionsDelta.ts",
        "mcpOutputStorage.ts",
        "mcpValidation.ts",
        "mcpWebSocketTransport.ts",
        "memoize.ts",
        "memoryFileDetection.ts",
        "messagePredicates.ts",
        "messageQueueManager.ts",
        "messages.ts",
        "modelCost.ts",
        "modifiers.ts",
        "mtls.ts",
        "notebook.ts",
        "objectGroupBy.ts",
        "pasteStore.ts",
        "path.ts",
        "pdf.ts",
        "pdfUtils.ts",
        "peerAddress.ts",
        "planModeV2.ts",
        "plans.ts",
        "platform.ts",
        "postCommitAttribution.ts",
        "preflightChecks.tsx",
        "privacyLevel.ts",
        "process.ts",
        "profilerBase.ts",
        "promptCategory.ts",
        "promptEditor.ts",
        "promptShellExecution.ts",
        "protectedNamespace.ts",
        "proxy.ts",
        "queryContext.ts",
        "QueryGuard.ts",
        "queryHelpers.ts",
        "queryProfiler.ts",
        "queueProcessor.ts",
        "readEditContext.ts",
        "readFileInRange.ts",
        "releaseNotes.ts",
        "renderOptions.ts",
        "ripgrep.ts",
        "sanitization.ts",
        "screenshotClipboard.ts",
        "sdkEventQueue.ts",
        "sdkHeapDumpMonitor.ts",
        "semanticBoolean.ts",
        "semanticNumber.ts",
        "semver.ts",
        "sequential.ts",
        "sessionActivity.ts",
        "sessionDataUploader.ts",
        "sessionEnvironment.ts",
        "sessionEnvVars.ts",
        "sessionFileAccessHooks.ts",
        "sessionIngressAuth.ts",
        "sessionRestore.ts",
        "sessionStart.ts",
        "sessionState.ts",
        "sessionStorage.ts",
        "sessionStoragePortable.ts",
        "sessionTitle.ts",
        "sessionUrl.ts",
        "set.ts",
        "Shell.ts",
        "ShellCommand.ts",
        "shellConfig.ts",
        "sideQuery.ts",
        "sideQuestion.ts",
        "signal.ts",
        "sinks.ts",
        "slashCommandParsing.ts",
        "sleep.ts",
        "sliceAnsi.ts",
        "slowOperations.ts",
        "standaloneAgent.ts",
        "startupProfiler.ts",
        "staticRender.tsx",
        "stats.ts",
        "statsCache.ts",
        "status.tsx",
        "statusNoticeDefinitions.tsx",
        "statusNoticeHelpers.ts",
        "stream.ts",
        "streamJsonStdoutGuard.ts",
        "streamlinedTransform.ts",
        "stringUtils.ts",
        "subprocessEnv.ts",
        "systemDirectories.ts",
        "systemPrompt.ts",
        "systemPromptType.ts",
        "systemTheme.ts",
        "systemThemeWatcher.ts",
        "taggedId.ts",
        "tasks.ts",
        "taskSummary.ts",
        "teamDiscovery.ts",
        "teammate.ts",
        "teammateContext.ts",
        "teammateMailbox.ts",
        "teamMemoryOps.ts",
        "telemetryAttributes.ts",
        "teleport.tsx",
        "tempfile.ts",
        "terminal.ts",
        "terminalPanel.ts",
        "textHighlighting.ts",
        "theme.ts",
        "thinking.ts",
        "timeouts.ts",
        "tmuxSocket.ts",
        "tokenBudget.ts",
        "tokens.ts",
        "toolErrors.ts",
        "toolPool.ts",
        "toolResultStorage.ts",
        "toolSchemaCache.ts",
        "toolSearch.ts",
        "transcriptSearch.ts",
        "treeify.ts",
        "truncate.ts",
        "udsClient.ts",
        "udsMessaging.ts",
        "unaryLogging.ts",
        "undercover.ts",
        "user.ts",
        "userAgent.ts",
        "userPromptKeywords.ts",
        "uuid.ts",
        "warningHandler.ts",
        "which.ts",
        "windowsPaths.ts",
        "withResolvers.ts",
        "words.ts",
        "workloadContext.ts",
        "worktree.ts",
        "worktreeModeEnabled.ts",
        "xdg.ts",
        "xml.ts",
        "yaml.ts",
        "zodToJsonSchema.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/utils"
    },
    {
      "name": "vault",
      "path": "src/vault",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 17311,
      "category": "Utilities",
      "summary": "vault package from the OpenClawd computer runtime.",
      "keyFiles": [
        "index.ts",
        "vault-manager.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/vault"
    },
    {
      "name": "vim",
      "path": "src/vim",
      "importPath": null,
      "fileCount": 5,
      "sizeBytes": 41615,
      "category": "Utilities",
      "summary": "vim package from the OpenClawd computer runtime.",
      "keyFiles": [
        "motions.ts",
        "operators.ts",
        "textObjects.ts",
        "transitions.ts",
        "types.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/vim"
    },
    {
      "name": "voice",
      "path": "src/voice",
      "importPath": null,
      "fileCount": 2,
      "sizeBytes": 1574,
      "category": "Seeker & Mobile",
      "summary": "Voice capture, wake flow, realtime voice, and TTS integration.",
      "keyFiles": [
        "voiceFeatureEnabled.ts",
        "voiceModeEnabled.ts"
      ],
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/src/voice"
    }
  ],
  "skills": [
    {
      "name": "1password",
      "path": "skills/1password",
      "fileCount": 3,
      "sizeBytes": 4340,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/1password",
      "downloadUrl": "http://localhost:3000/downloads/skills/1password.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-1password",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install 1password",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install 1password",
        "bun": "bunx @nanosolana/nanohub@latest install 1password"
      }
    },
    {
      "name": "agent-inbox",
      "path": "skills/agent-inbox",
      "fileCount": 2,
      "sizeBytes": 3767,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/agent-inbox",
      "downloadUrl": "http://localhost:3000/downloads/skills/agent-inbox.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-agent-inbox",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install agent-inbox",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install agent-inbox",
        "bun": "bunx @nanosolana/nanohub@latest install agent-inbox"
      }
    },
    {
      "name": "apple-notes",
      "path": "skills/apple-notes",
      "fileCount": 1,
      "sizeBytes": 2090,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/apple-notes",
      "downloadUrl": "http://localhost:3000/downloads/skills/apple-notes.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-apple-notes",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install apple-notes",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install apple-notes",
        "bun": "bunx @nanosolana/nanohub@latest install apple-notes"
      }
    },
    {
      "name": "apple-reminders",
      "path": "skills/apple-reminders",
      "fileCount": 1,
      "sizeBytes": 3127,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/apple-reminders",
      "downloadUrl": "http://localhost:3000/downloads/skills/apple-reminders.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-apple-reminders",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install apple-reminders",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install apple-reminders",
        "bun": "bunx @nanosolana/nanohub@latest install apple-reminders"
      }
    },
    {
      "name": "artifacts",
      "path": "skills/artifacts",
      "fileCount": 218,
      "sizeBytes": 986423,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/artifacts",
      "downloadUrl": "http://localhost:3000/downloads/skills/artifacts.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-artifacts",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install artifacts",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install artifacts",
        "bun": "bunx @nanosolana/nanohub@latest install artifacts"
      }
    },
    {
      "name": "bear-notes",
      "path": "skills/bear-notes",
      "fileCount": 1,
      "sizeBytes": 2662,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/bear-notes",
      "downloadUrl": "http://localhost:3000/downloads/skills/bear-notes.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-bear-notes",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install bear-notes",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install bear-notes",
        "bun": "bunx @nanosolana/nanohub@latest install bear-notes"
      }
    },
    {
      "name": "blogwatcher",
      "path": "skills/blogwatcher",
      "fileCount": 1,
      "sizeBytes": 1415,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/blogwatcher",
      "downloadUrl": "http://localhost:3000/downloads/skills/blogwatcher.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-blogwatcher",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install blogwatcher",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install blogwatcher",
        "bun": "bunx @nanosolana/nanohub@latest install blogwatcher"
      }
    },
    {
      "name": "blucli",
      "path": "skills/blucli",
      "fileCount": 1,
      "sizeBytes": 1020,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/blucli",
      "downloadUrl": "http://localhost:3000/downloads/skills/blucli.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-blucli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install blucli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install blucli",
        "bun": "bunx @nanosolana/nanohub@latest install blucli"
      }
    },
    {
      "name": "bluebubbles",
      "path": "skills/bluebubbles",
      "fileCount": 1,
      "sizeBytes": 4880,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/bluebubbles",
      "downloadUrl": "http://localhost:3000/downloads/skills/bluebubbles.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-bluebubbles",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install bluebubbles",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install bluebubbles",
        "bun": "bunx @nanosolana/nanohub@latest install bluebubbles"
      }
    },
    {
      "name": "browse",
      "path": "skills/browse",
      "fileCount": 1,
      "sizeBytes": 9685,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/browse",
      "downloadUrl": "http://localhost:3000/downloads/skills/browse.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-browse",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install browse",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install browse",
        "bun": "bunx @nanosolana/nanohub@latest install browse"
      }
    },
    {
      "name": "browser_base",
      "path": "skills/browser_base",
      "fileCount": 43,
      "sizeBytes": 370572,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/browser_base",
      "downloadUrl": "http://localhost:3000/downloads/skills/browser_base.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-browser_base",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install browser_base",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install browser_base",
        "bun": "bunx @nanosolana/nanohub@latest install browser_base"
      }
    },
    {
      "name": "camsnap",
      "path": "skills/camsnap",
      "fileCount": 1,
      "sizeBytes": 1089,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/camsnap",
      "downloadUrl": "http://localhost:3000/downloads/skills/camsnap.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-camsnap",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install camsnap",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install camsnap",
        "bun": "bunx @nanosolana/nanohub@latest install camsnap"
      }
    },
    {
      "name": "canvas",
      "path": "skills/canvas",
      "fileCount": 3,
      "sizeBytes": 32032,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/canvas",
      "downloadUrl": "http://localhost:3000/downloads/skills/canvas.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-canvas",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install canvas",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install canvas",
        "bun": "bunx @nanosolana/nanohub@latest install canvas"
      }
    },
    {
      "name": "clawd-vault",
      "path": "skills/clawd-vault",
      "fileCount": 2,
      "sizeBytes": 7178,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/clawd-vault",
      "downloadUrl": "http://localhost:3000/downloads/skills/clawd-vault.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-clawd-vault",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install clawd-vault",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install clawd-vault",
        "bun": "bunx @nanosolana/nanohub@latest install clawd-vault"
      }
    },
    {
      "name": "clawdhub",
      "path": "skills/clawdhub",
      "fileCount": 1,
      "sizeBytes": 1613,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/clawdhub",
      "downloadUrl": "http://localhost:3000/downloads/skills/clawdhub.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-clawdhub",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install clawdhub",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install clawdhub",
        "bun": "bunx @nanosolana/nanohub@latest install clawdhub"
      }
    },
    {
      "name": "clawhub",
      "path": "skills/clawhub",
      "fileCount": 1,
      "sizeBytes": 1613,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/clawhub",
      "downloadUrl": "http://localhost:3000/downloads/skills/clawhub.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-clawhub",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install clawhub",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install clawhub",
        "bun": "bunx @nanosolana/nanohub@latest install clawhub"
      }
    },
    {
      "name": "code_review",
      "path": "skills/code_review",
      "fileCount": 2,
      "sizeBytes": 3140,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/code_review",
      "downloadUrl": "http://localhost:3000/downloads/skills/code_review.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-code_review",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install code_review",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install code_review",
        "bun": "bunx @nanosolana/nanohub@latest install code_review"
      }
    },
    {
      "name": "coding-agent",
      "path": "skills/coding-agent",
      "fileCount": 1,
      "sizeBytes": 12928,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/coding-agent",
      "downloadUrl": "http://localhost:3000/downloads/skills/coding-agent.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-coding-agent",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install coding-agent",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install coding-agent",
        "bun": "bunx @nanosolana/nanohub@latest install coding-agent"
      }
    },
    {
      "name": "cua",
      "path": "skills/cua",
      "fileCount": 1,
      "sizeBytes": 14745,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/cua",
      "downloadUrl": "http://localhost:3000/downloads/skills/cua.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-cua",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install cua",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install cua",
        "bun": "bunx @nanosolana/nanohub@latest install cua"
      }
    },
    {
      "name": "database",
      "path": "skills/database",
      "fileCount": 3,
      "sizeBytes": 19301,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/database",
      "downloadUrl": "http://localhost:3000/downloads/skills/database.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-database",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install database",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install database",
        "bun": "bunx @nanosolana/nanohub@latest install database"
      }
    },
    {
      "name": "delegation",
      "path": "skills/delegation",
      "fileCount": 2,
      "sizeBytes": 7890,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/delegation",
      "downloadUrl": "http://localhost:3000/downloads/skills/delegation.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-delegation",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install delegation",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install delegation",
        "bun": "bunx @nanosolana/nanohub@latest install delegation"
      }
    },
    {
      "name": "deployment",
      "path": "skills/deployment",
      "fileCount": 4,
      "sizeBytes": 31648,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/deployment",
      "downloadUrl": "http://localhost:3000/downloads/skills/deployment.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-deployment",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install deployment",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install deployment",
        "bun": "bunx @nanosolana/nanohub@latest install deployment"
      }
    },
    {
      "name": "design",
      "path": "skills/design",
      "fileCount": 2,
      "sizeBytes": 20047,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/design",
      "downloadUrl": "http://localhost:3000/downloads/skills/design.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-design",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install design",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install design",
        "bun": "bunx @nanosolana/nanohub@latest install design"
      }
    },
    {
      "name": "design-exploration",
      "path": "skills/design-exploration",
      "fileCount": 2,
      "sizeBytes": 8182,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/design-exploration",
      "downloadUrl": "http://localhost:3000/downloads/skills/design-exploration.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-design-exploration",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install design-exploration",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install design-exploration",
        "bun": "bunx @nanosolana/nanohub@latest install design-exploration"
      }
    },
    {
      "name": "diagnostics",
      "path": "skills/diagnostics",
      "fileCount": 2,
      "sizeBytes": 3699,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/diagnostics",
      "downloadUrl": "http://localhost:3000/downloads/skills/diagnostics.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-diagnostics",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install diagnostics",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install diagnostics",
        "bun": "bunx @nanosolana/nanohub@latest install diagnostics"
      }
    },
    {
      "name": "discord",
      "path": "skills/discord",
      "fileCount": 1,
      "sizeBytes": 3446,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/discord",
      "downloadUrl": "http://localhost:3000/downloads/skills/discord.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-discord",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install discord",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install discord",
        "bun": "bunx @nanosolana/nanohub@latest install discord"
      }
    },
    {
      "name": "e2b",
      "path": "skills/e2b",
      "fileCount": 1,
      "sizeBytes": 10660,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/e2b",
      "downloadUrl": "http://localhost:3000/downloads/skills/e2b.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-e2b",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install e2b",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install e2b",
        "bun": "bunx @nanosolana/nanohub@latest install e2b"
      }
    },
    {
      "name": "eightctl",
      "path": "skills/eightctl",
      "fileCount": 1,
      "sizeBytes": 1094,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/eightctl",
      "downloadUrl": "http://localhost:3000/downloads/skills/eightctl.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-eightctl",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install eightctl",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install eightctl",
        "bun": "bunx @nanosolana/nanohub@latest install eightctl"
      }
    },
    {
      "name": "environment-secrets",
      "path": "skills/environment-secrets",
      "fileCount": 2,
      "sizeBytes": 6640,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/environment-secrets",
      "downloadUrl": "http://localhost:3000/downloads/skills/environment-secrets.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-environment-secrets",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install environment-secrets",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install environment-secrets",
        "bun": "bunx @nanosolana/nanohub@latest install environment-secrets"
      }
    },
    {
      "name": "external_apis",
      "path": "skills/external_apis",
      "fileCount": 3,
      "sizeBytes": 3189,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/external_apis",
      "downloadUrl": "http://localhost:3000/downloads/skills/external_apis.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-external_apis",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install external_apis",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install external_apis",
        "bun": "bunx @nanosolana/nanohub@latest install external_apis"
      }
    },
    {
      "name": "follow-up-tasks",
      "path": "skills/follow-up-tasks",
      "fileCount": 2,
      "sizeBytes": 4517,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/follow-up-tasks",
      "downloadUrl": "http://localhost:3000/downloads/skills/follow-up-tasks.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-follow-up-tasks",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install follow-up-tasks",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install follow-up-tasks",
        "bun": "bunx @nanosolana/nanohub@latest install follow-up-tasks"
      }
    },
    {
      "name": "gateway-node-ops",
      "path": "skills/gateway-node-ops",
      "fileCount": 1,
      "sizeBytes": 2171,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/gateway-node-ops",
      "downloadUrl": "http://localhost:3000/downloads/skills/gateway-node-ops.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-gateway-node-ops",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gateway-node-ops",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gateway-node-ops",
        "bun": "bunx @nanosolana/nanohub@latest install gateway-node-ops"
      }
    },
    {
      "name": "gemini",
      "path": "skills/gemini",
      "fileCount": 1,
      "sizeBytes": 934,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/gemini",
      "downloadUrl": "http://localhost:3000/downloads/skills/gemini.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-gemini",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gemini",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gemini",
        "bun": "bunx @nanosolana/nanohub@latest install gemini"
      }
    },
    {
      "name": "gh-issues",
      "path": "skills/gh-issues",
      "fileCount": 1,
      "sizeBytes": 34293,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/gh-issues",
      "downloadUrl": "http://localhost:3000/downloads/skills/gh-issues.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-gh-issues",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gh-issues",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gh-issues",
        "bun": "bunx @nanosolana/nanohub@latest install gh-issues"
      }
    },
    {
      "name": "gifgrep",
      "path": "skills/gifgrep",
      "fileCount": 1,
      "sizeBytes": 2185,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/gifgrep",
      "downloadUrl": "http://localhost:3000/downloads/skills/gifgrep.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-gifgrep",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gifgrep",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gifgrep",
        "bun": "bunx @nanosolana/nanohub@latest install gifgrep"
      }
    },
    {
      "name": "github",
      "path": "skills/github",
      "fileCount": 1,
      "sizeBytes": 4125,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/github",
      "downloadUrl": "http://localhost:3000/downloads/skills/github.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-github",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install github",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install github",
        "bun": "bunx @nanosolana/nanohub@latest install github"
      }
    },
    {
      "name": "gog",
      "path": "skills/gog",
      "fileCount": 1,
      "sizeBytes": 4572,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/gog",
      "downloadUrl": "http://localhost:3000/downloads/skills/gog.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-gog",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gog",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gog",
        "bun": "bunx @nanosolana/nanohub@latest install gog"
      }
    },
    {
      "name": "goplaces",
      "path": "skills/goplaces",
      "fileCount": 1,
      "sizeBytes": 1538,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/goplaces",
      "downloadUrl": "http://localhost:3000/downloads/skills/goplaces.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-goplaces",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install goplaces",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install goplaces",
        "bun": "bunx @nanosolana/nanohub@latest install goplaces"
      }
    },
    {
      "name": "healthcheck",
      "path": "skills/healthcheck",
      "fileCount": 1,
      "sizeBytes": 10538,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/healthcheck",
      "downloadUrl": "http://localhost:3000/downloads/skills/healthcheck.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-healthcheck",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install healthcheck",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install healthcheck",
        "bun": "bunx @nanosolana/nanohub@latest install healthcheck"
      }
    },
    {
      "name": "himalaya",
      "path": "skills/himalaya",
      "fileCount": 3,
      "sizeBytes": 12499,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/himalaya",
      "downloadUrl": "http://localhost:3000/downloads/skills/himalaya.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-himalaya",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install himalaya",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install himalaya",
        "bun": "bunx @nanosolana/nanohub@latest install himalaya"
      }
    },
    {
      "name": "image-search",
      "path": "skills/image-search",
      "fileCount": 2,
      "sizeBytes": 4403,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/image-search",
      "downloadUrl": "http://localhost:3000/downloads/skills/image-search.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-image-search",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install image-search",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install image-search",
        "bun": "bunx @nanosolana/nanohub@latest install image-search"
      }
    },
    {
      "name": "imsg",
      "path": "skills/imsg",
      "fileCount": 1,
      "sizeBytes": 2977,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/imsg",
      "downloadUrl": "http://localhost:3000/downloads/skills/imsg.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-imsg",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install imsg",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install imsg",
        "bun": "bunx @nanosolana/nanohub@latest install imsg"
      }
    },
    {
      "name": "integrations",
      "path": "skills/integrations",
      "fileCount": 2,
      "sizeBytes": 12153,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/integrations",
      "downloadUrl": "http://localhost:3000/downloads/skills/integrations.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-integrations",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install integrations",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install integrations",
        "bun": "bunx @nanosolana/nanohub@latest install integrations"
      }
    },
    {
      "name": "launchpad-skills",
      "path": "skills/launchpad-skills",
      "fileCount": 2,
      "sizeBytes": 7252,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/launchpad-skills",
      "downloadUrl": "http://localhost:3000/downloads/skills/launchpad-skills.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-launchpad-skills",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install launchpad-skills",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install launchpad-skills",
        "bun": "bunx @nanosolana/nanohub@latest install launchpad-skills"
      }
    },
    {
      "name": "mcporter",
      "path": "skills/mcporter",
      "fileCount": 1,
      "sizeBytes": 1674,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/mcporter",
      "downloadUrl": "http://localhost:3000/downloads/skills/mcporter.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-mcporter",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install mcporter",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install mcporter",
        "bun": "bunx @nanosolana/nanohub@latest install mcporter"
      }
    },
    {
      "name": "media-generation",
      "path": "skills/media-generation",
      "fileCount": 2,
      "sizeBytes": 8249,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/media-generation",
      "downloadUrl": "http://localhost:3000/downloads/skills/media-generation.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-media-generation",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install media-generation",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install media-generation",
        "bun": "bunx @nanosolana/nanohub@latest install media-generation"
      }
    },
    {
      "name": "mockup-extract",
      "path": "skills/mockup-extract",
      "fileCount": 2,
      "sizeBytes": 9115,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/mockup-extract",
      "downloadUrl": "http://localhost:3000/downloads/skills/mockup-extract.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-mockup-extract",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install mockup-extract",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install mockup-extract",
        "bun": "bunx @nanosolana/nanohub@latest install mockup-extract"
      }
    },
    {
      "name": "mockup-graduate",
      "path": "skills/mockup-graduate",
      "fileCount": 2,
      "sizeBytes": 5241,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/mockup-graduate",
      "downloadUrl": "http://localhost:3000/downloads/skills/mockup-graduate.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-mockup-graduate",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install mockup-graduate",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install mockup-graduate",
        "bun": "bunx @nanosolana/nanohub@latest install mockup-graduate"
      }
    },
    {
      "name": "mockup-sandbox",
      "path": "skills/mockup-sandbox",
      "fileCount": 2,
      "sizeBytes": 43588,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/mockup-sandbox",
      "downloadUrl": "http://localhost:3000/downloads/skills/mockup-sandbox.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-mockup-sandbox",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install mockup-sandbox",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install mockup-sandbox",
        "bun": "bunx @nanosolana/nanohub@latest install mockup-sandbox"
      }
    },
    {
      "name": "model-usage",
      "path": "skills/model-usage",
      "fileCount": 4,
      "sizeBytes": 15447,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/model-usage",
      "downloadUrl": "http://localhost:3000/downloads/skills/model-usage.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-model-usage",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install model-usage",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install model-usage",
        "bun": "bunx @nanosolana/nanohub@latest install model-usage"
      }
    },
    {
      "name": "nano-banana-pro",
      "path": "skills/nano-banana-pro",
      "fileCount": 3,
      "sizeBytes": 10869,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/nano-banana-pro",
      "downloadUrl": "http://localhost:3000/downloads/skills/nano-banana-pro.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-nano-banana-pro",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install nano-banana-pro",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install nano-banana-pro",
        "bun": "bunx @nanosolana/nanohub@latest install nano-banana-pro"
      }
    },
    {
      "name": "nano-pdf",
      "path": "skills/nano-pdf",
      "fileCount": 1,
      "sizeBytes": 954,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/nano-pdf",
      "downloadUrl": "http://localhost:3000/downloads/skills/nano-pdf.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-nano-pdf",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install nano-pdf",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install nano-pdf",
        "bun": "bunx @nanosolana/nanohub@latest install nano-pdf"
      }
    },
    {
      "name": "notion",
      "path": "skills/notion",
      "fileCount": 1,
      "sizeBytes": 5381,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/notion",
      "downloadUrl": "http://localhost:3000/downloads/skills/notion.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-notion",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install notion",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install notion",
        "bun": "bunx @nanosolana/nanohub@latest install notion"
      }
    },
    {
      "name": "obsidian",
      "path": "skills/obsidian",
      "fileCount": 1,
      "sizeBytes": 2531,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/obsidian",
      "downloadUrl": "http://localhost:3000/downloads/skills/obsidian.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-obsidian",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install obsidian",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install obsidian",
        "bun": "bunx @nanosolana/nanohub@latest install obsidian"
      }
    },
    {
      "name": "openai-image-gen",
      "path": "skills/openai-image-gen",
      "fileCount": 3,
      "sizeBytes": 19331,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openai-image-gen",
      "downloadUrl": "http://localhost:3000/downloads/skills/openai-image-gen.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openai-image-gen",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openai-image-gen",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openai-image-gen",
        "bun": "bunx @nanosolana/nanohub@latest install openai-image-gen"
      }
    },
    {
      "name": "openai-whisper",
      "path": "skills/openai-whisper",
      "fileCount": 1,
      "sizeBytes": 912,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openai-whisper",
      "downloadUrl": "http://localhost:3000/downloads/skills/openai-whisper.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openai-whisper",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openai-whisper",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openai-whisper",
        "bun": "bunx @nanosolana/nanohub@latest install openai-whisper"
      }
    },
    {
      "name": "openai-whisper-api",
      "path": "skills/openai-whisper-api",
      "fileCount": 2,
      "sizeBytes": 2635,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openai-whisper-api",
      "downloadUrl": "http://localhost:3000/downloads/skills/openai-whisper-api.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openai-whisper-api",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openai-whisper-api",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openai-whisper-api",
        "bun": "bunx @nanosolana/nanohub@latest install openai-whisper-api"
      }
    },
    {
      "name": "openclawd",
      "path": "skills/openclawd",
      "fileCount": 1,
      "sizeBytes": 6231,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openclawd",
      "downloadUrl": "http://localhost:3000/downloads/skills/openclawd.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openclawd",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openclawd",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openclawd",
        "bun": "bunx @nanosolana/nanohub@latest install openclawd"
      }
    },
    {
      "name": "openclawd-clawd-code-skill-main",
      "path": "skills/openclawd-clawd-code-skill-main",
      "fileCount": 54,
      "sizeBytes": 282411,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openclawd-clawd-code-skill-main",
      "downloadUrl": "http://localhost:3000/downloads/skills/openclawd-clawd-code-skill-main.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openclawd-clawd-code-skill-main",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openclawd-clawd-code-skill-main",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openclawd-clawd-code-skill-main",
        "bun": "bunx @nanosolana/nanohub@latest install openclawd-clawd-code-skill-main"
      }
    },
    {
      "name": "openclawd-code-skill",
      "path": "skills/openclawd-code-skill",
      "fileCount": 54,
      "sizeBytes": 282132,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openclawd-code-skill",
      "downloadUrl": "http://localhost:3000/downloads/skills/openclawd-code-skill.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openclawd-code-skill",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openclawd-code-skill",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openclawd-code-skill",
        "bun": "bunx @nanosolana/nanohub@latest install openclawd-code-skill"
      }
    },
    {
      "name": "openclawd-codeskill",
      "path": "skills/openclawd-codeskill",
      "fileCount": 21,
      "sizeBytes": 119776,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openclawd-codeskill",
      "downloadUrl": "http://localhost:3000/downloads/skills/openclawd-codeskill.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openclawd-codeskill",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openclawd-codeskill",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openclawd-codeskill",
        "bun": "bunx @nanosolana/nanohub@latest install openclawd-codeskill"
      }
    },
    {
      "name": "openhue",
      "path": "skills/openhue",
      "fileCount": 1,
      "sizeBytes": 2460,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openhue",
      "downloadUrl": "http://localhost:3000/downloads/skills/openhue.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openhue",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openhue",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openhue",
        "bun": "bunx @nanosolana/nanohub@latest install openhue"
      }
    },
    {
      "name": "openrouter-oauth",
      "path": "skills/openrouter-oauth",
      "fileCount": 1,
      "sizeBytes": 12579,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/openrouter-oauth",
      "downloadUrl": "http://localhost:3000/downloads/skills/openrouter-oauth.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-openrouter-oauth",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openrouter-oauth",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openrouter-oauth",
        "bun": "bunx @nanosolana/nanohub@latest install openrouter-oauth"
      }
    },
    {
      "name": "oracle",
      "path": "skills/oracle",
      "fileCount": 1,
      "sizeBytes": 5073,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/oracle",
      "downloadUrl": "http://localhost:3000/downloads/skills/oracle.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-oracle",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install oracle",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install oracle",
        "bun": "bunx @nanosolana/nanohub@latest install oracle"
      }
    },
    {
      "name": "ordercli",
      "path": "skills/ordercli",
      "fileCount": 1,
      "sizeBytes": 2389,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/ordercli",
      "downloadUrl": "http://localhost:3000/downloads/skills/ordercli.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-ordercli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install ordercli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install ordercli",
        "bun": "bunx @nanosolana/nanohub@latest install ordercli"
      }
    },
    {
      "name": "package-management",
      "path": "skills/package-management",
      "fileCount": 2,
      "sizeBytes": 8023,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/package-management",
      "downloadUrl": "http://localhost:3000/downloads/skills/package-management.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-package-management",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install package-management",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install package-management",
        "bun": "bunx @nanosolana/nanohub@latest install package-management"
      }
    },
    {
      "name": "pdf-to-markdown",
      "path": "skills/pdf-to-markdown",
      "fileCount": 1,
      "sizeBytes": 6521,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pdf-to-markdown",
      "downloadUrl": "http://localhost:3000/downloads/skills/pdf-to-markdown.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pdf-to-markdown",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pdf-to-markdown",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pdf-to-markdown",
        "bun": "bunx @nanosolana/nanohub@latest install pdf-to-markdown"
      }
    },
    {
      "name": "peekaboo",
      "path": "skills/peekaboo",
      "fileCount": 1,
      "sizeBytes": 5970,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/peekaboo",
      "downloadUrl": "http://localhost:3000/downloads/skills/peekaboo.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-peekaboo",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install peekaboo",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install peekaboo",
        "bun": "bunx @nanosolana/nanohub@latest install peekaboo"
      }
    },
    {
      "name": "percolator",
      "path": "skills/percolator",
      "fileCount": 2,
      "sizeBytes": 16678,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/percolator",
      "downloadUrl": "http://localhost:3000/downloads/skills/percolator.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-percolator",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install percolator",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install percolator",
        "bun": "bunx @nanosolana/nanohub@latest install percolator"
      }
    },
    {
      "name": "post_merge_setup",
      "path": "skills/post_merge_setup",
      "fileCount": 2,
      "sizeBytes": 4594,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/post_merge_setup",
      "downloadUrl": "http://localhost:3000/downloads/skills/post_merge_setup.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-post_merge_setup",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install post_merge_setup",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install post_merge_setup",
        "bun": "bunx @nanosolana/nanohub@latest install post_merge_setup"
      }
    },
    {
      "name": "project_tasks",
      "path": "skills/project_tasks",
      "fileCount": 2,
      "sizeBytes": 14342,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/project_tasks",
      "downloadUrl": "http://localhost:3000/downloads/skills/project_tasks.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-project_tasks",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install project_tasks",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install project_tasks",
        "bun": "bunx @nanosolana/nanohub@latest install project_tasks"
      }
    },
    {
      "name": "pump-admin-ops",
      "path": "skills/pump-admin-ops",
      "fileCount": 1,
      "sizeBytes": 2743,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-admin-ops",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-admin-ops.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-admin-ops",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-admin-ops",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-admin-ops",
        "bun": "bunx @nanosolana/nanohub@latest install pump-admin-ops"
      }
    },
    {
      "name": "pump-ai-agents",
      "path": "skills/pump-ai-agents",
      "fileCount": 1,
      "sizeBytes": 3272,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-ai-agents",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-ai-agents.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-ai-agents",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-ai-agents",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-ai-agents",
        "bun": "bunx @nanosolana/nanohub@latest install pump-ai-agents"
      }
    },
    {
      "name": "pump-bonding-curve",
      "path": "skills/pump-bonding-curve",
      "fileCount": 1,
      "sizeBytes": 4936,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-bonding-curve",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-bonding-curve.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-bonding-curve",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-bonding-curve",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-bonding-curve",
        "bun": "bunx @nanosolana/nanohub@latest install pump-bonding-curve"
      }
    },
    {
      "name": "pump-build-release",
      "path": "skills/pump-build-release",
      "fileCount": 1,
      "sizeBytes": 2504,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-build-release",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-build-release.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-build-release",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-build-release",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-build-release",
        "bun": "bunx @nanosolana/nanohub@latest install pump-build-release"
      }
    },
    {
      "name": "pump-claims-readonly",
      "path": "skills/pump-claims-readonly",
      "fileCount": 1,
      "sizeBytes": 8245,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-claims-readonly",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-claims-readonly.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-claims-readonly",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-claims-readonly",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-claims-readonly",
        "bun": "bunx @nanosolana/nanohub@latest install pump-claims-readonly"
      }
    },
    {
      "name": "pump-fee-sharing",
      "path": "skills/pump-fee-sharing",
      "fileCount": 1,
      "sizeBytes": 3561,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-fee-sharing",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-fee-sharing.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-fee-sharing",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-fee-sharing",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-fee-sharing",
        "bun": "bunx @nanosolana/nanohub@latest install pump-fee-sharing"
      }
    },
    {
      "name": "pump-fee-system",
      "path": "skills/pump-fee-system",
      "fileCount": 1,
      "sizeBytes": 3253,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-fee-system",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-fee-system.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-fee-system",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-fee-system",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-fee-system",
        "bun": "bunx @nanosolana/nanohub@latest install pump-fee-system"
      }
    },
    {
      "name": "pump-mcp-server",
      "path": "skills/pump-mcp-server",
      "fileCount": 1,
      "sizeBytes": 3175,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-mcp-server",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-mcp-server.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-mcp-server",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-mcp-server",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-mcp-server",
        "bun": "bunx @nanosolana/nanohub@latest install pump-mcp-server"
      }
    },
    {
      "name": "pump-rust-vanity",
      "path": "skills/pump-rust-vanity",
      "fileCount": 1,
      "sizeBytes": 4029,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-rust-vanity",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-rust-vanity.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-rust-vanity",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-rust-vanity",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-rust-vanity",
        "bun": "bunx @nanosolana/nanohub@latest install pump-rust-vanity"
      }
    },
    {
      "name": "pump-sdk-core",
      "path": "skills/pump-sdk-core",
      "fileCount": 1,
      "sizeBytes": 4131,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-sdk-core",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-sdk-core.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-sdk-core",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-sdk-core",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-sdk-core",
        "bun": "bunx @nanosolana/nanohub@latest install pump-sdk-core"
      }
    },
    {
      "name": "pump-security",
      "path": "skills/pump-security",
      "fileCount": 1,
      "sizeBytes": 3580,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-security",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-security.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-security",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-security",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-security",
        "bun": "bunx @nanosolana/nanohub@latest install pump-security"
      }
    },
    {
      "name": "pump-shell-scripts",
      "path": "skills/pump-shell-scripts",
      "fileCount": 1,
      "sizeBytes": 2861,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-shell-scripts",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-shell-scripts.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-shell-scripts",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-shell-scripts",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-shell-scripts",
        "bun": "bunx @nanosolana/nanohub@latest install pump-shell-scripts"
      }
    },
    {
      "name": "pump-solana-architecture",
      "path": "skills/pump-solana-architecture",
      "fileCount": 1,
      "sizeBytes": 4071,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-solana-architecture",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-solana-architecture.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-solana-architecture",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-solana-architecture",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-solana-architecture",
        "bun": "bunx @nanosolana/nanohub@latest install pump-solana-architecture"
      }
    },
    {
      "name": "pump-solana-dev",
      "path": "skills/pump-solana-dev",
      "fileCount": 1,
      "sizeBytes": 3666,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-solana-dev",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-solana-dev.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-solana-dev",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-solana-dev",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-solana-dev",
        "bun": "bunx @nanosolana/nanohub@latest install pump-solana-dev"
      }
    },
    {
      "name": "pump-solana-wallet",
      "path": "skills/pump-solana-wallet",
      "fileCount": 1,
      "sizeBytes": 3047,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-solana-wallet",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-solana-wallet.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-solana-wallet",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-solana-wallet",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-solana-wallet",
        "bun": "bunx @nanosolana/nanohub@latest install pump-solana-wallet"
      }
    },
    {
      "name": "pump-testing",
      "path": "skills/pump-testing",
      "fileCount": 1,
      "sizeBytes": 2839,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-testing",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-testing.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-testing",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-testing",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-testing",
        "bun": "bunx @nanosolana/nanohub@latest install pump-testing"
      }
    },
    {
      "name": "pump-token-incentives",
      "path": "skills/pump-token-incentives",
      "fileCount": 1,
      "sizeBytes": 3153,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-token-incentives",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-token-incentives.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-token-incentives",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-token-incentives",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-token-incentives",
        "bun": "bunx @nanosolana/nanohub@latest install pump-token-incentives"
      }
    },
    {
      "name": "pump-token-lifecycle",
      "path": "skills/pump-token-lifecycle",
      "fileCount": 1,
      "sizeBytes": 4758,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-token-lifecycle",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-token-lifecycle.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-token-lifecycle",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-token-lifecycle",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-token-lifecycle",
        "bun": "bunx @nanosolana/nanohub@latest install pump-token-lifecycle"
      }
    },
    {
      "name": "pump-ts-vanity",
      "path": "skills/pump-ts-vanity",
      "fileCount": 1,
      "sizeBytes": 2969,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-ts-vanity",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-ts-vanity.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-ts-vanity",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-ts-vanity",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-ts-vanity",
        "bun": "bunx @nanosolana/nanohub@latest install pump-ts-vanity"
      }
    },
    {
      "name": "pump-website",
      "path": "skills/pump-website",
      "fileCount": 1,
      "sizeBytes": 3522,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pump-website",
      "downloadUrl": "http://localhost:3000/downloads/skills/pump-website.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pump-website",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-website",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-website",
        "bun": "bunx @nanosolana/nanohub@latest install pump-website"
      }
    },
    {
      "name": "pumpfun-analytics",
      "path": "skills/pumpfun-analytics",
      "fileCount": 1,
      "sizeBytes": 3232,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pumpfun-analytics",
      "downloadUrl": "http://localhost:3000/downloads/skills/pumpfun-analytics.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pumpfun-analytics",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-analytics",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-analytics",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-analytics"
      }
    },
    {
      "name": "pumpfun-fees",
      "path": "skills/pumpfun-fees",
      "fileCount": 1,
      "sizeBytes": 2466,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pumpfun-fees",
      "downloadUrl": "http://localhost:3000/downloads/skills/pumpfun-fees.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pumpfun-fees",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-fees",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-fees",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-fees"
      }
    },
    {
      "name": "pumpfun-launcher",
      "path": "skills/pumpfun-launcher",
      "fileCount": 1,
      "sizeBytes": 2537,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pumpfun-launcher",
      "downloadUrl": "http://localhost:3000/downloads/skills/pumpfun-launcher.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pumpfun-launcher",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-launcher",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-launcher",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-launcher"
      }
    },
    {
      "name": "pumpfun-token-scanner",
      "path": "skills/pumpfun-token-scanner",
      "fileCount": 11,
      "sizeBytes": 87223,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pumpfun-token-scanner",
      "downloadUrl": "http://localhost:3000/downloads/skills/pumpfun-token-scanner.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pumpfun-token-scanner",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-token-scanner",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-token-scanner",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-token-scanner"
      }
    },
    {
      "name": "pumpfun-trading",
      "path": "skills/pumpfun-trading",
      "fileCount": 1,
      "sizeBytes": 2659,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/pumpfun-trading",
      "downloadUrl": "http://localhost:3000/downloads/skills/pumpfun-trading.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-pumpfun-trading",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-trading",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-trading",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-trading"
      }
    },
    {
      "name": "query-integration-data",
      "path": "skills/query-integration-data",
      "fileCount": 2,
      "sizeBytes": 15066,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/query-integration-data",
      "downloadUrl": "http://localhost:3000/downloads/skills/query-integration-data.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-query-integration-data",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install query-integration-data",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install query-integration-data",
        "bun": "bunx @nanosolana/nanohub@latest install query-integration-data"
      }
    },
    {
      "name": "remove-image-background",
      "path": "skills/remove-image-background",
      "fileCount": 2,
      "sizeBytes": 1888,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/remove-image-background",
      "downloadUrl": "http://localhost:3000/downloads/skills/remove-image-background.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-remove-image-background",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install remove-image-background",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install remove-image-background",
        "bun": "bunx @nanosolana/nanohub@latest install remove-image-background"
      }
    },
    {
      "name": "repl_setup",
      "path": "skills/repl_setup",
      "fileCount": 5,
      "sizeBytes": 10411,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/repl_setup",
      "downloadUrl": "http://localhost:3000/downloads/skills/repl_setup.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-repl_setup",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install repl_setup",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install repl_setup",
        "bun": "bunx @nanosolana/nanohub@latest install repl_setup"
      }
    },
    {
      "name": "replit-docs",
      "path": "skills/replit-docs",
      "fileCount": 2,
      "sizeBytes": 2597,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/replit-docs",
      "downloadUrl": "http://localhost:3000/downloads/skills/replit-docs.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-replit-docs",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install replit-docs",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install replit-docs",
        "bun": "bunx @nanosolana/nanohub@latest install replit-docs"
      }
    },
    {
      "name": "revenuecat",
      "path": "skills/revenuecat",
      "fileCount": 5,
      "sizeBytes": 45162,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/revenuecat",
      "downloadUrl": "http://localhost:3000/downloads/skills/revenuecat.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-revenuecat",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install revenuecat",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install revenuecat",
        "bun": "bunx @nanosolana/nanohub@latest install revenuecat"
      }
    },
    {
      "name": "sag",
      "path": "skills/sag",
      "fileCount": 1,
      "sizeBytes": 2297,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/sag",
      "downloadUrl": "http://localhost:3000/downloads/skills/sag.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-sag",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install sag",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install sag",
        "bun": "bunx @nanosolana/nanohub@latest install sag"
      }
    },
    {
      "name": "security_scan",
      "path": "skills/security_scan",
      "fileCount": 2,
      "sizeBytes": 1803,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/security_scan",
      "downloadUrl": "http://localhost:3000/downloads/skills/security_scan.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-security_scan",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install security_scan",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install security_scan",
        "bun": "bunx @nanosolana/nanohub@latest install security_scan"
      }
    },
    {
      "name": "seeker-daemon-ops",
      "path": "skills/seeker-daemon-ops",
      "fileCount": 1,
      "sizeBytes": 866,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/seeker-daemon-ops",
      "downloadUrl": "http://localhost:3000/downloads/skills/seeker-daemon-ops.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-seeker-daemon-ops",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install seeker-daemon-ops",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install seeker-daemon-ops",
        "bun": "bunx @nanosolana/nanohub@latest install seeker-daemon-ops"
      }
    },
    {
      "name": "session-logs",
      "path": "skills/session-logs",
      "fileCount": 1,
      "sizeBytes": 3429,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/session-logs",
      "downloadUrl": "http://localhost:3000/downloads/skills/session-logs.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-session-logs",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install session-logs",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install session-logs",
        "bun": "bunx @nanosolana/nanohub@latest install session-logs"
      }
    },
    {
      "name": "sherpa-onnx-tts",
      "path": "skills/sherpa-onnx-tts",
      "fileCount": 2,
      "sizeBytes": 8212,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/sherpa-onnx-tts",
      "downloadUrl": "http://localhost:3000/downloads/skills/sherpa-onnx-tts.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-sherpa-onnx-tts",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install sherpa-onnx-tts",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install sherpa-onnx-tts",
        "bun": "bunx @nanosolana/nanohub@latest install sherpa-onnx-tts"
      }
    },
    {
      "name": "skill-authoring",
      "path": "skills/skill-authoring",
      "fileCount": 2,
      "sizeBytes": 3592,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/skill-authoring",
      "downloadUrl": "http://localhost:3000/downloads/skills/skill-authoring.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-skill-authoring",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install skill-authoring",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install skill-authoring",
        "bun": "bunx @nanosolana/nanohub@latest install skill-authoring"
      }
    },
    {
      "name": "skill-creator",
      "path": "skills/skill-creator",
      "fileCount": 7,
      "sizeBytes": 61486,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/skill-creator",
      "downloadUrl": "http://localhost:3000/downloads/skills/skill-creator.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-skill-creator",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install skill-creator",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install skill-creator",
        "bun": "bunx @nanosolana/nanohub@latest install skill-creator"
      }
    },
    {
      "name": "skills",
      "path": "skills/skills",
      "fileCount": 0,
      "sizeBytes": 0,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/skills",
      "downloadUrl": "http://localhost:3000/downloads/skills/skills.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-skills",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install skills",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install skills",
        "bun": "bunx @nanosolana/nanohub@latest install skills"
      }
    },
    {
      "name": "slack",
      "path": "skills/slack",
      "fileCount": 1,
      "sizeBytes": 2501,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/slack",
      "downloadUrl": "http://localhost:3000/downloads/skills/slack.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-slack",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install slack",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install slack",
        "bun": "bunx @nanosolana/nanohub@latest install slack"
      }
    },
    {
      "name": "solana-attestation-skill",
      "path": "skills/solana-attestation-skill",
      "fileCount": 1,
      "sizeBytes": 12653,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/solana-attestation-skill",
      "downloadUrl": "http://localhost:3000/downloads/skills/solana-attestation-skill.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-solana-attestation-skill",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-attestation-skill",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-attestation-skill",
        "bun": "bunx @nanosolana/nanohub@latest install solana-attestation-skill"
      }
    },
    {
      "name": "solana-dev-skill-main",
      "path": "skills/solana-dev-skill-main",
      "fileCount": 14,
      "sizeBytes": 64146,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/solana-dev-skill-main",
      "downloadUrl": "http://localhost:3000/downloads/skills/solana-dev-skill-main.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-solana-dev-skill-main",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-dev-skill-main",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-dev-skill-main",
        "bun": "bunx @nanosolana/nanohub@latest install solana-dev-skill-main"
      }
    },
    {
      "name": "solana-formal-verification",
      "path": "skills/solana-formal-verification",
      "fileCount": 2048,
      "sizeBytes": 283584216,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/solana-formal-verification",
      "downloadUrl": "http://localhost:3000/downloads/skills/solana-formal-verification.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-solana-formal-verification",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-formal-verification",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-formal-verification",
        "bun": "bunx @nanosolana/nanohub@latest install solana-formal-verification"
      }
    },
    {
      "name": "solana-research-brief",
      "path": "skills/solana-research-brief",
      "fileCount": 1,
      "sizeBytes": 814,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/solana-research-brief",
      "downloadUrl": "http://localhost:3000/downloads/skills/solana-research-brief.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-solana-research-brief",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-research-brief",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-research-brief",
        "bun": "bunx @nanosolana/nanohub@latest install solana-research-brief"
      }
    },
    {
      "name": "solanaos",
      "path": "skills/solanaos",
      "fileCount": 1,
      "sizeBytes": 6231,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/solanaos",
      "downloadUrl": "http://localhost:3000/downloads/skills/solanaos.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-solanaos",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solanaos",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solanaos",
        "bun": "bunx @nanosolana/nanohub@latest install solanaos"
      }
    },
    {
      "name": "songsee",
      "path": "skills/songsee",
      "fileCount": 1,
      "sizeBytes": 1314,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/songsee",
      "downloadUrl": "http://localhost:3000/downloads/skills/songsee.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-songsee",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install songsee",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install songsee",
        "bun": "bunx @nanosolana/nanohub@latest install songsee"
      }
    },
    {
      "name": "sonoscli",
      "path": "skills/sonoscli",
      "fileCount": 1,
      "sizeBytes": 2455,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/sonoscli",
      "downloadUrl": "http://localhost:3000/downloads/skills/sonoscli.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-sonoscli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install sonoscli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install sonoscli",
        "bun": "bunx @nanosolana/nanohub@latest install sonoscli"
      }
    },
    {
      "name": "spotify-player",
      "path": "skills/spotify-player",
      "fileCount": 1,
      "sizeBytes": 1686,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/spotify-player",
      "downloadUrl": "http://localhost:3000/downloads/skills/spotify-player.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-spotify-player",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install spotify-player",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install spotify-player",
        "bun": "bunx @nanosolana/nanohub@latest install spotify-player"
      }
    },
    {
      "name": "stripe",
      "path": "skills/stripe",
      "fileCount": 3,
      "sizeBytes": 33599,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/stripe",
      "downloadUrl": "http://localhost:3000/downloads/skills/stripe.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-stripe",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install stripe",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install stripe",
        "bun": "bunx @nanosolana/nanohub@latest install stripe"
      }
    },
    {
      "name": "summarize",
      "path": "skills/summarize",
      "fileCount": 1,
      "sizeBytes": 2232,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/summarize",
      "downloadUrl": "http://localhost:3000/downloads/skills/summarize.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-summarize",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install summarize",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install summarize",
        "bun": "bunx @nanosolana/nanohub@latest install summarize"
      }
    },
    {
      "name": "swarm-orchestrator",
      "path": "skills/swarm-orchestrator",
      "fileCount": 1,
      "sizeBytes": 3629,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/swarm-orchestrator",
      "downloadUrl": "http://localhost:3000/downloads/skills/swarm-orchestrator.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-swarm-orchestrator",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install swarm-orchestrator",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install swarm-orchestrator",
        "bun": "bunx @nanosolana/nanohub@latest install swarm-orchestrator"
      }
    },
    {
      "name": "testing",
      "path": "skills/testing",
      "fileCount": 4,
      "sizeBytes": 11917,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/testing",
      "downloadUrl": "http://localhost:3000/downloads/skills/testing.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-testing",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install testing",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install testing",
        "bun": "bunx @nanosolana/nanohub@latest install testing"
      }
    },
    {
      "name": "things-mac",
      "path": "skills/things-mac",
      "fileCount": 1,
      "sizeBytes": 3555,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/things-mac",
      "downloadUrl": "http://localhost:3000/downloads/skills/things-mac.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-things-mac",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install things-mac",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install things-mac",
        "bun": "bunx @nanosolana/nanohub@latest install things-mac"
      }
    },
    {
      "name": "threat_modeling",
      "path": "skills/threat_modeling",
      "fileCount": 2,
      "sizeBytes": 11886,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/threat_modeling",
      "downloadUrl": "http://localhost:3000/downloads/skills/threat_modeling.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-threat_modeling",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install threat_modeling",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install threat_modeling",
        "bun": "bunx @nanosolana/nanohub@latest install threat_modeling"
      }
    },
    {
      "name": "tmux",
      "path": "skills/tmux",
      "fileCount": 3,
      "sizeBytes": 8599,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/tmux",
      "downloadUrl": "http://localhost:3000/downloads/skills/tmux.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-tmux",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install tmux",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install tmux",
        "bun": "bunx @nanosolana/nanohub@latest install tmux"
      }
    },
    {
      "name": "trello",
      "path": "skills/trello",
      "fileCount": 1,
      "sizeBytes": 2687,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/trello",
      "downloadUrl": "http://localhost:3000/downloads/skills/trello.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-trello",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install trello",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install trello",
        "bun": "bunx @nanosolana/nanohub@latest install trello"
      }
    },
    {
      "name": "validation",
      "path": "skills/validation",
      "fileCount": 2,
      "sizeBytes": 7388,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/validation",
      "downloadUrl": "http://localhost:3000/downloads/skills/validation.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-validation",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install validation",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install validation",
        "bun": "bunx @nanosolana/nanohub@latest install validation"
      }
    },
    {
      "name": "video-frames",
      "path": "skills/video-frames",
      "fileCount": 2,
      "sizeBytes": 2308,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/video-frames",
      "downloadUrl": "http://localhost:3000/downloads/skills/video-frames.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-video-frames",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install video-frames",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install video-frames",
        "bun": "bunx @nanosolana/nanohub@latest install video-frames"
      }
    },
    {
      "name": "voice-call",
      "path": "skills/voice-call",
      "fileCount": 1,
      "sizeBytes": 1159,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/voice-call",
      "downloadUrl": "http://localhost:3000/downloads/skills/voice-call.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-voice-call",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install voice-call",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install voice-call",
        "bun": "bunx @nanosolana/nanohub@latest install voice-call"
      }
    },
    {
      "name": "wacli",
      "path": "skills/wacli",
      "fileCount": 1,
      "sizeBytes": 2385,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/wacli",
      "downloadUrl": "http://localhost:3000/downloads/skills/wacli.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-wacli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install wacli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install wacli",
        "bun": "bunx @nanosolana/nanohub@latest install wacli"
      }
    },
    {
      "name": "weather",
      "path": "skills/weather",
      "fileCount": 1,
      "sizeBytes": 2287,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/weather",
      "downloadUrl": "http://localhost:3000/downloads/skills/weather.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-weather",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install weather",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install weather",
        "bun": "bunx @nanosolana/nanohub@latest install weather"
      }
    },
    {
      "name": "web-search",
      "path": "skills/web-search",
      "fileCount": 2,
      "sizeBytes": 3595,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/web-search",
      "downloadUrl": "http://localhost:3000/downloads/skills/web-search.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-web-search",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install web-search",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install web-search",
        "bun": "bunx @nanosolana/nanohub@latest install web-search"
      }
    },
    {
      "name": "workflows",
      "path": "skills/workflows",
      "fileCount": 2,
      "sizeBytes": 7845,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/workflows",
      "downloadUrl": "http://localhost:3000/downloads/skills/workflows.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-workflows",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install workflows",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install workflows",
        "bun": "bunx @nanosolana/nanohub@latest install workflows"
      }
    },
    {
      "name": "wurk-integration",
      "path": "skills/wurk-integration",
      "fileCount": 1,
      "sizeBytes": 6524,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/wurk-integration",
      "downloadUrl": "http://localhost:3000/downloads/skills/wurk-integration.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-wurk-integration",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install wurk-integration",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install wurk-integration",
        "bun": "bunx @nanosolana/nanohub@latest install wurk-integration"
      }
    },
    {
      "name": "xurl",
      "path": "skills/xurl",
      "fileCount": 1,
      "sizeBytes": 14720,
      "sourceUrl": "https://github.com/x402agent/openclawd/tree/main/skills/xurl",
      "downloadUrl": "http://localhost:3000/downloads/skills/xurl.zip",
      "catalogUrl": "http://localhost:3000/hub#skill-xurl",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install xurl",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install xurl",
        "bun": "bunx @nanosolana/nanohub@latest install xurl"
      }
    }
  ],
  "backend": {
    "recommended": true,
    "summary": "Use web/backend as the public OpenClawd control/API layer. Keep the backend .env private and expose only the built service, not raw secrets.",
    "entries": [
      {
        "name": "main.go",
        "path": "web/backend/main.go",
        "sourceUrl": "https://github.com/x402agent/openclawd/blob/main/web/backend/main.go",
        "role": "HTTP server and dashboard bootstrap"
      },
      {
        "name": "gateway_access.go",
        "path": "web/backend/gateway_access.go",
        "sourceUrl": "https://github.com/x402agent/openclawd/blob/main/web/backend/gateway_access.go",
        "role": "Gateway auth and access wiring"
      },
      {
        "name": "Dockerfile",
        "path": "web/backend/Dockerfile",
        "sourceUrl": "https://github.com/x402agent/openclawd/blob/main/web/backend/Dockerfile",
        "role": "Container entrypoint for deploys"
      }
    ]
  }
} as const
