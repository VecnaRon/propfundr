import { Box, Button, Flex, Heading, Icon, Text, useToast } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useState } from "react";

const ExportDataSection = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // include auth token if needed
        },
        body: JSON.stringify({
          format: "json", // or "csv", "pdf"
          selectedFields: ["profile", "investments", "transactions"],
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const filename = contentDisposition?.split("filename=")[1] || "exported_data.json";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Your data export has started downloading.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="blue.100" bg="blue.50">
      <Flex align="center" mb={4}>
        <Icon as={DownloadIcon} color="blue.500" boxSize={6} mr={3} />
        <Box>
          <Heading size="md" color="blue.700">
            Export Account Data
          </Heading>
          <Text fontSize="sm" color="blue.600">
            Download all your personal data
          </Text>
        </Box>
      </Flex>

      <Text mb={4} color="blue.700">
        You can export all your personal data including profile information, transaction history, and
        investment records.
      </Text>

      <Button colorScheme="blue" size="md" onClick={handleExport} isLoading={loading}>
        Export Data
      </Button>
    </Box>
  );
};

export default ExportDataSection;
