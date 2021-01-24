// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract VaccinationCertificates is AccessControl {
  // Certificate Authority can issue certificates
  bytes32 public constant CERTIFICATE_AUTHORITY_ROLE = keccak256("CERTIFICATE_AUTHORITY_ROLE");
  // Certificate Authority Admin can issue Certificate Authority roles
  bytes32 public constant CERTIFICATE_AUTHORITY_ADMIN_ROLE = keccak256("CERTIFICATE_AUTHORITY_ADMIN_ROLE");

  mapping(address => bytes32) public certificateAuthorityNames;

  event CertificateAuthorityNameSet(
    address authority,
    bytes32 name
  );

  struct Certificate {
    bytes32 signature;
    address authority;
    uint timestamp;
  }

  mapping(bytes32 => Certificate) public certificates;
  bytes32[] public signatures;

  event CertificateIssued(
    bytes32 signature,
    address authority,
    uint timestamp
  );

  constructor() public {
    // Defining Admin role for Certificate Authority role
    _setRoleAdmin(CERTIFICATE_AUTHORITY_ROLE, CERTIFICATE_AUTHORITY_ADMIN_ROLE);
    
    // Owner is an admin
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function issueCertificate(bytes32 _signature) public {
    require(hasRole(CERTIFICATE_AUTHORITY_ROLE, msg.sender), "Caller is not a Certificate Authority");
    require(certificates[_signature].timestamp == 0, "Can't overwrite existing certificate");

    signatures.push(_signature);

    certificates[_signature] = Certificate({
      signature: _signature,
      authority: msg.sender,
      timestamp: now
    });

    emit CertificateIssued(_signature, msg.sender, now);
  }

  function setCertificateAuthorityName(address _address, bytes32 _name) public {
    require(hasRole(CERTIFICATE_AUTHORITY_ADMIN_ROLE, msg.sender), "Caller is not a Certificate Authority Admin");
    require(hasRole(CERTIFICATE_AUTHORITY_ROLE, _address), "Given address is not a Certificate Authority");

    certificateAuthorityNames[_address] = _name;

    emit CertificateAuthorityNameSet(_address, _name);
  }

  // TODO: Implement pagination
  function getSignatures() public view returns(bytes32[] memory) {
    return signatures;
  }
}