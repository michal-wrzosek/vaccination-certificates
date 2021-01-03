// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract VaccinationCertificates {
  address public owner = msg.sender;

  function areYouTheOwner () view public returns(bool) {
    return(msg.sender == owner);
  }
}