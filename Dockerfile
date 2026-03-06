# Используем официальный образ Node.js в качестве базового
FROM node:latest AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
RUN npm install -g npm next corepack pnpm
#  next pnpm yarn
# RUN n latest
RUN corepack enable
#RUN corepack install npm
# Устанавливаем зависимости
RUN npm install -f
#RUN pnpm i -f

# Копируем все файлы приложения в контейнер
COPY . .

# Собираем приложение
RUN npm run build
#RUN pnpm build

# Используем более легкий образ для запуска приложения
FROM node:latest AS runner

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем скомпилированные файлы из предыдущего этапа
COPY --from=builder /app/ .

# Устанавливаем переменную среды для Next.js
ENV NODE_ENV=production

# Запускаем приложение
CMD ["npm", "start"]