---
title: MySQL 学习笔记 01：MySQL 基础知识
description: MySQL 学习笔记第一篇：MySQL Server 与 Workbench 的安装，数据库与 DBMS 的基本概念，关系模型、ACID 事务、常见数据类型，以及后续的学习路线。
date: 2026-10-09
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 1
---

> 这是我在学习 SQL / MySQL 时整理的系列笔记（共 11 篇）：讲解部分是我按自己的理解写的，示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，参考的主要是 MySQL 官方文档和一些公开的入门视频。理解有偏差的地方欢迎指出。

# 0 MySQL Server 与 MySQL Workbench 下载指南

## 0.1 核心概念

MySQL 是关系型数据库（Relational Database）。MySQL Workbench 是一个可视化并对数据库（DB）执行操作的工具。两者均可从官方地址下载：

```text
https://dev.mysql.com/downloads/
```

## 0.2 Windows 安装

通过“MySQL Installer for Windows”下载 MySQL Server 和 MySQL Workbench。

Windows 这边的安装步骤我参考了这个视频：https://youtu.be/YSOY_NyOg40?t=57

## 0.3 Mac 安装

### 0.3.1 MySQL Community Server

从官方下载并跟随安装步骤，安装过程中：

- 系统会提示创建“root”用户的密码（Password），需记录。
- 端口（Port）保留默认值 3306。
- 验证安装：在终端（Terminal）输入以下命令连接数据库：

```bash
mysql -u root -p
```

连接成功后应显示 MySQL 监视器（Monitor）欢迎信息及版本号（如 8.0.45 MySQL Community Server）。输入 `quit` 退出。

连接和验证的过程参考了这个视频：https://www.youtube.com/watch?v=aVH81OT5XVk

### 0.3.2 MySQL Workbench

下载并安装 MySQL Workbench。

Workbench 的安装参考了这个视频：https://www.youtube.com/watch?v=npt01LZMCVc

连接前提条件：必须先运行 MySQL Server，才能通过“root”用户和端口 3306 连接实例。

---

# 1 数据库与 DBMS 基础

## 1.1 Database (数据库)

- 数据库（Database）是**有组织的数据集合**，用来为现实世界的某个方面建模：数据不是随手堆在一起，而是按一定结构存起来，方便查询和维护。
- 示例：一个电商系统里会分别存客户、订单、商品的数据，再通过它们之间的联系把信息串起来。
- 它是绝大多数软件应用的核心组件——不管什么产品，数据最终都要落到数据库里。

## 1.2 Database Management System (DBMS，数据库管理系统)

- DBMS 就是管理数据库的软件，应用通过它来存储、查询和维护数据。
- 它要负责的事情大致有六类：
  - 数据定义与操作（data definition and manipulation）：建表、改表，以及增删改查。
  - 数据安全与访问控制（data security and access control）：认证、授权、加密。
  - 数据完整性（data integrity）：用约束保证数据准确且一致。
  - 并发控制（concurrency control）：让多个用户和应用同时访问同一份数据而不互相踩踏。
  - 备份与恢复（backup and recovery）。
  - 事务管理（transaction management）：保证一组操作可靠地完成或整体回退。

## 1.3 Data Model (数据模型) 与 Schema (模式)

- 数据模型（data model）是对"数据长什么样、彼此怎么关联"的一套抽象描述。
- 模式（schema）是这套模型在具体数据库里的结构：以关系模型为例，schema 里会写明有哪些表、每张表有哪些列、表之间靠什么关联、建了哪些索引。

## 1.4 数据模型类型

### 1.4.1 Relational Model (关系模型)

- 用数据之间的逻辑关系来组织数据库，是今天最主流的模型。
- 映射关系很直观：实体 → 表，属性 → 列，实体之间的联系 → 表之间的键约束。
- 示例：`Customers`（客户）和 `Orders`（订单）两张表，通过订单上的 `CustId` 指向客户的主键建立联系。

### 1.4.2 Document Model (文档模型)

- 非关系 (NoSQL) 数据模型。
- 数据由 documents (文档) 表示，包含 field-value pairs (字段-值对)。
- 示例：

```json
{
  "orderId": 1001,
  "amount": 99,
  "items": [
    {"sku": "A-01", "qty": 2},
    {"sku": "B-07", "qty": 1}
  ]
}
```

### 1.4.3 Vector Model (向量模型)

- 数组数据模型。
- 数据由 array of embeddings (嵌入数组) 表示。
- 用于 Machine Learning (机器学习) 和 Data Science (数据科学)。
- 示例：

```text
id1 -> [0.45, 0.67, 0.50, ...]
id2 -> [0.79, 0.54, 0.10, ...]
```

---

# 2 关系数据库核心概念与 SQL 历史

## 2.1 关系数据库优势

- 使用 SQL 查询和管理数据。
- 通过 constraints (约束) 强制数据完整性，例如 Primary Key (主键) 和 Foreign Key (外键)。
- 支持 ACID transactions (ACID 事务)：Atomicity (原子性)、Consistency (一致性)、Isolation (隔离性)、Durability (持久性)。
- 建立表间关系，支持复杂查询和检索。

## 2.2 SQL 历史

```text
1971 IBM 创建第一个关系查询语言 SQUARE
1972 IBM 为关系数据库 System R 创建 SEQUEL
1986 SQL 被 ANSI 和 ISO 标准组正式采纳为操作数据库的标准语言
```

- SQL 子语言：
  - DDL (Data Definition Language，数据定义语言)：创建和修改数据库对象。
  - DML (Data Manipulation Language，数据操纵语言)：查询和更新数据。
  - DCL (Data Control Language，数据控制语言)：创建角色、授予访问权限。

## 2.3 数据完整性与引用完整性

- Data integrity (数据完整性)：数据是否一致且准确。
- Referential integrity (引用完整性)：关系数据库通过 Primary Key (主键) 和 Foreign Key (外键) 约束强制表间一致链接。

## 2.4 键与表关系

- Primary key (主键)：表中行的唯一标识符。
- Foreign key (外键)：连接表并建立依赖关系。
- 示例：

```text
CUSTOMER (parent table，父表)
ORDER (dependent table，依赖表)
```

- 想删掉 CUSTOMER 里的某个客户，但 ORDER 里还挂着他的订单时，删除会被引用完整性拦住；反过来，往 ORDER 里插一条指向不存在客户的记录，同样插不进去。
- 复合主键（composite primary key）：由多于一列共同组成唯一标识，例如 ORDER_DETAILS 里的 (OrderId, ProductId)；引用它的外键也要对应这组列。

---

# 3 ACID 与 SQL vs NoSQL

## 3.1 ACID 属性

- 数据库里的一组操作通常放在事务（transaction）里执行。
- 原子性（atomicity）：整个事务要么全部成功、要么全部回滚（rollback），不会停在中间状态。
- 一致性（consistency）：事务执行前后都要满足表上的约束，数据不会停在"半对半错"的状态。
- 隔离性（isolation）：并发执行的事务之间互不干扰。
- 持久性（durability）：事务一旦提交，即使之后系统故障，数据也不会丢。
- 顺带一提：NoSQL 并不等于"不要 ACID"，它只是常常为了扩展性放弃其中一部分保证。

## 3.2 SQL vs NoSQL：数据一致性视角

### 3.2.1 SQL/Relational (SQL/关系型)

- 结构化 schemas (模式) 和 tables (表)，强调数据一致性。
- 传统上 vertical scaling (垂直扩展)；在 horizontal scaling (水平扩展) 的分布式系统中维护 ACID 更具挑战。
- 用例：Healthcare orders (医疗订单)、Commercial banking (商业银行)、Accounting (会计)，数据可靠性和一致性关键。

### 3.2.2 NoSQL/Non-relational (NoSQL/非关系型)

- 灵活数据结构，强调 scalability (可扩展性) 和 performance (性能)，牺牲部分一致性。
- Horizontal + vertical scaling (水平 + 垂直扩展)。
- 用例：非结构化数据如 documents (文档)、images (图像)、multimedia content (多媒体内容)，例如 media streaming services (媒体流服务)、social media services (社交媒体服务)；Graph and network analysis (图与网络分析)，例如 social network analysis (社交网络分析)。

## 3.3 关系型 DBMS 类型

```text
PostgreSQL：完全开源；高级特性如 JSONB 支持、自定义数据类型、复杂索引。
MySQL：开源但由 Oracle 拥有；功能简单易用。
Microsoft SQL Server：商业；丰富企业功能如高级安全。
```

---

# 4 MySQL 数据类型与 SQL 学习路线

## 4.1 MySQL 常见数据类型

- `VARCHAR(n)`：变长字符串，`n` 是最大字符数，**必须指定**。适合长度可预期、又不太长的文本（姓名、邮箱等）。
- `TEXT`：长文本，适合长度不确定的内容（文章正文等）；不能设默认值，建索引时通常要指定前缀长度。
- `INT`：整数，常用于主键、数量这类字段。
- `DECIMAL(p, s)`：定点小数，`p` 是总位数、`s` 是小数位数；金额这类要求精确的值不要用 `FLOAT`/`DOUBLE`。
- `DATE` / `DATETIME`：日期与日期时间。
- `JSON`：MySQL 5.7 起支持，以二进制格式存储 JSON 文档，可以直接用 `->`、`->>` 取字段。

## 4.2 这个系列的学习路线

- 先解决"怎么把数据查出来"（第 02～04 篇）：
  - 基本查询（SELECT）
  - 连接数据（JOIN）
  - 聚合与分组（aggregation & grouping）
  - 输出控制（ORDER BY / LIMIT）
  - 数据操纵：插入、更新、删除（INSERT / UPDATE / DELETE）
- 再解决"怎么把结构设计好"（第 05～11 篇）：
  - 数据定义语言（DDL）
  - 创建数据库对象：表、索引、视图
  - 删除和修改对象（DROP / ALTER）
  - 用约束保证数据完整性（constraints）
  - 视图与存储过程（views / stored procedures）
