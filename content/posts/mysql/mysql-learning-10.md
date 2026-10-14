---
title: MySQL 学习笔记 10：视图
description: MySQL 学习笔记第十篇：视图（Views）的定义与特性、和表的对比、创建与使用，以及可更新视图的限制。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 10
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 13 视图 (Views)

## 13.0 示例数据

### BOOK_SALES 表

| BookTitle    | Buyer | Country |
| ------------ | ----------- | ------- |
| Effective Java | Tom         | BE      |
| Effective Java | Alice       | BE      |
| Clean Code    | Tom         | US      |
| Clean Code    | Bob         | US      |
| Clean Code    | Chen        | CN      |

### BookLoans 表

| TransactionID | CustomerID | BookCode | DateIssue   |
| ------------- | ---------- | --------- | ----------- |
| T001          | C001       | 55        | 20 Nov 2000 |
| T002          | C002       | 66        | 20 Nov 2000 |
| T003          | C003       | 55        | 21 Nov 2000 |

### Customers 表

| CustomerID | CustomerName | MemberCategory |
| ---------- | ------------ | -------------- |
| C001       | Alice        | A              |
| C002       | Bob          | B              |
| C003       | Chen         | C              |
| C004       | David        | D              |

---

## 13.1 视图的定义与特性

- 视图是虚拟表（virtual table），基于 SQL 查询的结果。
- 不存储数据；访问视图时，底层 SQL 查询重新运行。
- 示例：`VW_SALES_EFFECTIVE_JAVA` 和 `VW_SALES_CLEAN_CODE` 从 `BOOK_SALES` 表派生。

示例：

```sql
-- 创建 Effective Java 参与者的视图
CREATE VIEW VW_SALES_EFFECTIVE_JAVA AS
SELECT BookTitle, Buyer, Country
FROM BOOK_SALES
WHERE BookTitle = 'Effective Java';

-- 创建 Clean Code 参与者的视图
CREATE VIEW VW_SALES_CLEAN_CODE AS
SELECT BookTitle, Buyer, Country
FROM BOOK_SALES
WHERE BookTitle = 'Clean Code';
```

查询视图：

```sql
SELECT * FROM VW_SALES_EFFECTIVE_JAVA;
```

执行效果：

| BookTitle    | Buyer | Country |
| ------------ | ----------- | ------- |
| Effective Java | Tom         | BE      |
| Effective Java | Alice       | BE      |

```sql
SELECT * FROM VW_SALES_CLEAN_CODE;
```

执行效果：

| BookTitle | Buyer | Country |
| --------- | ----------- | ------- |
| Clean Code | Tom         | US      |
| Clean Code | Bob         | US      |
| Clean Code | Chen        | CN      |

注释：

- 视图本身不保存数据。
- 每次查询视图，数据库都会执行视图定义中的 `SELECT`。
- 如果底层表数据变化，视图查询结果也会变化。

示例：

```sql
-- 向基础表插入新行
INSERT INTO BOOK_SALES
VALUES ('Effective Java', 'David', 'BE');

-- 再次查询视图，会看到新行
SELECT * FROM VW_SALES_EFFECTIVE_JAVA;
-- 结果中包含 David
```

作用：

- 封装常用查询条件。
- 简化数据访问，例如只关心某个活动的参与者。
- 对使用者隐藏底层表结构。

---

## 13.2 表与视图的对比

原笔记对比：

```text
Table（表）：
- 物理结构，直接存储数据。
- 可直接插入、更新、删除数据。
- 用于存储和管理实际数据。
- 查询表通常更快。

View（视图）：
- 不存储数据；从对一个或多个表的查询派生。
- 通过视图修改数据在某些情况下可行，但取决于视图复杂度和数据库系统。
- 用于简化数据访问、增强安全性或封装复杂查询。
- 查询视图可能稍慢，因为数据库引擎每次访问都必须执行底层查询。
```

扩展对比表：

| 特性             | Table    | View                         |
| ---------------- | -------- | ---------------------------- |
| 是否存储数据     | 是       | 否                           |
| 是否物理存在     | 是       | 否，仅保存定义               |
| 是否可直接增删改 | 是       | 视情况                       |
| 是否依赖其他表   | 否       | 是，依赖底层表               |
| 是否占用存储     | 是       | 定义占用少量空间             |
| 查询速度         | 通常更快 | 可能稍慢，需执行底层查询     |
| 用途             | 存储数据 | 简化访问、安全控制、封装逻辑 |

注释：

- 表是数据的实际载体。
- 视图是表的“窗口”或“投影”。
- 视图的查询性能取决于底层查询复杂度和索引情况。
- 视图的数据始终是最新的，因为它每次重新执行查询。

作用：

- 表负责存数据，视图负责看数据。
- 用视图可以给不同用户展示不同数据范围。

---

## 13.3 创建视图

### 13.3.1 基本语法

```sql
CREATE VIEW view_name AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

注释：

- `CREATE VIEW` 创建视图。
- `AS` 后面是视图定义。
- 视图定义的 `SELECT` 可以包含 `JOIN`、`WHERE`、`GROUP BY` 等。

---

### 13.3.2 单表视图

```sql
CREATE VIEW Nov20TranView AS
SELECT TransactionID, CustomerID, BookCode
FROM BookLoans
WHERE DateIssue = '20 Nov 2000';
```

查询视图：

```sql
SELECT * FROM Nov20TranView WHERE BookCode = 55;
```

执行效果：

| TransactionID | CustomerID | BookCode |
| ------------- | ---------- | --------- |
| T001          | C001       | 55        |

注释：

- DBMS 将查询转换为：

```sql
SELECT * FROM BookLoans
WHERE BookCode = 55 AND DateIssue = '20 Nov 2000';
```

- 用户只看到 20 Nov 2000 的交易。
- 用户再加 `WHERE BookCode = 55`，相当于在视图定义上再加过滤。

作用：

- 把常用过滤条件封装到视图里。
- 用户查询更简单。

---

### 13.3.3 带 JOIN 的视图

```sql
CREATE VIEW VW_CustomerOrder AS
SELECT C.CustomerID, C.CustomerName, O.OrderId, O.Amount
FROM Customers C
JOIN Orders O ON C.CustomerID = O.CustId;
```

查询视图：

```sql
SELECT * FROM VW_CustomerOrder;
```

注释：

- 视图可以基于多张表。
- 视图中的列来自不同表。
- 每次查询视图都会执行这个 `JOIN`。

作用：

- 简化多表连接查询。
- 统一数据展示格式。

---

### 13.3.4 带聚合的视图

```sql
CREATE VIEW VW_CustomerOrderCount AS
SELECT C.CustomerID, C.CustomerName, COUNT(O.OrderId) AS OrderCount
FROM Customers C
LEFT JOIN Orders O ON C.CustomerID = O.CustId
GROUP BY C.CustomerID, C.CustomerName;
```

查询视图：

```sql
SELECT * FROM VW_CustomerOrderCount WHERE OrderCount > 0;
```

注释：

- 视图可以包含聚合函数。
- 这种视图通常不能直接更新，因为聚合结果不是一一对应底层行。

作用：

- 封装统计逻辑。
- 方便重复使用统计结果。

---

### 13.3.5 删除视图

```sql
DROP VIEW Nov20TranView;
```

注释：

- 删除视图只删除视图定义。
- 不影响底层表和数据。
- 有些数据库支持 `DROP VIEW IF EXISTS`。

---

## 13.4 视图的更新与插入限制

- 示例：`GoodCustomer` 视图基于 `Customers` 表，条件为 `MemberCategory IN ('A', 'B')`。
- 更新视图使 `MemberCategory = 'C'`，或插入 `MemberCategory = 'C'` 的记录，可能不被允许，因为视图定义条件可能限制更新。

示例：

```sql
-- 创建只包含 A、B 类客户的视图
CREATE VIEW GoodCustomer AS
SELECT CustomerID, CustomerName, MemberCategory
FROM Customers
WHERE MemberCategory IN ('A', 'B');
```

查询视图：

| CustomerID | CustomerName | MemberCategory |
| ---------- | ------------ | -------------- |
| C001       | Alice        | A              |
| C002       | Bob          | B              |

尝试更新：

```sql
-- 把 Alice 改成 C
UPDATE GoodCustomer
SET MemberCategory = 'C'
WHERE CustomerID = 'C001';
```

可能的结果：

- 在 MySQL 中，这类更新通常不允许，因为更新后该行不再满足视图的 `WHERE` 条件。
- 有些数据库允许更新，但更新后该行会从视图中消失。

尝试插入：

```sql
-- 插入 MemberCategory = 'C' 的记录
INSERT INTO GoodCustomer (CustomerID, CustomerName, MemberCategory)
VALUES ('C005', 'Eve', 'C');
```

可能的结果：

- 有些数据库允许插入，但插入后该行不会出现在视图中。
- 有些数据库直接拒绝。
- 原因是视图只显示 A、B，插入 C 不在视图定义范围内。

注释：

- 视图是否可更新取决于数据库和视图复杂度。
- 简单视图（单表、无聚合、无 DISTINCT、无 GROUP BY）通常可更新。
- 复杂视图（多表、聚合、DISTINCT、GROUP BY）通常不可更新。
- 即使可更新，也可能受到视图定义的 `WHERE` 条件限制。

常见不可更新的视图特征：

| 特征            | 是否可更新                   |
| --------------- | ---------------------------- |
| 单表、无聚合    | 通常可更新                   |
| 有 `WHERE` 条件 | 视情况，可能限制更新         |
| 有 `JOIN`       | 通常不可更新或只能更新部分表 |
| 有 `GROUP BY`   | 不可更新                     |
| 有 `DISTINCT`   | 不可更新                     |
| 有聚合函数      | 不可更新                     |

作用：

- 视图主要用于查询，不主要用于更新。
- 更新数据应尽量直接操作底层表。

---

## 13.5 视图的其他作用

### 13.5.1 简化数据访问

```sql
CREATE VIEW VW_ActiveCustomers AS
SELECT CustomerID, CustomerName
FROM Customers
WHERE MemberCategory IN ('A', 'B');
```

用户只需要：

```sql
SELECT * FROM VW_ActiveCustomers;
```

不需要知道底层 `WHERE` 条件。

---

### 13.5.2 增强安全性

```sql
CREATE VIEW VW_CustomerPublic AS
SELECT CustomerID, CustomerName
FROM Customers;
-- 不包含敏感列，例如 PhoneNumber、Email
```

用户只能看到视图中的列。

作用：

- 隐藏敏感列。
- 限制用户可见的数据范围。

---

### 13.5.3 封装复杂查询

```sql
CREATE VIEW VW_CustomerOrderSummary AS
SELECT C.CustomerID,
       C.CustomerName,
       COUNT(O.OrderId) AS OrderCount,
       COALESCE(SUM(O.Amount), 0) AS TotalAmount
FROM Customers C
LEFT JOIN Orders O ON C.CustomerID = O.CustId
GROUP BY C.CustomerID, C.CustomerName;
```

作用：

- 复杂逻辑写一次，多次复用。
- 应用层直接查询视图即可。

---

## 13.6 常见坑总结

1. 视图不存储数据，每次查询都执行底层 SQL。
2. 视图定义中的 `SELECT` 可以包含 `JOIN`、`WHERE`、`GROUP BY`。
3. 视图可以像表一样被查询。
4. 视图是否可更新取决于数据库和视图复杂度。
5. 简单视图通常可更新，复杂视图通常不可更新。
6. 即使视图可更新，视图定义条件也可能限制更新。
7. 更新视图导致行不再满足视图 `WHERE` 条件时，可能被拒绝或行消失。
8. 删除视图只删除定义，不影响底层表。
9. 视图不会提升性能，反而可能稍慢，但能提升可维护性。
10. 视图用于简化访问、安全控制、封装复杂逻辑。

核心记忆点：

```text
视图是虚拟表，不存储数据。
视图基于 SELECT 查询，每次访问重新执行。
简单视图可更新，复杂视图通常不可更新。
视图用于简化访问、隐藏数据、封装逻辑。
DROP VIEW 只删定义，不删数据。
```


