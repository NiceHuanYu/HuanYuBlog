---
title: MySQL 学习笔记 03：聚合、分组与输出控制
description: MySQL 学习笔记第三篇：COUNT/SUM/AVG 等聚合函数、GROUP BY 分组、HAVING 过滤、ORDER BY 与 LIMIT，以及一条 SELECT 的完整逻辑执行顺序。
date: 2026-10-09
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 3
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 6 聚合、分组与输出控制

## 6.0 示例数据

### Customers 表

| Id  | Name  | CountryCode | Age | Category | Email             |
| ---:| ----- | ----------- | ---:| -------- | ----------------- |
| 1   | Chia  | CN          | 22  | A        | chia@example.com  |
| 2   | Tom   | ML          | 18  | B        | NULL              |
| 3   | Alice | IND         | 25  | A        | alice@example.com |
| 4   | Bob   | CN          | 17  | C        | bob@example.com   |
| 5   | Chen  | CN          | 30  | A        | NULL              |
| 6   | Anna  | IND         | 28  | B        | anna@example.com  |
| 7   | Mike  | US          | 35  | C        | mike@example.com  |

### Orders 表

| OrderId | CustId | Amount |
| -------:| ------:| ------:|
| 1001    | 1      | 99     |
| 1002    | 3      | 150    |
| 1003    | 1      | 200    |
| 1004    | 5      | 50     |
| 1005    | 6      | 300    |
| 1006    | 1      | 20     |
| 1007    | 6      | 80     |

---

## 6.1 聚合函数与 GROUP BY

### 6.1.1 常用聚合函数

```sql
-- 统计总行数
SELECT COUNT(*) AS Total FROM Customers;

-- 结果：7
```

```sql
-- COUNT(Email) 只统计 Email 非 NULL 的行
SELECT COUNT(Email) AS EmailCount FROM Customers;

-- 结果：5
-- Tom、Chen 的 Email 为 NULL，不计数
```

```sql
-- COUNT(*) 包含 NULL；COUNT(列) 忽略 NULL
SELECT COUNT(*) AS Total, COUNT(Email) AS EmailCount
FROM Customers;

-- 结果：
-- Total = 7
-- EmailCount = 5
```

```sql
-- 求平均年龄
SELECT AVG(Age) AS AvgAge FROM Customers;

-- 结果：25
```

```sql
-- SUM、MIN、MAX
SELECT SUM(Age) AS SumAge,
       MIN(Age) AS MinAge,
       MAX(Age) AS MaxAge
FROM Customers;

-- 结果：
-- SumAge = 175
-- MinAge = 17
-- MaxAge = 35
```

```sql
-- COUNT(DISTINCT 列) 统计不同值的数量
SELECT COUNT(DISTINCT CountryCode) AS CountryNum,
       COUNT(DISTINCT Category) AS CategoryNum
FROM Customers;

-- 结果：
-- CountryNum = 4
-- CategoryNum = 3
```

注释：

- `COUNT(*)` 统计行数，包括 NULL。
- `COUNT(column)` 统计该列非 NULL 的行数。
- `AVG(column)`、`SUM(column)` 通常忽略 NULL。
- `SUM` 如果所有行都是 NULL，结果可能是 NULL，不是 0；必要时用 `COALESCE(SUM(...), 0)`。
- `COUNT(DISTINCT column)` 用于统计去重后的数量。

---

### 6.1.2 GROUP BY 单列分组

```sql
-- 查询有哪些国家
SELECT CountryCode
FROM Customers
GROUP BY CountryCode;

-- 结果：
-- CN
-- ML
-- IND
-- US
```

```sql
-- 每个国家的客户数
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode;

-- 结果：
-- CN   3
-- ML   1
-- IND  2
-- US   1
```

```sql
-- 每个国家的客户数和平均年龄
SELECT CountryCode,
       COUNT(*) AS Num,
       AVG(Age) AS AvgAge
FROM Customers
GROUP BY CountryCode;

-- 结果：
-- CN   3  23.0
-- ML   1  18.0
-- IND  2  26.5
-- US   1  35.0
```

作用：

- `GROUP BY` 把相同值的行归为一组。
- 每组只返回一行。
- 聚合函数对每一组进行计算。

---

### 6.1.3 GROUP BY 多列分组

```sql
-- 按国家和类别分组
SELECT CountryCode, Category, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode, Category
ORDER BY CountryCode, Category;

-- 结果：
-- CN   A  2
-- CN   C  1
-- IND  A  1
-- IND  B  1
-- ML   B  1
-- US   C  1
```

说明：

- 多列分组时，只有这些分组列的组合相同，才会被分到同一组。
- `ORDER BY` 只是控制输出顺序，不影响分组。

---

### 6.1.4 SELECT 中列与 GROUP BY 的规则

```sql
-- 错误示例：Name 没有在 GROUP BY 中，也不是聚合函数
SELECT CountryCode, Name, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode;
```

在启用 `ONLY_FULL_GROUP_BY` 的 MySQL 中会报错，因为一个国家有多个 `Name`，数据库不知道要显示哪一个。

正确写法：

```sql
-- 如果要显示 Name，就要把 Name 也放进 GROUP BY
SELECT CountryCode, Name, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode, Name;
```

但通常更好的做法是：

```sql
-- 只显示分组列和聚合结果
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode;
```

规则：

```text
SELECT 中的列，要么出现在 GROUP BY 中，
要么被聚合函数包起来。
```

---

### 6.1.5 WHERE 先过滤，再 GROUP BY

```sql
-- 先过滤出年龄 >= 18 的客户，再按国家统计
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
WHERE Age >= 18
GROUP BY CountryCode;

-- 结果：
-- CN   2   -- Chia 22、Chen 30
-- ML   1   -- Tom 18
-- IND  2   -- Alice 25、Anna 28
-- US   1   -- Mike 35
```

注释：

- `WHERE` 在分组前过滤单行。
- `GROUP BY` 对剩下的行分组。
- 如果过滤条件不依赖聚合结果，优先用 `WHERE`，性能通常更好。

---

## 6.2 HAVING

### 6.2.1 WHERE 与 HAVING 的区别

```sql
-- WHERE 过滤单行：只保留年龄 >= 18 的客户
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
WHERE Age >= 18
GROUP BY CountryCode;
```

```sql
-- HAVING 过滤分组：只保留客户数 > 1 的国家
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
HAVING COUNT(*) > 1;

-- 结果：
-- CN   3
-- IND  2
```

记忆：

```text
WHERE  → 分组前过滤行，不能直接用聚合函数。
HAVING → 分组后过滤组，通常包含聚合函数。
```

`HAVING` 也可以使用分组列，例如：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
HAVING CountryCode = 'CN';

-- 结果：
-- CN 3
```

但这种情况下，更推荐写成：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
WHERE CountryCode = 'CN'
GROUP BY CountryCode;
```

因为能提前过滤的行，不应该留到 `HAVING`。

---

### 6.2.2 HAVING 使用聚合条件

```sql
-- 客户数大于 1 的国家
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
HAVING COUNT(*) > 1;

-- 结果：
-- CN   3
-- IND  2
```

```sql
-- 平均年龄大于 20 的国家
SELECT CountryCode, AVG(Age) AS AvgAge
FROM Customers
GROUP BY CountryCode
HAVING AVG(Age) > 20;

-- 结果：
-- CN   23.0
-- IND  26.5
-- US   35.0
```

注意：

- `WHERE` 中不能写 `WHERE COUNT(*) > 1`。
- 因为 `WHERE` 执行时还没有分组，也没有聚合结果。

错误示例：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
WHERE COUNT(*) > 1
GROUP BY CountryCode;
-- 通常报错：Invalid use of group function
```

---

### 6.2.3 HAVING 带子查询

```sql
-- 找出客户数大于 IND 客户数的国家
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
HAVING COUNT(*) > (
    SELECT COUNT(*)
    FROM Customers
    WHERE CountryCode = 'IND'
);

-- IND 的客户数是 2
-- 所以结果是客户数 > 2 的国家

-- 结果：
-- CN 3
```

注释：

- 子查询返回单值，可以用于比较。
- 如果子查询返回多行，通常要用 `ALL`、`ANY` 或先聚合。
- `HAVING` 中的子查询可以引用外层分组结果，也可以独立查询。

---

### 6.2.4 JOIN 与 GROUP BY

```sql
-- 统计每个客户的订单数
SELECT C.Id, C.Name, COUNT(*) AS Num
FROM Customers C
JOIN Orders O ON C.Id = O.CustId
GROUP BY C.Id, C.Name;

-- 结果：
-- 1  Chia   3
-- 3  Alice  1
-- 5  Chen   1
-- 6  Anna   2
```

注释：

- `JOIN` 后可能产生多行，`GROUP BY` 用于按客户汇总。
- `COUNT(*)` 统计的是连接后的行数。
- 如果只想统计客户数量，不希望因为订单重复而重复计数，可以用 `COUNT(DISTINCT C.Id)`。

```sql
-- 统计有多少客户至少有一张订单
SELECT COUNT(DISTINCT C.Id) AS OrderedCustomerNum
FROM Customers C
JOIN Orders O ON C.Id = O.CustId;

-- 结果：4
```

---

### 6.2.5 HAVING 使用 SELECT 别名

MySQL 中可以在 `HAVING` 中使用别名：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
HAVING Num > 1;
```

但标准 SQL 不一定允许，跨数据库时更推荐写成：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
HAVING COUNT(*) > 1;
```

---

## 6.3 ORDER BY 与 LIMIT

### 6.3.1 ORDER BY 基本排序

```sql
-- 按年龄升序，默认 ASC
SELECT * FROM Customers
ORDER BY Age;

-- 结果年龄顺序：
-- Bob 17
-- Tom 18
-- Chia 22
-- Alice 25
-- Anna 28
-- Chen 30
-- Mike 35
```

```sql
-- 按年龄降序
SELECT * FROM Customers
ORDER BY Age DESC;

-- 结果年龄顺序：
-- Mike 35
-- Chen 30
-- Anna 28
-- Alice 25
-- Chia 22
-- Tom 18
-- Bob 17
```

注释：

- `ASC` 升序，默认。
- `DESC` 降序。
- `ORDER BY` 只影响输出顺序，不改变数据内容。

---

### 6.3.2 多列排序

```sql
-- 先按国家升序，再按年龄降序
SELECT CountryCode, Name, Age
FROM Customers
ORDER BY CountryCode ASC, Age DESC;

-- 结果：
-- CN   Chen  30
-- CN   Chia  22
-- CN   Bob   17
-- IND  Anna  28
-- IND  Alice 25
-- ML   Tom   18
-- US   Mike  35
```

作用：

- 第一列相同时，才比较第二列。
- 常用于“先按部门，再按工资降序”这类需求。

---

### 6.3.3 ORDER BY 聚合结果

```sql
-- 按每个国家的客户数降序
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
ORDER BY Num DESC;

-- 结果：
-- CN   3
-- IND  2
-- ML   1
-- US   1
```

也可以直接写聚合：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
ORDER BY COUNT(*) DESC;
```

如果人数相同，再按国家升序：

```sql
SELECT CountryCode, COUNT(*) AS Num
FROM Customers
GROUP BY CountryCode
ORDER BY Num DESC, CountryCode ASC;

-- 结果：
-- CN   3
-- IND  2
-- ML   1
-- US   1
```

---

### 6.3.4 LIMIT 基础

```sql
-- 只返回前 2 行
SELECT * FROM Customers
LIMIT 2;
```

注意：如果没有 `ORDER BY`，`LIMIT 2` 返回哪两行通常是不确定的，因为 SQL 表本身没有默认顺序。

所以更推荐：

```sql
-- 年龄最大的前 2 个客户
SELECT * FROM Customers
ORDER BY Age DESC
LIMIT 2;

-- 结果：
-- Mike 35
-- Chen 30
```

---

### 6.3.5 获取订单数最多的前 2 个客户

原笔记中写法：

```sql
SELECT CustID
FROM Customers
ORDER BY NumOfOrders DESC
LIMIT 2;
```

如果 `Customers` 表没有 `NumOfOrders` 列，这条 SQL 会失败。更常见的做法是从 `Orders` 聚合：

```sql
SELECT CustId, COUNT(*) AS NumOfOrders
FROM Orders
GROUP BY CustId
ORDER BY NumOfOrders DESC
LIMIT 2;

-- 结果：
-- 1  3
-- 6  2
```

解释：

- 先按客户分组。
- 统计每个客户的订单数。
- 按订单数降序。
- 取前 2 个。

---

### 6.3.6 LIMIT OFFSET 分页

```sql
-- 跳过前 2 行，取接下来的 2 行
SELECT * FROM Customers
ORDER BY Age DESC
LIMIT 2 OFFSET 2;

-- 年龄降序为：Mike 35、Chen 30、Anna 28、Alice 25...
-- 跳过 Mike、Chen，返回 Anna、Alice
```

MySQL 也支持：

```sql
SELECT * FROM Customers
ORDER BY Age DESC
LIMIT 2, 2;
-- 等价于 LIMIT 2 OFFSET 2
```

分页公式：

```text
第 1 页：LIMIT pageSize OFFSET 0
第 2 页：LIMIT pageSize OFFSET pageSize
第 3 页：LIMIT pageSize OFFSET 2 * pageSize
```

其他数据库：

- SQL Server：`TOP` 或 `OFFSET ... FETCH`
- Oracle：`FETCH FIRST n ROWS ONLY`
- PostgreSQL / SQLite / MySQL：通常支持 `LIMIT`

---

### 6.3.7 NULL 排序

```sql
SELECT * FROM Customers
ORDER BY Email;
```

不同数据库对 NULL 的排序不同。MySQL 中：

- `ASC`：NULL 通常排在最前。
- `DESC`：NULL 通常排在最后。

如果想让 NULL 固定排在最后：

```sql
SELECT * FROM Customers
ORDER BY Email IS NULL, Email;
```

解释：

- `Email IS NULL` 为 0 或 1。
- 非 NULL 为 0，排在前面。
- NULL 为 1，排在后面。

---

## 6.4 逻辑执行顺序

SQL 书写顺序：

```sql
SELECT ...
FROM ...
JOIN ...
WHERE ...
GROUP BY ...
HAVING ...
ORDER BY ...
LIMIT ...
```

逻辑执行顺序大致是：

```text
FROM / JOIN
→ WHERE
→ GROUP BY
→ HAVING
→ SELECT
→ DISTINCT
→ ORDER BY
→ LIMIT
```

这个顺序能解释很多规则：

```sql
-- WHERE 不能使用 SELECT 中定义的别名
SELECT Age + 1 AS NextAge
FROM Customers
WHERE NextAge > 20; -- 通常报错

-- ORDER BY 可以使用 SELECT 中定义的别名
SELECT Age + 1 AS NextAge
FROM Customers
ORDER BY NextAge DESC;
```

---

## 6.5 综合例子

### 6.5.1 每个国家客户数、平均年龄，过滤客户数 > 1，按人数降序，取前 2

```sql
SELECT CountryCode,
       COUNT(*) AS Num,
       AVG(Age) AS AvgAge
FROM Customers
GROUP BY CountryCode
HAVING COUNT(*) > 1
ORDER BY Num DESC
LIMIT 2;

-- 结果：
-- CN   3  23.0
-- IND  2  26.5
```

---

### 6.5.2 每个客户订单数、总金额，只显示总金额 > 100

```sql
SELECT C.Id,
       C.Name,
       COUNT(O.OrderId) AS OrderCount,
       COALESCE(SUM(O.Amount), 0) AS TotalAmount
FROM Customers C
LEFT JOIN Orders O ON C.Id = O.CustId
GROUP BY C.Id, C.Name
HAVING COALESCE(SUM(O.Amount), 0) > 100
ORDER BY TotalAmount DESC;

-- 结果：
-- 6  Anna   2  380
-- 1  Chia   3  319
-- 3  Alice  1  150
```

说明：

- 用 `LEFT JOIN` 可以保留没有订单的客户。
- `COUNT(O.OrderId)` 不会统计 NULL，所以无订单客户显示 0。
- `SUM(O.Amount)` 对无订单客户为 NULL，用 `COALESCE` 转成 0。
- `HAVING` 过滤的是分组后的总金额。

---

### 6.5.3 每个国家年龄最大的客户

```sql
SELECT C.CountryCode, C.Name, C.Age
FROM Customers C
JOIN (
    SELECT CountryCode, MAX(Age) AS MaxAge
    FROM Customers
    GROUP BY CountryCode
) M
  ON C.CountryCode = M.CountryCode
 AND C.Age = M.MaxAge;

-- 结果：
-- CN   Chen  30
-- ML   Tom   18
-- IND  Anna  28
-- US   Mike  35
```

说明：

- 子查询先求每个国家的最大年龄。
- 再和原表连接，找出对应客户。
- 如果同一个国家有多个同龄最大客户，会返回多行。

---

### 6.5.4 条件聚合：统计每个国家 25 岁及以上人数

```sql
SELECT CountryCode,
       SUM(CASE WHEN Age >= 25 THEN 1 ELSE 0 END) AS Age25Plus,
       COUNT(*) AS Total
FROM Customers
GROUP BY CountryCode;

-- 结果：
-- CN   1  3
-- ML   0  1
-- IND  2  2
-- US   1  1
```

作用：

- `CASE WHEN` 在聚合前把满足条件的行标记为 1，否则为 0。
- `SUM` 后得到满足条件的行数。
- 这是“条件统计”的常用写法。

---

## 6.6 常见坑总结

1. `WHERE` 不能直接使用聚合函数，例如 `WHERE COUNT(*) > 1` 是错的。
2. `HAVING` 用于过滤分组后的结果，通常包含聚合，也可以使用分组列。
3. `COUNT(*)` 包含 NULL，`COUNT(column)` 忽略 NULL。
4. `AVG(column)` 忽略 NULL，所以分母不是总行数，而是非 NULL 行数。
5. `SUM` 全为 NULL 时可能返回 NULL，可用 `COALESCE(SUM(...), 0)`。
6. `SELECT` 中非聚合列必须出现在 `GROUP BY` 中，否则可能报错。
7. `ORDER BY` 可以使用 `SELECT` 别名，`WHERE` 通常不可以。
8. `LIMIT` 最好和 `ORDER BY` 一起使用，否则返回顺序不确定。
9. `JOIN` 后 `COUNT(*)` 可能因为一对多关系而重复计数，必要用 `COUNT(DISTINCT ...)`。
10. `HAVING` 能晚过滤就晚过滤，但能提前用 `WHERE` 过滤的行应尽量放 `WHERE`，性能更好。
11. `ORDER BY` 在 `LIMIT` 之前逻辑执行，所以 `ORDER BY + LIMIT` 才能稳定取 Top N。
12. `GROUP BY` 后排序，通常排序的是分组列或聚合结果。

核心记忆点：

```text
WHERE 过滤行；
GROUP BY 分组；
聚合函数算每组；
HAVING 过滤组；
ORDER BY 排序；
LIMIT 截取；
COUNT(*) 含 NULL，COUNT(列) 不含 NULL。
```

---
