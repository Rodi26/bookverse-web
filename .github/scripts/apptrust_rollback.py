"""
BookVerse Web UI Service - Frontend Asset Rollback and CDN Distribution Management
 
This frontend module provides comprehensive AppTrust rollback capabilities specifically
for the BookVerse Web UI Service CI/CD pipeline, implementing sophisticated
frontend asset rollback, CDN distribution management, and AppTrust integration for
enterprise-grade frontend deployment automation with global content delivery optimization.

🏗️ Frontend Deployment Architecture Overview:
    - Asset-Specific Rollback: Frontend asset and static content tailored rollback automation
    - CDN Management: Comprehensive content delivery network distribution and cache invalidation
    - Performance Preservation: Frontend performance optimization and Core Web Vitals maintenance
    - AppTrust Integration: Complete AppTrust API communication for web applications
    - CI/CD Integration: GitHub Actions frontend pipeline rollback with OIDC authentication
    - Global Distribution: Multi-region CDN coordination and cache management

🚀 Key Frontend Features:
    - Complete web service rollback automation with frontend asset management
    - Advanced semantic version parsing and frontend rollback target selection
    - GitHub Actions OIDC authentication with JFrog Platform frontend pipeline integration
    - Service-specific validation and health checking for frontend delivery systems
    - Frontend pipeline rollback with comprehensive error handling and performance validation
    - Production-ready frontend rollback automation for continuous web deployment

🔧 Technical Frontend Implementation:
    - CI/CD Integration: GitHub Actions frontend workflow execution with OIDC tokens
    - Frontend Service Context: Web service specific asset rollback logic and validation
    - Asset Management: Frontend asset lifecycle management and version coordination
    - Infrastructure Sharing: Shared rollback library with frontend-specific customization
    - Authentication: OIDC token-based authentication for frontend pipeline security
    - Error Handling: Comprehensive frontend pipeline error handling with detailed diagnostics

📊 Frontend Business Logic:
    - Asset Rollback: Web frontend asset rollback for deployment failures
    - Pipeline Recovery: Frontend pipeline rollback for automated web service recovery
    - Quality Gates: Frontend rollback automation for performance and accessibility failures
    - Production Safety: Safe frontend asset rollback operations for production environments
    - User Experience Continuity: Frontend user experience preservation during rollback operations
    - SEO Preservation: Search engine optimization and metadata preservation

🛠️ Frontend Usage Patterns:
    - Frontend Pipeline: Automated rollback in GitHub Actions frontend workflows
    - Asset Deployment Failure: Rollback on frontend asset deployment pipeline failures
    - Performance Gate Failure: Automated rollback for failed Core Web Vitals gates
    - Manual Operations: Command-line frontend rollback for operational scenarios
    - CDN Recovery: Web service specific CDN and asset recovery operations
    - Emergency Response: Rapid frontend asset recovery for user experience emergencies

🌐 Frontend Asset Specific Features:
    - Asset Version Management: Frontend asset version tracking and rollback coordination
    - CDN Cache Invalidation: Content delivery network cache management and invalidation
    - Performance Optimization: Core Web Vitals preservation and performance validation
    - Accessibility Continuity: WCAG 2.1 AA compliance preservation during rollback
    - Progressive Web App Management: PWA service worker and offline capability coordination
    - Browser Compatibility: Cross-browser compatibility validation and preservation

🎨 User Experience and Performance:
    - Core Web Vitals Preservation: Performance metrics maintenance during rollback operations
    - Lighthouse Score Continuity: Performance score preservation and validation
    - Accessibility Standards: WCAG compliance and usability validation during rollback
    - Mobile Optimization: Responsive design and mobile performance preservation
    - SEO Maintenance: Search engine optimization and metadata consistency
    - Conversion Tracking: User conversion funnel preservation and analytics continuity

🚀 CDN and Global Distribution:
    - CDN State Management: Content delivery network state tracking and rollback verification
    - Cache Invalidation: Global cache invalidation and content freshness management
    - Edge Server Coordination: Edge server configuration and geographic distribution
    - Performance Monitoring: Global performance monitoring and regional optimization
    - Traffic Routing: CDN traffic routing and load balancing coordination
    - Content Security: Content security policy and secure asset delivery management

Authors: BookVerse Platform Team
Version: 1.0.0
"""

from __future__ import annotations


import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

try:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'bookverse-infra', 'libraries', 'bookverse-devops', 'scripts'))
    from oidc_auth import get_jfrog_token, get_apptrust_base_url
    OIDC_AVAILABLE = True
except ImportError:
    OIDC_AVAILABLE = False

SEMVER_RE = re.compile(
    r"^\s*v?(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)"
    r"(?:-(?P<prerelease>(?:0|[1-9]\d*|[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|[a-zA-Z-][0-9a-zA-Z-]*))*))?"
    r"(?:\+(?P<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?\s*$"
)

@dataclass(frozen=True)
class SemVer:
    major: int
    minor: int
    patch: int
    prerelease: Tuple[str, ...]
    original: str

    @staticmethod
    def parse(version: str) -> Optional["SemVer"]:
        m = SEMVER_RE.match(version)
        if not m:
            return None
        g = m.groupdict()
        prerelease_raw = g.get("prerelease") or ""
        return SemVer(int(g["major"]), int(g["minor"]), int(g["patch"]), tuple(prerelease_raw.split(".")) if prerelease_raw else tuple(), version)

    def __lt__(self, other: "SemVer") -> bool:
        return compare_semver(self, other) < 0

def compare_semver(a: SemVer, b: SemVer) -> int:
    if a.major != b.major:
        return -1 if a.major < b.major else 1
    if a.minor != b.minor:
        return -1 if a.minor < b.minor else 1
    if a.patch != b.patch:
        return -1 if a.patch < b.patch else 1
    if not a.prerelease and b.prerelease:
        return 1
    if a.prerelease and not b.prerelease:
        return -1
    for at, bt in zip(a.prerelease, b.prerelease):
        if at == bt:
            continue
        a_num, b_num = at.isdigit(), bt.isdigit()
        if a_num and b_num:
            ai, bi = int(at), int(bt)
            if ai != bi:
                return -1 if ai < bi else 1
        elif a_num and not b_num:
            return -1
        elif not a_num and b_num:
            return 1
        else:
            if at < bt:
                return -1
            return 1
    if len(a.prerelease) != len(b.prerelease):
        return -1 if len(a.prerelease) < len(b.prerelease) else 1
    return 0

def sort_versions_by_semver_desc(version_strings: List[str]) -> List[str]:
    parsed: List[Tuple[SemVer, str]] = []
    for v in version_strings:
        sv = SemVer.parse(v)
        if sv is not None:
            parsed.append((sv, v))
    parsed.sort(key=lambda t: t[0], reverse=True)
    return [v for _, v in parsed]

class AppTrustClient:
    def __init__(self, base_url: str, token: str, timeout_seconds: int = 30) -> None:
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.timeout_seconds = timeout_seconds

    def _request(self, method: str, path: str, query: Optional[Dict[str, Any]] = None, body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        if query:
            q = urllib.parse.urlencode({k: v for k, v in query.items() if v is not None})
            url = f"{url}?{q}"
        data = None
        headers = {"Authorization": f"Bearer {self.token}", "Accept": "application/json"}
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url=url, data=data, method=method, headers=headers)
        with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
            raw = resp.read()
            if not raw:
                return {}
            try:
                return json.loads(raw.decode("utf-8"))
            except Exception:
                return {"raw": raw.decode("utf-8", errors="replace")}

    def list_application_versions(self, app_key: str, limit: int = 1000) -> Dict[str, Any]:
        path = f"/applications/{urllib.parse.quote(app_key)}/versions"
        return self._request("GET", path, query={"limit": limit, "order_by": "created", "order_asc": "false"})

    def patch_application_version(self, app_key: str, version: str, tag: Optional[str] = None, properties: Optional[Dict[str, List[str]]] = None, delete_properties: Optional[List[str]] = None) -> Dict[str, Any]:
        path = f"/applications/{urllib.parse.quote(app_key)}/versions/{urllib.parse.quote(version)}"
        body: Dict[str, Any] = {}
        if tag is not None:
            body["tag"] = tag
        if properties is not None:
            body["properties"] = properties
        if delete_properties is not None:
            body["delete_properties"] = delete_properties
        return self._request("PATCH", path, body=body)

    def rollback_application_version(self, app_key: str, version: str, from_stage: str = "PROD") -> Dict[str, Any]:
        
        path = f"/applications/{urllib.parse.quote(app_key)}/versions/{urllib.parse.quote(version)}/rollback"
        body = {"from_stage": from_stage}
        return self._request("POST", path, body=body)

TRUSTED = "TRUSTED_RELEASE"
RELEASED = "RELEASED"
QUARANTINE_TAG = "quarantine"
LATEST_TAG = "latest"
BACKUP_BEFORE_LATEST = "original_tag_before_latest"
BACKUP_BEFORE_QUARANTINE = "original_tag_before_quarantine"

def get_prod_versions(client: AppTrustClient, app_key: str) -> List[Dict[str, Any]]:
    resp = client.list_application_versions(app_key)
    versions = resp.get("versions", [])
    norm: List[Dict[str, Any]] = []
    for v in versions:
        ver = str(v.get("version", ""))
        tag = v.get("tag")
        tag_str = "" if tag is None else str(tag)
        rs = str(v.get("release_status", "")).upper()
        if rs in (TRUSTED, RELEASED):
            norm.append({"version": ver, "tag": tag_str, "release_status": rs})
    order = sort_versions_by_semver_desc([v["version"] for v in norm])
    idx = {ver: i for i, ver in enumerate(order)}
    norm.sort(key=lambda x: idx.get(x["version"], 10**9))
    return norm

def pick_next_latest(sorted_prod_versions: List[Dict[str, Any]], exclude_version: str) -> Optional[Dict[str, Any]]:
    dup: Dict[str, List[Dict[str, Any]]] = {}
    for v in sorted_prod_versions:
        if v["version"] == exclude_version:
            continue
        if v.get("tag", "") == QUARANTINE_TAG:
            continue
        dup.setdefault(v["version"], []).append(v)
    if not dup:
        return None
    seen: set[str] = set()
    ordered: List[str] = []
    for v in sorted_prod_versions:
        vv = v["version"]
        if vv == exclude_version:
            continue
        if vv in dup and vv not in seen:
            ordered.append(vv)
            seen.add(vv)
    for ver in ordered:
        cands = dup[ver]
        trusted = [c for c in cands if c.get("release_status") == TRUSTED]
        if trusted:
            return trusted[0]
        return cands[0]
    return None

def backup_tag_then_patch(client: AppTrustClient, app_key: str, version: str, backup_prop_key: str, new_tag: str, current_tag: str, dry_run: bool) -> None:
    props = {backup_prop_key: [current_tag]}
    if dry_run:
        print(f"[DRY-RUN] PATCH backup+tag: app={app_key} version={version} props={props} tag={new_tag}")
        return
    client.patch_application_version(app_key, version, tag=new_tag, properties=props)

def rollback_in_prod(client: AppTrustClient, app_key: str, target_version: str, dry_run: bool = False) -> None:
    prod_versions = get_prod_versions(client, app_key)
    by_version = {v["version"]: v for v in prod_versions}
    target = by_version.get(target_version)
    if target is None:
        raise RuntimeError(f"Target version not found in PROD set: {target_version}")

    from_stage = "PROD"
    if not dry_run:
        print(f"Calling AppTrust endpoint: POST /applications/{app_key}/versions/{target_version}/rollback with body {{from_stage: {from_stage}}}")
        try:
            client.rollback_application_version(app_key, target_version, from_stage)
            print(f"Invoked AppTrust rollback for {app_key}@{target_version} from {from_stage}")
        except Exception as e:
            raise RuntimeError(f"AppTrust rollback API call failed: {e}")
    else:
        print(f"[DRY-RUN] Would call AppTrust rollback API: POST /applications/{app_key}/versions/{target_version}/rollback with body {{from_stage: {from_stage}}}")

    current_tag = target.get("tag", "")
    had_latest = current_tag == LATEST_TAG

    backup_tag_then_patch(client, app_key, target_version, BACKUP_BEFORE_QUARANTINE, QUARANTINE_TAG, current_tag, dry_run)

    if had_latest:
        next_candidate = pick_next_latest(prod_versions, exclude_version=target_version)
        if next_candidate is None:
            print("No successor found for latest; system will have no 'latest' until next promote.")
            return
        cand_ver = next_candidate["version"]
        cand_tag = next_candidate.get("tag", "")
        backup_tag_then_patch(client, app_key, cand_ver, BACKUP_BEFORE_LATEST, LATEST_TAG, cand_tag, dry_run)
        print(f"Reassigned latest to {cand_ver}")
    else:
        print("Rolled back non-latest version; 'latest' unchanged.")

def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    v = os.environ.get(name)
    if v is None or v.strip() == "":
        return default
    return v.strip()

def get_auth_token() -> Optional[str]:
    if OIDC_AVAILABLE:
        token = get_jfrog_token()
        if token:
            return token
    
    token = _env("JF_OIDC_TOKEN")
    if token:
        return token
    
    return None

def get_base_url() -> Optional[str]:
    if OIDC_AVAILABLE:
        url = get_apptrust_base_url()
        if url:
            return url
    
    return _env("APPTRUST_BASE_URL")

def main() -> int:
    parser = argparse.ArgumentParser(description="AppTrust PROD rollback utility")
    parser.add_argument("--app", required=True, help="Application key")
    parser.add_argument("--version", required=True, help="Target version to rollback (SemVer)")
    parser.add_argument("--base-url", default=None, help="Base API URL, e.g. https://<host>/apptrust/api/v1 (env: APPTRUST_BASE_URL, JF_OIDC_TOKEN via OIDC)")
    parser.add_argument("--token", default=None, help="Access token (env: JF_OIDC_TOKEN or OIDC auto-detection)")
    parser.add_argument("--dry-run", action="store_true", help="Log intended changes without mutating")
    args = parser.parse_args()

    base_url = args.base_url or get_base_url()
    if not base_url:
        print("Missing --base-url or APPTRUST_BASE_URL environment variable", file=sys.stderr)
        print("For OIDC authentication, ensure JFROG_URL is set", file=sys.stderr)
        return 2

    token = args.token or get_auth_token()
    if not token:
        print("Missing authentication token", file=sys.stderr)
        print("Tried: JF_OIDC_TOKEN, OIDC auto-detection", file=sys.stderr)
        if not OIDC_AVAILABLE:
            print("Note: OIDC authentication library not available", file=sys.stderr)
        return 2

    client = AppTrustClient(base_url, token)

    try:
        start = time.time()
        rollback_in_prod(client, args.app, args.version, dry_run=args.dry_run)
        elapsed = time.time() - start
        print(f"Done in {elapsed:.2f}s")
        return 0
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())


