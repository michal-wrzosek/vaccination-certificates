const { catchRevert } = require("./utils.js");

const VaccinationCertificates = artifacts.require("VaccinationCertificates");

const DEFAULT_ADMIN_ROLE = "0x00";
const CERTIFICATE_AUTHORITY_ROLE = web3.utils.keccak256("CERTIFICATE_AUTHORITY_ROLE");
const CERTIFICATE_AUTHORITY_ADMIN_ROLE = web3.utils.keccak256("CERTIFICATE_AUTHORITY_ADMIN_ROLE");

const getSignature = (passportCountry, passportNr, signatureSalt) =>
  web3.utils.keccak256(`${passportCountry}.${passportNr}.${signatureSalt}`);

describe("VaccinationCertificates", () => {
  contract("VaccinationCertificates", (accounts) => {
    it(`assigns the owner to DEFAULT_ADMIN_ROLE role`, async () => {
      const contract = await VaccinationCertificates.deployed();

      expect(await contract.hasRole.call(DEFAULT_ADMIN_ROLE, accounts[0])).to.be.true;
    });
  });

  contract("VaccinationCertificates", () => {
    it(`sets CERTIFICATE_AUTHORITY_ADMIN_ROLE as admin role for CERTIFICATE_AUTHORITY_ROLE`, async () => {
      const contract = await VaccinationCertificates.deployed();

      expect(await contract.getRoleAdmin.call(CERTIFICATE_AUTHORITY_ROLE)).to.equal(CERTIFICATE_AUTHORITY_ADMIN_ROLE);
    });
  });

  contract("VaccinationCertificates", (accounts) => {
    it(`allows the owner to freely grant and revoke roles`, async () => {
      const contract = await VaccinationCertificates.deployed();

      expect(await contract.hasRole.call(DEFAULT_ADMIN_ROLE, accounts[1])).to.be.false;
      expect(await contract.hasRole.call(CERTIFICATE_AUTHORITY_ROLE, accounts[1])).to.be.false;
      expect(await contract.hasRole.call(CERTIFICATE_AUTHORITY_ADMIN_ROLE, accounts[1])).to.be.false;

      await contract.grantRole.sendTransaction(DEFAULT_ADMIN_ROLE, accounts[1], { from: accounts[0] });
      await contract.grantRole.sendTransaction(CERTIFICATE_AUTHORITY_ROLE, accounts[1], {
        from: accounts[0],
      });
      await contract.grantRole.sendTransaction(CERTIFICATE_AUTHORITY_ADMIN_ROLE, accounts[1], {
        from: accounts[0],
      });

      expect(await contract.hasRole.call(DEFAULT_ADMIN_ROLE, accounts[1])).to.be.true;
      expect(await contract.hasRole.call(CERTIFICATE_AUTHORITY_ROLE, accounts[1])).to.be.true;
      expect(await contract.hasRole.call(CERTIFICATE_AUTHORITY_ADMIN_ROLE, accounts[1])).to.be.true;
    });
  });

  contract("VaccinationCertificates", (accounts) => {
    it(`does not allow users that does not have CA role to call issueCertificate`, async () => {
      const contract = await VaccinationCertificates.deployed();

      expect(await contract.hasRole.call(CERTIFICATE_AUTHORITY_ROLE, accounts[1])).to.be.false;

      await catchRevert(
        contract.issueCertificate.sendTransaction(getSignature("PL", "ZFD12345", "123456"), { from: accounts[1] })
      );
    });
  });

  contract("VaccinationCertificates", (accounts) => {
    it(`creates new certificate`, async () => {
      const contract = await VaccinationCertificates.deployed();

      await contract.grantRole.sendTransaction(CERTIFICATE_AUTHORITY_ROLE, accounts[1], {
        from: accounts[0],
      });

      await contract.issueCertificate.sendTransaction(getSignature("PL", "ZFD12345", "123456"), { from: accounts[1] });

      const lastBlockTimestamp = (await web3.eth.getBlock("latest")).timestamp;

      const certificate = await contract.certificates.call(getSignature("PL", "ZFD12345", "123456"));

      expect(certificate.signature).to.equal(getSignature("PL", "ZFD12345", "123456"));
      expect(certificate.authority).to.equal(accounts[1]);
      expect(certificate.timestamp.toNumber()).to.equal(lastBlockTimestamp);
    });
  });

  contract("VaccinationCertificates", (accounts) => {
    it(`does not allow to overwrite existing certificate`, async () => {
      const contract = await VaccinationCertificates.deployed();

      await contract.grantRole.sendTransaction(CERTIFICATE_AUTHORITY_ROLE, accounts[1], {
        from: accounts[0],
      });

      await contract.issueCertificate.sendTransaction(getSignature("PL", "ZFD12345", "123456"), { from: accounts[1] });
      await catchRevert(
        contract.issueCertificate.sendTransaction(getSignature("PL", "ZFD12345", "123456"), { from: accounts[1] })
      );
    });
  });

  contract("VaccinationCertificates", (accounts) => {
    it(`allows to retrieve all certificate signatures`, async () => {
      const contract = await VaccinationCertificates.deployed();

      await contract.grantRole.sendTransaction(CERTIFICATE_AUTHORITY_ROLE, accounts[1], {
        from: accounts[0],
      });

      const signatures = [
        getSignature("PL", "ZFD12345", "123456"),
        getSignature("PL", "ZFD12346", "123456"),
        getSignature("PL", "ZFD12347", "123456"),
        getSignature("PL", "ZFD12348", "123456"),
      ];

      await contract.issueCertificate.sendTransaction(signatures[0], { from: accounts[1] });
      await contract.issueCertificate.sendTransaction(signatures[1], { from: accounts[1] });
      await contract.issueCertificate.sendTransaction(signatures[2], { from: accounts[1] });
      await contract.issueCertificate.sendTransaction(signatures[3], { from: accounts[1] });

      expect(await contract.getSignatures.call()).to.deep.equal(signatures);
    });
  });
});
