📱 Airport Agent (React Native + Expo)

Aplicativo para operações em solo (check-in, embarque, pista, malha, etc.). Demonstra navegação, FlatList otimizada, recursos nativos (câmera, GPS, rede, e-mail), geração de PDF e integração com back-end.

Credenciais de teste

Usuário: valmiran@gmail.com

Senha: 9347hpvoo!

✨ Principais funcionalidades

Login com validação (e-mail/senha).

Dashboard com atalhos para LL, Processos, Voos, Operações e Malha.

Processos de bagagem (AHL/DPR/OHD): CRUD, validações (react-hook-form + zod), status (aberto/observação/finalizado/vencido), regras de prazo (4d aviso, 5d vencido, 31d exclusão pós-finalização), bloqueio de duplicidade por nº do processo.

LL (Propriedades Perdidas): cadastro com PIN, data, local e descrição; alerta em 10 dias.

Voos: cadastro rápido (Nº, OD, Hora), notificação local T-15.

Operações

Listagem (FlatList): dados locais (mock) e opção de buscar do back-end.

AQD – Reporte de Segurança: foto + descrição + GPS/Rede → e-mail preenchido.

Conectividade: tipo de rede e IP + coordenadas atuais.

Malha da Operação: formulário guiado (valida obrigatórios), cadastro incremental de pessoas, voos (chegadas/partidas) e geração de PDF (salvar/compartilhar).

Barra superior dinâmica (marquee): resumo de processos/voos com atualização via event bus.

🧭 Navegação

Fluxo: Login → Tabs (protegidas)

Bottom Tabs: Dashboard | LL | Processos | Voos | Operações | Malha

Operações (Stack interno): Listagem (FlatList) | AQD | Conectividade

No Dashboard, botões levam direto às telas do Stack Operações.

🖱️ Como usar (por tela) Dashboard

Acesse áreas (LL, Processos, Voos…) ou atalhos: Listagem, AQD, Conectividade.

Voos (Acompanhar)

Preencha Nº, Origem/Destino (REC/VCP) e Hora (HH:MM).

O app formata “HH:MM” e valida 24h.

Ao cadastrar, agenda notificação local 15 minutos antes do horário.

Listagem (FlatList)

Mostra cards de Voos e Processos.

Buscar: carrega dos endpoints (ex.: /api/voos/, /api/processos/).

Ajuste API_VOOS / API_PROCESSOS em ItemsScreen.tsx.

AQD – Reporte de Segurança

Foto (câmera) + Descrição + coleta de GPS/Rede.

Abre o cliente de e-mail já preenchido (com anexo e metadados).

Configure o e-mail do time: AQDReportScreen.tsx → SECURITY_EMAIL.

Conectividade (GPS/Rede)

Exibe lat/lon e tipo de rede/IP local — útil para auditorias e anexos.

Malha da Operação

Fluxo guiado:

Equipe (obrigatórios: COI, Desembarque, Embarques, Pistas, Encerramento; opcionais: Líderes DNATA, Anfitrião).

Validação por cargo: “Para realizar a Operação, esta função precisa ser atribuída a alguém.”

Cadastro incremental (11.1): adicionar nome + função.

Voos (11.2):

Chegadas (MCZ): Nº, Origem, HOTRAN, ETA, CLTS, SSR, Prefixo, BOX

Partidas: Nº, DEST, HOTRAM, TRIP, GATE, PISTA, SSR, CLTS (usa Líder/Anfitrião se informados)

Relatório (11.3): Gerar PDF e Salvar/Compartilhar no telefone.

Dep.: expo-print e expo-sharing.

🔐 Permissões & Nativos

Câmera (AQD), Localização (GPS), Rede (tipo/IP), E-mail, PDF/Compartilhar.

app.json

iOS: NSCameraUsageDescription, NSLocationWhenInUseUsageDescription…

Android: "permissions": ["CAMERA","ACCESS_FINE_LOCATION","ACCESS_COARSE_LOCATION","INTERNET"]

🌐 Integração com back-end (opcional)

Ajuste as URLs em ItemsScreen.tsx (ex.: http://192.168.0.3:8000/api/...).

Garanta celular e servidor na mesma rede; libere a porta (ex.: 8000).

Sem back-end? Use MockAPI, json-server ou exponha endpoints no seu servidor Node (AQD).

⚙️ Instalação & execução

instala versões compatíveis
npx expo install

libs comuns usadas
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs npx expo install react-native-screens react-native-safe-area-context npx expo install expo-notifications expo-asset expo-font npm i react-hook-form zod @hookform/resolvers axios npm i @expo/vector-icons

se usar PDF/compartilhamento
npx expo install expo-print expo-sharing

rodar
npx expo start

se der conflito de cache
npx expo start -c

TypeScript (se necessário) No tsconfig.json:

{ "compilerOptions": { "moduleResolution": "bundler", "allowSyntheticDefaultImports": true, "esModuleInterop": true } }

🗂️ Estrutura (resumo) src/ Components/ # UI: Button, Card, Input, StatusBarOperacao context/ # AuthContext (login/logout + user) navigation/ # AppNavigator (Stack/Tabs + header custom) screens/ # Login, Dashboard, LL, Processos, Voos, Operações, Malha, Relatório services/ # regras de negócio: processos, voos, eventBus Theme/ # colors.ts (tema) utils/ # validators.ts (zod), notifications.ts (expo-notifications)

🔔 Regras de negócio — highlights

Processos

Nº obrigatório, MAIÚSCULO e alfanumérico (ex.: MCZAD17656), sem duplicidade.

Prazos: 4d aviso, 5d vencido, 31d exclusão pós-finalizado, +3d alerta em “observação”.

Voos

Cadastro simplificado; notificação local T-15; aparece no marquee como “Próximo voo”.

🧰 Stack técnica

React Native + Expo (TypeScript) · React Navigation (Stack + Tabs) · react-hook-form + zod · expo-notifications, expo-asset, expo-font · @expo/vector-icons · Event Bus leve para sincronizar header.

🐞 Troubleshooting

MailComposer abre e-mail: é o esperado (não existe envio silencioso sem servidor).

Erro de rede: confira IP/porta e se o servidor está ativo.

Permissões negadas: ajuste nas configurações do dispositivo.

PDF não compartilha: instale expo-print e expo-sharing e teste num dispositivo físico.

🗺️ Roadmap

Persistência offline (MMKV/SQLite/AsyncStorage)

Sincronização com back-end

Exportação de planilha/PDF final da malha

Relatórios com filtros

Testes (Jest/Detox)

🤝 Contribuindo

Fork

git checkout -b feature/minha-feature

Commit: feat: minha feature

PR

📄 Licença

Projeto para fins acadêmicos e educacionais.
