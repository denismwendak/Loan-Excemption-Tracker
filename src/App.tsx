import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Search, 
  FileText, 
  SlidersHorizontal, 
  ArrowUpRight, 
  User, 
  Calendar, 
  DollarSign, 
  Activity, 
  FileCheck2, 
  TrendingUp, 
  Sparkles, 
  History, 
  UserCheck, 
  X, 
  Bell, 
  ChevronRight, 
  RotateCcw,
  Info,
  ChevronDown,
  Briefcase,
  Layers,
  Check,
  Send,
  AlertCircle,
  Sun,
  Moon,
  LogOut,
  Lock,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Exemption, Condition, AuditLog, FollowUpLog } from "./types";
import { initialExemptions } from "./data/mockExemptions";

const formatCurrency = (amount: number, currency?: string) => {
  const code = (currency || "USD").toUpperCase();
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const formattedAmount = formatter.format(amount);
  
  switch (code) {
    case "KSH":
    case "KES":
      return `KES ${formattedAmount}`;
    case "GBP":
      return `£${formattedAmount}`;
    case "EUR":
      return `€${formattedAmount}`;
    case "USD":
    default:
      return `$${formattedAmount}`;
  }
};

export default function App() {
  // --- THEME STATE ---
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("crest_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("crest_theme", next);
      return next;
    });
  };

  // --- STATE ---
  const [exemptions, setExemptions] = useState<Exemption[]>(() => {
    const saved = localStorage.getItem("crest_exemptions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading exemptions", e);
      }
    }
    return initialExemptions;
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "new-request" | "monitoring" | "analytics" | "audit">("dashboard");
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"overview" | "pending" | "conditions">("overview");
  const [currentUser, setCurrentUser] = useState({
    name: "Sarah Jenkins",
    role: "Senior Credit Officer",
    id: "CO-9812",
    contact: "s.jenkins@crestbank.com"
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [conditionSearch, setConditionSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [selectedExemptionId, setSelectedExemptionId] = useState<string | null>(null);

  // Forms state for New Request
  const [formData, setFormData] = useState({
    customerName: "",
    accountNumber: "",
    loanAmount: "",
    loanPurpose: "",
    creditStatus: "GOOD",
    exemptionReason: "",
    officerNotes: "",
    officerName: "Sarah Jenkins",
    officerId: "CO-9812",
    officerContact: "s.jenkins@crestbank.com",
    riskLevel: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    riskScore: 50,
    originBranch: "",
    creditAppRef: "",
    currency: "USD",
  });

  const [formMitigations, setFormMitigations] = useState<string[]>([
    "Additional review of guarantor tax files.",
    "First collateral charge registration."
  ]);
  const [newMitigationText, setNewMitigationText] = useState("");

  const [formConditions, setFormConditions] = useState<{ condition: string; days: number; action: string }[]>([
    { condition: "Submit audited annual accounts within 90 days of fiscal year end.", days: 90, action: "Request draft accounts" }
  ]);
  const [newConditionText, setNewConditionText] = useState("");
  const [newConditionDays, setNewConditionDays] = useState(60);
  const [newConditionAction, setNewConditionAction] = useState("");
  const [formDocuments, setFormDocuments] = useState<Array<{ name: string; size: number; type: string; dataUrl: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);

  // --- LOGIN STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("crest_is_logged_in") !== "false";
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginRole, setLoginRole] = useState<"Officer" | "Director">("Officer");
  const [loginCustomName, setLoginCustomName] = useState("");
  const [loginError, setLoginError] = useState("");

  // AI Co-Pilot State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    summaryAnalysis: string;
    mitigations: string[];
    recommendedConditions: { condition: string; expectedTimelineDays: number; followUpAction: string }[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active Monitoring Condition Logs State
  const [activeConditionExemption, setActiveConditionExemption] = useState<{ exemptionId: string; conditionId: string } | null>(null);
  const [followUpActionText, setFollowUpActionText] = useState("");
  const [followUpNextSteps, setFollowUpNextSteps] = useState("");

  // Zidisha standing instructions state
  const [zidishaInstructions, setZidishaInstructions] = useState<any[]>(() => {
    const saved = localStorage.getItem("crest_zidisha_instructions");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: "ZID-101",
        exemptionId: "EX-2026-001",
        exemptionCustomerName: "Acme Manufacturing Ltd",
        conditionId: "COND-001-3",
        conditionText: "Build Zidisha shares on a periodic basis (Monthly contribution of $200) to support microfinance community-lending targets.",
        debitAccount: "ACT-8472-10",
        creditAccount: "ZID-GLOBAL-TREASURY",
        amount: 200,
        frequency: "Monthly",
        dateCreated: "2026-06-25",
        lastExecuted: "2026-06-25",
        status: "ACTIVE"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("crest_zidisha_instructions", JSON.stringify(zidishaInstructions));
  }, [zidishaInstructions]);

  const [activeZidishaSetup, setActiveZidishaSetup] = useState<{
    exemptionId: string;
    conditionId: string;
    customerName: string;
    conditionText: string;
    defaultDebitAccount?: string;
  } | null>(null);

  const [zidishaDebitAccount, setZidishaDebitAccount] = useState("");
  const [zidishaCreditAccount, setZidishaCreditAccount] = useState("ZID-GLOBAL-TREASURY");
  const [zidishaAmount, setZidishaAmount] = useState(200);
  const [zidishaFrequency, setZidishaFrequency] = useState("Monthly");
  const [zidishaType, setZidishaType] = useState("Zidisha Shares");

  // Optional Zidisha/Shares standing instruction in the new request form
  const [enableFormZidisha, setEnableFormZidisha] = useState(false);
  const [formZidishaDebit, setFormZidishaDebit] = useState("");
  const [formZidishaCredit, setFormZidishaCredit] = useState("ZID-GLOBAL-TREASURY");
  const [formZidishaAmount, setFormZidishaAmount] = useState(200);
  const [formZidishaFrequency, setFormZidishaFrequency] = useState("Monthly");
  const [formZidishaType, setFormZidishaType] = useState("Zidisha Shares");

  const [isCbsSyncing, setIsCbsSyncing] = useState(false);
  const [cbsForceFailure, setCbsForceFailure] = useState(false);
  const [cbsAlert, setCbsAlert] = useState<{
    type: "success" | "error";
    message: string;
    totalAmount: number;
    accountsCount: number;
    details?: string;
  } | null>(null);

  // Officer Notification States
  const [notificationExemption, setNotificationExemption] = useState<Exemption | null>(null);
  const [notificationSubject, setNotificationSubject] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationAlert, setNotificationAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationExemption) return;

    setIsSendingNotification(true);
    setNotificationAlert(null);

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Append a log entry to the exemption's audit trail
    const newLog: AuditLog = {
      id: `LOG-NOTIF-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      performedBy: `${currentUser.name} (${currentUser.role})`,
      action: "Officer Notified",
      details: `Dispatched status alert email to ${notificationExemption.officerName} (${notificationExemption.officerContact}) with subject: "${notificationSubject}"`
    };

    setExemptions(prev => prev.map(ex => {
      if (ex.id === notificationExemption.id) {
        return {
          ...ex,
          auditTrail: [newLog, ...ex.auditTrail]
        };
      }
      return ex;
    }));

    setIsSendingNotification(false);
    setNotificationAlert({
      type: "success",
      message: `Notification email successfully dispatched to Credit Officer ${notificationExemption.officerName} (${notificationExemption.officerContact})!`
    });
  };

  // Core Banking System integration runner
  const handleRunZidishaCbsSimulation = async (inst: any) => {
    setIsCbsSyncing(true);
    setCbsAlert(null);

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsCbsSyncing(false);

    if (cbsForceFailure) {
      // Simulate failure scenario
      setCbsAlert({
        type: "error",
        message: "CBS Transaction Disallowed: Compliance Blocked / Limit Exceeded",
        totalAmount: 0,
        accountsCount: 0,
        details: `Failed to charge account ${inst.debitAccount} due to compliance hold code 'ERR_CBS_LIMIT_EXCEEDED_BASEL4'. Standing instruction was not effected.`
      });
      return;
    }

    // Success scenario
    const activeInsts = zidishaInstructions.filter(i => i.status === "ACTIVE");
    const activeCount = activeInsts.length;
    const totalProcessed = activeInsts.reduce((sum, i) => sum + i.amount, 0);

    setCbsAlert({
      type: "success",
      message: "Zidisha Shares Periodical Transfer Processed Successfully",
      totalAmount: totalProcessed,
      accountsCount: activeCount,
      details: `CBS settlement completed successfully. Debited $${inst.amount} from ${inst.debitAccount} and credited ${inst.creditAccount} under standing code ZIDISHA-CB-FUNDS.`
    });

    // Update the lastExecuted date of the instruction
    setZidishaInstructions(prev => prev.map(i => {
      if (i.id === inst.id) {
        return { ...i, lastExecuted: new Date().toISOString().split('T')[0] };
      }
      return i;
    }));
  };

  const handleSaveZidishaInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeZidishaSetup) return;

    const { exemptionId, conditionId, customerName, conditionText } = activeZidishaSetup;

    // Create or update
    const existingIdx = zidishaInstructions.findIndex(inst => inst.conditionId === conditionId);

    const updatedInstructions = [...zidishaInstructions];
    let targetInst: any;
    
    if (existingIdx >= 0) {
      updatedInstructions[existingIdx] = {
        ...updatedInstructions[existingIdx],
        debitAccount: zidishaDebitAccount,
        creditAccount: zidishaCreditAccount,
        amount: Number(zidishaAmount),
        frequency: zidishaFrequency,
        type: zidishaType,
        status: "ACTIVE"
      };
      targetInst = updatedInstructions[existingIdx];
    } else {
      const newInst = {
        id: `ZID-${Math.floor(100 + Math.random() * 900)}`,
        exemptionId,
        exemptionCustomerName: customerName,
        conditionId,
        conditionText,
        debitAccount: zidishaDebitAccount,
        creditAccount: zidishaCreditAccount,
        amount: Number(zidishaAmount),
        frequency: zidishaFrequency,
        type: zidishaType,
        dateCreated: new Date().toISOString().split('T')[0],
        status: "ACTIVE" as const
      };
      updatedInstructions.push(newInst);
      targetInst = newInst;
    }

    setZidishaInstructions(updatedInstructions);
    localStorage.setItem("crest_zidisha_instructions", JSON.stringify(updatedInstructions));

    // Reset modal and trigger CBS
    setActiveZidishaSetup(null);
    handleRunZidishaCbsSimulation(targetInst);
  };

  // Analytics AI state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReportSummary, setAiReportSummary] = useState<string | null>(null);

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("crest_exemptions", JSON.stringify(exemptions));
  }, [exemptions]);

  // --- DYNAMIC ALERTS & NOTIFICATIONS ---
  const dynamicAlerts = React.useMemo(() => {
    const alerts: { id: string; type: "overdue" | "due-soon" | "escalated"; title: string; description: string; exemptionId: string; date: string }[] = [];
    const today = new Date("2026-06-26"); // matches mock current time

    exemptions.forEach(ex => {
      if (ex.status === "ESCALATED") {
        alerts.push({
          id: `alert-esc-${ex.id}`,
          type: "escalated",
          title: "Exemption Escalated",
          description: `Loan exemption for ${ex.customerName} (${formatCurrency(ex.loanAmount, ex.currency)}) requires immediate review.`,
          exemptionId: ex.id,
          date: ex.dateRequested
        });
      }

      ex.conditions.forEach(cond => {
        if (!cond.isMet) {
          const expected = new Date(cond.expectedDate);
          const diffTime = expected.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            alerts.push({
              id: `alert-overdue-${cond.id}`,
              type: "overdue",
              title: "Condition Overdue",
              description: `"${cond.condition.substring(0, 50)}..." is overdue by ${Math.abs(diffDays)} days for ${ex.customerName}.`,
              exemptionId: ex.id,
              date: cond.expectedDate
            });
          } else if (diffDays <= 7) {
            alerts.push({
              id: `alert-soon-${cond.id}`,
              type: "due-soon",
              title: "Condition Due Soon",
              description: `"${cond.condition.substring(0, 50)}..." is due in ${diffDays} days for ${ex.customerName}.`,
              exemptionId: ex.id,
              date: cond.expectedDate
            });
          }
        }
      });
    });

    return alerts.sort((a, b) => b.type === "overdue" ? 1 : -1);
  }, [exemptions]);


  // --- ACTIONS ---

  const handleCreateExemption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.loanAmount || !formData.exemptionReason) {
      alert("Please fill in the Customer Name, Loan Amount, and Exemption Reason.");
      return;
    }

    const newExemptionId = `EX-2026-${Math.floor(100 + Math.random() * 900)}`;
    const todayStr = "2026-06-26";
    const finalAccountNumber = formData.accountNumber || `ACT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;

    // Build conditions
    const formattedConditions: Condition[] = formConditions.map((fc, idx) => {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + fc.days);
      const expectedDateStr = expectedDate.toISOString().split("T")[0];

      return {
        id: `COND-${newExemptionId.substring(8)}-${idx + 1}`,
        condition: fc.condition,
        expectedDate: expectedDateStr,
        followUpDate: expectedDateStr, // default to expected date
        followUpAction: fc.action,
        isMet: false,
        logs: []
      };
    });

    // Optional Zidisha shares or back office standing instruction integration
    let targetZidishaConditionId = "";
    if (enableFormZidisha) {
      targetZidishaConditionId = `COND-${newExemptionId.substring(8)}-ZIDISHA`;
      formattedConditions.push({
        id: targetZidishaConditionId,
        condition: `Build ${formZidishaType} on a periodic basis (${formZidishaFrequency} contribution of ${formatCurrency(formZidishaAmount, formData.currency)}) to support microfinance & back office capital targets.`,
        expectedDate: "2026-12-31",
        followUpDate: "2026-07-31",
        followUpAction: `Verify periodic CBS standing order for ${formZidishaType}.`,
        isMet: false,
        logs: []
      });
    }

    // Build Audit Log
    const newAudit: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      performedBy: `${currentUser.name} (${currentUser.role})`,
      action: "Exemption Requested",
      details: `Created exemption request ${newExemptionId} for ${formData.customerName} of amount ${formatCurrency(Number(formData.loanAmount), formData.currency)}.`
    };

    const newExemption: Exemption = {
      id: newExemptionId,
      customerName: formData.customerName,
      accountNumber: finalAccountNumber,
      loanAmount: Number(formData.loanAmount),
      currency: formData.currency || "USD",
      loanPurpose: formData.loanPurpose || "General commercial lending facility",
      creditStatus: formData.creditStatus,
      exemptionReason: formData.exemptionReason,
      status: "PENDING",
      dateRequested: todayStr,
      riskScore: formData.riskScore,
      riskLevel: formData.riskLevel,
      mitigations: formMitigations,
      officerName: currentUser.name,
      officerId: currentUser.id,
      officerContact: currentUser.contact,
      notes: formData.officerNotes,
      originBranch: formData.originBranch || "Nairobi Corporate Branch",
      creditAppRef: formData.creditAppRef || `CR-2026-${Math.floor(100 + Math.random() * 900)}`,
      conditions: formattedConditions,
      auditTrail: [newAudit],
      supportingDocuments: formDocuments
    };

    setExemptions(prev => [newExemption, ...prev]);

    // Save Zidisha / Share instruction if enabled
    if (enableFormZidisha) {
      const newInst = {
        id: `ZID-${Math.floor(100 + Math.random() * 900)}`,
        exemptionId: newExemptionId,
        exemptionCustomerName: formData.customerName,
        conditionId: targetZidishaConditionId,
        conditionText: `Build ${formZidishaType} on a periodic basis (${formZidishaFrequency} contribution of ${formatCurrency(formZidishaAmount, formData.currency)}) to support microfinance & back office capital targets.`,
        debitAccount: formZidishaDebit || finalAccountNumber,
        creditAccount: formZidishaCredit,
        amount: Number(formZidishaAmount),
        frequency: formZidishaFrequency,
        dateCreated: todayStr,
        status: "ACTIVE"
      };
      setZidishaInstructions(prev => {
        const updated = [...prev, newInst];
        localStorage.setItem("crest_zidisha_instructions", JSON.stringify(updated));
        return updated;
      });

      // Automatically trigger CBS Alert to effect it!
      setTimeout(() => {
        handleRunZidishaCbsSimulation(newInst);
      }, 800);
    }

    // Reset Form
    setFormData({
      customerName: "",
      accountNumber: "",
      loanAmount: "",
      loanPurpose: "",
      creditStatus: "GOOD",
      exemptionReason: "",
      officerNotes: "",
      officerName: currentUser.name,
      officerId: currentUser.id,
      officerContact: currentUser.contact,
      riskLevel: "MEDIUM",
      riskScore: 50,
      originBranch: "",
      creditAppRef: "",
      currency: "USD",
    });
    setFormMitigations([
      "Additional review of guarantor tax files.",
      "First collateral charge registration."
    ]);
    setFormConditions([
      { condition: "Submit audited annual accounts within 90 days of fiscal year end.", days: 90, action: "Request draft accounts" }
    ]);
    setFormDocuments([]);
    setAiAnalysisResult(null);

    // Reset optional Zidisha form states
    setEnableFormZidisha(false);
    setFormZidishaDebit("");
    setFormZidishaCredit("ZID-GLOBAL-TREASURY");
    setFormZidishaAmount(200);
    setFormZidishaFrequency("Monthly");
    setFormZidishaType("Zidisha Shares");

    // Switch Tab
    setActiveTab("dashboard");
  };

  const handleRunAiAssessment = async () => {
    if (!formData.exemptionReason || !formData.loanAmount) {
      setAiError("Exemption Reason and Loan Amount are required to generate AI risk assessment.");
      return;
    }

    setIsAiAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/analyze-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          accountNumber: formData.accountNumber,
          loanAmount: formData.loanAmount,
          loanPurpose: formData.loanPurpose,
          creditStatus: formData.creditStatus,
          exemptionReason: formData.exemptionReason,
          officerNotes: formData.officerNotes,
          customConditions: formConditions
        })
      });

      if (!response.ok) {
        throw new Error("Server responded with error status: " + response.status);
      }

      const data = await response.json();
      setAiAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An unexpected error occurred while contacting the Gemini AI Advisor.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const applyAiRecommendations = () => {
    if (!aiAnalysisResult) return;

    setFormData(prev => ({
      ...prev,
      riskScore: aiAnalysisResult.riskScore,
      riskLevel: aiAnalysisResult.riskLevel,
    }));

    // Append AI mitigations
    setFormMitigations(prev => {
      const existing = [...prev];
      aiAnalysisResult.mitigations.forEach(mit => {
        if (!existing.includes(mit)) {
          existing.push(mit);
        }
      });
      return existing;
    });

    // Append AI conditions
    setFormConditions(prev => {
      const existing = [...prev];
      aiAnalysisResult.recommendedConditions.forEach(cond => {
        existing.push({
          condition: cond.condition,
          days: cond.expectedTimelineDays,
          action: cond.followUpAction
        });
      });
      return existing;
    });
  };

  const handleGenerateAiReport = async () => {
    setIsGeneratingReport(true);
    setAiReportSummary(null);

    try {
      const response = await fetch("/api/ai/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exemptions })
      });

      if (!response.ok) {
        throw new Error("Server responded with error status: " + response.status);
      }

      const data = await response.json();
      setAiReportSummary(data.reportSummary);
    } catch (err: any) {
      console.error(err);
      setAiReportSummary("Error: Failed to contact Chief Risk Officer Model. " + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExemptionStatusChange = (id: string, newStatus: Exemption["status"], statusReason?: string) => {
    setExemptions(prev => prev.map(ex => {
      if (ex.id !== id) return ex;

      const dateStr = "2026-06-26";
      const newAudit: AuditLog = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        performedBy: `${currentUser.name} (${currentUser.role})`,
        action: `Status Updated to ${newStatus}`,
        details: `Exemption status modified from ${ex.status} to ${newStatus}.${statusReason ? ` Note: ${statusReason}` : ""}`
      };

      return {
        ...ex,
        status: newStatus,
        dateGranted: newStatus === "APPROVED" ? dateStr : ex.dateGranted,
        auditTrail: [newAudit, ...ex.auditTrail]
      };
    }));
  };

  const handleAddConditionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConditionExemption || !followUpActionText) return;

    const { exemptionId, conditionId } = activeConditionExemption;
    const todayStr = "2026-06-26";

    setExemptions(prev => prev.map(ex => {
      if (ex.id !== exemptionId) return ex;

      const updatedConditions = ex.conditions.map(cond => {
        if (cond.id !== conditionId) return cond;

        const newLog: FollowUpLog = {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          date: todayStr,
          officerName: currentUser.name,
          actionTaken: followUpActionText,
          nextSteps: followUpNextSteps || undefined
        };

        return {
          ...cond,
          logs: [newLog, ...cond.logs]
        };
      });

      const newAudit: AuditLog = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        performedBy: `${currentUser.name} (${currentUser.role})`,
        action: "Condition Monitored",
        details: `Logged follow-up action on condition ${conditionId}: "${followUpActionText.substring(0, 60)}..."`
      };

      return {
        ...ex,
        conditions: updatedConditions,
        auditTrail: [newAudit, ...ex.auditTrail]
      };
    }));

    // Reset Followup input
    setFollowUpActionText("");
    setFollowUpNextSteps("");
    setActiveConditionExemption(null);
  };

  const handleToggleConditionMet = (exemptionId: string, conditionId: string) => {
    setExemptions(prev => prev.map(ex => {
      if (ex.id !== exemptionId) return ex;

      let allResolved = true;
      const updatedConditions = ex.conditions.map(cond => {
        if (cond.id !== conditionId) {
          if (!cond.isMet) allResolved = false;
          return cond;
        }

        const newIsMet = !cond.isMet;
        if (!newIsMet) allResolved = false;

        return {
          ...cond,
          isMet: newIsMet,
          dateMet: newIsMet ? "2026-06-26" : undefined
        };
      });

      const toggledCond = ex.conditions.find(c => c.id === conditionId);
      const actionDesc = toggledCond?.isMet ? "marked as Active/Pending" : "marked as Met/Satisfied";

      const newAudit: AuditLog = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        performedBy: `${currentUser.name} (${currentUser.role})`,
        action: "Condition Status Updated",
        details: `Condition ${conditionId} was ${actionDesc}.`
      };

      // Auto-resolve exemption if all conditions are met
      let newStatus = ex.status;
      if (allResolved && ex.status === "APPROVED") {
        newStatus = "RESOLVED";
        const autoAudit: AuditLog = {
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          performedBy: "System (Automation)",
          action: "Auto-Resolved Exemption",
          details: `All conditional requirements have been successfully satisfied. Loan exemption officially closed.`
        };
        return {
          ...ex,
          status: newStatus,
          conditions: updatedConditions,
          auditTrail: [autoAudit, newAudit, ...ex.auditTrail]
        };
      }

      return {
        ...ex,
        status: newStatus,
        conditions: updatedConditions,
        auditTrail: [newAudit, ...ex.auditTrail]
      };
    }));
  };

  const handleResetExemptions = () => {
    if (confirm("Are you sure you want to restore the system to original demo state? This will clear all changes.")) {
      setExemptions(initialExemptions);
      setSelectedExemptionId(null);
      localStorage.removeItem("crest_exemptions");
    }
  };

  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!agreeTerms) {
      setLoginError("You must acknowledge regulatory compliance to access the system.");
      return;
    }

    if (!loginEmail.includes("@") || loginEmail.length < 5) {
      setLoginError("Please enter a valid CrestBank corporate email address.");
      return;
    }
    if (loginPassword.length < 4) {
      setLoginError("Credentials must meet CrestBank minimum character requirements (min 4 characters).");
      return;
    }

    // Determine the user details based on choice or typing
    let targetUser = {
      name: "Sarah Jenkins",
      role: "Senior Credit Officer",
      id: "CO-9812",
      contact: "s.jenkins@crestbank.com"
    };

    if (loginEmail.toLowerCase() === "s.jenkins@crestbank.com" || loginEmail.toLowerCase() === "sarah@crestbank.com") {
      targetUser = {
        name: "Sarah Jenkins",
        role: "Senior Credit Officer",
        id: "CO-9812",
        contact: "s.jenkins@crestbank.com"
      };
    } else if (loginEmail.toLowerCase() === "j.vance@crestbank.com" || loginEmail.toLowerCase() === "james@crestbank.com") {
      targetUser = {
        name: "James Vance",
        role: "Senior Credit Director",
        id: "DIR-002",
        contact: "j.vance@crestbank.com"
      };
    } else {
      // Custom user
      const customName = loginCustomName.trim() || loginEmail.split("@")[0].split(".").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      const roleStr = loginRole === "Director" ? "Senior Credit Director" : "Senior Credit Officer";
      const idPrefix = loginRole === "Director" ? "DIR" : "CO";
      const randomId = Math.floor(1000 + Math.random() * 9000);
      
      targetUser = {
        name: customName,
        role: roleStr,
        id: `${idPrefix}-${randomId}`,
        contact: loginEmail.toLowerCase()
      };
    }

    setCurrentUser(targetUser);
    setIsLoggedIn(true);
    localStorage.setItem("crest_is_logged_in", "true");
    
    // Clear login fields
    setLoginPassword("");
    setLoginPin("");
    setLoginError("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("crest_is_logged_in", "false");
  };

  // --- FILTERS LOGIC ---
  const filteredExemptions = exemptions.filter(ex => {
    const matchesSearch = 
      ex.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.accountNumber.includes(searchQuery) ||
      ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.officerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || ex.status === statusFilter;
    const matchesRisk = riskFilter === "ALL" || ex.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const selectedExemption = exemptions.find(ex => ex.id === selectedExemptionId);

  // --- METRIC COMPUTATIONS ---
  const totalExposure = exemptions
    .filter(ex => ex.status === "APPROVED" || ex.status === "RESOLVED")
    .reduce((sum, ex) => sum + ex.loanAmount, 0);

  const pendingExposure = exemptions
    .filter(ex => ex.status === "PENDING" || ex.status === "ESCALATED")
    .reduce((sum, ex) => sum + ex.loanAmount, 0);

  const totalOverdueConditions = exemptions.reduce((sum, ex) => {
    const today = new Date("2026-06-26");
    const count = ex.conditions.filter(c => !c.isMet && new Date(c.expectedDate) < today).length;
    return sum + count;
  }, 0);

  const averageRiskScore = Math.round(
    exemptions.reduce((sum, ex) => sum + (ex.riskScore || 50), 0) / exemptions.length
  );

  // --- THEME STYLING VARIABLES ---
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#0d0f12]" : "bg-[#f4f6f8]";
  const textMain = isDark ? "text-[#f1f3f5]" : "text-slate-800";
  const bgHeader = isDark ? "bg-[#11141c]" : "bg-white";
  const borderHeader = isDark ? "border-b border-[#1f242e]" : "border-b border-slate-200";
  const bgCard = isDark ? "bg-[#11141c]" : "bg-white";
  const borderCard = isDark ? "border-[#1f242e]" : "border-slate-200";
  const hoverBorderCard = isDark ? "hover:border-[#2b3345]" : "hover:border-slate-300";
  const bgSubCard = isDark ? "bg-[#171c26]" : "bg-slate-50";
  const borderSubCard = isDark ? "border-[#232a3a]" : "border-slate-200";
  const textSub = isDark ? "text-[#8c9ba5]" : "text-slate-500";
  const textMuted = isDark ? "text-[#506373]" : "text-slate-400";
  const textWhiteOrSlate = isDark ? "text-white" : "text-slate-900";
  const textWhiteOrSlateMuted = isDark ? "text-[#c9d1d9]" : "text-slate-700";
  const borderInput = isDark ? "border-[#262d3d]" : "border-slate-200";
  const bgSelectOption = isDark ? "bg-[#11141c]" : "bg-white text-slate-800";

  const getRiskBadgeClasses = (level: "LOW" | "MEDIUM" | "HIGH") => {
    if (isDark) {
      switch (level) {
        case "LOW": return "bg-emerald-400/20 text-emerald-300";
        case "MEDIUM": return "bg-amber-400/20 text-amber-300";
        case "HIGH": return "bg-red-400/20 text-red-300";
      }
    } else {
      switch (level) {
        case "LOW": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
        case "MEDIUM": return "bg-amber-100 text-amber-800 border border-amber-200";
        case "HIGH": return "bg-red-100 text-red-800 border border-red-200";
      }
    }
  };

  const getStatusBadgeClasses = (status: Exemption["status"]) => {
    if (isDark) {
      switch (status) {
        case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        case "APPROVED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "RESOLVED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        case "ESCALATED": return "bg-red-500/10 text-red-400 border-red-500/20";
        case "REJECTED": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      }
    } else {
      switch (status) {
        case "PENDING": return "bg-amber-50 text-amber-700 border border-amber-200";
        case "APPROVED": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "RESOLVED": return "bg-blue-50 text-blue-700 border border-blue-200";
        case "ESCALATED": return "bg-red-50 text-red-700 border border-red-200";
        case "REJECTED": return "bg-slate-100 text-slate-700 border border-slate-200";
      }
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <div className={`min-h-screen ${bgMain} ${textMain} font-sans antialiased flex flex-col justify-center items-center p-4 transition-colors duration-250 relative`}>
          {/* Theme Toggle in Login */}
          <div className="absolute top-4 right-4 flex gap-3">
            <button 
              onClick={toggleTheme} 
              className={`flex items-center justify-center p-2 rounded-lg border transition ${
                isDark 
                  ? "text-amber-400 bg-[#171c26] hover:bg-[#1f2636] border-[#262d3d]" 
                  : "text-indigo-600 bg-slate-100 hover:bg-slate-200 border-slate-300"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full max-w-md ${bgCard} border ${borderCard} rounded-2xl p-8 shadow-xl relative overflow-hidden`}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>

            {/* Logo / Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <div className={`${isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"} p-3 rounded-xl border`}>
                  <SlidersHorizontal className="h-7 w-7" />
                </div>
              </div>
              <h1 className={`font-sans font-bold text-2xl tracking-tight ${textWhiteOrSlate} uppercase`}>CrestBank</h1>
              <p className={`text-xs ${textSub} mt-1`}>Credit Policy Exemption & Tracking Portal</p>
            </div>

            {/* Quick Demo Sign-Ins */}
            <div className="mb-6">
              <p className={`text-[10px] font-bold ${textSub} uppercase tracking-wider mb-2.5 text-center`}>Quick Authenticate Demo Profile</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("s.jenkins@crestbank.com");
                    setLoginPassword("password123");
                    setLoginPin("9812");
                    setLoginRole("Officer");
                    setLoginCustomName("Sarah Jenkins");
                  }}
                  className={`text-left p-3 rounded-lg border text-xs transition ${
                    loginEmail === "s.jenkins@crestbank.com"
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                      : `${borderSubCard} ${bgSubCard} hover:border-emerald-500/30`
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Sarah Jenkins
                  </div>
                  <div className={`text-[10px] ${textSub} mt-0.5`}>Senior Credit Officer</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("j.vance@crestbank.com");
                    setLoginPassword("password123");
                    setLoginPin("0022");
                    setLoginRole("Director");
                    setLoginCustomName("James Vance");
                  }}
                  className={`text-left p-3 rounded-lg border text-xs transition ${
                    loginEmail === "j.vance@crestbank.com"
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                      : `${borderSubCard} ${bgSubCard} hover:border-emerald-500/30`
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <UserCheck className="h-3 w-3" /> James Vance
                  </div>
                  <div className={`text-[10px] ${textSub} mt-0.5`}>Credit Director</div>
                </button>
              </div>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><span className={`w-full border-t ${borderSubCard}`}></span></div>
              <span className={`relative bg-transparent px-3 text-[10px] ${textSub} uppercase font-mono`}>Or Secure Credentials</span>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {loginError && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg p-3 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Corporate Email Address *</label>
                <div className="relative">
                  <input
                    required
                    type="email"
                    placeholder="e.g. s.jenkins@crestbank.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (e.target.value.toLowerCase().includes("vance")) {
                        setLoginRole("Director");
                      } else if (e.target.value.toLowerCase().includes("jenkins")) {
                        setLoginRole("Officer");
                      }
                    }}
                    className={`bg-[#171c26]/60 border ${borderInput} rounded-lg pl-9 pr-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                  />
                  <User className={`h-4 w-4 absolute left-3 top-2.5 ${textSub}`} />
                </div>
              </div>

              {/* Optional Custom Display Name */}
              {!["s.jenkins@crestbank.com", "j.vance@crestbank.com"].includes(loginEmail.toLowerCase()) && loginEmail.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Display Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Miller"
                      value={loginCustomName}
                      onChange={(e) => setLoginCustomName(e.target.value)}
                      className={`bg-[#171c26]/60 border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Authorized Role Delegation *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLoginRole("Officer")}
                        className={`py-2 rounded-lg border text-xs font-semibold transition ${
                          loginRole === "Officer"
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                            : `${borderSubCard} ${bgSubCard}`
                        }`}
                      >
                        Credit Officer
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginRole("Director")}
                        className={`py-2 rounded-lg border text-xs font-semibold transition ${
                          loginRole === "Director"
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                            : `${borderSubCard} ${bgSubCard}`
                        }`}
                      >
                        Credit Director
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Password *</label>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`bg-[#171c26]/60 border ${borderInput} rounded-lg pl-9 pr-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full`}
                    />
                    <Lock className={`h-4 w-4 absolute left-3 top-2.5 ${textSub}`} />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Secure Key PIN *</label>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                      className={`bg-[#171c26]/60 border ${borderInput} rounded-lg pl-9 pr-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full font-mono`}
                    />
                    <ShieldAlert className={`h-4 w-4 absolute left-3 top-2.5 ${textSub}`} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-1">
                <input
                  type="checkbox"
                  id="agree-compliance"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="agree-compliance" className={`text-[10px] ${textSub} leading-normal cursor-pointer select-none`}>
                  I certify that I am accessing this terminal using authorized credentials. All actions are logged under audit compliance protocols (Basel IV).
                </label>
              </div>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs py-2.5 px-4 rounded-lg mt-2 transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer animate-none"
              >
                <UserCheck className="h-4 w-4" />
                Authorize & Access Terminal
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className={`min-h-screen ${bgMain} ${textMain} font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-black transition-colors duration-250`}>
      
      {/* HEADER SECTION */}
      <header className={`${borderHeader} ${bgHeader} sticky top-0 z-40 px-6 py-4 flex flex-wrap gap-4 items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`${isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"} p-2.5 rounded-lg border`}>
            <SlidersHorizontal className="h-6 w-6" id="app-logo" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-sans font-bold text-lg tracking-tight ${textWhiteOrSlate} uppercase`}>CrestBank</h1>
              <span className={`text-[10px] ${isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"} font-mono px-2 py-0.5 rounded-full border flex items-center gap-1`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-600"} animate-pulse`}></span>
                SECURE NODE
              </span>
            </div>
            <p className={`text-xs ${textSub}`}>Credit Policy Exemption & Tracking Engine</p>
          </div>
        </div>

        {/* User Role Quick Switcher & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-3 ${bgSubCard} border ${borderSubCard} rounded-lg px-3 py-1.5`}>
            <div className={`${isDark ? "bg-[#1f2636] border-[#2e374b] text-emerald-400" : "bg-slate-100 border-slate-200 text-emerald-600"} h-8 w-8 rounded-full border flex items-center justify-center`}>
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <select 
                  className={`bg-transparent text-xs font-semibold ${textWhiteOrSlate} font-sans focus:outline-none cursor-pointer p-0`}
                  value={currentUser.name}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    if (chosen === "Sarah Jenkins") {
                      setCurrentUser({
                        name: "Sarah Jenkins",
                        role: "Senior Credit Officer",
                        id: "CO-9812",
                        contact: "s.jenkins@crestbank.com"
                      });
                    } else {
                      setCurrentUser({
                        name: "James Vance",
                        role: "Senior Credit Director",
                        id: "DIR-002",
                        contact: "j.vance@crestbank.com"
                      });
                    }
                  }}
                >
                  <option value="Sarah Jenkins" className={bgSelectOption}>Sarah Jenkins (Officer)</option>
                  <option value="James Vance" className={bgSelectOption}>James Vance (Director)</option>
                </select>
              </div>
              <p className={`text-[10px] ${textSub}`}>{currentUser.role} • {currentUser.id}</p>
            </div>
            <div className={`h-6 w-px ${isDark ? "bg-[#2d374d]" : "bg-slate-200"} mx-1`}></div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
              title="Sign Out of Terminal"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className={`flex items-center justify-center p-2 rounded-lg border transition ${
              isDark 
                ? "text-amber-400 bg-[#171c26] hover:bg-[#1f2636] border-[#262d3d]" 
                : "text-indigo-600 bg-slate-100 hover:bg-slate-200 border-slate-300"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button 
            onClick={handleResetExemptions} 
            className={`flex items-center gap-1 text-xs transition border rounded-lg px-3 py-2 ${
              isDark 
                ? "text-[#8c9ba5] hover:text-white bg-[#171c26] hover:bg-[#1f2636] border-[#262d3d]" 
                : "text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300"
            }`}
            title="Restore Demo Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Restore Demo</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADERReminders Alert strip */}
      {dynamicAlerts.length > 0 && (
        <div className={`${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"} border-b px-6 py-2.5 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-2 text-xs">
            <Bell className={`h-4 w-4 animate-bounce ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <span className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-700"}`}>System Reminders ({dynamicAlerts.length}):</span>
            <span className={`${textSub} truncate hidden md:inline`}>
              {dynamicAlerts[0].title}: {dynamicAlerts[0].description}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab("monitoring")} 
            className={`text-[11px] font-semibold ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-800"} hover:underline flex items-center gap-1`}
          >
            View Condition Tracker <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <nav className={`${bgHeader} border-b ${borderCard} px-6 py-1 flex items-center overflow-x-auto gap-1`}>
        {[
          { id: "dashboard" as const, label: "Exemption Dashboard", icon: <Layers className="h-4 w-4" /> },
          { id: "new-request" as const, label: "New Request Form", icon: <Plus className="h-4 w-4" /> },
          { id: "monitoring" as const, label: `Condition Tracker (${exemptions.reduce((c, e) => c + e.conditions.filter(x => !x.isMet).length, 0)} Active)`, icon: <Activity className="h-4 w-4" /> },
          { id: "analytics" as const, label: "AI Portfolio Reports", icon: <TrendingUp className="h-4 w-4" /> },
          { id: "audit" as const, label: "System Audit Trail", icon: <History className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedExemptionId(null); }}
            className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === tab.id 
                ? `border-emerald-500 ${isDark ? "text-white" : "text-slate-900"}` 
                : `border-transparent ${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-900"}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        
        {/* TAB CONTENT: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            
            {/* PORTFOLIO SNAPSHOT METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${bgCard} border ${borderCard} rounded-xl p-5 ${hoverBorderCard} transition flex items-center justify-between`}>
                <div>
                  <p className={`text-xs ${textSub} font-semibold tracking-wider uppercase`}>Active Exposure</p>
                  <p className={`text-2xl font-bold ${textWhiteOrSlate} mt-1`}>${totalExposure.toLocaleString()}</p>
                  <p className={`text-[10px] ${isDark ? "text-emerald-400" : "text-emerald-600"} mt-1.5 flex items-center gap-1`}>
                    <CheckCircle2 className="h-3 w-3" /> Approved & resolved files
                  </p>
                </div>
                <div className={`${isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"} p-3 rounded-xl border`}>
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              <div className={`${bgCard} border ${borderCard} rounded-xl p-5 ${hoverBorderCard} transition flex items-center justify-between`}>
                <div>
                  <p className={`text-xs ${textSub} font-semibold tracking-wider uppercase`}>Pipeline Exposure</p>
                  <p className={`text-2xl font-bold ${textWhiteOrSlate} mt-1`}>${pendingExposure.toLocaleString()}</p>
                  <p className={`text-[10px] ${isDark ? "text-amber-400" : "text-amber-600"} mt-1.5 flex items-center gap-1`}>
                    <Clock className="h-3 w-3" /> Pending credit decisions
                  </p>
                </div>
                <div className={`${isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"} p-3 rounded-xl border`}>
                  <Clock className="h-6 w-6" />
                </div>
              </div>

              <div className={`${bgCard} border ${borderCard} rounded-xl p-5 ${hoverBorderCard} transition flex items-center justify-between`}>
                <div>
                  <p className={`text-xs ${textSub} font-semibold tracking-wider uppercase`}>Overdue Conditions</p>
                  <p className="text-2xl font-bold text-[#f87171] mt-1">{totalOverdueConditions}</p>
                  <p className={`text-[10px] ${isDark ? "text-red-400" : "text-red-600"} mt-1.5 flex items-center gap-1`}>
                    <ShieldAlert className="h-3 w-3" /> Immediate officer follow-up
                  </p>
                </div>
                <div className={`${isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"} p-3 rounded-xl border`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>

              <div className={`${bgCard} border ${borderCard} rounded-xl p-5 ${hoverBorderCard} transition flex items-center justify-between`}>
                <div>
                  <p className={`text-xs ${textSub} font-semibold tracking-wider uppercase`}>Portfolio Avg Risk</p>
                  <p className={`text-2xl font-bold ${textWhiteOrSlate} mt-1`}>{averageRiskScore}/100</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                    <div className={`w-16 ${isDark ? "bg-[#1f242e]" : "bg-slate-200"} h-2 rounded-full overflow-hidden`}>
                      <div className="bg-yellow-500 h-full" style={{ width: `${averageRiskScore}%` }}></div>
                    </div>
                    <span className={textSub}>Moderate Score</span>
                  </div>
                </div>
                <div className={`${isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"} p-3 rounded-xl border`}>
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* INTERACTIVE CONTROLS SECTION */}
            <div className={`${bgCard} border ${borderCard} rounded-xl p-5 flex flex-wrap gap-4 items-center justify-between`}>
              
              {/* Search input */}
              <div className="relative min-w-[280px] flex-1">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${textSub}`} />
                <input
                  type="text"
                  placeholder="Search customer, account or officer name..."
                  className={`${bgSubCard} border ${borderInput} rounded-lg pl-10 pr-4 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status and Risk Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono tracking-wider ${textSub}`}>Status:</span>
                  <div className={`${bgSubCard} border ${borderInput} rounded-lg p-0.5 flex gap-1`}>
                    {["ALL", "PENDING", "APPROVED", "ESCALATED", "RESOLVED"].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 text-[10px] font-semibold rounded-md transition ${
                          statusFilter === status 
                            ? "bg-emerald-500 text-black shadow-sm" 
                            : `${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-900"}`
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono tracking-wider ${textSub}`}>Risk:</span>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className={`${bgSubCard} border ${borderInput} rounded-lg px-3 py-1.5 text-[10px] font-semibold ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 cursor-pointer`}
                  >
                    <option value="ALL" className={bgSelectOption}>ALL RISKS</option>
                    <option value="LOW" className={bgSelectOption}>LOW</option>
                    <option value="MEDIUM" className={bgSelectOption}>MEDIUM</option>
                    <option value="HIGH" className={bgSelectOption}>HIGH</option>
                  </select>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN SPLIT: LIST AND DETAILED DRAWER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Exemption List Grid */}
              <div className={`flex flex-col gap-4 ${selectedExemptionId ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"}`}>
                <div className="flex justify-between items-center px-1">
                  <h3 className={`text-xs font-semibold tracking-wider ${textSub} uppercase`}>
                    Exemption Records ({filteredExemptions.length})
                  </h3>
                  <button 
                    onClick={() => setActiveTab("new-request")} 
                    className={`text-xs ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} font-semibold flex items-center gap-1`}
                  >
                    <Plus className="h-3.5 w-3.5" /> Request Exemption
                  </button>
                </div>

                {filteredExemptions.length === 0 ? (
                  <div className={`${bgCard} border ${borderCard} rounded-xl p-10 text-center flex flex-col items-center justify-center gap-3`}>
                    <Info className="h-10 w-10 text-amber-500/70" />
                    <p className={`text-sm font-semibold ${textWhiteOrSlate}`}>No credit exemptions match the filters</p>
                    <p className={`text-xs ${textSub} max-w-md`}>Try modifying your search or check that you have selected the correct status tab above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExemptions.map((ex) => {
                      const isSelected = selectedExemptionId === ex.id;
                      const metCount = ex.conditions.filter(c => c.isMet).length;
                      const totalCount = ex.conditions.length;

                      return (
                        <div
                          key={ex.id}
                          id={`ex-card-${ex.id}`}
                          onClick={() => setSelectedExemptionId(ex.id)}
                          className={`border rounded-xl p-5 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all flex flex-col justify-between gap-4 ${
                            isSelected 
                              ? `border-emerald-500 ring-1 ring-emerald-500/20 ${isDark ? "bg-[#161c27]" : "bg-emerald-50/20"}` 
                              : `${borderCard} ${bgCard} ${hoverBorderCard}`
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-mono tracking-wider ${textSub} uppercase`}>{ex.id}</span>
                              <div className="flex gap-2">
                                <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full ${getStatusBadgeClasses(ex.status)}`}>
                                  {ex.status}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getRiskBadgeClasses(ex.riskLevel)}`}>
                                  {ex.riskLevel}
                                </span>
                              </div>
                            </div>

                            <h4 className={`font-bold ${textWhiteOrSlate} text-base mt-2 hover:text-emerald-500 transition truncate`}>{ex.customerName}</h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
                              <span>Account: {ex.accountNumber}</span>
                              <span>• Branch: {ex.originBranch || "Nairobi Corporate Branch"}</span>
                              <span>• Ref: {ex.creditAppRef || `CR-2026-${Math.floor(100 + Math.random() * 900)}`}</span>
                            </div>
                            
                            <p className={`text-xs ${textWhiteOrSlateMuted} mt-3 line-clamp-2 leading-relaxed`}>
                              {ex.exemptionReason}
                            </p>
                          </div>

                          <div className={`border-t ${borderCard} pt-3 mt-1 flex items-center justify-between`}>
                            <div>
                              <p className={`text-[10px] ${textSub} uppercase tracking-wider`}>Loan approved</p>
                              <p className={`text-sm font-bold ${textWhiteOrSlate} mt-0.5`}>{formatCurrency(ex.loanAmount, ex.currency)}</p>
                            </div>

                            <div className="text-right">
                              <p className={`text-[10px] ${textSub} uppercase tracking-wider`}>Conditions Met</p>
                              <p className={`text-xs font-semibold ${textWhiteOrSlate} mt-0.5 flex items-center gap-1 justify-end`}>
                                <FileCheck2 className={`h-3.5 w-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                                {metCount}/{totalCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Exemption Detail Panel (Visible only when an exemption is selected) */}
              <AnimatePresence>
                {selectedExemption && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`lg:col-span-5 xl:col-span-4 ${bgCard} border ${borderCard} rounded-xl flex flex-col shadow-2xl relative overflow-hidden sticky top-[92px]`}
                  >
                    {/* Header of Detail View */}
                    <div className={`border-b ${borderCard} ${bgSubCard} p-5 flex justify-between items-center`}>
                      <div>
                        <span className={`text-[10px] font-mono ${textSub} uppercase`}>{selectedExemption.id}</span>
                        <h3 className={`font-bold ${textWhiteOrSlate} text-lg mt-0.5`}>Exemption Dossier</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedExemptionId(null)}
                        className={`${textSub} ${isDark ? "hover:text-white bg-[#1f2636] hover:bg-[#2e374b]" : "hover:text-slate-900 bg-slate-100 hover:bg-slate-200"} p-1.5 rounded-lg transition`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
                      
                      {/* Customer Info */}
                      <div>
                        <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-2`}>Customer & Credit Profile</h4>
                        <div className={`${bgSubCard} border ${borderSubCard} rounded-lg p-4 flex flex-col gap-2.5`}>
                          <div>
                            <span className={`text-[10px] ${textSub} block`}>Borrower Legal Name</span>
                            <span className={`font-bold ${textWhiteOrSlate} text-sm`}>{selectedExemption.customerName}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className={`text-[10px] ${textSub} block`}>Account Number</span>
                              <span className={`font-mono text-xs ${textWhiteOrSlate}`}>{selectedExemption.accountNumber}</span>
                            </div>
                            <div>
                              <span className={`text-[10px] ${textSub} block`}>Subject Credit Rating</span>
                              <span className={`font-bold text-xs ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{selectedExemption.creditStatus}</span>
                            </div>
                          </div>
                          <div className={`grid grid-cols-2 gap-4 border-t ${borderCard} pt-2.5 mt-0.5`}>
                            <div>
                              <span className={`text-[10px] ${textSub} block`}>Facility Amount</span>
                              <span className={`font-bold text-sm ${textWhiteOrSlate}`}>{formatCurrency(selectedExemption.loanAmount, selectedExemption.currency)}</span>
                            </div>
                            <div>
                              <span className={`text-[10px] ${textSub} block`}>Risk Rating</span>
                              <span className={`font-mono font-bold text-xs ${isDark ? "text-yellow-400" : "text-amber-600"}`}>{selectedExemption.riskLevel} ({selectedExemption.riskScore || 'N/A'}/100)</span>
                            </div>
                          </div>
                          <div className={`grid grid-cols-2 gap-4 border-t ${borderCard} pt-2.5`}>
                            <div>
                              <span className={`text-[10px] ${textSub} block`}>Origin Branch</span>
                              <span className={`font-semibold text-xs ${textWhiteOrSlate}`}>{selectedExemption.originBranch || "Nairobi Corporate Branch"}</span>
                            </div>
                            <div>
                              <span className={`text-[10px] ${textSub} block`}>Credit Application Ref</span>
                              <span className={`font-mono font-semibold text-xs text-emerald-400`}>{selectedExemption.creditAppRef || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exemption Reason */}
                      <div>
                        <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-2`}>Policy Breach Description</h4>
                        <div className={`${isDark ? "bg-[#171c26]/50" : "bg-slate-50"} border ${borderCard} rounded-lg p-4`}>
                          <p className={`text-xs ${textWhiteOrSlateMuted} leading-relaxed whitespace-pre-wrap`}>{selectedExemption.exemptionReason}</p>
                        </div>
                      </div>

                      {/* Mitigations */}
                      <div>
                        <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-2`}>Mitigation Measures Applied</h4>
                        <ul className="flex flex-col gap-2">
                          {selectedExemption.mitigations.map((mit, i) => (
                            <li key={i} className={`flex gap-2.5 text-xs ${textWhiteOrSlateMuted} items-start ${bgSubCard} p-2.5 rounded border ${borderSubCard}`}>
                              <CheckCircle2 className={`h-4 w-4 ${isDark ? "text-emerald-400 animate-pulse" : "text-emerald-600"} shrink-0 mt-0.5`} />
                              <span>{mit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Supporting Documents */}
                      {selectedExemption.supportingDocuments && selectedExemption.supportingDocuments.length > 0 && (
                        <div>
                          <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-2`}>Supporting Documentation</h4>
                          <div className="flex flex-col gap-2">
                            {selectedExemption.supportingDocuments.map((doc, i) => (
                              <div key={i} className={`flex items-center justify-between ${bgSubCard} border ${borderSubCard} p-2.5 rounded-lg text-xs`}>
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                                  <div className="truncate">
                                    <p className={`font-semibold ${textWhiteOrSlate} truncate`}>{doc.name}</p>
                                    <p className={`text-[10px] ${textSub}`}>{doc.type} • {(doc.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                                {doc.dataUrl ? (
                                  <a 
                                    href={doc.dataUrl} 
                                    download={doc.name}
                                    className={`text-[10px] font-bold ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} shrink-0 ml-2`}
                                  >
                                    Download
                                  </a>
                                ) : (
                                  <span className={`text-[10px] ${textSub} italic shrink-0 ml-2`}>No preview</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conditions Checklist */}
                      <div>
                        <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-2`}>Conditional Requirements Checklist</h4>
                        <div className="flex flex-col gap-3">
                          {selectedExemption.conditions.map((cond) => {
                            const isOverdue = !cond.isMet && new Date(cond.expectedDate) < new Date("2026-06-26");
                            return (
                              <div key={cond.id} className={`${bgSubCard} border ${borderSubCard} rounded-lg p-3.5 flex flex-col gap-2`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2.5">
                                    <button 
                                      onClick={() => handleToggleConditionMet(selectedExemption.id, cond.id)}
                                      className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center transition shrink-0 ${
                                        cond.isMet 
                                          ? "bg-emerald-500 border-emerald-600 text-black" 
                                          : `${isDark ? "border-[#404c63] hover:border-white" : "border-slate-300 hover:border-slate-600"} text-transparent`
                                      }`}
                                    >
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </button>
                                    <div>
                                      <p className={`text-xs font-semibold leading-normal ${cond.isMet ? `line-through ${textSub}` : textWhiteOrSlate}`}>
                                        {cond.condition}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className={`text-[10px] ${textSub} flex items-center gap-1 font-mono`}>
                                          <Calendar className={`h-3 w-3 ${textSub}`} /> Target: {cond.expectedDate}
                                        </span>
                                        {isOverdue && (
                                          <span className={`text-[9px] font-bold ${isDark ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-red-700 bg-red-50 border-red-200"} px-1.5 py-0.5 rounded border uppercase tracking-widest`}>
                                            OVERDUE
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {cond.logs.length > 0 && (
                                  <div className={`border-t ${borderCard} pt-2 mt-1 ${isDark ? "bg-[#1a212e]/30" : "bg-slate-100/50"} px-2 py-1.5 rounded`}>
                                    <p className={`text-[10px] uppercase font-mono ${textSub} mb-1`}>Latest Follow-up:</p>
                                    <p className={`text-[11px] ${textWhiteOrSlate} italic`}>"{cond.logs[0].actionTaken}"</p>
                                    <span className={`text-[9px] ${textSub} block mt-1 font-mono`}>— {cond.logs[0].officerName} ({cond.logs[0].date})</span>
                                  </div>
                                )}

                                {!cond.isMet && (
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <button
                                      onClick={() => setActiveConditionExemption({ exemptionId: selectedExemption.id, conditionId: cond.id })}
                                      className={`text-left text-[10px] ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} font-semibold flex items-center gap-1`}
                                    >
                                      + Log Follow-up Action
                                    </button>

                                    {/zidisha|shares|share capital|back office/i.test(cond.condition) && (
                                      <button
                                        onClick={() => {
                                          const existing = zidishaInstructions.find(inst => inst.conditionId === cond.id);
                                          setActiveZidishaSetup({
                                            exemptionId: selectedExemption.id,
                                            conditionId: cond.id,
                                            customerName: selectedExemption.customerName,
                                            conditionText: cond.condition,
                                            defaultDebitAccount: selectedExemption.accountNumber
                                          });
                                          setZidishaDebitAccount(existing ? existing.debitAccount : selectedExemption.accountNumber);
                                          setZidishaCreditAccount(existing ? existing.creditAccount : "ZID-GLOBAL-TREASURY");
                                          setZidishaAmount(existing ? existing.amount : 200);
                                          setZidishaFrequency(existing ? existing.frequency : "Monthly");
                                          const typeMatch = cond.condition.match(/(Zidisha Shares|Back Office Shares|Share Capital|Welfare Fund)/i);
                                          setZidishaType(existing ? (existing.type || "Zidisha Shares") : (typeMatch ? typeMatch[0] : "Zidisha Shares"));
                                        }}
                                        className="text-left text-[10px] text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 ml-3"
                                      >
                                        ⚙️ Setup Periodic CBS Share Standing Order
                                      </button>
                                    )}
                                  </div>
                                )}

                                {(/zidisha|shares|share capital|back office/i.test(cond.condition) || zidishaInstructions.some(inst => inst.conditionId === cond.id)) && zidishaInstructions.some(inst => inst.conditionId === cond.id && inst.status === 'ACTIVE') && (
                                  <div className={`mt-2 p-2 rounded border text-[11px] ${isDark ? "bg-[#171c26]/60 border-emerald-500/20" : "bg-emerald-50/40 border-emerald-500/10"} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                                    <div className="flex items-center gap-1.5 text-emerald-400">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      <span className={`${isDark ? "text-emerald-400" : "text-emerald-800"} font-medium`}>
                                        Active standing instruction: ${zidishaInstructions.find(i => i.conditionId === cond.id)?.amount}/{zidishaInstructions.find(i => i.conditionId === cond.id)?.frequency} (from {zidishaInstructions.find(i => i.conditionId === cond.id)?.debitAccount})
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const inst = zidishaInstructions.find(i => i.conditionId === cond.id);
                                        if (inst) handleRunZidishaCbsSimulation(inst);
                                      }}
                                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 hover:bg-emerald-600 text-black font-semibold cursor-pointer shrink-0"
                                    >
                                      Simulate CBS Sync
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Credit Officer Info */}
                      <div>
                        <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-2`}>Account Ownership</h4>
                        <div className={`${isDark ? "bg-[#171c26]/30" : "bg-slate-50/50"} border ${borderCard} rounded-lg p-3.5 text-xs ${textWhiteOrSlateMuted} flex flex-col gap-1.5`}>
                          <p><span className={`${textSub} inline-block w-24`}>Credit Officer:</span> <span className={`${textWhiteOrSlate} font-semibold`}>{selectedExemption.officerName}</span></p>
                          <p><span className={`${textSub} inline-block w-24`}>Officer ID:</span> <span className={`font-mono ${textWhiteOrSlate}`}>{selectedExemption.officerId}</span></p>
                          <p><span className={`${textSub} inline-block w-24`}>Contact:</span> <span className={`font-mono ${textWhiteOrSlate}`}>{selectedExemption.officerContact}</span></p>
                          <p><span className={`${textSub} inline-block w-24`}>Origin Branch:</span> <span className={`${textWhiteOrSlate}`}>{selectedExemption.originBranch || "Nairobi Corporate Branch"}</span></p>
                          <p><span className={`${textSub} inline-block w-24`}>Credit App Ref:</span> <span className={`font-mono ${textWhiteOrSlate}`}>{selectedExemption.creditAppRef || "N/A"}</span></p>
                          
                          <div className={`mt-3 pt-3 border-t ${isDark ? "border-slate-800" : "border-slate-200"} flex justify-between items-center`}>
                            <span className={`text-[10px] ${textSub}`}>Direct Communication</span>
                            <button
                              id="btn-notify-officer"
                              onClick={() => {
                                setNotificationExemption(selectedExemption);
                                setNotificationSubject(`CrestBank Status Alert: Exemption Override ${selectedExemption.id} - ${selectedExemption.customerName}`);
                                setNotificationBody(`Dear ${selectedExemption.officerName},\n\nI am writing to notify you regarding a recent status update or review for credit policy override request ${selectedExemption.id} (${selectedExemption.customerName}) of amount ${formatCurrency(selectedExemption.loanAmount, selectedExemption.currency)}.\n\nCurrent Exemption Status: ${selectedExemption.status}\nExemption Reason: ${selectedExemption.exemptionReason}\n\nPlease review any pending conditions or documentation requirements immediately to ensure compliant portfolio execution.\n\nBest regards,\n${currentUser.name}\n${currentUser.role}\nCrestBank Risk Oversight`);
                                setNotificationAlert(null);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] rounded-lg transition flex items-center gap-1 shrink-0"
                            >
                              <Mail className="h-3.5 w-3.5" /> Notify Officer
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Audit Trail Timeline */}
                      <div>
                        <h4 className={`text-[10px] uppercase font-mono tracking-widest ${textSub} mb-3`}>Audit Trail Timeline</h4>
                        <div className={`border-l ${isDark ? "border-[#2e374b]" : "border-slate-200"} pl-3.5 flex flex-col gap-4`}>
                          {selectedExemption.auditTrail.map((log) => (
                            <div key={log.id} className="relative text-xs">
                              <span className={`absolute -left-[19.5px] top-1 bg-emerald-500 h-2 w-2 rounded-full ring-4 ${isDark ? "ring-[#11141c]" : "ring-white"}`}></span>
                              <div className={`flex items-center justify-between ${textSub} text-[10px] font-mono mb-0.5`}>
                                <span>{log.performedBy}</span>
                                <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className={`font-bold ${textWhiteOrSlate} text-[11px]`}>{log.action}</p>
                              <p className={`${textSub} text-[11px] mt-0.5 italic leading-relaxed`}>"{log.details}"</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Footer Action Buttons based on User Role */}
                    <div className={`border-t ${borderCard} ${bgSubCard} p-5 flex flex-wrap gap-2 justify-end`}>
                      
                      {selectedExemption.status === "PENDING" && currentUser.role === "Senior Credit Director" && (
                        <>
                          <button 
                            onClick={() => handleExemptionStatusChange(selectedExemption.id, "APPROVED", "Approved by James Vance after Senior Credit Committee review.")}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg transition"
                          >
                            Approve Exemption
                          </button>
                          <button 
                            onClick={() => handleExemptionStatusChange(selectedExemption.id, "REJECTED", "Rejected by James Vance. Policy overrides are currently locked for this LTV bucket.")}
                            className="bg-red-500 hover:bg-red-400 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {selectedExemption.status === "PENDING" && currentUser.role !== "Senior Credit Director" && (
                        <div className={`text-xs ${isDark ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-amber-700 bg-amber-50 border-amber-200"} border px-3.5 py-2.5 rounded-lg w-full flex items-center gap-1.5`}>
                          <Info className="h-4 w-4 shrink-0" />
                          <span>Standard Policy Overrides must be approved by a <strong>Senior Credit Director</strong>. Select James Vance from the user dropdown to approve.</span>
                        </div>
                      )}

                      {selectedExemption.status === "APPROVED" && (
                        <>
                          <button 
                            onClick={() => handleExemptionStatusChange(selectedExemption.id, "ESCALATED", "Escalated by Officer due to tracking issues.")}
                            className={`bg-red-500/10 hover:bg-red-500/20 border ${isDark ? "border-red-500/30" : "border-red-200"} text-red-500 font-semibold text-xs px-4 py-2 rounded-lg transition`}
                          >
                            Escalate Status
                          </button>
                          <button 
                            onClick={() => handleExemptionStatusChange(selectedExemption.id, "RESOLVED", "Officially closed. Conditions fully met.")}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                          >
                            Resolve / Finalize
                          </button>
                        </>
                      )}

                      {selectedExemption.status === "ESCALATED" && (
                        <button 
                          onClick={() => handleExemptionStatusChange(selectedExemption.id, "APPROVED", "Returned to Approved status after satisfactory documentation submission.")}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg transition"
                        >
                          Resolve Escalation
                        </button>
                      )}

                      {selectedExemption.status === "RESOLVED" && (
                        <span className={`text-xs ${isDark ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-emerald-700 border-emerald-200 bg-emerald-50"} border font-mono flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg w-full justify-center`}>
                          <CheckCircle2 className="h-4 w-4" /> EXEMPTION FILE COMPLETED & RESOLVED
                        </span>
                      )}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}

        {/* TAB CONTENT: NEW REQUEST FORM */}
        {activeTab === "new-request" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: The Form */}
            <div className={`lg:col-span-7 ${bgCard} border ${borderCard} rounded-xl p-6 flex flex-col gap-6`}>
              <div>
                <h3 className={`font-bold ${textWhiteOrSlate} text-lg`}>Exemption Override Request Form</h3>
                <p className={`text-xs ${textSub} mt-1`}>Submit a credit policy override request specifying mitigating parameters and required tracking conditions.</p>
              </div>

              <form onSubmit={handleCreateExemption} className="flex flex-col gap-5">
                
                {/* Section 1: Customer details */}
                <div className={`border-b ${borderCard} pb-5`}>
                  <h4 className={`text-xs font-bold ${textWhiteOrSlate} uppercase tracking-wider mb-4 flex items-center gap-1.5`}>
                    <User className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} /> Borrower & Credit Account
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paramount Foods Inc"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Account Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. ACT-4910-12"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                        value={formData.accountNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Currency *</label>
                      <select
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full cursor-pointer`}
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="USD" className={bgSelectOption}>USD ($)</option>
                        <option value="KSH" className={bgSelectOption}>KSH (KES)</option>
                        <option value="GBP" className={bgSelectOption}>GBP (£)</option>
                        <option value="EUR" className={bgSelectOption}>EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Requested Loan Approved Amount *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 500000"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                        value={formData.loanAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Borrower Internal Credit Status</label>
                      <select
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full cursor-pointer`}
                        value={formData.creditStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditStatus: e.target.value }))}
                      >
                        <option value="EXCELLENT" className={bgSelectOption}>EXCELLENT (AAA / AA)</option>
                        <option value="GOOD" className={bgSelectOption}>GOOD (A / BBB)</option>
                        <option value="FAIR" className={bgSelectOption}>FAIR (BB / B)</option>
                        <option value="POOR" className={bgSelectOption}>POOR (Substandard)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Loan Facility Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial construction financing"
                      className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                      value={formData.loanPurpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanPurpose: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Origin Branch (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Westlands Retail Hub"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                        value={formData.originBranch}
                        onChange={(e) => setFormData(prev => ({ ...prev, originBranch: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Credit Application Reference (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. CR-2026-904"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                        value={formData.creditAppRef}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditAppRef: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Exemption Details */}
                <div className={`border-b ${borderCard} pb-5`}>
                  <h4 className={`text-xs font-bold ${textWhiteOrSlate} uppercase tracking-wider mb-4 flex items-center gap-1.5`}>
                    <ShieldAlert className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} /> Exemption Override Arguments & Reason
                  </h4>
                  <div>
                    <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Detailed Policy Exception Reason *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Specify exactly which credit policy threshold is violated (e.g. Debt ratio, collateral, single-industry exposure) and provide clear commercial justification."
                      className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"} leading-relaxed`}
                      value={formData.exemptionReason}
                      onChange={(e) => setFormData(prev => ({ ...prev, exemptionReason: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Manual Risk Level Assignment</label>
                      <select
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full cursor-pointer`}
                        value={formData.riskLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                      >
                        <option value="LOW" className={bgSelectOption}>LOW RISK</option>
                        <option value="MEDIUM" className={bgSelectOption}>MEDIUM RISK</option>
                        <option value="HIGH" className={bgSelectOption}>HIGH RISK</option>
                      </select>
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Risk Exposure Score (1-100)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full`}
                        value={formData.riskScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, riskScore: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Mitigations (Dynamic List) */}
                <div className={`border-b ${borderCard} pb-5`}>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-2`}>Mitigation Measures Applied</label>
                  <div className="flex flex-col gap-2 mb-3">
                    {formMitigations.map((mit, i) => (
                      <div key={i} className={`flex items-center justify-between ${bgSubCard} px-3.5 py-2 rounded-lg border ${borderSubCard}`}>
                        <span className={`text-xs ${textWhiteOrSlateMuted}`}>{mit}</span>
                        <button
                          type="button"
                          onClick={() => setFormMitigations(prev => prev.filter((_, idx) => idx !== i))}
                          className={`${textSub} hover:text-red-400 p-1`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom mitigation action..."
                      className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 flex-1 placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                      value={newMitigationText}
                      onChange={(e) => setNewMitigationText(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newMitigationText) return;
                        setFormMitigations(prev => [...prev, newMitigationText]);
                        setNewMitigationText("");
                      }}
                      className={`${isDark ? "bg-[#1f2636] hover:bg-[#2e374b] border-[#262d3d]" : "bg-slate-100 hover:bg-slate-200 border-slate-300"} text-xs font-semibold ${textWhiteOrSlate} px-4 py-2 rounded-lg transition border`}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Section 4: Monitoring Conditions (Dynamic List) */}
                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-2`}>Monitoring Conditions Set</label>
                  <div className="flex flex-col gap-2 mb-3">
                    {formConditions.map((cond, i) => (
                      <div key={i} className={`${bgSubCard} p-3.5 rounded-lg border ${borderSubCard} flex flex-col gap-1.5`}>
                        <div className="flex items-start justify-between gap-4">
                          <p className={`text-xs font-semibold ${textWhiteOrSlate}`}>{cond.condition}</p>
                          <button
                            type="button"
                            onClick={() => setFormConditions(prev => prev.filter((_, idx) => idx !== i))}
                            className={`${textSub} hover:text-red-400 p-1 shrink-0`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className={`text-[10px] ${textSub} font-mono`}>
                          Timeline: {cond.days} days • Follow-up Action: {cond.action}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={`${isDark ? "bg-[#171c26]/40" : "bg-slate-50"} border ${borderSubCard} p-4 rounded-xl flex flex-col gap-3`}>
                    <p className={`text-[10px] font-bold ${textSub} uppercase`}>Define Monitoring Item:</p>
                    <div>
                      <input
                        type="text"
                        placeholder="Specific condition description (e.g. submit quarterly audits)"
                        className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                        value={newConditionText}
                        onChange={(e) => setNewConditionText(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          placeholder="Days to satisfy"
                          className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                          value={newConditionDays}
                          onChange={(e) => setNewConditionDays(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Follow-up check action"
                          className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                          value={newConditionAction}
                          onChange={(e) => setNewConditionAction(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newConditionText) return;
                        setFormConditions(prev => [
                          ...prev,
                          { condition: newConditionText, days: newConditionDays, action: newConditionAction || "Perform desk check" }
                        ]);
                        setNewConditionText("");
                        setNewConditionDays(60);
                        setNewConditionAction("");
                      }}
                      className={`${isDark ? "bg-[#1f2636] hover:bg-[#2e374b] border-[#262d3d]" : "bg-slate-100 hover:bg-slate-200 border-slate-300"} text-xs font-semibold ${textWhiteOrSlate} py-2 rounded-lg transition border`}
                    >
                      + Add Condition Item to List
                    </button>
                  </div>
                </div>

                {/* Section 4.5: Periodic CBS Share Contributions (Optional) */}
                <div className={`border-t ${borderCard} pt-5 mt-3 text-left`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={`text-xs font-bold ${textWhiteOrSlate} uppercase tracking-wider`}>
                        Periodic CBS Share Contributions (Optional)
                      </h4>
                      <p className={`text-[11px] ${textSub} mt-0.5`}>
                        Configure automatic standing debit instructions for Zidisha, Back Office, or Share Capital contributions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableFormZidisha(!enableFormZidisha)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        enableFormZidisha ? "bg-emerald-500" : "bg-[#1f2636] border-[#2e374b]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          enableFormZidisha ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {enableFormZidisha && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`p-4 rounded-xl border ${borderSubCard} ${bgSubCard} flex flex-col gap-4 overflow-hidden text-left`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Contribution Type *</label>
                          <select
                            value={formZidishaType}
                            onChange={(e) => setFormZidishaType(e.target.value)}
                            className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full cursor-pointer`}
                          >
                            <option value="Zidisha Shares">Zidisha Microfinance Shares</option>
                            <option value="Back Office Shares">Back Office Sacco Shares</option>
                            <option value="Share Capital">Share Capital Account (Class A)</option>
                            <option value="Welfare Fund">Staff Welfare Shares / Capital</option>
                          </select>
                        </div>
                        <div>
                          <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Frequency *</label>
                          <select
                            value={formZidishaFrequency}
                            onChange={(e) => setFormZidishaFrequency(e.target.value)}
                            className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full cursor-pointer`}
                          >
                            <option value="Daily">Daily Basis</option>
                            <option value="Weekly">Weekly Basis</option>
                            <option value="Monthly">Monthly Basis</option>
                            <option value="Quarterly">Quarterly Basis</option>
                            <option value="Bi-Annually">Bi-Annually Basis</option>
                            <option value="Annually">Annually Basis</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Debit Account (Standard: Borrower Account)</label>
                          <input
                            type="text"
                            placeholder="Leave blank to use main account"
                            value={formZidishaDebit}
                            onChange={(e) => setFormZidishaDebit(e.target.value)}
                            className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"} font-mono`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Credit Account (Target Treasury)</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. ZID-GLOBAL-TREASURY"
                            value={formZidishaCredit}
                            onChange={(e) => setFormZidishaCredit(e.target.value)}
                            className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"} font-mono`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Periodic Amount ($ USD) *</label>
                          <div className="relative">
                            <span className={`absolute left-3 top-2 text-xs ${textSub}`}>$</span>
                            <input
                              required
                              type="number"
                              min="1"
                              placeholder="200"
                              value={formZidishaAmount}
                              onChange={(e) => setFormZidishaAmount(Number(e.target.value))}
                              className={`${bgSubCard} border ${borderInput} rounded-lg pl-7 pr-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full font-mono`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-5">
                          <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400">
                            <Activity className="h-4 w-4" />
                          </div>
                          <p className={`text-[10px] ${textSub} leading-normal`}>
                            Checking this box automatically creates a conditional compliance requirement item to track, linked with direct CBS standing instructions.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Section 5: Supporting Documentation (Drag & Drop + Click File Upload) */}
                <div className={`border-t ${borderCard} pt-5 mt-3`}>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-2`}>
                    Section 5: Supporting Documentation
                  </label>
                  <p className={`text-xs ${textSub} mb-3 leading-normal`}>
                    Upload any credit memos, financial audits, guarantor statements, or committee briefing documents supporting this credit policy override.
                  </p>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const fileList = e.dataTransfer.files;
                        Array.from(fileList).forEach((file: any) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setFormDocuments(prev => {
                              if (prev.some(p => p.name === file.name)) return prev;
                              return [...prev, {
                                name: file.name,
                                size: file.size,
                                type: file.type || "application/octet-stream",
                                dataUrl: reader.result as string
                              }];
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-500/5"
                        : `${borderCard} ${bgSubCard} hover:border-emerald-500/50`
                    }`}
                  >
                    <input
                      type="file"
                      id="supporting-doc-input"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          const fileList = e.target.files;
                          Array.from(fileList).forEach((file: any) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormDocuments(prev => {
                                if (prev.some(p => p.name === file.name)) return prev;
                                return [...prev, {
                                  name: file.name,
                                  size: file.size,
                                  type: file.type || "application/octet-stream",
                                  dataUrl: reader.result as string
                                }];
                              });
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor="supporting-doc-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div className={`p-2.5 rounded-full ${isDark ? "bg-[#1f2636] text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className={`text-xs font-semibold ${textWhiteOrSlate}`}>
                        Drag and drop files here, or <span className="text-emerald-500 underline">browse files</span>
                      </p>
                      <p className={`text-[10px] ${textSub}`}>
                        Supports PDF, DOCX, XLSX, PNG, JPG (Max 5MB per file)
                      </p>
                    </label>
                  </div>

                  {/* List of uploaded documents */}
                  {formDocuments.length > 0 && (
                    <div className="flex flex-col gap-2 mt-4">
                      <p className={`text-[10px] font-bold ${textSub} uppercase tracking-wider`}>
                        Uploaded Files ({formDocuments.length})
                      </p>
                      {formDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between ${bgSubCard} border ${borderSubCard} px-3.5 py-2.5 rounded-lg text-xs`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                            <div className="truncate">
                              <p className={`font-semibold ${textWhiteOrSlate} truncate`}>{doc.name}</p>
                              <p className={`text-[10px] ${textSub}`}>{(doc.size / 1024).toFixed(1)} KB • {doc.type}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormDocuments(prev => prev.filter((_, i) => i !== idx))}
                            className={`${textSub} hover:text-red-400 p-1.5 rounded transition`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className={`border-t ${borderCard} pt-5 mt-3 flex justify-end gap-3`}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className={`bg-transparent ${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-900"} px-5 py-2.5 rounded-lg text-xs font-semibold transition`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <Send className="h-4 w-4" /> Submit Exemption Request
                  </button>
                </div>

              </form>
            </div>

            {/* Right side: AI Co-Pilot Advisor */}
            <div className={`lg:col-span-5 ${bgCard} border ${borderCard} rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-2">
                <div className={`bg-emerald-500/10 p-2 rounded-lg text-emerald-400 border ${isDark ? "border-emerald-500/20" : "border-emerald-200"}`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${textWhiteOrSlate} text-base`}>Gemini Risk Advisor</h3>
                  <p className={`text-[11px] ${textSub}`}>AI Risk Assessment Co-pilot</p>
                </div>
              </div>

              <div className={`${bgSubCard} border ${borderSubCard} rounded-xl p-4 flex flex-col gap-4`}>
                <p className={`text-xs ${textWhiteOrSlateMuted} leading-relaxed`}>
                  Enter Exemption details on the left, then trigger a <strong>Gemini Credit Review</strong>. The AI will evaluate financial risk levels, generate practical credit mitigations, and recommend specific monitoring conditions.
                </p>

                <button
                  type="button"
                  disabled={isAiAnalyzing}
                  onClick={handleRunAiAssessment}
                  className={`py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border ${
                    isAiAnalyzing 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-wait" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-black border-transparent shadow-lg shadow-emerald-500/10"
                  }`}
                >
                  {isAiAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-400 border-t-transparent"></div>
                      Evaluating Credit Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Run AI Risk Assessment
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-2.5 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Co-Pilot Error</p>
                    <p className="mt-0.5 leading-relaxed">{aiError}</p>
                  </div>
                </div>
              )}

              {/* AI results presentation */}
              <AnimatePresence>
                {aiAnalysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`flex flex-col gap-5 border-t ${borderCard} pt-5`}
                  >
                    
                    {/* Gauge metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`${isDark ? "bg-[#171c26]/60" : "bg-slate-50"} border ${borderSubCard} p-3 rounded-lg text-center`}>
                        <span className={`text-[10px] ${textSub} uppercase block font-mono`}>Assessed Score</span>
                        <span className={`text-2xl font-black ${textWhiteOrSlate} block mt-1`}>{aiAnalysisResult.riskScore}/100</span>
                      </div>
                      <div className={`${isDark ? "bg-[#171c26]/60" : "bg-slate-50"} border ${borderSubCard} p-3 rounded-lg text-center flex flex-col items-center justify-center`}>
                        <span className={`text-[10px] ${textSub} uppercase block font-mono`}>Risk Profile</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 mt-1.5 rounded-full inline-block ${
                          aiAnalysisResult.riskLevel === 'HIGH' 
                            ? (isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200')
                            : aiAnalysisResult.riskLevel === 'MEDIUM' 
                              ? (isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200')
                              : (isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                        }`}>
                          {aiAnalysisResult.riskLevel}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <span className={`text-[10px] font-mono ${textSub} uppercase block mb-1`}>AI Brief Assessment</span>
                      <p className={`text-xs ${textWhiteOrSlate} ${isDark ? "bg-[#171c26]/40" : "bg-slate-50"} p-3 rounded-lg border ${borderSubCard} italic leading-relaxed`}>
                        "{aiAnalysisResult.summaryAnalysis}"
                      </p>
                    </div>

                    {/* Mitigations */}
                    <div>
                      <span className={`text-[10px] font-mono ${textSub} uppercase block mb-1.5`}>Recommended Mitigations</span>
                      <ul className="flex flex-col gap-2">
                        {aiAnalysisResult.mitigations.map((mit, i) => (
                          <li key={i} className={`text-xs ${textWhiteOrSlateMuted} flex gap-2 items-start ${isDark ? "bg-[#171c26]/50" : "bg-slate-50"} p-2.5 rounded border ${borderSubCard}`}>
                            <CheckCircle2 className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"} mt-0.5 shrink-0`} />
                            <span>{mit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Conditions */}
                    <div>
                      <span className={`text-[10px] font-mono ${textSub} uppercase block mb-1.5`}>Suggested Monitoring Covenants</span>
                      <div className="flex flex-col gap-2.5">
                        {aiAnalysisResult.recommendedConditions.map((cond, i) => (
                          <div key={i} className={`${bgSubCard} border ${borderSubCard} p-3 rounded-lg flex flex-col gap-1`}>
                            <p className={`text-xs font-semibold ${textWhiteOrSlate} leading-relaxed`}>{cond.condition}</p>
                            <p className={`text-[10px] ${textSub} font-mono`}>
                              Days Expected: {cond.expectedTimelineDays} days • Follow-up: {cond.followUpAction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={applyAiRecommendations}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-4 w-4 stroke-[3]" /> Apply AI recommendations to form
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        )}

        {/* TAB CONTENT: ACTIVE MONITORING */}
        {activeTab === "monitoring" && (
          <div className="flex flex-col gap-6">
            
            {/* Page Header */}
            <div>
              <h3 className={`font-bold ${textWhiteOrSlate} text-lg`}>Active Monitoring & Condition Tracker</h3>
              <p className={`text-xs ${textSub} mt-1`}>
                Once a loan is approved, credit officers are responsible for enforcing set conditions. Log follow-ups and monitor deadlines.
              </p>
            </div>

            {/* Split Screen layout: Reminders Panel and List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Reminders / Notifications summary */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className={`${bgCard} border ${borderCard} rounded-xl p-5`}>
                  <h4 className={`font-bold ${textWhiteOrSlate} text-sm mb-4 flex items-center gap-2`}>
                    <Bell className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} /> Reminders Alerts ({dynamicAlerts.length})
                  </h4>
                  
                  {dynamicAlerts.length === 0 ? (
                    <div className={`text-center py-6 text-xs ${textSub} italic`}>
                      All covenants are currently compliant and up to date!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {dynamicAlerts.map((alert) => {
                        let colorClass = "";
                        let icon = <Info className="h-4 w-4 mt-0.5 shrink-0" />;
                        
                        if (alert.type === "overdue") {
                          colorClass = isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200";
                          icon = <ShieldAlert className={`h-4 w-4 mt-0.5 shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />;
                        } else if (alert.type === "due-soon") {
                          colorClass = isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200";
                          icon = <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${isDark ? "text-amber-400" : "text-amber-600"}`} />;
                        } else {
                          colorClass = isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200";
                          icon = <ShieldAlert className={`h-4 w-4 mt-0.5 shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />;
                        }

                        return (
                          <div 
                            key={alert.id}
                            className={`border rounded-lg p-3.5 flex items-start gap-3 text-xs ${colorClass}`}
                          >
                            {icon}
                            <div>
                              <p className="font-bold">{alert.title}</p>
                              <p className={`mt-0.5 leading-normal text-[11px] ${textWhiteOrSlateMuted}`}>{alert.description}</p>
                              <button
                                onClick={() => {
                                  setActiveTab("dashboard");
                                  setSelectedExemptionId(alert.exemptionId);
                                }}
                                className={`text-[10px] font-bold underline mt-2 block hover:opacity-85 text-left ${textWhiteOrSlate}`}
                              >
                                Open File Dossier
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Conditions Checklist */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className={`${bgCard} border ${borderCard} rounded-xl p-5`}>
                  <h4 className={`font-bold ${textWhiteOrSlate} text-sm mb-4`}>Covenants Portfolio Tracking</h4>

                  <div className="flex flex-col gap-4">
                    {exemptions.map(ex => {
                      const activeConds = ex.conditions;
                      if (activeConds.length === 0) return null;

                      return (
                        <div key={ex.id} className={`border-b ${borderCard} last:border-0 pb-4 last:pb-0`}>
                          <div className={`flex items-center justify-between mb-3 ${bgSubCard} px-3.5 py-2 rounded-lg`}>
                            <div>
                              <p className={`font-bold text-sm ${textWhiteOrSlate}`}>{ex.customerName}</p>
                              <p className={`text-[10px] font-mono ${textSub}`}>{ex.id} • Loan amount: ${ex.loanAmount.toLocaleString()} • Branch: {ex.originBranch || "Nairobi Corporate Branch"} • Ref: {ex.creditAppRef || "N/A"}</p>
                            </div>
                            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${isDark ? "bg-[#1e2533] text-[#8c9ba5] border-[#293245]" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                              {ex.status}
                            </span>
                          </div>

                          <div className="flex flex-col gap-3 pl-2">
                            {activeConds.map(cond => {
                              const isOverdue = !cond.isMet && new Date(cond.expectedDate) < new Date("2026-06-26");
                              return (
                                <div key={cond.id} className={`${isDark ? "bg-[#171c26]/40" : "bg-slate-50"} border ${borderSubCard} rounded-lg p-4 flex flex-col gap-3`}>
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                      <button 
                                        onClick={() => handleToggleConditionMet(ex.id, cond.id)}
                                        className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center transition shrink-0 ${
                                          cond.isMet 
                                            ? "bg-emerald-500 border-emerald-600 text-black" 
                                            : `${isDark ? "border-[#404c63] hover:border-white" : "border-slate-300 hover:border-slate-600"} text-transparent`
                                        }`}
                                      >
                                        <Check className="h-3 w-3 stroke-[3]" />
                                      </button>
                                      <div>
                                        <p className={`text-xs font-semibold leading-normal ${cond.isMet ? "line-through " + textSub : textWhiteOrSlate}`}>
                                          {cond.condition}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                          <span className={`text-[10px] ${textSub} flex items-center gap-1 font-mono`}>
                                            <Calendar className="h-3.5 w-3.5" /> Target Compliance: {cond.expectedDate}
                                          </span>
                                          {isOverdue && (
                                            <span className={`text-[9px] font-bold ${isDark ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-red-700 bg-red-50 border-red-200"} px-1.5 py-0.5 rounded border`}>
                                              OVERDUE
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Follow up log entries list */}
                                  {cond.logs.length > 0 && (
                                    <div className={`${bgSubCard} border ${borderSubCard} rounded-lg p-3 flex flex-col gap-2.5`}>
                                      <span className={`text-[9px] font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"} font-mono uppercase tracking-wider block`}>Follow-up Log history:</span>
                                      {cond.logs.map((log) => (
                                        <div key={log.id} className={`text-[11px] leading-relaxed border-l ${isDark ? "border-[#2e374b]" : "border-slate-200"} pl-2.5`}>
                                          <p className={`${textWhiteOrSlate} italic`}>"{log.actionTaken}"</p>
                                          {log.nextSteps && <p className={`${textSub} mt-1 font-sans`}>Next action steps: {log.nextSteps}</p>}
                                          <p className={`text-[9px] ${textSub} font-mono mt-1`}>— Checked by {log.officerName} on {log.date}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {!cond.isMet && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <button
                                        onClick={() => setActiveConditionExemption({ exemptionId: ex.id, conditionId: cond.id })}
                                        className={`text-left text-[11px] font-bold ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} flex items-center gap-1 mt-1 self-start`}
                                      >
                                        + Log Credit Officer Follow-up Action
                                      </button>

                                      {/zidisha|shares|share capital|back office/i.test(cond.condition) && (
                                        <button
                                          onClick={() => {
                                            const existing = zidishaInstructions.find(inst => inst.conditionId === cond.id);
                                            setActiveZidishaSetup({
                                              exemptionId: ex.id,
                                              conditionId: cond.id,
                                              customerName: ex.customerName,
                                              conditionText: cond.condition,
                                              defaultDebitAccount: ex.accountNumber
                                            });
                                            setZidishaDebitAccount(existing ? existing.debitAccount : ex.accountNumber);
                                            setZidishaCreditAccount(existing ? existing.creditAccount : "ZID-GLOBAL-TREASURY");
                                            setZidishaAmount(existing ? existing.amount : 200);
                                            setZidishaFrequency(existing ? existing.frequency : "Monthly");
                                            const typeMatch = cond.condition.match(/(Zidisha Shares|Back Office Shares|Share Capital|Welfare Fund)/i);
                                            setZidishaType(existing ? (existing.type || "Zidisha Shares") : (typeMatch ? typeMatch[0] : "Zidisha Shares"));
                                          }}
                                          className="text-left text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 mt-1 ml-4 cursor-pointer"
                                        >
                                          ⚙️ Setup Periodic CBS Share Standing Order
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {(/zidisha|shares|share capital|back office/i.test(cond.condition) || zidishaInstructions.some(inst => inst.conditionId === cond.id)) && zidishaInstructions.some(inst => inst.conditionId === cond.id && inst.status === 'ACTIVE') && (
                                    <div className={`mt-2 p-3.5 rounded border text-xs ${isDark ? "bg-[#171c26]/60 border-emerald-500/20" : "bg-emerald-50/40 border-emerald-500/10"} flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full`}>
                                      <div className="flex flex-col gap-1 text-left">
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                          <span>Active Standing Order Registered in CBS</span>
                                        </div>
                                        <p className={`${textSub} text-[11px]`}>
                                          Debit: <span className="font-mono text-emerald-500">{zidishaInstructions.find(i => i.conditionId === cond.id)?.debitAccount}</span> • 
                                          Credit: <span className="font-mono text-emerald-500">{zidishaInstructions.find(i => i.conditionId === cond.id)?.creditAccount}</span> • 
                                          Amount: <span className="font-bold">${zidishaInstructions.find(i => i.conditionId === cond.id)?.amount}</span> • 
                                          Frequency: <span className="font-bold">{zidishaInstructions.find(i => i.conditionId === cond.id)?.frequency}</span>
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const inst = zidishaInstructions.find(i => i.conditionId === cond.id);
                                          if (inst) handleRunZidishaCbsSimulation(inst);
                                        }}
                                        className="px-3 py-1.5 rounded text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-semibold cursor-pointer shrink-0"
                                      >
                                        Simulate CBS Sync
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB CONTENT: ANALYTICS & AI PORTFOLIO REPORT */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className={`font-bold ${textWhiteOrSlate} text-lg`}>Portfolio Analytics & Authorizations Center</h3>
                <p className={`text-xs ${textSub} mt-1`}>Audit policy override requests, monitor covenants compliance, and compile real-time summaries split by currency.</p>
              </div>

              {/* Reports Navigation Sub-tabs */}
              <div className={`flex border ${borderCard} p-1 rounded-xl ${bgSubCard} gap-1 self-start sm:self-center`}>
                {[
                  { id: "overview" as const, label: "Overview & AI CRO", icon: <Layers className="h-3.5 w-3.5" /> },
                  { id: "pending" as const, label: "Pending Overrides", icon: <Clock className="h-3.5 w-3.5" /> },
                  { id: "conditions" as const, label: "Compliance Report", icon: <FileCheck2 className="h-3.5 w-3.5" /> }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setAnalyticsSubTab(sub.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                      analyticsSubTab === sub.id
                        ? "bg-emerald-500 text-black font-bold shadow"
                        : `${textSub} hover:text-emerald-400`
                    }`}
                  >
                    {sub.icon}
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB: OVERVIEW */}
            {analyticsSubTab === "overview" && (
              <div className="flex flex-col gap-6">
                {/* Visual breakdown grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Risk Levels Chart Card */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl p-5`}>
                    <h4 className={`font-bold ${textWhiteOrSlate} text-sm mb-4 flex items-center gap-1.5`}>
                      <ShieldAlert className="h-4 w-4 text-emerald-400" /> Risk Rating Exposure
                    </h4>
                    <div className="flex flex-col gap-3">
                      {["LOW", "MEDIUM", "HIGH"].map(lvl => {
                        const count = exemptions.filter(ex => ex.riskLevel === lvl).length;
                        const percentage = Math.round((count / exemptions.length) * 100) || 0;
                        
                        // Show breakdown by currency inside tooltip/subtext
                        const currencyTotals = ["USD", "KSH", "GBP", "EUR"].map(cur => {
                          const amt = exemptions
                            .filter(ex => ex.riskLevel === lvl && (ex.currency || "USD").toUpperCase() === cur)
                            .reduce((sum, ex) => sum + ex.loanAmount, 0);
                          return amt > 0 ? { cur, amt } : null;
                        }).filter(Boolean);

                        let barColor = "bg-emerald-500";
                        if (lvl === "MEDIUM") barColor = "bg-amber-500";
                        if (lvl === "HIGH") barColor = "bg-red-500";

                        return (
                          <div key={lvl} className="flex flex-col gap-1 text-xs">
                            <div className={`flex justify-between items-center ${textSub}`}>
                              <span className={`font-bold ${textWhiteOrSlate}`}>{lvl}</span>
                              <span className="font-mono">{count} files</span>
                            </div>
                            <div className={`${isDark ? "bg-[#1f242e]" : "bg-slate-200"} h-2.5 rounded-full overflow-hidden flex`}>
                              <div className={`${barColor} h-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="flex justify-between items-start mt-0.5">
                              <span className={`text-[9px] ${textSub} font-mono`}>{percentage}% of portfolio</span>
                              <div className="flex flex-col text-[9px] font-mono text-right text-slate-400">
                                {currencyTotals.map(t => t && (
                                  <span key={t.cur}>{formatCurrency(t.amt, t.cur)}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Breakdown Card */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl p-5`}>
                    <h4 className={`font-bold ${textWhiteOrSlate} text-sm mb-4 flex items-center gap-1.5`}>
                      <Clock className="h-4 w-4 text-amber-400" /> Exemption Files Status
                    </h4>
                    <div className="flex flex-col gap-3">
                      {["PENDING", "APPROVED", "ESCALATED", "RESOLVED"].map(status => {
                        const count = exemptions.filter(ex => ex.status === status).length;
                        const percentage = Math.round((count / exemptions.length) * 100) || 0;
                        
                        let color = "bg-amber-400";
                        if (status === "APPROVED") color = "bg-emerald-400";
                        if (status === "RESOLVED") color = "bg-blue-400";
                        if (status === "ESCALATED") color = "bg-red-400";

                        return (
                          <div key={status} className="flex flex-col gap-1 text-xs">
                            <div className={`flex justify-between items-center ${textSub}`}>
                              <span className={`font-bold ${textWhiteOrSlate}`}>{status}</span>
                              <span className="font-mono">{count} files</span>
                            </div>
                            <div className={`${isDark ? "bg-[#1f242e]" : "bg-slate-200"} h-2.5 rounded-full overflow-hidden`}>
                              <div className={`${color} h-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className={`text-[10px] ${textSub} font-mono text-right mt-0.5 block`}>{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exposure Concentration Card */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl p-5 flex flex-col justify-between`}>
                    <div>
                      <h4 className={`font-bold ${textWhiteOrSlate} text-sm mb-3 flex items-center gap-1.5`}>
                        <TrendingUp className="h-4 w-4 text-emerald-400" /> Portfolio Credit Currency Distribution
                      </h4>
                      <p className={`text-xs ${textSub} leading-relaxed`}>
                        Total override exposures grouped by user-defined currencies. Approved files represent active risks while pending represent incoming pipelines.
                      </p>
                    </div>
                    <div className={`${bgSubCard} border ${borderSubCard} p-3 rounded-lg text-xs mt-3 flex flex-col gap-2.5`}>
                      <div>
                        <span className={`text-[10px] font-bold ${textSub} uppercase block mb-1`}>Active Approved Volume</span>
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                          {["USD", "KSH", "GBP", "EUR"].map(cur => {
                            const amt = exemptions
                              .filter(ex => (ex.status === "APPROVED" || ex.status === "RESOLVED") && (ex.currency || "USD").toUpperCase() === cur)
                              .reduce((sum, ex) => sum + ex.loanAmount, 0);
                            return (
                              <div key={cur} className="flex justify-between border-r border-dashed border-slate-700/50 pr-2 last:border-0">
                                <span className="text-slate-400">{cur}:</span>
                                <span className={`${textWhiteOrSlate} font-semibold`}>{formatCurrency(amt, cur)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`border-t ${borderCard} pt-2`}>
                        <span className={`text-[10px] font-bold ${textSub} uppercase block mb-1`}>Pending Pipeline Volume</span>
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                          {["USD", "KSH", "GBP", "EUR"].map(cur => {
                            const amt = exemptions
                              .filter(ex => (ex.status === "PENDING" || ex.status === "ESCALATED") && (ex.currency || "USD").toUpperCase() === cur)
                              .reduce((sum, ex) => sum + ex.loanAmount, 0);
                            return (
                              <div key={cur} className="flex justify-between border-r border-dashed border-slate-700/50 pr-2 last:border-0">
                                <span className="text-slate-400">{cur}:</span>
                                <span className={`${textWhiteOrSlate} font-semibold`}>{formatCurrency(amt, cur)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* AI Executive Report Generator */}
                <div className={`${bgCard} border ${borderCard} rounded-xl p-6 relative overflow-hidden flex flex-col gap-6`}>
                  <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl"></div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400 border ${isDark ? "border-emerald-500/20" : "border-emerald-200"}`}>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${textWhiteOrSlate} text-base`}>Chief Risk Officer AI Portfolio Report</h4>
                        <p className={`text-xs ${textSub} mt-0.5`}>Let Gemini compile and analyze all active portfolio exemptions to write an Executive Audit Summary.</p>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateAiReport}
                      disabled={isGeneratingReport}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border ${
                        isGeneratingReport 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-wait" 
                          : "bg-emerald-500 hover:bg-emerald-400 text-black border-transparent shadow-lg shadow-emerald-500/10"
                      }`}
                    >
                      {isGeneratingReport ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-400 border-t-transparent"></div>
                          Compiling Portfolio Dossier...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Generate Portfolio Risk Report
                        </>
                      )}
                    </button>
                  </div>

                  {/* Display of Report summary */}
                  <AnimatePresence>
                    {aiReportSummary && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${bgSubCard} border ${borderSubCard} rounded-xl p-6 shadow-inner`}
                      >
                        <div className={`flex items-center justify-between border-b ${borderSubCard} pb-4 mb-4`}>
                          <div>
                            <h5 className={`font-mono text-[10px] ${isDark ? "text-emerald-400" : "text-emerald-700"} uppercase tracking-widest`}>EXECUTIVE OVERVIEW REPORT</h5>
                            <p className={`text-xs ${textSub} mt-0.5`}>CrestBank Risk Oversight • Current: June 2026</p>
                          </div>
                          <span className={`text-[10px] font-mono ${isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"} px-2 py-0.5 rounded border`}>
                            CONFIDENTIAL
                          </span>
                        </div>

                        <div className={`text-xs ${textWhiteOrSlateMuted} leading-relaxed whitespace-pre-wrap font-sans prose prose-invert`}>
                          {aiReportSummary}
                        </div>

                        <div className={`border-t ${borderSubCard} pt-4 mt-6 flex justify-between text-[10px] ${textSub} font-mono`}>
                          <span>Evaluated On: 2026-06-26</span>
                          <span>Authorized By: Chief Credit Officer Model</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* SUB-TAB: PENDING REQUESTS REPORT */}
            {analyticsSubTab === "pending" && (() => {
              const pendingExemptions = exemptions.filter(ex => 
                (ex.status === "PENDING" || ex.status === "ESCALATED") &&
                (ex.customerName.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                 ex.id.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                 ex.originBranch?.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                 ex.creditAppRef?.toLowerCase().includes(pendingSearch.toLowerCase()))
              );

              const pendingSums = ["USD", "KSH", "GBP", "EUR"].reduce((acc, cur) => {
                acc[cur] = exemptions
                  .filter(ex => (ex.status === "PENDING" || ex.status === "ESCALATED") && (ex.currency || "USD").toUpperCase() === cur)
                  .reduce((sum, ex) => sum + ex.loanAmount, 0);
                return acc;
              }, {} as Record<string, number>);

              return (
                <div className="flex flex-col gap-6">
                  {/* Search and Metadata */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center`}>
                    <div className="relative w-full md:w-96">
                      <Search className={`absolute left-3 top-2.5 h-4 w-4 ${textSub}`} />
                      <input
                        type="text"
                        placeholder="Search borrower, ID, branch or app ref..."
                        className={`pl-9 pr-4 py-2 text-xs rounded-lg border ${borderInput} ${bgSubCard} ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full`}
                        value={pendingSearch}
                        onChange={(e) => setPendingSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end text-xs">
                      <div className={`${bgSubCard} border ${borderSubCard} px-3.5 py-1.5 rounded-lg flex items-center gap-2`}>
                        <span className={textSub}>Pending Pipeline Files:</span>
                        <span className={`font-bold ${textWhiteOrSlate}`}>{exemptions.filter(ex => ex.status === "PENDING" || ex.status === "ESCALATED").length}</span>
                      </div>
                      <div className={`${bgSubCard} border ${borderSubCard} px-3.5 py-1.5 rounded-lg flex items-center gap-2`}>
                        <span className="text-red-400">Escalated Priority:</span>
                        <span className="font-bold text-red-400">{exemptions.filter(ex => ex.status === "ESCALATED").length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Currency Pipelines Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {["USD", "KSH", "GBP", "EUR"].map(cur => {
                      const amount = pendingSums[cur] || 0;
                      const count = exemptions.filter(ex => (ex.status === "PENDING" || ex.status === "ESCALATED") && (ex.currency || "USD").toUpperCase() === cur).length;
                      return (
                        <div key={cur} className={`${bgCard} border ${borderCard} p-4 rounded-xl flex flex-col justify-between`}>
                          <span className={`text-[10px] font-bold ${textSub} uppercase tracking-wider`}>{cur} Pipeline</span>
                          <span className={`text-base font-extrabold ${textWhiteOrSlate} mt-1.5`}>{formatCurrency(amount, cur)}</span>
                          <span className={`text-[10px] ${textSub} mt-1 font-mono`}>{count} files awaiting review</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pending Table */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl overflow-hidden`}>
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h4 className={`font-bold text-xs uppercase tracking-wider ${textSub}`}>Credit Overrides Awaiting Authorization</h4>
                      <span className="text-[10px] font-mono text-slate-400">Showing {pendingExemptions.length} files</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b ${borderCard} ${bgSubCard} text-[10px] uppercase font-mono tracking-wider ${textSub}`}>
                            <th className="p-4">ID & Borrower</th>
                            <th className="p-4">Requested Amount</th>
                            <th className="p-4">Origin & Reference</th>
                            <th className="p-4">Risk score</th>
                            <th className="p-4">Policy breach category</th>
                            <th className="p-4">Date Requested</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-800">
                          {pendingExemptions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className={`p-8 text-center ${textSub}`}>
                                No pending exemption overrides found matching the filters.
                              </td>
                            </tr>
                          ) : (
                            pendingExemptions.map(ex => (
                              <tr key={ex.id} className={`${isDark ? "hover:bg-[#1a212e]/40" : "hover:bg-slate-100/60"} transition`}>
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-[11px] text-emerald-400">{ex.id}</span>
                                      {ex.status === "ESCALATED" && (
                                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-bold px-1 py-0.5 rounded uppercase">ESCALATED</span>
                                      )}
                                    </div>
                                    <span className={`font-bold text-xs ${textWhiteOrSlate} mt-0.5`}>{ex.customerName}</span>
                                    <span className={`text-[10px] ${textSub} font-mono mt-0.5`}>Acc: {ex.accountNumber}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-bold font-mono text-sm text-[#f1f3f5]">
                                  {formatCurrency(ex.loanAmount, ex.currency)}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col text-[11px]">
                                    <span className={textWhiteOrSlate}>{ex.originBranch || "Nairobi Corporate Branch"}</span>
                                    <span className={`font-mono text-[10px] ${textSub} mt-0.5`}>Ref: {ex.creditAppRef || "N/A"}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getRiskBadgeClasses(ex.riskLevel)}`}>
                                      {ex.riskLevel}
                                    </span>
                                    <span className={`font-mono text-xs ${textSub}`}>({ex.riskScore || 50}/100)</span>
                                  </div>
                                </td>
                                <td className="p-4 max-w-xs">
                                  <p className={`line-clamp-2 text-[11px] ${textWhiteOrSlateMuted}`}>{ex.exemptionReason}</p>
                                </td>
                                <td className={`p-4 font-mono text-[11px] ${textSub}`}>
                                  {ex.dateRequested}
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedExemptionId(ex.id);
                                      setActiveTab("dashboard");
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-1 ml-auto"
                                  >
                                    Review Dossier <ArrowUpRight className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SUB-TAB: CONDITIONS COMPLIANCE REPORT */}
            {analyticsSubTab === "conditions" && (() => {
              const allConditionsReport = exemptions.flatMap(ex => 
                ex.conditions.map(cond => ({
                  ...cond,
                  exemptionId: ex.id,
                  customerName: ex.customerName,
                  currency: ex.currency,
                  riskLevel: ex.riskLevel
                }))
              ).filter(item => 
                item.customerName.toLowerCase().includes(conditionSearch.toLowerCase()) ||
                item.condition.toLowerCase().includes(conditionSearch.toLowerCase()) ||
                item.exemptionId.toLowerCase().includes(conditionSearch.toLowerCase())
              );

              const today = new Date("2026-06-26");
              const overdueCount = allConditionsReport.filter(c => !c.isMet && new Date(c.expectedDate) < today).length;
              const pendingCount = allConditionsReport.filter(c => !c.isMet).length;
              const metCount = allConditionsReport.filter(c => c.isMet).length;

              return (
                <div className="flex flex-col gap-6">
                  {/* Search and Metadata */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center`}>
                    <div className="relative w-full md:w-96">
                      <Search className={`absolute left-3 top-2.5 h-4 w-4 ${textSub}`} />
                      <input
                        type="text"
                        placeholder="Search condition description, customer name or file ID..."
                        className={`pl-9 pr-4 py-2 text-xs rounded-lg border ${borderInput} ${bgSubCard} ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full`}
                        value={conditionSearch}
                        onChange={(e) => setConditionSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end text-xs">
                      <div className={`${bgSubCard} border ${borderSubCard} px-3.5 py-1.5 rounded-lg flex items-center gap-2`}>
                        <span className={textSub}>Covenants Tracked:</span>
                        <span className={`font-bold ${textWhiteOrSlate}`}>{allConditionsReport.length}</span>
                      </div>
                      <div className={`${bgSubCard} border ${borderSubCard} px-3.5 py-1.5 rounded-lg flex items-center gap-2`}>
                        <span className="text-red-400">Overdue:</span>
                        <span className="font-bold text-red-400">{overdueCount}</span>
                      </div>
                      <div className={`${bgSubCard} border ${borderSubCard} px-3.5 py-1.5 rounded-lg flex items-center gap-2`}>
                        <span className="text-emerald-400">Met:</span>
                        <span className="font-bold text-emerald-400">{metCount}</span>
                      </div>
                      <div className={`${bgSubCard} border ${borderSubCard} px-3.5 py-1.5 rounded-lg flex items-center gap-2`}>
                        <span className="text-blue-400">Active Pending:</span>
                        <span className="font-bold text-blue-400">{pendingCount - overdueCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions List Table */}
                  <div className={`${bgCard} border ${borderCard} rounded-xl overflow-hidden`}>
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h4 className={`font-bold text-xs uppercase tracking-wider ${textSub}`}>Loan Covenants & Mitigations Audit Checklist</h4>
                      <span className="text-[10px] font-mono text-slate-400">Showing {allConditionsReport.length} conditions</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b ${borderCard} ${bgSubCard} text-[10px] uppercase font-mono tracking-wider ${textSub}`}>
                            <th className="p-4">Borrower & File</th>
                            <th className="p-4">Covenant Requirement Condition</th>
                            <th className="p-4">Target Date</th>
                            <th className="p-4">Days Left / Status</th>
                            <th className="p-4 text-center">Interactive Checklist Action</th>
                            <th className="p-4 text-right">Quick Link</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-800">
                          {allConditionsReport.length === 0 ? (
                            <tr>
                              <td colSpan={6} className={`p-8 text-center ${textSub}`}>
                                No covenant conditions found matching your search.
                              </td>
                            </tr>
                          ) : (
                            allConditionsReport.map(item => {
                              const expected = new Date(item.expectedDate);
                              const diffTime = expected.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                              let statusText = "";
                              let statusBadgeStyle = "";

                              if (item.isMet) {
                                statusText = "Met & Verified";
                                statusBadgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                              } else if (diffDays < 0) {
                                statusText = `Overdue by ${Math.abs(diffDays)} days`;
                                statusBadgeStyle = "bg-red-500/10 text-red-400 border-red-500/20";
                              } else if (diffDays <= 7) {
                                statusText = `Due in ${diffDays} days (Urgent)`;
                                statusBadgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
                              } else {
                                statusText = `Due in ${diffDays} days`;
                                statusBadgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                              }

                              return (
                                <tr key={`${item.exemptionId}-${item.id}`} className={`${isDark ? "hover:bg-[#1a212e]/40" : "hover:bg-slate-100/60"} transition`}>
                                  <td className="p-4">
                                    <div className="flex flex-col">
                                      <span className={`font-bold ${textWhiteOrSlate}`}>{item.customerName}</span>
                                      <span className="font-mono text-[10px] text-emerald-400 mt-0.5">{item.exemptionId}</span>
                                      <span className={`text-[9px] ${textSub} font-mono mt-0.5`}>Covenant Ref: {item.id}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 max-w-sm">
                                    <p className={`text-[11px] leading-relaxed ${textWhiteOrSlate}`}>{item.condition}</p>
                                    {item.followUpAction && (
                                      <div className={`mt-1 text-[10px] ${textSub} italic flex items-center gap-1`}>
                                        <Info className="h-3 w-3" /> Next Follow-up: {item.followUpAction}
                                      </div>
                                    )}
                                  </td>
                                  <td className={`p-4 font-mono text-[11px] ${textSub}`}>
                                    {item.expectedDate}
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeStyle}`}>
                                      {statusText}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={() => handleToggleConditionMet(item.exemptionId, item.id)}
                                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                                        item.isMet
                                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                          : "bg-emerald-500 hover:bg-emerald-400 text-black border-transparent"
                                      }`}
                                    >
                                      {item.isMet ? "Undo Met Mark" : "Mark Met & Verified"}
                                    </button>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => {
                                        setSelectedExemptionId(item.exemptionId);
                                        setActiveTab("dashboard");
                                      }}
                                      className={`p-1.5 rounded-lg border ${borderCard} ${bgSubCard} ${textSub} hover:text-emerald-400 transition inline-block`}
                                      title="Open Dossier"
                                    >
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB CONTENT: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className={`${bgCard} border ${borderCard} rounded-xl p-6 flex flex-col gap-6`}>
            <div>
              <h3 className={`font-bold ${textWhiteOrSlate} text-lg`}>System Audit Trail Log</h3>
              <p className={`text-xs ${textSub} mt-1`}>
                Every policy exemption, override, approval decision, status adjustment, and condition check is logged with cryptographic timestamps to ensure non-repudiation.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`border ${borderCard} rounded-xl overflow-hidden ${isDark ? "bg-[#151a24]/30" : "bg-slate-50/50"}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${borderCard} ${bgSubCard} text-[10px] uppercase font-mono tracking-wider ${textSub}`}>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Performed By</th>
                      <th className="p-4">Action Event</th>
                      <th className="p-4">Detailed Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {exemptions
                      .flatMap(ex => ex.auditTrail.map(log => ({ ...log, exemptionId: ex.id })))
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log, idx) => (
                        <tr key={`${log.id}-${idx}`} className={`border-b ${borderCard} last:border-0 ${isDark ? "hover:bg-[#1a212e]/40" : "hover:bg-slate-100/60"} transition`}>
                          <td className={`p-4 font-mono text-[11px] ${textSub}`}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className={`p-4 font-semibold ${textWhiteOrSlate}`}>
                            {log.performedBy}
                          </td>
                          <td className="p-4">
                            <span className={`font-mono border ${isDark ? "bg-[#1f2636] text-emerald-400 border-[#2d374d]" : "bg-slate-100 text-emerald-700 border-slate-200"} px-2 py-0.5 rounded text-[10px]`}>
                              {log.action}
                            </span>
                          </td>
                          <td className={`p-4 ${textWhiteOrSlateMuted} leading-relaxed italic`}>
                            "{log.details}"
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`border-t ${borderCard} ${isDark ? "bg-[#11141c] text-[#506373]" : "bg-slate-100 text-slate-500"} px-6 py-4 mt-12 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-2`}>
        <p>© 2026 CrestBank Credit Administration. All rights reserved. Basel IV Compliance Verified.</p>
        <p className={`font-mono text-[10px] ${isDark ? "text-emerald-400/60" : "text-emerald-700/60"}`}>Node Integrity Secure • SHA-256 Enabled</p>
      </footer>

      {/* DIALOG FOR LOGGING FOLLOW-UP ON PENDING CONDITIONS */}
      {activeConditionExemption && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${bgCard} border ${borderCard} rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4`}
          >
            <div className={`flex justify-between items-center border-b ${borderCard} pb-3`}>
              <h4 className={`font-bold ${textWhiteOrSlate} text-base`}>Log Follow-up Action</h4>
              <button 
                onClick={() => setActiveConditionExemption(null)}
                className={`${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-950"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddConditionLog} className="flex flex-col gap-4">
              <div>
                <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Action Taken *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify details of communication with borrower, or verification performed (e.g. audited accounts received and checked)..."
                  className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"} leading-relaxed`}
                  value={followUpActionText}
                  onChange={(e) => setFollowUpActionText(e.target.value)}
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Next Recommended Steps (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Re-evaluate compliance in 3 months"
                  className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"}`}
                  value={followUpNextSteps}
                  onChange={(e) => setFollowUpNextSteps(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveConditionExemption(null)}
                  className={`bg-transparent ${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-950"} px-4 py-2 rounded-lg text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DIALOG FOR ZIDISHA SHARE PERIODIC STANDING INSTRUCTION */}
      {activeZidishaSetup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${bgCard} border ${borderCard} rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4`}
          >
            <div className={`flex justify-between items-center border-b ${borderCard} pb-3`}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`font-bold ${textWhiteOrSlate} text-base`}>{zidishaType} Standing Instruction</h4>
                  <p className={`text-[10px] ${textSub}`}>Direct CBS integration portal</p>
                </div>
              </div>
              <button
                onClick={() => setActiveZidishaSetup(null)}
                className={`${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-950"} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? "bg-[#171c26]/60 border border-[#2e374b]" : "bg-slate-100 border border-slate-200"} text-xs flex flex-col gap-1.5`}>
              <p className={`font-semibold ${textWhiteOrSlate}`}>Conditional Clause:</p>
              <p className={`italic ${textSub} leading-normal`}>"{activeZidishaSetup.conditionText}"</p>
              <p className={`text-[10px] ${textSub} mt-1 font-sans`}>Customer: <span className="font-semibold">{activeZidishaSetup.customerName}</span></p>
            </div>

            <form onSubmit={handleSaveZidishaInstruction} className="flex flex-col gap-4">
              <div>
                <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Contribution Type *</label>
                <select
                  value={zidishaType}
                  onChange={(e) => setZidishaType(e.target.value)}
                  className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full cursor-pointer`}
                >
                  <option value="Zidisha Shares">Zidisha Microfinance Shares</option>
                  <option value="Back Office Shares">Back Office Sacco Shares</option>
                  <option value="Share Capital">Share Capital Account (Class A)</option>
                  <option value="Welfare Fund">Staff Welfare Shares / Capital</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Debit Account *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ACT-8472-10"
                    value={zidishaDebitAccount}
                    onChange={(e) => setZidishaDebitAccount(e.target.value)}
                    className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"} font-mono`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Credit Account *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ZID-GLOBAL-TREASURY"
                    value={zidishaCreditAccount}
                    onChange={(e) => setZidishaCreditAccount(e.target.value)}
                    className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-[#506373]" : "text-slate-400"} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Amount ($ USD) *</label>
                  <div className="relative">
                    <span className={`absolute left-3 top-2 text-xs ${textSub}`}>$</span>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="200"
                      value={zidishaAmount}
                      onChange={(e) => setZidishaAmount(Number(e.target.value))}
                      className={`${bgSubCard} border ${borderInput} rounded-lg pl-7 pr-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full font-mono`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Frequency *</label>
                  <select
                    value={zidishaFrequency}
                    onChange={(e) => setZidishaFrequency(e.target.value)}
                    className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full`}
                  >
                    <option value="Daily">Daily Basis</option>
                    <option value="Weekly">Weekly Basis</option>
                    <option value="Monthly">Monthly Basis</option>
                    <option value="Quarterly">Quarterly Basis</option>
                    <option value="Bi-Annually">Bi-Annually Basis</option>
                    <option value="Annually">Annually Basis</option>
                  </select>
                </div>
              </div>

              {/* DEMO TOOL: FORCE FAILURE TOGGLE */}
              <div className={`p-3 rounded-lg border ${cbsForceFailure ? "bg-red-500/5 border-red-500/20" : `${bgSubCard} ${borderSubCard}`} flex items-center justify-between text-xs transition-colors`}>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className={`font-semibold ${cbsForceFailure ? "text-red-400" : textWhiteOrSlate}`}>CBS Integration Debug Mode</span>
                  <span className={`text-[10px] ${textSub}`}>Toggle simulated CBS connection results</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono ${cbsForceFailure ? "text-red-400 font-bold" : textSub}`}>
                    {cbsForceFailure ? "FORCING FAILURE" : "SIMULATING SUCCESS"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCbsForceFailure(!cbsForceFailure)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      cbsForceFailure ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        cbsForceFailure ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>Saving this form registers the standing instruction in our monitoring logs and invokes the CBS API loop to execute today's payment schedules dynamically.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveZidishaSetup(null)}
                  className={`bg-transparent ${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-950"} px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCbsSyncing}
                  className={`bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer`}
                >
                  {isCbsSyncing ? (
                    <>
                      <Activity className="h-3.5 w-3.5 animate-spin" /> Connecting to CBS...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Save & Effect in CBS
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CBS INTEGRATION ALERT BANNER */}
      {cbsAlert && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-50 text-left">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`border rounded-xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden ${
              cbsAlert.type === "success"
                ? isDark
                  ? "bg-[#0b1d16] border-emerald-500/30 text-emerald-100"
                  : "bg-[#eefdf5] border-emerald-200 text-emerald-900"
                : isDark
                  ? "bg-[#251012] border-red-500/30 text-red-100"
                  : "bg-[#fef2f2] border-red-200 text-red-900"
            }`}
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${cbsAlert.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}></div>

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${cbsAlert.type === "success" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {cbsAlert.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">CBS Integration Status Report</h4>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"} font-mono`}>BASEL IV SYNC TERMINAL ID: #9821</p>
                </div>
              </div>
              <button
                onClick={() => setCbsAlert(null)}
                className={`p-1 rounded hover:bg-black/10 transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-t border-dashed border-current/15 pt-3 mt-1 flex flex-col gap-2.5 text-xs">
              <p className="font-semibold">{cbsAlert.message}</p>
              {cbsAlert.details && <p className="opacity-80 leading-relaxed text-[11px] font-mono">{cbsAlert.details}</p>}

              <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-lg border text-center font-mono text-xs ${isDark ? "bg-black/25 border-current/10" : "bg-white/80 border-current/10"}`}>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider opacity-60">Total Daily Shares Volume</span>
                  <span className="font-bold text-sm text-emerald-500">${cbsAlert.totalAmount.toLocaleString()} USD</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider opacity-60">Accounts Settled Today</span>
                  <span className="font-bold text-sm text-emerald-500">{cbsAlert.accountsCount} Accounts</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setCbsAlert(null)}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition ${
                  cbsAlert.type === "success"
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-red-500 text-white hover:bg-red-400"
                } cursor-pointer`}
              >
                Dismiss Alert
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DIALOG FOR MOCK EMAIL OFFICER NOTIFICATION */}
      {notificationExemption && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${bgCard} border ${borderCard} rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative`}
          >
            <div className={`flex justify-between items-center border-b ${borderCard} pb-3`}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`font-bold ${textWhiteOrSlate} text-base`}>Officer Status Alert Dispatcher</h4>
                  <p className={`text-[10px] ${textSub}`}>Direct mail communication gateway</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNotificationExemption(null);
                  setNotificationAlert(null);
                }}
                className={`${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-950"} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {notificationAlert ? (
              <div className="flex flex-col gap-4 py-4 text-center items-center">
                <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-full animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h5 className={`font-bold text-sm ${textWhiteOrSlate}`}>Email Dispatched</h5>
                  <p className={`text-xs ${textSub} max-w-sm`}>
                    {notificationAlert.message}
                  </p>
                </div>
                <div className={`w-full p-3 rounded-lg text-xs font-mono text-left ${isDark ? "bg-[#171c26]/60 border border-slate-800" : "bg-slate-100 border border-slate-200"}`}>
                  <p className="font-bold mb-1">Audit Details:</p>
                  <p className={textSub}>• Recipient: {notificationExemption.officerName}</p>
                  <p className={textSub}>• Contact: {notificationExemption.officerContact}</p>
                  <p className={textSub}>• Log entry has been appended to the active exemption's timeline trail.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationExemption(null);
                    setNotificationAlert(null);
                  }}
                  className="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-lg text-xs transition cursor-pointer"
                >
                  Dismiss & Close Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1`}>To (Recipient Credit Officer)</label>
                    <input
                      disabled
                      type="text"
                      value={`${notificationExemption.officerName}`}
                      className={`${bgSubCard} border ${borderInput} rounded-lg px-3 py-2 text-xs opacity-60 ${textWhiteOrSlate} w-full font-semibold cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1`}>Contact Email / System Node</label>
                    <input
                      disabled
                      type="text"
                      value={notificationExemption.officerContact}
                      className={`${bgSubCard} border ${borderInput} rounded-lg px-3 py-2 text-xs opacity-60 ${textWhiteOrSlate} w-full font-mono cursor-not-allowed`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Email Subject Line *</label>
                  <input
                    required
                    type="text"
                    placeholder="Subject..."
                    value={notificationSubject}
                    onChange={(e) => setNotificationSubject(e.target.value)}
                    className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full placeholder:${isDark ? "text-slate-600" : "text-slate-400"}`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold ${textSub} uppercase tracking-wider block mb-1.5`}>Message Body Text *</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write message details..."
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    className={`${bgSubCard} border ${borderInput} rounded-lg px-3.5 py-2 text-xs ${textWhiteOrSlate} focus:outline-none focus:border-emerald-500 w-full h-44 resize-none placeholder:${isDark ? "text-slate-600" : "text-slate-400"} font-sans leading-relaxed`}
                  />
                </div>

                <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>Submitting this form dispatches a mock email directly to the credit officer's secure client dashboard. An audit action logging entry is automatically added to this file.</span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationExemption(null);
                      setNotificationAlert(null);
                    }}
                    className={`bg-transparent ${textSub} ${isDark ? "hover:text-white" : "hover:text-slate-950"} px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingNotification}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSendingNotification ? (
                      <>
                        <Activity className="h-3.5 w-3.5 animate-spin" /> Dispatching Alert...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Send Alert
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
      )}
    </>
  );
}
