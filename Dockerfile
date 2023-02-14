FROM node:16
WORKDIR /questionsanswersapi
COPY . .
RUN npm install
EXPOSE 3030
CMD ["node", "./server/index.js"]