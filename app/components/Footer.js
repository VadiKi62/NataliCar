"use client";

import React from "react";
import { Grid, Link as MuiLink, Typography, Stack, Box, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import FacebookIcon from "@mui/icons-material/Facebook";

import InstagramIcon from "@mui/icons-material/Instagram";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import DefaultButton from "@/app/components/ui/buttons/DefaultButton";
import DirectionsIcon from "@mui/icons-material/Directions";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CodeIcon from "@mui/icons-material/Code";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { companyData } from "@utils/companyData";

const Section = styled("section")(({ theme }) => ({
  padding: theme.spacing(5),
  borderTop: `1px solid ${theme.palette.secondary.complement}`,
  textAlign: "center",
  background: theme.palette.secondary.main,
  backdropFilter: "blur(60px)",
  color: theme.palette.text.light || "#ffffff",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  lineHeight: "2rem",
  fontSize: "2.9rem",
  marginBottom: theme.spacing(2),
}));

const Slogan = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  textTransform: "uppercase",
  fontSize: "1.2rem",
  lineHeight: "1.8rem",
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
  color: theme.palette.text.light || "#ffffff",
}));

const FooterContainer = styled(Grid)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
  fontFamily: theme.typography.fontFamily,
  display: "flex",
  flexDirection: "column",
  alignContent: "center",
  alignItems: "center",
  textAlign: "center",
}));

const SocialLinks = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const ContactInfo = styled(Grid)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: "1rem",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.9rem",
  },
}));

const ContactIcon = styled("span")(({ theme }) => ({
  marginRight: theme.spacing(1),
  verticalAlign: "middle",
  color: theme.palette.text.light || "#ffffff",
  "& svg": {
    color: theme.palette.text.light || "#ffffff",
  },
}));

const ContactText = styled("span")(({ theme }) => ({
  fontSize: "inherit",
  color: theme.palette.text.light || "#ffffff",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.9rem",
    textTransform: "uppercase",
  },
}));

const ContactLink = styled("a")(({ theme }) => ({
  fontSize: "1.3rem",
  color: theme.palette.text.light || "#ffffff",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.9rem",
    textTransform: "uppercase",
  },
}));

const CopyrightInfo = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: "1rem",
  opacity: 0.8,
}));

const LegalLinksContainer = styled(Box)(({ theme }) => ({
  //marginTop: theme.spacing(19),
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  // backgroundColor: "rgba(0, 0, 0, 0.03)",
  border: `1px solid ${theme.palette.secondary.complement}`,
  width: "100%",
  maxWidth: "600px",
  margin: `${theme.spacing(5)} auto 0`,
}));

const LegalLinks = styled(Stack)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(1),
  textTransform: "uppercase",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
}));

const LegalLinkDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.secondary.complement,
  opacity: 0.5,
  height: theme.spacing(8),
  alignSelf: "stretch",
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const LegalLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.light || "#ffffff",
  textDecoration: "none",
  padding: theme.spacing(0.75, 1.5),
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.9rem",
  fontWeight: 500,
  transition: "all 0.2s ease",
  opacity: 0.9,
  "&:hover": {
    opacity: 1,

    textDecoration: "none",
    transform: "translateY(-1px)",
  },
}));

const CreditsSection = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.secondary.complement}`,
  opacity: 0.7,
  width: "100%",
}));

const CreditsCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  fontFamily: theme.typography.fontFamily,
}));

const CreditLink = styled(MuiLink)(({ theme }) => ({
  color: theme.palette.text.light,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  fontSize: "0.9rem",
  opacity: 1,
  "&:hover": {
    opacity: 1,
    textDecoration: "underline",
  },
}));

const Copyright = styled(Typography)(({ theme }) => ({
  fontSize: "0.85rem",
  opacity: 1,
  color: theme.palette.text.light || "#ffffff",
  fontFamily: theme.typography.fontFamily,
}));

const LogoImg = styled(Image)(({ theme }) => ({
  // marginBottom: "-5px",
  // marginTop: "-4px",
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  textAlign: "center",
}));

function Footer() {
  // const { contacts } = useMyContext();
  const { name, slogan, tel, tel2, email, address, coords } = companyData;
  const currentYear = new Date().getFullYear();

  const router = useRouter();

  const handleClick = () => {
    const destinationURL = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`;
    router.push(destinationURL);
  };

  return (
    <Section>
      <FooterContainer>
        {/* <SectionTitle variant="h3">{name}</SectionTitle> */}
        <LogoImg
          src="/favicon.png"
          width={175}
          height={175}
          alt="to kati allo"
        ></LogoImg>
        <Slogan>{slogan}</Slogan>
        <SocialLinks>
          <MuiLink
            href="https://www.facebook.com/people/Natali-carscom/100053110548109/?sk=about"
            color="inherit"
            target="_blank"
          >
            <FacebookIcon fontSize="large" />
          </MuiLink>
          <MuiLink
            href="https://www.facebook.com/people/Natali-carscom/100053110548109/?sk=about"
            color="inherit"
            target="_blank"
          >
            <InstagramIcon fontSize="large" />
          </MuiLink>
        </SocialLinks>
        <ContactInfo container spacing={2}>
          <DefaultButton
            onClick={handleClick}
            label="Get Directions"
            relative={true}
            minWidth="100%"
            startIcon={<DirectionsIcon />}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: "primary.main",
              color: "secondary.contrastText",
              "&:hover": {
                color: "white",
              },
            }}
          />
          <Grid item xs={12} md={4}>
            <ContactIcon>
              <LocationOnIcon />
            </ContactIcon>
            <ContactText>{address}</ContactText>
          </Grid>
          <Grid item xs={12} md={4}>
            <ContactIcon>
              <EmailIcon />
            </ContactIcon>
            <ContactLink href={`mailto:${email}`}>
              {email}
            </ContactLink>
          </Grid>
          <Grid item xs={12} md={4}>
            <ContactIcon>
              <CallIcon />
            </ContactIcon>
            <ContactLink
              style={{ marginRight: "1px" }}
              href={`tel:${tel}`}
            >
              {tel}
            </ContactLink>
            <ContactIcon sx={{ ml: 1 }}>
              <CallIcon />
            </ContactIcon>
            <ContactLink href={`tel:${tel2}`}>
              {tel2}
            </ContactLink>
          </Grid>
        </ContactInfo>
        <LegalLinksContainer>
          <LegalLinks>
            <LegalLink href="/privacy-policy">Privacy Policy</LegalLink>
            <LegalLinkDivider orientation="vertical" flexItem />
            <LegalLink href="/terms-of-service">Terms of Service</LegalLink>
            <LegalLinkDivider orientation="vertical" flexItem />
            <LegalLink href="/cookie-policy">Cookie Policy</LegalLink>
          </LegalLinks>
        </LegalLinksContainer>
      </FooterContainer>
      <CreditsSection>
        <CreditsCard>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems="center"
            justifyContent="center"
          >
            <CreditLink
              href="https://www.bbqr.site"
              target="_blank"
              rel="noopener noreferrer"
            >
              <QrCode2Icon sx={{ fontSize: 20 }} />
              BBQR - Solutions for Restaurants
            </CreditLink>

            <CreditLink
              href="https://www.linkedin.com/in/natalia-kirejeva/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CodeIcon sx={{ fontSize: 20 }} />
              Developed by NataliaKi
              <LinkedInIcon sx={{ fontSize: 18 }} />
            </CreditLink>
          </Stack>

          <Copyright>
            © {currentYear} {name || "To Kati Allo"}. All rights reserved.
          </Copyright>
        </CreditsCard>
      </CreditsSection>
    </Section>
  );
}

export default Footer;
