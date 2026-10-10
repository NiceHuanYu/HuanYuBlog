---
title: MySQL 学习笔记 07：索引
description: MySQL 学习笔记第七篇：索引的作用与 B+ 树结构、单列与复合索引的创建、索引的代价与适用场景。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 7
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 10 索引 (Index)

## 10.0 示例数据

### Customers 表

| Id  | Name  | MemberCategory | PhoneNumber | Race |
| ---:| ----- | -------------- | ----------- | ---- |
| 1   | Chia  | A              | 11111111    | CN   |
| 2   | Tom   | B              | 22222222    | ML   |
| 3   | Alice | A              | 33333333    | IND  |
| 4   | Bob   | C              | 44444444    | CN   |
| 5   | Chen  | A              | 55555555    | CN   |

假设表中有 100 万行，下面用来说明索引的作用。

---

## 10.1 索引概念与作用

- 索引加速基于搜索键（search key）的选择操作。
- 无索引时，查询需要线性扫描整个表。
- 示例：

```sql
SELECT * FROM Customers WHERE membercategory = 'A';
```

注释：

- 没有索引时，数据库必须逐行读取 `Customers` 表，检查 `membercategory` 是否等于 `A`。
- 这种扫描方式称为全表扫描（Full Table Scan）。
- 如果表有 100 万行，即使只匹配少量行，也要读取全部 100 万行。
- 有索引时，数据库可以先在索引中定位满足条件的行，再回表读取完整数据。

执行效果对比：

```text
无索引：
读取 1,000,000 行 → 返回 3 行（Chia、Alice、Chen）

有索引：
在索引中找到 'A' 对应的位置 → 直接定位到 3 行 → 返回
```

作用：

- 减少需要扫描的数据量。
- 加快 `WHERE` 过滤、`JOIN` 连接、`ORDER BY` 排序。
- 降低查询的 I/O 成本。

类比：

```text
索引就像书的目录。
没有目录，找某一章要从第一页翻到最后一页。
有目录，可以直接翻到对应页码。
```

---

## 10.2 索引结构

- 索引通常存储在 B-trees（B 树）中。
- 创建索引键（如 `memberCategory`）后，可快速定位行。

注释：

- B 树是一种平衡的多路搜索树。
- 它保持数据有序，支持范围查询和等值查询。
- 查找、插入、删除的时间复杂度大致为 O(log n)。
- 叶子节点通常存储索引键和指向实际数据行的指针。

示意：

```text
假设在 MemberCategory 上建索引：

          [B]
        /     \
      [A]     [C]
     /  \       \
  Chia  Alice   Bob
  Chen

查找 'A'：
从根节点 [B] 出发 → 进入左子树 [A] → 找到 Chia、Alice、Chen
```

作用：

- 索引键保持有序。
- 支持等值查询：`WHERE membercategory = 'A'`
- 支持范围查询：`WHERE membercategory BETWEEN 'A' AND 'C'`
- 支持排序：`ORDER BY membercategory`

不同数据库可能使用不同结构：

| 数据库       | 常见索引结构 |
| ------------ | ------------ |
| MySQL InnoDB | B+ 树        |
| PostgreSQL   | B 树         |
| SQL Server   | B 树         |
| Oracle       | B 树         |

---

## 10.3 创建索引

### 10.3.1 基本语法

```sql
CREATE [UNIQUE] INDEX index-name
ON table-name (column-name [, ...] [ASC|DESC]);
```

注释：

- `CREATE INDEX`：创建普通索引。
- `CREATE UNIQUE INDEX`：创建唯一索引，索引列的值不能重复。
- `index-name`：索引名称，在表内通常唯一。
- `table-name`：要建索引的表。
- `column-name`：索引键列，可以多列。
- `ASC | DESC`：索引中列的排序方向，默认 `ASC`。

---

### 10.3.2 单列唯一索引

```sql
CREATE UNIQUE INDEX gdCust_idx
ON GoodCustomers(PhoneNumber);
```

注释：

- 在 `PhoneNumber` 列上创建唯一索引。
- 唯一索引要求 `PhoneNumber` 的值不能重复。
- 如果已有重复值，创建会失败。
- 如果 `PhoneNumber` 允许 NULL，多个 NULL 通常被允许（取决于数据库）。

执行效果：

```text
GoodCustomers 中 PhoneNumber 不允许重复。
插入 ('C001', ..., '11111111') 成功。
插入 ('C002', ..., '11111111') 失败：唯一约束冲突。
```

作用：

- 加速按电话号码查询：`WHERE PhoneNumber = '11111111'`。
- 同时保证电话号码唯一。

---

### 10.3.3 复合索引

```sql
CREATE INDEX gdCust_idx
ON GoodCustomers(CustomerID, CustomerName);
```

注释：

- 复合索引（composite index）包含两列。
- 索引键的顺序是 `CustomerID` 在前，`CustomerName` 在后。
- 查询条件先按 `CustomerID` 排序，再按 `CustomerName` 排序。

复合索引的“最左前缀”原则：

```text
索引 (CustomerID, CustomerName) 可以支持：
  WHERE CustomerID = 'C001'
  WHERE CustomerID = 'C001' AND CustomerName = 'Alice'
  ORDER BY CustomerID
  ORDER BY CustomerID, CustomerName

但通常不能单独支持：
  WHERE CustomerName = 'Alice'
  ORDER BY CustomerName
```

作用：

- 加速多列联合查询。
- 比多个单列索引更节省空间。
- 索引列顺序很重要，应该把最常用于过滤的列放在前面。

示例：

```sql
-- 可以使用复合索引
SELECT * FROM GoodCustomers
WHERE CustomerID = 'C001' AND CustomerName = 'Alice';

-- 通常不能有效使用复合索引
SELECT * FROM GoodCustomers
WHERE CustomerName = 'Alice';
```

---

### 10.3.4 降序索引

```sql
CREATE INDEX idx_age_desc
ON Customers (Age DESC);
```

注释：

- 索引键按降序存储。
- 适合频繁执行 `ORDER BY Age DESC` 的查询。
- 不同数据库对降序索引的支持程度不同。

作用：

- 加速降序排序。
- 避免查询时额外排序。

---

### 10.3.5 删除索引

```sql
-- MySQL
DROP INDEX gdCust_idx ON GoodCustomers;

-- PostgreSQL / Oracle
DROP INDEX gdCust_idx;

-- SQL Server
DROP INDEX gdCust_idx ON GoodCustomers;
```

注释：

- 不同数据库删除索引语法略有不同。
- 删除索引不会影响表数据，只影响查询性能。
- 删除主键索引通常需要先删除主键约束。

---

## 10.4 索引的代价与使用场景

### 10.4.1 索引的代价

- 每个索引增加存储空间。
- 数据插入、更新、删除时，索引必须更新：检索省时，但增删改操作成本增加。

注释：

```text
读操作（SELECT）：
  索引通常加快查询。

写操作（INSERT / UPDATE / DELETE）：
  索引需要同步维护，所以写入变慢。
```

示例：

```sql
-- 假设 Customers 表在 MemberCategory、Race 上各有一个索引

INSERT INTO Customers (Id, Name, MemberCategory, Race)
VALUES (6, 'David', 'B', 'US');

-- 数据库需要：
-- 1. 插入数据行
-- 2. 更新 MemberCategory 索引
-- 3. 更新 Race 索引
-- 所以比没有索引时慢
```

作用：

- 索引不是越多越好。
- 读多写少的表适合建索引。
- 写多读少的表应控制索引数量。

---

### 10.4.2 建议创建索引的情况

原笔记列出：

- 预计表中行数快速增长。
- 频繁在列上过滤（如 `WHERE membercategory = 'A'`）。
- 单表创建过多索引会使更新和插入变慢。

补充注释：

```sql
-- 适合建索引：主键、外键、频繁过滤列、频繁排序列
CREATE INDEX idx_customers_membercategory
ON Customers(MemberCategory);

-- 适合建索引：JOIN 条件列
CREATE INDEX idx_orders_custid
ON Orders(CustId);

-- 适合建索引：ORDER BY 列
CREATE INDEX idx_customers_age
ON Customers(Age);
```

常见适合建索引的场景：

| 场景             | 示例                          |
| ---------------- | ----------------------------- |
| 主键             | `PRIMARY KEY (Id)`            |
| 外键             | `FOREIGN KEY (CustId)`        |
| 高频等值过滤     | `WHERE MemberCategory = 'A'`  |
| 高频范围过滤     | `WHERE Age BETWEEN 18 AND 30` |
| 高频 JOIN 列     | `ON C.Id = O.CustId`          |
| 高频 ORDER BY 列 | `ORDER BY CreatedAt DESC`     |

---

### 10.4.3 不建议创建索引的情况

```sql
-- 列值重复率很高，索引选择性差
-- 例如 Gender 只有 'M'、'F' 两种值，索引效果有限
CREATE INDEX idx_gender ON Customers(Gender);

-- 表很小，全表扫描已经很快
-- 例如只有几十行的配置表
CREATE INDEX idx_config_key ON Config(`Key`);
-- 注意：Key 是 MySQL 的保留字，这里必须用反引号包起来
```

注释：

- 选择性（selectivity）高的列更适合建索引。
- 选择性 = 不同值数量 / 总行数。
- 选择性接近 1 表示值几乎都不同，适合索引。
- 选择性接近 0 表示值大量重复，索引效果差。

示例：

```text
Id        选择性接近 1    适合索引
Email     选择性接近 1    适合索引
Gender    选择性接近 0    通常不适合
Status    选择性较低      视情况而定
```

---

### 10.4.4 索引失效的常见情况

```sql
-- 在索引列上使用函数，可能导致索引失效
SELECT * FROM Customers WHERE YEAR(CreatedAt) = 2026;

-- 更推荐：
SELECT * FROM Customers
WHERE CreatedAt >= '2026-01-01' AND CreatedAt < '2027-01-01';

-- 使用 LIKE '%xxx' 前缀通配，通常无法使用索引
SELECT * FROM Customers WHERE Name LIKE '%Alice';

-- LIKE 'xxx%' 前缀匹配，通常可以使用索引
SELECT * FROM Customers WHERE Name LIKE 'Alice%';

-- 对索引列进行运算，可能导致索引失效
SELECT * FROM Customers WHERE Age + 1 = 23;

-- 更推荐：
SELECT * FROM Customers WHERE Age = 22;
```

作用：

- 索引是否生效取决于数据库优化器和具体写法。
- 用 `EXPLAIN` 可以查看执行计划，判断是否使用了索引。

示例：

```sql
EXPLAIN SELECT * FROM Customers WHERE MemberCategory = 'A';
```

---

## 10.5 本章核心记忆点

```text
索引加速查询，但增加存储和写入成本。
索引通常使用 B 树 / B+ 树结构。
CREATE INDEX 创建普通索引，CREATE UNIQUE INDEX 创建唯一索引。
复合索引有最左前缀原则，列顺序很重要。
索引适合高频过滤、JOIN、排序的列。
索引不适合小表、低选择性列、频繁写入的列。
索引不是越多越好，读多写少适合建索引。
```

本章重点：

- 理解索引为什么能加快查询。
- 会写 `CREATE INDEX`、`CREATE UNIQUE INDEX`。
- 理解复合索引和列顺序。
- 知道索引的代价和适用场景。
- 知道哪些写法可能导致索引失效。
