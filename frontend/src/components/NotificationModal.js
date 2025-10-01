"use client"

import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import axios from "axios"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Flex,
  Divider,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  useColorModeValue,
  Icon,
  Heading,
} from "@chakra-ui/react"
import { FiBell, FiInfo, FiAlertCircle, FiCheckCircle, FiMessageCircle, FiClock } from "react-icons/fi"

const NotificationModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Theme colors
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const unreadBg = useColorModeValue("blue.50", "blue.900")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const timeFontColor = useColorModeValue("gray.500", "gray.400")
  const dividerColor = useColorModeValue("gray.200", "gray.700")

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("🚀 Fetching notifications...")
    const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.")

      const response = await axios.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications)

        if (response.data.unreadCount > 0) {
          await markNotificationsAsRead(token)
        }
      } else {
        setError("Unexpected response format. Please try again.")
      }
    } catch (err) {
      setError("Failed to load notifications. Please refresh.")
    } finally {
      setLoading(false)
    }
  }

  const markNotificationsAsRead = async (token) => {
    try {
      await axios.put("/notifications/mark-read", null, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (err) {
      console.error("⚠️ Failed to mark notifications as read:", err.response?.data || err.message)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "alert":
        return FiAlertCircle
      case "success":
        return FiCheckCircle
      case "message":
        return FiMessageCircle
      case "info":
        return FiInfo
      default:
        return FiBell
    }
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups = {}

    notifications.forEach((notification) => {
      const date = notification.created_at ? new Date(notification.created_at) : new Date()
      const dateKey = date.toLocaleDateString()

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(notification)
    })

    return groups
  }

  const notificationGroups = groupNotificationsByDate()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="md" overflow="hidden" maxH="80vh">
        <ModalHeader
          bg={headerBg}
          borderBottomWidth="1px"
          borderColor={borderColor}
          py={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FiBell} mr={2} boxSize={5} color="blue.500" />
          <Heading size="md" color="gray.200">Notifications</Heading>
        </ModalHeader>
        <ModalCloseButton size="lg" top={3} />

        <ModalBody p={0} bg={bgColor}>
          {loading ? (
            <Flex justify="center" align="center" py={10} direction="column">
              <Spinner size="xl" color="blue.500" thickness="3px" speed="0.65s" mb={4} />
              <Text color="gray.500">Loading notifications...</Text>
            </Flex>
          ) : error ? (
            <Alert status="error" variant="left-accent" m={4} borderRadius="md">
              <AlertIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          ) : notifications.length === 0 ? (
            <Flex justify="center" align="center" py={10} direction="column">
              <Icon as={FiBell} boxSize={10} color="gray.400" mb={4} />
              <Text color="gray.500" fontSize="lg">
                No new notifications
              </Text>
            </Flex>
          ) : (
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {Object.entries(notificationGroups).map(([date, notifs]) => (
                <Box key={date}>
                  <Flex px={4} py={2} bg={headerBg} borderBottomWidth="1px" borderColor={dividerColor} align="center">
                    <Icon as={FiClock} color="gray.500" mr={2} boxSize={3} />
                    <Text fontSize="xs" fontWeight="medium" color="gray.500">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </Flex>

                  {notifs.map((notification) => (
                    <Box
                      key={notification.id}
                      px={4}
                      py={3}
                      bg={notification.read_status === "unread" ? unreadBg : "transparent"}
                      borderLeftWidth={notification.read_status === "unread" ? "4px" : "0"}
                      borderLeftColor="blue.500"
                      _hover={{ bg: hoverBg }}
                      transition="background 0.2s"
                    >
                      <HStack spacing={3} align="flex-start">
                        <Flex
                          boxSize="36px"
                          borderRadius="full"
                          bg={`${notification.type?.toLowerCase() || "blue"}.100`}
                          color={`${notification.type?.toLowerCase() || "blue"}.500`}
                          justify="center"
                          align="center"
                          flexShrink={0}
                        >
                          <Icon as={getNotificationIcon(notification.type)} boxSize={5} />
                        </Flex>

                        <VStack spacing={1} align="flex-start" flex={1}>
                          <HStack width="100%" justify="space-between" align="center">
                            <Badge
                              colorScheme={notification.type?.toLowerCase() || "blue"}
                              variant="subtle"
                              px={2}
                              py={0.5}
                              borderRadius="full"
                              fontSize="xs"
                            >
                              {notification.type || "Notification"}
                            </Badge>
                            <Text fontSize="xs" color={timeFontColor}>
                              {formatDate(notification.created_at)}
                            </Text>
                          </HStack>

                          <Text fontSize="sm" fontWeight="medium">
                            {notification.message || "No message available."}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default NotificationModal
