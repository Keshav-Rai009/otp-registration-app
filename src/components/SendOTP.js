import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { generateOtp, sendEmailOtp, sendSmsOtp } from "../utils/otpsUtil";
import { useUser } from "../context/UserContext";

function SendOtp({ onOtpSent }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [otpText, setOtpText] = useState("");
  const [disableButton, setDisableButton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState("");

  const { updateUser } = useUser();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{12}$/;

  const handlePhone = (phone) => {
    setPhone(phone);
    if (!phoneRegex.test(phone)) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
    }
  };

  const handleEmail = (email) => {
    setEmail(email);
    if (!emailRegex.test(email)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  useEffect(() => {
    if (!phoneError && !emailError && phone && email) {
      setDisableButton(false);
    } else {
      setDisableButton(true);
    }
  }, [phone, email, phoneError, emailError]);

  const handleSendOtp = async () => {
    setOtpText("Sending OTPs. Please wait...");
    const phoneOtp = generateOtp();
    const emailOtp = generateOtp();

    try {
      setLoading(true);
      await sendSmsOtp(phone, phoneOtp);
      await sendEmailOtp(email, emailOtp);
      setDisableButton(true);
      setOtpText("OTPs sent! Taking you to the verification screen.");
      updateUser({
        email,
        phone,
        emailOtp,
        phoneOtp,
        emailOtpExpiration: Date.now() + 300000,
        phoneOtpExpiration: Date.now() + 300000,
      });
      setTimeout(() => {
        onOtpSent({ email, phone });
      }, 3000);
    } catch (error) {
      setOtpText("");
      setNetworkError("Failed to send OTP. Please try again after some time");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: 400, margin: "auto", mt: 5 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ padding: "1rem", textAlign: "center" }}
      >
        Register with 1Fi
      </Typography>

      {/* Phone Input with Validation */}
      <TextField
        label="Enter Phone"
        variant="outlined"
        fullWidth
        value={phone}
        onChange={(e) => handlePhone(e.target.value)}
        error={phoneError}
        helperText={
          phoneError
            ? "Please enter a valid 10-digit phone number with country code"
            : ""
        }
        sx={{ mb: 2 }}
      />

      {/* Email Input with Validation */}
      <TextField
        label="Enter Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => handleEmail(e.target.value)}
        error={emailError}
        helperText={emailError ? "Please enter a valid email address" : ""}
        sx={{ mb: 2 }}
      />

      {/* Send OTP Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSendOtp}
        sx={{ mb: 2 }}
        disabled={phoneError || emailError || disableButton || loading}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "white" }} />
        ) : (
          "Send OTP"
        )}
      </Button>

      <Typography
        sx={{
          textAlign: "center",
          color: "green",
          opacity: otpText ? 1 : 0,
          transition: "opacity 1s ease-in-out",
        }}
      >
        {otpText}
      </Typography>

      {networkError && (
        <Typography sx={{ textAlign: "center", color: "red" }}>
          {networkError}
        </Typography>
      )}
    </Box>
  );
}

export default SendOtp;
