"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  Link as ChakraLink,
  Flex,
  Icon,
  Button,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaServer,
  FaUserGraduate,
  FaBalanceScale,
  FaEdit,
  FaEnvelope,
  FaFileDownload,
} from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionVStack = motion(VStack)
const MotionFlex = motion(Flex)
const MotionSimpleGrid = motion(SimpleGrid)

export default function Disclaimers() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" })
  const cardColumns = useBreakpointValue({ base: 1, md: 2 })

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
              fontSize={headingSize}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
              mb={4}
            >
              Disclaimers
            </MotionHeading>
            <MotionText fontSize="md" color="gray.400" mb={8}>
              <strong>Last Updated:</strong> {currentDate}
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Disclaimers Content */}
      <Container maxW="1200px" py={{ base: 8, md: 16 }}>
        <MotionText
          color="gray.300"
          fontSize={{ base: "md", md: "lg" }}
          textAlign="center"
          maxW="800px"
          mx="auto"
          mb={12}
          lineHeight="tall"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Please read these disclaimers carefully before using PropFundr's services. By accessing or using our platform,
          you acknowledge and agree to the following disclaimers.
        </MotionText>

        <MotionSimpleGrid
          columns={cardColumns}
          spacing={8}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Investment Risks */}
          <MotionBox
            bg="gray.800"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "2xl",
              borderColor: "red.400",
            }}
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
              <Icon as={FaExclamationTriangle} boxSize={8} />
            </Flex>
            <Heading as="h2" size="lg" color="white" mb={4}>
              Investment Risks
            </Heading>
            <Text color="gray.300" lineHeight="tall">
              Investing in real estate through PropFundr involves significant risks, including but not limited to:
            </Text>
            <VStack align="start" spacing={3} mt={4} pl={4}>
              <Text color="gray.300">• Potential loss of principal investment</Text>
              <Text color="gray.300">• Illiquidity of real estate investments</Text>
              <Text color="gray.300">• Market fluctuations and economic downturns</Text>
              <Text color="gray.300">• Project delays or failures</Text>
              <Text color="gray.300">• Regulatory changes affecting real estate</Text>
            </VStack>
            <Text color="gray.300" mt={4} lineHeight="tall">
              Past performance is not indicative of future results. All investments should be made with the
              understanding that you could lose some or all of your investment.
            </Text>
          </MotionBox>

          {/* Not Financial Advice */}
          <MotionBox
            bg="gray.800"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "2xl",
              borderColor: "orange.400",
            }}
          >
            <Flex
              w={16}
              h={16}
              align="center"
              justify="center"
              rounded="full"
              bg="rgba(237, 137, 54, 0.2)"
              color="orange.400"
              mb={5}
            >
              <Icon as={FaInfoCircle} boxSize={8} />
            </Flex>
            <Heading as="h2" size="lg" color="white" mb={4}>
              Not Financial Advice
            </Heading>
            <Text color="gray.300" lineHeight="tall">
              The information provided on PropFundr is for general informational purposes only and should not be
              considered as financial, investment, legal, or tax advice. We do not:
            </Text>
            <VStack align="start" spacing={3} mt={4} pl={4}>
              <Text color="gray.300">• Provide personalized investment recommendations</Text>
              <Text color="gray.300">• Guarantee returns on any investment</Text>
              <Text color="gray.300">• Act as financial advisors or fiduciaries</Text>
            </VStack>
            <Text color="gray.300" mt={4} lineHeight="tall">
              Before making any investment decisions, we strongly recommend consulting with qualified financial, legal,
              and tax professionals who can provide advice tailored to your specific circumstances.
            </Text>
          </MotionBox>

          {/* Platform Availability */}
          <MotionBox
            bg="gray.800"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "2xl",
              borderColor: "teal.400",
            }}
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
              <Icon as={FaServer} boxSize={8} />
            </Flex>
            <Heading as="h2" size="lg" color="white" mb={4}>
              Platform Availability
            </Heading>
            <Text color="gray.300" lineHeight="tall">
              PropFundr strives to maintain platform availability at all times, but we cannot guarantee uninterrupted
              access. The platform may experience:
            </Text>
            <VStack align="start" spacing={3} mt={4} pl={4}>
              <Text color="gray.300">• Scheduled maintenance periods</Text>
              <Text color="gray.300">• Technical issues or outages</Text>
              <Text color="gray.300">• Security-related downtime</Text>
              <Text color="gray.300">• Third-party service disruptions</Text>
            </VStack>
            <Text color="gray.300" mt={4} lineHeight="tall">
              We are not responsible for any losses or inconveniences that may result from platform unavailability. We
              will make reasonable efforts to notify users of scheduled maintenance in advance.
            </Text>
          </MotionBox>

          {/* Educational Content */}
          <MotionBox
            bg="gray.800"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "2xl",
              borderColor: "purple.400",
            }}
          >
            <Flex
              w={16}
              h={16}
              align="center"
              justify="center"
              rounded="full"
              bg="rgba(159, 122, 234, 0.2)"
              color="purple.400"
              mb={5}
            >
              <Icon as={FaUserGraduate} boxSize={8} />
            </Flex>
            <Heading as="h2" size="lg" color="white" mb={4}>
              Educational Content
            </Heading>
            <Text color="gray.300" lineHeight="tall">
              The educational content, market insights, and investment resources provided on PropFundr are:
            </Text>
            <VStack align="start" spacing={3} mt={4} pl={4}>
              <Text color="gray.300">• For informational purposes only</Text>
              <Text color="gray.300">• Not guaranteed to be accurate or complete</Text>
              <Text color="gray.300">• Subject to change without notice</Text>
              <Text color="gray.300">• Not a substitute for professional advice</Text>
            </VStack>
            <Text color="gray.300" mt={4} lineHeight="tall">
              While we strive to provide valuable and accurate information, we make no warranties regarding the
              completeness, reliability, or accuracy of this content.
            </Text>
          </MotionBox>
        </MotionSimpleGrid>

        <Divider my={12} borderColor="gray.700" />

        {/* Additional Disclaimers */}
        <MotionBox
          bg="gray.800"
          p={{ base: 6, md: 10 }}
          borderRadius="xl"
          boxShadow="xl"
          mt={8}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Heading as="h2" size="lg" color="white" mb={6}>
            Additional Disclaimers
          </Heading>

          <VStack spacing={8} align="start">
            {/* Legal Compliance */}
            <Box>
              <Flex align="center" mb={3}>
                <Icon as={FaBalanceScale} color="brand.500" boxSize={5} mr={3} />
                <Heading as="h3" size="md" color="white">
                  Legal Compliance
                </Heading>
              </Flex>
              <Text color="gray.300" lineHeight="tall">
                PropFundr is not responsible for ensuring that your use of our platform complies with all laws and
                regulations in your jurisdiction. It is your responsibility to ensure that your participation in real
                estate crowdfunding is permitted under the laws applicable to you. We recommend consulting with legal
                counsel if you have any questions about compliance with local laws.
              </Text>
            </Box>

            {/* Third-Party Content */}
            <Box>
              <Flex align="center" mb={3}>
                <Icon as={FaEdit} color="brand.500" boxSize={5} mr={3} />
                <Heading as="h3" size="md" color="white">
                  Third-Party Content
                </Heading>
              </Flex>
              <Text color="gray.300" lineHeight="tall">
                PropFundr may include links to third-party websites, content, or services. We do not control, endorse,
                or assume responsibility for any third-party content. Access to and use of such linked websites,
                content, or services is at your own risk. We encourage you to review the terms of use and privacy
                policies of any third-party websites you visit.
              </Text>
            </Box>

            {/* Limitation of Liability */}
            <Box>
              <Flex align="center" mb={3}>
                <Icon as={FaExclamationTriangle} color="red.400" boxSize={5} mr={3} />
                <Heading as="h3" size="md" color="white">
                  Limitation of Liability
                </Heading>
              </Flex>
              <Text color="gray.300" lineHeight="tall">
                To the maximum extent permitted by law, PropFundr and its officers, directors, employees, and agents
                shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including
                without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from
                your access to or use of (or inability to access or use) the platform or any content on the platform.
              </Text>
            </Box>
          </VStack>
        </MotionBox>

        {/* Contact Section */}
        <MotionBox
          bg="gray.800"
          p={{ base: 6, md: 8 }}
          borderRadius="xl"
          boxShadow="xl"
          mt={12}
          textAlign="center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
            mx="auto"
          >
            <Icon as={FaEnvelope} boxSize={8} />
          </Flex>
          <Heading as="h2" size="lg" color="white" mb={4}>
            Questions About These Disclaimers?
          </Heading>
          <Text color="gray.300" lineHeight="tall" mb={6} maxW="700px" mx="auto">
            If you have any questions or concerns about these disclaimers, please contact our legal team at{" "}
            <ChakraLink href="mailto:legal@propfundr.com" color="brand.400">
              legal@propfundr.com
            </ChakraLink>
            . We're here to help clarify any points and ensure you have a complete understanding of the risks and
            limitations associated with using our platform.
          </Text>
         
        </MotionBox>
      </Container>
    </Box>
  )
}
