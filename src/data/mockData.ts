export const SAMPLE_CONTRACTS = {
  reentrancy: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    // VULNERABLE: Reentrancy attack possible
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // State update happens AFTER external call - dangerous!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount; // Too late!
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`,

  overflow: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract TokenSale {
    mapping(address => uint256) public tokenBalance;
    uint256 public totalSupply = 1000000;
    uint256 public price = 1 ether;
    
    // Integer overflow vulnerability (pre-0.8.0)
    function buyTokens(uint256 numTokens) external payable {
        uint256 cost = numTokens * price; // Can overflow!
        require(msg.value >= cost);
        tokenBalance[msg.sender] += numTokens;
        totalSupply -= numTokens;
    }
    
    // Missing access control
    function mintTokens(address to, uint256 amount) external {
        tokenBalance[to] += amount; // Anyone can mint!
        totalSupply += amount;
    }
    
    function transfer(address to, uint256 amount) external {
        require(tokenBalance[msg.sender] >= amount);
        tokenBalance[msg.sender] -= amount;
        tokenBalance[to] += amount;
    }
}`,

  safe: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureVault is ReentrancyGuard, Ownable {
    mapping(address => uint256) private balances;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    
    // Checks-Effects-Interactions pattern
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount; // State update first
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    function emergencyPause() external onlyOwner {
        // Owner-only emergency function
    }
}`
};

export const AUDIT_HISTORY = [
  {
    id: "AUD-2024-001",
    name: "DeFi Lending Protocol",
    timestamp: "2025-06-14 09:23:11",
    riskScore: 87,
    severity: "critical",
    status: "blocked",
    vulnerabilities: 6,
    network: "Sepolia",
    gasEstimate: "245,000"
  },
  {
    id: "AUD-2024-002",
    name: "NFT Marketplace Contract",
    timestamp: "2025-06-13 14:55:02",
    riskScore: 42,
    severity: "medium",
    status: "deployed_firewall",
    vulnerabilities: 3,
    network: "Sepolia",
    gasEstimate: "180,000"
  },
  {
    id: "AUD-2024-003",
    name: "Governance DAO Token",
    timestamp: "2025-06-13 11:20:44",
    riskScore: 15,
    severity: "low",
    status: "deployed",
    vulnerabilities: 1,
    network: "Mainnet",
    gasEstimate: "120,000"
  },
  {
    id: "AUD-2024-004",
    name: "Yield Farming Vault",
    timestamp: "2025-06-12 18:05:33",
    riskScore: 71,
    severity: "high",
    status: "deployed_firewall",
    vulnerabilities: 4,
    network: "Polygon",
    gasEstimate: "310,000"
  },
  {
    id: "AUD-2024-005",
    name: "Token Bridge Contract",
    timestamp: "2025-06-12 08:44:12",
    riskScore: 93,
    severity: "critical",
    status: "blocked",
    vulnerabilities: 8,
    network: "Sepolia",
    gasEstimate: "425,000"
  },
  {
    id: "AUD-2024-006",
    name: "Stablecoin Collateral",
    timestamp: "2025-06-11 16:30:55",
    riskScore: 28,
    severity: "low",
    status: "deployed",
    vulnerabilities: 2,
    network: "Arbitrum",
    gasEstimate: "95,000"
  }
];

export const TRANSACTIONS = [
  {
    id: "0x4f8e...9a2b",
    contract: "VulnerableVault",
    type: "withdraw()",
    from: "0x7a1b...3c9d",
    riskLevel: "critical",
    status: "blocked",
    timestamp: "2 min ago",
    gasPrice: "28 gwei",
    reason: "Reentrancy pattern detected"
  },
  {
    id: "0x2c1a...7e4f",
    contract: "DeFi Pool",
    type: "flashLoan()",
    from: "0x9f4c...1b8a",
    riskLevel: "high",
    status: "flagged",
    timestamp: "7 min ago",
    gasPrice: "45 gwei",
    reason: "Abnormal flash loan size"
  },
  {
    id: "0x8b3d...2f1c",
    contract: "SecureVault",
    type: "deposit()",
    from: "0x3e2f...8d4a",
    riskLevel: "low",
    status: "passed",
    timestamp: "12 min ago",
    gasPrice: "22 gwei",
    reason: "Standard deposit operation"
  },
  {
    id: "0x1e9f...4c6b",
    contract: "NFT Market",
    type: "purchase()",
    from: "0x5a8c...2e7b",
    riskLevel: "medium",
    status: "monitoring",
    timestamp: "18 min ago",
    gasPrice: "31 gwei",
    reason: "Unusual price manipulation"
  },
  {
    id: "0x6c2a...9b3e",
    contract: "Governance",
    type: "vote()",
    from: "0x4d1b...7f2c",
    riskLevel: "low",
    status: "passed",
    timestamp: "25 min ago",
    gasPrice: "18 gwei",
    reason: "Normal voting operation"
  }
];

export const CIRCUIT_BREAKERS = [
  {
    id: "CB-001",
    contract: "VulnerableVault",
    address: "0x742d35Cc6634C0532925a3b8D4C9B1234567890",
    network: "Sepolia",
    status: "active",
    triggered: true,
    triggerCount: 3,
    lastTriggered: "2025-06-14 09:24:00",
    protectedFunctions: ["withdraw", "transfer"],
    threshold: 75
  },
  {
    id: "CB-002",
    contract: "DeFi Lending Pool",
    address: "0x8Ba1f109551bD432803012645Hac136c1235678",
    network: "Mainnet",
    status: "active",
    triggered: false,
    triggerCount: 0,
    lastTriggered: "Never",
    protectedFunctions: ["borrow", "liquidate", "flashLoan"],
    threshold: 65
  },
  {
    id: "CB-003",
    contract: "Yield Farming Vault",
    address: "0x9Cd1f210662cD543914023756Ibc247d2346789",
    network: "Polygon",
    status: "paused",
    triggered: true,
    triggerCount: 1,
    lastTriggered: "2025-06-12 18:06:00",
    protectedFunctions: ["harvest", "compound", "withdraw"],
    threshold: 70
  }
];

export const RISK_CHART_DATA = [
  { day: "Jun 8", audits: 4, critical: 1, high: 1, medium: 1, low: 1 },
  { day: "Jun 9", audits: 7, critical: 2, high: 2, medium: 2, low: 1 },
  { day: "Jun 10", audits: 5, critical: 0, high: 2, medium: 2, low: 1 },
  { day: "Jun 11", audits: 9, critical: 3, high: 2, medium: 3, low: 1 },
  { day: "Jun 12", audits: 6, critical: 2, high: 1, medium: 2, low: 1 },
  { day: "Jun 13", audits: 11, critical: 1, high: 3, medium: 4, low: 3 },
  { day: "Jun 14", audits: 8, critical: 2, high: 2, medium: 3, low: 1 },
];

export const VULN_TYPES = [
  { name: "Reentrancy", count: 18, color: "#ef4444" },
  { name: "Access Control", count: 14, color: "#f97316" },
  { name: "Integer Overflow", count: 11, color: "#eab308" },
  { name: "Logic Bugs", count: 9, color: "#a78bfa" },
  { name: "Gas Abuse", count: 7, color: "#60a5fa" },
  { name: "Other", count: 5, color: "#64748b" },
];
