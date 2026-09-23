# better-sqlite3 v13+ 的 N-API 预编译二进制随包分发、运行时加载，无需编译；
# --ignore-scripts 规避 npm≤10 对含 binding.gyp 的包自动执行 node-gyp 的行为
# （server 全部依赖均为纯 JS/预编译包，无任何 install 脚本）
ARG NODE_IMAGE=node:22-alpine3.22

FROM ${NODE_IMAGE} AS build
ARG NPM_REGISTRY=https://registry.npmjs.org
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set registry "$NPM_REGISTRY" && npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM ${NODE_IMAGE}
ENV NODE_ENV=production \
    DATA_DIR=/data
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
VOLUME /data
EXPOSE 3000
CMD ["node", "dist/index.js"]
