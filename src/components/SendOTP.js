import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

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

  // EMAILJSL: EMail Provider
  const SERVICE_ID = "service_xafrl9z";
  const TEMPLATE_ID = "template_9q0yw5i";
  const USER_ID = "ZQcFpx8GBt-59-Q_0";

  // TWILIO : SMS PROVIDER
  const accountSid = "ACed6e83a2d9a5cc0d79eec23705ae1142";
  const authToken = "889b5aab499a39b7006dbafbf82e6f46";
  const twilioNumber = "+19542803027";

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

  const sendSmsOtp = async (otp) => {
    try {
      const headers = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
      });

      const body = new URLSearchParams({
        To: "+" + phone,
        From: twilioNumber,
        Body: `Your OTP code for verifying your 1Fi account is ${otp}. This code is valid for the next 5 minutes. Please use it to complete your verification process.`,
      });

      const response = await fetch(
        "https://api.twilio.com/2010-04-01/Accounts/" +
          accountSid +
          "/Messages.json",
        {
          method: "POST",
          headers: headers,
          body: body.toString(),
        }
      );

      const data = await response.json();
      if (data.error_message) {
        console.error("Error sending SMS:", data.error_message);
      } else {
        console.log("SMS sent successfully:", data);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  };

  const sendEmailOtp = async (otp) => {
    // Send OTP via EmailJS
    try {
      const templateParams = {
        from_name: "1Fi",
        to_email: email,
        email_otp: otp,
      };

      console.log(templateParams);

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
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
      await sendSmsOtp(phoneOtp);
      await sendEmailOtp(emailOtp);
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
