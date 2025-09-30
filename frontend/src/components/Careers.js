import { Box, Container, Heading, Text, Stack, SimpleGrid, Button, VStack, Divider } from "@chakra-ui/react";

export default function Careers() {
  return (
    <Box bg="gray.50" py={16} minH="100vh">
      <Container maxW="6xl">
        <Stack spacing={10}>
          {/* Hero Section */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="brand.700">Careers at PropFundr</Heading>
            <Text fontSize="lg" color="gray.600">
              Join us in reshaping real estate investing. We’re building the future of property crowdfunding, and we want you to be part of it.
            </Text>
          </VStack>

          {/* Our Mission */}
          <Box>
            <Heading size="lg" mb={3}>Our Mission</Heading>
            <Text color="gray.700">
              At PropFundr, we aim to democratize access to real estate investment opportunities by leveraging the power of technology. We're empowering individuals to grow their wealth through transparent, secure, and user-friendly property crowdfunding.
            </Text>
          </Box>

          {/* Our Culture & Values */}
          <Box>
            <Heading size="lg" mb={3}>Culture & Values</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box p={4} bg="white" rounded="lg" shadow="md">
                <Heading size="md" mb={2}>Innovation</Heading>
                <Text fontSize="sm" color="gray.600">
                  We embrace creativity and encourage bold ideas to disrupt traditional real estate.
                </Text>
              </Box>
              <Box p={4} bg="white" rounded="lg" shadow="md">
                <Heading size="md" mb={2}>Transparency</Heading>
                <Text fontSize="sm" color="gray.600">
                  We operate with openness, sharing the ‘how’ and ‘why’ behind every move.
                </Text>
              </Box>
              <Box p={4} bg="white" rounded="lg" shadow="md">
                <Heading size="md" mb={2}>Ownership</Heading>
                <Text fontSize="sm" color="gray.600">
                  We empower our team to take initiative and drive impact.
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Perks & Benefits */}
          <Box>
            <Heading size="lg" mb={3}>Perks & Benefits</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Box>
                <Text>✅ Remote flexibility</Text>
                <Text>✅ Paid time off</Text>
                <Text>✅ Equity options</Text>
                <Text>✅ Professional development</Text>
                <Text>✅ Health & wellness stipend</Text>
              </Box>
              <Box>
                <Text>✅ Collaborative team culture</Text>
                <Text>✅ Fast-paced learning environment</Text>
                <Text>✅ Tech & tools budget</Text>
                <Text>✅ Real-world investment experience</Text>
                <Text>✅ Quarterly team retreats</Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Open Roles */}
          <Box>
            <Heading size="lg" mb={3}>Open Positions</Heading>
            {/* Placeholder roles */}
            <Stack spacing={5}>
              <Box p={4} bg="white" rounded="md" shadow="sm" borderLeft="4px solid #4A90E2">
                <Heading size="md">Frontend Developer (React)</Heading>
                <Text color="gray.600">Remote • Full-Time</Text>
                <Button mt={2} colorScheme="blue" size="sm">Apply Now</Button>
              </Box>
              <Box p={4} bg="white" rounded="md" shadow="sm" borderLeft="4px solid #4A90E2">
                <Heading size="md">Backend Developer (Node.js)</Heading>
                <Text color="gray.600">Remote • Full-Time</Text>
                <Button mt={2} colorScheme="blue" size="sm">Apply Now</Button>
              </Box>
              <Box p={4} bg="white" rounded="md" shadow="sm" borderLeft="4px solid #4A90E2">
                <Heading size="md">Growth & Community Manager</Heading>
                <Text color="gray.600">Hybrid • Contract</Text>
                <Button mt={2} colorScheme="blue" size="sm">Apply Now</Button>
              </Box>
            </Stack>
          </Box>

          {/* CTA */}
          <Divider my={10} />
          <VStack spacing={3} textAlign="center">
            <Heading size="md">Don’t see a role that fits?</Heading>
            <Text color="gray.600">
              We’re always looking for passionate individuals. Reach out to us at <b>careers@propfundr.com</b>
            </Text>
          </VStack>
        </Stack>
      </Container>
    </Box>
  );
}
