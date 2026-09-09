#!/usr/bin/env python3
"""
Unit and Integration Tests for Global Ticket Router API
Validates intent classification, constraint solver, true skill-aware assignment,
malformed/zero-byte payloads, and REST API contract compliance.
"""

import unittest
import json
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.server import (
    score_skill_match,
    route_ticket_payload,
    RESOLVER_GROUPS,
    RESOLVER_MEMBER_SKILLS,
    TICKET_SKILL_REQUIREMENTS
)

class TestRoutingEngineAPI(unittest.TestCase):

    def test_01_high_confidence_hardware_route(self):
        payload = {
            "text": "My laptop screen is flickering constantly after the latest software update in APAC office Tokyo.",
            "region": "APAC",
            "channel": "Portal",
            "asset": "Hardware",
            "userRole": "End User"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["status"], "AUTO_ROUTED")
        self.assertEqual(res["recommendedGroup"], "APAC-IT-Hardware")
        self.assertGreaterEqual(res["confidence"], 80)
        self.assertEqual(res["bestMember"], "Kenji Tanaka")
        self.assertGreaterEqual(res["skillMatchScore"], 90)
        self.assertIn("Hardware Repair", res["matchedSkills"][0])

    def test_02_low_confidence_manual_review(self):
        payload = {
            "text": "Something is wrong and not working right now.",
            "region": "NA",
            "channel": "Email",
            "asset": "Software/ERP",
            "userRole": "End User"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["status"], "MANUAL_REVIEW")
        self.assertLess(res["confidence"], 70)

    def test_03_emea_gdpr_hard_constraint(self):
        payload = {
            "text": "Need assistance with quarterly salary payout reports in London office payroll system.",
            "region": "EMEA",
            "channel": "Portal",
            "asset": "Finance System",
            "userRole": "Tier 1 Agent"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["recommendedGroup"], "EMEA-Finance-Ops")
        self.assertTrue(any("EMEA GDPR" in c for c in res["hardConstraints"]))
        self.assertEqual(res["bestMember"], "Claire Dupont")
        self.assertEqual(res["skillMatchScore"], 100)

    def test_04_global_secops_mandate(self):
        payload = {
            "text": "Suspicious Okta MFA prompt received on personal device, potential unauthorized login attempt.",
            "region": "NA",
            "channel": "Phone",
            "asset": "Identity/IAM",
            "userRole": "Support Lead / Admin"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["recommendedGroup"], "Global-SecOps")
        self.assertTrue(any("Security policy" in c for c in res["hardConstraints"]))
        self.assertEqual(res["bestMember"], "Marcus Reid")
        self.assertEqual(res["skillMatchScore"], 100)

    def test_05_soft_constraints_applied(self):
        payload = {
            "text": "Unable to establish VPN connection tunnel from home network.",
            "region": "NA",
            "channel": "Phone",
            "asset": "Network/VPN",
            "userRole": "Tier 1 Agent"
        }
        res = route_ticket_payload(payload)
        self.assertGreaterEqual(len(res["softConstraints"]), 2)
        self.assertTrue(any("Local Region" in s for s in res["softConstraints"]))

    def test_06_latam_tax_compliance(self):
        payload = {
            "text": "Requesting access update for LATAM regional invoicing & tax submission module.",
            "region": "LATAM",
            "channel": "Portal",
            "asset": "Finance System",
            "userRole": "End User"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["recommendedGroup"], "LATAM-Finance-Ops")
        self.assertTrue(any("LATAM Tax" in c for c in res["hardConstraints"]))

    def test_07_zero_byte_empty_payload(self):
        payload = {
            "text": "",
            "region": "NA",
            "channel": "Portal",
            "asset": "Hardware",
            "userRole": "End User"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["status"], "MANUAL_REVIEW")
        self.assertEqual(res["finalGroup"], "Manual-Review")
        self.assertEqual(res["intent"], "UNKNOWN")

    def test_08_whitespace_only_payload(self):
        payload = {
            "text": "   \n\t   \n  ",
            "region": "EMEA",
            "channel": "Email",
            "asset": "Finance System",
            "userRole": "End User"
        }
        res = route_ticket_payload(payload)
        self.assertEqual(res["status"], "MANUAL_REVIEW")
        self.assertEqual(res["finalGroup"], "Manual-Review")

    def test_09_skill_aware_tiebreak_selection(self):
        # Test APAC hardware: Kenji Tanaka vs Priya Sharma
        skill_res = score_skill_match("HARDWARE_FAULT", "APAC-IT-Hardware")
        self.assertEqual(skill_res["bestMember"], "Kenji Tanaka")
        self.assertGreaterEqual(skill_res["skillMatchScore"], 90)
        self.assertGreater(len(skill_res["matchedSkills"]), 0)

    def test_10_api_contract_schema(self):
        payload = {
            "text": "Need urgent password reset for corporate ERP login.",
            "region": "NA",
            "channel": "Portal",
            "asset": "Software/ERP",
            "userRole": "End User"
        }
        res = route_ticket_payload(payload)
        required_keys = [
            "id", "recommendedGroup", "confidence", "status",
            "matchedSkills", "hardConstraints", "softConstraints",
            "bestMember", "skillMatchScore", "availabilityScore"
        ]
        for k in required_keys:
            self.assertIn(k, res, f"Expected key '{k}' in API response payload")

if __name__ == "__main__":
    unittest.main(verbosity=2)
