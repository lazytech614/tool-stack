import { Base64UrlTool } from "./dev-tools/base64-url"
import { CommitGenerator } from "./dev-tools/commit-generator"
import { DiffCheckerTool } from "./dev-tools/diff-checker"
import { JsonFormatterTool } from "./dev-tools/json-formatter"
import { PlaceholderTool } from "./dev-tools/placeholder-tool"

interface ToolViewProps {
  toolId: string
}

export function ToolView({ toolId }: ToolViewProps) {
  switch (toolId) {
    case "diff-checker":
      return <DiffCheckerTool />
    case "base64-url":
      return <Base64UrlTool />
    case "json-formatter":
      return <JsonFormatterTool />
    case "commit-generator":
      return <CommitGenerator />
    // Add new tools here as you build them out
    default:
      return <PlaceholderTool toolId={toolId} />
  }
}