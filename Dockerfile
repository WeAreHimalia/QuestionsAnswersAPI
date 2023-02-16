FROM node:16
WORKDIR /questionsanswersapi
ENV MONGO_SECRET="vastlightning414"
ENV NEW_RELIC="a013625da4e7d2d57e4290f53bb2fff4FFFFNRAL"
COPY . .
RUN npm install
EXPOSE 3030
CMD ["node", "./server/index.js"]