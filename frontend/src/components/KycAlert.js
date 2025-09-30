import { Alert, AlertIcon, AlertTitle, Flex } from "@chakra-ui/react"
import { Link } from "react-router-dom"

const KycAlert = ({ message }) => {
  return (
    <Alert status="warning" borderRadius="lg" mb={6} boxShadow="md" variant="left-accent">
      <AlertIcon />
      <Flex justify="space-between" w="100%" align="center">
        <AlertTitle fontSize="sm">{message}</AlertTitle>
        <Link
          to="/kyc"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
            background: "rgba(236, 201, 75, 0.2)",
            padding: "4px 10px",
            borderRadius: "4px",
            marginLeft: "8px",
          }}
        >
          Complete now
        </Link>
      </Flex>
    </Alert>
  )
}

export default KycAlert
