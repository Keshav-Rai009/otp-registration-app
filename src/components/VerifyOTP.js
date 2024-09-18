import React, { useState } from "react";
import { TextField, Button, Box, Typography, Grid } from "@mui/material";
import { useUser } from "../context/UserContext";
import { generateOtp, sendEmailOtp, sendSmsOtp } from "../utils/otpsUtil";

function VerifyOtp(sendOtp) {
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [retry, setRetry] = useState(2);
  const [disableResend, setDisableResend] = useState(false);
  const [resendMessage, setResendMessage] = useState({
    message: "",
    visible: false,
  });
  const [fadeOut, setFadeOut] = useState(false);

  // Retrieve user data from UserContext
  const { user, updateUser } = useUser();
  console.log(user);

  const handleVerifyOtp = () => {
    // Compare input OTPs with stored OTPs in context
    if (
      phoneOtp === String(user.phoneOtp) &&
      emailOtp === String(user.emailOtp)
    ) {
      setStatusMessage("OTP verification successful!");
      setIsVerified(true);
      setDisableResend(true);
      setPhoneOtp("");
      setEmailOtp("");
      //handleOtpVerification(true);

      // Update verification status in context
      updateUser({
        emailVerified: true,
        phoneVerified: true,
      });
    } else {
      setStatusMessage("Failed to verify OTPs. Please try again.");
      setIsVerified(false);
    }
  };

  const handleOtpVerification = (isVerified) => {
    if (isVerified) {
      alert("Verification successful! Exiting the app...");

      // For Web
      if (typeof window !== "undefined") {
        window.close();
      }
    } else {
      alert("OTP verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (retry > 0) {
      setDisableResend(true);
      setRetry(retry - 1);
      setStatusMessage("");

      // Regenerate OTPs and update context
      const newPhoneOtp = generateOtp();
      const newEmailOtp = generateOtp();

      await sendSmsOtp(user.phone, newPhoneOtp);
      await sendEmailOtp(user.email, newEmailOtp);

      updateUser({
        phoneOtp: newPhoneOtp,
        emailOtp: newEmailOtp,
        emailOtpExpiration: new Date(Date.now() + 5 * 60000),
        phoneOtpExpiration: new Date(Date.now() + 5 * 60000),
      });

      setResendMessage({
        message: "OTPs resent successfully.",
        visible: true,
      });

      setFadeOut(false);

      // Disable resend for 10 seconds
      setTimeout(() => {
        setDisableResend(false);
      }, 10000);

      // Fade-out effect for the resend message
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setResendMessage({ message: "", visible: false });
        }, 500);
      }, 5000);
    } else {
      setTimeout(() => {
        setResendMessage({
          message: "Max attempts reached. Please try later.",
          visible: true,
        });
      }, 0);
      setStatusMessage("Max attempts reached. Please try later.");
      setDisableResend(true);
    }
  };

  return (
    <Box sx={{ width: 400, margin: "auto", mt: 5 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "center", padding: "1rem" }}
      >
        Verify OTP
      </Typography>

      {/* Phone OTP Input */}
      <TextField
        label="Phone OTP"
        variant="outlined"
        fullWidth
        value={phoneOtp}
        onChange={(e) => setPhoneOtp(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Email OTP Input */}
      <TextField
        label="Email OTP"
        variant="outlined"
        fullWidth
        value={emailOtp}
        onChange={(e) => setEmailOtp(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Verify OTP Button */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleVerifyOtp}
            disabled={!phoneOtp || !emailOtp}
          >
            Verify OTP
          </Button>
        </Grid>

        {/* Resend OTP Button */}
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleResendOtp}
            disabled={disableResend}
          >
            Resend OTP
          </Button>
        </Grid>
      </Grid>

      {/* Status Messages */}
      {statusMessage && (
        <Typography
          sx={{
            mt: 2,
            color: isVerified ? "green" : "red",
            textAlign: "center",
          }}
        >
          {statusMessage}
        </Typography>
      )}

      {/* Resend message with transition */}
      {resendMessage.visible && (
        <Typography
          sx={{
            mt: 2,
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 1s ease-in-out",
            color: "green",
            textAlign: "center",
          }}
        >
          {resendMessage.message}
        </Typography>
      )}
    </Box>
  );
}

export default VerifyOtp;
