"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  Box,
  Flex,
  Text,
  Heading,
  Input,
  Avatar,
  VStack,
  HStack,
  Badge,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  SkeletonCircle,
  SkeletonText,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  useToast,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import { FiSend, FiSearch, FiMenu, FiMoreVertical, FiCheckCircle } from "react-icons/fi"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

const OwnerCommunication = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [owners, setOwners] = useState([])
  const [isLoadingOwners, setIsLoadingOwners] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
 const token = sessionStorage.getItem("token");

  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false })
  const sidebarWidth = useBreakpointValue({ base: "100%", md: "280px" })

  // Theme colors
  const bgMain = useColorModeValue("white", "gray.800")
  const bgSidebar = useColorModeValue("gray.50", "gray.900")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.100", "gray.700")
  const activeBg = useColorModeValue("teal.50", "teal.900")
  const activeBorderColor = useColorModeValue("teal.500", "teal.200")
  const messageBgSent = useColorModeValue("teal.500", "teal.400")
  const messageBgReceived = useColorModeValue("gray.100", "gray.700")
  const messageTextSent = useColorModeValue("white", "white")
  const messageTextReceived = useColorModeValue("gray.800", "gray.100")
  const inputBg = useColorModeValue("white", "gray.700")
  const mutedColor = useColorModeValue("gray.500", "gray.400")

  useEffect(() => {
    fetchOwners()
  }, [])

  useEffect(() => {
    if (selectedOwner) {
      fetchMessages()
      if (isMobile) {
        onClose()
      }
    }
  }, [selectedOwner])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!selectedOwner) return

    setIsLoadingMessages(true)
    setError(null)

    try {
      const response = await axios.get(`/messages/investor/${selectedOwner.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Format timestamps and update messages
      const formattedMessages = formatTimestamp(response.data)
      setMessages(formattedMessages.reverse())
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("Failed to load messages. Please try again.")
      toast({
        title: "Error loading messages",
        description: "Could not load conversation history.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchOwners = async () => {
    setIsLoadingOwners(true)
    setError(null)

    try {
      const response = await axios.get("/owners", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const ownersWithStatus = response.data.map((owner) => ({
        ...owner,
        lastSeen: owner.last_active, // Fix key name
        isOnline: owner.is_online, // Fix key name
        avatar: "https://www.gravatar.com/avatar/?d=mp", // default Gravatar
      }))

      setOwners(ownersWithStatus)
    } catch (error) {
      console.error("Error fetching owners:", error)
      setError("Failed to load owners. Please try again.")
      toast({
        title: "Error loading owners",
        description: "Could not load the list of property owners.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingOwners(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedOwner) return

    try {
      const response = await axios.post(
        "/messages",
        { receiverId: selectedOwner.id, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const newSentMessage = {
        ...response.data,
        sender_role: "investor",
        sender_name: "You",
        isOwn: true,
        timestamp: new Date().toISOString(),
      }

      setMessages((prevMessages) => [...prevMessages, newSentMessage]) // Add at the end
      setNewMessage("")
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Message not sent",
        description: "There was an error sending your message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (messages) => {
    return messages.map((message) => ({
      ...message,
      formattedTime: dayjs(message.sent_at).format("MMMM D, YYYY h:mm A"), // This formats the timestamp to a readable format
    }))
  }

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never online"
    return dayjs(timestamp).fromNow() // e.g., "3 minutes ago"
  }

  // Filter owners based on search query
  const filteredOwners = owners.filter((owner) => owner.full_name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Render owner list items
  const renderOwnerList = () => {
    if (isLoadingOwners) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <HStack key={index} p={3} borderBottom="1px" borderColor={borderColor}>
            <SkeletonCircle size="10" />
            <Box flex="1">
              <SkeletonText noOfLines={2} spacing="2" />
            </Box>
          </HStack>
        ))
    }

    if (filteredOwners.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <Text color="gray.500">No owners found</Text>
        </Box>
      )
    }

    return filteredOwners.map((owner) => (
      <HStack
        key={owner.id}
        p={3}
        borderBottom="1px"
        borderColor={borderColor}
        bg={selectedOwner?.id === owner.id ? activeBg : "transparent"}
        borderLeft="4px solid"
        borderLeftColor={selectedOwner?.id === owner.id ? activeBorderColor : "transparent"}
        _hover={{ bg: hoverBg, cursor: "pointer" }}
        onClick={() => setSelectedOwner(owner)}
      >
        <Box position="relative">
          <Avatar size="md" name={owner.full_name} src={owner.avatar} />
          {owner.isOnline && (
            <Badge
              position="absolute"
              bottom="0"
              right="0"
              borderRadius="full"
              bg="green.400"
              boxSize="12px"
              border="2px solid"
              borderColor={bgSidebar}
            />
          )}
        </Box>

        <Box flex="1" ml={2}>
          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
            {owner.full_name}
          </Text>
          <HStack fontSize="xs" color={mutedColor}>
            {owner.isOnline ? (
              <Badge colorScheme="green" variant="subtle" fontSize="xs">
                Online
              </Badge>
            ) : (
              <Text>Last seen {dayjs(owner.lastSeen).fromNow()}</Text>
            )}
          </HStack>
        </Box>
      </HStack>
    ))
  }
  // Render message bubbles
  const renderMessages = () => {
    // Show skeleton loading if messages are still loading
    if (isLoadingMessages) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <Box key={index} alignSelf={index % 2 === 0 ? "flex-start" : "flex-end"} maxW="70%" mb={4}>
            <SkeletonText noOfLines={2} spacing="2" />
          </Box>
        ))
    }

    // Show message when no messages are available
    if (messages.length === 0) {
      return (
        <Flex justify="center" align="center" h="100%" p={4}>
          <Text color={mutedColor} textAlign="center">
            No messages yet. Start the conversation by sending a message.
          </Text>
        </Flex>
      )
    }

    return messages.map((msg, index) => {
      const isOwn = msg.sender_role === "investor"
      const prevMsg = index > 0 ? messages[index - 1] : null

      // Determine if avatar and name should be displayed
      const showAvatar = !isOwn && (!prevMsg || prevMsg.sender_role !== msg.sender_role)
      const showName = !isOwn && (!prevMsg || prevMsg.sender_role !== msg.sender_role)

      return (
        <Flex key={index} direction="column" alignSelf={isOwn ? "flex-end" : "flex-start"} maxW="70%" mb={3}>
          {/* Display sender's name if applicable */}
          {showName && (
            <Text fontSize="xs" fontWeight="medium" ml={10} mb={1} color={mutedColor}>
              {msg.sender_name}
            </Text>
          )}

          <HStack alignItems="flex-end" spacing={2}>
            {/* Display avatar if not from the current user */}
            {!isOwn && showAvatar && <Avatar size="sm" name={msg.sender_name} src={selectedOwner?.avatar} />}

            {/* Empty space to keep the layout consistent */}
            {!isOwn && !showAvatar && <Box w="32px" />}

            <Box
              bg={isOwn ? messageBgSent : messageBgReceived}
              color={isOwn ? messageTextSent : messageTextReceived}
              px={4}
              py={2}
              borderRadius="lg"
              borderBottomLeftRadius={!isOwn ? "0" : undefined}
              borderBottomRightRadius={isOwn ? "0" : undefined}
              boxShadow="sm"
              wordBreak="break-word"
            >
              <Text>{msg.message}</Text>
            </Box>
          </HStack>

          {/* Display message timestamp and sent status */}
          <Flex justify={isOwn ? "flex-end" : "flex-start"} mt={1} ml={!isOwn ? 10 : 0}>
            <Text fontSize="xs" color={mutedColor} display="flex" alignItems="center">
              {dayjs(msg.sent_at).format("h:mm A")}
              {isOwn && (
                <Box as="span" ml={1}>
                  <Icon as={FiCheckCircle} boxSize={3} color="green.500" />
                </Box>
              )}
            </Text>
          </Flex>
        </Flex>
      )
    })
  }

  return (
    <Box maxW="1200px" mx="auto" h="calc(100vh - 100px)" minH="500px">
      <Flex direction="column" h="full" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
        {/* Header */}
        <Flex
          p={4}
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={bgMain}
          justify="center"
          align="center"
          direction="column"
          textAlign="center"
        >
          <Heading size="lg" color="teal.600" fontWeight="bold" mb={1}>
            Owner Communication
          </Heading>
          <Text fontSize="sm" color={mutedColor} maxW="600px" mx="auto">
            Connect directly with property owners to discuss investments
          </Text>
          {isMobile && (
            <IconButton
              icon={<FiMenu />}
              aria-label="Open contacts"
              onClick={onOpen}
              variant="ghost"
              colorScheme="teal"
              position="absolute"
              top="4"
              right="4"
            />
          )}
        </Flex>

        {/* Main content */}
        <Flex flex="1" overflow="hidden">
          {/* Sidebar - Owner List (visible on desktop) */}
          {!isMobile && (
            <Box
              w={sidebarWidth}
              borderRightWidth="1px"
              borderColor={borderColor}
              bg={bgSidebar}
              overflow="hidden"
              display={{ base: "none", md: "block" }}
            >
              <Box p={3}>
                <InputGroup size="md">
                  <InputRightElement pointerEvents="none">
                    <FiSearch color="gray.500" />
                  </InputRightElement>
                  <Input
                    placeholder="Search owners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={inputBg}
                  />
                </InputGroup>
              </Box>
              <Box
                overflowY="auto"
                h="calc(100% - 60px)"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: borderColor,
                    borderRadius: "24px",
                  },
                }}
              >
                {renderOwnerList()}
              </Box>
            </Box>
          )}

          {/* Mobile drawer for owner list */}
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Select Owner</DrawerHeader>
              <DrawerBody p={0}>
                <Box p={3}>
                  <InputGroup size="md">
                    <InputRightElement pointerEvents="none">
                      <FiSearch color="gray.500" />
                    </InputRightElement>
                    <Input
                      placeholder="Search owners..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Box>
                <Box overflowY="auto" h="calc(100% - 60px)">
                  {renderOwnerList()}
                </Box>
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          {/* Chat Area */}
          <Flex direction="column" flex="1" bg={bgMain} overflow="hidden">
            {/* Chat header */}
            {selectedOwner ? (
              <HStack p={4} borderBottomWidth="1px" borderColor={borderColor} bg={bgSidebar}>
                <Avatar size="sm" name={selectedOwner.full_name} src={selectedOwner.avatar} />
                <Box flex="1">
                  <Text fontWeight="bold">{selectedOwner.full_name}</Text>
                  <Text fontSize="xs" color={mutedColor}>
                    {selectedOwner.isOnline ? (
                      <Badge colorScheme="green" variant="subtle">
                        Online
                      </Badge>
                    ) : (
                      `Last seen ${formatLastSeen(selectedOwner.lastSeen)}`
                    )}
                  </Text>
                </Box>
               
              </HStack>
            ) : (
              <Flex
                p={4}
                borderBottomWidth="1px"
                borderColor={borderColor}
                bg={bgSidebar}
                align="center"
                justify="center"
              >
                <Text color={mutedColor}>
                  {isMobile ? "Tap menu to select an owner":"Select an owner to start chatting"}
                </Text>
              </Flex>
            )}

            {/* Messages area */}
            <Flex
              direction="column"
              flex="1"
              p={4}
              overflowY="auto"
              bg={useColorModeValue("gray.50", "gray.800")}
              css={{
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: borderColor,
                  borderRadius: "24px",
                },
              }}
            >
              {error ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              ) : (
                <VStack spacing={0} align="stretch">
                  {renderMessages()}
                  <div ref={messagesEndRef} />
                </VStack>
              )}
            </Flex>

            {/* Message input */}
            <Box p={3} borderTopWidth="1px" borderColor={borderColor} bg={bgSidebar}>
              <Flex>
                <InputGroup size="md">
                  <Input
                    placeholder={selectedOwner ? "Type your message..." : "Select an owner to start chatting"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    isDisabled={!selectedOwner}
                    bg={inputBg}
                    pr="4.5rem"
                  />
                  <InputRightElement width="4.5rem">
                    <Tooltip label="Send message" placement="top">
                      <IconButton
                        h="1.75rem"
                        size="sm"
                        colorScheme="teal"
                        icon={<FiSend />}
                        isDisabled={!selectedOwner || !newMessage.trim()}
                        onClick={handleSendMessage}
                      />
                    </Tooltip>
                  </InputRightElement>
                </InputGroup>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

// Helper Icon component
const Icon = ({ as, ...props }) => {
  const Component = as
  return <Component {...props} />
}

export default OwnerCommunication
