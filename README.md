# Sistema de Backup e Disaster Recovery Multi-Cloud

## Visão Geral

Este projeto implementa uma solução completa de Backup e Disaster Recovery (DR) para múltiplos provedores de nuvem (AWS, Azure e GCP), gerenciada através de um painel administrativo. A solução utiliza Terraform para orquestrar a infraestrutura de backup e restauração, garantindo consistência entre diferentes provedores de nuvem.

## Principais Recursos

- **Painel Administrativo** com interface para gerenciamento de clientes, backups e operações de DR
- **Infraestrutura como Código** utilizando Terraform para provisionamento e gestão dos recursos de backup
- **Suporte Multi-Cloud** para AWS, Azure e Google Cloud Platform
- **Monitoramento e Relatórios** de custos, desempenho e status dos backups
- **Testes de DR** automatizados para validar procedimentos de recuperação
- **APIs RESTful** para integração com sistemas externos

## Diagrama de Arquitetura

```
+------------------------------------------+
|                                          |
|            PAINEL ADMIN (Frontend)       |
|                                          |
+------------------+---------------------+
                  |
                  v
+------------------------------------------+
|                                          |
|            PAINEL ADMIN (Backend)        |
|                                          |
+------------------+---------------------+
                  |
                  v
+------------------+---------------------+
|                                          |
|            TERRAFORM API                 |
|                                          |
+--------+-------------+------------------+
         |             |                  |
         v             v                  v
+-------------+  +-----------+  +------------------+
|    AWS      |  |   AZURE   |  |       GCP        |
|  MODULES    |  |  MODULES  |  |     MODULES      |
+-------------+  +-----------+  +------------------+
```

## Fluxo de Disaster Recovery

```
+-------------------+     +-------------------+     +--------------------+
| Detecção Desastre |---->| Avaliação Impacto |---->| Declaração de DR   |
+-------------------+     +-------------------+     +--------------------+
                                                          |
                                                          v
+-------------------+     +-------------------+     +--------------------+
| Validação         |<----| Restauração       |<----| Inicialização      |
| Pós-Restauração   |     | de Dados/Sistemas |     | Plano de DR        |
+-------------------+     +-------------------+     +--------------------+
        |
        v
+-------------------+     +-------------------+
| Retorno à         |---->| Análise           |
| Operação Normal   |     | Pós-Incidente     |
+-------------------+     +-------------------+
```

## Estrutura do Projeto

```
admin-panel/               # Painel administrativo
  backend/                 # API backend para o painel
    config/                # Configurações do servidor
    controllers/           # Controladores da API
    middleware/            # Middleware (autenticação, etc.)
    models/                # Modelos de dados
    routes/                # Rotas da API
    services/              # Serviços de negócios
    utils/                 # Utilitários
  frontend/                # Interface de usuário React
    public/                # Arquivos estáticos
    src/                   # Código fonte do frontend
      components/          # Componentes React
      contexts/            # Contextos React
      pages/               # Páginas da aplicação
      services/            # Serviços para comunicação com a API
      utils/               # Utilitários

terraform-api/             # API para gerenciamento do Terraform

core/                      # Configurações principais do Terraform
  main.tf                  # Arquivo principal do Terraform

examples/                  # Exemplos de configuração
  aws_ec2_rds_backup.tf    # Exemplo para AWS
  multi_cloud_backup.tf    # Exemplo multi-cloud
  complete_multi_cloud_backup.tf # Exemplo completo

modules/                   # Módulos Terraform reutilizáveis
  aws/                     # Módulos para AWS
    backup_plan.tf         # Configuração de planos de backup
    backup_vault.tf        # Configuração de vault de backup
    iam_roles.tf           # Configuração de IAM
    restore/               # Módulos para restauração
  azure/                   # Módulos para Azure
    recovery_vault.tf      # Configuração de vault de recuperação
    vm_backup.tf           # Backup de VMs
    restore/               # Módulos para restauração
  gcp/                     # Módulos para Google Cloud
    backup_service.tf      # Serviço de backup
    storage_backup.tf      # Backup de storage
    restore/               # Módulos para restauração
```

## Pré-requisitos

- Node.js 14.x ou superior
- MongoDB 4.x ou superior
- Terraform 1.0.x ou superior
- Contas ativas em AWS, Azure e/ou GCP com permissões adequadas

## Instalação

### Backend

```bash
# Navegar para o diretório do backend
cd admin-panel/backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente (crie um arquivo .env baseado no exemplo)
cp .env.example .env

# Iniciar o servidor em modo de desenvolvimento
npm run dev
```

### Frontend

```bash
# Navegar para o diretório do frontend
cd admin-panel/frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

### Terraform

Certifique-se de ter o Terraform instalado e configurado corretamente com as credenciais para os provedores de nuvem que deseja utilizar.

```bash
# Testar a configuração do Terraform
cd core
terraform init
terraform validate
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no diretório `admin-panel/backend` com as seguintes variáveis:

```
# Configuração do servidor
PORT=3001
NODE_ENV=development

# Configuração do MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/backup-saas

# Configuração JWT
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRES=1d

# Credenciais AWS
AWS_ACCESS_KEY_ID=sua-chave-aqui
AWS_SECRET_ACCESS_KEY=seu-segredo-aqui
AWS_REGION=us-east-1

# Credenciais Azure
AZURE_SUBSCRIPTION_ID=seu-id-aqui
AZURE_TENANT_ID=seu-tenant-aqui
AZURE_CLIENT_ID=seu-client-id-aqui
AZURE_CLIENT_SECRET=seu-segredo-aqui

# Credenciais GCP
GCP_PROJECT_ID=seu-projeto-aqui
GCP_CREDENTIALS_FILE=caminho-para-arquivo-credenciais
```

### Criação de Usuário Administrador

Execute o script de criação de admin para configurar o primeiro usuário:

```bash
cd admin-panel/backend
node create-admin.js
```

## Uso

1. Acesse o painel administrativo em http://localhost:3000
2. Faça login com as credenciais de administrador
3. Adicione clientes e configure suas políticas de backup
4. Monitore o status dos backups e custos no dashboard

## Desenvolvimento

### Estrutura do Backend

- **Controllers**: Lógica de manipulação de requisições
- **Services**: Lógica de negócios
- **Models**: Definição dos modelos de dados
- **Routes**: Definição das rotas da API
- **Middleware**: Funções de middleware (autenticação, validação, etc.)

### Estrutura do Frontend

- **Components**: Componentes React reutilizáveis
- **Pages**: Páginas da aplicação
- **Contexts**: Contextos React para estado global
- **Services**: Funções para comunicação com a API

### Terraform

- **Core**: Configuração principal do Terraform
- **Modules**: Módulos reutilizáveis para cada provedor de nuvem
- **Examples**: Exemplos de configuração para diferentes cenários

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Roadmap

- [ ] Implementação de autenticação multi-fator (MFA)
- [ ] Adição de relatórios avançados de custos e performance
- [ ] Integração com sistemas de alertas (PagerDuty, Slack)
- [ ] Suporte para backups on-premise (VMware, Hyper-V)
- [ ] Implementação de testes automatizados de infraestrutura

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Contato

Para questões, suporte ou feedback, entre em contato com a equipe de desenvolvimento em [equipe@exemplo.com]