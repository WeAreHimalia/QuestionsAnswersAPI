FROM node:16
WORKDIR /QuestionsAnswersAPI/server
COPY package*.json ./
RUN npm install
RUN npm ci --only=production
COPY . .
EXPOSE 3030
CMD ["node", "./server/index.js"]