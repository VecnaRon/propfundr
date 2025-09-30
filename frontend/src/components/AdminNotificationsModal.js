"use client"

import { useEffect, useState, useRef } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Flex,
  Badge,
  Icon,
  List,
  ListItem,
  Spinner,
  useColorModeValue,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import { BellIcon, CheckIcon, InfoIcon, WarningIcon, TimeIcon, ChevronRightIcon } from "@chakra-ui/icons"

const AdminNotificationsModal = ({ closeModal }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const initialRef = useRef()

  // Color values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const unreadBg = useColorModeValue("blue.50", "blue.900")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://192.168.100.30:5000/api/admin/notifications", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      console.log("📩 Fetched Notifications:", data.notifications) // Debugging
      setNotifications(data.notifications || [])
      setLoading(false)
    } catch (err) {
      console.error("❌ Error fetching notifications:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("http://192.168.100.30:5000/api/admin/notifications/read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read")
      }

      // ✅ Update the state to mark all as read
      setNotifications((prevNotifications) => prevNotifications.map((notif) => ({ ...notif, read_status: "read" })))
    } catch (err) {
      console.error("❌ Error marking notifications as read:", err)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "alert":
        return <Icon as={WarningIcon} color="red.500" boxSize={5} />
      case "warning":
        return <Icon as={WarningIcon} color="orange.500" boxSize={5} />
      case "info":
        return <Icon as={InfoIcon} color="blue.500" boxSize={5} />
      case "success":
        return <Icon as={CheckIcon} color="green.500" boxSize={5} />
      default:
        return <Icon as={BellIcon} color="blue.500" boxSize={5} />
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <Modal isOpen={true} onClose={closeModal} size="lg" initialFocusRef={initialRef} scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="lg" maxW={{ base: "90%", md: "600px" }}>
        <ModalHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor} py={4}>
          <Flex justify="space-between" align="center">
            <HStack>
              <Icon as={BellIcon} color="teal.500" boxSize={5} />
              <Text fontSize="lg" fontWeight="bold">
                Notifications
              </Text>
            </HStack>
            <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
              {notifications.filter((n) => n.read_status === "unread").length} Unread
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <Tabs colorScheme="teal" size="sm">
          <TabList px={6} pt={2}>
            <Tab fontWeight="medium">All</Tab>
            <Tab fontWeight="medium">Unread</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <ModalBody p={0} maxH="60vh">
                {loading ? (
                  <Flex justify="center" align="center" h="200px">
                    <Spinner size="lg" thickness="3px" color="teal.500" />
                  </Flex>
                ) : error ? (
                  <Box p={6} textAlign="center">
                    <Text color="red.500">Error loading notifications: {error}</Text>
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box p={6} textAlign="center">
                    <Text color="gray.500">No notifications available</Text>
                  </Box>
                ) : (
                  <List spacing={0}>
                    {notifications.map((notif) => (
                      <ListItem
                        key={notif.id}
                        bg={notif.read_status === "unread" ? unreadBg : bgColor}
                        borderBottomWidth="1px"
                        borderColor={borderColor}
                        transition="background-color 0.2s"
                        _hover={{ bg: hoverBg }}
                      >
                        <Box p={4}>
                          <Flex>
                            <Box mr={3} mt={1}>
                              {getNotificationIcon(notif.type)}
                            </Box>
                            <Box flex="1">
                              <Text fontWeight={notif.read_status === "unread" ? "medium" : "normal"}>
                                {notif.message}
                              </Text>
                              <HStack mt={1} spacing={2}>
                                <Icon as={TimeIcon} color="gray.500" boxSize={3} />
                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(notif.created_at)}
                                </Text>
                                {notif.priority === "high" && (
                                  <Badge colorScheme="red" variant="subtle" fontSize="xs">
                                    High Priority
                                  </Badge>
                                )}
                                {notif.category && (
                                  <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                    {notif.category}
                                  </Badge>
                                )}
                              </HStack>
                            </Box>
                            <Box>
                              <Icon as={ChevronRightIcon} color="gray.400" />
                            </Box>
                          </Flex>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </ModalBody>
            </TabPanel>

            <TabPanel p={0}>
              <ModalBody p={0} maxH="60vh">
                {loading ? (
                  <Flex justify="center" align="center" h="200px">
                    <Spinner size="lg" thickness="3px" color="teal.500" />
                  </Flex>
                ) : error ? (
                  <Box p={6} textAlign="center">
                    <Text color="red.500">Error loading notifications: {error}</Text>
                  </Box>
                ) : notifications.filter((n) => n.read_status === "unread").length === 0 ? (
                  <Box p={6} textAlign="center">
                    <Text color="gray.500">No unread notifications</Text>
                  </Box>
                ) : (
                  <List spacing={0}>
                    {notifications
                      .filter((n) => n.read_status === "unread")
                      .map((notif) => (
                        <ListItem
                          key={notif.id}
                          bg={unreadBg}
                          borderBottomWidth="1px"
                          borderColor={borderColor}
                          transition="background-color 0.2s"
                          _hover={{ bg: hoverBg }}
                        >
                          <Box p={4}>
                            <Flex>
                              <Box mr={3} mt={1}>
                                {getNotificationIcon(notif.type)}
                              </Box>
                              <Box flex="1">
                                <Text fontWeight="medium">{notif.message}</Text>
                                <HStack mt={1} spacing={2}>
                                  <Icon as={TimeIcon} color="gray.500" boxSize={3} />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(notif.created_at)}
                                  </Text>
                                  {notif.priority === "high" && (
                                    <Badge colorScheme="red" variant="subtle" fontSize="xs">
                                      High Priority
                                    </Badge>
                                  )}
                                  {notif.category && (
                                    <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                      {notif.category}
                                    </Badge>
                                  )}
                                </HStack>
                              </Box>
                              <Box>
                                <Icon as={ChevronRightIcon} color="gray.400" />
                              </Box>
                            </Flex>
                          </Box>
                        </ListItem>
                      ))}
                  </List>
                )}
              </ModalBody>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <ModalFooter bg={headerBg} borderTopWidth="1px" borderColor={borderColor}>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={markAllAsRead}
            isDisabled={notifications.every((n) => n.read_status === "read") || notifications.length === 0}
            size="sm"
            ref={initialRef}
          >
            Mark All as Read
          </Button>
          <Button onClick={closeModal} size="sm">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AdminNotificationsModal
