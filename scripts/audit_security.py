# -*- coding: utf-8 -*-
"""
Script de Auditoria de Seguranca Integrada (Backend + Frontend) - ProjetoVturb
Verifica vulnerabilidades conhecidas em:
  1. Backend (Python): pip-audit no backend/requirements.txt
  2. Frontend (React / Vite): npm audit no frontend/package.json

Uso: python scripts/audit_security.py
"""

import os
import sys
import subprocess
from pathlib import Path

# Ajusta stdout/stderr para UTF-8 no terminal Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Forca UTF-8 no ambiente
os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"

def run_backend_audit(root_dir: Path) -> int:
    requirements_file = root_dir / "backend" / "requirements.txt"
    if not requirements_file.exists():
        requirements_file = root_dir / "requirements.txt"

    if not requirements_file.exists():
        print(f"[ERRO] Arquivo não encontrado: {requirements_file}")
        return 1

    print("\n" + "=" * 70)
    print("🐍 [1/2] AUDITORIA DE DEPENDÊNCIAS DO BACKEND (pip-audit)")
    print(f"Alvo: {requirements_file}")
    print("Consultando bases oficiais de vulnerabilidades (OSV / PyPI)...")
    print("=" * 70)

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    cmd = [
        sys.executable,
        "-X",
        "utf8",
        "-m",
        "pip_audit",
        "-r",
        str(requirements_file),
        "--progress-spinner",
        "off"
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env
        )

        if result.stdout:
            filtered_out = [
                line for line in result.stdout.splitlines()
                if line.strip()
            ]
            if filtered_out:
                print("\n".join(filtered_out))

        if result.stderr:
            filtered_errors = [
                line for line in result.stderr.splitlines()
                if "RequestsDependencyWarning" not in line and "Cache entry deserialization failed" not in line
            ]
            if filtered_errors:
                print("\n".join(filtered_errors))

        if result.returncode == 0:
            print("\n✅ [BACKEND OK] Nenhuma vulnerabilidade conhecida no Python!")
            return 0
        else:
            print("\n❌ [BACKEND AVISO] Foram encontradas vulnerabilidades no Backend.")
            return result.returncode

    except Exception as exc:
        print(f"\n[ERRO] Falha ao executar o pip-audit: {exc}")
        return 1


def run_frontend_audit(root_dir: Path) -> int:
    frontend_dir = root_dir / "frontend"
    if not frontend_dir.exists():
        frontend_dir = root_dir
    package_file = frontend_dir / "package.json"

    if not package_file.exists():
        print(f"[ERRO] Arquivo não encontrado: {package_file}")
        return 1

    print("\n" + "=" * 70)
    print("⚛️ [2/2] AUDITORIA DE DEPENDÊNCIAS DO FRONTEND (npm audit)")
    print(f"Alvo: {package_file}")
    print("Consultando base de segurança oficial do NPM (GitHub Advisory Database)...")
    print("=" * 70)

    # Executa npm audit na pasta frontend
    try:
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        result = subprocess.run(
            [npm_cmd, "audit"],
            cwd=str(frontend_dir),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=(os.name == "nt")
        )

        output_text = (result.stdout or "") + ("\n" + result.stderr if result.stderr else "")
        filtered_lines = [
            line for line in output_text.splitlines()
            if "npm fund" not in line and line.strip()
        ]
        if filtered_lines:
            print("\n".join(filtered_lines))

        if result.returncode == 0 or "found 0 vulnerabilities" in output_text:
            print("\n✅ [FRONTEND OK] Nenhuma vulnerabilidade conhecida no React / NPM!")
            return 0
        else:
            print("\n❌ [FRONTEND AVISO] Foram encontradas vulnerabilidades no Frontend.")
            return result.returncode

    except Exception as exc:
        print(f"[ERRO] Falha ao executar npm audit: {exc}")
        return 1


def run_full_security_audit() -> int:
    root_dir = Path(__file__).resolve().parent.parent

    print("\n" + "=" * 70)
    print("🛡️  INICIANDO AUDITORIA DE SEGURANÇA COMPLETA (BACKEND + FRONTEND)")
    print(f"Projeto: ProjetoVturb")
    print("=" * 70)

    backend_code = run_backend_audit(root_dir)
    frontend_code = run_frontend_audit(root_dir)

    print("\n" + "=" * 70)
    print("📊 RESUMO GERAL DA AUDITORIA DE SEGURANÇA")
    print("=" * 70)

    b_status = "✅ SEGURO (0 vulnerabilidades)" if backend_code == 0 else "❌ FALHAS ENCONTRADAS"
    f_status = "✅ SEGURO (0 vulnerabilidades)" if frontend_code == 0 else "❌ FALHAS ENCONTRADAS"

    print(f"• Backend (Python / pip-audit): {b_status}")
    print(f"• Frontend (React / npm audit):  {f_status}")
    print("=" * 70)

    if backend_code == 0 and frontend_code == 0:
        print("🎉 [SUCESSO TOTAL] O projeto está 100% livre de vulnerabilidades conhecidas!\n")
        return 0
    else:
        print("⚠️  [ATENÇÃO] Corrija as dependências acima antes de enviar ao repositório.\n")
        return 1


if __name__ == "__main__":
    sys.exit(run_full_security_audit())
