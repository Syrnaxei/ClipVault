ARG NODE_IMAGE=node:22-alpine3.22
ARG ALPINE_IMAGE=alpine:3.20

FROM ${NODE_IMAGE} AS build
ARG NPM_REGISTRY=https://registry.npmjs.org
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set registry "$NPM_REGISTRY" && npm ci
COPY . .
RUN npm run build

# 仅承载构建产物的发布 stage：容器启动时把静态文件拷入共享 volume 后即退出
FROM ${ALPINE_IMAGE}
COPY --from=build /app/dist /web
CMD ["sh", "-c", "cp -r /web/. /out/ && echo 'web assets published to /out'"]
