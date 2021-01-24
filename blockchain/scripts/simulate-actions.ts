import { ethers } from "hardhat";

import VaccinationCertificatesDeployment from "../typechain/VaccinationCertificates.deployment.json";
import { VaccinationCertificates__factory } from "../typechain";
import { CERTIFICATE_AUTHORITY_ADMIN_ROLE, CERTIFICATE_AUTHORITY_ROLE } from "../src/roles";

async function wait(nrOfSeconds: number): Promise<undefined> {
  return new Promise<undefined>((resolve) => {
    setTimeout(() => resolve(undefined), nrOfSeconds * 1000);
  });
}

async function main() {
  const [OwnerSigner, JohnSigner, AnneSigner] = await ethers.getSigners();
  const John = await JohnSigner.getAddress();
  const Anne = await AnneSigner.getAddress();

  const contract = VaccinationCertificates__factory.connect(
    VaccinationCertificatesDeployment.contractAddress,
    ethers.provider
  );

  // Make John a CA Admin
  console.log("Owner grants John CA Admin role");
  await contract.connect(OwnerSigner).grantRole(CERTIFICATE_AUTHORITY_ADMIN_ROLE, John);

  // Make Anne a CA
  console.log("John grants Anne CA role");
  await contract.connect(JohnSigner).grantRole(CERTIFICATE_AUTHORITY_ROLE, Anne);

  // Anne issue a certificate every 30 sec
  while (true) {
    const randomInteger = Math.round(Math.random() * 10e16);
    const signatureString = `DE.ABCDE${randomInteger}.${randomInteger}`;
    const signature = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signatureString));
    console.log(`Anne issue certificate for: ${signatureString}`);
    await contract.connect(AnneSigner).issueCertificate(signature);
    await wait(30);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
