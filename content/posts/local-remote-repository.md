---
title: 本地远程仓库的部署
description: 用自己的机器当 Git 服务器：建一个裸仓库、走 SSH 连上去，把本地提交推上去。
date: 2026-10-06
category: 工具
tags:
  - Git
  - 服务器
  - 部署
series: Git 入门
seriesOrder: 2
---

上一篇把 Git 的日常操作过了一遍，但那些提交都还留在自己电脑上。这一篇讲怎么把它们
放到一台自己的机器上——可以是家里闲置的旧笔记本、一台云服务器，或者局域网里的任意
一台 Linux。

托管平台（GitHub、Gitee 之类）当然更省事，但自己搭有几个实际好处：代码不出内网、
不依赖第三方服务的可用性，而且这个过程本身能把 Git 的「远程」到底是什么讲清楚。

## 先搞清楚「远程」是什么

很多人以为远程仓库是某种特殊的东西，其实它和本地仓库是**同一种仓库**，只是少了
一个工作区。

普通仓库长这样：

```
my-project/
├── .git/          ← 版本库本身
├── src/           ← 工作区：你编辑文件的地方
└── README.md
```

而远程仓库只需要 `.git` 里的内容，不需要工作区——反正没人会在这台服务器上直接改文件。
这种没有工作区的仓库叫**裸仓库**（bare repository），目录习惯以 `.git` 结尾：

```
my-project.git/    ← 没有工作区，只有版本库
```

`git push` 做的事，本质就是把本地的新提交对象传到对面那个仓库里，再移动一下对方的
分支指针。所以对面是什么形态并不重要，重要的是它得是个能接收推送的仓库。

## 服务端：建一个裸仓库

假设你有一台能 SSH 登录的机器，地址是 `192.168.1.10`。登上去，建一个专门放仓库的目录：

```bash
ssh user@192.168.1.10
sudo mkdir -p /srv/git
sudo chown -R user:user /srv/git
```

然后在里面初始化一个裸仓库：

```bash
cd /srv/git
git init --bare my-project.git
```

`--bare` 是关键，它告诉 Git「这里不需要工作区」。执行完你会看到 `my-project.git`
里面是 `HEAD`、`objects`、`refs` 这些内容，而不是你熟悉的源码文件——这正是期望的结果。

## 客户端：把本地仓库连上去

回到你自己的电脑，在项目目录里加一个远程地址：

```bash
git remote add origin user@192.168.1.10:/srv/git/my-project.git
```

这一行里的 `user@主机:路径` 就是 SSH 的写法，Git 会直接调用系统的 SSH 去连。确认一下：

```bash
git remote -v
```

然后推上去：

```bash
git push -u origin main
```

`-u` 会把本地的 `main` 和远程的 `main` 绑定，之后再推就只需要 `git push`。

如果这台机器上原本是个空仓库（比如你从别处克隆的裸仓库），第一次推送前可能要先把
本地分支的名字对齐：

```bash
git branch -M main
git push -u origin main
```

## 在另一台机器上克隆

远程仓库建好之后，别的机器就能像用 GitHub 一样用它：

```bash
git clone user@192.168.1.10:/srv/git/my-project.git
```

克隆下来的是完整仓库，包含全部历史。之后 `git pull` 拉取别人的改动、`git push` 推
自己的改动，和在托管平台上完全一样。

## 用本地路径也能连

如果服务端和客户端在同一台机器上（比如你想用一个目录来当"远程"备份），SSH 那一段
可以直接换成路径：

```bash
git remote add origin /srv/git/my-project.git
```

对 Git 来说两者没有本质区别——它只关心"能不能访问到那个仓库"。这个技巧在做实验、
写教程时很方便，不用真的准备两台机器。

## 多人与权限

上面用的都是同一个 `user` 账号，多人协作时这样并不合适：谁推的提交都显示成同一个
作者。有两种常见做法：

**建一个专用的 git 账号。** 所有人用 `git@host:...` 访问，各自通过 SSH 公钥认证，
真实身份靠提交里的 `user.name` / `user.email` 区分。这是最常用的方式。

**用共享组。** 把仓库目录的属组设成一个公共组，组内成员都有写权限：

```bash
sudo chgrp -R devs /srv/git/my-project.git
sudo chmod -R g+ws /srv/git/my-project.git
```

`g+s` 让新建的文件自动继承目录的属组，避免新推上来的对象权限不对。

不管用哪种方式，都建议了解一下 `git config --system core.sharedRepository`，它能
让 Git 自动为新对象设置正确的权限位，省掉很多手工 `chmod`。

## 想更完整一点

如果只是自己用，上面的内容已经够了。想让这台机器更像一个"服务"，可以再考虑：

- 用 `authorized_keys` 配合 `command=` 限制某个公钥只能做 Git 操作，不能开 shell
- 加 `post-receive` 钩子，推送后自动部署到网站目录
- 装个 Gitea 或 Forgejo，得到一个带界面的自托管平台

这些都属于"锦上添花"，不影响 Git 本身的工作方式。

## 什么时候还是用托管平台

自己搭适合内网项目、私有代码和对可控性有要求的场景。但如果需要：

- 让外部的人参与协作
- 不折腾服务器和备份
- 用现成的 Issue、CI、代码评审

那托管平台依然是更省事的选择。两者也不冲突——完全可以主力代码放平台，
私密的小项目自己搭。
