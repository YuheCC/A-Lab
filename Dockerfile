FROM m.daocloud.io/docker.io/library/nginx:latest
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
EXPOSE 80/tcp