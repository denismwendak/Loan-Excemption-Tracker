import { Exemption } from "../types";

export const initialExemptions: Exemption[] = [
  {
    id: "EX-2026-001",
    customerName: "Acme Manufacturing Ltd",
    accountNumber: "ACT-8472-10",
    loanAmount: 750000,
    currency: "USD",
    loanPurpose: "Specialized equipment expansion & automation upgrades",
    creditStatus: "GOOD",
    exemptionReason: "Exceeds standard single-industry exposure concentration policy limit of 15% of local bank branch capital allocation. Requesting exemption based on 8 years of impeccable borrowing history, excellent debt service, and strong parent corporate guarantee.",
    status: "APPROVED",
    dateRequested: "2026-05-12",
    dateGranted: "2026-05-15",
    riskScore: 48,
    riskLevel: "MEDIUM",
    mitigations: [
      "Obtained full unlimited corporate guarantee from parent company (Acme Holdings Inc).",
      "Registered 1st charge over the newly acquired automated equipment, representing 1.4x collateral coverage.",
      "Covenant requiring debt service coverage ratio (DSCR) to be monitored quarterly rather than annually."
    ],
    officerName: "Sarah Jenkins",
    officerId: "CO-9812",
    officerContact: "s.jenkins@crestbank.com",
    notes: "Approved by Credit Committee. Officer Jenkins assigned to monitor quarterly DSCR reports.",
    originBranch: "Nairobi Corporate Branch",
    creditAppRef: "CR-2026-904",
    conditions: [
      {
        id: "COND-001-1",
        condition: "Submit audited annual financial statements for both company and parent guarantor within 90 days of fiscal year-end.",
        expectedDate: "2026-09-30",
        followUpDate: "2026-07-15",
        followUpAction: "Request draft statements or management accounts from accountant",
        isMet: false,
        logs: [
          {
            id: "LOG-001",
            date: "2026-06-10",
            officerName: "Sarah Jenkins",
            actionTaken: "Contacted CFO. They confirmed draft accounts will be ready by end of July.",
            nextSteps: "Follow up in mid-July as planned."
          }
        ]
      },
      {
        id: "COND-001-2",
        condition: "Ensure Debt Service Coverage Ratio (DSCR) does not fall below 1.25x as verified by quarterly bank statements.",
        expectedDate: "2026-06-30",
        followUpDate: "2026-06-25",
        followUpAction: "Obtain quarterly operating accounts and perform DSCR calculation.",
        isMet: true,
        dateMet: "2026-06-25",
        logs: [
          {
            id: "LOG-002",
            date: "2026-06-25",
            officerName: "Sarah Jenkins",
            actionTaken: "Received Q2 internal accounts. Calculated DSCR at 1.34x. Requirement satisfied.",
            nextSteps: "No further action needed for Q2. Re-evaluate in Q3."
          }
        ]
      },
      {
        id: "COND-001-3",
        condition: "Build Zidisha shares on a periodic basis (Monthly contribution of $200) to support microfinance community-lending targets.",
        expectedDate: "2026-12-31",
        followUpDate: "2026-07-31",
        followUpAction: "Verify standing debit instruction to build Zidisha micro-lending shares.",
        isMet: false,
        logs: []
      }
    ],
    auditTrail: [
      {
        id: "AUD-001",
        timestamp: "2026-05-12T10:15:00Z",
        performedBy: "Sarah Jenkins (Credit Officer)",
        action: "Exemption Requested",
        details: "Created exemption request EX-2026-001 for Acme Manufacturing Ltd due to industry concentration cap limit."
      },
      {
        id: "AUD-002",
        timestamp: "2026-05-15T16:30:00Z",
        performedBy: "James Vance (Senior Credit Director)",
        action: "Exemption Approved",
        details: "Reviewed corporate guarantee and approved the exemption request with 2 mandatory active tracking conditions."
      }
    ]
  },
  {
    id: "EX-2026-002",
    customerName: "Devon Property Development",
    accountNumber: "ACT-1029-44",
    loanAmount: 2400000,
    currency: "KSH",
    loanPurpose: "Acquisition of vacant downtown lot for commercial parking & mixed retail development",
    creditStatus: "FAIR",
    exemptionReason: "Loan-To-Value (LTV) ratio of 79% exceeds the standard policy threshold of 70% for commercial land acquisition. Requesting policy exemption based on high-value pre-leasing letters of intent (LOI) representing 80% occupancy by national AAA retail tenants.",
    status: "PENDING",
    dateRequested: "2026-06-20",
    riskScore: 74,
    riskLevel: "HIGH",
    mitigations: [
      "Interest reserve account funded with 12 months of interest payments to be held in escrow.",
      "Personal guarantees executed by the three main development partners with verified net worth statements.",
      "Pre-leasing covenants requiring formal signed leases within 120 days from loan drawdown."
    ],
    officerName: "Mark Ridley",
    officerId: "CO-4410",
    officerContact: "m.ridley@crestbank.com",
    notes: "Requires Senior Credit Committee approval due to high LTV and large exposure amount.",
    originBranch: "Mombasa Commercial Center",
    creditAppRef: "CR-2026-721",
    conditions: [
      {
        id: "COND-002-1",
        condition: "Convert at least three pre-lease LOIs (representing minimum 50% GLA) into binding leases.",
        expectedDate: "2026-09-20",
        followUpDate: "2026-08-01",
        followUpAction: "Request formal leases from developer legal counsel.",
        isMet: false,
        logs: []
      },
      {
        id: "COND-002-2",
        condition: "Establish and fully fund the 12-month Interest Reserve escrow account ($144,000 equivalent).",
        expectedDate: "2026-07-05",
        followUpDate: "2026-07-01",
        followUpAction: "Verify escrow balance via internal deposit accounting.",
        isMet: false,
        logs: []
      }
    ],
    auditTrail: [
      {
        id: "AUD-003",
        timestamp: "2026-06-20T14:45:00Z",
        performedBy: "Mark Ridley (Credit Officer)",
        action: "Exemption Requested",
        details: "Created exemption request EX-2026-002 for Devon Property Development."
      }
    ]
  },
  {
    id: "EX-2026-003",
    customerName: "Dr. Elena Rostova",
    accountNumber: "ACT-5512-88",
    loanAmount: 380000,
    currency: "GBP",
    loanPurpose: "Acquisition of state-of-the-art diagnostic imaging machines for private clinic",
    creditStatus: "EXCELLENT",
    exemptionReason: "Debt-To-Income (DTI) ratio calculations yield 48%, which exceeds the standard private practice cap of 43%. Requesting exception based on borrower's impeccable individual credit rating (FICO 810), specialized clinical field, and high historical medical receivables growth.",
    status: "RESOLVED",
    dateRequested: "2026-04-10",
    dateGranted: "2026-04-12",
    riskScore: 22,
    riskLevel: "LOW",
    mitigations: [
      "Direct debit mandate established over private medical insurance settlement account.",
      "1st security charge registered over the diagnostic equipment.",
      "Co-signing by spouse who is an established orthopedic surgeon with independent income."
    ],
    officerName: "Sarah Jenkins",
    officerId: "CO-9812",
    officerContact: "s.jenkins@crestbank.com",
    notes: "Exemption was successfully resolved. The diagnostic machinery has been installed and private insurance payment flows are fully setup and meeting all repayment benchmarks.",
    originBranch: "Westlands Retail Hub",
    creditAppRef: "CR-2026-118",
    conditions: [
      {
        id: "COND-003-1",
        condition: "Configure direct debit pre-authorized sweep from private insurance settlement account.",
        expectedDate: "2026-05-15",
        followUpDate: "2026-05-10",
        followUpAction: "Confirm with treasury department that pre-authorized sweep is active and tested.",
        isMet: true,
        dateMet: "2026-05-11",
        logs: [
          {
            id: "LOG-003",
            date: "2026-05-11",
            officerName: "Sarah Jenkins",
            actionTaken: "Verified with treasury operations. Direct sweep is configured and the first installment was successfully pulled on schedule.",
            nextSteps: "Mark condition as met and resolve exemption status."
          }
        ]
      }
    ],
    auditTrail: [
      {
        id: "AUD-004",
        timestamp: "2026-04-10T09:00:00Z",
        performedBy: "Sarah Jenkins (Credit Officer)",
        action: "Exemption Requested",
        details: "Created exemption request EX-2026-003 for Dr. Elena Rostova."
      },
      {
        id: "AUD-005",
        timestamp: "2026-04-12T11:20:00Z",
        performedBy: "James Vance (Senior Credit Director)",
        action: "Exemption Approved",
        details: "Approved exemption due to borrower's strong professional profile and collateral. Assigned direct sweep setup as high priority condition."
      },
      {
        id: "AUD-006",
        timestamp: "2026-05-11T14:10:00Z",
        performedBy: "Sarah Jenkins (Credit Officer)",
        action: "Exemption Resolved",
        details: "Condition completed successfully. Exemption officially marked as Resolved and integrated into the loan file."
      }
    ]
  },
  {
    id: "EX-2026-004",
    customerName: "Vanguard Logistics Group",
    accountNumber: "ACT-3022-19",
    loanAmount: 1200000,
    currency: "KSH",
    loanPurpose: "Fleet acquisition of 10 refrigeration transport trailers",
    creditStatus: "FAIR",
    exemptionReason: "Requesting exemption for credit score of 620, which is below the transport sector program limit of 650. Exception justified by secured long-term transport contract with a major national supermarket chain representing 150% of annual debt service costs.",
    status: "ESCALATED",
    dateRequested: "2026-06-01",
    riskScore: 68,
    riskLevel: "HIGH",
    mitigations: [
      "Tripartite agreement signed directly with supermarket chain to pay invoice receivables directly into CrestBank escrow account.",
      "Personal guarantees of all major stockholders representing 100% of outstanding loan balance.",
      "Installation of real-time GPS tracking devices on all financed transport trailers with bank-monitored portal access."
    ],
    officerName: "Sarah Jenkins",
    officerId: "CO-9812",
    officerContact: "s.jenkins@crestbank.com",
    notes: "Escalated to Credit Committee because the client's secondary supplier contract was cancelled. Awaiting revised projections.",
    originBranch: "Eldoret Highway Hub",
    creditAppRef: "CR-2026-409",
    conditions: [
      {
        id: "COND-004-1",
        condition: "Provide signed copy of the master supply/transport contract with the national supermarket group.",
        expectedDate: "2026-06-15",
        followUpDate: "2026-06-12",
        followUpAction: "Request formal documentation from buyer's legal representative.",
        isMet: false,
        logs: [
          {
            id: "LOG-004",
            date: "2026-06-12",
            officerName: "Sarah Jenkins",
            actionTaken: "Client reported a delay in contract signature due to final compliance audits by the supermarket's legal team.",
            nextSteps: "Extend deadline and escalate to Senior Director James Vance."
          }
        ]
      }
    ],
    auditTrail: [
      {
        id: "AUD-007",
        timestamp: "2026-06-01T15:00:00Z",
        performedBy: "Sarah Jenkins (Credit Officer)",
        action: "Exemption Requested",
        details: "Created exemption request EX-2026-004 for Vanguard Logistics Group."
      },
      {
        id: "AUD-008",
        timestamp: "2026-06-12T16:05:00Z",
        performedBy: "Sarah Jenkins (Credit Officer)",
        action: "Status Escalated",
        details: "Contract delivery delayed beyond expectation. Status updated to Escalated. High risk flags raised."
      }
    ]
  }
];
