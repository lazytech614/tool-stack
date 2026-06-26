import { Base64UrlTool } from "./dev-tools/encoding/base64-url"
import { BinaryConverter } from "./dev-tools/encoding/binary-converter"
import ClipboardManager from "./dev-tools/utilities/clipboard-manager"
import { ColorConverter } from "./dev-tools/converter/color-converter"
import { CommitGenerator } from "./dev-tools/generator/commit-generator"
import { DiffCheckerTool } from "./dev-tools/comparison/diff-checker"
import { HashGenerator } from "./dev-tools/generator/hash-generator"
import { ImageConverter } from "./dev-tools/converter/image-converter"
import { JsonFormatterValidator } from "./dev-tools/formatting/json-formatter-validator"
import { JsonToSchema } from "./dev-tools/generator/json-to-schema"
import { JwtDebuggerTool } from "./dev-tools/utilities/jwt-debugger"
import { LoremIpsum } from "./dev-tools/generator/loremipsum"
import { MarkdownPreview } from "./dev-tools/preview/markdown-preview"
import { MarkdownTable } from "./dev-tools/generator/markdown-table"
import { NumberBaseConverter } from "./dev-tools/converter/number-base-converter"
import { PlaceholderTool } from "./dev-tools/placeholder-tool"
import { RegexTesterTool } from "./dev-tools/utilities/regex-tester"
import { SqlFormatter } from "./dev-tools/formatting/sql-formatter"
import { UnixTimestampConverter } from "./dev-tools/converter/timestamp-converter"
import { UuidGenerator } from "./dev-tools/generator/uuid-generator"

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
    case "uuid-generator":
      return <UuidGenerator />
    case "binary-converter":
      return <BinaryConverter />
    case "sql-formatter":
      return <SqlFormatter />
    case "markdown-table":
      return <MarkdownTable />
    case "lorem-ipsum":
      return <LoremIpsum />
    case "json-to-schema":
      return <JsonToSchema />
    case "color-converter":
      return <ColorConverter />
    case "unix-timestamp":
      return <UnixTimestampConverter />
    case "number-base-converter":
      return <NumberBaseConverter />
    case "image-converter":
      return <ImageConverter />
    case "clipboard-manager":
      return <ClipboardManager />
    // Add new tools here as you build them out
    default:
      return <PlaceholderTool toolId={toolId} />
  }
}