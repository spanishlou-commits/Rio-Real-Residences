#!/usr/bin/env python3
"""
Fetch properties from Resales Online XML feed, filter to target locations,
and save as data/resales-properties.json for the website.

Usage:
  python3 scripts/fetch-resales.py            # Full production fetch
  python3 scripts/fetch-resales.py --sandbox  # Test with sandbox data (200 properties)
"""

import sys
import os
import json
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────────

FEED_BASE = "https://xmlout.resales-online.com/live/Resales/Export/CreateXMLFeedV3.asp"
FEED_USER = "RESALES@MAPRFI2"
FEED_PASS = "74V03W7D22"
BATCH_SIZE = 500
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'resales-properties.json')

# Case-insensitive match against the <location> field (urbanisation level)
TARGET_LOCATIONS = {
    "rio real",           # feed: "Río Real"
    "torre real",
    "los monteros",
    "altos de los monteros",
    "bahia de marbella",  # feed: "Bahía de Marbella" (if accented)
    "lomas de pozuelo",
    "bello horizonte",
}

# ── URL builder ───────────────────────────────────────────────────────────────

def build_url(sandbox=False, reset=False, n=None):
    params = (
        f"U={FEED_USER}&P={FEED_PASS}"
        "&FV=2"            # Feed version 2 — richer field set
        "&LocationVersion=2"  # Adds municipality + location (urbanisation) fields
        "&Language=1"      # English descriptions
        "&IC=20"           # Up to 20 images per property
        "&CS=TRUE"         # Include annual cost details
        "&NPT=TRUE"        # New property type/subtype format
    )
    if sandbox:
        params += "&Sandbox=TRUE"
    elif reset:
        params += "&I=TRUE"   # Reset incremental flag → full feed
    if n:
        params += f"&N={n}"
    return f"{FEED_BASE}?{params}"

# ── XML helpers ───────────────────────────────────────────────────────────────

def normalise(s):
    """Lowercase + strip accents so 'Río Real' matches 'rio real'."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', s.lower())
        if unicodedata.category(c) != 'Mn'
    )

def tx(el, path, lang=None):
    """Get text from an XML path, optionally with a language sub-tag."""
    target = f"{path}/{lang}" if lang else path
    found = el.find(target)
    return found.text.strip() if found is not None and found.text else ""

def to_int(val):
    try:
        n = int(val)
        return n if n > 0 else None
    except (ValueError, TypeError):
        return None

def parse_images(prop):
    return [
        tx(img, 'url')
        for img in prop.findall('.//images/image')
        if tx(img, 'url')
    ]

def parse_features(prop):
    features = []
    for cat in prop.findall('.//characteristics/category'):
        for val in cat.findall('value'):
            uk = tx(val, 'uk')
            if uk:
                features.append(uk)
    return features

# ── Property mapper ───────────────────────────────────────────────────────────

def parse_property(prop):
    location    = tx(prop, 'location')      # urbanisation: "Rio Real", "Los Monteros" etc.
    municipality = tx(prop, 'municipality') # town: "Marbella"

    if normalise(location) not in TARGET_LOCATIONS:
        return None

    prop_id  = tx(prop, 'id')
    ref      = tx(prop, 'ref') or prop_id
    currency = tx(prop, 'currency') or 'EUR'
    status   = tx(prop, 'status') or 'Available'
    price    = to_int(tx(prop, 'price')) or 0

    prop_type = tx(prop, 'type', 'uk')    or tx(prop, 'type', 'es')
    subtype   = tx(prop, 'subtype', 'uk') or tx(prop, 'subtype', 'es')
    display_type = subtype if subtype else prop_type

    beds    = to_int(tx(prop, 'beds'))
    baths   = to_int(tx(prop, 'baths'))
    built   = to_int(tx(prop, 'surface_area/built'))
    plot    = to_int(tx(prop, 'surface_area/plot'))
    terrace = to_int(tx(prop, 'surface_area/terrace'))

    ibi       = to_int(tx(prop, 'annual_costs/ibi_fees'))
    garbage   = to_int(tx(prop, 'annual_costs/basura_tax'))
    community = to_int(tx(prop, 'annual_costs/community_fees'))

    description = tx(prop, 'description', 'uk')
    short_desc  = (
        description[:220].rsplit(' ', 1)[0] + '…'
        if len(description) > 220 else description
    )

    images = parse_images(prop)
    features = parse_features(prop)

    return {
        "id":           f"rso-{prop_id}",
        "source":       "resales",
        "resalesRef":   ref,
        "title":        f"{display_type} in {location}",
        "type":         display_type,
        "status":       "For Sale",
        "price":        price,
        "currency":     currency,
        "bedrooms":     beds  or 0,
        "bathrooms":    baths or 0,
        "built":        built,
        "plot":         plot,
        "terrace":      terrace,
        "pool":         tx(prop, 'has_pool')    == '1',
        "garden":       tx(prop, 'has_garden')  == '1',
        "garage":       tx(prop, 'has_garage')  == '1',
        "location":     f"{location}, Marbella East",
        "neighbourhood": location,
        "municipality": municipality,
        "shortDescription": short_desc,
        "description":  description,
        "features":     features,
        "costs": {
            "ibi":       f"€{ibi:,}/year"       if ibi       else None,
            "garbage":   f"€{garbage:,}/year"   if garbage   else None,
            "community": f"€{community:,}/year" if community else None,
        },
        "featured":     False,
        "images":       images,
        "thumbnail":    images[0] if images else "",
        "floorplan":    None,
    }

# ── Fetch helpers ─────────────────────────────────────────────────────────────

def fetch_xml(url):
    req = urllib.request.Request(
        url, headers={'User-Agent': 'RioRealResidences/1.0'}
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        return resp.read().decode('utf-8')

def parse_batch(xml_data):
    root = ET.fromstring(xml_data)
    return root.findall('property')

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    sandbox = '--sandbox' in sys.argv

    mode = 'SANDBOX' if sandbox else 'PRODUCTION'
    print(f"\nResales Online → {mode} fetch")
    print(f"Target locations: {', '.join(sorted(TARGET_LOCATIONS))}\n")

    all_properties = []
    total_seen = 0

    if sandbox:
        url = build_url(sandbox=True)
        print(f"URL: {url}\n")
        props = parse_batch(fetch_xml(url))
        total_seen = len(props)
        for p in props:
            parsed = parse_property(p)
            if parsed:
                all_properties.append(parsed)
        print(f"Scanned {total_seen} sandbox properties.")

    else:
        reset = True
        batch = 0
        while True:
            url = build_url(reset=reset, n=BATCH_SIZE)
            reset = False
            batch += 1
            print(f"Fetching batch {batch} ({BATCH_SIZE} properties)…")

            try:
                props = parse_batch(fetch_xml(url))
            except Exception as e:
                print(f"  Error fetching batch {batch}: {e}")
                break

            if not props:
                print("  Empty batch — feed complete.")
                break

            total_seen += len(props)
            before = len(all_properties)
            for p in props:
                parsed = parse_property(p)
                if parsed:
                    all_properties.append(parsed)

            matched = len(all_properties) - before
            print(f"  {len(props)} properties, {matched} matched ({total_seen} total scanned)")

            if len(props) < BATCH_SIZE:
                print("  Last batch reached.")
                break

    # Deduplicate by Resales ID
    seen_ids = set()
    unique = []
    for p in all_properties:
        if p['resalesRef'] not in seen_ids:
            seen_ids.add(p['resalesRef'])
            unique.append(p)

    # Deduplicate by property fingerprint (same physical property, different agents)
    # Built area rounded to nearest 10m² to absorb minor measurement differences
    seen_prints = set()
    deduped = []
    for p in unique:
        built_bucket = round((p['built'] or 0) / 10) * 10
        fingerprint = (p['price'], p['bedrooms'], p['neighbourhood'], built_bucket)
        if fingerprint not in seen_prints:
            seen_prints.add(fingerprint)
            deduped.append(p)
    removed = len(unique) - len(deduped)
    if removed:
        print(f"  Removed {removed} likely duplicate(s) (same property, multiple agents)")
    unique = deduped

    # Sort: highest price first
    unique.sort(key=lambda p: p['price'], reverse=True)

    # Summary by location
    by_loc = {}
    for p in unique:
        by_loc.setdefault(p['neighbourhood'], []).append(p)

    output = {
        "generated":    datetime.now().isoformat(),
        "source":       "Resales Online XML Feed",
        "sandbox":      sandbox,
        "total_scanned": total_seen,
        "count":        len(unique),
        "properties":   unique,
    }

    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_FILE)), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Saved {len(unique)} properties → {OUTPUT_FILE}")
    print(f"  Scanned {total_seen} total in feed\n")
    print("Properties by location:")
    for loc, props in sorted(by_loc.items()):
        print(f"  {loc}: {len(props)}")
    print()

if __name__ == '__main__':
    main()
