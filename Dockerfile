FROM tearust/test-env:latest

COPY src /tea-layer1-facade/src
COPY package.json /tea-layer1-facade
WORKDIR "/tea-layer1-facade"
RUN npm i
WORKDIR "/tea-layer1-facade"
CMD ["node", "src/index.js"]