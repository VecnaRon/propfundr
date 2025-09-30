"use client"

import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useColorModeValue,
} from "@chakra-ui/react"

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="lg">
        <ModalHeader bg={useColorModeValue("teal.500", "teal.600")} color="white" borderTopRadius="lg">
          {title}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody p={6}>{children}</ModalBody>
        <ModalFooter bg={useColorModeValue("gray.50", "gray.700")} borderBottomRadius="lg">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  )
}

export default Modal


