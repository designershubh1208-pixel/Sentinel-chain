export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type AuditStatus = "idle" | "scanning" | "complete" | "error";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  line: number;
  lineEnd?: number;
  description: string;
  impact: string;
  recommendation: string;
  swcId?: string;
  confidence: number;
}

export interface AuditResult {
  riskScore: number;
  vulnerabilities: Vulnerability[];
  gasAnalysis: {
    estimatedGas: string;
    optimizationSuggestions: string[];
  };
  summary: string;
  recommendation: "deploy" | "deploy_with_firewall" | "block";
  scanTime: number;
  linesScanned: number;
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: string;
  riskScore: number;
  severity: string;
  status: string;
  vulnerabilities: number;
  network: string;
  gasEstimate: string;
}

export interface Transaction {
  id: string;
  contract: string;
  type: string;
  from: string;
  riskLevel: string;
  status: string;
  timestamp: string;
  gasPrice: string;
  reason: string;
}

export interface CircuitBreaker {
  id: string;
  contract: string;
  address: string;
  network: string;
  status: string;
  triggered: boolean;
  triggerCount: number;
  lastTriggered: string;
  protectedFunctions: string[];
  threshold: number;
}
