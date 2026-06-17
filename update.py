#!/usr/bin/env python3

import argparse
import shlex
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
APP_DIR = Path("/opt/apps/niuma.lengziyu.cn")
DIST_DIR = APP_DIR / "dist"
PUBLISH_DIR = APP_DIR / "www"
VENV_PIP = APP_DIR / ".venv" / "bin" / "pip"
SERVER_REQUIREMENTS = APP_DIR / "server" / "requirements.txt"


def run(command: str, cwd: Path, check: bool = True, capture: bool = False) -> str:
    print(f"$ {command}")
    result = subprocess.run(
        command,
        cwd=str(cwd),
        shell=True,
        text=True,
        capture_output=capture,
    )
    if result.stdout and not capture:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    if check and result.returncode != 0:
        raise SystemExit(result.returncode)
    return result.stdout.strip() if capture else ""


def resolve_upstream_ref() -> str:
    upstream = run(
        "git rev-parse --abbrev-ref --symbolic-full-name @{u}",
        cwd=APP_DIR,
        check=False,
        capture=True,
    )
    return upstream or "origin/main"


def ensure_repo_clean(auto_stash: bool, hard_reset: bool) -> None:
    status = run("git status --porcelain", cwd=APP_DIR, capture=True)
    if not status:
        return

    if hard_reset:
        upstream = resolve_upstream_ref()
        run("git fetch --all --prune", cwd=APP_DIR)
        run("git reset --hard HEAD", cwd=APP_DIR)
        run("git clean -fd", cwd=APP_DIR)
        run(f"git reset --hard {shlex.quote(upstream)}", cwd=APP_DIR)
        return

    if auto_stash:
        run('git stash push -u -m "update.py auto stash"', cwd=APP_DIR)
        return

    print("检测到本地未提交改动，已停止更新。", file=sys.stderr)
    print("如需自动暂存后继续：python3 update.py --stash", file=sys.stderr)
    print("如需丢弃本地改动并强制更新：python3 update.py --hard", file=sys.stderr)
    print(status, file=sys.stderr)
    raise SystemExit(1)


def sync_dist_to_publish() -> None:
    PUBLISH_DIR.mkdir(parents=True, exist_ok=True)

    if shutil.which("rsync"):
        run(
            f"rsync -av --delete {shlex.quote(str(DIST_DIR) + '/')} {shlex.quote(str(PUBLISH_DIR) + '/')}",
            cwd=APP_DIR,
        )
        return

    # Fallback when rsync is unavailable.
    run(f"rm -rf {shlex.quote(str(PUBLISH_DIR))}/*", cwd=APP_DIR)
    run(
        f"cp -a {shlex.quote(str(DIST_DIR) + '/.')} {shlex.quote(str(PUBLISH_DIR) + '/')}",
        cwd=APP_DIR,
    )


def sync_python_dependencies() -> None:
    if not SERVER_REQUIREMENTS.exists():
        return

    if not VENV_PIP.exists():
        print(f"未找到 Python 虚拟环境: {VENV_PIP}", file=sys.stderr)
        print("请先按 DEPLOY.md 创建 .venv 后再重启后端服务。", file=sys.stderr)
        return

    run(f"{shlex.quote(str(VENV_PIP))} install -r {shlex.quote(str(SERVER_REQUIREMENTS))}", cwd=APP_DIR)


def main() -> None:
    parser = argparse.ArgumentParser(description="更新静态站点并发布到 /opt/apps/niuma.lengziyu.cn/www")
    parser.add_argument("--stash", action="store_true", help="检测到改动时自动 stash 后继续")
    parser.add_argument("--hard", action="store_true", help="丢弃本地改动并强制对齐上游")
    parser.add_argument("--skip-pull", action="store_true", help="跳过 git pull，只构建和发布")
    args = parser.parse_args()

    if ROOT != APP_DIR:
        print(f"请将项目部署在 {APP_DIR}，当前路径为 {ROOT}", file=sys.stderr)
        raise SystemExit(1)

    ensure_repo_clean(args.stash, args.hard)

    old_head = run("git rev-parse HEAD", cwd=APP_DIR, capture=True)

    if not args.skip_pull:
        if args.hard:
            upstream = resolve_upstream_ref()
            run("git fetch --all --prune", cwd=APP_DIR)
            run(f"git reset --hard {shlex.quote(upstream)}", cwd=APP_DIR)
        else:
            run("git pull --ff-only", cwd=APP_DIR)

    new_head = run("git rev-parse HEAD", cwd=APP_DIR, capture=True)
    if old_head != new_head:
        print(f"版本更新: {old_head[:8]} -> {new_head[:8]}")
    else:
        print(f"版本未变化: {new_head[:8]}")

    run("npm ci", cwd=APP_DIR)
    sync_python_dependencies()
    run("npm run build", cwd=APP_DIR)

    if not DIST_DIR.exists():
        print(f"构建目录不存在: {DIST_DIR}", file=sys.stderr)
        raise SystemExit(1)

    sync_dist_to_publish()

    print("\n发布完成。")
    print(f"Nginx 静态目录: {PUBLISH_DIR}")
    print("后端依赖已同步；如服务正在运行，请执行: sudo systemctl restart niuma-convert")
    print("如需生效新配置，请执行: sudo nginx -t && sudo systemctl reload nginx")


if __name__ == "__main__":
    main()
