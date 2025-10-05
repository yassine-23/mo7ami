#!/usr/bin/env python3
"""
Legal Document Downloader for Mo7ami
Downloads Moroccan legal codes from verified official sources
"""

import os
import sys
import requests
from pathlib import Path
from typing import Dict, List
import time
from tqdm import tqdm

# Legal document sources (verified from research)
LEGAL_DOCUMENTS = {
    "moudawana": {
        "name": "Code de la Famille (Moudawana)",
        "name_ar": "مدونة الأسرة",
        "url": "https://www.kafala.fr/wp-content/uploads/2018/08/Code-de-la-famille-maroc.pdf",
        "filename": "moudawana.pdf",
        "domain": "family_law",
        "language": "fr",
        "priority": 1,
        "official_ref": "Dahir N° 1-04-22 du 12 hija 1424 (3 février 2004)"
    },
    "code_penal": {
        "name": "Code Pénal Marocain",
        "name_ar": "القانون الجنائي المغربي",
        "url": "https://www.onousc.ma/storage/code_penal.pdf",
        "filename": "code_penal.pdf",
        "domain": "penal_law",
        "language": "fr",
        "priority": 2,
        "official_ref": "Dahir n° 1-59-413 du 28 joumada II 1382 (26 novembre 1962)"
    },
    "code_travail": {
        "name": "Code du Travail",
        "name_ar": "مدونة الشغل",
        "url": "https://www.sgg.gov.ma/Portals/0/lois/code_travail_fr.pdf",
        "filename": "code_travail.pdf",
        "domain": "labor_law",
        "language": "fr",
        "priority": 3,
        "official_ref": "Loi n° 65-99 relative au Code du Travail"
    },
    "code_obligations_contrats": {
        "name": "Code des Obligations et des Contrats",
        "name_ar": "قانون الالتزامات والعقود",
        "url": "https://www.wipo.int/edocs/lexdocs/laws/fr/ma/ma064fr.pdf",
        "filename": "code_obligations_contrats.pdf",
        "domain": "civil_law",
        "language": "fr",
        "priority": 4,
        "official_ref": "Dahir du 9 ramadan 1331 (12 août 1913)"
    },
    "code_commerce": {
        "name": "Code de Commerce",
        "name_ar": "مدونة التجارة",
        "url": "https://rnesm.justice.gov.ma/Documentation/MA/3_TradeRecord_fr-FR.pdf",
        "filename": "code_commerce.pdf",
        "domain": "commercial_law",
        "language": "fr",
        "priority": 5,
        "official_ref": "Loi n° 15-95 formant Code de Commerce (Version consolidée 2019)"
    },
    "code_procedure_penale": {
        "name": "Code de Procédure Pénale",
        "name_ar": "قانون المسطرة الجنائية",
        "url": "https://www.ahjucaf.org/sites/default/files/2022-01/Code_procedure_penale_fr_0.pdf",
        "filename": "code_procedure_penale.pdf",
        "domain": "penal_law",
        "language": "fr",
        "priority": 6,
        "official_ref": "Loi n° 22-01 relative au Code de Procédure Pénale"
    },
    "code_procedure_civile": {
        "name": "Code de Procédure Civile",
        "name_ar": "قانون المسطرة المدنية",
        "url": "https://www.wipo.int/edocs/lexdocs/laws/fr/ma/ma018fr.pdf",
        "filename": "code_procedure_civile.pdf",
        "domain": "civil_law",
        "language": "fr",
        "priority": 7,
        "official_ref": "Dahir n° 1-74-447 du 11 ramadan 1394 (28 septembre 1974)"
    },
    "cgi_2024": {
        "name": "Code Général des Impôts 2024",
        "name_ar": "المدونة العامة للضرائب 2024",
        "url": "https://www.finances.gov.ma/Publication/dgi/2024/CG-2024-fr.pdf",
        "filename": "cgi_2024.pdf",
        "domain": "tax_law",
        "language": "fr",
        "priority": 8,
        "official_ref": "Code Général des Impôts - Edition 2024"
    },
    "protection_consommateur": {
        "name": "Loi sur la Protection du Consommateur",
        "name_ar": "قانون حماية المستهلك",
        "url": "https://wipolex-res.wipo.int/edocs/lexdocs/laws/fr/ma/ma077fr.pdf",
        "filename": "protection_consommateur.pdf",
        "domain": "consumer_law",
        "language": "fr",
        "priority": 9,
        "official_ref": "Loi n° 31-08 édictant des mesures de protection du consommateur"
    },
    "protection_donnees": {
        "name": "Loi sur la Protection des Données Personnelles",
        "name_ar": "قانون حماية البيانات الشخصية",
        "url": "https://www.cndp.ma/images/lois/Loi-09-08-Fr.pdf",
        "filename": "protection_donnees.pdf",
        "domain": "data_protection",
        "language": "fr",
        "priority": 10,
        "official_ref": "Loi n° 09-08 relative à la protection des personnes physiques"
    }
}

def download_file(url: str, output_path: Path, doc_name: str) -> bool:
    """Download a file with progress bar"""
    try:
        print(f"\n📥 Downloading: {doc_name}")
        print(f"   URL: {url}")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        response = requests.get(url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()

        total_size = int(response.headers.get('content-length', 0))

        with open(output_path, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=doc_name) as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))

        file_size = output_path.stat().st_size / (1024 * 1024)  # MB
        print(f"   ✅ Downloaded: {file_size:.2f} MB")
        return True

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error downloading {doc_name}: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def main():
    """Main download function"""
    print("=" * 80)
    print("🇲🇦 Mo7ami Legal Document Downloader")
    print("=" * 80)

    # Create data directory
    data_dir = Path(__file__).parent.parent / "backend" / "data" / "legal_docs"
    data_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n📁 Download directory: {data_dir}")
    print(f"📚 Total documents to download: {len(LEGAL_DOCUMENTS)}\n")

    # Sort by priority
    sorted_docs = sorted(
        LEGAL_DOCUMENTS.items(),
        key=lambda x: x[1]['priority']
    )

    results = {
        "success": [],
        "failed": []
    }

    for doc_id, doc_info in sorted_docs:
        output_path = data_dir / doc_info['filename']

        # Skip if already exists
        if output_path.exists():
            file_size = output_path.stat().st_size / (1024 * 1024)
            print(f"\n⏭️  Skipping {doc_info['name']} (already exists, {file_size:.2f} MB)")
            results["success"].append(doc_id)
            continue

        # Download
        success = download_file(doc_info['url'], output_path, doc_info['name'])

        if success:
            results["success"].append(doc_id)
        else:
            results["failed"].append(doc_id)

        # Rate limiting
        time.sleep(2)

    # Summary
    print("\n" + "=" * 80)
    print("📊 Download Summary")
    print("=" * 80)
    print(f"✅ Successfully downloaded: {len(results['success'])}")
    print(f"❌ Failed downloads: {len(results['failed'])}")

    if results["success"]:
        print("\n✅ Successful downloads:")
        for doc_id in results["success"]:
            print(f"   • {LEGAL_DOCUMENTS[doc_id]['name']}")

    if results["failed"]:
        print("\n❌ Failed downloads:")
        for doc_id in results["failed"]:
            print(f"   • {LEGAL_DOCUMENTS[doc_id]['name']}")
            print(f"     URL: {LEGAL_DOCUMENTS[doc_id]['url']}")

    print("\n" + "=" * 80)
    print(f"📁 Files saved to: {data_dir}")
    print("=" * 80)

    # Save metadata
    import json
    metadata_path = data_dir / "metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(LEGAL_DOCUMENTS, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Metadata saved to: {metadata_path}")

    return len(results["failed"]) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
