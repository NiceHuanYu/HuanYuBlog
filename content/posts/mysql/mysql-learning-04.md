---
title: MySQL 学习笔记 04：数据操纵（增删改）
description: MySQL 学习笔记第四篇：INSERT 插入（含批量插入与 INSERT ... SELECT）、UPDATE 更新、DELETE 删除，以及各自的坑。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 4
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 7 数据操纵：INSERT、UPDATE、DELETE

## 7.0 示例数据

### Customers 表

| CustomerID | CustomerName | Address   | Phone    | MemberCategory |
| ---------- | ------------ | --------- | -------- | -------------- |
| C001       | Alice        | Maple Ave   | 11111111 | Gold           |
| C002       | Bob          | Birch St     | 22222222 | Silver         |
| C003       | Chen         | Maple Street | 33333333 | Bronze         |
| C004       | David        | Marina    | 44444444 | Gold           |
| C005       | Emily Chen  | Chinatown | 55555555 | Silver         |

### PrestigeCustomers 表

初始数据：

| CustomerID | Name        | Address   | Phone    | MemberCategory |
| ---------- | ----------- | --------- | -------- | -------------- |
| C9000      | Emily Chen | Maple Street | NULL     | Silver         |
| C9001      | Tom         | Maple Ave   | 12345678 | Bronze         |
| C9002      | Anna        | Birch St     | 87654321 | Gold           |

说明：

- `PrestigeCustomers` 是“优质客户表”，可能从 `Customers` 中筛选插入。
- `Phone` 允许为 NULL；如果实际表要求 `NOT NULL`，插入时必须提供值。
- 下面所有例子都基于这两张表。

---

## 7.1 INSERT

`INSERT` 用于向表中插入新行。

基本语法：

```sql
INSERT INTO 表名 (列1, 列2, ...)
VALUES (值1, 值2, ...);
```

或者：

```sql
INSERT INTO 表名
VALUES (值1, 值2, ...);
```

---

### 7.1.1 单行插入（无列名）

```sql
-- 按表中列的定义顺序，提供所有列的值
INSERT INTO PublisherWebsite
VALUES ('Tim', 'www.timvideocompany.com');
```

注释：

- 不写列名时，`VALUES` 中的值必须和表中列的顺序、数量、类型一一对应。
- 如果表结构后续增加列，这种写法容易出错。
- 生产环境更推荐写列名。

执行效果：

```text
PublisherWebsite 表新增一行：
Tim | www.timvideocompany.com
```

---

### 7.1.2 单行插入（有列名）

```sql
-- 指定列名，只插入这些列
INSERT INTO PrestigeCustomers (CustomerID, Name, Address, MemberCategory)
VALUES ('C9000', 'Emily Chen', 'Maple Street', 'Silver');
```

执行效果：

```text
PrestigeCustomers 新增一行：
C9000 | Emily Chen | Maple Street | NULL | Silver
```

注释：

- 未指定的列 `Phone` 会使用默认值。
- 如果 `Phone` 没有默认值且允许 NULL，则插入 NULL。
- 如果 `Phone` 是 `NOT NULL` 且没有默认值，则插入失败。

错误示例：

```sql
-- 假设 Phone 和 Email 都是 NOT NULL 且无默认值
INSERT INTO PrestigeCustomers (CustomerID, Name, Address, MemberCategory)
VALUES ('C9001', 'Tom', 'Maple Ave', 'Bronze');
-- 会失败：Phone、Email 没有提供值
```

修正：

```sql
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, Email, MemberCategory)
VALUES
('C9001', 'Tom', 'Maple Ave', '12345678', 'tom@example.com', 'Bronze');
```

作用：

- 指定列名更安全、更清晰。
- 可以只插入部分列，但必须满足非空约束和默认值规则。

---

### 7.1.3 多行插入

```sql
-- 一次插入多行，性能通常比多次单行插入更好
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, MemberCategory)
VALUES
('C9001', 'Tom', 'Maple Ave', '12345678', 'Bronze'),
('C9002', 'Anna', 'Birch St', '87654321', 'Gold'),
('C9003', 'Mike', 'Marina', NULL, 'Silver');
```

执行效果：

```text
PrestigeCustomers 新增 3 行：
C9001 | Tom  | Maple Ave | 12345678 | Bronze
C9002 | Anna | Birch St   | 87654321 | Gold
C9003 | Mike | Marina  | NULL     | Silver
```

注释：

- 多行插入减少网络往返和 SQL 解析次数。
- 批量插入时，建议控制每批大小，例如 500～1000 行，避免事务过大。

---

### 7.1.4 使用查询插入

```sql
-- 从 Customers 查询数据，插入到 PrestigeCustomers
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, MemberCategory)
SELECT CustomerID, CustomerName, Address, Phone, MemberCategory
FROM Customers
WHERE MemberCategory IN ('Gold', 'Silver', 'Bronze');
```

执行效果：

假设 `Customers` 中 5 行都满足条件，则 `PrestigeCustomers` 新增 5 行。

```text
C001 | Alice       | Maple Ave   | 11111111 | Gold
C002 | Bob         | Birch St     | 22222222 | Silver
C003 | Chen        | Maple Street | 33333333 | Bronze
C004 | David       | Marina    | 44444444 | Gold
C005 | Emily Chen | Chinatown | 55555555 | Silver
```

注释：

- `INSERT INTO ... SELECT` 的列数、顺序、类型要匹配。
- `SELECT` 中列名不必和插入列名相同，但位置要对应。
- 可以用 `WHERE` 过滤要插入的数据。
- 如果目标表有唯一约束，重复插入可能失败。

---

### 7.1.5 INSERT 与默认值、自增列

```sql
-- 假设 Id 是自增列，可以省略
INSERT INTO Customers (CustomerName, Address, Phone, MemberCategory)
VALUES ('New Customer', 'New Address', '99999999', 'Bronze');
```

注释：

- 自增列通常不需要手动插入。
- 可以使用 `DEFAULT` 显式使用默认值：

```sql
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, MemberCategory)
VALUES
('C9010', 'Default Phone User', 'Somewhere', DEFAULT, 'Silver');
```

- 如果列允许 NULL，也可以显式插入 NULL：

```sql
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, MemberCategory)
VALUES
('C9011', 'Null Phone User', 'Somewhere', NULL, 'Silver');
```

---

### 7.1.6 插入冲突处理

如果表有主键或唯一索引，重复插入会报错。

MySQL 写法：

```sql
-- 遇到重复键则忽略
INSERT IGNORE INTO PrestigeCustomers
(CustomerID, Name, Address, MemberCategory)
VALUES ('C9000', 'Emily Chen', 'Maple Street', 'Silver');

-- 遇到重复键则更新
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, MemberCategory)
VALUES ('C9000', 'Emily Chen', 'Maple Street', 'Silver')
ON DUPLICATE KEY UPDATE
Name = VALUES(Name),
Address = VALUES(Address),
MemberCategory = VALUES(MemberCategory);
```

PostgreSQL 写法：

```sql
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, MemberCategory)
VALUES ('C9000', 'Emily Chen', 'Maple Street', 'Silver')
ON CONFLICT (CustomerID)
DO UPDATE SET
Name = EXCLUDED.Name,
Address = EXCLUDED.Address,
MemberCategory = EXCLUDED.MemberCategory;
```

作用：

- 避免重复插入报错。
- 可以实现“存在则更新，不存在则插入”的 UPSERT 效果。

---

## 7.2 UPDATE

`UPDATE` 用于修改表中已有行。

基本语法：

```sql
UPDATE 表名
SET 列1 = 值1, 列2 = 值2, ...
WHERE 条件;
```

---

### 7.2.1 更新所有行

```sql
-- 把 PrestigeCustomers 中所有行的 Phone 都改成 7775588
UPDATE PrestigeCustomers
SET Phone = 7775588;
```

执行效果：

```text
PrestigeCustomers 所有行的 Phone 都变成 7775588。
```

注释：

- 没有 `WHERE` 的 `UPDATE` 会更新全表。
- 这是非常危险的操作，生产环境必须谨慎。
- 执行前建议先用 `SELECT` 查看要影响的行。

安全习惯：

```sql
-- 先查询确认
SELECT * FROM PrestigeCustomers WHERE Phone IS NULL;

-- 再更新
UPDATE PrestigeCustomers
SET Phone = 7775588
WHERE Phone IS NULL;
```

---

### 7.2.2 选择性更新

```sql
-- 只更新 Name 为 Emily Chen 的行
UPDATE PrestigeCustomers
SET Phone = 7775588
WHERE Name = 'Emily Chen';
```

执行效果：

```text
只有 Emily Chen 的 Phone 变成 7775588。
其他行不变。
```

注释：

- `WHERE` 是 UPDATE 的安全线。
- 如果 `WHERE` 条件匹配多行，就会更新多行。
- 如果 `WHERE` 没有匹配行，则影响 0 行。

---

### 7.2.3 同时更新多列

```sql
UPDATE PrestigeCustomers
SET Phone = 7775588,
    Address = 'Maple Street',
    MemberCategory = 'Gold'
WHERE CustomerID = 'C9000';
```

执行效果：

```text
C9000 的 Phone、Address、MemberCategory 都被修改。
```

注释：

- `SET` 后多个赋值用逗号分隔。
- 可以更新为常量、表达式、函数、子查询结果。

---

### 7.2.4 使用表达式更新

```sql
-- 所有 Gold 客户年龄增加 1 岁
UPDATE Customers
SET Age = Age + 1
WHERE MemberCategory = 'Gold';
```

注释：

- `SET` 中可以使用原列值进行计算。
- 常用于计数、累加、状态变更。

---

### 7.2.5 带子查询更新

```sql
-- 把 Bronze 客户的电话改成 7775588
UPDATE PrestigeCustomers
SET Phone = 7775588
WHERE CustomerID IN (
    SELECT CustomerID
    FROM Customers
    WHERE MemberCategory = 'Bronze'
);
```

执行效果：

```text
PrestigeCustomers 中 CustomerID 属于 Bronze 客户的行，Phone 被更新。
```

注释：

- 原笔记中写的是 `PhoneNumber = 7775588`，如果实际列名是 `Phone`，请改成 `Phone`。
- 子查询用于确定要更新哪些行。
- 注意子查询返回 NULL 时，`IN` 可能不匹配任何行。

---

### 7.2.6 UPDATE JOIN

MySQL 中可以使用 JOIN 更新：

```sql
UPDATE PrestigeCustomers P
JOIN Customers C ON P.CustomerID = C.CustomerID
SET P.MemberCategory = C.MemberCategory,
    P.Phone = C.Phone
WHERE C.MemberCategory = 'Gold';
```

作用：

- 根据另一张表的数据更新当前表。
- 比子查询更直观，性能也可能更好。

PostgreSQL 写法：

```sql
UPDATE PrestigeCustomers P
SET MemberCategory = C.MemberCategory,
    Phone = C.Phone
FROM Customers C
WHERE P.CustomerID = C.CustomerID
  AND C.MemberCategory = 'Gold';
```

---

### 7.2.7 使用 CASE 条件更新

```sql
UPDATE PrestigeCustomers
SET MemberCategory =
    CASE
        WHEN Phone IS NULL THEN 'Unknown'
        WHEN Phone = 7775588 THEN 'Gold'
        ELSE 'Silver'
    END;
```

作用：

- 根据不同条件设置不同值。
- 适合批量分类、状态标记。

---

### 7.2.8 UPDATE 与事务

```sql
START TRANSACTION;

UPDATE PrestigeCustomers
SET Phone = 7775588
WHERE Name = 'Emily Chen';

-- 先查看结果
SELECT * FROM PrestigeCustomers WHERE Name = 'Emily Chen';

-- 如果不对，回滚
ROLLBACK;

-- 如果正确，提交
-- COMMIT;
```

注释：

- 事务可以保证一组操作要么全部成功，要么全部失败。
- 更新前开启事务，出错时可以回滚。
- 不是所有数据库默认都支持事务，例如 MyISAM 不支持。

---

## 7.3 DELETE

`DELETE` 用于删除表中已有行。

基本语法：

```sql
DELETE FROM 表名
WHERE 条件;
```

---

### 7.3.1 删除所有行

```sql
-- 删除 PrestigeCustomers 所有行
DELETE FROM PrestigeCustomers;
```

执行效果：

```text
PrestigeCustomers 变成空表。
表结构仍然存在。
```

注释：

- 没有 `WHERE` 的 `DELETE` 会删除全表数据。
- 删除后表还在，只是没有数据。
- 在支持事务的数据库中，可以通过 `ROLLBACK` 恢复。

安全习惯：

```sql
-- 先查询要删除的行
SELECT * FROM PrestigeCustomers;

-- 再删除
DELETE FROM PrestigeCustomers;
```

---

### 7.3.2 删除选中行

```sql
-- 只删除 Bronze 客户
DELETE FROM PrestigeCustomers
WHERE MemberCategory = 'Bronze';
```

执行效果：

```text
PrestigeCustomers 中 MemberCategory = 'Bronze' 的行被删除。
其他行保留。
```

注释：

- `WHERE` 是 DELETE 的安全线。
- 如果条件匹配多行，会删除多行。
- 如果条件不匹配任何行，影响 0 行。

---

### 7.3.3 带子查询删除

```sql
-- 删除属于 Gold 客户的 PrestigeCustomers 行
DELETE FROM PrestigeCustomers
WHERE CustomerID IN (
    SELECT CustomerID
    FROM Customers
    WHERE MemberCategory = 'Gold'
);
```

执行效果：

```text
PrestigeCustomers 中 CustomerID 是 Gold 客户的行被删除。
```

注释：

- 子查询用于确定删除范围。
- 如果子查询返回 NULL，`IN` 可能不匹配任何行。
- 在 MySQL 中，不能直接在 `DELETE` 的子查询中查询同一张表，需要派生表：

```sql
DELETE FROM PrestigeCustomers
WHERE CustomerID IN (
    SELECT CustomerID FROM (
        SELECT CustomerID
        FROM PrestigeCustomers
        WHERE MemberCategory = 'Bronze'
    ) AS T
);
```

---

### 7.3.4 DELETE JOIN

MySQL 中可以使用 JOIN 删除：

```sql
DELETE P
FROM PrestigeCustomers P
JOIN Customers C ON P.CustomerID = C.CustomerID
WHERE C.MemberCategory = 'Gold';
```

作用：

- 根据另一张表的条件删除当前表数据。
- `DELETE P` 表示删除别名 P 对应的表。

PostgreSQL 写法：

```sql
DELETE FROM PrestigeCustomers P
USING Customers C
WHERE P.CustomerID = C.CustomerID
  AND C.MemberCategory = 'Gold';
```

---

### 7.3.5 DELETE 与 TRUNCATE 对比

```sql
-- 删除所有行，可以带 WHERE，可以回滚，速度较慢
DELETE FROM PrestigeCustomers;

-- 清空表，不能带 WHERE，通常不能回滚，速度较快
TRUNCATE TABLE PrestigeCustomers;
```

对比：



| 特性             | DELETE       | TRUNCATE   |
| ---------------- | ------------ | ---------- |
| 是否可带 WHERE   | 可以         | 不可以     |
| 删除范围         | 满足条件的行 | 全表       |
| 是否记录逐行删除 | 是           | 通常否     |
| 速度             | 较慢         | 较快       |
| 是否可回滚       | 通常可以     | 通常不可以 |
| 自增计数器       | 通常不重置   | 通常重置   |
| 触发器           | 会触发       | 通常不触发 |

注释：

- 需要删除部分数据用 `DELETE`。
- 需要快速清空全表用 `TRUNCATE`。
- 生产环境清空表前必须确认备份和事务策略。

---

### 7.3.6 外键约束与删除

如果 `PrestigeCustomers` 被其他表引用，删除可能失败。

```sql
-- 假设 Orders 表有外键引用 PrestigeCustomers
DELETE FROM PrestigeCustomers WHERE CustomerID = 'C9000';
-- 如果 Orders 中有对应订单，可能报错：
-- Cannot delete or update a parent row: a foreign key constraint fails
```

外键行为：

- `RESTRICT` / `NO ACTION`：有引用时禁止删除。
- `CASCADE`：删除主表行时，自动删除子表相关行。
- `SET NULL`：删除主表行时，子表外键设为 NULL。

示例：

```sql
-- 建表时指定级联删除
FOREIGN KEY (CustomerID)
REFERENCES PrestigeCustomers(CustomerID)
ON DELETE CASCADE;
```

注释：

- 级联删除很危险，可能误删大量数据。
- 删除前要了解外键约束。

---

## 7.4 综合示例

### 7.4.1 插入、更新、删除完整流程

```sql
-- 1. 插入新客户
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, MemberCategory)
VALUES
('C9100', 'Emily Chen', 'Maple Street', NULL, 'Silver');

-- 2. 更新电话
UPDATE PrestigeCustomers
SET Phone = 7775588
WHERE CustomerID = 'C9100';

-- 3. 查看
SELECT * FROM PrestigeCustomers WHERE CustomerID = 'C9100';

-- 4. 删除
DELETE FROM PrestigeCustomers
WHERE CustomerID = 'C9100';
```

执行效果：

```text
先新增 C9100；
再把 C9100 的 Phone 改为 7775588；
查询可以看到更新后的行；
最后删除 C9100。
```

---

### 7.4.2 从 Customers 批量插入 Gold 客户

```sql
INSERT INTO PrestigeCustomers
(CustomerID, Name, Address, Phone, MemberCategory)
SELECT CustomerID, CustomerName, Address, Phone, MemberCategory
FROM Customers
WHERE MemberCategory = 'Gold';
```

执行效果：

```text
Customers 中所有 Gold 客户被复制到 PrestigeCustomers。
```

---

### 7.4.3 根据 Customers 更新 PrestigeCustomers

```sql
UPDATE PrestigeCustomers P
JOIN Customers C ON P.CustomerID = C.CustomerID
SET P.Phone = C.Phone,
    P.MemberCategory = C.MemberCategory
WHERE C.MemberCategory IN ('Gold', 'Silver');
```

执行效果：

```text
PrestigeCustomers 中匹配的客户，电话和会员类别被同步为 Customers 中的值。
```

---

### 7.4.4 删除没有对应客户的 PrestigeCustomers

```sql
DELETE P
FROM PrestigeCustomers P
LEFT JOIN Customers C ON P.CustomerID = C.CustomerID
WHERE C.CustomerID IS NULL;
```

作用：

- 找出 `PrestigeCustomers` 中在 `Customers` 里不存在的客户。
- 删除这些“孤立”记录。

---

## 7.5 常见坑总结

1. `INSERT` 不写列名时，必须按表定义顺序提供所有列的值。
2. 省略非空且无默认值的列，`INSERT` 会失败。
3. `INSERT INTO ... SELECT` 的列数、顺序、类型必须匹配。
4. 批量插入时，注意唯一约束冲突。
5. `UPDATE` 不带 `WHERE` 会更新全表，非常危险。
6. `DELETE` 不带 `WHERE` 会删除全表，非常危险。
7. 执行 `UPDATE`、`DELETE` 前，先用 `SELECT` 确认影响范围。
8. `UPDATE` 的子查询如果返回多行，要使用 `IN`、`EXISTS` 等正确处理。
9. `DELETE` 的子查询在 MySQL 中不能直接查同一张表，需要派生表。
10. `TRUNCATE` 不能带 `WHERE`，通常不能回滚，且可能重置自增。
11. 外键约束可能导致删除失败，也可能级联删除。
12. 事务中执行 `UPDATE`、`DELETE`，确认后再 `COMMIT`，出错可 `ROLLBACK`。
13. `NULL` 判断要用 `IS NULL`，不要用 `= NULL`。
14. 更新或删除前最好备份，或至少开启事务。
15. 生产环境避免全表更新、全表删除、无 `WHERE` 操作。

核心记忆点：

```text
INSERT 插入新行，注意列顺序和非空约束；
UPDATE 修改数据，WHERE 是安全线；
DELETE 删除数据，WHERE 是安全线；
TRUNCATE 快速清空全表，不能带 WHERE；
事务可以保护 UPDATE、DELETE；
先 SELECT 确认，再改删。
```
