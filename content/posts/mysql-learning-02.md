---
title: MySQL 学习笔记 02：SELECT 查询与过滤
description: MySQL 学习笔记第二篇：SELECT 的基本语法与逻辑执行顺序，WHERE 过滤（比较、LIKE、IN、BETWEEN、NULL）、各种 JOIN、UNION 与子查询。
date: 2026-10-09
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 2
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 5 SELECT 查询与过滤

## 5.0 示例数据

### Customers 表

| Id  | Name  | Race | Age | Email             |
| ---:| ----- | ---- | ---:| ----------------- |
| 1   | Chia  | CN   | 22  | chia@example.com  |
| 2   | Tom   | ML   | 18  | NULL              |
| 3   | Alice | IND  | 25  | alice@example.com |
| 4   | Bob   | CN   | 17  | bob@example.com   |
| 5   | Chen  | CN   | 30  | NULL              |

### Orders 表

| OrderId | CustId | Amount |
| -------:| ------:| ------:|
| 1001    | 1      | 99     |
| 1002    | 3      | 150    |
| 1003    | 1      | 200    |

### IssueTrans 表

| Id  | CustomerId | VideoCode |
| ---:| ----------:| --------- |
| 1   | 1          | V001      |
| 2   | 3          | V002      |
| 3   | 6          | V999      |

### Employees 表

| Id  | Name   | ReportsTo |
| ---:| ------ | ---------:|
| 1   | Boss   | NULL      |
| 2   | StaffA | 1         |
| 3   | StaffB | 1         |
| 4   | StaffC | 2         |

### USA_Customers / Europe_Customers

USA_Customers：

| Id  | Name |
| ---:| ---- |
| 10  | John |
| 11  | Mike |

Europe_Customers：

| Id  | Name |
| ---:| ---- |
| 11  | Mike |
| 12  | Anna |

---

## 5.1 SELECT 基本语法

```sql
SELECT {[ALL | DISTINCT]} [(select-column, ...)]
FROM (table, ...)
{JOIN (table) ON (join condition)}
{WHERE (search condition) {[AND | OR] (search condition)...}}
{GROUP BY (group-column, ...)}
{HAVING (search condition)}
{ORDER BY (sort-column, ...)}
```

注释：

- `{}` 表示可选部分，`|` 表示“或”。
- `SELECT`：选择要返回的列，可以是列名、表达式、函数、子查询。
- `ALL`：默认，保留重复行。
- `DISTINCT`：去除结果集中的重复行，作用于整行，不是只作用于某一列。
- `FROM`：指定数据来源表。
- `JOIN`：连接其他表。
- `WHERE`：过滤行，不能直接使用聚合函数。
- `GROUP BY`：分组。
- `HAVING`：过滤分组后的结果，可以使用聚合函数。
- `ORDER BY`：排序。

SQL 书写顺序与逻辑执行顺序不同，逻辑执行顺序大致为：

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

理解这个顺序很重要，例如：

```sql
-- WHERE 中通常不能使用 SELECT 中定义的别名
SELECT Age + 1 AS NextAge
FROM Customers
WHERE NextAge > 20; -- 很多数据库中会报错

-- ORDER BY 中通常可以使用 SELECT 中定义的别名
SELECT Age + 1 AS NextAge
FROM Customers
ORDER BY NextAge DESC;
```

---

## 5.2 基础查询

```sql
-- 查询所有列
SELECT * FROM Customers;

-- 结果：返回 Customers 表全部行、全部列
```

```sql
-- 只查询指定列
SELECT Id, Name FROM Customers;

-- 结果：
-- 1  Chia
-- 2  Tom
-- 3  Alice
-- 4  Bob
-- 5  Chen
```

```sql
-- DISTINCT 去重：查询有哪些 Race
SELECT DISTINCT Race FROM Customers;

-- 结果：
-- CN
-- ML
-- IND
```

```sql
-- 使用别名 AS，让结果列名更易读
SELECT Id AS CustomerId, Name AS CustomerName
FROM Customers;

-- 结果列名变为 CustomerId、CustomerName
```

```sql
-- SELECT 中可以使用表达式
SELECT Name, Age, Age + 1 AS NextAge
FROM Customers;

-- 结果：
-- Chia   22   23
-- Tom    18   19
-- Alice  25   26
-- Bob    17   18
-- Chen   30   31
```

作用说明：

- `SELECT *` 方便查看数据，但生产环境通常不推荐，因为列顺序、新增列、网络传输和索引覆盖都可能受影响。
- `DISTINCT` 会对整行结果去重。
- 别名常用于提高可读性，也常用于 `ORDER BY`。

---

## 5.3 WHERE 过滤

`WHERE` 用于过滤行。常见运算符：

```text
=  !=  <>  >  >=  <  <=
AND  OR  NOT
LIKE  IN  BETWEEN  IS NULL
```

### 5.3.1 比较与逻辑运算

```sql
-- 查询种族为 CN 的客户
SELECT * FROM Customers WHERE Race = 'CN';

-- 结果：
-- 1 Chia CN 22 chia@example.com
-- 4 Bob  CN 17 bob@example.com
-- 5 Chen CN 30 NULL
```

```sql
-- NOT：查询不是 CN 的客户
SELECT * FROM Customers WHERE NOT (Race = 'CN');

-- 等价于：
SELECT * FROM Customers WHERE Race != 'CN';
-- 或
SELECT * FROM Customers WHERE Race <> 'CN';

-- 结果：
-- 2 Tom   ML  18 NULL
-- 3 Alice IND 25 alice@example.com
```

注意：如果 `Race` 为 `NULL`，`Race != 'CN'` 和 `NOT (Race = 'CN')` 都不会返回该行，因为 `NULL` 比较结果是 `UNKNOWN`。

```sql
-- AND：必须同时满足
SELECT * FROM Customers WHERE Race = 'CN' AND Age >= 21;

-- 结果：
-- 1 Chia CN 22
-- 5 Chen CN 30
```

```sql
-- OR：满足任意一个即可
SELECT * FROM Customers WHERE Race = 'CN' OR Age >= 21;

-- 结果：
-- 1 Chia  CN  22
-- 3 Alice IND 25
-- 4 Bob   CN  17
-- 5 Chen  CN  30
```

逻辑优先级：

```text
NOT > AND > OR
```

建议使用括号明确优先级：

```sql
SELECT *
FROM Customers
WHERE (Race = 'CN' OR Race = 'ML')
  AND Age >= 18;
```

### 5.3.2 LIKE 模式匹配

```sql
-- 以 Chia 开头
SELECT * FROM Customers WHERE Name LIKE 'Chia%';

-- 结果：
-- 1 Chia CN 22 chia@example.com
```

```sql
-- 包含字母 a
SELECT * FROM Customers WHERE Name LIKE '%a%';

-- 结果可能包括 Chia、Alice 等
```

```sql
-- _ 表示任意单个字符
SELECT * FROM Customers WHERE Name LIKE '_hia';

-- 结果：
-- Chia
```

注释：

- `%`：任意长度，包括 0 个字符。
- `_`：任意单个字符。
- `LIKE` 是否区分大小写取决于数据库和排序规则。MySQL 默认通常不区分大小写。

### 5.3.3 IN 集合匹配

```sql
-- 查询种族是 ML 或 IND 的客户
SELECT * FROM Customers WHERE Race IN ('ML', 'IND');

-- 等价于：
SELECT * FROM Customers WHERE Race = 'ML' OR Race = 'IND';

-- 结果：
-- 2 Tom   ML  18
-- 3 Alice IND 25
```

### 5.3.4 BETWEEN 范围匹配

```sql
-- 查询年龄在 18 到 25 之间，包含边界
SELECT * FROM Customers WHERE Age BETWEEN 18 AND 25;

-- 等价于：
SELECT * FROM Customers WHERE Age >= 18 AND Age <= 25;

-- 结果：
-- 1 Chia  22
-- 2 Tom   18
-- 3 Alice 25
```

### 5.3.5 NULL 判断

```sql
-- 查询没有填写邮箱的客户
SELECT * FROM Customers WHERE Email IS NULL;

-- 结果：
-- 2 Tom  NULL
-- 5 Chen NULL
```

```sql
-- 查询填写了邮箱的客户
SELECT * FROM Customers WHERE Email IS NOT NULL;

-- 结果：
-- 1 Chia
-- 3 Alice
-- 4 Bob
```

错误写法：

```sql
SELECT * FROM Customers WHERE Email = NULL;
-- 不会返回任何行，因为 NULL 不能用 = 判断
```

处理 NULL 的常用函数：

```sql
-- 如果 Email 为 NULL，显示“无邮箱”
SELECT Name, COALESCE(Email, '无邮箱') AS Email
FROM Customers;
```

### 5.3.6 子查询作为过滤条件

```sql
-- 原笔记写法：假设 Customers 表也有 CustId 列
SELECT * FROM Customers 
WHERE CustId IN (SELECT CustId FROM Orders);

-- 更常见写法：Customers 主键是 Id，Orders 外键是 CustId
SELECT * FROM Customers
WHERE Id IN (SELECT CustId FROM Orders);

-- 结果：
-- 1 Chia
-- 3 Alice
```

使用 `EXISTS` 也可以：

```sql
SELECT * FROM Customers C
WHERE EXISTS (
    SELECT 1
    FROM Orders O
    WHERE O.CustId = C.Id
);

-- 结果：
-- 1 Chia
-- 3 Alice
```

作用说明：

- `IN` 适合判断某个值是否在子查询结果集合中。
- `EXISTS` 适合判断“是否存在满足条件的关联行”。
- `NOT IN` 要小心子查询结果中有 `NULL`，可能导致整个条件不成立。

---

## 5.4 JOIN 连接

JOIN 用于把多个表按关联条件组合起来。

### 5.4.1 INNER JOIN

```sql
SELECT C.Id, C.Name, T.VideoCode
FROM Customers C
JOIN IssueTrans T ON C.Id = T.CustomerId;

-- JOIN 默认就是 INNER JOIN，仅返回匹配行

-- 结果：
-- 1 Chia  V001
-- 3 Alice V002
```

说明：

- `IssueTrans` 中 `CustomerId = 6` 在 `Customers` 中没有对应客户，所以不会出现在结果中。
- `Customers` 中 2、4、5 没有对应 `IssueTrans`，也不会出现。

### 5.4.2 LEFT JOIN

```sql
SELECT C.Id, C.Name, T.VideoCode
FROM Customers C
LEFT JOIN IssueTrans T ON C.Id = T.CustomerId;

-- LEFT JOIN 保留左表所有行，右表无匹配则显示 NULL

-- 结果：
-- 1 Chia  V001
-- 2 Tom   NULL
-- 3 Alice V002
-- 4 Bob   NULL
-- 5 Chen  NULL
```

### 5.4.3 RIGHT JOIN

```sql
SELECT C.Id, C.Name, T.VideoCode
FROM Customers C
RIGHT JOIN IssueTrans T ON C.Id = T.CustomerId;

-- RIGHT JOIN 保留右表所有行，左表无匹配则显示 NULL

-- 结果：
-- 1    Chia  V001
-- 3    Alice V002
-- NULL NULL  V999
```

### 5.4.4 找“没有匹配”的行

```sql
SELECT C.Id, C.Name
FROM Customers C
LEFT JOIN IssueTrans T ON C.Id = T.CustomerId
WHERE T.Id IS NULL;

-- 结果：
-- 2 Tom
-- 4 Bob
-- 5 Chen
```

作用：找出没有对应交易记录的客户。

### 5.4.5 自连接

```sql
SELECT Staff.Name AS StaffName, Supervisor.Name AS SupervisorName
FROM Employees Staff
JOIN Employees Supervisor ON Staff.ReportsTo = Supervisor.Id;

-- 结果：
-- StaffA Boss
-- StaffB Boss
-- StaffC StaffA
```

说明：

- `Employees` 自己连接自己，必须使用别名区分两张表。
- `Boss` 的 `ReportsTo` 是 `NULL`，没有上级，因此内连接中不出现。
- 如果改成 `LEFT JOIN`，则 `Boss` 也会出现，上级为 `NULL`。

```sql
SELECT Staff.Name AS StaffName, Supervisor.Name AS SupervisorName
FROM Employees Staff
LEFT JOIN Employees Supervisor ON Staff.ReportsTo = Supervisor.Id;

-- 结果：
-- Boss   NULL
-- StaffA Boss
-- StaffB Boss
-- StaffC StaffA
```

### 5.4.6 ON 与 WHERE 的区别

```sql
-- 只连接 VideoCode = 'V001' 的记录，但保留所有客户
SELECT C.Id, C.Name, T.VideoCode
FROM Customers C
LEFT JOIN IssueTrans T
  ON C.Id = T.CustomerId
 AND T.VideoCode = 'V001';

-- 结果：
-- 1 Chia  V001
-- 2 Tom   NULL
-- 3 Alice NULL
-- 4 Bob   NULL
-- 5 Chen  NULL
```

```sql
-- 如果把右表过滤条件放到 WHERE，会过滤掉右表为 NULL 的行
SELECT C.Id, C.Name, T.VideoCode
FROM Customers C
LEFT JOIN IssueTrans T ON C.Id = T.CustomerId
WHERE T.VideoCode = 'V001';

-- 结果类似 INNER JOIN：
-- 1 Chia V001
```

结论：

- 左连接中，右表的过滤条件放 `ON`：保留左表所有行。
- 右表的过滤条件放 `WHERE`：可能把左连接变成内连接效果。

### 5.4.7 多表 JOIN

```sql
SELECT C.Name, O.OrderId, T.VideoCode
FROM Customers C
JOIN Orders O ON C.Id = O.CustId
JOIN IssueTrans T ON C.Id = T.CustomerId;

-- Chia 有两个订单，同时有 V001 交易，因此可能出现多行组合
-- 例如：
-- Chia  1001 V001
-- Chia  1003 V001
-- Alice 1002 V002
```

如果只想看客户列表，不关心订单明细，可使用 `DISTINCT`：

```sql
SELECT DISTINCT C.Id, C.Name
FROM Customers C
JOIN Orders O ON C.Id = O.CustId;
```

---

## 5.5 UNION 合并结果

```sql
SELECT * FROM USA_Customers
UNION
SELECT * FROM Europe_Customers;

-- UNION 会去重

-- 结果：
-- 10 John
-- 11 Mike
-- 12 Anna
```

```sql
SELECT * FROM USA_Customers
UNION ALL
SELECT * FROM Europe_Customers;

-- UNION ALL 不去重，性能通常更好

-- 结果：
-- 10 John
-- 11 Mike
-- 11 Mike
-- 12 Anna
```

注意：

- `UNION` 要求前后两个查询列数相同、类型兼容。
- 结果列名通常取第一个 `SELECT` 的列名。
- `ORDER BY` 一般写在最后一个查询之后。
- `UNION` 是纵向合并行；`JOIN` 是横向合并列。

---

## 5.6 子查询 vs JOIN

子查询和 JOIN 经常可以互相改写。

```sql
-- 子查询：只做过滤
SELECT * FROM Customers
WHERE Id IN (SELECT CustId FROM Orders);

-- 结果：
-- 1 Chia
-- 3 Alice
```

```sql
-- JOIN：可以同时返回多张表的列
SELECT C.Id, C.Name, O.OrderId
FROM Customers C
JOIN Orders O ON C.Id = O.CustId;

-- 结果：
-- 1 Chia  1001
-- 1 Chia  1003
-- 3 Alice 1002
```

```sql
-- 如果只想要客户信息，不想要订单重复，可以 DISTINCT
SELECT DISTINCT C.Id, C.Name
FROM Customers C
JOIN Orders O ON C.Id = O.CustId;

-- 结果：
-- 1 Chia
-- 3 Alice
```

相关子查询：

```sql
SELECT * FROM Customers C
WHERE EXISTS (
    SELECT 1
    FROM Orders O
    WHERE O.CustId = C.Id
);
```

标量子查询：

```sql
SELECT Name,
       (SELECT COUNT(*) FROM Orders O WHERE O.CustId = C.Id) AS OrderCount
FROM Customers C;

-- 结果：
-- Chia  2
-- Tom   0
-- Alice 1
-- Bob   0
-- Chen  0
```

FROM 子查询，也叫派生表：

```sql
SELECT *
FROM (
    SELECT Id, Name
    FROM Customers
    WHERE Age >= 18
) AS Adult;

-- 结果：
-- 1 Chia
-- 2 Tom
-- 3 Alice
-- 5 Chen
```

总结：

- 子查询适合“只用于过滤”或“返回单值”。
- JOIN 适合需要同时获取多张表字段。
- JOIN 可能因为一对多关系产生重复行，必要时加 `DISTINCT`。
- MySQL 等数据库优化器可能会把部分子查询改写成 JOIN。
- 性能不能只看写法，还要看索引、数据量、执行计划。

---

## 5.7 常见坑总结

1. `NULL` 不能用 `= NULL` 判断，要用 `IS NULL`、`IS NOT NULL`。
2. `NOT IN` 子查询中如果有 `NULL`，可能导致结果为空。
3. `WHERE` 不能直接使用聚合函数，聚合过滤应放 `HAVING`。
4. `WHERE` 通常不能使用 `SELECT` 中定义的别名，`ORDER BY` 通常可以。
5. `LEFT JOIN` 中右表过滤条件放 `ON` 和 `WHERE` 效果不同。
6. `JOIN` 忘记写 `ON` 或 `ON` 条件错误，会产生笛卡尔积。
7. `UNION` 会去重，`UNION ALL` 不去重；如果不需要去重，优先 `UNION ALL`。
8. `SELECT *` 方便但不适合生产环境，容易受表结构变化影响。
9. `DISTINCT` 作用于整行，不是只作用于第一列。
10. 一对多 JOIN 会产生重复行，需要根据业务决定是否 `DISTINCT` 或聚合。
11. `LIKE` 大小写敏感性取决于数据库和排序规则。
12. 性能问题要看索引和执行计划，不能简单认为“JOIN 一定比子查询快”或反之。
