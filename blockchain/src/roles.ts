import { ethers } from "hardhat";

export const DEFAULT_ADMIN_ROLE = ethers.utils.formatBytes32String("");
export const CERTIFICATE_AUTHORITY_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("CERTIFICATE_AUTHORITY_ROLE")
);
export const CERTIFICATE_AUTHORITY_ADMIN_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("CERTIFICATE_AUTHORITY_ADMIN_ROLE")
);
