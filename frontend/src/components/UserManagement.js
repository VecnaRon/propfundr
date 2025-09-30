"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Flex,
  Heading,
  Text,
  useToast,
  Spinner,
  Badge,
  IconButton,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  Tooltip,
  useColorModeValue,
  Select,
} from "@chakra-ui/react"
import {
  DeleteIcon,
  ViewIcon,
  SearchIcon,
  ChevronDownIcon,
  SettingsIcon,
  EmailIcon,
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
} from "@chakra-ui/icons"
import UserProfileModal from "../components/UserProfileModal"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"
import ComposeEmailModal from "../components/ComposeEmailModal";


const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const toast = useToast()
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);


  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const { data } = await axios.get("http://192.168.100.30:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(data)
    } catch (err) {
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        "http://192.168.100.30:5000/api/admin/users/delete",
        { userIds: selectedUsers },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)))
      setSelectedUsers([])
      setShowDeleteModal(false)

      toast({
        title: "Users deleted",
        description: `${selectedUsers.length} user(s) successfully removed`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      })
    } catch (err) {
      console.error("Error deleting users:", err)
      toast({
        title: "Error deleting users",
        description: "There was an error processing your request",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      })
    }
  }

  const openDeleteModal = () => setShowDeleteModal(true)
  const closeDeleteModal = () => setShowDeleteModal(false)

  const usersPerPage = 10

  // Apply filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  // Calculate stats
  const activeUsers = users.filter((user) => user.status === "active").length
  const inactiveUsers = users.filter((user) => user.status !== "active").length
  const totalUsers = users.length

  if (loading)
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="teal.500" thickness="4px" />
      </Flex>
    )

  if (error)
    return (
      <Flex justify="center" align="center" h="50vh" direction="column" gap={4}>
        <WarningIcon boxSize={10} color="red.500" />
        <Text color="red.500" fontSize="lg" fontWeight="medium">
          {error}
        </Text>
        <Button colorScheme="teal" onClick={fetchUsers}>
          Try Again
        </Button>
      </Flex>
    )

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1400px" mx="auto">
      {/* Header Section */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading size="lg" color="teal.600" fontWeight="bold">
            User Management
          </Heading>
          <Text color="gray.500" mt={1}>
            Manage your platform users
          </Text>
        </Box>

        <HStack spacing={4}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="teal" variant="outline">
              Actions
            </MenuButton>
            <MenuList>
  <MenuItem
    icon={<EmailIcon />}
    onClick={() => {
      setSelectedUsers(users.map((user) => user.id)); // select all users
      setIsEmailModalOpen(true);
    }}
  >
    Send Email to All
  </MenuItem>

  <MenuItem
    icon={<EmailIcon />}
    onClick={() => {
      if (selectedUsers.length === 0) {
        toast({
          title: "No users selected",
          description: "Please select users first to email them.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setIsEmailModalOpen(true);
    }}
  >
    Send Email to Selected
  </MenuItem>
</MenuList>

          </Menu>

          {selectedUsers.length > 0 && (
            <Button colorScheme="red" leftIcon={<DeleteIcon />} onClick={openDeleteModal}>
              Delete {selectedUsers.length} Selected
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6} mb={6}>
        <Card bg={cardBg} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Total Users
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="teal.600">
                {totalUsers}
              </StatNumber>
              <HStack mt={2}>
                <TimeIcon color="gray.400" />
                <Text fontSize="sm" color="gray.500">
                  Updated just now
                </Text>
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Active Users
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">
                {activeUsers}
              </StatNumber>
              <HStack mt={2}>
                <CheckCircleIcon color="green.400" />
                <Text fontSize="sm" color="gray.500">
                  {Math.round((activeUsers / totalUsers) * 100)}% of total
                </Text>
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Inactive Users
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="red.500">
                {inactiveUsers}
              </StatNumber>
              <HStack mt={2}>
                <WarningIcon color="red.400" />
                <Text fontSize="sm" color="gray.500">
                  {Math.round((inactiveUsers / totalUsers) * 100)}% of total
                </Text>
              </HStack>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Filters Section */}
      <Card mb={6} bg={cardBg} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <InputGroup maxW={{ base: "100%", md: "400px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>

            <HStack spacing={4}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                w={{ base: "100%", md: "150px" }}
                borderRadius="md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>

              <Button
                leftIcon={<SearchIcon />}
                colorScheme="teal"
                onClick={() => {
                  // Reset to first page when applying new filters
                  setCurrentPage(1)
                }}
              >
                Filter
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card
        bg={cardBg}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        mb={6}
        overflow="hidden"
      >
        <CardHeader bg={headerBg} py={4} px={6}>
          <Flex justify="space-between" align="center">
            <Text fontWeight="medium">Users ({filteredUsers.length})</Text>
            <HStack>
              <Text fontSize="sm" color="gray.500">
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </Text>
            </HStack>
          </Flex>
        </CardHeader>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={headerBg}>
              <Tr>
                <Th width="50px">
                  <Checkbox
                    isChecked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                    isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < currentUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...new Set([...selectedUsers, ...currentUsers.map((user) => user.id)])])
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => !currentUsers.map((user) => user.id).includes(id)),
                        )
                      }
                    }}
                    borderColor="gray"
                    colorScheme="teal"
                  />
                </Th>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Country</Th>
                <Th>Phone Number</Th>
                <Th>Status</Th>
                <Th>Last Active</Th>
                <Th width="100px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <Tr key={user.id} _hover={{ bg: hoverBg }} transition="background 0.2s">
                    <Td>
                      <Checkbox
                        isChecked={selectedUsers.includes(user.id)}
                        onChange={() =>
                          setSelectedUsers(
                            selectedUsers.includes(user.id)
                              ? selectedUsers.filter((id) => id !== user.id)
                              : [...selectedUsers, user.id],
                          )
                        }
                         colorScheme="teal"  
                         borderColor="gray"       
                      />
                    </Td>
                    <Td fontWeight="medium" color="gray.600">#{user.id}</Td>
                    <Td fontWeight="medium"  color="gray.600">{user.full_name}</Td>
                    <Td  color="gray.600">{user.email}</Td>
                    <Td  color="gray.600">{user.country}</Td>
                    <Td  color="gray.600">{user.phone_number}</Td> 
                    <Td>
                      <Badge colorScheme={user.status === "active" ? "green" : "red"} borderRadius="full" px={2} py={1}>
                        {user.status}
                      </Badge>
                    </Td>
                    <Td  color="gray.600">{user.last_active}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="View Profile" placement="top">
                          <IconButton
                            icon={<ViewIcon />}
                           color="green.500"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            aria-label="View user"
                          />
                        </Tooltip>
                        <Tooltip label="Delete User" placement="top">
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUsers([user.id])
                              openDeleteModal()
                            }}
                            aria-label="Delete user"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={10}>
                    <Box>
                      <Text fontSize="lg" fontWeight="medium" mb={2}>
                        No users found
                      </Text>
                      <Text color="gray.500">Try adjusting your search or filter criteria</Text>
                    </Box>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Flex justify="center" mt={6} mb={4}>
          <HStack spacing={2}>
            <Button
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              colorScheme="teal"
              variant="outline"
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, Math.ceil(filteredUsers.length / usersPerPage)) }, (_, i) => {
              // Logic to show pagination numbers around current page
              let pageNum
              const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  size="sm"
                  colorScheme={currentPage === pageNum ? "teal" : "gray"}
                  variant={currentPage === pageNum ? "solid" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredUsers.length / usersPerPage)))
              }
              isDisabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
              colorScheme="teal"
              variant="outline"
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserProfileModal key={selectedUser.id} user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={handleDeleteUsers}
          onCancel={closeDeleteModal}
          selectedUsers={selectedUsers}
        />
      )}

<ComposeEmailModal
  isOpen={isEmailModalOpen}
  onClose={() => setIsEmailModalOpen(false)}
  selectedUsers={selectedUsers}
/>

    </Box>
  )
}

export default UserManagement
