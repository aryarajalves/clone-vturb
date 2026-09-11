import sys
from pathlib import Path

# Adiciona a raiz do projeto ao path para importar o módulo scripts
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import pytest

try:
    from scripts.audit_security import run_backend_audit, run_frontend_audit
except ModuleNotFoundError:
    run_backend_audit = None
    run_frontend_audit = None

if run_backend_audit is None:
    pytest.skip("Módulo scripts.audit_security não disponível no ambiente atual", allow_module_level=True)

def test_audit_targets_exist():
    requirements_file = root_dir / "backend" / "requirements.txt"
    package_file = root_dir / "frontend" / "package.json"
    
    assert requirements_file.exists(), "backend/requirements.txt deve existir para o pip-audit"
    assert package_file.exists(), "frontend/package.json deve existir para o npm audit"

def test_audit_missing_file_handling():
    # Passando um diretório vazio deve retornar código de erro 1 sem quebrar
    fake_dir = root_dir / "non_existent_folder"
    assert run_backend_audit(fake_dir) == 1
    assert run_frontend_audit(fake_dir) == 1

