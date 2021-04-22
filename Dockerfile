FROM node:15.14.0-alpine3.13
COPY src /tea-layer1-facade/src
COPY package.json /tea-layer1-facade
WORKDIR "/tea-layer1-facade"
RUN npm i
WORKDIR "/tea-layer1-facade"
CMD ["npm", "start"]
