"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  Avatar,
  Box,
  Flex,
  Text,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  SkeletonCircle,
  SkeletonText,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Container,
} from "@chakra-ui/react"
import { FiSend, FiSearch, FiMenu, FiMoreVertical, FiCheckCircle, FiClock, FiInfo } from "react-icons/fi"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

const InvestorCommunication = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedInvestor, setSelectedInvestor] = useState(null)
  const [investors, setInvestors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)
  const messageContainerRef = useRef(null)
const token = sessionStorage.getItem("token");
  const toast = useToast()
  const [isLoadingInvestors, setIsLoadingInvestors] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false })
  const sidebarWidth = useBreakpointValue({ base: "100%", md: "300px" })

  // Color scheme
  const bgMain = useColorModeValue("white", "gray.800")
  const bgSidebar = useColorModeValue("gray.50", "gray.900")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.100", "gray.700")
  const activeBorderColor = useColorModeValue("teal.500", "teal.200")
  const activeBg = useColorModeValue("teal.50", "teal.900")
  const messageBgSent = useColorModeValue("teal.500", "teal.400")
  const messageBgReceived = useColorModeValue("gray.100", "gray.700")
  const messageTextSent = useColorModeValue("white", "white")
  const messageTextReceived = useColorModeValue("gray.800", "gray.100")
  const inputBg = useColorModeValue("white", "gray.700")
  const headerBg = useColorModeValue("white", "gray.800")

  useEffect(() => {
    fetchInvestors()
  }, [])

  useEffect(() => {
    if (selectedInvestor) {
      fetchMessages()
      if (isMobile) {
        onClose()
      }
    }
  }, [selectedInvestor])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!selectedInvestor) return

    setIsLoadingMessages(true)
    setError(null)
    try {
      const response = await axios.get(`/messages/owner/${selectedInvestor.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Format messages and sort them in chronological order (oldest to newest)
      const formattedMessages = formatMessageTime(response.data)

      // Reverse the array to display newest messages at the bottom
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchInvestors = async () => {
    setIsLoadingInvestors(true)
    setError(null)
    try {
      const response = await axios.get("/investors", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const investorsWithStatus = response.data.map((investor) => ({
        ...investor,
        lastSeen: investor.last_active,
        isOnline: investor.is_online,
        avatar: "https://www.gravatar.com/avatar/?d=mp",
      }))

      setInvestors(investorsWithStatus)
    } catch (error) {
      console.error("Error fetching investors:", error)
      toast({
        title: "Error",
        description: "Failed to load investors",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingInvestors(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage || !selectedInvestor) return
    try {
      const response = await axios.post(
        "/messages",
        { receiverId: selectedInvestor.id, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const newSentMessage = {
        ...response.data,
        sender_role: "owner",
        sender_name: "You",
        isInv: true,
        timestamp: new Date().toISOString(),
        formattedTime: dayjs(new Date()).format("MMMM D, YYYY h:mm A"),
      }

      setMessages((prevMessages) => [...prevMessages, newSentMessage])
      setNewMessage("")
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
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

  // Format timestamp
  const formatMessageTime = (messages) => {
    return messages.map((message) => ({
      ...message,
      formattedTime: dayjs(message.sent_at).format("MMMM D, YYYY h:mm A"),
    }))
  }

  // Format date for message groups
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never online"
    return dayjs(timestamp).fromNow() // e.g., "3 minutes ago"
  }

  // Filter investors based on search query
  const filteredInvestors = investors.filter((investor) =>
    investor.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Render investor list items
  const renderInvestorList = () => {
    if (isLoadingInvestors) {
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

    if (filteredInvestors.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <Text color="gray.500">No investors found</Text>
        </Box>
      )
    }

    return filteredInvestors.map((investor) => (
      <HStack
        key={investor.id}
        p={3}
        borderBottom="1px"
        borderColor={borderColor}
        bg={selectedInvestor?.id === investor.id ? activeBg : "transparent"}
        borderLeft="4px solid"
        borderLeftColor={selectedInvestor?.id === investor.id ? activeBorderColor : "transparent"}
        _hover={{ bg: hoverBg, cursor: "pointer" }}
        onClick={() => setSelectedInvestor(investor)}
      >
        <Box position="relative">
          <Avatar size="md" name={investor.full_name} src={investor.avatar} />
          {investor.isOnline && (
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
            {investor.full_name}
          </Text>
          <HStack fontSize="xs" color="gray.500">
            {investor.isOnline ? (
              <Badge colorScheme="green" variant="subtle" fontSize="xs">
                Online
              </Badge>
            ) : (
              <Text>Last seen {dayjs(investor.lastSeen).fromNow()}</Text>
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
          <Text color="gray.500" textAlign="center">
            No messages yet. Start the conversation by sending a message.
          </Text>
        </Flex>
      )
    }

    return messages.map((msg, index) => {
      const isInv = msg.sender_role === "owner"
      const prevMsg = index > 0 ? messages[index - 1] : null

      // Determine if avatar and name should be displayed
      const showAvatar = !isInv && (!prevMsg || prevMsg.sender_role !== msg.sender_role)
      const showName = !isInv && (!prevMsg || prevMsg.sender_role !== msg.sender_role)

      return (
        <Flex
          key={index}
          direction="column"
          alignSelf={isInv ? "flex-end" : "flex-start"}
          maxW={{ base: "85%", md: "70%" }}
          mb={3}
        >
          {/* Display sender's name if applicable */}
          {showName && (
            <Text fontSize="xs" fontWeight="medium" ml={10} mb={1}>
              {msg.sender_name}
            </Text>
          )}

          <HStack alignItems="flex-end" spacing={2}>
            {/* Display avatar if not from the current user */}
            {!isInv && showAvatar && <Avatar size="sm" name={msg.sender_name} src={selectedInvestor?.avatar} />}

            {/* Empty space to keep the layout consistent */}
            {!isInv && !showAvatar && <Box w="32px" />}

            <Box
              bg={isInv ? messageBgSent : messageBgReceived}
              color={isInv ? messageTextSent : messageTextReceived}
              px={4}
              py={2}
              borderRadius="lg"
              borderBottomLeftRadius={!isInv ? "0" : undefined}
              borderBottomRightRadius={isInv ? "0" : undefined}
              boxShadow="sm"
            >
              <Text>{msg.message}</Text>
            </Box>
          </HStack>

          {/* Display message timestamp and sent status */}
          <Flex justify={isInv ? "flex-end" : "flex-start"} mt={1} ml={!isInv ? 10 : 0}>
            <Text fontSize="xs" color="gray.500" display="flex" alignItems="center">
              {msg.formattedTime}
              {isInv && (
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
    <Container maxW="1200px" py={4}>
      <Box h={{ base: "calc(100vh - 120px)", md: "calc(100vh - 100px)" }} minH="500px">
        <Flex direction="column" h="full" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
          {/* Header */}
          <Flex
            p={4}
            borderBottomWidth="1px"
            borderColor={borderColor}
            bg={headerBg}
              justify="center"
          align="center"
          direction="column"
          textAlign="center"
          >
            <Heading size="lg" color="teal.600" fontWeight="bold" mb={1}>
              Investor Communication
            </Heading>

              {/* Description */}
      
              <Text fontSize="xs" maxW="600px" mx="auto" color="gray.500">
                This section enables property owners to directly communicate with investors. Use the left panel to
                search and select an investor.
              </Text>
    
     

            {isMobile && (
              <IconButton
                icon={<FiMenu />}
                aria-label="Open contacts"
                onClick={onOpen}
                variant="ghost"
                colorScheme="teal"
              />
            )}
          </Flex>

        

          {/* Main content */}
          <Flex flex="1" overflow="hidden">
            {/* Sidebar - Investors List (visible on desktop) */}
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
                    <Input
                      placeholder="Search investors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={inputBg}
                      borderRadius="full"
                    />
                    <InputRightElement>
                      <Icon as={FiSearch} color="gray.500" />
                    </InputRightElement>
                  </InputGroup>
                </Box>
                <Box overflowY="auto" h="calc(100% - 60px)">
                  {renderInvestorList()}
                </Box>
              </Box>
            )}

            {/* Mobile drawer for investor list */}
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">Select Investor</DrawerHeader>
                <DrawerBody p={0}>
                  <Box p={3}>
                    <InputGroup size="md">
                      <Input
                        placeholder="Search investors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        borderRadius="full"
                      />
                      <InputRightElement>
                        <Icon as={FiSearch} color="gray.500" />
                      </InputRightElement>
                    </InputGroup>
                  </Box>
                  <Box>{renderInvestorList()}</Box>
                </DrawerBody>
              </DrawerContent>
            </Drawer>

            {/* Chat Area */}
            <Flex direction="column" flex="1" bg={bgMain} overflow="hidden">
       {/* Chat header */}
{selectedInvestor ? (
  <HStack
    p={2}
    spacing={3}
    borderBottomWidth="1px"
    borderColor={borderColor}
    bg={bgSidebar}
    align="center"
    minH="56px"
  >
    <Avatar
      size="xs" // Smaller avatar
      name={selectedInvestor.full_name}
      src={selectedInvestor.avatar}
    />
    <Box flex="1">
      <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
        {selectedInvestor.full_name}
      </Text>

      {selectedInvestor.isOnline ? (
        <Badge colorScheme="green" variant="subtle" fontSize="2xs">
          Online
        </Badge>
      ) : (
        <Flex align="center" gap={1}>
          <Icon as={FiClock} boxSize={3} color="gray.500" />
          <Text fontSize="2xs" color="gray.500">
            Last seen {formatLastSeen(selectedInvestor.lastSeen)}
          </Text>
        </Flex>
      )}
    </Box>
  </HStack>
) : (
  <Flex
    p={2}
    borderBottomWidth="1px"
    borderColor={borderColor}
    bg={bgSidebar}
    align="center"
    justify="center"
    minH="56px"
  >
    <Text color="gray.500" fontSize="sm">
      {isMobile ? "Tap menu to select an investor" : "Select an investor to start chatting"}
    </Text>
  </Flex>
)}

              {/* Messages area */}
              <Flex
                direction="column"
                flex="1"
                p={3}
                overflowY="auto"
                bg={useColorModeValue("gray.50", "gray.800")}
                ref={messageContainerRef}
                minH="200px"
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
                      placeholder={selectedInvestor ? "Type your message..." : "Select an investor to start chatting"}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      isDisabled={!selectedInvestor}
                      bg={inputBg}
                      pr="4.5rem"
                      borderRadius="full"
                    />
                    <InputRightElement width="4.5rem">
                      <Tooltip label="Send message" placement="top">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          colorScheme="teal"
                          icon={<FiSend />}
                          isDisabled={!selectedInvestor || !newMessage.trim()}
                          onClick={handleSendMessage}
                          borderRadius="full"
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
    </Container>
  )
}

// Helper Icon component
const Icon = ({ as, ...props }) => {
  const Component = as
  return <Component {...props} />
}

export default InvestorCommunication
