import { Base64UrlTool } from "./dev-tools/base64-url"
import { CommitGenerator } from "./dev-tools/commit-generator"
import { DiffCheckerTool } from "./dev-tools/diff-checker"
import { HashGenerator } from "./dev-tools/hash-generator"
import { JsonFormatterValidator } from "./dev-tools/json-formatter-validator"
import { JwtDebuggerTool } from "./dev-tools/jwt-debugger"
import { MarkdownPreview } from "./dev-tools/markdown-preview"
import { PlaceholderTool } from "./dev-tools/placeholder-tool"
import { RegexTesterTool } from "./dev-tools/regex-tester"

interface ToolViewProps {
  toolId: string
}

export function ToolView({ toolId }: ToolViewProps) {
  switch (toolId) {
    case "diff-checker":
      return <DiffCheckerTool />
    case "base64-url":
      return <Base64UrlTool />
    case "json-formatter-validator":
      return <JsonFormatterValidator />
    case "commit-generator":
      return <CommitGenerator />
    case "jwt-debugger":
      return <JwtDebuggerTool />
    case "regex-tester":
      return <RegexTesterTool />
    case "markdown-preview":
      return <MarkdownPreview />
    case "hash-generator":
      return <HashGenerator />
    // Add new tools here as you build them out
    default:
      return <PlaceholderTool toolId={toolId} />
  }
}