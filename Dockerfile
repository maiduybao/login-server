FROM node:carbon

RUN mkdir -p /usr/src/server-login

# Create app directory
WORKDIR /usr/src/server-login

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /usr/src/server-login

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

RUN cd bin && ./populate.sh

RUN cd ..

# Bundle app source
COPY . /usr/src/server-login


EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]
