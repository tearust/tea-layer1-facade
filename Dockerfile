FROM node:15.14.0-alpine3.13
COPY src /tea-layer1-facade/src
COPY package.json /tea-layer1-facade
WORKDIR "/tea-layer1-facade"
RUN npm i
## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.8.0/wait /wait
RUN chmod +x /wait
WORKDIR "/tea-layer1-facade"
CMD /wait && npm start
