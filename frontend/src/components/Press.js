import { Box, Container, Heading, Text, Stack, VStack, SimpleGrid, Link, Button, Divider } from "@chakra-ui/react";

export default function Press() {
  return (
    <Box bg="white" py={16} minH="100vh">
      <Container maxW="6xl">
        <Stack spacing={10}>
          {/* Hero Section */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="brand.700">Press & Media</Heading>
            <Text fontSize="lg" color="gray.600">
              Stay up-to-date with PropFundr’s journey as we revolutionize the real estate investment landscape.
            </Text>
          </VStack>

          {/* Media Coverage */}
          <Box>
            <Heading size="lg" mb={4}>In the News</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {[
                {
                  title: "PropFundr Raises $5M to Expand Property Investment Platform",
                  source: "TechCrunch",
                  url: "#",
                  date: "March 2025",
                },
                {
                  title: "How PropFundr is Democratizing Real Estate for Everyday Investors",
                  source: "Forbes",
                  url: "#",
                  date: "February 2025",
                },
                {
                  title: "Meet the Startup Disrupting Real Estate Crowdfunding",
                  source: "Business Insider",
                  url: "#",
                  date: "January 2025",
                },
                {
                  title: "PropFundr Recognized as One of Africa's Most Promising Fintechs",
                  source: "CNN Business",
                  url: "#",
                  date: "December 2024",
                },
              ].map((article, index) => (
                <Box key={index} p={4} bg="gray.50" rounded="md" shadow="sm" borderLeft="4px solid #4A90E2">
                  <Heading size="sm" mb={1}>
                    <Link href={article.url} isExternal color="blue.600">{article.title}</Link>
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {article.source} • {article.date}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Press Kit */}
          <Box>
            <Heading size="lg" mb={3}>Press Kit</Heading>
            <Text color="gray.700" mb={4}>
              Download our official logo, team bios, platform screenshots, and brand assets.
            </Text>
            <Button colorScheme="blue" size="md" as="a" href="/press-kit.zip" download>
              Download Press Kit
            </Button>
          </Box>

          {/* Media Contact */}
          <Box>
            <Heading size="lg" mb={3}>Media Inquiries</Heading>
            <Text color="gray.700">
              For interviews, press opportunities, or media collaborations, reach out to our communications team:
            </Text>
            <Text mt={2} fontWeight="bold">📩 press@propfundr.com</Text>
            <Text>📞 +1 (555) 123-4567</Text>
          </Box>

          <Divider my={10} />

          {/* CTA */}
          <VStack spacing={3} textAlign="center">
            <Heading size="md">Follow Our Story</Heading>
            <Text color="gray.600">
              Stay connected with PropFundr through our blog and social channels for the latest updates.
            </Text>
            <Button colorScheme="blue" size="sm" as="a" href="/blog">
              Visit Blog
            </Button>
          </VStack>
        </Stack>
      </Container>
    </Box>
  );
}
