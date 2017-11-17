#!/bin/bash

mongoimport --db demoApp --collection roles --file ../database/roles.json
mongoimport --db demoApp --collection users --file ../database/users.json

