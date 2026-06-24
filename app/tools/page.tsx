import { Container } from "@/components/shared/container"
import { PageHeading } from "@/components/shared/page-heading"

const ToolsPage = () => {
  return (
    <main className="min-h-screen bg-black py-10">
      <Container>
        <PageHeading 
          link="/"
          title="Tools"
          description="A collection of AI-powered tools to simplify your GitHub workflow."
        />
      </Container>
    </main>
  )
}

export default ToolsPage