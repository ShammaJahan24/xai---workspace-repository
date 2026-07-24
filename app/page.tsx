import ThemeProvider from '@/components/theme/ThemeProvider'
import Navbar from '@/components/layout/Navbar'
import ScrollProgress from '@/components/layout/ScrollProgress'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import HeroSection from '@/sections/HeroSection'
import InsightFlow from '@/sections/InsightFlow'
import DashboardPreview from '@/sections/DashboardPreview'
import SignatureInteraction from '@/sections/SignatureInteraction'
import Footer from '@/components/layout/Footer'
import { SECTIONS } from '@/lib/constants'

export default function Home() {
  return (
    <ThemeProvider>
      <ScrollProgress />
      <Navbar />
      <main className="relative">
        <HeroSection />
        <InsightFlow />
        <DashboardPreview />

        {/* Signature interaction — the Motion Lab */}
        <section
          id={SECTIONS.lab}
          className="relative border-t border-slate-200/40 py-24 text-slate-900 dark:border-zinc-800/40 dark:text-zinc-100"
        >
          <Container>
            <SectionHeading
              eyebrow="Motion Lab"
              align="center"
              title="Design the timing, feel the motion."
              description="Interaction isn't just where things go — it's how they get there. Drag the easing curve and watch a real screen transition play back with your exact timing, live."
            />
          </Container>
          <div className="mt-10">
            <SignatureInteraction />
          </div>
        </section>

        <Footer />
      </main>
    </ThemeProvider>
  )
}
