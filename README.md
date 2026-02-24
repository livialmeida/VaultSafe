# VaultSafe 🛡️

Este projeto é um **requisito obrigatório de formação** para o curso de **Engenharia de Software na Estácio** (previsão de graduação em Dezembro/2026).

## ⚖️ Do Direito à Engenharia: A Gênese do Projeto
Como bacharel em Direito (2019), minha percepção sobre o desenvolvimento de software é indissociável da proteção de dados e da privacidade. Para mim, não faria sentido conceber uma aplicação de armazenamento de informações que não tivesse a **segurança como pilar central**. 

O VaultSafe nasce da compreensão de que a violabilidade de senhas e dados documentais não é apenas uma falha técnica, mas um problema com implicações jurídicas severas nas esferas **cível e penal**. A exposição de dados sensíveis pode configurar desde danos morais e materiais até crimes de invasão de dispositivo informático, cruzando diretamente com os princípios de Segurança da Informação e, primordialmente, da **Cybersegurança**.

## 🛠️ Especificações Técnicas (Tech Stack)
O projeto foi desenvolvido sob o princípio de **Security by Design**, aplicando conhecimentos adquiridos em certificações e estudos na área de Cybersecurity, como autenticação robusta e proteção de dados.

* **Framework:** React Native com Expo (TypeScript).
* **Banco de Dados:** SQLite para persistência local estritamente offline.
* **Criptografia:** Implementação de AES-256 para proteção de dados em repouso.
* **Autenticação:** Integração com hardware de Biometria Nativa para controle de acesso (Gatekeeper).
* **Lifecycle Security:** Implementação de *Background Lock* (bloqueio automático ao minimizar o app).

## 🔒 Funcionalidades Implementadas
* **Gatekeeper de Inicialização:** Tela de splash personalizada com autenticação obrigatória via biometria ou senha do sistema.
* **Visualização Segura:** O conteúdo descriptografado só é exibido após nova validação biométrica e é limpo da memória após o uso.
* **CRUD Protegido:** Operações de criação, leitura e exclusão integradas diretamente ao motor de criptografia.

---
**Lívia Almeida**
- Estudante de Engenharia de Software (Estácio)
- Bacharel em Direito*
