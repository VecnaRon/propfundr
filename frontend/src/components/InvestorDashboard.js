"use client"

import { useEffect } from "react"
import {
  Box,
  Flex,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useBreakpointValue,
  useDisclosure,
  Container,
} from "@chakra-ui/react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import PortfolioOverview from "./PortfolioOverview"
import InvestmentPerformance from "./InvestmentPerformance"
import ProjectsEndingSoonInvestor from "./ProjectsEndingSoonInvestor"

const InvestorDashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, lg: false })

  // Background colors
  const bgMain = useColorModeValue("gray.50", "gray.900")

  // Set initial sidebar state based on screen size
  useEffect(() => {
    if (!isMobile) onOpen()
  }, [isMobile, onOpen])

  return (
    <Box minH="100vh" bg={bgMain}>
      {/* Header */}
      <Header onToggleSidebar={isMobile ? onOpen : undefined} isSidebarOpen={isOpen} />

      {/* Main Content Area with Sidebar */}
      <Flex h="calc(100vh - 80px)" position="relative" pt="80px">
        {/* Desktop Sidebar */}
        <Box
          display={{ base: "none", lg: "block" }}
          w={isOpen ? "280px" : "80px"}
          transition="width 0.3s ease"
          position="fixed"
          h="calc(100vh - 80px)"
          top="80px"
          left="0"
          zIndex="10"
        >
          <Sidebar isOpen={isOpen} onToggle={onClose} />
        </Box>

        {/* Mobile Sidebar (Drawer) */}
        <Drawer
          autoFocus={false}
          isOpen={isMobile && isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="xs"
        >
          <DrawerContent maxW="280px">
            <Sidebar isOpen={true} onToggle={onClose} isMobile={true} />
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box
          ml={{ base: 0, lg: isOpen ? "280px" : "80px" }}
          transition="margin-left 0.3s ease"
          w="full"
          h="calc(100vh - 80px)"
          overflowY="auto"
          px={{ base: 3, md: 6 }}
          py={6}
        >
          <Container maxW="1600px" px={0}>
            <Flex direction="column" gap={6}>
              {/* Portfolio Overview Section */}
              <PortfolioOverview />

              {/* Projects Ending Soon Section */}
              <ProjectsEndingSoonInvestor />

              {/* Investment Performance Section */}
              <InvestmentPerformance />
            </Flex>
          </Container>
        </Box>
      </Flex>
    </Box>
  )
}

export default InvestorDashboard
