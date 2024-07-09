# Lab02

Targeting and Monitor

![](./images/lab02-arch.excalidraw.png)

```
cd lab02
```

Run the services

```
docker compose up -d
```

Invoke the API

try the experiment feature from my company

```
curl -H "email: yubin@mycompany.com" -X GET http://localhost:8888/ping
```

from other company

```
curl -H "email: jack@othercompany.com" -X GET http://localhost:8888/ping
```

Generate some loads

```
./run.sh
```

Visit Grafana at localhost:3000 (`admin`/`grafana`)
