---
title: MySQL 学习笔记 06：CREATE TABLE 与数据类型
description: MySQL 学习笔记第六篇：CREATE TABLE 的完整语法、常用数据类型的选型建议，以及外键的两种定义方式。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 6
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 9 CREATE TABLE 与数据类型

## 9.0 示例约定

假设我们有一个数据库 `VideoStore`，其中已有表 `Producers`：

| Producer  |
| --------- |
| TimVideo  |
| ABC Films |

下面围绕 `GoodCustomers`、`shirts`、`ProducerWebSite` 等表进行说明。

---

## 9.1 CREATE TABLE 语法

### 9.1.1 基本语法

```sql
CREATE TABLE GoodCustomers (
  CustomerID varchar(4) not null,
  CustomerName varchar(50) not null,
  Address varchar(65) not null,
  PhoneNumber varchar(9),
  MemberCategory varchar(10) not null,
  PRIMARY KEY (CustomerID, MemberCategory)
);
```

注释：

- `CREATE TABLE GoodCustomers`：创建名为 `GoodCustomers` 的表。
- 表包含五列：
  - `CustomerID`：`varchar(4)`，非空。
  - `CustomerName`：`varchar(50)`，非空。
  - `Address`：`varchar(65)`，非空。
  - `PhoneNumber`：`varchar(9)`，可为 NULL。
  - `MemberCategory`：`varchar(10)`，非空。
- `PRIMARY KEY (CustomerID, MemberCategory)`：复合主键，由两列组成。

作用：

- 定义表结构、列名、列类型和约束。
- `NOT NULL` 表示该列插入时必须提供值。
- 不写 `NOT NULL` 的列默认可为 NULL。
- 复合主键要求两列组合唯一，且两列都不能为 NULL。

示例效果：

```text
创建后，GoodCustomers 表结构：
CustomerID      varchar(4)   NOT NULL
CustomerName    varchar(50)  NOT NULL
Address         varchar(65)  NOT NULL
PhoneNumber     varchar(9)   NULL
MemberCategory  varchar(10)  NOT NULL
主键：(CustomerID, MemberCategory)
```

插入示例：

```sql
INSERT INTO GoodCustomers
(CustomerID, CustomerName, Address, PhoneNumber, MemberCategory)
VALUES
('C001', 'Alice', 'Orchard', '11111111', 'Gold');

-- 成功

INSERT INTO GoodCustomers
(CustomerID, CustomerName, Address, MemberCategory)
VALUES
('C002', 'Bob', 'Bugis', 'Silver');

-- 成功，PhoneNumber 为 NULL

INSERT INTO GoodCustomers
(CustomerID, CustomerName, Address, PhoneNumber, MemberCategory)
VALUES
('C001', 'Alice', 'Orchard', '11111111', 'Gold');

-- 失败：主键 (C001, Gold) 重复
```

---

### 9.1.2 复合主键

```sql
PRIMARY KEY (CustomerID, MemberCategory)
```

注释：

- 复合主键由多列共同组成。
- 单独 `CustomerID` 可以重复，单独 `MemberCategory` 也可以重复。
- 但 `CustomerID + MemberCategory` 的组合必须唯一。

示例：

| CustomerID | MemberCategory | 是否允许     |
| ---------- | -------------- | ------------ |
| C001       | Gold           | 允许         |
| C001       | Silver         | 允许         |
| C002       | Gold           | 允许         |
| C001       | Gold           | 不允许，重复 |

作用：

- 用于表示“多对多”关系中的联合唯一标识。
- 例如一个客户可以在不同会员类别下各有一条记录。

---

### 9.1.3 命名约束

可使用命名约束的替代语法

示例：

```sql
CREATE TABLE GoodCustomers (
  CustomerID varchar(4) not null,
  CustomerName varchar(50) not null,
  Address varchar(65) not null,
  PhoneNumber varchar(9),
  MemberCategory varchar(10) not null,
  CONSTRAINT pk_good_customers
    PRIMARY KEY (CustomerID, MemberCategory)
);
```

注释：

- `CONSTRAINT pk_good_customers` 给主键约束起名。
- 起名便于后续删除或修改约束。
- 不起名时，数据库会自动生成一个名称。

删除命名约束示例：

```sql
ALTER TABLE GoodCustomers
DROP CONSTRAINT pk_good_customers;
```

作用：

- 约束命名让数据库结构更清晰。
- 在迁移、维护时更容易定位约束。

---

## 9.2 数据类型选择

### 9.2.1 字符串类型

```text
VARCHAR(n)：变长字符串，n 是最大字符数，必须指定。
CHAR(n)：定长字符串，最多 255 字符。
TEXT：大文本，分 TINYTEXT / TEXT / MEDIUMTEXT / LONGTEXT 四档（TEXT 上限 65535 字节，LONGTEXT 约 4GB），存储在行外，行内只留指针。
ENUM：固定常量字符串组，只能取列出的值之一。
```

MySQL 没有单独的"Unicode 字符串类型"：列里的长度按**字符**算，一个字符占几字节由列的字符集决定。默认字符集是 `utf8mb4`，所以 `VARCHAR(40)` 直接就能存中文、日文，不需要换成别的类型。

注释与示例：

```sql
-- VARCHAR：变长，最常用
CREATE TABLE ExampleVarchar (
  Name VARCHAR(40)
);

-- CHAR：定长，适合国家代码这类长度固定的编码
CREATE TABLE ExampleChar (
  CountryCode CHAR(2)
);

-- TEXT：大文本，存储在行外
CREATE TABLE ExampleText (
  Description TEXT
);
```

同样的 `VARCHAR` 列，在 utf8mb4 下可以直接塞进中文：

```sql
INSERT INTO ExampleVarchar (Name) VALUES ('张三');
SELECT Name, CHAR_LENGTH(Name) AS 字符数, LENGTH(Name) AS 字节数 FROM ExampleVarchar;
-- 张三   2   6
```

作用对比：

| 类型         | 是否变长 | 长度怎么算         | 适用场景                   |
| ------------ | -------- | ------------------ | -------------------------- |
| `VARCHAR(n)` | 是       | 最多 n 个**字符**  | 姓名、邮箱、标题这类文本   |
| `CHAR(n)`    | 否       | 固定 n 个字符      | 国家代码、状态码           |
| `TEXT`       | 是       | 上限以字节计       | 文章正文、备注这类大段文本 |
| `ENUM`       | 否       | 只能取列出的常量   | 状态、尺寸、类别等有限选项 |

示例：

```sql
CREATE TABLE shirts (
  name VARCHAR(40),
  size ENUM('x-small', 'small', 'medium', 'large', 'x-large')
);

INSERT INTO shirts (name, size) VALUES
('dress shirt', 'large'),
('t-shirt', 'medium'),
('polo shirt', 'small');

SELECT name, size FROM shirts WHERE size = 'medium';
```

执行效果：

```text
name         size
-----------  -------
t-shirt      medium
```

注释：

- `ENUM` 限定只能取列出的值。
- 插入未列出的值会失败或警告，取决于数据库设置。
- `VARCHAR` / `CHAR` 都必须指定长度，MySQL 里这个长度算的是**字符数**，不是字节数。
- `TEXT` 通常不能直接设默认值，也不能直接建普通索引，具体取决于数据库。

---

### 9.2.2 数值类型

```text
INT：整数。
DECIMAL(M, D)：精确数值，M 为总位数（精度），D 为小数位数。例如 100.45 是 DECIMAL(5,2)。最多 65 位。用于财务数据。
DOUBLE：近似数值，最多 15 位小数。
FLOAT：近似数值，最多 7 位小数。
```

注释与示例：

```sql
CREATE TABLE Product (
  Id INT,
  Price DECIMAL(10,2),
  Weight DOUBLE,
  Temperature FLOAT
);
```

解释：

- `INT`：整数，例如 `1`、`100`、`-5`。
- `DECIMAL(10,2)`：总共 10 位，其中 2 位小数。例如 `12345678.90`。
- `DOUBLE`：双精度浮点，约 15 位有效数字。
- `FLOAT`：单精度浮点，约 7 位有效数字。

精确与近似：

```sql
-- DECIMAL 精确计算
SELECT CAST(0.1 AS DECIMAL(5,2)) + CAST(0.2 AS DECIMAL(5,2));
-- 结果：0.30

-- 注意：MySQL 里直接写 0.1 + 0.2 得到的是 0.3，
-- 因为这两个字面量被当作 DECIMAL 处理，没有经过浮点
SELECT 0.1 + 0.2;
-- 结果：0.3

-- 想看到浮点误差，得显式用浮点数
SELECT 0.1E0 + 0.2E0;
-- 结果：0.30000000000000004
```

作用：

- 财务数据必须使用 `DECIMAL`，避免浮点误差。
- GPS 坐标、科学测量可用 `DOUBLE`。
- 温度等精度要求不高的可用 `FLOAT`。
- `INT` 用于计数、编号、年龄等。

示例：

```sql
CREATE TABLE FinancialRecord (
  Id INT PRIMARY KEY,
  Amount DECIMAL(10,2) NOT NULL,
  TaxRate FLOAT,
  Latitude DOUBLE
);
```

---

### 9.2.3 日期时间类型

```text
DATE, DATETIME, TIMESTAMP
```

注释与示例：

```sql
CREATE TABLE Event (
  EventId INT PRIMARY KEY,
  EventDate DATE,
  CreatedAt DATETIME,
  UpdatedAt TIMESTAMP
);
```

解释：

- `DATE`：只存日期，例如 `2026-10-10`。
- `DATETIME`：日期和时间，例如 `2026-10-10 14:30:00`。
- `TIMESTAMP`：时间戳，通常与时区有关，不同数据库行为不同。

插入示例：

```sql
INSERT INTO Event (EventId, EventDate, CreatedAt, UpdatedAt)
VALUES (1, '2026-10-10', '2026-10-10 14:30:00', CURRENT_TIMESTAMP);
```

作用：

- `DATE` 用于生日、节假日等。
- `DATETIME` 用于订单创建时间、日志时间。
- `TIMESTAMP` 常用于记录最后修改时间。

---

### 9.2.4 ENUM 类型

```sql
CREATE TABLE shirts (
  name VARCHAR(40),
  size ENUM('x-small', 'small', 'medium', 'large', 'x-large')
);
```

注释：

- `ENUM` 是固定常量字符串组。
- 只能插入列出的值之一。
- 适合状态、尺寸、类别等有限选项。

插入示例：

```sql
INSERT INTO shirts (name, size) VALUES ('dress shirt', 'large');
INSERT INTO shirts (name, size) VALUES ('t-shirt', 'medium');
INSERT INTO shirts (name, size) VALUES ('polo shirt', 'small');

-- 插入不存在的值会失败
INSERT INTO shirts (name, size) VALUES ('hat', 'extra-large');
-- 错误：'extra-large' 不在 ENUM 列表中
```

查询示例：

```sql
SELECT name, size FROM shirts WHERE size = 'medium';
-- 结果：t-shirt | medium
```

作用：

- 限制取值范围，保证数据一致性。
- 比自由文本更安全。
- 不同数据库对 ENUM 支持不同，MySQL 支持较好，SQL Server 无直接 ENUM。

---

## 9.3 外键定义

```sql
CREATE TABLE ProducerWebSite (
  Producer varchar(50) not null,
  WebSite varchar(200) not null,
  PRIMARY KEY (Producer),
  FOREIGN KEY (Producer) REFERENCES Producers (Producer)
);
-- 外键的本地列名必须用括号，否则会报错，亲测易错
```

注释：

- `ProducerWebSite` 表记录制片人及其网站。
- `Producer` 是主键，也是外键。
- `FOREIGN KEY (Producer) REFERENCES Producers (Producer)`：
  - 本表的 `Producer` 列引用 `Producers` 表的 `Producer` 列。
  - 插入 `ProducerWebSite` 时，`Producer` 必须已存在于 `Producers` 表中。

示例效果：

假设 `Producers` 表数据：

| Producer  |
| --------- |
| TimVideo  |
| ABC Films |

插入成功：

```sql
INSERT INTO ProducerWebSite (Producer, WebSite)
VALUES ('TimVideo', 'www.timvideocompany.com');
```

插入失败：

```sql
INSERT INTO ProducerWebSite (Producer, WebSite)
VALUES ('UnknownProducer', 'www.unknown.com');
-- 失败：Producers 表中没有 UnknownProducer
```

命名约束替代语法：

```sql
CREATE TABLE ProducerWebSite (
  Producer varchar(50) not null,
  WebSite varchar(200) not null,
  PRIMARY KEY (Producer),
  CONSTRAINT fk_producer_website
    FOREIGN KEY (Producer) REFERENCES Producers (Producer)
);
```

注释：

- 给外键约束命名，便于后续维护。
- 删除外键约束时使用该名称。

删除外键示例：

```sql
ALTER TABLE ProducerWebSite
DROP CONSTRAINT fk_producer_website;
```

作用：

- 保证引用完整性。
- 防止插入不存在的制片人。
- 防止删除仍被引用的制片人，除非设置了级联规则。

---

## 9.4 本章核心记忆点

```text
CREATE TABLE 定义表结构：列名、类型、约束。
NOT NULL 表示必填，不写则可为 NULL。
PRIMARY KEY 唯一标识一行，可以是复合主键。
字符串：VARCHAR 变长（长度按字符数算），CHAR 定长，TEXT 存大文本且放在行外，ENUM 固定选项；默认字符集 utf8mb4，中文可以直接存。
数值：INT 整数，DECIMAL 精确小数，FLOAT/DOUBLE 近似小数。
日期时间：DATE、DATETIME、TIMESTAMP。
外键：FOREIGN KEY ... REFERENCES ...，保证引用完整性。
约束可以命名，便于维护。
```

本章重点：

- 会写 `CREATE TABLE`。
- 会根据业务选择合适的数据类型。
- 会定义主键、非空、外键。
- 理解复合主键和外键引用的作用。
