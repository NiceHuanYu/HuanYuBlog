---
title: MySQL 学习笔记 08：DROP 与 ALTER
description: MySQL 学习笔记第八篇：DROP 删除数据库对象、ALTER 修改表结构，以及常见的坑。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 8
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 11 DROP 与 ALTER

## 11.0 示例表结构

### GoodCustomers 表

| CustomerID | CustomerName | Address | PhoneNumber | MemberCategory |
| ---------- | ------------ | ------- | ----------- | -------------- |
| C001       | Alice        | Maple Ave | 11111111    | Gold           |
| C002       | Bob          | Birch St   | 22222222    | Silver         |

主键约束名：`PK_GoodCustomers`

### Country 表

| CountryCode | CountryName   |
| ----------- | ------------- |
| CN          | China         |
| US          | United States |

### BookLoans 表

| TransactionID | CustomerId | BookCode |
| ------------- | ---------- | --------- |
| T001          | C001       | B001      |
| T002          | C002       | B002      |

### Customers 表

| CustomerId | CustomerName |
| ---------- | ------------ |
| C001       | Alice        |
| C002       | Bob          |

---

## 11.1 DROP（删除对象）

`DROP` 用于删除数据库对象，例如表、视图、索引等。

- `DROP` 删除的是对象本身。
- `DELETE` 删除的是表中的行。
- `TRUNCATE` 清空表中的所有行，但表结构还在。

对比：

| 命令             | 删除对象 | 删除数据     | 表结构是否保留 |
| ---------------- | -------- | ------------ | -------------- |
| `DROP TABLE`     | 表       | 是           | 否             |
| `DELETE FROM`    | 否       | 部分或全部行 | 是             |
| `TRUNCATE TABLE` | 否       | 全部行       | 是             |
| `DROP INDEX`     | 索引     | 否           | 表结构保留     |

---

### 11.1.1 DROP TABLE

```sql
-- 删除 GoodCustomers 表
DROP TABLE GoodCustomers;
```

执行效果：

```text
GoodCustomers 表及其所有数据被删除。
表结构、索引、约束等一并删除。
之后不能再查询该表。
```

注释：

- `DROP TABLE` 会删除表定义和表中所有数据。
- 删除后通常无法通过 `ROLLBACK` 恢复，除非数据库支持 DDL 事务。
- 如果表被其他表的外键引用，删除可能失败。
- 有些数据库支持 `DROP TABLE IF EXISTS`，避免表不存在时报错。

示例：

```sql
-- 如果表存在则删除，避免报错
DROP TABLE IF EXISTS GoodCustomers;
```

作用：

- 彻底移除不再需要的表。
- 清理测试表或临时表。

---

### 11.1.2 DROP INDEX

```sql
-- MySQL 语法：删除 GoodCustomers 表上的 Cust_idx 索引
DROP INDEX Cust_idx ON GoodCustomers;
```

执行效果：

```text
GoodCustomers 表上的 Cust_idx 索引被删除。
表数据和表结构仍然保留。
查询仍然可以执行，但可能变慢。
```

注释：

- 删除索引只影响查询性能，不影响数据。
- 不同数据库删除索引语法不同：

```sql
-- PostgreSQL / Oracle
DROP INDEX Cust_idx;

-- SQL Server
DROP INDEX Cust_idx ON GoodCustomers;
```

作用：

- 移除不再需要的索引。
- 减少索引维护成本，提高写入速度。
- 释放索引占用的存储空间。

---

### 11.1.3 DROP VIEW

```sql
-- 删除视图
DROP VIEW CN_Customers;
```

执行效果：

```text
视图 CN_Customers 被删除。
底层表和数据不受影响。
```

注释：

- 视图是虚拟表，不存储数据。
- 删除视图只删除视图定义。
- 有些数据库支持 `DROP VIEW IF EXISTS`。

作用：

- 移除不再使用的视图定义。
- 不影响底层表。

---

## 11.2 ALTER（修改对象）

`ALTER` 用于修改已有数据库对象的结构。

常见操作：

- 添加列
- 删除列
- 修改列
- 添加/删除主键
- 添加/删除唯一键
- 添加/删除外键

---

### 11.2.1 添加列

```sql
-- 向 GoodCustomers 表添加 CustomerPassword 列
ALTER TABLE GoodCustomers
ADD CustomerPassword varchar(25);
```

执行效果：

```text
GoodCustomers 表新增一列 CustomerPassword。
已有行的 CustomerPassword 为 NULL（除非指定默认值）。
```

添加列后表结构：

| CustomerID | CustomerName | Address | PhoneNumber | MemberCategory | CustomerPassword |
| ---------- | ------------ | ------- | ----------- | -------------- | ---------------- |
| C001       | Alice        | Maple Ave | 11111111    | Gold           | NULL             |
| C002       | Bob          | Birch St   | 22222222    | Silver         | NULL             |

注释：

- `ADD` 用于添加新列。
- 可以同时指定默认值：

```sql
ALTER TABLE GoodCustomers
ADD CustomerPassword varchar(25) DEFAULT '123456';
```

- 如果指定 `NOT NULL` 且没有默认值，已有行会导致添加失败。

作用：

- 扩展表结构，增加新属性。
- 不影响已有数据行，但新列为 NULL 或默认值。

---

### 11.2.2 删除列

```sql
-- 删除 GoodCustomers 表的 CustomerPassword 列
ALTER TABLE GoodCustomers
DROP COLUMN CustomerPassword;
```

执行效果：

```text
GoodCustomers 表删除 CustomerPassword 列。
该列中的所有数据一并丢失。
其他列和数据保留。
```

注释：

- `DROP COLUMN` 会删除列定义和该列数据。
- 删除前应确认没有程序依赖该列。
- 如果该列被索引、约束引用，可能需要先删除索引或约束。

作用：

- 移除不再需要的列。
- 简化表结构。

---

### 11.2.3 修改列

```sql
-- 修改列类型或长度，不同数据库语法不同
-- MySQL
ALTER TABLE GoodCustomers
MODIFY CustomerName VARCHAR(100);

-- SQL Server
ALTER TABLE GoodCustomers
ALTER COLUMN CustomerName VARCHAR(100);
```

执行效果：

```text
CustomerName 列的长度从 50 变为 100。
已有数据通常保留，但可能受新类型限制。
```

注释：

- 修改列类型可能导致数据截断或转换失败。
- 扩大长度通常安全，缩小长度要谨慎。
- 不同数据库语法差异较大。

作用：

- 调整列的数据类型、长度、默认值等。
- 适应业务变化。

---

### 11.2.4 删除主键

原笔记写法：

```sql
ALTER TABLE GoodCustomers DROP PK_GoodCustomers;
```

更标准的写法通常是：

```sql
-- SQL Server / PostgreSQL
ALTER TABLE GoodCustomers
DROP CONSTRAINT PK_GoodCustomers;

-- MySQL
ALTER TABLE GoodCustomers
DROP PRIMARY KEY;
```

执行效果：

```text
GoodCustomers 表的主键约束被删除。
表和数据仍然存在。
但不能再依靠主键保证唯一性和非空。
```

注释：

- 主键约束通常有名称，删除时需要使用约束名。
- 如果主键被外键引用，删除可能失败。
- 删除主键后，可以重新添加新的主键。

作用：

- 移除旧主键。
- 为重新定义主键做准备。

---

### 11.2.5 添加主键

```sql
-- 向 Country 表添加主键
ALTER TABLE Country
ADD PRIMARY KEY (CountryCode);
```

执行效果：

```text
Country 表的 CountryCode 成为主键。
CountryCode 必须唯一且非空。
如果已有重复或 NULL 值，添加会失败。
```

注释：

- 添加主键要求列值唯一且非空。
- 一个表通常只能有一个主键。
- 可以指定约束名：

```sql
ALTER TABLE Country
ADD CONSTRAINT PK_Country PRIMARY KEY (CountryCode);
```

作用：

- 唯一标识表中的每一行。
- 保证实体完整性。

---

### 11.2.6 添加唯一键

```sql
-- 向 BookLoans 表添加唯一约束
ALTER TABLE BookLoans
ADD UNIQUE (TransactionID);
```

执行效果：

```text
BookLoans 表的 TransactionID 值必须唯一。
允许 NULL（取决于数据库），但多个 NULL 的行为可能不同。
```

注释：

- 唯一键保证列或列组合的值不重复。
- 唯一键可以有多个，主键只能有一个。
- 可以命名约束：

```sql
ALTER TABLE BookLoans
ADD CONSTRAINT UQ_BookLoans_TransactionID
UNIQUE (TransactionID);
```

作用：

- 防止重复值。
- 可以作为外键引用的候选键。

---

### 11.2.7 添加外键

```sql
-- 向 BookLoans 表添加外键
ALTER TABLE BookLoans
ADD FOREIGN KEY (CustomerId)
REFERENCES Customers (CustomerId);
```

执行效果：

```text
BookLoans 表的 CustomerId 必须存在于 Customers 表的 CustomerId 中。
插入不存在的 CustomerId 会失败。
删除被引用的 Customers 行可能失败。
```

注释：

- 外键用于保证引用完整性。
- 添加外键前，现有数据必须满足引用关系。
- 可以命名约束：

```sql
ALTER TABLE BookLoans
ADD CONSTRAINT FK_BookLoans_Customers
FOREIGN KEY (CustomerId)
REFERENCES Customers (CustomerId);
```

作用：

- 保证子表中的外键值在主表中存在。
- 防止无效引用。

---

### 11.2.8 删除外键 / 唯一键

```sql
-- 删除外键约束
ALTER TABLE BookLoans
DROP CONSTRAINT FK_BookLoans_Customers;

-- 删除唯一约束
ALTER TABLE BookLoans
DROP CONSTRAINT UQ_BookLoans_TransactionID;
```

注释：

- 删除约束需要知道约束名。
- 不同数据库语法可能不同：

```sql
-- MySQL 删除外键
ALTER TABLE BookLoans
DROP FOREIGN KEY FK_BookLoans_Customers;

-- MySQL 删除唯一约束
ALTER TABLE BookLoans
DROP INDEX UQ_BookLoans_TransactionID;
```

作用：

- 移除不再需要的约束。
- 为修改表结构做准备。

---

## 11.3 常见坑总结

1. `DROP TABLE` 会删除表结构和数据，不可轻易恢复。
2. `DROP INDEX` 只删除索引，不影响表数据。
3. `ALTER TABLE ADD COLUMN` 添加的新列，已有行为 NULL 或默认值。
4. `ALTER TABLE DROP COLUMN` 会删除该列所有数据。
5. 添加主键要求列值唯一且非空。
6. 添加外键要求现有数据满足引用完整性。
7. 删除主键或外键时，通常需要知道约束名。
8. 不同数据库 `ALTER` 语法差异较大，尤其是修改列、删除约束。
9. 生产环境执行 `DROP`、`ALTER` 前应备份，并在事务中确认。
10. DDL 语句通常会自动提交，回滚行为取决于数据库。

核心记忆点：

```text
DROP 删除对象：表、视图、索引等。
ALTER 修改对象：加列、删列、改列、加约束、删约束。
DROP TABLE 删表和数据；
DROP INDEX 只删索引；
ALTER TABLE ADD COLUMN 加列；
ALTER TABLE DROP COLUMN 删列；
ALTER TABLE ADD PRIMARY KEY / UNIQUE / FOREIGN KEY 加约束。
```
