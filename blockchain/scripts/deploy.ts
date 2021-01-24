import path from "path";
import { promises as fs } from "fs";
import { ethers } from "hardhat";

import { VaccinationCertificates__factory } from "../typechain";
import { VACCINATION_CERTIFICATES } from "../src/contracts";

async function main() {
  const Contract = ((await ethers.getContractFactory(
    VACCINATION_CERTIFICATES
  )) as any) as VaccinationCertificates__factory;
  const contract = await Contract.deploy();

  console.log("Network name:", ethers.provider.network.name);
  console.log("Network chain id:", ethers.provider.network.chainId);
  console.log("Contract address:", contract.address);

  const deploymentJson = {
    networkChainId: ethers.provider.network.chainId,
    contractAddress: contract.address,
  };

  await fs.writeFile(
    path.join(__dirname, "..", "typechain", `${VACCINATION_CERTIFICATES}.deployment.json`),
    JSON.stringify(deploymentJson, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
