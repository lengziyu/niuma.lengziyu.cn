# niuma.lengziyu.cn 部署说明（单目录版）

本项目按以下固定结构部署：

- Git 仓库目录：`/opt/apps/niuma.lengziyu.cn`
- Nginx 静态目录：`/opt/apps/niuma.lengziyu.cn/www`
- 不使用备份目录

## 1) 首次上线

### 1.1 准备目录并拉代码

```bash
sudo mkdir -p /opt/apps
sudo chown -R $USER:$USER /opt/apps
cd /opt/apps
git clone <你的仓库地址> niuma.lengziyu.cn
cd /opt/apps/niuma.lengziyu.cn
```

### 1.2 安装依赖并构建

```bash
npm ci
npm run build
mkdir -p /opt/apps/niuma.lengziyu.cn/www
rsync -av --delete dist/ /opt/apps/niuma.lengziyu.cn/www/
```

### 1.3 创建 Nginx 配置（可直接复制粘贴）

```bash
sudo tee /etc/nginx/conf.d/niuma.lengziyu.cn.conf >/dev/null <<'EOF'
server {
  listen 80;
  server_name niuma.lengziyu.cn;

  root /opt/apps/niuma.lengziyu.cn/www;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$ {
    try_files $uri =404;
    expires 7d;
    add_header Cache-Control "public, max-age=604800, immutable";
  }

  location = /index.html {
    add_header Cache-Control "no-cache";
  }
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

> 说明：这是静态托管，不占用 `3000~3013` 端口。

## 2) 后续更新

仓库内已提供 `update.py`，在服务器执行：

```bash
cd /opt/apps/niuma.lengziyu.cn
python3 update.py
```

常用参数：

```bash
# 本地有改动时自动 stash 再更新
python3 update.py --stash

# 丢弃本地改动并强制对齐远端
python3 update.py --hard

# 不拉代码，只重新构建并发布
python3 update.py --skip-pull
```

## 3) 可选：配置 HTTPS

如果你已经有统一的证书流程，继续沿用即可。  
若还没有，可用 certbot：

```bash
sudo certbot --nginx -d niuma.lengziyu.cn
```
