# Cube Arena (Solidity + Wallet)

Простая on-chain игра, где у каждого игрока есть кубик на поле 10x10:

- Подключение через крипто-кошелёк (MetaMask).
- Регистрация куба через транзакцию.
- Перемещение куба по клеткам (вверх/вниз/влево/вправо).
- Кулдаун между ходами, чтобы игровой цикл был «долгоиграющим».
- Случайные кристаллы за ход (доп. прогресс).

## Структура

- `contracts/CubeArena.sol` — смарт-контракт игры.
- `test/CubeArena.js` — тесты Hardhat.
- `scripts/deploy.js` — деплой контракта в локальную сеть Hardhat.
- `frontend/` — простой веб-клиент для игры через кошелёк.

## Запуск

```bash
npm install
npm run test
```

Компиляция:

```bash
npm run compile
```

## Как играть локально

1. В одном терминале запусти локальную сеть:
   ```bash
   npm run node
   ```
2. Во втором терминале задеплой контракт:
   ```bash
   npm run deploy:local
   ```
3. Скопируй адрес деплоя и вставь в `frontend/app.js` вместо `PASTE_DEPLOYED_ADDRESS_HERE`.
4. Добавь локальную сеть Hardhat в MetaMask (`http://127.0.0.1:8545`, chainId `31337`) и импортируй тестовый аккаунт из вывода `npm run node`.
5. Открой `frontend/index.html` через статический сервер:
   ```bash
   python3 -m http.server 8000
   ```
   Затем перейди на `http://127.0.0.1:8000/frontend/index.html`.
6. Подключи MetaMask, зарегистрируй куб и двигайся по полю.

## Публикация в GitHub (все файлы)

В этой среде у меня нет доступа к вашему GitHub-аккаунту/токену, поэтому прямой push выполнить не могу. Но проект уже полностью подготовлен и закоммичен локально.

Выполните у себя:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

Если репозиторий уже существует с другим default branch:

```bash
git push -u origin HEAD
```

## Идеи для удержания игроков

- Ежедневные задания (on-chain achievements).
- PvP зоны и NFT-скины куба.
- Сезонный рейтинг с призовым пулом.
