#!/usr/bin/env python3
"""
Global Ticket Router - REST API & Integration Stub Service
Zero-dependency Python HTTP server providing ticket classification,
hard/soft constraint evaluation, skill-aware resolver routing, and static file hosting.
"""

import http.server
import socketserver
import json
import os
import sys
import time
from datetime import datetime, timezone

PORT = int(os.environ.get("PORT", 5000))
START_TIME = time.time()
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# -----------------------------------------------------------------------------
# DOMAIN MODELS & DATA DEFINITIONS
# -----------------------------------------------------------------------------

RESOLVER_GROUPS = [
    {"id": "NA-IT-Hardware", "name": "NA IT Hardware Team", "region": "NA", "domain": "Hardware"},
    {"id": "EMEA-IT-Hardware", "name": "EMEA IT Hardware Team", "region": "EMEA", "domain": "Hardware"},
    {"id": "APAC-IT-Hardware", "name": "APAC IT Hardware Team", "region": "APAC", "domain": "Hardware"},
    {"id": "LATAM-IT-Hardware", "name": "LATAM IT Hardware Team", "region": "LATAM", "domain": "Hardware"},
    {"id": "NA-Net-VPN", "name": "NA Network & VPN Team", "region": "NA", "domain": "Network/VPN"},
    {"id": "EMEA-Net-VPN", "name": "EMEA Network & VPN Team", "region": "EMEA", "domain": "Network/VPN"},
    {"id": "APAC-Net-VPN", "name": "APAC Network & VPN Team", "region": "APAC", "domain": "Network/VPN"},
    {"id": "Global-SecOps", "name": "Global Security & IAM Ops", "region": "GLOBAL", "domain": "Identity/IAM"},
    {"id": "Global-ERP-Support", "name": "Global ERP & Enterprise Software", "region": "GLOBAL", "domain": "Software/ERP"},
    {"id": "EMEA-Finance-Ops", "name": "EMEA Payroll & Finance IT", "region": "EMEA", "domain": "Finance System"},
    {"id": "LATAM-Finance-Ops", "name": "LATAM Finance IT Support", "region": "LATAM", "domain": "Finance System"},
    {"id": "Manual-Review", "name": "Manual Review Queue", "region": "GLOBAL", "domain": "Triage"}
]

RESOLVER_MEMBER_SKILLS = {
    "NA-IT-Hardware": [
        {"name": "Alice Carter", "skills": {"Hardware Repair": 5, "Laptop Diagnosis": 5, "Peripheral Support": 4, "BIOS/Firmware": 3}, "availability": 0.90},
        {"name": "Brian Moss", "skills": {"Hardware Repair": 4, "Laptop Diagnosis": 3, "Peripheral Support": 5, "BIOS/Firmware": 4}, "availability": 0.70}
    ],
    "EMEA-IT-Hardware": [
        {"name": "Sophie Müller", "skills": {"Hardware Repair": 5, "Laptop Diagnosis": 4, "Peripheral Support": 3, "BIOS/Firmware": 3}, "availability": 0.85},
        {"name": "Luca Romano", "skills": {"Hardware Repair": 3, "Laptop Diagnosis": 5, "Peripheral Support": 4, "BIOS/Firmware": 5}, "availability": 0.60}
    ],
    "APAC-IT-Hardware": [
        {"name": "Kenji Tanaka", "skills": {"Hardware Repair": 5, "Laptop Diagnosis": 5, "Peripheral Support": 3, "BIOS/Firmware": 4}, "availability": 0.95},
        {"name": "Priya Sharma", "skills": {"Hardware Repair": 4, "Laptop Diagnosis": 4, "Peripheral Support": 5, "BIOS/Firmware": 2}, "availability": 0.80}
    ],
    "LATAM-IT-Hardware": [
        {"name": "Carlos Vega", "skills": {"Hardware Repair": 4, "Laptop Diagnosis": 4, "Peripheral Support": 4, "BIOS/Firmware": 3}, "availability": 0.75}
    ],
    "NA-Net-VPN": [
        {"name": "Derek Walsh", "skills": {"VPN Tunnelling": 5, "Network Diagnostics": 5, "DNS/Firewall": 4, "Cisco Routing": 5}, "availability": 0.88},
        {"name": "Tanya Lin", "skills": {"VPN Tunnelling": 4, "Network Diagnostics": 5, "DNS/Firewall": 5, "Cisco Routing": 3}, "availability": 0.65}
    ],
    "EMEA-Net-VPN": [
        {"name": "Fatima Al-Saad", "skills": {"VPN Tunnelling": 5, "Network Diagnostics": 4, "DNS/Firewall": 5, "Cisco Routing": 4}, "availability": 0.90},
        {"name": "Andrei Petrov", "skills": {"VPN Tunnelling": 3, "Network Diagnostics": 5, "DNS/Firewall": 4, "Cisco Routing": 5}, "availability": 0.70}
    ],
    "APAC-Net-VPN": [
        {"name": "Li Wei", "skills": {"VPN Tunnelling": 5, "Network Diagnostics": 5, "DNS/Firewall": 3, "Cisco Routing": 4}, "availability": 0.82}
    ],
    "Global-SecOps": [
        {"name": "Marcus Reid", "skills": {"IAM / SSO": 5, "Phishing Response": 5, "MFA Enforcement": 5, "Threat Analysis": 4, "Okta Admin": 5}, "availability": 0.95},
        {"name": "Nina Koch", "skills": {"IAM / SSO": 4, "Phishing Response": 5, "MFA Enforcement": 4, "Threat Analysis": 5, "Okta Admin": 4}, "availability": 0.80}
    ],
    "Global-ERP-Support": [
        {"name": "Rohan Das", "skills": {"SAP Administration": 5, "Salesforce CRM": 4, "Office365 Support": 5, "ERP Licensing": 5}, "availability": 0.75},
        {"name": "Elena Moreau", "skills": {"SAP Administration": 4, "Salesforce CRM": 5, "Office365 Support": 4, "ERP Licensing": 3}, "availability": 0.85}
    ],
    "EMEA-Finance-Ops": [
        {"name": "Claire Dupont", "skills": {"Payroll Systems": 5, "Workday HR": 5, "Finance Compliance": 5, "GDPR Handling": 5}, "availability": 0.90},
        {"name": "Hans Weber", "skills": {"Payroll Systems": 4, "Workday HR": 4, "Finance Compliance": 4, "GDPR Handling": 5}, "availability": 0.70}
    ],
    "LATAM-Finance-Ops": [
        {"name": "Isabella Ruiz", "skills": {"Payroll Systems": 5, "Workday HR": 4, "Finance Compliance": 5, "GDPR Handling": 2}, "availability": 0.85}
    ]
}

TICKET_SKILL_REQUIREMENTS = {
    "HARDWARE_FAULT": {"Hardware Repair": 4, "Laptop Diagnosis": 3, "Peripheral Support": 2, "BIOS/Firmware": 2},
    "VPN_CONNECTIVITY": {"VPN Tunnelling": 4, "Network Diagnostics": 3, "DNS/Firewall": 2, "Cisco Routing": 2},
    "PASSWORD_RESET": {"IAM / SSO": 4, "Okta Admin": 3, "MFA Enforcement": 3},
    "SECURITY_INCIDENT": {"Phishing Response": 5, "Threat Analysis": 4, "IAM / SSO": 3, "MFA Enforcement": 3},
    "PAYROLL_FINANCE": {"Payroll Systems": 5, "Workday HR": 3, "Finance Compliance": 4, "GDPR Handling": 3},
    "SOFTWARE_LICENSE": {"SAP Administration": 3, "ERP Licensing": 4, "Salesforce CRM": 2, "Office365 Support": 2},
    "UNKNOWN": {}
}

TEAM_SKILL_PROFILES = {
    "NA-IT-Hardware": {"teamLead": "Alice Carter", "primaryFocus": "Laptops, Desktops, BIOS, Peripherals", "headcount": 2, "avgResolutionTimeHours": 1.8},
    "EMEA-IT-Hardware": {"teamLead": "Sophie Müller", "primaryFocus": "EU Depot Hardware, Field Diagnosis", "headcount": 2, "avgResolutionTimeHours": 2.1},
    "APAC-IT-Hardware": {"teamLead": "Kenji Tanaka", "primaryFocus": "APAC Fleet Management & Rapid Replacement", "headcount": 2, "avgResolutionTimeHours": 1.5},
    "LATAM-IT-Hardware": {"teamLead": "Carlos Vega", "primaryFocus": "Regional Logistics, Desktop Support", "headcount": 1, "avgResolutionTimeHours": 2.4},
    "NA-Net-VPN": {"teamLead": "Derek Walsh", "primaryFocus": "Enterprise VPN Tunnels, SD-WAN", "headcount": 2, "avgResolutionTimeHours": 0.9},
    "EMEA-Net-VPN": {"teamLead": "Fatima Al-Saad", "primaryFocus": "European WAN Gateways, Secure Firewalls", "headcount": 2, "avgResolutionTimeHours": 1.2},
    "APAC-Net-VPN": {"teamLead": "Li Wei", "primaryFocus": "Subsea Transit Links, Regional Gateways", "headcount": 1, "avgResolutionTimeHours": 1.1},
    "Global-SecOps": {"teamLead": "Marcus Reid", "primaryFocus": "Zero-Trust IAM, Incident Response, Okta", "headcount": 2, "avgResolutionTimeHours": 0.5},
    "Global-ERP-Support": {"teamLead": "Rohan Das", "primaryFocus": "SAP S/4HANA Core, Salesforce CRM", "headcount": 2, "avgResolutionTimeHours": 3.2},
    "EMEA-Finance-Ops": {"teamLead": "Claire Dupont", "primaryFocus": "EU GDPR Payroll Sovereignty, Workday HRIS", "headcount": 2, "avgResolutionTimeHours": 1.4},
    "LATAM-Finance-Ops": {"teamLead": "Isabella Ruiz", "primaryFocus": "LATAM Statutory Tax Integration, Payroll", "headcount": 1, "avgResolutionTimeHours": 1.7},
    "Manual-Review": {"teamLead": "Global Triage Lead", "primaryFocus": "Unclassified Ambiguous Tickets", "headcount": 4, "avgResolutionTimeHours": 0.8}
}

INTENTS = {
    "PASSWORD_RESET": {
        "id": "PASSWORD_RESET",
        "label": "Password & IAM Reset",
        "defaultGroup": "Global-SecOps",
        "keywords": ["password", "reset", "locked", "login", "okta", "auth", "mfa", "2fa", "sso", "credential", "access denied"]
    },
    "HARDWARE_FAULT": {
        "id": "HARDWARE_FAULT",
        "label": "Hardware Fault / Replacement",
        "defaultGroupRegional": True,
        "groupPrefix": "IT-Hardware",
        "keywords": ["screen", "laptop", "monitor", "flicker", "battery", "keyboard", "broken", "boot", "hardware", "printer", "mouse", "docking", "power", "macbook", "dell"]
    },
    "VPN_CONNECTIVITY": {
        "id": "VPN_CONNECTIVITY",
        "label": "VPN & Network Connectivity",
        "defaultGroupRegional": True,
        "groupPrefix": "Net-VPN",
        "keywords": ["vpn", "connection", "remote access", "tunnel", "disconnect", "wifi", "network", "ping", "dns", "firewall", "cisco", "globalprotect", "slow internet"]
    },
    "PAYROLL_FINANCE": {
        "id": "PAYROLL_FINANCE",
        "label": "Payroll & Finance System Access",
        "defaultGroupRegional": True,
        "groupPrefix": "Finance-Ops",
        "fallbackGroup": "Global-ERP-Support",
        "keywords": ["payroll", "salary", "workday", "expense", "invoice", "payment", "bank", "payslip", "reimbursement", "tax"]
    },
    "SOFTWARE_LICENSE": {
        "id": "SOFTWARE_LICENSE",
        "label": "Software License & ERP Bug",
        "defaultGroup": "Global-ERP-Support",
        "keywords": ["sap", "license", "salesforce", "install", "crash", "bug", "application", "erp", "office365", "excel", "outlook", "software"]
    },
    "SECURITY_INCIDENT": {
        "id": "SECURITY_INCIDENT",
        "label": "Security & Threat Alert",
        "defaultGroup": "Global-SecOps",
        "keywords": ["phishing", "malware", "unauthorized", "stolen", "breach", "suspicious", "virus", "hacked", "encryption", "compromised"]
    },
    "UNKNOWN": {
        "id": "UNKNOWN",
        "label": "Unclear / Ambiguous Intent",
        "defaultGroup": "Manual-Review",
        "keywords": []
    }
}

# -----------------------------------------------------------------------------
# CORE ALGORITHM IMPLEMENTATION
# -----------------------------------------------------------------------------

def score_skill_match(intent_key, group_id):
    requirements = TICKET_SKILL_REQUIREMENTS.get(intent_key, {})
    members = RESOLVER_MEMBER_SKILLS.get(group_id, [])
    team_profile = TEAM_SKILL_PROFILES.get(group_id, {})

    if not requirements or not members:
        fallback_name = members[0]["name"] if members else "Triage Specialist"
        fallback_avail = members[0]["availability"] if members else 0.5
        return {
            "skillMatchScore": 50,
            "matchedSkills": [],
            "missingSkills": [],
            "bestMember": fallback_name,
            "availabilityScore": fallback_avail,
            "tiebreakReason": "Default assignment (baseline intent)",
            "teamProfile": team_profile
        }

    candidate_scores = []
    required_names = list(requirements.keys())

    for member in members:
        coverage = 0
        total_weight = 0
        matched = []
        missing = []

        for skill in required_names:
            req = requirements[skill]
            act = member["skills"].get(skill, 0)
            total_weight += req
            coverage += min(act, req)
            if act >= req:
                matched.append(f"{skill} (Level {act}/5 ★, Req: {req})")
            else:
                missing.append(f"{skill} (Current: {act}/5, Needed: {req})")

        skill_coverage_pct = round((coverage / total_weight) * 100) if total_weight > 0 else 0
        avail_pct = round(member["availability"] * 100)
        combined = (skill_coverage_pct * 0.8) + (avail_pct * 0.2)

        candidate_scores.append({
            "name": member["name"],
            "skillMatchScore": skill_coverage_pct,
            "availabilityScore": member["availability"],
            "combined": combined,
            "matchedSkills": matched,
            "missingSkills": missing
        })

    candidate_scores.sort(key=lambda x: x["combined"], reverse=True)
    best = candidate_scores[0]
    second = candidate_scores[1] if len(candidate_scores) > 1 else None

    if second and best["skillMatchScore"] == second["skillMatchScore"]:
        tiebreak = f"Availability Tiebreak: {best['name']} ({round(best['availabilityScore']*100)}% avail) selected over {second['name']} ({round(second['availabilityScore']*100)}% avail)."
    else:
        tiebreak = f"Selected {best['name']} with {best['skillMatchScore']}% skill coverage and {round(best['availabilityScore']*100)}% availability."

    return {
        "skillMatchScore": best["skillMatchScore"],
        "matchedSkills": best["matchedSkills"],
        "missingSkills": best["missingSkills"],
        "bestMember": best["name"],
        "availabilityScore": best["availabilityScore"],
        "tiebreakReason": tiebreak,
        "teamProfile": team_profile
    }

def route_ticket_payload(payload, threshold=70):
    text = payload.get("text", "")
    region = payload.get("region", "NA")
    channel = payload.get("channel", "Portal")
    asset = payload.get("asset", "Hardware")
    user_role = payload.get("userRole", "End User")

    # Edge case: Empty / Zero-byte / Whitespace text
    if not isinstance(text, str) or not text.strip():
        return {
            "id": f"TICK-{int(time.time() * 1000) % 9000 + 1000}",
            "text": text,
            "region": region,
            "channel": channel,
            "asset": asset,
            "userRole": user_role,
            "intent": "UNKNOWN",
            "intentLabel": "Unclear / Ambiguous Intent (Malformed Payload)",
            "recommendedGroup": "Manual-Review",
            "recommendedGroupName": "Manual Review Queue",
            "finalGroup": "Manual-Review",
            "confidence": 20,
            "status": "MANUAL_REVIEW",
            "thresholdUsed": threshold,
            "hardConstraints": [],
            "softConstraints": [],
            "matchedSkills": [],
            "skillMatchScore": 0,
            "bestMember": "Triage Lead",
            "availabilityScore": 0.50,
            "routingReason": "Failure Case Intercept: Empty description payload diverted to Manual Review.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    norm_text = text.lower()

    # Step 1: Detect Intent
    best_intent = "UNKNOWN"
    max_matches = 0

    for ikey, idef in INTENTS.items():
        if ikey == "UNKNOWN":
            continue
        matches = sum(1 for kw in idef["keywords"] if kw in norm_text)
        if matches > max_matches:
            max_matches = matches
            best_intent = ikey

    if best_intent == "UNKNOWN":
        asset_map = {
            "Identity/IAM": "PASSWORD_RESET",
            "Hardware": "HARDWARE_FAULT",
            "Network/VPN": "VPN_CONNECTIVITY",
            "Finance System": "PAYROLL_FINANCE",
            "Software/ERP": "SOFTWARE_LICENSE"
        }
        best_intent = asset_map.get(asset, "UNKNOWN")

    intent_def = INTENTS.get(best_intent, INTENTS["UNKNOWN"])

    # Step 2: Determine Default Target Group
    target_group = "Manual-Review"
    if intent_def.get("defaultGroup"):
        target_group = intent_def["defaultGroup"]
    elif intent_def.get("defaultGroupRegional"):
        candidate = f"{region}-{intent_def['groupPrefix']}"
        group_ids = [g["id"] for g in RESOLVER_GROUPS]
        target_group = candidate if candidate in group_ids else intent_def.get("fallbackGroup", "Manual-Review")

    # Step 3: Hard Constraints
    hard_constraints = []
    if region == "EMEA" and (asset == "Finance System" or best_intent == "PAYROLL_FINANCE"):
        target_group = "EMEA-Finance-Ops"
        hard_constraints.append("Hard Constraint Triggered: EMEA GDPR Data Sovereignty locks ticket to EMEA-Finance-Ops.")
    elif region == "LATAM" and asset == "Finance System":
        target_group = "LATAM-Finance-Ops"
        hard_constraints.append("Hard Constraint Triggered: LATAM Tax Compliance mandates LATAM-Finance-Ops routing.")
    elif asset == "Identity/IAM" or best_intent == "SECURITY_INCIDENT":
        target_group = "Global-SecOps"
        hard_constraints.append("Hard Constraint Triggered: Enterprise Security policy mandates Global-SecOps.")

    # Step 4: Confidence Scoring
    if max_matches >= 3:
        confidence = 80
    elif max_matches == 2:
        confidence = 70
    elif max_matches == 1:
        confidence = 55
    else:
        confidence = 35

    # Asset match bonus
    asset_match_pairs = [
        ("Hardware", "HARDWARE_FAULT"),
        ("Identity/IAM", "PASSWORD_RESET"),
        ("Identity/IAM", "SECURITY_INCIDENT"),
        ("Network/VPN", "VPN_CONNECTIVITY"),
        ("Finance System", "PAYROLL_FINANCE"),
        ("Software/ERP", "SOFTWARE_LICENSE")
    ]
    if (asset, best_intent) in asset_match_pairs:
        confidence += 15

    # Step 5: Soft Constraints
    soft_constraints = []
    target_group_obj = next((g for g in RESOLVER_GROUPS if g["id"] == target_group), None)
    if target_group_obj and target_group_obj.get("region") == region:
        confidence += 15
        soft_constraints.append("Soft Constraint Matched: Local Region (+15%)")
    if channel in ["Phone", "Slack/Chat"]:
        confidence += 10
        soft_constraints.append("Soft Constraint Matched: High Urgency Channel (+10%)")
    if user_role in ["Tier 1 Agent", "Support Lead / Admin"]:
        confidence += 5
        soft_constraints.append("Soft Constraint Matched: Verified User Role (+5%)")

    if hard_constraints:
        confidence = max(confidence, 90)

    confidence = min(98, max(15, confidence))

    # Step 6: Status & Decision
    if confidence < threshold or best_intent == "UNKNOWN":
        status = "MANUAL_REVIEW"
        final_group = "Manual-Review"
    else:
        status = "AUTO_ROUTED"
        final_group = target_group

    # Step 7: True Skill-Aware Scoring
    skill_group = target_group if status == "MANUAL_REVIEW" else final_group
    skill_res = score_skill_match(best_intent, skill_group)

    target_name = target_group_obj["name"] if target_group_obj else target_group

    routing_reason = (
        f"Auto-routed with {confidence}% confidence to {target_name}. "
        f"Specialist {skill_res['bestMember']} assigned with {skill_res['skillMatchScore']}% skill match."
        if status == "AUTO_ROUTED"
        else f"Diverted to Manual Review: Confidence ({confidence}%) below threshold ({threshold}%)."
    )

    return {
        "id": f"TICK-{int(time.time() * 1000) % 9000 + 1000}",
        "text": text,
        "region": region,
        "channel": channel,
        "asset": asset,
        "userRole": user_role,
        "intent": best_intent,
        "intentLabel": intent_def["label"],
        "recommendedGroup": target_group,
        "recommendedGroupName": target_name,
        "finalGroup": final_group,
        "confidence": confidence,
        "status": status,
        "thresholdUsed": threshold,
        "hardConstraints": hard_constraints,
        "softConstraints": soft_constraints,
        "matchedSkills": skill_res["matchedSkills"],
        "missingSkills": skill_res.get("missingSkills", []),
        "skillMatchScore": skill_res["skillMatchScore"],
        "bestMember": skill_res["bestMember"],
        "availabilityScore": skill_res["availabilityScore"],
        "tiebreakReason": skill_res["tiebreakReason"],
        "teamProfile": skill_res.get("teamProfile", {}),
        "routingReason": routing_reason,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# -----------------------------------------------------------------------------
# HTTP REQUEST HANDLER
# -----------------------------------------------------------------------------

class TicketRouterRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORKSPACE_ROOT, **kwargs)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            health_data = {
                "status": "healthy",
                "service": "Global Ticket Router REST API",
                "version": "2.0.0",
                "uptimeSeconds": round(time.time() - START_TIME, 1),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "endpoints": [
                    {"path": "POST /api/route", "description": "Evaluate and route support ticket with true skill-aware solver"},
                    {"path": "GET /api/health", "description": "Service health and uptime monitor"},
                    {"path": "GET /api/roster", "description": "Resolver teams, member skill profiles, and competencies"},
                    {"path": "POST /api/override", "description": "Record an authorized manual override"}
                ]
            }
            self.wfile.write(json.dumps(health_data, indent=2).encode("utf-8"))
            return

        elif self.path == "/api/roster":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            roster_data = {
                "resolverGroups": RESOLVER_GROUPS,
                "resolverMemberSkills": RESOLVER_MEMBER_SKILLS,
                "ticketSkillRequirements": TICKET_SKILL_REQUIREMENTS,
                "teamProfiles": TEAM_SKILL_PROFILES
            }
            self.wfile.write(json.dumps(roster_data, indent=2).encode("utf-8"))
            return

        # Serve static files from workspace root
        return super().do_GET()

    def do_POST(self):

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            payload = json.loads(post_data) if post_data.strip() else {}
        except Exception:
            payload = {}

        if self.path == "/api/route":
            threshold = payload.get("threshold", 70)
            result = route_ticket_payload(payload, threshold=threshold)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result, indent=2).encode("utf-8"))
            return

        elif self.path == "/api/override":
            ticket_id = payload.get("ticketId", "TICK-UNKNOWN")
            new_group = payload.get("newGroup", "Manual-Review")
            reason = payload.get("reason", "API override justification")
            actor = payload.get("actor", "API Integration Lead")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            res = {
                "status": "OVERRIDDEN",
                "ticketId": ticket_id,
                "newGroup": new_group,
                "reason": reason,
                "actor": actor,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            self.wfile.write(json.dumps(res, indent=2).encode("utf-8"))
            return

        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Endpoint {self.path} not found"}).encode("utf-8"))

def run_server(port=PORT):
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), TicketRouterRequestHandler) as httpd:
        print(f"================================================================")
        print(f" Global Ticket Router API & Static Server running on port {port}")
        print(f" URL: http://localhost:{port}/")
        print(f" Endpoints:")
        print(f"   - POST http://localhost:{port}/api/route")
        print(f"   - GET  http://localhost:{port}/api/health")
        print(f"   - GET  http://localhost:{port}/api/roster")
        print(f"   - POST http://localhost:{port}/api/override")
        print(f"================================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port)
