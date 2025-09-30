import Headerhome from "./Headerhome"
import Hero from "./Hero"
import Stats from "./Stats"
import Features from "./Features"
import HowItWorks from "./HowItWorks"
import Properties from "./Properties"
import InvestorOwnerTabs from "./InvestorOwnerTabs"
import Testimonials from "./Testimonials"
import CallToAction from "./CallToAction"
import Footer from "./Footer"
import { Box } from "@chakra-ui/react"

function HomePage() {
  return (
    <Box overflowX="hidden" width="100%">
      <Headerhome />
      <Box as="main">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Properties />
        <InvestorOwnerTabs />
        <Testimonials />
        <CallToAction />
        <Footer />
      </Box>
    </Box>
  )
}

export default HomePage

