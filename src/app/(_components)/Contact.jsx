import React from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  IconButton,
} from "@mui/material";
import { Email, Phone, LocationOn, Facebook, Twitter, Instagram } from "@mui/icons-material";

const ContactPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5, mt: '64px' }}>
      {/* Header Section */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
        Get in Touch with Us
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Whether you have a question, feedback, or need support, we're here to help. Reach out to us anytime!
        </Typography>
      </Box>

      <Grid container spacing={5}>
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Contact Form
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Fill out the form below, and we’ll get back to you as soon as possible.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Contact Information
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Here’s how you can reach us.
          </Typography>
          <Card sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Email color="primary" />
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    Email: <a href="mailto:support@auction.com">support@auction.com</a>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Phone color="primary" />
                </Grid>
                <Grid item>
                  <Typography variant="body1">Phone: +1 234 567 890</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <LocationOn color="primary" />
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    Address: 123 Auction Street, BidCity, BC 45678
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Social Media Links */}
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Follow Us
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Stay updated on the latest news and auctions.
        </Typography>
        <Box>
          <IconButton color="primary" href="https://facebook.com" target="_blank">
            <Facebook />
          </IconButton>
          <IconButton color="primary" href="https://twitter.com" target="_blank">
            <Twitter />
          </IconButton>
          <IconButton color="primary" href="https://instagram.com" target="_blank">
            <Instagram />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default ContactPage;
