"use client";
import { useState } from "react"
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    useToast,
    Box,
    Text,
    Divider,   
  } from "@chakra-ui/react";
  

const ComposeEmailModal = ({ isOpen, onClose, selectedUsers }) => {
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [emailType, setEmailType] = useState("promotion");

  const handleSend = async () => {
    if (!subject || !message) {
      toast({
        title: "Please fill in both Subject and Message",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
     const token = sessionStorage.getItem("token");

      await fetch("http://192.168.100.30:5000/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          subject,
          message,
          type: emailType,
        }),
      });

      toast({
        title: "Email Sent",
        description: "Your email has been successfully sent",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Compose Email</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
  <FormControl mb={4}>
    <FormLabel>Email Type</FormLabel>
    <Select value={emailType} onChange={(e) => setEmailType(e.target.value)}>
      <option value="promotion">Promotion</option>
      <option value="notification">Platform Notification</option>
      <option value="custom">Custom Message</option>
    </Select>
  </FormControl>

  <FormControl mb={4}>
    <FormLabel>Subject</FormLabel>
    <Input
      placeholder="Enter email subject"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
    />
  </FormControl>

  <FormControl>
    <FormLabel>Message</FormLabel>
    <Textarea
      placeholder="Write your message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      rows={6}
    />
  </FormControl>

  {/* 🔥 Preview Card 🔥 */}
  <Box mt={6} p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
    <Text fontWeight="bold" mb={2} color="gray">
      📧 Live Preview:
    </Text>
    <Text fontSize="sm" fontWeight="bold" color="teal.600">
      Subject: {subject || "Your subject will appear here"}
    </Text>
    <Divider my={2} />
    <Text fontSize="sm" whiteSpace="pre-wrap" color="gray.600">
      {message || "Your email message will appear here..."}
    </Text>
  </Box>
</ModalBody>


        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleSend}>
            Send
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ComposeEmailModal;
