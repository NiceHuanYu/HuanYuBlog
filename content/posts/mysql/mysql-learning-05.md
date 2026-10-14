---
title: MySQL 学习笔记 05：DDL 概览
description: MySQL 学习笔记第五篇：数据定义语言概览——Schema、Table、View、Index、Constraints 这几类对象分别对应哪些 CREATE / ALTER / DROP 命令。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 5
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 8 Data Definition Language（DDL，数据定义语言）

## 8.1 DDL 概述

DDL 用于定义和管理数据库对象的结构，而不是直接操作表中的数据。

- 定义数据的结构、组织方式以及数据项之间的关系。
- 数据库对象包括：
  - Tables：表
  - Views：视图
  - Indexes：索引
  - Schemas：模式
- DDL 核心命令：
  - `CREATE`：创建新对象。
  - `DROP`：删除对象。
  - `ALTER`：修改对象特征。

注释：

- DDL 管“结构”，例如建表、改列、删表。
- DML 管“数据”，例如 `INSERT`、`UPDATE`、`DELETE`。
- DDL 语句通常会自动提交，但不同数据库行为可能不同。

常见对象与命令对应关系：

| 对象   | 创建            | 修改                                    | 删除          |
| ------ | --------------- | --------------------------------------- | ------------- |
| Schema | `CREATE SCHEMA` | 通常较少修改                            | `DROP SCHEMA` |
| Table  | `CREATE TABLE`  | `ALTER TABLE`                           | `DROP TABLE`  |
| View   | `CREATE VIEW`   | `CREATE OR REPLACE VIEW` / `ALTER VIEW` | `DROP VIEW`   |
| Index  | `CREATE INDEX`  | 通常删除后重建                          | `DROP INDEX`  |

示例：

```sql
-- 创建模式
CREATE SCHEMA Sales;

-- 创建表
CREATE TABLE Sales.Customers (
    Id INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL
);

-- 修改表
ALTER TABLE Sales.Customers
ADD Email VARCHAR(100);

-- 删除表
DROP TABLE Sales.Customers;
```

作用：

- `CREATE` 建立数据库结构。
- `ALTER` 调整已有结构。
- `DROP` 删除结构及其定义。

---

## 8.2 Schema（模式）

Schema 是逻辑容器，用于组织数据库对象。

- 可以把 Schema 理解为一个命名空间。
- 不同 Schema 中可以存在同名表，例如：
  - `Sales.Customers`
  - `Archive.Customers`
- 有些数据库中 Schema 与 Database 同义（MySQL同义），有些数据库中有区别。

示例：

```sql
-- 创建模式
CREATE SCHEMA Sales;

-- 在指定模式中创建表
CREATE TABLE Sales.Customers (
    Id INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL
);

-- 查询时带上模式名
SELECT * FROM Sales.Customers;

-- 删除模式
DROP SCHEMA Sales;
```

注释：

- `Sales.Customers` 表示 `Sales` 模式下的 `Customers` 表。
- 使用 Schema 可以避免表名冲突，也便于按业务分类。
- 删除 Schema 时，不同数据库可能要求先删除其中对象，或使用 `CASCADE`。

作用：

- 组织数据库对象。
- 隔离不同业务、模块或用户的数据结构。
- 提供更清晰的命名空间。

---

## 8.3 Table（表）

表是关系数据库中实际存储数据的基本对象。

表包含：

- Columns / Fields / Attributes：列 / 字段 / 属性
- Rows / Tuples / Records：行 / 元组 / 记录
- Primary Key：主键
- Column name：列名
- Column Values / Data Items：列值 / 数据项

示例：

```sql
CREATE TABLE Sales.Customers (
    Id INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Race CHAR(2),
    Age INT,
    Email VARCHAR(100)
);
```

注释：

- `Id` 是主键，用于唯一标识一行。
- `Name` 是 `NOT NULL`，插入时必须提供值。
- `Race`、`Age`、`Email` 可以为空。
- `VARCHAR(50)` 表示可变长度字符串，最大 50 个字符。
- `INT` 表示整数。

表中数据示意：

| Id  | Name  | Race | Age | Email             |
| ---:| ----- | ---- | ---:| ----------------- |
| 1   | Chia  | CN   | 22  | chia@example.com  |
| 2   | Tom   | ML   | 18  | NULL              |
| 3   | Alice | IND  | 25  | alice@example.com |

修改表结构：

```sql
-- 添加列
ALTER TABLE Sales.Customers
ADD Phone VARCHAR(20);

-- 修改列定义，不同数据库语法不同
ALTER TABLE Sales.Customers
MODIFY Name VARCHAR(100);

-- 删除列
ALTER TABLE Sales.Customers
DROP COLUMN Phone;
```

删除表：

```sql
-- 删除表结构和数据
DROP TABLE Sales.Customers;
```

作用：

- `CREATE TABLE` 定义表结构。
- `ALTER TABLE` 修改表结构。
- `DROP TABLE` 删除整个表。
- 表是数据存储的核心对象，行表示记录，列表示属性。

---

## 8.4 View（视图）

视图是虚拟表，不存储数据。

- 视图基于 `SELECT` 查询定义。
- 查询视图时，实际上执行的是视图背后的查询。
- 视图可以简化复杂查询，也可以隐藏部分列。

示例：

```sql
-- 创建视图：只显示 CN 客户
CREATE VIEW Sales.CN_Customers AS
SELECT Id, Name, Age
FROM Sales.Customers
WHERE Race = 'CN';
```

查询视图：

```sql
SELECT * FROM Sales.CN_Customers;
```

效果类似：

| Id  | Name | Age |
| ---:| ---- | ---:|
| 1   | Chia | 22  |
| 4   | Bob  | 17  |
| 5   | Chen | 30  |

删除视图：

```sql
DROP VIEW Sales.CN_Customers;
```

注释：

- 视图本身通常不保存数据，只保存定义。
- 视图可以像表一样被查询。
- 视图是否可更新取决于数据库和视图定义，这里不展开。
- 使用视图可以简化常用查询，提高复用性。

作用：

- 简化复杂查询。
- 隐藏敏感列或复杂逻辑。
- 提供逻辑层面的数据视图。

---

## 8.5 Index（索引）

索引用于提高数据检索速度。

- 类似书的目录。
- 可以建立在表的一列或多列上。
- 常见于 `WHERE`、`JOIN`、`ORDER BY` 等操作。

示例：

```sql
-- 在 Race 列上创建普通索引
CREATE INDEX idx_customers_race
ON Sales.Customers(Race);

-- 在 Email 列上创建唯一索引
CREATE UNIQUE INDEX idx_customers_email
ON Sales.Customers(Email);
```

删除索引：

```sql
-- MySQL 语法
DROP INDEX idx_customers_race ON Sales.Customers;
```

注释：

- 索引可以加快查询，但会占用额外空间。
- 索引会降低 `INSERT`、`UPDATE`、`DELETE` 的速度，因为数据变化时索引也要维护。
- 唯一索引要求索引列的值不能重复。
- 主键通常会自动创建索引。
- 不同数据库删除索引语法可能不同。

作用：

- 加速数据检索。
- 支持唯一性约束。
- 优化连接和排序操作。

---

## 8.6 Constraints（约束）

约束是强制数据完整性的规则。

常见约束：

| 约束          | 作用                             |
| ------------- | -------------------------------- |
| `PRIMARY KEY` | 主键，唯一且非空，标识一行       |
| `FOREIGN KEY` | 外键，引用另一张表的主键或唯一键 |
| `NOT NULL`    | 该列不允许为空                   |
| `UNIQUE`      | 该列或列组合的值必须唯一         |
| `CHECK`       | 该列值必须满足指定条件           |
| `DEFAULT`     | 未提供值时使用默认值             |

示例：

```sql
CREATE TABLE Sales.Customers (
    Id INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Age INT CHECK (Age >= 0),
    CountryCode CHAR(2) DEFAULT 'CN'
);
```

注释：

- `Id INT PRIMARY KEY`：主键，唯一且非空。
- `Name VARCHAR(50) NOT NULL`：姓名不能为空。
- `Email VARCHAR(100) UNIQUE`：邮箱不能重复。
- `Age INT CHECK (Age >= 0)`：年龄不能为负数。
- `CountryCode CHAR(2) DEFAULT 'CN'`：不填时默认 `CN`。

外键示例：

```sql
CREATE TABLE Sales.Orders (
    OrderId INT PRIMARY KEY,
    CustId INT NOT NULL,
    Amount DECIMAL(10,2) CHECK (Amount > 0),
    FOREIGN KEY (CustId) REFERENCES Sales.Customers(Id)
);
```

注释：

- `CustId` 引用 `Sales.Customers(Id)`。
- 插入 `Orders` 时，`CustId` 必须存在于 `Customers` 中。
- 删除或更新被引用行时，行为取决于外键规则。

通过 `ALTER TABLE` 添加约束：

```sql
ALTER TABLE Sales.Orders
ADD CONSTRAINT fk_orders_customer
FOREIGN KEY (CustId) REFERENCES Sales.Customers(Id);
```

删除约束：

```sql
-- 标准写法
ALTER TABLE Sales.Orders
DROP CONSTRAINT fk_orders_customer;
```

注释：

- 约束在插入或更新数据时自动检查。
- 约束用于保证数据的正确性、一致性和完整性。
- 不同数据库删除约束语法可能不同，例如 MySQL 删除外键常用 `DROP FOREIGN KEY`。

作用：

- 防止非法数据进入表中。
- 保证表与表之间的引用关系。
- 减少应用层的数据校验负担。

---

## 8.7 本章核心记忆点

```text
DDL 管结构：CREATE、ALTER、DROP。
Schema 是逻辑容器，用于组织数据库对象。
Table 实际存储数据，由行和列组成。
View 是虚拟表，不存储数据，只保存查询定义。
Index 提高检索速度，但会增加维护成本。
Constraints 强制数据完整性。
```

本章只需要掌握：

- DDL 做什么：定义和管理数据库对象结构。
- 四个核心对象：Schema、Table、View、Index。
- 三个核心命令：`CREATE`、`ALTER`、`DROP`。
- 约束的作用：保证数据完整性。
