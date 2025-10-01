import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Text, Badge, Button, useToast
} from "@chakra-ui/react"
import { useEffect, useState } from "react"

const ProjectsEndingSoonAdmin = () => {
  const [projects, setProjects] = useState([])
  const [loadingProjectId, setLoadingProjectId] = useState(null)
  const toast = useToast()

  const fetchProjects = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("/admin/projects-ending-soon", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      console.error("❌ Failed to fetch projects ending soon:", err)
    }
  }

  const remindOwner = async (projectId, ownerId) => {
const token = sessionStorage.getItem("token");
    setLoadingProjectId(projectId)
    try {
      const res = await fetch("/admin/remind-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ project_id: projectId, owner_id: ownerId })
      })

      if (res.ok) {
        toast({
          title: "Reminder sent",
          description: `Owner reminded to submit returns.`,
          status: "success",
          duration: 3000,
          isClosable: true
        })
      } else {
        toast({
          title: "Failed to send reminder",
          status: "error",
          duration: 3000,
          isClosable: true
        })
      }
    } catch (err) {
      console.error("❌ Reminder error:", err)
    } finally {
      setLoadingProjectId(null)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <Box mb={8}>
      <Heading size="md" mb={4} color="teal.600">🕒 Projects Ending Soon</Heading>
      {projects.length === 0 ? (
        <Text>No projects ending within the next 14 days.</Text>
      ) : (
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.700">Project</Th>
              <Th color="gray.700">Ends In</Th>
              <Th color="gray.700">Owner Email</Th>
              <Th color="gray.700">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {projects.map((proj) => (
              <Tr key={proj.id}>
                <Td color="gray.500">{proj.name}</Td>
                <Td>
                  <Badge colorScheme={proj.days_remaining <= 3 ? "red" : "yellow"} variant="solid">
                    {proj.days_remaining} day(s)
                  </Badge>
                </Td>
                <Td color="gray.500">{proj.owner_email}</Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    isLoading={loadingProjectId === proj.id}
                    onClick={() => remindOwner(proj.id, proj.owner_id)}
                  >
                    Remind Owner
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  )
}

export default ProjectsEndingSoonAdmin
