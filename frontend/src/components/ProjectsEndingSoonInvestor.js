"use client"

import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  Button,
  HStack,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FiCalendar, FiClock, FiAlertCircle, FiRefreshCw } from "react-icons/fi"

const ProjectsEndingSoonInvestor = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")
  const tableHoverBg = useColorModeValue("gray.50", "gray.700")
  const noProjectsBg = useColorModeValue("gray.50", "gray.700")

  const fetchProjects = async () => {
    setLoading(true)
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("http://192.168.100.30:5000/api/investor/projects-ending-soon", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      // Ensure data is an array
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        setProjects([]) // Fallback to empty
      }
    } catch (err) {
      console.error("❌ Failed to fetch investor projects:", err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const getReturnStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "yellow"
      case "approved":
        return "green"
      case "rejected":
        return "red"
      case "not_submitted":
        return "teal"
      default:
        return "gray"
    }
  }

  const getReturnStatusLabel = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <Card borderRadius="xl" boxShadow="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} overflow="hidden">
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={FiCalendar} color="teal.500" boxSize={5} />
            <Heading size="md" color={textColor} fontWeight="bold">
              Projects Nearing Completion
            </Heading>
          </HStack>
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
            colorScheme="teal"
            onClick={fetchProjects}
            isLoading={loading}
          >
            Refresh
          </Button>
        </Flex>
        <Text fontSize="sm" color={mutedColor} mt={1}>
          Track your investments that are approaching their completion date
        </Text>
      </CardHeader>

      <CardBody pt={2}>
        {loading ? (
          <Skeleton height="150px" borderRadius="md" />
        ) : projects.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={8} bg={noProjectsBg} borderRadius="md">
            <Icon as={FiClock} boxSize={10} color="gray.400" mb={3} />
            <Text fontSize="md" fontWeight="medium" color={textColor}>
              No active investments ending soon
            </Text>
            <Text fontSize="sm" color={mutedColor} mt={1}>
              Projects that will be nearing completion will appear here.
            </Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="solid" size="md">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color="gray.800" fontWeight="bold" fontSize="sm">
                    Project
                  </Th>
                  <Th color="gray.800" fontWeight="bold" fontSize="sm">
                    Ends In
                  </Th>
                  <Th color="gray.800" fontWeight="bold" fontSize="sm">
                    Return Status
                  </Th>
                  <Th color="gray.800" fontWeight="bold" fontSize="sm" isNumeric>
                    Invested Amount
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {projects.map((project) => (
                  <Tr key={project.project_id} _hover={{ bg: tableHoverBg }} transition="background-color 0.2s">
                    <Td fontWeight="medium" color="gray.500" >
                      {project.project_name}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          project.days_remaining <= 3 ? "red" : project.days_remaining <= 7 ? "orange" : "yellow"
                        }
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontWeight="medium"
                        variant="solid"
                      >
                        {project.days_remaining} days
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getReturnStatusColor(project.return_status)}
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontWeight="medium"
                        textTransform="capitalize"
                        variant="solid"
                      >
                        {getReturnStatusLabel(project.return_status)}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="medium" color="gray.500" >
                      ${project.invested_amount?.toLocaleString() || "N/A"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {projects.length > 0 && (
          <Text fontSize="xs" color={mutedColor} mt={4}>
            <Icon as={FiAlertCircle} boxSize={3} mr={1} />
            Projects with less than 7 days remaining will be highlighted
          </Text>
        )}
      </CardBody>
    </Card>
  )
}

export default ProjectsEndingSoonInvestor
