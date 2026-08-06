import {
  BrainCircuit,
  ScanFace,
  Fingerprint,
  ShieldCheck,
  Network,
  KeyRound,
} from "lucide-react";

export const featureData = [
  {
    title: "AI Risk Detection",
    description:
      "Analyze every login attempt in real time and detect suspicious behaviour before access is granted.",
    icon: BrainCircuit,
  },

  {
    title: "Face Authentication",
    description:
      "Verify users using facial recognition for passwordless and secure authentication.",
    icon: ScanFace,
  },

  {
    title: "Trusted Devices",
    description:
      "Recognize previously verified devices and reduce unnecessary authentication steps.",
    icon: Fingerprint,
  },

  {
    title: "Google OAuth",
    description:
      "Allow secure sign-in using Google while maintaining JWT-based authorization.",
    icon: ShieldCheck,
  },

  {
    title: "OTP Verification",
    description:
      "Email-based OTP verification provides an additional authentication layer.",
    icon: KeyRound,
  },

  {
    title: "Microservice Architecture",
    description:
      "Independent authentication, banking, and device services ensure scalability.",
    icon: Network,
  },
];