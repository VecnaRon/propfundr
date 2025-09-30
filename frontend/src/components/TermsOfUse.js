"use client"

import {
  Box,
  Container,
  Divider,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  VStack,
  Link as ChakraLink,
  Flex,
  Icon,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaFileContract, FaUserShield, FaHandshake, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionVStack = motion(VStack)
const MotionFlex = motion(Flex)

export default function TermsOfUse() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" })

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
              Terms of Use & Legal Agreement
            </MotionHeading>
            <MotionText fontSize="md" color="gray.400" mb={8}>
              <strong>Last Updated:</strong> {currentDate}
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Terms Content */}
      <Container maxW="900px" py={{ base: 8, md: 16 }}>
        <MotionBox
          bg="gray.800"
          p={{ base: 6, md: 10 }}
          borderRadius="xl"
          boxShadow="xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MotionVStack spacing={10} align="start">
            {/* Section: 1 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(110, 65, 226, 0.2)"
                  color="brand.500"
                  mr={4}
                >
                  <Icon as={FaFileContract} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  1. Introduction
                </Heading>
              </Flex>
              <Text mt={2} color="gray.300" lineHeight="tall">
                Welcome to PropFundr, a real estate crowdfunding platform connecting Investors with Property Owners
                seeking funding for real estate projects. By accessing or using our platform, you agree to be bound by
                these Terms of Use. Please read them carefully before using our services.
              </Text>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Section: 2 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(56, 178, 172, 0.2)"
                  color="teal.400"
                  mr={4}
                >
                  <Icon as={FaUserShield} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  2. Definitions
                </Heading>
              </Flex>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Investor:
                  </Text>{" "}
                  A registered user who invests in real estate projects on the Platform.
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Owner:
                  </Text>{" "}
                  A registered user who lists a real estate project on the Platform for investment.
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Project:
                  </Text>{" "}
                  A real estate property listed for investment on the Platform.
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Rental Income:
                  </Text>{" "}
                  Any income generated from rental properties funded through PropFundr.
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Returns:
                  </Text>{" "}
                  The earnings Investors receive from their investments in projects, including rental income
                  distributions and profit shares.
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Platform Fees:
                  </Text>{" "}
                  Fees charged by PropFundr for using its services.
                </ListItem>
                <ListItem>
                  <Text as="span" fontWeight="bold" color="white">
                    Disbursement:
                  </Text>{" "}
                  The distribution of funds from Owners to Investors via the Platform.
                </ListItem>
              </UnorderedList>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Section: 3 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(159, 122, 234, 0.2)"
                  color="purple.400"
                  mr={4}
                >
                  <Icon as={FaHandshake} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  3. User Eligibility & Registration
                </Heading>
              </Flex>
              <Text mt={2} color="gray.300" lineHeight="tall">
                To access PropFundr, you must:
              </Text>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>✔ Be at least 18 years old.</ListItem>
                <ListItem>✔ Have full legal capacity to enter into binding agreements.</ListItem>
                <ListItem>✔ Provide accurate and complete registration details.</ListItem>
                <ListItem>✔ Comply with all applicable laws in your jurisdiction.</ListItem>
              </UnorderedList>
              <Text fontWeight="bold" mt={4} color="white">
                💡 Account Security:
              </Text>
              <Text mt={2} color="gray.300" lineHeight="tall">
                You are responsible for maintaining the confidentiality of your account credentials and ensuring all
                activity on your account is authorized. Any breach of security should be reported to PropFundr
                immediately.
              </Text>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Section: 4 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(237, 100, 166, 0.2)"
                  color="pink.400"
                  mr={4}
                >
                  <Icon as={FaMoneyBillWave} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  4. Investment Terms & Responsibilities
                </Heading>
              </Flex>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                4.1 Investor Responsibilities
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>Investors acknowledge that investments carry risks.</ListItem>
                <ListItem>Investors agree to conduct their own research before investing.</ListItem>
                <ListItem>Investors must not request refunds once an investment is finalized.</ListItem>
                <ListItem>Investors will receive returns based on project success.</ListItem>
              </UnorderedList>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                4.2 Property Owner Responsibilities
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>Owners agree to provide accurate information about their listed properties.</ListItem>
                <ListItem>Owners must repay investment returns to Investors within the agreed-upon time.</ListItem>
                <ListItem>Owners must add rental income earned from investment properties to the Platform.</ListItem>
                <ListItem>Owners must not misrepresent property details or financial projections.</ListItem>
              </UnorderedList>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Section: 5 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(49, 151, 149, 0.2)"
                  color="teal.500"
                  mr={4}
                >
                  <Icon as={FaMoneyBillWave} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  5. Rental Income & Distributions
                </Heading>
              </Flex>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                5.1 Rental Income Obligations
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>Property Owners must report and deposit rental income monthly.</ListItem>
                <ListItem>Rental income will be distributed proportionally to Investors.</ListItem>
                <ListItem>Failure to deposit rental income on time may lead to penalties.</ListItem>
              </UnorderedList>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                5.2 Rental Income Distribution to Investors
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>PropFundr will process automated rental income distributions.</ListItem>
                <ListItem>
                  Investors will receive their share of rental income via their linked payment method.
                </ListItem>
                <ListItem>The Platform reserves the right to withhold distributions in case of issues.</ListItem>
              </UnorderedList>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Section: 6 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(76, 175, 80, 0.2)"
                  color="green.500"
                  mr={4}
                >
                  <Icon as={FaMoneyBillWave} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  6. Funding, Transactions & Withdrawals
                </Heading>
              </Flex>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                6.1 Funding & Investment Process
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>Investors must fund their accounts before making an investment.</ListItem>
                <ListItem>Owners must meet the funding goal to receive investment capital.</ListItem>
                <ListItem>If a project doesn't meet the funding goal, investments will be refunded.</ListItem>
              </UnorderedList>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                6.2 Withdrawals & Payments
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>Investors can withdraw their balance at any time, subject to processing fees.</ListItem>
                <ListItem>Owners receive investment capital once their project is fully funded.</ListItem>
              </UnorderedList>

              <Heading as="h3" size="md" mt={6} mb={3} color="teal.400">
                6.3 Platform Fees & Deductions
              </Heading>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>PropFundr charges transaction, management, and withdrawal fees.</ListItem>
                <ListItem>Fees are deducted automatically before disbursements.</ListItem>
              </UnorderedList>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Section: 7 */}
            <Box>
              <Flex align="center" mb={4}>
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="rgba(229, 62, 62, 0.2)"
                  color="red.400"
                  mr={4}
                >
                  <Icon as={FaExclamationTriangle} boxSize={6} />
                </Flex>
                <Heading as="h2" size="lg" color="white">
                  7. User Conduct & Prohibited Activities
                </Heading>
              </Flex>
              <Text mt={2} color="gray.300" lineHeight="tall">
                Users must not:
              </Text>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>🚫 Engage in fraudulent or deceptive activities.</ListItem>
                <ListItem>🚫 List non-existent properties or provide false information.</ListItem>
                <ListItem>🚫 Attempt to manipulate investment returns.</ListItem>
                <ListItem>🚫 Use the Platform for illegal activities.</ListItem>
              </UnorderedList>

              <Text fontWeight="bold" mt={4} color="white">
                📌 Violations may result in:
              </Text>
              <UnorderedList spacing={3} mt={2} color="gray.300" pl={6}>
                <ListItem>❌ Account suspension or termination.</ListItem>
                <ListItem>❌ Legal action.</ListItem>
                <ListItem>❌ Loss of investment privileges.</ListItem>
              </UnorderedList>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Sections: 8, 9, 10 */}
            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                8. Dispute Resolution
              </Heading>
              <Text mt={2} color="gray.300" lineHeight="tall">
                Disputes will be handled under [Specify Jurisdiction] laws. All parties agree to attempt to resolve any
                disputes through good-faith negotiations before pursuing legal action. If negotiations fail, disputes
                will be resolved through binding arbitration.
              </Text>
            </Box>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                9. Limitation of Liability
              </Heading>
              <Text mt={2} color="gray.300" lineHeight="tall">
                PropFundr is not liable for investment losses, fraudulent activities by Owners or Investors, platform
                downtime, or legal actions. Our liability is limited to the amount of fees collected for the specific
                transaction in question. Users acknowledge that investing involves inherent risks.
              </Text>
            </Box>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                10. Modifications & Updates
              </Heading>
              <Text mt={2} color="gray.300" lineHeight="tall">
                PropFundr reserves the right to update these Terms. Continued use after updates implies acceptance. We
                will notify users of significant changes via email or platform notifications. It is the user's
                responsibility to review the Terms periodically.
              </Text>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Contact */}
            <Box>
              <Text fontSize="sm" color="gray.400">
                For further inquiries, contact our support team at{" "}
                <ChakraLink href="mailto:support@propfundr.com" color="brand.400">
                  support@propfundr.com
                </ChakraLink>
              </Text>
            </Box>
          </MotionVStack>
        </MotionBox>

    
      </Container>
    </Box>
  )
}
