# 多阶段构建 - 第一阶段：构建应用
FROM m.daocloud.io/docker.io/library/node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 构建参数，用于区分环境
ARG BUILD_ENV=production

# 根据环境构建应用
RUN case "$BUILD_ENV" in \
      staging) \
        pnpm run build:staging ;; \
      box) \
        pnpm run build:box ;; \
      us) \
        pnpm run build:us ;; \
      *) \
        pnpm run build ;; \
    esac

# 多阶段构建 - 第二阶段：运行时镜像
FROM m.daocloud.io/docker.io/library/nginx:alpine

# 复制自定义 nginx 配置
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 创建健康检查文件
RUN echo "OK" > /usr/share/nginx/html/health

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
