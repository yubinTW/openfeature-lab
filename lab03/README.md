# Lab03

[OpenFeature operator](https://github.com/open-feature/open-feature-operator/)

Using flagd as sidecar

![](./images/lab03-arch.excalidraw.png)

## Create kubernetes cluster (with kind)

Create kind cluster

```
kind create cluster --config kind-cluster-quick-start.yaml
```

Show cluster info with `kubectl`

```
kubectl cluster-info
```

## Install OpenFeature Operator

> reference: https://openfeature.dev/docs/tutorials/open-feature-operator/quick-start

Install Cert-Manager

```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml && \
kubectl wait --timeout=60s --for condition=Available=True deploy --all -n 'cert-manager'
```

Install OpenFeature operator (by helm)

```
helm repo add openfeature https://open-feature.github.io/open-feature-operator/ && \
helm repo update && \
helm upgrade --install open-feature-operator openfeature/open-feature-operator
```

## Deploy the flag definition

Apply flag yaml, deploy `FeatureFlag` and `FeatureFlagSource` to kubernetes cluster

```
kubectl -n default apply -f flag.yaml
```

Get the custom resource (CRs)

```
kubectl get FeatureFlag
```

```
kubectl get FeatureFlagSource
```

## Deploy the application

Load image build from lab02

```
kind load docker-image lab02-app:latest
```

Apply app yaml

```
kubectl -n default apply -f app.yaml
```

## How to play

1. Visit http://localhost:30000/ping

2. Change `flag.yaml` and apply `flag.yaml` again

edit `FeatureFlag` resource in `flag.yaml`

and apply the change with `kubectl`

```
kubectl -n default apply -f app.yaml
```

3. Visit http://localhost:30000/ping again

## Clear the resource

```
kind delete cluster
```
