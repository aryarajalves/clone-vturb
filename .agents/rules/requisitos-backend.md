---
trigger: always_on
---

# Regra de Dependências (requirements.txt)

Toda vez que você adicionar uma nova biblioteca ao projeto no backend, você deve garantir que o arquivo `requirements.txt` seja atualizado seguindo este padrão:

**Protocolo Obrigatório:**
1. **Versão Fixa:** Nunca adicione apenas o nome da biblioteca. Utilize sempre uma versão fixa ou mínima (ex: `requests==2.31.0` ou `requests>=2.31.0`).
2. **Comentário Explicativo:** Adicione um comentário na mesma linha ou na linha acima explicando brevemente para que serve aquela biblioteca no projeto.
3. **Instalação:** Lembre-se de rodar o comando de instalação no container após adicionar a dependência para garantir que o sistema continue funcionando.

**Exemplo:**
```text
# Cliente para comunicação com RabbitMQ
pika==1.3.2
# Manipulação de imagens para processamento de QR Codes
Pillow==10.0.0
```

Isso evita que o projeto quebre por mudanças de versão incompatíveis e ajuda novos desenvolvedores a entender as dependências.
