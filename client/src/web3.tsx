import React from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import detectEthereumProvider from "@metamask/detect-provider";
import { BehaviorSubject } from "rxjs";
import { nanoid } from "nanoid";

import VaccinationCertificatesSchema from "./contracts/VaccinationCertificates.json";
import { EthereumProvider } from "./EthereumProvider";
import { CertificateProofType } from "./types/certificate-proof-type";

export const accountSubject = new BehaviorSubject<string | undefined>(undefined);

export const AccountContext = React.createContext<typeof accountSubject>(accountSubject);

export const AccountProvider: React.FC = ({ children }) => (
  <AccountContext.Provider value={accountSubject}>{children}</AccountContext.Provider>
);

export const useAccount = () => {
  const subject = React.useContext(AccountContext);
  const [account, setAccount] = React.useState(subject.getValue());

  if (!subject) throw new Error("AccountProvider missing");

  React.useState(() => {
    const subscription = subject.subscribe(setAccount);

    return () => subscription.unsubscribe();
  });

  return account;
};

interface ContractSchemaNetwork {
  address: string;
}

interface ContractSchema {
  abi: AbiItem[];
  networks: Record<string, ContractSchemaNetwork>;
}

const TypedVaccinationCertificatesSchema = VaccinationCertificatesSchema as ContractSchema;

let web3: Web3 | undefined;
let provider: EthereumProvider | undefined;
let vaccinationCertificates: any;

export async function configureWeb3(): Promise<Web3 | undefined> {
  if (web3) return web3;

  provider = (await detectEthereumProvider()) as EthereumProvider | undefined;

  if (!provider) return;

  web3 = new Web3(provider);

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = TypedVaccinationCertificatesSchema.networks[networkId];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vaccinationCertificates = new web3.eth.Contract(
    TypedVaccinationCertificatesSchema.abi,
    deployedNetwork && deployedNetwork.address
  );

  return web3;
}

export async function connectToMetamask(): Promise<boolean> {
  if (!web3) return false;
  if (!provider) return false;

  await provider.request({ method: "eth_requestAccounts" });
  const [account] = await web3.eth.getAccounts();

  accountSubject.next(account);

  provider.on("accountsChanged", async () => {
    if (!web3) return false;
    const [account] = await web3.eth.getAccounts();

    accountSubject.next(account);
  });

  return !!account;
}

interface IssueCertificateProps {
  passportCountry: string;
  passportNr: string;
}

export async function issueCertificate({
  passportCountry,
  passportNr,
}: IssueCertificateProps): Promise<CertificateProofType> {
  if (!web3) throw new Error("web3 not available");
  if (!provider) throw new Error("provider not available");
  if (!vaccinationCertificates) throw new Error("vaccinationCertificates not available");

  const account = accountSubject.getValue();
  if (!account) throw new Error("account not available");

  const CERTIFICATE_AUTHORITY_ROLE = web3.utils.keccak256("CERTIFICATE_AUTHORITY_ROLE");
  const isCertificateAuthority = await vaccinationCertificates.methods
    .hasRole(CERTIFICATE_AUTHORITY_ROLE, account)
    .call({ from: account });
  if (!isCertificateAuthority) throw new Error("account does not have CERTIFICATE_AUTHORITY_ROLE role");

  const signatureSalt = nanoid(21);

  const signature = web3.utils.keccak256(`${passportCountry}.${passportNr}.${signatureSalt}`);

  const recipt = await vaccinationCertificates.methods.issueCertificate(signature).send({ from: account });
  console.log("recipt", recipt);

  return {
    passportCountry,
    passportNr,
    signatureSalt,
  };
}

export async function verifyCertificate({ passportCountry, passportNr, signatureSalt }: CertificateProofType) {
  if (!web3) throw new Error("web3 not available");
  if (!vaccinationCertificates) throw new Error("vaccinationCertificates not available");

  const account = accountSubject.getValue();
  if (!account) throw new Error("account not available");

  const signature = web3.utils.keccak256(`${passportCountry}.${passportNr}.${signatureSalt}`);

  const certificate = await vaccinationCertificates.methods.certificates(signature).call({ from: account });

  return certificate.signature !== signature ? undefined : certificate;
}
