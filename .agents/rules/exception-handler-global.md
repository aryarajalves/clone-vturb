---
trigger: always_on
---

# Regra de Exception Handler Global (Backend)

O `main.py` deve sempre conter um handler global de exceções para garantir que erros inesperados retornem uma resposta JSON padronizada, sem expor stack traces ao frontend.

**Protocolo Obrigatório:**

1. **Handler global no main.py:** O handler captura qualquer `Exception` não tratada pelos routers:
```python
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro inesperado em {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Tente novamente mais tarde."}
    )
```

2. **Nunca remover o handler existente do RateLimitExceeded** — ele deve coexistir com o handler global.

3. **Formato padronizado de erro:** Todo erro deve retornar `{"detail": "<mensagem>"}` para que o frontend possa tratar de forma uniforme com `error.response?.data?.detail`.

4. **HTTPException não é capturada pelo handler global** — erros intencionais lançados pelos routers com `raise HTTPException(...)` continuam funcionando normalmente.

5. **Log obrigatório:** O handler deve sempre registrar o erro via `logger.error` antes de responder, incluindo o método HTTP e o path da requisição para facilitar o diagnóstico.

**O que este handler NÃO substitui:**
- Validações de negócio nos routers (continuam usando `HTTPException`).
- Verificação de plano PRO/LITE (continua no router com `403`).

**Benefício:** O frontend nunca recebe um HTML de erro do Python ou um JSON sem o campo `detail`, eliminando crashes silenciosos na interface.
