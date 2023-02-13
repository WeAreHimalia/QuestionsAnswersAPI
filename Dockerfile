FROM node:16.15.0
WORKDIR /QuestionsAnswersAPI
COPY . .
RUN npm install
RUN yarn install --production
RUN npm run server
CMD ["node", "./server/index.js"]
EXPOSE 3030