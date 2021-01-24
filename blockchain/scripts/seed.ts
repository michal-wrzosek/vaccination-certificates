import { ethers } from "hardhat";

import VaccinationCertificatesDeployment from "../typechain/VaccinationCertificates.deployment.json";
import { VaccinationCertificates__factory } from "../typechain";
import { CERTIFICATE_AUTHORITY_ADMIN_ROLE, CERTIFICATE_AUTHORITY_ROLE } from "../src/roles";

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

  // John name Anne
  console.log("Giving Anne a name");
  await contract
    .connect(JohnSigner)
    .setCertificateAuthorityName(Anne, ethers.utils.formatBytes32String("The Netherlands RIVM"));

  // Anne issuing 10 certificates
  const certificates = Array(10)
    .fill(undefined)
    .map((_, index) => ({
      passportCountry: "DE",
      passportCode: `ABCDE${index + 1}`,
      salt: `${index + 1}`,
    }));

  for (let index = 0; index < certificates.length; index++) {
    const { passportCountry, passportCode, salt } = certificates[index];
    const signatureString = `${passportCountry}.${passportCode}.${salt}`;
    const signature = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signatureString));
    console.log(`Anne issue certificate for: ${signatureString}`);
    await contract.connect(AnneSigner).issueCertificate(signature);
  }

  console.log("Done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
