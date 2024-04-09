# GoFM APP

Creating app client for streaming server.

Pre required to run the app:

- have docker installed on your pc
- have launched the goFm server streaming (https://github.com/samaelpola/GoFM)


## Getting Started

### Launch app

```
make
```

Open http://localhost:8084 with your browser to have access to the app. \
To access the server from your browser, retrieve the ca.crt file from the GOFM-sever/cert/ca.cert folder (https://github.com/samaelpola/GoFM) and add it to your browser's ssl authority.


## Command useful

### Build project

```
make build
```

### Up project

```
make up
```

### Down container

```
make down
```
