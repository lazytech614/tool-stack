import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PageHeading } from "@/components/shared/page-heading";
import { ALL_TOOLS } from "@/constants/tools";
import { ToolView } from "@/components/tools/tool-view";

interface ToolPageProps {
  params: Promise<{
    toolId: string;
  }>;
}

export default async function ToolPage({
  params,
}: ToolPageProps) {
  const { toolId } = await params;

  const tool = ALL_TOOLS.find(
    (t) => t.id === toolId
  );

  if (!tool) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black py-10">
      <Container>
        <PageHeading
          title={tool.name}
          description={tool.description}
        />

        <div className="mt-10">
          <ToolView toolId={tool.id} />
        </div>
      </Container>
    </main>
  );
}