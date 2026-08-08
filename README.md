# Discord Voice Monitor

Bot em TypeScript que observa um canal de voz do Discord, publica uma mensagem
quando uma pessoa entra ou sai e toca um áudio de seis segundos nas entradas.

## Requisitos

- Node.js 22.12 ou superior;
- uma aplicação com bot criada no Discord Developer Portal;
- permissões do bot para visualizar, conectar e falar no canal de voz, além de
  visualizar e enviar mensagens no canal de texto escolhido.

O bot usa apenas os intents `Guilds` e `GuildVoiceStates`. Ele não precisa se
conectar ao canal de voz.

## Instalação

```bash
npm install
```

Copie `.env.example` para `.env` e preencha:

```env
DISCORD_TOKEN=token_do_bot
DISCORD_GUILD_ID=id_do_servidor
VOICE_CHANNEL_ID=id_do_canal_de_voz
TEXT_CHANNEL_ID=id_do_canal_de_texto
FIRST_ENTRY_ALERT_ROLE_ID=1469775960021664022
NOTIFY_ENTRIES=true
NOTIFY_EXITS=true
ENTRY_AUDIO_ENABLED=true
ENTRY_AUDIO_FILE=assets/entry-trumpet.mp3
ENTRY_AUDIO_DURATION_MS=6000
BOT_PRESENCE_NAME=FREE-USANDO TATA
BOT_PRESENCE_STATE=TATA
BOT_AVATAR_FILE=assets/gau.png
```

Para copiar um ID no Discord, ative o **Modo desenvolvedor** nas configurações
avançadas e use **Copiar ID** no servidor ou canal.

Nunca publique o arquivo `.env` nem compartilhe o token do bot.

## Execução

Durante o desenvolvimento:

```bash
npm run dev
```

Build e execução de produção:

```bash
npm run build
npm start
```

Testes:

```bash
npm test
```

## Docker Compose

Instale Docker com o plugin Compose, mantenha o arquivo `.env` preenchido na
raiz do projeto e execute:

```bash
docker compose up -d --build
```

Para acompanhar os logs:

```bash
docker compose logs -f bot
```

Para reiniciar ou encerrar:

```bash
docker compose restart bot
docker compose down
```

O `.env` é carregado pelo Compose durante a execução e não é copiado para a
imagem. Os áudios e o avatar da pasta `assets/` são incluídos na imagem. O
container roda como usuário sem privilégios e reinicia automaticamente, exceto
quando for interrompido explicitamente.

Caso seja necessário reaplicar o avatar usando o container:

```bash
docker compose run --rm bot node dist/scripts/set-bot-avatar.js
```

## Comportamento

- desconectado → canal monitorado: notificação de entrada;
- outro canal → canal monitorado: notificação de entrada;
- canal monitorado → desconectado: notificação de saída;
- canal monitorado → outro canal: notificação de saída;
- mute, deafen, câmera ou transmissão sem mudar de canal: nenhuma mensagem;
- eventos de contas de bot: nenhuma mensagem.
- primeira pessoa humana em um canal vazio: a mensagem também marca o cargo
  configurado em `FIRST_ENTRY_ALERT_ROLE_ID`;
- segunda pessoa em diante: mensagem normal, sem marcar novamente o cargo.

Quando uma pessoa entra, o bot conecta ao canal monitorado, toca
`assets/entry-trumpet.mp3` por no máximo seis segundos e se desconecta. Se mais
de uma pessoa entrar durante a reprodução, o áudio não é sobreposto nem
reiniciado.

É possível desativar separadamente entradas ou saídas por meio de
`NOTIFY_ENTRIES` e `NOTIFY_EXITS`. A reprodução pode ser desativada com
`ENTRY_AUDIO_ENABLED=false`.

## Presença e avatar

Enquanto estiver conectado, o bot aparece como online com a atividade
`FREE-USANDO TATA` e o estado `TATA`. Esses textos podem ser alterados por
`BOT_PRESENCE_NAME` e `BOT_PRESENCE_STATE`.

Bots não podem publicar imagens, party, timestamps ou join secrets na Rich
Presence. A imagem `assets/gau.png` é usada como avatar do bot, que é o ícone
mostrado ao lado da atividade. Para aplicá-la uma única vez à conta do bot:

```bash
npm run set-avatar
```

Não execute esse comando em toda inicialização, pois alterações de avatar são
limitadas pela API do Discord.

## Scripts

| Comando | Finalidade |
|---|---|
| `npm run dev` | Executa e reinicia ao detectar alterações |
| `npm run build` | Compila o TypeScript em `dist/` |
| `npm start` | Executa o build de produção |
| `npm run set-avatar` | Aplica `assets/gau.png` como avatar do bot |
| `npm test` | Executa os testes automatizados |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |
