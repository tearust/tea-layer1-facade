FROM tearust/test-env:latest
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install sed
COPY src /tea-layer1-facade/src
COPY package.json /tea-layer1-facade
WORKDIR "/tea-layer1-facade"
RUN npm i
WORKDIR "/tea-layer1-facade"
CMD ["node", "src/index.js"]
