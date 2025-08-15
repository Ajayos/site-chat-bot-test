import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export default function CenterMessage({ message, config }) {
  const dateBg = config.body.dateSeparatorBg || "#e0e0e0";
  const dateText = config.body.dateSeparatorText || "#000";

  if (message.type === "date") {
    return (
      <Box textAlign="center" my={1}>
        <Chip
          label={message.label}
          sx={{
            bgcolor: dateBg,
            color: dateText,
            fontFamily: config.body.font,
            fontWeight: 600,
          }}
        />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" mb={1}>
      <Box
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: 2,
          bgcolor: dateBg,
          color: dateText,
          fontFamily: config.body.font,
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {message.notification?.body || message.text}
        </Typography>
      </Box>
    </Box>
  );
}
