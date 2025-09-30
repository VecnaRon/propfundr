"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Link as ChakraLink,
  Flex,
  Icon,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaDatabase, FaUserShield, FaShareAlt, FaLock, FaUserCog, FaEnvelope, FaFileDownload } from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionVStack = motion(VStack)
const MotionFlex = motion(Flex)

export default function PrivacyPolicy() {
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
              Privacy Policy
            </MotionHeading>
            <MotionText fontSize="md" color="gray.400" mb={8}>
              <strong>Last Updated:</strong> {currentDate}
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Privacy Policy Content */}
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
            <Text color="gray.300" lineHeight="tall">
              At PropFundr, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our platform. Please read this policy carefully to understand
              our practices regarding your personal data.
            </Text>

            <Accordion allowToggle width="100%">
              {/* Data Collection */}
              <AccordionItem border="none" mb={4} bg="gray.700" borderRadius="lg" overflow="hidden">
                <h2>
                  <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                    <Flex align="center" flex="1" textAlign="left">
                      <Icon as={FaDatabase} color="brand.500" boxSize={5} mr={4} />
                      <Heading as="h2" size="md" color="white">
                        1. Data Collection
                      </Heading>
                    </Flex>
                    <AccordionIcon color="brand.500" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={6}>
                  <Text color="gray.300" lineHeight="tall">
                    We collect user data to improve our services and ensure platform security. The types of data
                    collected include:
                  </Text>
                  <VStack align="start" spacing={3} mt={4} pl={4}>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Personal Information:
                      </Text>{" "}
                      Name, email address, phone number, and identification documents for KYC verification.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Financial Information:
                      </Text>{" "}
                      Bank account details, transaction history, and investment records.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Usage Data:
                      </Text>{" "}
                      Information about how you interact with our platform, including pages visited, time spent, and
                      features used.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Device Information:
                      </Text>{" "}
                      IP address, browser type, device type, and operating system.
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Data Usage */}
              <AccordionItem border="none" mb={4} bg="gray.700" borderRadius="lg" overflow="hidden">
                <h2>
                  <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                    <Flex align="center" flex="1" textAlign="left">
                      <Icon as={FaUserShield} color="teal.400" boxSize={5} mr={4} />
                      <Heading as="h2" size="md" color="white">
                        2. Data Usage
                      </Heading>
                    </Flex>
                    <AccordionIcon color="brand.500" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={6}>
                  <Text color="gray.300" lineHeight="tall">
                    The data collected is used for the following purposes:
                  </Text>
                  <VStack align="start" spacing={3} mt={4} pl={4}>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Providing Services:
                      </Text>{" "}
                      Processing investments, managing user accounts, and facilitating transactions.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Improving User Experience:
                      </Text>{" "}
                      Enhancing platform features, optimizing user interface, and personalizing content.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Communication:
                      </Text>{" "}
                      Sending updates, notifications, and important information about your account and investments.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Security:
                      </Text>{" "}
                      Detecting and preventing fraud, unauthorized access, and other security threats.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Legal Compliance:
                      </Text>{" "}
                      Meeting regulatory requirements and responding to legal requests.
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Third-Party Sharing */}
              <AccordionItem border="none" mb={4} bg="gray.700" borderRadius="lg" overflow="hidden">
                <h2>
                  <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                    <Flex align="center" flex="1" textAlign="left">
                      <Icon as={FaShareAlt} color="purple.400" boxSize={5} mr={4} />
                      <Heading as="h2" size="md" color="white">
                        3. Third-Party Sharing
                      </Heading>
                    </Flex>
                    <AccordionIcon color="brand.500" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={6}>
                  <Text color="gray.300" lineHeight="tall">
                    We do not sell user data. However, we may share your information with the following third parties:
                  </Text>
                  <VStack align="start" spacing={3} mt={4} pl={4}>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Service Providers:
                      </Text>{" "}
                      Companies that help us provide our services, such as payment processors, KYC verification
                      services, and cloud storage providers.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Business Partners:
                      </Text>{" "}
                      Property owners and investors may receive limited information necessary for investment
                      transactions.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Legal Authorities:
                      </Text>{" "}
                      When required by law, court order, or governmental regulation.
                    </Text>
                  </VStack>
                  <Text color="gray.300" lineHeight="tall" mt={4}>
                    All third parties are required to maintain the confidentiality and security of your information and
                    to process it in accordance with applicable data protection laws.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              {/* Security */}
              <AccordionItem border="none" mb={4} bg="gray.700" borderRadius="lg" overflow="hidden">
                <h2>
                  <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                    <Flex align="center" flex="1" textAlign="left">
                      <Icon as={FaLock} color="cyan.400" boxSize={5} mr={4} />
                      <Heading as="h2" size="md" color="white">
                        4. Security
                      </Heading>
                    </Flex>
                    <AccordionIcon color="brand.500" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={6}>
                  <Text color="gray.300" lineHeight="tall">
                    We implement strong security measures to protect your information from unauthorized access,
                    alteration, or destruction. These measures include:
                  </Text>
                  <VStack align="start" spacing={3} mt={4} pl={4}>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Encryption:
                      </Text>{" "}
                      All sensitive data is encrypted during transmission and storage.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Access Controls:
                      </Text>{" "}
                      Strict access controls limit who can view your personal information.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Regular Audits:
                      </Text>{" "}
                      We conduct regular security audits and vulnerability assessments.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Employee Training:
                      </Text>{" "}
                      Our team is trained on data protection and security best practices.
                    </Text>
                  </VStack>
                  <Text color="gray.300" lineHeight="tall" mt={4}>
                    While we take all reasonable precautions, no security system is impenetrable. We cannot guarantee
                    the absolute security of your information.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              {/* Your Rights */}
              <AccordionItem border="none" mb={4} bg="gray.700" borderRadius="lg" overflow="hidden">
                <h2>
                  <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                    <Flex align="center" flex="1" textAlign="left">
                      <Icon as={FaUserCog} color="orange.400" boxSize={5} mr={4} />
                      <Heading as="h2" size="md" color="white">
                        5. Your Rights
                      </Heading>
                    </Flex>
                    <AccordionIcon color="brand.500" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={6}>
                  <Text color="gray.300" lineHeight="tall">
                    You have the following rights regarding your personal data:
                  </Text>
                  <VStack align="start" spacing={3} mt={4} pl={4}>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Access:
                      </Text>{" "}
                      You can request a copy of the personal data we hold about you.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Correction:
                      </Text>{" "}
                      You can request that we correct any inaccurate or incomplete information.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Deletion:
                      </Text>{" "}
                      You can request that we delete your personal data, subject to legal obligations.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Restriction:
                      </Text>{" "}
                      You can request that we restrict the processing of your data under certain circumstances.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Data Portability:
                      </Text>{" "}
                      You can request a copy of your data in a structured, commonly used, and machine-readable format.
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Objection:
                      </Text>{" "}
                      You can object to the processing of your personal data for marketing purposes.
                    </Text>
                  </VStack>
                  <Text color="gray.300" lineHeight="tall" mt={4}>
                    To exercise any of these rights, please contact our Data Protection Officer at{" "}
                    <ChakraLink href="mailto:privacy@propfundr.com" color="brand.400">
                      privacy@propfundr.com
                    </ChakraLink>
                    .
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              {/* Contact Us */}
              <AccordionItem border="none" bg="gray.700" borderRadius="lg" overflow="hidden">
                <h2>
                  <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                    <Flex align="center" flex="1" textAlign="left">
                      <Icon as={FaEnvelope} color="pink.400" boxSize={5} mr={4} />
                      <Heading as="h2" size="md" color="white">
                        6. Contact Us
                      </Heading>
                    </Flex>
                    <AccordionIcon color="brand.500" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={6}>
                  <Text color="gray.300" lineHeight="tall">
                    If you have any questions or concerns about our Privacy Policy, please contact us at:
                  </Text>
                  <VStack align="start" spacing={3} mt={4} pl={4}>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Email:
                      </Text>{" "}
                      <ChakraLink href="mailto:support@propfundr.com" color="brand.400">
                        support@propfundr.com
                      </ChakraLink>
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Data Protection Officer:
                      </Text>{" "}
                      <ChakraLink href="mailto:privacy@propfundr.com" color="brand.400">
                        privacy@propfundr.com
                      </ChakraLink>
                    </Text>
                    <Text color="gray.300">
                      <Text as="span" fontWeight="bold" color="white">
                        Address:
                      </Text>{" "}
                      PropFundr Headquarters, 123 Investment Avenue, Nairobi, Kenya
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </MotionVStack>
        </MotionBox>

      </Container>
    </Box>
  )
}
