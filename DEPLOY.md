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

### 1.2 安装前端依赖并构建

```bash
npm ci
npm run build
mkdir -p /opt/apps/niuma.lengziyu.cn/www
rsync -av --delete dist/ /opt/apps/niuma.lengziyu.cn/www/
```

### 1.3 安装 PDF 转 Word 服务

```bash
cd /opt/apps/niuma.lengziyu.cn

# 安装 LibreOffice（高质量 PDF 转 Word 的核心依赖）
sudo apt install libreoffice-writer fonts-wqy-microhei -y

# 安装 Python 依赖
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r server/requirements.txt
```

创建 systemd 服务：

```bash
sudo tee /etc/systemd/system/niuma-convert.service >/dev/null <<'EOF'
[Unit]
Description=Niuma PDF conversion service
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/apps/niuma.lengziyu.cn
ExecStart=/opt/apps/niuma.lengziyu.cn/.venv/bin/uvicorn server.app:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now niuma-convert
```

### 1.4 创建 Nginx 配置（可直接复制粘贴）

```bash
sudo tee /etc/nginx/conf.d/niuma.lengziyu.cn.conf >/dev/null <<'EOF'
server {
  listen 80;
  server_name niuma.lengziyu.cn;

  root /opt/apps/niuma.lengziyu.cn/www;
  index index.html;

  client_max_body_size 80m;

  location /api/ {
    proxy_pass http://127.0.0.1:8001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
  }

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

> 说明：前端仍是静态托管；PDF 转 Word 服务只监听本机 `8001`，由 Nginx 的 `/api/` 转发。

## 2) 后续更新

仓库内已提供 `update.py`，在服务器执行：

```bash
cd /opt/apps/niuma.lengziyu.cn
python3 update.py
sudo systemctl restart niuma-convert
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
