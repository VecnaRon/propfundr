import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Divider,
  Icon,
  Badge,
  useColorModeValue,
  useBreakpointValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react"
import { FaUser, FaProjectDiagram, FaWallet, FaRegClock, FaCheckCircle, FaArrowDown } from "react-icons/fa"

const WorkingDetails = () => {
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.300")
  const accentColor = useColorModeValue("teal.500", "teal.300")
  const borderColor = useColorModeValue("teal.100", "teal.800")
  const timelineColor = useColorModeValue("teal.100", "teal.800")
  const shadowColor = useColorModeValue("rgba(0, 0, 0, 0.05)", "rgba(0, 0, 0, 0.3)")

  // Responsive design
  const isDesktop = useBreakpointValue({ base: false, md: true })
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" })
  const phaseHeadingSize = useBreakpointValue({ base: "md", md: "lg" })

  const phases = [
    {
      title: "Join the Platform",
      icon: FaUser,
      roles: [
        { name: "Investor", color: "blue" },
        { name: "Owner", color: "purple" },
      ],
      description: "Users register and log in to PropFundr. Each role has a unique dashboard and capabilities.",
    },
    {
      title: "Property Listing",
      icon: FaProjectDiagram,
      roles: [{ name: "Owner", color: "purple" }],
      description:
        "Owners list properties for funding. Each opportunity has a funding goal and closing date. Admins review and approve listings before they go live. Owners visit Properties management, they list there properties and also in this page they have the ability to edit property details over time.",
    },
    {
      title: "Investments",
      icon: FaWallet,
      roles: [{ name: "Investor", color: "blue" }],
      description:
        "Investors view open opportunities and invest. Investments are stored in escrow until the goal is met. If the goal is not met before the closing date, the project is marked Failed and full refunds are issued.",
    },
    {
      title: "Fully Funded Project",
      icon: FaCheckCircle,
      roles: [
        { name: "Owner", color: "purple" },
        { name: "Investor", color: "blue" },
      ],
      description:
        "Once funding goal is met before the deadline, the project is marked Funded. Escrowed Funds are released to the owner and the project officially begins. Owners track project progress via their dashboard. Owner keeps posting updates and milestones about project progress until completion.",
    },
    {
      title: "Project Nearing Completion",
      icon: FaRegClock,
      roles: [],
      description:
        "14 days before a project's endDate, widgets notify owners, investors and admins. Owners are reminded to prepare and submit return earnings for approval.",
    },
    {
      title: "Returns Payout",
      icon: FaWallet,
      roles: [
        { name: "Admin", color: "red" },
        { name: "Investor", color: "blue" },
      ],
      description:
        "Admins manually approve and process payouts after verifying return earnings. Investors receive: Paid if full returns are available, Partially Paid if only partial returns, Refunded if project yielded no returns.",
    },
    {
      title: "Project Completion",
      icon: FaCheckCircle,
      roles: [],
      description:
        "After all payouts are successfully processed, the project is officially marked as Completed. Admins and owners are notified, and project records are archived for transparency.",
    },
  ]

  // Desktop timeline view
  const DesktopTimeline = () => (
    <VStack spacing={0} align="stretch" position="relative">
      {phases.map((phase, index) => (
        <Box key={index} position="relative">
          {/* Timeline connector */}
          {index < phases.length - 1 && (
            <Box position="absolute" left="40px" top="80px" bottom="-40px" width="4px" bg={timelineColor} zIndex={0} />
          )}

          <Flex mb={8}>
            {/* Phase number and icon */}
            <Flex flexDirection="column" alignItems="center" mr={6} position="relative" zIndex={1}>
              <Flex
                w="80px"
                h="80px"
                borderRadius="full"
                bg={accentColor}
                color="white"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                boxShadow={`0 4px 20px ${shadowColor}`}
              >
                <Icon as={phase.icon} boxSize={6} mb={1} />
                <Text fontWeight="bold">{index + 1}</Text>
              </Flex>

              {index < phases.length - 1 && (
                <Icon as={FaArrowDown} color={accentColor} boxSize={6} mt={4} position="absolute" top="90px" />
              )}
            </Flex>

            {/* Phase content */}
            <Box
              flex={1}
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderLeft="4px solid"
              borderColor={accentColor}
              boxShadow={`0 4px 20px ${shadowColor}`}
              transition="transform 0.3s"
              _hover={{ transform: "translateY(-5px)" }}
            >
              <Heading size={phaseHeadingSize} mb={3} color={accentColor}>
                Phase {index + 1}: {phase.title}
              </Heading>

              {phase.roles.length > 0 && (
                <HStack spacing={2} mb={3}>
                  <Text fontWeight="medium">Roles:</Text>
                  {phase.roles.map((role, roleIndex) => (
                    <Badge key={roleIndex} colorScheme={role.color} fontSize="sm" px={2} py={1} borderRadius="md">
                      {role.name}
                    </Badge>
                  ))}
                </HStack>
              )}

              <Text color={textColor}>{phase.description}</Text>
            </Box>
          </Flex>
        </Box>
      ))}
    </VStack>
  )

  // Mobile accordion view
  const MobileAccordion = () => (
    <Accordion allowToggle defaultIndex={[0]}>
      {phases.map((phase, index) => (
        <AccordionItem
          key={index}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          mb={4}
          overflow="hidden"
        >
          <AccordionButton py={4} bg={accentColor} color="white" _hover={{ bg: "teal.600" }}>
            <HStack flex="1" textAlign="left">
              <Flex
                w="36px"
                h="36px"
                borderRadius="full"
                bg="whiteAlpha.300"
                alignItems="center"
                justifyContent="center"
                mr={3}
              >
                <Text fontWeight="bold">{index + 1}</Text>
              </Flex>
              <Icon as={phase.icon} mr={2} />
              <Heading size="sm">
                Phase {index + 1}: {phase.title}
              </Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel pb={4} bg={cardBg}>
            {phase.roles.length > 0 && (
              <HStack spacing={2} mb={3} flexWrap="wrap">
                <Text fontWeight="medium">Roles:</Text>
                {phase.roles.map((role, roleIndex) => (
                  <Badge key={roleIndex} colorScheme={role.color} fontSize="sm" px={2} py={1} borderRadius="md">
                    {role.name}
                  </Badge>
                ))}
              </HStack>
            )}

            <Text color={textColor}>{phase.description}</Text>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )

  return (
    <Box py={10} bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading
              size={headingSize}
              mb={4}
              color={accentColor}
              bgGradient={useColorModeValue("linear(to-r, teal.400, teal.600)", "linear(to-r, teal.200, teal.400)")}
              bgClip="text"
            >
              How PropFundr Works
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="3xl" mx="auto">
              Our streamlined process makes real estate investing simple and transparent
            </Text>
          </Box>

          {isDesktop ? <DesktopTimeline /> : <MobileAccordion />}

          <Divider my={8} />

          <Box textAlign="center">
            <Text fontSize="sm" color="gray.500">
              PropFundr™ – Powering Property Investment Through Technology
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default WorkingDetails
