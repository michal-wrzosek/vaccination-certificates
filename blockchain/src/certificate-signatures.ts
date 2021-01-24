import { ethers } from "hardhat";

export const getCertificateSignature = (passportCountry: string, passportNr: string, signatureSalt: string) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${passportCountry}.${passportNr}.${signatureSalt}`));
