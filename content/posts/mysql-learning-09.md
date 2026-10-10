---
title: MySQL 学习笔记 09：约束与数据完整性
description: MySQL 学习笔记第九篇：SQL 约束——NOT NULL、CHECK、PRIMARY KEY、FOREIGN KEY 等如何保证数据完整性，以及它们的对比。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 9
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 12 SQL 约束 (Constraints) 与数据完整性

## 12.0 示例表结构

### Producers 表（父表）

| ProducerId | ProducerName | CountryCode |
| ---------- | ------------ | ----------- |
| P001       | TimVideo     | SG          |
| P002       | ABC Films    | US          |

### ProducerWebSite 表

| Producer | WebSite          | Country |
| -------- | ---------------- | ------- |
| TimVideo | www.timvideo.com | SG      |

### StockAdjustment 表

| VideoCode | AdjustmentQty | DateAdjusted | WhoAdjust | AdjustReason |
| --------- | -------------:| ------------ | --------- | ------------ |
| 100       | 5             | 2026-10-01   | Alice     | Restock      |
| 200       | -3            | 2026-10-02   | Bob       | Damaged      |

### Orders 表（依赖表）

| OrderId | CustId | Amount |
| -------:| ------ | ------:|
| 1001    | C1     | 99     |
| 1002    | C2     | 150    |

---

## 12.1 数据完整性丢失的情况

数据完整性指的是数据在存储、修改、删除过程中始终保持正确、一致、有效。

原笔记列出：

- 无效数据添加到数据库。
- 现有数据被修改为不正确的值。
- 数据被错误删除。
- 在创建数据库对象时，SQL 可通过约束强制数据完整性。

注释与示例：

```sql
-- 情况 1：插入无效数据
INSERT INTO StockAdjustment (VideoCode, AdjustmentQty)
VALUES (-1, 5);
-- 如果 VideoCode 表示商品编号，负数就是不合理的值

-- 情况 2：把现有数据改成不正确值
UPDATE StockAdjustment
SET AdjustmentQty = 'abc'
WHERE VideoCode = 100;
-- 类型不匹配，或数值超出业务允许范围

-- 情况 3：错误删除数据
DELETE FROM Customers
WHERE CustomerId = 'C1';
-- 如果 Orders 表中还有引用 C1 的订单，就会造成孤立数据

-- 情况 4：插入重复主键
INSERT INTO Producers (ProducerId, ProducerName, CountryCode)
VALUES ('P001', 'NewName', 'CN');
-- P001 已存在，实体完整性被破坏

-- 情况 5：插入不存在的引用
INSERT INTO Orders (OrderId, CustId, Amount)
VALUES (1003, 'C999', 50);
-- C999 在 Customers 中不存在，引用完整性被破坏
```

作用：

- 约束在数据库层面拦截这些非法操作。
- 约束比应用层校验更可靠，因为所有程序都经过数据库。
- 约束减少数据修复成本。

---

## 12.2 约束类型

### 12.2.1 Required Data（必需数据）

- 通常转化为不可接受 NULL 值的字段。

```sql
CREATE TABLE ProducerWebSite (
  Producer varchar(50) not null,
  WebSite varchar(200) not null,
  Country varchar(50),
  PRIMARY KEY (Producer)
);
```

注释：

- `not null` 表示该列必须有值。
- `Producer`、`WebSite` 不能为 NULL。
- `Country` 没有写 `not null`，所以允许为 NULL。
- `PRIMARY KEY (Producer)` 同时要求 `Producer` 唯一且非空。

执行效果：

```sql
-- 成功
INSERT INTO ProducerWebSite (Producer, WebSite, Country)
VALUES ('TimVideo', 'www.timvideo.com', 'SG');

-- 失败：Producer 为 NULL
INSERT INTO ProducerWebSite (Producer, WebSite)
VALUES (NULL, 'www.example.com');

-- 成功：Country 为 NULL
INSERT INTO ProducerWebSite (Producer, WebSite)
VALUES ('ABC Films', 'www.abc.com');
```

作用：

- 保证关键字段必须有值。
- 防止业务数据缺失。
- 常用于主键、名称、状态、时间等字段。

常见可空性选择：

| 场景             | 是否 NOT NULL    |
| ---------------- | ---------------- |
| 主键             | 是               |
| 外键（可选关系） | 否               |
| 名称、标题       | 是               |
| 电话号码、备注   | 通常否           |
| 创建时间         | 是（常用默认值） |

---

### 12.2.2 Validity Checking（有效性检查）

- 列具有特定范围或格式，通常使用 Check Constraint（检查约束）。

```sql
CREATE TABLE StockAdjustment (
  VideoCode smallInt not null,
  AdjustmentQty int,
  DateAdjusted datetime,
  WhoAdjust varchar(20),
  AdjustReason varchar(50),
  CONSTRAINT Con_VideoCode CHECK (VideoCode BETWEEN 0 AND 99999)
);
```

注释：

- `VideoCode smallInt not null`：视频编号，不能为空。
- `Con_VideoCode CHECK (VideoCode BETWEEN 0 AND 99999)`：
  - 约束名为 `Con_VideoCode`。
  - `VideoCode` 必须在 0 到 99999 之间。
- `BETWEEN 0 AND 99999` 包含两端。

执行效果：

```sql
-- 成功
INSERT INTO StockAdjustment (VideoCode, AdjustmentQty)
VALUES (100, 5);

-- 失败：超出范围
INSERT INTO StockAdjustment (VideoCode, AdjustmentQty)
VALUES (100000, 5);

-- 失败：为负数
INSERT INTO StockAdjustment (VideoCode, AdjustmentQty)
VALUES (-1, 5);
```

更多检查约束示例：

```sql
-- 数量必须大于 0
CONSTRAINT Con_Qty CHECK (AdjustmentQty > 0)

-- 日期不能早于 2000-01-01
CONSTRAINT Con_Date CHECK (DateAdjusted >= '2000-01-01')

-- 多列条件
CONSTRAINT Con_Range CHECK (VideoCode >= 0 AND VideoCode <= 99999)

-- 枚举式检查
CONSTRAINT Con_Status CHECK (Status IN ('Active', 'Inactive', 'Pending'))

-- 字符串长度
CONSTRAINT Con_NameLen CHECK (CHAR_LENGTH(WhoAdjust) >= 2)
```

作用：

- 限制列值在业务允许范围内。
- 防止明显错误的数据进入表。
- 减少应用层重复校验。

注意事项：

- 检查约束在插入和更新时自动执行。
- 不同数据库对 `CHECK` 支持程度不同，MySQL 8.0 以前支持较弱。
- `CHECK` 不应用于跨表校验，跨表校验通常用外键。

---

### 12.2.3 Entity Integrity Constraint（实体完整性约束）

- 表中每行在特定列上具有唯一值，通常使用 UNIQUE 约束或 PRIMARY KEY 约束。

```sql
CREATE TABLE Producers (
  ProducerId varchar(50) not null,
  ProducerName varchar(50) not null UNIQUE,
  CountryCode varchar(3) not null,
  PRIMARY KEY (ProducerId, ProducerName)
);
```

注释：

- `ProducerId not null`：不能为空。
- `ProducerName not null UNIQUE`：不能为空，且值必须唯一。
- `CountryCode not null`：不能为空。
- `PRIMARY KEY (ProducerId, ProducerName)`：复合主键，两列组合必须唯一且非空。

执行效果：

```sql
-- 成功
INSERT INTO Producers (ProducerId, ProducerName, CountryCode)
VALUES ('P001', 'TimVideo', 'SG');

-- 成功：ProducerId 重复但 ProducerName 不同，组合唯一
INSERT INTO Producers (ProducerId, ProducerName, CountryCode)
VALUES ('P001', 'ABC Films', 'US');

-- 失败：ProducerName 重复，违反 UNIQUE
INSERT INTO Producers (ProducerId, ProducerName, CountryCode)
VALUES ('P002', 'TimVideo', 'CN');

-- 失败：ProducerId + ProducerName 组合重复，违反 PRIMARY KEY
INSERT INTO Producers (ProducerId, ProducerName, CountryCode)
VALUES ('P001', 'TimVideo', 'US');
```

主键与 UNIQUE 的区别：

| 特性           | PRIMARY KEY | UNIQUE                  |
| -------------- | ----------- | ----------------------- |
| 是否允许 NULL  | 不允许      | 通常允许一个或多个 NULL |
| 每表数量       | 只能一个    | 可以有多个              |
| 是否自动建索引 | 是          | 是                      |
| 用途           | 唯一标识行  | 保证列值不重复          |

作用：

- 保证每行可被唯一标识。
- 防止重复记录。
- 为外键提供引用目标。

---

### 12.2.4 Referential Integrity Constraint（引用完整性约束）

- 外键中的每个非空值必须在所引用的主键中有对应值。
- 在依赖表中插入行或更新列时，必须满足：
  - 父表中存在对应的主键值，或
  - 外键值设置为 NULL。
- 示例：`CUSTOMER` 为父表，`ORDER` 为依赖表；插入 `ORDER` 的 `customerID` 为 `C3` 时，若 `CUSTOMER` 中不存在 `C3`，则违反引用完整性。

示例：

```sql
CREATE TABLE Customers (
  CustomerId varchar(10) not null,
  CustomerName varchar(50) not null,
  PRIMARY KEY (CustomerId)
);

CREATE TABLE Orders (
  OrderId int not null,
  CustId varchar(10),
  Amount decimal(10,2),
  PRIMARY KEY (OrderId),
  FOREIGN KEY (CustId) REFERENCES Customers(CustomerId)
);
```

注释：

- `Customers` 是父表，`CustomerId` 是主键。
- `Orders` 是依赖表，`CustId` 是外键。
- `CustId` 可以为 NULL，表示订单暂时没有关联客户。
- 如果 `CustId` 非空，则必须在 `Customers` 中存在对应 `CustomerId`。

执行效果：

```sql
-- 先插入父表数据
INSERT INTO Customers (CustomerId, CustomerName)
VALUES ('C1', 'Alice'), ('C2', 'Bob');

-- 成功：C1 存在
INSERT INTO Orders (OrderId, CustId, Amount)
VALUES (1001, 'C1', 99);

-- 成功：CustId 为 NULL
INSERT INTO Orders (OrderId, CustId, Amount)
VALUES (1002, NULL, 50);

-- 失败：C3 在 Customers 中不存在
INSERT INTO Orders (OrderId, CustId, Amount)
VALUES (1003, 'C3', 80);
```

删除和更新行为：

```sql
-- 删除被引用的父表行
DELETE FROM Customers WHERE CustomerId = 'C1';
-- 如果 Orders 中有 CustId = 'C1' 的行，可能失败
-- 错误：违反引用完整性
```

外键的引用动作：

```sql
FOREIGN KEY (CustId) REFERENCES Customers(CustomerId)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

| 动作                     | 含义                                 |
| ------------------------ | ------------------------------------ |
| `RESTRICT` / `NO ACTION` | 有引用时禁止删除或更新               |
| `CASCADE`                | 父表删除或更新时，子表自动删除或更新 |
| `SET NULL`               | 父表删除或更新时，子表外键设为 NULL  |
| `SET DEFAULT`            | 父表删除或更新时，子表外键设为默认值 |

作用：

- 保证子表中的引用在父表中一定存在。
- 防止孤立数据。
- 维护表与表之间的一致性。

---

## 12.3 约束对比总结

| 约束       | 作用               | 关键字                       |
| ---------- | ------------------ | ---------------------------- |
| 必需数据   | 不允许 NULL        | `NOT NULL`                   |
| 有效性检查 | 限制取值范围或格式 | `CHECK`                      |
| 实体完整性 | 保证行唯一标识     | `PRIMARY KEY`、`UNIQUE`      |
| 引用完整性 | 保证外键引用有效   | `FOREIGN KEY ... REFERENCES` |

约束命名示例：

```sql
CREATE TABLE StockAdjustment (
  VideoCode smallInt not null,
  AdjustmentQty int,
  DateAdjusted datetime,
  WhoAdjust varchar(20),
  AdjustReason varchar(50),
  CONSTRAINT PK_StockAdjustment PRIMARY KEY (VideoCode),
  CONSTRAINT Con_VideoCode CHECK (VideoCode BETWEEN 0 AND 99999),
  CONSTRAINT Con_Qty CHECK (AdjustmentQty > 0)
);
```

命名好处：

- 便于后续删除或修改约束。
- 报错信息更清晰。
- 数据库结构更易维护。

---

## 12.4 常见坑总结

1. `NOT NULL` 表示必须有值，不写则允许 NULL。
2. `PRIMARY KEY` 不允许 NULL，`UNIQUE` 通常允许 NULL。
3. 一个表只能有一个主键，但可以有多个 `UNIQUE`。
4. `CHECK` 用于单表范围校验，不用于跨表校验。
5. 外键列可以为 NULL，表示暂时没有引用。
6. 插入外键值前，父表中必须存在对应主键值。
7. 删除父表行时，受外键引用动作影响。
8. `ON DELETE CASCADE` 可能造成大量数据被自动删除，要谨慎使用。
9. 添加约束前，现有数据必须满足约束，否则添加失败。
10. 约束应在建表时定义，也可通过 `ALTER TABLE` 添加。
11. 不同数据库对 `CHECK`、`UNIQUE`、外键行为的支持有差异。
12. 约束是数据库层面的最后防线，应用层校验不能替代约束。

核心记忆点：

```text
NOT NULL    → 必须有值
CHECK       → 值必须在允许范围内
PRIMARY KEY → 唯一且非空，标识一行
UNIQUE      → 值不能重复
FOREIGN KEY → 引用必须存在
约束保证数据完整性，防止无效、重复、孤立数据。
```
