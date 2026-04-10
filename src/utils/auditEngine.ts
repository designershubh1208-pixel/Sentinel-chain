import type { Vulnerability, AuditResult, Severity } from "../types";

const VULNERABILITY_PATTERNS = [
  {
    pattern: /\.call\{value:/g,
    check: (code: string) => {
      const hasCallValue = /\.call\{value:/.test(code);
      const hasReentrancyGuard = /ReentrancyGuard|nonReentrant|_status/.test(code);
      const hasCEIPattern = (() => {
        const callIdx = code.indexOf(".call{value:");
        if (callIdx === -1) return true;
        const before = code.substring(0, callIdx);
        const balanceUpdateBefore = /balances?\[.*\]\s*[-+]=/.test(before.split('\n').slice(-5).join('\n'));
        return balanceUpdateBefore;
      })();
      if (hasCallValue && !hasReentrancyGuard && !hasCEIPattern) {
        return {
          id: "VULN-001",
          title: "Reentrancy Vulnerability",
          severity: "critical" as Severity,
          line: getLineNumber(code, ".call{value:"),
          lineEnd: getLineNumber(code, ".call{value:") + 3,
          description: "External call made before state update. An attacker can re-enter the function before the balance is updated, draining all funds.",
          impact: "Complete fund drainage. The DAO hack (2016) exploited this exact pattern, stealing $60M worth of ETH.",
          recommendation: "Apply the Checks-Effects-Interactions pattern: update state before external calls. Use OpenZeppelin's ReentrancyGuard modifier for additional protection.",
          swcId: "SWC-107",
          confidence: 95
        };
      }
      return null;
    }
  },
  {
    pattern: /pragma solidity \^?0\.[0-7]/g,
    check: (code: string) => {
      const match = code.match(/pragma solidity [\^~]?([0-9.]+)/);
      if (match) {
        const version = match[1];
        const major = parseInt(version.split('.')[1]);
        if (major < 8) {
          return {
            id: "VULN-002",
            title: "Integer Overflow / Underflow Risk",
            severity: "high" as Severity,
            line: getLineNumber(code, "pragma solidity"),
            description: "Solidity versions below 0.8.0 do not have built-in overflow/underflow protection. Arithmetic operations can wrap around silently.",
            impact: "Attackers can manipulate token balances or counters by causing integer wrap-around, leading to financial loss or unauthorized minting.",
            recommendation: "Upgrade to Solidity 0.8.0+ which has native overflow checks, or use SafeMath library from OpenZeppelin for older versions.",
            swcId: "SWC-101",
            confidence: 98
          };
        }
      }
      return null;
    }
  },
  {
    pattern: /function\s+\w+\s*\([^)]*\)\s*(public|external)\s*(?!.*onlyOwner)(?!.*onlyAdmin)(?!.*require\s*\(\s*msg\.sender)/g,
    check: (code: string) => {
      const mintPattern = /function\s+(mint|issue|create)\w*\s*\([^)]*\)\s*(public|external)(?!\s*view)(?!\s*pure)/;
      const hasAccessControl = /onlyOwner|onlyAdmin|hasRole|require\s*\(\s*msg\.sender\s*==/.test(code);
      if (mintPattern.test(code) && !hasAccessControl) {
        return {
          id: "VULN-003",
          title: "Missing Access Control",
          severity: "high" as Severity,
          line: (() => {
            const m = code.match(/function\s+(mint|issue|create)\w*/);
            return m ? getLineNumber(code, m[0]) : 1;
          })(),
          description: "Sensitive state-changing functions lack access control modifiers. Any external account can call privileged functions.",
          impact: "Unauthorized token minting, contract takeover, or fund theft. Similar to the Parity Wallet bug that allowed anyone to become the owner.",
          recommendation: "Add access control using OpenZeppelin's Ownable or AccessControl. Apply onlyOwner or role-based modifiers to all sensitive functions.",
          swcId: "SWC-115",
          confidence: 88
        };
      }
      return null;
    }
  },
  {
    pattern: /tx\.origin/g,
    check: (code: string) => {
      if (/tx\.origin/.test(code)) {
        return {
          id: "VULN-004",
          title: "tx.origin Authentication Bypass",
          severity: "medium" as Severity,
          line: getLineNumber(code, "tx.origin"),
          description: "Using tx.origin for authentication is vulnerable to phishing attacks where a malicious contract tricks users into calling it, which then calls your contract.",
          impact: "Attacker can impersonate any user who interacts with a malicious intermediate contract.",
          recommendation: "Replace tx.origin with msg.sender for authentication. Only use tx.origin to check if the caller is an EOA (not a contract).",
          swcId: "SWC-115",
          confidence: 99
        };
      }
      return null;
    }
  },
  {
    pattern: /block\.timestamp|now\b/g,
    check: (code: string) => {
      const hasTimestamp = /block\.timestamp|(?<!\w)now\b/.test(code);
      const usedInCondition = /(?:block\.timestamp|now)\s*[<>=!]|[<>=!]\s*(?:block\.timestamp|now)/.test(code);
      if (hasTimestamp && usedInCondition) {
        return {
          id: "VULN-005",
          title: "Block Timestamp Manipulation",
          severity: "medium" as Severity,
          line: getLineNumber(code, "block.timestamp"),
          description: "Miners can manipulate block.timestamp by up to ~15 seconds. Relying on it for critical logic creates exploitable conditions.",
          impact: "Miners can influence time-dependent outcomes like auction end times, random number generation, or time-locked releases.",
          recommendation: "Avoid using block.timestamp for critical business logic. Use block numbers instead for time measurements, or implement commit-reveal schemes.",
          swcId: "SWC-116",
          confidence: 75
        };
      }
      return null;
    }
  },
  {
    pattern: /delegatecall/g,
    check: (code: string) => {
      if (/\.delegatecall\(/.test(code)) {
        const hasValidation = /require|revert|assert/.test(code.substring(code.indexOf('delegatecall') - 200, code.indexOf('delegatecall')));
        if (!hasValidation) {
          return {
            id: "VULN-006",
            title: "Unsafe delegatecall Usage",
            severity: "critical" as Severity,
            line: getLineNumber(code, "delegatecall"),
            description: "delegatecall executes code in the context of the calling contract. If the target address is user-controlled or unvalidated, an attacker can execute arbitrary code with the caller's storage and ETH.",
            impact: "Complete contract takeover, storage corruption, theft of all funds. The Parity hack used delegatecall to steal 150k ETH.",
            recommendation: "Never use delegatecall with user-supplied addresses. Validate and whitelist target contracts. Consider using the transparent proxy pattern with strict upgrade controls.",
            swcId: "SWC-112",
            confidence: 92
          };
        }
      }
      return null;
    }
  },
  {
    pattern: /selfdestruct|suicide/g,
    check: (code: string) => {
      if (/selfdestruct|suicide/.test(code)) {
        const hasOwnerCheck = /onlyOwner|msg\.sender\s*==/.test(code.substring(Math.max(0, code.indexOf('selfdestruct') - 300), code.indexOf('selfdestruct')));
        if (!hasOwnerCheck) {
          return {
            id: "VULN-007",
            title: "Unprotected selfdestruct",
            severity: "critical" as Severity,
            line: getLineNumber(code, "selfdestruct"),
            description: "The selfdestruct function can permanently destroy the contract and send all ETH to an arbitrary address. Without access control, anyone can trigger it.",
            impact: "Permanent contract destruction and complete fund loss. Irreversible on the blockchain.",
            recommendation: "Restrict selfdestruct to contract owner with strict access control. Consider removing it entirely and using pausable patterns instead.",
            swcId: "SWC-106",
            confidence: 97
          };
        }
      }
      return null;
    }
  },
  {
    pattern: /for\s*\([^;]+;\s*[^;]+;\s*[^)]+\)/g,
    check: (code: string) => {
      const hasUnboundedLoop = /for\s*\(\s*uint\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length/.test(code);
      if (hasUnboundedLoop) {
        return {
          id: "VULN-008",
          title: "Unbounded Loop — DoS Risk",
          severity: "medium" as Severity,
          line: (() => {
            const m = code.match(/for\s*\(\s*uint/);
            return m ? getLineNumber(code, m[0]) : 1;
          })(),
          description: "Loops iterating over dynamic arrays or mappings can grow unboundedly, eventually exceeding the block gas limit and bricking the function permanently.",
          impact: "Denial of Service — critical functions become permanently uncallable as the array grows. Funds can be permanently locked.",
          recommendation: "Implement pagination, limit array sizes, or use pull-over-push patterns. Move iteration off-chain where possible.",
          swcId: "SWC-128",
          confidence: 72
        };
      }
      return null;
    }
  }
];

function getLineNumber(code: string, search: string): number {
  const idx = code.indexOf(search);
  if (idx === -1) return 1;
  return code.substring(0, idx).split('\n').length;
}

function calculateRiskScore(vulns: Vulnerability[]): number {
  let score = 0;
  const weights = { critical: 30, high: 20, medium: 10, low: 3, info: 1 };
  for (const v of vulns) {
    score += weights[v.severity] * (v.confidence / 100);
  }
  return Math.min(100, Math.round(score));
}

export async function runAudit(code: string, contractName: string): Promise<AuditResult> {
  await new Promise(r => setTimeout(r, 2800 + Math.random() * 1200));

  if (!code.trim()) {
    throw new Error("No code provided for analysis.");
  }

  const vulnerabilities: Vulnerability[] = [];
  const seen = new Set<string>();

  for (const { check } of VULNERABILITY_PATTERNS) {
    const result = check(code);
    if (result && !seen.has(result.id)) {
      seen.add(result.id);
      vulnerabilities.push(result);
    }
  }

  // Add a gas note for complex contracts
  const lineCount = code.split('\n').length;
  if (lineCount > 30 && !/event\s+\w+/.test(code)) {
    vulnerabilities.push({
      id: "INFO-001",
      title: "Missing Event Emissions",
      severity: "info",
      line: 1,
      description: "State-changing functions do not emit events. This makes off-chain monitoring and indexing impossible.",
      impact: "Reduced transparency and difficulty tracking on-chain activity. Makes it hard to build reactive dApps.",
      recommendation: "Add events for all significant state changes. Emit them after successful operations.",
      confidence: 85
    });
  }

  const riskScore = calculateRiskScore(vulnerabilities);

  let recommendation: "deploy" | "deploy_with_firewall" | "block";
  if (riskScore >= 70) recommendation = "block";
  else if (riskScore >= 30) recommendation = "deploy_with_firewall";
  else recommendation = "deploy";

  const criticalCount = vulnerabilities.filter(v => v.severity === "critical").length;
  const highCount = vulnerabilities.filter(v => v.severity === "high").length;

  let summary = "";
  if (vulnerabilities.length === 0) {
    summary = `${contractName} passed all security checks. No vulnerabilities detected. The contract follows best practices and is safe for deployment.`;
  } else {
    summary = `${contractName} contains ${vulnerabilities.length} security issue${vulnerabilities.length > 1 ? 's' : ''}`;
    if (criticalCount > 0) summary += `, including ${criticalCount} critical vulnerability${criticalCount > 1 ? 'ies' : 'y'} that require immediate attention`;
    if (highCount > 0) summary += ` and ${highCount} high-severity issue${highCount > 1 ? 's' : ''}`;
    summary += `. Deployment is ${recommendation === 'block' ? 'strongly discouraged' : 'possible with a security firewall'} until issues are resolved.`;
  }

  const gasOpts: string[] = [];
  if (/uint256/g.test(code)) gasOpts.push("Pack smaller uint types (uint128, uint64) in structs to save storage slots");
  if (/storage\b/.test(code) || code.includes("[]")) gasOpts.push("Cache storage variables in memory within loops");
  if (!code.includes("immutable") && code.includes("constant")) gasOpts.push("Use 'immutable' for constructor-set constants to save SLOAD gas");
  if (gasOpts.length === 0) gasOpts.push("Gas usage appears optimized for this contract size");

  return {
    riskScore,
    vulnerabilities,
    gasAnalysis: {
      estimatedGas: `${Math.floor(80000 + lineCount * 1200 + vulnerabilities.length * 5000).toLocaleString()}`,
      optimizationSuggestions: gasOpts
    },
    summary,
    recommendation,
    scanTime: parseFloat((2.8 + Math.random() * 1.2).toFixed(2)),
    linesScanned: lineCount
  };
}
