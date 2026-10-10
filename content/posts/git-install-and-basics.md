---
title: Git 安装与基本使用
description: 从装好 Git 到跑通日常提交流程，把最常用的几条命令和它们背后的三个区域讲清楚。
date: 2026-10-04
category: 工具
tags:
  - Git
  - 版本控制
  - 入门
series: Git 入门
seriesOrder: 1
---

<img title="" src="https://git-scm.com/images/logos/downloads/Git-Logo-2Color.png" alt="Git 标志" width="215" />

Git 是目前使用最广泛的分布式版本控制系统。这篇文章不打算把命令表抄一遍，而是先把
它组织文件的方式讲清楚，再顺着这个模型理解日常要用的那几条命令。

## 为什么需要版本控制

把文件复制成 `报告-v2-最终版-真的最终版.docx` 是很多人最早的"版本管理"。它的问题在于：
你只知道文件是什么时候复制出来的，不知道**改了什么**、**为什么改**，更没法把两处改动合到一起。

版本控制系统解决的正是这些：

- 每次提交都记录改动的具体内容，以及一句说明
- 可以随时回到历史上任意一个节点
- 多个人可以同时改同一个项目，改完再合并

Git 和早期的集中式工具（比如 SVN）的关键区别是**分布式**：每个人本地都有一份完整的仓库，
提交、查看历史、切换分支都不需要联网，只有和其他人同步时才需要。

## 安装

### Windows

最省事的是用 winget：

```bash
winget install --id Git.Git -e --source winget
```

也可以去 [git-scm.com](https://git-scm.com/download/win) 下载安装包，一路默认即可。
安装包里带了一个 Git Bash，后面在 Windows 上执行本文的命令用它就行。

### macOS

装了 Homebrew 的话：

```bash
brew install git
```

如果只是想快速拿到一个可用的 Git，系统自带的开发者工具里就有：

```bash
xcode-select --install
```

### Linux

按你的发行版选一条：

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install git

# Fedora / RHEL
sudo dnf install git

# Arch
sudo pacman -S git
```

### 验证安装

```bash
git --version
```

能打印出版本号（例如 `git version 2.43.0`）就说明装好了。

## 首次配置

Git 会把每次提交的作者信息写进历史，所以装完先告诉它你是谁。这两条只需要执行一次：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

再顺手把默认分支名设成 `main`，省得以后每次新建仓库都要改：

```bash
git config --global init.defaultBranch main
```

想确认配置结果，用 `git config --list` 查看，或者单独查某一项：

```bash
git config --global user.email
```

配置存在 `~/.gitconfig` 里，是个纯文本文件，可以直接编辑。

## 三个区域

理解 Git 的关键，是知道一个文件在你的本地会处于哪一层：

| 区域   | 说明                                 |
| ------ | ------------------------------------ |
| 工作区 | 你在编辑器里实际看到、正在修改的文件 |
| 暂存区 | 已经挑好、准备放进下一次提交的改动   |
| 版本库 | 已经提交、进入历史记录的快照         |

日常操作的实质，就是在把改动从工作区推进到暂存区，再推进到版本库。`git add` 干的是
第一步，`git commit` 干的是第二步。多出来的暂存区一开始会觉得麻烦，但它让你可以
**只挑一部分改动**提交——比如今天顺手改了两处不相干的东西，也能分成两次提交。

## 日常命令

### 建立仓库

把已有的目录变成 Git 仓库：

```bash
git init
```

或者把别人已有的仓库复制到本地：

```bash
git clone https://github.com/用户名/仓库名.git
```

### 查看状态

`git status` 是使用频率最高的命令，任何时候不知道自己在哪一步，先敲它：

```bash
git status
```

输出会告诉你哪些文件被改动了、哪些已经放进暂存区、当前在哪个分支。

想看具体改了哪几行，用：

```bash
git diff          # 工作区 vs 暂存区
git diff --staged # 暂存区 vs 最近一次提交
```

### 暂存与提交

```bash
git add 文件名        # 暂存某个文件
git add .            # 暂存当前目录下所有改动

git commit -m "说明这次改了什么"
```

提交说明尽量写清楚**为什么改**，而不是重复文件名。`fix bug` 这类信息三个月后
对自己也毫无帮助。

如果提交完发现说明写错了，可以补上一次提交的说明：

```bash
git commit --amend -m "新的说明"
```

### 查看历史

```bash
git log              # 完整历史
git log --oneline    # 每个提交压成一行
git log --oneline --graph --all   # 带分支图形，看起来最直观
```

### 连接远程仓库

本地仓库建好后，把它和远端关联起来：

```bash
git remote add origin https://github.com/用户名/仓库名.git
git push -u origin main
```

`-u` 会把本地 `main` 和远端的 `main` 绑定，之后直接 `git push` 就行。

从远端拉取别人的改动：

```bash
git pull
```

### 分支

分支让你可以在不影响主线的情况下试想法。下图里 `master` 和 `testing` 两个分支
一开始指向同一串提交：

![两个分支指向同一串提交](/images/git-branches.png)

日常用到的其实只有几条：

```bash
git switch -c 新分支名   # 新建并切换过去
git switch main         # 切回 main
git branch              # 列出本地分支，当前分支前面有 *
git merge 分支名         # 把某个分支合并进当前分支
git branch -d 分支名     # 合并完删掉它
```

## 一个完整的日常流程

把上面这些串起来，一次典型的工作大概是：

```bash
git switch -c fix-login-error   # 1. 为新改动开一个分支
# ... 改代码 ...
git status                      # 2. 看看动了哪些文件
git diff                        # 3. 确认改动内容
git add .                       # 4. 暂存
git commit -m "修复登录页在空密码时的报错"   # 5. 提交
git push -u origin fix-login-error          # 6. 推到远端
```

之后在代码托管平台上发起合并请求，走完评审再合并进 `main`。

## 忽略不该提交的文件

编译产物、依赖目录、本地环境变量这些不该进版本库。在项目根目录建一个 `.gitignore`：

```bash
node_modules/
dist/
.env
*.log
```

已经写好的 `.gitignore` 对尚未被跟踪的文件立即生效。如果某个文件**已经被提交过**，
再加规则是不会让它消失的，需要先把它从跟踪列表里移除：

```bash
git rm --cached 文件名
```

## 几点建议

- **提交要小而且要完整**。一个小改动配一条提交，出问题时容易定位，回滚也干净。
- **提交前先 `git status`**。绝大多数"我怎么把不该提交的文件传上去了"，都是这一步省了。
- **不要提交密钥**。`.env`、私钥、访问令牌一旦进了历史，即使后面删掉，也仍然留在历史记录里。
- **不确定就先开分支**。分支在 Git 里几乎不花成本，试错了删掉即可。

掌握了这些，日常单人开发基本够用了。多人协作里的合并冲突、变基、挑选提交这些话题，
等真正遇到时再单独展开。
