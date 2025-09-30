"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Link as ChakraLink,
  UnorderedList,
  ListItem,
  Flex,
  Icon,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FaGraduationCap,
  FaChartLine,
  FaMoneyBillWave,
  FaShieldAlt,
  FaRegLightbulb,
  FaArrowRight,
  FaExternalLinkAlt,
} from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionVStack = motion(VStack)
const MotionSimpleGrid = motion(SimpleGrid)

export default function InvestorEducation() {
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  return (
    <Box bg="gray.900" minH="100vh" overflowX="hidden">
      {/* Hero Section */}
      <Box position="relative" overflow="hidden" py={{ base: 16, md: 24 }}>
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial(circle at 30% 30%, rgba(110, 65, 226, 0.15), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="1200px" position="relative" zIndex="1">
          <MotionFlex
            direction="column"
            align="center"
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
              mb={4}
            >
              Investor Education
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mb={8} lineHeight="tall">
              Empower yourself with knowledge about real estate investing. Learn the fundamentals, strategies, and best
              practices to make informed investment decisions.
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Introduction Section */}
      <Box py={{ base: 8, md: 16 }}>
        <Container maxW="1200px">
          <MotionSimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={10}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionBox>
              <Heading size="lg" color="teal.400" mb={4}>
                Introduction to PropFundr
              </Heading>
              <Text color="gray.300" fontSize="md" lineHeight="tall">
                PropFundr is a real estate crowdfunding platform that allows individuals to invest in real estate
                projects and properties. Our platform democratizes real estate investing by making it more accessible to
                a larger audience. We offer various investment opportunities in commercial and residential real estate
                projects, providing investors with the chance to diversify their portfolios.
              </Text>
              <Text color="gray.300" fontSize="md" lineHeight="tall" mt={4}>
                With PropFundr, you can start investing with as little as $1,000, making real estate investment
                accessible to more people than ever before. Our platform is designed to be user-friendly, transparent,
                and secure, ensuring that you have all the information you need to make informed investment decisions.
              </Text>
            </MotionBox>

            <MotionBox
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Flex
                w={16}
                h={16}
                align="center"
                justify="center"
                rounded="full"
                bg="rgba(110, 65, 226, 0.2)"
                color="brand.500"
                mb={5}
              >
                <Icon as={FaGraduationCap} boxSize={8} />
              </Flex>
              <Heading size="md" color="white" mb={4}>
                Key Features for Investors
              </Heading>
              <UnorderedList spacing={3} color="gray.300" pl={4}>
                <ListItem>Browse various investment opportunities</ListItem>
                <ListItem>Track your portfolio and returns</ListItem>
                <ListItem>Participate in the funding of real estate projects</ListItem>
                <ListItem>Receive regular project updates</ListItem>
                <ListItem>Access to financial reports and detailed investment breakdowns</ListItem>
              </UnorderedList>
            </MotionBox>
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* Investment Process */}
      <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(to-br, rgba(110, 65, 226, 0.05), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="1200px" position="relative" zIndex="1">
          <MotionVStack
            spacing={8}
            align="center"
            mb={12}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="white" textAlign="center">
              Investment Process Explained
            </MotionHeading>
            <MotionText color="gray.300" fontSize="lg" textAlign="center" maxW="800px">
              The investment process on PropFundr is simple and straightforward. Here's a breakdown of the steps:
            </MotionText>
          </MotionVStack>

          <MotionSimpleGrid
            columns={{ base: 1, md: 2, lg: 5 }}
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Create an account and complete KYC verification",
                color: "brand.500",
              },
              {
                step: "2",
                title: "Browse",
                description: "Explore available investment opportunities",
                color: "teal.400",
              },
              {
                step: "3",
                title: "Choose",
                description: "Select a project and your investment amount (min. $1000)",
                color: "purple.400",
              },
              {
                step: "4",
                title: "Fund",
                description: "Complete your investment through our secure payment gateway",
                color: "cyan.400",
              },
              {
                step: "5",
                title: "Monitor",
                description: "Track project updates and investment performance",
                color: "orange.400",
              },
            ].map((step, index) => (
              <MotionBox
                key={index}
                bg="gray.700"
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
                textAlign="center"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: step.color,
                      transition: "all 0.3s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg={step.color}
                  color="white"
                  mx="auto"
                  mb={4}
                  fontWeight="bold"
                  fontSize="xl"
                >
                  {step.step}
                </Flex>
                <Heading size="md" color="white" mb={2}>
                  {step.title}
                </Heading>
                <Text color="gray.300" fontSize="sm">
                  {step.description}
                </Text>
              </MotionBox>
            ))}
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* Investment Risks & Tips */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="1200px">
          <MotionSimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={10}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Investment Risks */}
            <MotionBox
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Flex
                w={16}
                h={16}
                align="center"
                justify="center"
                rounded="full"
                bg="rgba(229, 62, 62, 0.2)"
                color="red.400"
                mb={5}
              >
                <Icon as={FaShieldAlt} boxSize={8} />
              </Flex>
              <Heading size="lg" color="white" mb={4}>
                Investment Risks
              </Heading>
              <Text color="gray.300" fontSize="md" lineHeight="tall" mb={6}>
                While investing in real estate offers the potential for high returns, it's important to understand the
                risks involved. These risks may include market fluctuations, project delays, and unforeseen costs.
                Always conduct your due diligence before investing in any project.
              </Text>
              <UnorderedList spacing={3} color="gray.300" pl={4}>
                <ListItem>Market volatility and economic downturns</ListItem>
                <ListItem>Property value depreciation</ListItem>
                <ListItem>Project delays or complications</ListItem>
                <ListItem>Regulatory and legal changes</ListItem>
                <ListItem>Liquidity constraints (investments are typically locked for a period)</ListItem>
              </UnorderedList>
            </MotionBox>

            {/* Investment Tips */}
            <MotionBox
              bg="gray.800"
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Flex
                w={16}
                h={16}
                align="center"
                justify="center"
                rounded="full"
                bg="rgba(56, 178, 172, 0.2)"
                color="teal.400"
                mb={5}
              >
                <Icon as={FaRegLightbulb} boxSize={8} />
              </Flex>
              <Heading size="lg" color="white" mb={4}>
                Tips for Successful Investing
              </Heading>
              <Text color="gray.300" fontSize="md" lineHeight="tall" mb={6}>
                To maximize your investment success, here are some valuable tips to consider:
              </Text>
              <UnorderedList spacing={3} color="gray.300" pl={4}>
                <ListItem>Start with smaller investments to diversify risk</ListItem>
                <ListItem>Do your research on the real estate market and projects</ListItem>
                <ListItem>Invest in different types of properties to spread risk</ListItem>
                <ListItem>Monitor your portfolio regularly and track returns</ListItem>
                <ListItem>Consult with a financial advisor if necessary</ListItem>
                <ListItem>Be patient - real estate is typically a long-term investment</ListItem>
                <ListItem>Stay informed about market trends and economic indicators</ListItem>
              </UnorderedList>
            </MotionBox>
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial(circle at 70% 30%, rgba(25, 182, 155, 0.1), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="900px" position="relative" zIndex="1">
          <MotionVStack
            spacing={8}
            align="center"
            mb={12}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="white" textAlign="center">
              Frequently Asked Questions
            </MotionHeading>
            <MotionText color="gray.300" fontSize="lg" textAlign="center" maxW="800px">
              Here are some common questions asked by investors:
            </MotionText>
          </MotionVStack>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion allowToggle>
              {[
                {
                  question: "How do I get paid from my investments?",
                  answer:
                    "You will receive payout returns based on the project's outcome when the project comes to an end. Returns are distributed according to your investment share in the project.",
                },
                {
                  question: "How can I track my investments?",
                  answer:
                    "PropFundr provides a dashboard where you can track your active investments, projected returns, and updates from the project owners. You'll receive regular notifications about important milestones and developments.",
                },
                {
                  question: "Is my investment secure?",
                  answer:
                    "While all investments carry risk, we ensure the projects are vetted, and regular updates are provided to investors. Refunds are made in case of failure of a project. We implement strict security measures to protect your investment data and transactions.",
                },
                {
                  question: "When is a project considered as failed?",
                  answer:
                    "A project is considered as failed when it doesn't meet funding goal when closing date of the investment phase reaches. This results in refund of invested money by the platform. We have a thorough review process to minimize the risk of project failure.",
                },
                {
                  question: "How do I earn Rental Income?",
                  answer:
                    "Property Owners post Rental Income Monthly for projects that support Renting which will be approved and distributed to investors according to their share in the project. This creates a passive income stream for investors in rental properties.",
                },
              ].map((faq, index) => (
                <AccordionItem key={index} border="none" mb={4} bg="gray.700" borderRadius="lg" overflow="hidden">
                  <h2>
                    <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                      <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                        {faq.question}
                      </Box>
                      <AccordionIcon color="brand.500" />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} px={6} color="gray.300">
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </MotionBox>

          <MotionFlex
            justify="center"
            mt={10}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              as={Link}
              to="/faq"
              colorScheme="brand"
              variant="outline"
              size="lg"
              rightIcon={<FaArrowRight />}
              borderRadius="full"
              px={8}
              py={6}
              _hover={{ bg: "whiteAlpha.100" }}
            >
              View All FAQs
            </Button>
          </MotionFlex>
        </Container>
      </Box>

      {/* Resources Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="1200px">
          <MotionVStack
            spacing={8}
            align="center"
            mb={12}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="white" textAlign="center">
              Resources & Additional Learning Materials
            </MotionHeading>
            <MotionText color="gray.300" fontSize="lg" textAlign="center" maxW="800px">
              To further enhance your knowledge and skills, we have curated a selection of resources for you to explore.
            </MotionText>
          </MotionVStack>

          <MotionSimpleGrid
            columns={cardColumns}
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              {
                title: "Real Estate Investing Basics",
                source: "Investopedia",
                url: "https://www.investopedia.com/real-estate-4427673",
                description: "Comprehensive guide to real estate investment fundamentals, strategies, and terminology.",
                color: "brand.500",
                icon: FaGraduationCap,
              },
              {
                title: "Forbes Real Estate Investment Guide",
                source: "Forbes",
                url: "https://www.forbes.com/real-estate-investing/",
                description: "Expert insights and analysis on real estate market trends and investment opportunities.",
                color: "teal.400",
                icon: FaChartLine,
              },
              {
                title: "CrowdStreet Learning Hub",
                source: "CrowdStreet",
                url: "https://www.crowdstreet.com/learn",
                description:
                  "Educational resources specifically focused on real estate crowdfunding and investment strategies.",
                color: "purple.400",
                icon: FaMoneyBillWave,
              },
            ].map((resource, index) => (
              <MotionBox
                key={index}
                bg="gray.800"
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: resource.color,
                  transition: "all 0.3s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg={`${resource.color}20`}
                  color={resource.color}
                  mb={4}
                >
                  <Icon as={resource.icon} boxSize={6} />
                </Flex>
                <Heading size="md" color="white" mb={2}>
                  {resource.title}
                </Heading>
                <Text color="gray.400" fontSize="sm" mb={1}>
                  Source: {resource.source}
                </Text>
                <Text color="gray.300" fontSize="sm" mb={4}>
                  {resource.description}
                </Text>
                <ChakraLink
                  href={resource.url}
                  isExternal
                  color={resource.color}
                  fontWeight="medium"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                >
                  Visit Resource <Icon as={FaExternalLinkAlt} ml={2} boxSize={3} />
                </ChakraLink>
              </MotionBox>
            ))}
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(135deg, rgba(110, 65, 226, 0.1), rgba(25, 182, 155, 0.1))"
          zIndex="0"
        />

        <Container maxW="900px" position="relative" zIndex="1" textAlign="center">
          <MotionVStack
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
            >
              Ready to Start Investing?
            </MotionHeading>
            <MotionText color="gray.300" fontSize={{ base: "md", md: "lg" }} maxW="700px" mx="auto" lineHeight="tall">
              Now that you're equipped with knowledge about real estate investing, it's time to put it into action. Join
              PropFundr today and start building your real estate portfolio.
            </MotionText>

            <MotionFlex
              justify="center"
              mt={4}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/register">
                <Button
                  rounded="full"
                  px={8}
                  py={7}
                  colorScheme="brand"
                  bg="brand.500"
                  _hover={{ bg: "brand.400", transform: "translateY(-2px)" }}
                  size="lg"
                  fontSize="md"
                  fontWeight="bold"
                  transition="all 0.3s"
                  boxShadow="0 4px 20px rgba(110, 65, 226, 0.4)"
                  rightIcon={<Icon as={FaArrowRight} ml={2} />}
                >
                  Start Investing Now
                </Button>
              </Link>
            </MotionFlex>
          </MotionVStack>
        </Container>
      </Box>
    </Box>
  )
}
