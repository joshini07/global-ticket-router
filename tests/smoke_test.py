"""
Quick smoke test for the running API server.
Usage: python tests/smoke_test.py [port]
"""
import urllib.request
import urllib.error
import json
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
BASE = f"http://localhost:{PORT}"

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

results = []

def check(name, ok, detail=""):
    label = PASS if ok else FAIL
    print(f"  [{label}] {name}" + (f" — {detail}" if detail else ""))
    results.append(ok)


print("\n=== Global Ticket Router — Live API Smoke Test ===\n")

# --- /api/health ---
try:
    r = urllib.request.urlopen(f"{BASE}/api/health")
    h = json.loads(r.read().decode())
    check("/api/health returns 200", r.status == 200)
    check("health.status == 'healthy'", h.get("status") == "healthy", h.get("status"))
    check("health.version present", "version" in h, h.get("version"))
    check("health.endpoints list present", isinstance(h.get("endpoints"), list), f"{len(h.get('endpoints', []))} endpoints")
except Exception as e:
    check("/api/health", False, str(e))

# --- /api/roster ---
try:
    r = urllib.request.urlopen(f"{BASE}/api/roster")
    ro = json.loads(r.read().decode())
    check("/api/roster returns 200", r.status == 200)
    check("roster.resolverGroups present", isinstance(ro.get("resolverGroups"), list), f"{len(ro.get('resolverGroups', []))} groups")
    check("roster.resolverMemberSkills present", isinstance(ro.get("resolverMemberSkills"), dict), f"{len(ro.get('resolverMemberSkills', {}))} profiles")
except Exception as e:
    check("/api/roster", False, str(e))

# --- POST /api/route — high confidence hardware ---
try:
    body = json.dumps({
        "text": "My Macbook screen is flickering in Tokyo office",
        "region": "APAC", "asset": "Hardware",
        "channel": "Portal", "userRole": "End User"
    }).encode()
    req = urllib.request.Request(f"{BASE}/api/route", data=body, headers={"Content-Type": "application/json"})
    r = urllib.request.urlopen(req)
    res = json.loads(r.read().decode())
    check("POST /api/route returns 200", r.status == 200)
    check("result.finalGroup present", "finalGroup" in res, res.get("finalGroup"))
    check("result.status present", "status" in res, res.get("status"))
    check("result.confidence present", "confidence" in res, f"{res.get('confidence')}%")
    check("result.bestMember present", "bestMember" in res, res.get("bestMember"))
    check("result.skillMatchScore present", "skillMatchScore" in res, res.get("skillMatchScore"))
    check("APAC Hardware routes to APAC group", "APAC" in str(res.get("finalGroup", "")), res.get("finalGroup"))
except Exception as e:
    check("POST /api/route hardware ticket", False, str(e))

# --- POST /api/route — GDPR hard constraint ---
try:
    body = json.dumps({
        "text": "I need access to payroll data for quarterly processing",
        "region": "EMEA", "asset": "Finance System",
        "channel": "Email", "userRole": "Manager"
    }).encode()
    req = urllib.request.Request(f"{BASE}/api/route", data=body, headers={"Content-Type": "application/json"})
    r = urllib.request.urlopen(req)
    res = json.loads(r.read().decode())
    check("POST /api/route GDPR hard constraint returns 200", r.status == 200)
    check("EMEA Finance locks to EMEA-Finance-Ops", res.get("finalGroup") == "EMEA-Finance-Ops", res.get("finalGroup"))
    check("Hard constraint triggered", len(res.get("hardConstraints", [])) > 0, str(res.get("hardConstraints")))
except Exception as e:
    check("POST /api/route GDPR constraint", False, str(e))

# --- POST /api/route — zero byte payload ---
try:
    body = json.dumps({
        "text": "", "region": "NA",
        "asset": "Hardware", "channel": "Portal", "userRole": "End User"
    }).encode()
    req = urllib.request.Request(f"{BASE}/api/route", data=body, headers={"Content-Type": "application/json"})
    r = urllib.request.urlopen(req)
    res = json.loads(r.read().decode())
    check("Zero-byte payload returns 200 (safe fallback)", r.status == 200)
    check("Zero-byte diverts to Manual-Review", res.get("finalGroup") == "Manual-Review", res.get("finalGroup"))
except Exception as e:
    check("POST /api/route zero-byte", False, str(e))

# --- POST /api/override ---
try:
    body = json.dumps({
        "ticketId": "TICK-SMOKE-001",
        "newGroup": "Global-SecOps",
        "reason": "Smoke test override",
        "actor": "Smoke Test Script"
    }).encode()
    req = urllib.request.Request(f"{BASE}/api/override", data=body, headers={"Content-Type": "application/json"})
    r = urllib.request.urlopen(req)
    res = json.loads(r.read().decode())
    check("POST /api/override returns 200", r.status == 200)
    check("override.status == 'OVERRIDDEN'", res.get("status") == "OVERRIDDEN", res.get("status"))
    check("override.ticketId echoed back", res.get("ticketId") == "TICK-SMOKE-001", res.get("ticketId"))
except Exception as e:
    check("POST /api/override", False, str(e))

print(f"\n{'='*50}")
passed = sum(results)
total = len(results)
tag = "OK" if passed == total else "WARN"
print(f"  [{tag}]  Result: {passed}/{total} checks passed")
print('='*50 + "\n")

sys.exit(0 if passed == total else 1)
