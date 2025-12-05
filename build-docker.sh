#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
使用方法: $0 [选项]

选项:
    -p, --platform PLATFORM   指定平台 (amd64|arm64)，默认: arm64
    -e, --env ENV            构建环境 (production|staging)，默认: production
    -r, --registry REGISTRY  镜像仓库地址，默认: 不推送
    -t, --tag TAG           额外的tag，默认只使用时间戳
    --push                  构建后推送到仓库
    -h, --help              显示此帮助信息

示例:
    # 使用默认平台 (arm64) 构建镜像
    $0

    # 构建 amd64 平台镜像
    $0 -p amd64

    # 构建 arm64 平台镜像（显式指定）
    $0 -p arm64

    # 构建并推送到仓库
    $0 -p amd64 -r registry.example.com --push

    # 构建 staging 环境镜像
    $0 -e staging

    # 构建并添加额外的 latest tag
    $0 -t latest

EOF
}

# 默认值
IMAGE_NAME="mu-frontend"
PLATFORM="arm64"
BUILD_ENV="production"
REGISTRY=""
EXTRA_TAG=""
PUSH=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -e|--env)
            BUILD_ENV="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -t|--tag)
            EXTRA_TAG="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 验证平台参数
case $PLATFORM in
    amd64|amd)
        PLATFORM_ARG="linux/amd64"
        PLATFORM_TAG="amd64"
        ;;
    arm64|arm)
        PLATFORM_ARG="linux/arm64"
        PLATFORM_TAG="arm64"
        ;;
    *)
        print_error "不支持的平台: $PLATFORM"
        print_error "支持的平台: amd64, arm64"
        exit 1
        ;;
esac

# 验证构建环境
if [[ "$BUILD_ENV" != "production" && "$BUILD_ENV" != "staging" ]]; then
    print_error "不支持的构建环境: $BUILD_ENV"
    print_error "支持的环境: production, staging"
    exit 1
fi

# 生成时间戳 tag (格式: YYYYMMDD-HHMMSS)
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# 构建完整的镜像名称和tag
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}"
else
    FULL_IMAGE_NAME="${IMAGE_NAME}"
fi

# 主tag: 时间戳-平台-环境
MAIN_TAG="${TIMESTAMP}-${PLATFORM_TAG}-${BUILD_ENV}"
IMAGE_WITH_TAG="${FULL_IMAGE_NAME}:${MAIN_TAG}"

# 打印构建信息
print_info "================================"
print_info "Docker 镜像构建配置"
print_info "================================"
print_info "镜像名称: ${IMAGE_NAME}"
print_info "完整镜像: ${IMAGE_WITH_TAG}"
print_info "平台: ${PLATFORM_ARG}"
print_info "构建环境: ${BUILD_ENV}"
print_info "时间戳: ${TIMESTAMP}"
if [ -n "$EXTRA_TAG" ]; then
    print_info "额外Tag: ${EXTRA_TAG}"
fi
if [ "$PUSH" = true ]; then
    print_info "推送到仓库: 是"
else
    print_warn "推送到仓库: 否"
fi
print_info "================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    print_error "Docker 未安装或不在 PATH 中"
    exit 1
fi

# 检查 Docker 服务是否运行
if ! docker info &> /dev/null; then
    print_error "Docker 服务未运行"
    exit 1
fi

# 确认继续
read -p "是否继续构建? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warn "已取消构建"
    exit 0
fi

# 构建镜像
print_info "开始构建 Docker 镜像..."
BUILD_CMD="docker build \
    --platform ${PLATFORM_ARG} \
    --build-arg BUILD_ENV=${BUILD_ENV} \
    -t ${IMAGE_WITH_TAG}"

# 添加额外的 tag
if [ -n "$EXTRA_TAG" ]; then
    BUILD_CMD="${BUILD_CMD} -t ${FULL_IMAGE_NAME}:${EXTRA_TAG}"
fi

# 添加 Dockerfile 路径
BUILD_CMD="${BUILD_CMD} ."

print_info "执行命令: ${BUILD_CMD}"
echo ""

# 执行构建
eval $BUILD_CMD

# 检查构建结果
if [ $? -eq 0 ]; then
    print_info "✓ 镜像构建成功!"
    echo ""
    print_info "镜像信息:"
    docker images | grep "${IMAGE_NAME}" | head -5
    echo ""
else
    print_error "✗ 镜像构建失败"
    exit 1
fi

# 推送镜像
if [ "$PUSH" = true ]; then
    if [ -z "$REGISTRY" ]; then
        print_warn "未指定仓库地址，跳过推送"
    else
        print_info "开始推送镜像到仓库..."
        
        # 推送主tag
        print_info "推送 ${IMAGE_WITH_TAG}"
        docker push ${IMAGE_WITH_TAG}
        
        if [ $? -ne 0 ]; then
            print_error "推送镜像失败"
            exit 1
        fi
        
        # 推送额外tag
        if [ -n "$EXTRA_TAG" ]; then
            print_info "推送 ${FULL_IMAGE_NAME}:${EXTRA_TAG}"
            docker push ${FULL_IMAGE_NAME}:${EXTRA_TAG}
        fi
        
        print_info "✓ 镜像推送成功!"
    fi
fi

# 显示最终信息
echo ""
print_info "================================"
print_info "构建完成!"
print_info "================================"
print_info "镜像标签:"
print_info "  - ${IMAGE_WITH_TAG}"
if [ -n "$EXTRA_TAG" ]; then
    print_info "  - ${FULL_IMAGE_NAME}:${EXTRA_TAG}"
fi
print_info "================================"
echo ""

# 显示运行命令示例
print_info "运行容器示例:"
echo "  docker run -d -p 80:80 ${IMAGE_WITH_TAG}"
echo ""

