"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  Button,
  Link as ChakraLink,
  UnorderedList,
  ListItem,
  Flex,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FaChartLine,
  FaGlobeAmericas,
  FaEuroSign,
  FaMapMarkedAlt,
  FaBuilding,
  FaCity,
  FaArrowRight,
  FaExternalLinkAlt,
  FaChartBar,
  FaChartPie,
  FaChartArea,
  FaRegLightbulb,
} from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionVStack = motion(VStack)
const MotionSimpleGrid = motion(SimpleGrid)
const MotionStat = motion(Stat)

export default function MarketInsights() {
  const cardColumns = useBreakpointValue({ base: 1, md: 2 })
  const statColumns = useBreakpointValue({ base: 1, sm: 2, md: 4 })

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
              Market Insights
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mb={8} lineHeight="tall">
              Stay informed with the latest trends, analysis, and opportunities in the real estate market. Our expert
              insights help you make data-driven investment decisions.
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Market Stats Section */}
      <Box py={{ base: 8, md: 16 }}>
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
              Current Market Snapshot
            </MotionHeading>
            <MotionText color="gray.300" fontSize="lg" textAlign="center" maxW="800px">
              Key metrics and trends in the real estate market as of May 2025
            </MotionText>
          </MotionVStack>

          <MotionSimpleGrid
            columns={statColumns}
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              {
                label: "Average ROI",
                value: "12.4%",
                change: "+2.1%",
                isIncrease: true,
                icon: FaChartLine,
                color: "brand.500",
              },
              {
                label: "Property Value Growth",
                value: "8.7%",
                change: "+1.3%",
                isIncrease: true,
                icon: FaChartBar,
                color: "teal.400",
              },
              {
                label: "Rental Yield",
                value: "5.9%",
                change: "-0.2%",
                isIncrease: false,
                icon: FaChartPie,
                color: "purple.400",
              },
              {
                label: "Investment Volume",
                value: "$4.2B",
                change: "+15.3%",
                isIncrease: true,
                icon: FaChartArea,
                color: "cyan.400",
              },
            ].map((stat, index) => (
              <MotionStat
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
                  borderColor: stat.color,
                   transition:"all 0.3s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Flex align="center" mb={3}>
                  <Flex
                    w={10}
                    h={10}
                    align="center"
                    justify="center"
                    rounded="full"
                    bg={`${stat.color}20`}
                    color={stat.color}
                    mr={3}
                  >
                    <Icon as={stat.icon} boxSize={5} />
                  </Flex>
                  <StatLabel color="gray.300" fontSize="sm">
                    {stat.label}
                  </StatLabel>
                </Flex>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {stat.value}
                </StatNumber>
                <StatHelpText color={stat.isIncrease ? "green.400" : "red.400"}>
                  <StatArrow type={stat.isIncrease ? "increase" : "decrease"} />
                  {stat.change} from last year
                </StatHelpText>
              </MotionStat>
            ))}
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* Market Overview */}
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
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="lg" color="white" mb={6}>
              Overview of the Real Estate Market
            </Heading>
            <Text color="gray.300" fontSize="md" lineHeight="tall" mb={8}>
              The global real estate market has experienced rapid growth in the last decade, driven by both domestic and
              international investment. Real estate has traditionally been a stable and lucrative investment, especially
              in emerging markets and urban growth hubs. PropFundr brings you the latest insights and market trends to
              help you make informed investment decisions.
            </Text>

            <Heading size="md" color="teal.400" mb={4}>
              Current Market Trends
            </Heading>
            <MotionSimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={6}
              mb={10}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {[
                {
                  trend: "Remote Work Impact",
                  description:
                    "Increase in remote working leading to demand for suburban homes with more space and home offices.",
                  icon: FaBuilding,
                },
                {
                  trend: "Sustainable Development",
                  description:
                    "Rise of sustainable and energy-efficient real estate developments as environmental concerns grow.",
                  icon: FaCity,
                },
                {
                  trend: "Technology Integration",
                  description:
                    "Technological advancements, including AI and VR in property management and viewing experiences.",
                  icon: FaRegLightbulb,
                },
                {
                  trend: "Fractional Ownership",
                  description:
                    "Growing interest in fractional ownership and real estate crowdfunding platforms like PropFundr.",
                  icon: FaChartPie,
                },
              ].map((item, index) => (
                <MotionBox
                  key={index}
                  bg="gray.700"
                  p={5}
                  borderRadius="lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={item.icon} color="brand.500" boxSize={5} mr={3} />
                    <Text fontWeight="bold" color="white">
                      {item.trend}
                    </Text>
                  </Flex>
                  <Text color="gray.300" fontSize="sm">
                    {item.description}
                  </Text>
                </MotionBox>
              ))}
            </MotionSimpleGrid>
          </MotionBox>
        </Container>
      </Box>

      {/* Regional Insights */}
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
              Investment Opportunities by Region
            </MotionHeading>
            <MotionText color="gray.300" fontSize="lg" textAlign="center" maxW="800px">
              Certain regions offer more promising real estate investment opportunities due to population growth,
              urbanization, and economic development. Here are some of the top regions to keep an eye on for investment.
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
                title: "North America",
                description:
                  "North America remains a top choice for real estate investment, with stable markets and high demand in both commercial and residential sectors.",
                icon: FaGlobeAmericas,
                color: "brand.500",
                growth: "+7.2%",
                hotspots: ["Austin", "Miami", "Toronto"],
              },
              {
                title: "Europe",
                description:
                  "Europe's real estate market offers significant growth potential, particularly in tech hubs and cities with strong tourism sectors.",
                icon: FaEuroSign,
                color: "teal.400",
                growth: "+5.8%",
                hotspots: ["Berlin", "Lisbon", "Stockholm"],
              },
              {
                title: "Asia-Pacific",
                description:
                  "The Asia-Pacific region has seen a boom in real estate, driven by rapid urbanization and growing middle-class populations.",
                icon: FaMapMarkedAlt,
                color: "purple.400",
                growth: "+9.3%",
                hotspots: ["Singapore", "Sydney", "Tokyo"],
              },
              {
                title: "Middle East",
                description:
                  "The Middle East is becoming a prime destination for real estate investment, particularly in cities like Dubai and Abu Dhabi.",
                icon: FaBuilding,
                color: "cyan.400",
                growth: "+6.5%",
                hotspots: ["Dubai", "Abu Dhabi", "Doha"],
              },
            ].map((region, index) => (
              <MotionBox
                key={index}
                bg="gray.800"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
           
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: region.color,
                  transition: "all 0.3s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Box p={6}>
                  <Flex align="center" mb={4}>
                    <Flex
                      w={12}
                      h={12}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg={`${region.color}20`}
                      color={region.color}
                      mr={4}
                    >
                      <Icon as={region.icon} boxSize={6} />
                    </Flex>
                    <Box>
                      <Heading size="md" color="white">
                        {region.title}
                      </Heading>
                      <Text color="green.400" fontSize="sm" fontWeight="medium">
                        YoY Growth: {region.growth}
                      </Text>
                    </Box>
                  </Flex>

                  <Text color="gray.300" fontSize="md" mb={4}>
                    {region.description}
                  </Text>

                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={2}>
                      Investment Hotspots:
                    </Text>
                    <Flex wrap="wrap" gap={2}>
                      {region.hotspots.map((city, cityIndex) => (
                        <Box
                          key={cityIndex}
                          bg={`${region.color}20`}
                          color={region.color}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          {city}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* Reports & Analytics */}
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

        <Container maxW="1200px" position="relative" zIndex="1">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="lg" color="white" mb={6}>
              Real Estate Analytics and Reports
            </Heading>
            <Text color="gray.300" fontSize="md" lineHeight="tall" mb={8}>
              PropFundr provides access to data and analytics that can help you understand the performance of your
              investments and the broader market trends. Stay informed with the latest reports and insights from trusted
              sources.
            </Text>

            <Heading size="md" color="teal.400" mb={4}>
              Latest Market Reports
            </Heading>
            <MotionSimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
              mb={10}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {[
                {
                  title: "Realtor.com Market Trends",
                  description: "Comprehensive data on housing market trends, inventory, and price changes.",
                  url: "https://www.realtor.com/research/",
                  color: "brand.500",
                },
                {
                  title: "Zillow Research Reports",
                  description: "In-depth analysis of housing market dynamics and future projections.",
                  url: "https://www.zillow.com/research/",
                  color: "teal.400",
                },
                {
                  title: "National Association of Realtors",
                  description: "Authoritative research on real estate market conditions and economic indicators.",
                  url: "https://www.nar.realtor/research-and-statistics",
                  color: "purple.400",
                },
              ].map((report, index) => (
                <MotionBox
                  key={index}
                  bg="gray.700"
                  p={5}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "lg",
                    borderColor: report.color,
                    transition: "all 0.3s ease",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Heading size="sm" color="white" mb={2}>
                    {report.title}
                  </Heading>
                  <Text color="gray.300" fontSize="sm" mb={4}>
                    {report.description}
                  </Text>
                  <ChakraLink
                    href={report.url}
                    isExternal
                    color={report.color}
                    fontWeight="medium"
                    fontSize="sm"
                    display="flex"
                    alignItems="center"
                  >
                    View Report <Icon as={FaExternalLinkAlt} ml={2} boxSize={3} />
                  </ChakraLink>
                </MotionBox>
              ))}
            </MotionSimpleGrid>

            <Heading size="md" color="teal.400" mb={4}>
              Key Economic Indicators
            </Heading>
            <MotionBox
              bg="gray.700"
              p={6}
              borderRadius="lg"
              mb={8}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <UnorderedList spacing={3} color="gray.300" pl={4}>
                <ListItem>
                  <Text as="span" fontWeight="medium" color="white">
                    Inflation rates
                  </Text>{" "}
                  and their impact on property values
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="medium" color="white">
                    Interest rates
                  </Text>{" "}
                  and their effect on mortgage affordability
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="medium" color="white">
                    Government regulations
                  </Text>{" "}
                  and housing policies
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="medium" color="white">
                    Global economic events
                  </Text>{" "}
                  and geopolitical factors
                </ListItem>
              </UnorderedList>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="900px">
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
              Here are answers to common questions about the real estate market and investing through PropFundr.
            </MotionText>
          </MotionVStack>

          <MotionBox
            bg="gray.800"
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VStack spacing={6} align="stretch">
              {[
                {
                  question: "What are the best regions for real estate investment in 2025?",
                  answer:
                    "Regions with strong economic growth and increasing demand, such as the U.S., Europe, and parts of Asia-Pacific, offer great opportunities for investors. Look for areas with population growth, job creation, and infrastructure development.",
                },
                {
                  question: "How do economic factors affect my real estate investment?",
                  answer:
                    "Economic conditions like inflation and interest rates can influence property prices, rental yields, and mortgage rates, affecting your investment's profitability. It's important to monitor these indicators and adjust your strategy accordingly.",
                },
                {
                  question: "How can I use PropFundr to get real-time market insights?",
                  answer:
                    "PropFundr offers updated market reports, data, and analytics, allowing you to track trends and adjust your investments accordingly. Our platform provides detailed information on each investment opportunity, including market analysis and growth projections.",
                },
              ].map((faq, index) => (
                <Box key={index}>
                  <Heading size="md" color="white" mb={2}>
                    {faq.question}
                  </Heading>
                  <Text color="gray.300">{faq.answer}</Text>
                  {index < 2 && <Divider my={4} borderColor="gray.700" />}
                </Box>
              ))}
            </VStack>
          </MotionBox>
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
              Ready to Apply These Insights?
            </MotionHeading>
            <MotionText color="gray.300" fontSize={{ base: "md", md: "lg" }} maxW="700px" mx="auto" lineHeight="tall">
              Put your knowledge to work by exploring our curated investment opportunities. Our platform makes it easy
              to find properties that align with market trends and your investment goals.
            </MotionText>
          </MotionVStack>
        </Container>
      </Box>
    </Box>
  )
}
