# Lab03

OpenFeature operator

Create kind cluster

```
kind create cluster --config kind-cluster-quick-start.yaml
```

Show cluster info with `kubectl`

```
kubectl cluster-info
```

Install Cert-Manager

```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml && \
kubectl wait --timeout=60s --for condition=Available=True deploy --all -n 'cert-manager'
```

Install OpenFeature operator

by helm

```
helm repo add openfeature https://open-feature.github.io/open-feature-operator/ && \
helm repo update && \
helm upgrade --install open-feature-operator openfeature/open-feature-operator
```

Apply yaml

```
kubectl -n default apply -f end-to-end.yaml 
```

Get the custom resource (CRs)

```
kubectl get FeatureFlag
```

```
kubectl get FeatureFlagSource
```

Clear the resource

```
kind delete cluster
```