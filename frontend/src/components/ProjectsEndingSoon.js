"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Text,
  useColorModeValue,
  Flex,
  Icon,
  TableContainer,
} from "@chakra-ui/react"
import { AlertCircleIcon } from "lucide-react"

const ProjectsEndingSoon = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Color scheme
  const textColor = useColorModeValue("gray.800", "gray.100")
  const subTextColor = useColorModeValue("gray.600", "gray.400")
  const tableBorderColor = useColorModeValue("gray.200", "gray.700")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    const fetchData = async () => {
      try {
       const token = sessionStorage.getItem("token");
        const res = await fetch("http://192.168.100.30:5000/api/projects-ending-soon", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setProjects(data || [])
      } catch (err) {
        console.error("Error fetching projects ending soon", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Flex justify="center" align="center" py={8} h="200px">
        <Spinner color="teal.500" size="lg" thickness="3px" />
      </Flex>
    )
  }

  if (projects.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" py={8} textAlign="center" h="200px">
        <Icon as={AlertCircleIcon} boxSize={10} color={subTextColor} mb={3} />
        <Text color={subTextColor} fontSize="sm">
          No projects ending in the next 14 days.
        </Text>
      </Flex>
    )
  }

  return (
    <Box w="100%" h="100%">
      <TableContainer
        w="100%"
        overflowX="auto"
        overflowY="auto"
        maxH="400px"
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E0",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#A0AEC0",
          },
        }}
      >
        <Table size="sm" variant="solid" minW={{ base: "500px", md: "100%" }}>
          <Thead bg={tableHeaderBg} position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th color="gray.800" borderColor={tableBorderColor} fontSize="xs" fontWeight="bold" py={3}>
                Project Name
              </Th>
              <Th color="gray.800"  borderColor={tableBorderColor} fontSize="xs" fontWeight="bold" py={3}>
                End Date
              </Th>
              <Th color="gray.800"  borderColor={tableBorderColor} fontSize="xs" fontWeight="bold" py={3}>
                Days Left
              </Th>
              <Th color="gray.800"  borderColor={tableBorderColor} fontSize="xs" fontWeight="bold" py={3}>
                Status
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {projects.map((project) => (
              <Tr key={project.id} _hover={{ bg: tableRowHoverBg }} transition="background-color 0.2s">
                <Td
               color="gray.600" 
                  borderColor={tableBorderColor}
                  fontSize="sm"
                  py={3}
                  maxW="150px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {project.name}
                </Td>
                <Td  color="gray.600"  borderColor={tableBorderColor} fontSize="sm" py={3}>
                  {new Date(project.endDate).toLocaleDateString()}
                </Td>
                <Td borderColor={tableBorderColor} py={3}>
                  <Badge
                    colorScheme={project.days_remaining <= 3 ? "red" : "yellow"}
                    variant="solid"
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {project.days_remaining} days
                  </Badge>
                </Td>
                <Td borderColor={tableBorderColor} py={3}>
                  <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2} py={1} borderRadius="md">
                    Prepare Returns
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ProjectsEndingSoon
