// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract VaccinationCertificates is AccessControl {
  // Certificate Authority can issue certificates
  bytes32 public constant CERTIFICATE_AUTHORITY_ROLE = keccak256("CERTIFICATE_AUTHORITY_ROLE");
  // Certificate Authority Admin can issue Certificate Authority roles
  bytes32 public constant CERTIFICATE_AUTHORITY_ADMIN_ROLE = keccak256("CERTIFICATE_AUTHORITY_ADMIN_ROLE");

  struct Certificate {
    bytes32 signature;
    address authority;
    uint timestamp;
  }

  mapping(bytes32 => Certificate) public certificates;
  bytes32[] public signatures;

  constructor() public {
    // defining Admin role for Certificate Authority role
    _setRoleAdmin(CERTIFICATE_AUTHORITY_ROLE, CERTIFICATE_AUTHORITY_ADMIN_ROLE);
    
    // Owner have all admin roles
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(CERTIFICATE_AUTHORITY_ADMIN_ROLE, msg.sender);
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
  }

  // TODO: Implement pagination
  function getSignatures() public view returns(bytes32[] memory) {
    return signatures;
  }
}