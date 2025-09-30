"use client"
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
  Avatar,
  VStack,
  HStack,
  Badge,
  Divider,
  Box,
  Flex,
  Grid,
  GridItem,
  useColorModeValue,
  Heading,
  Tag,
  Tooltip,
} from "@chakra-ui/react"
import { EmailIcon, CalendarIcon, TimeIcon, InfoIcon } from "@chakra-ui/icons"

const UserProfileModal = ({ user, onClose }) => {
  

  const bgColorLight = "white"
  const bgColorDark = "gray.800"
  const borderColorLight = "gray.200"
  const borderColorDark = "gray.700"
  const labelColorLight = "gray.600"
  const labelColorDark = "gray.400"
  const modalContentBgLight = "white"
  const modalContentBgDark = "gray.800"
  const modalFooterBgLight = "gray.50"
  const modalFooterBgDark = "gray.700"
  const dividerColorLight = "gray.200"
  const dividerColorDark = "gray.700"

  const bgColor = useColorModeValue(bgColorLight, bgColorDark)
  const borderColor = useColorModeValue(borderColorLight, borderColorDark)
  const labelColor = useColorModeValue(labelColorLight, labelColorDark)
  const modalContentBg = useColorModeValue(modalContentBgLight, modalContentBgDark)
  const modalFooterBg = useColorModeValue(modalFooterBgLight, modalFooterBgDark)
  const dividerColor = useColorModeValue(dividerColorLight, dividerColorDark)

  // Return null if no user is provided
  if (!user) return null

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "green"
      case "inactive":
        return "red"
      case "pending":
        return "yellow"
      default:
        return "gray"
    }
  }

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "purple"
      case "moderator":
        return "blue"
      case "user":
        return "teal"
      default:
        return "gray"
    }
  }


  // Ban or Unban a user
const handleBanUnban = async (userId) => {
  try {
    const token = sessionStorage.getItem("token");
    await fetch(`http://192.168.100.30:5000/api/admin/users/${userId}/toggle-ban`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    alert('User status updated!');
    onClose(); // Close after action
  } catch (error) {
    console.error('Error banning/unbanning user:', error);
    alert('Failed to update user status');
  }
};

// Reset a user's password
const handleResetPassword = async (userId) => {
  try {
  const token = sessionStorage.getItem("token");
    await fetch(`http://192.168.100.30:5000/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    alert('Password reset successfully. User must set a new password.');
    onClose();
  } catch (error) {
    console.error('Error resetting password:', error);
    alert('Failed to reset password');
  }
};

// Edit a user's role (maybe open another small modal or page later)
const handleEditRole = async (userId) => {
  const newRole = prompt('Enter new role: admin, owner, investor');

  if (!newRole) return;

  try {
   const token = sessionStorage.getItem("token");
    await fetch(`http://192.168.100.30:5000/api/admin/users/${userId}/update-role`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    });
    alert('Role updated successfully!');
    onClose();
  } catch (error) {
    console.error('Error updating role:', error);
    alert('Failed to update user role');
  }
};

  // Calculate days since registration
  const daysSinceRegistration = Math.floor(
    (new Date().getTime() - new Date(user.registration_date).getTime()) / (1000 * 60 * 60 * 24),
  )

  // Calculate hours since last active
  const hoursSinceLastActive = Math.floor(
    (new Date().getTime() - new Date(user.last_active).getTime()) / (1000 * 60 * 60),
  )

  return (
    <Modal isOpen={true} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent bg={modalContentBg} borderRadius="lg" overflow="hidden" boxShadow="xl">
        <Box position="relative">
          {/* Header Background */}
          <Box bg="teal.500" h="100px" />

          {/* Profile Section */}
          <Flex direction="column" align="center" mt="-50px" position="relative" px={6}>
            <Avatar
              size="xl"
              name={user.full_name}
              src={
                user.profile_image ? `http://192.168.100.30:5000/uploads/${user.profile_image}` : "/default-avatar.png"
              }
              border="4px solid"
              borderColor={bgColor}
            />
            <Heading size="md" mt={2} textAlign="center">
              {user.full_name}
            </Heading>
            <HStack mt={1} mb={4}>
              <Tag size="sm" colorScheme={getRoleColor(user.role)} borderRadius="full">
                {user.role}
              </Tag>
              <Badge colorScheme={getStatusColor(user.status)} px={2} py={1} borderRadius="full">
                {user.status}
              </Badge>
            </HStack>
          </Flex>
        </Box>

        <ModalHeader pb={0} pt={0} display="flex" justifyContent="flex-end">
          <ModalCloseButton position="absolute" top={3} right={3} />
        </ModalHeader>

        <ModalBody pt={0}>
          <Divider my={4} />

          <Grid templateColumns="repeat(1, 1fr)" gap={4}>
            <GridItem>
              <HStack spacing={3} align="center">
                <EmailIcon color="teal.500" />
                <Box>
                  <Text fontSize="sm" color={labelColor}>
                    Email
                  </Text>
                  <Text fontWeight="medium">{user.email}</Text>
                </Box>
              </HStack>
            </GridItem>

            <GridItem>
              <HStack spacing={3} align="center">
                <CalendarIcon color="teal.500" />
                <Box>
                  <Text fontSize="sm" color={labelColor}>
                    Registration Date
                  </Text>
                  <Text fontWeight="medium">{new Date(user.registration_date).toLocaleDateString()}</Text>
                </Box>
              </HStack>
            </GridItem>

            <GridItem>
              <HStack spacing={3} align="center">
                <TimeIcon color="teal.500" />
                <Box>
                  <Text fontSize="sm" color={labelColor}>
                    Last Active
                  </Text>
                  <Text fontWeight="medium">{new Date(user.last_active).toLocaleString()}</Text>
                </Box>
              </HStack>
            </GridItem>

            <GridItem>
              <HStack spacing={3} align="center">
                <InfoIcon color="teal.500" />
                <Box>
                  <Text fontSize="sm" color={labelColor}>
                    User ID
                  </Text>
                  <Text fontWeight="medium">#{user.id}</Text>
                </Box>
              </HStack>
            </GridItem>
          </Grid>

          <Divider my={4} />

          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color={labelColor}>
                Activity Summary
              </Text>
              <Flex
                justify="space-between"
                bg="gray.50"
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Tooltip label="Days since registration" placement="top">
                  <VStack spacing={0}>
                    <Text fontWeight="bold" color="teal.500">
                      {daysSinceRegistration}
                    </Text>
                    <Text fontSize="xs" color={labelColor}>
                      Days
                    </Text>
                  </VStack>
                </Tooltip>

                <Divider orientation="vertical" />

                <Tooltip label="User status" placement="top">
                  <VStack spacing={0}>
                    <Text fontWeight="bold" color={`${getStatusColor(user.status)}.500`}>
                      {user.status}
                    </Text>
                    <Text fontSize="xs" color={labelColor}>
                      Status
                    </Text>
                  </VStack>
                </Tooltip>

                <Divider orientation="vertical" />

                <Tooltip label="Last activity" placement="top">
                  <VStack spacing={0}>
                    <Text fontWeight="bold" color="blue.500">
                      {hoursSinceLastActive}h
                    </Text>
                    <Text fontSize="xs" color={labelColor}>
                      Last seen
                    </Text>
                  </VStack>
                </Tooltip>
              </Flex>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter
  bg={modalFooterBg}
  borderTop="1px"
  borderColor={dividerColor}
  flexDirection="column"
  gap={3}
  alignItems="stretch"
>
  {/* Actions */}
  <VStack spacing={3} width="100%">

    {/* Ban / Unban User */}
    <Button
      colorScheme={user.status === 'active' ? 'red' : 'green'}
      onClick={() => handleBanUnban(user.id)}
      width="100%"
    >
      {user.status === 'active' ? 'Ban User' : 'Unban User'}
    </Button>

    {/* Reset Password */}
    <Button
      colorScheme="orange"
      onClick={() => handleResetPassword(user.id)}
      width="100%"
    >
      Reset Password
    </Button>

    {/* Edit Role */}
    <Button
      colorScheme="blue"
      onClick={() => handleEditRole(user.id)}
      width="100%"
    >
      Edit Role
    </Button>

    {/* Close */}
    <Button
      variant="outline"
      onClick={onClose}
      width="100%"
    >
      Close
    </Button>

  </VStack>
</ModalFooter>

      </ModalContent>
    </Modal>
  )
}

export default UserProfileModal
