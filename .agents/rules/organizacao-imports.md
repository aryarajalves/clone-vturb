# Regra de Organização e Ordenação de Imports

Para manter o código limpo, legível e padronizado, todos os arquivos de código (Python, JavaScript, TypeScript, etc.) devem organizar seus imports estritamente no topo do arquivo, divididos em três grupos bem definidos e separados por uma linha em branco.

**Protocolo Obrigatório:**

1. **Localização:** Todos os imports devem ficar obrigatoriamente no topo do arquivo.
2. **Separação em 3 Grupos:**
   - **Grupo 1: Bibliotecas Padrão da Linguagem (Standard Library)**
     - Ex (Python): `os`, `sys`, `json`, `datetime`, `typing`, etc.
     - Ex (JS/TS): `path`, `fs`, etc.
   - **Grupo 2: Bibliotecas Externas (Third-Party / Packages)**
     - Ex (Python): `fastapi`, `sqlalchemy`, `pydantic`, `pika`, etc.
     - Ex (JS/TS): `react`, `axios`, `express`, etc.
   - **Grupo 3: Módulos e Classes Locais (Local Imports / Project Files)**
     - Imports de componentes, utilitários, rotas, modelos e classes do próprio projeto.
     - Ex (Python): `from core.database import get_db`, `from models import User`
     - Ex (JS/TS): `import Button from './components/Button'`, `import { api } from './services/api'`

3. **Formatação Visual:**
   - Cada grupo deve ser separado do outro por exatamente **uma linha em branco**.
   - Dentro de cada grupo, opcionalmente, os imports devem ser ordenados de forma lógica ou alfabética para facilitar a leitura.

**Exemplo Prático (Python):**
```python
# Grupo 1: Bibliotecas padrão do Python
import os
import sys
from typing import List

# Grupo 2: Bibliotecas externas
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Grupo 3: Arquivos e módulos locais do projeto
from core.database import get_db
from models.user import User
```
