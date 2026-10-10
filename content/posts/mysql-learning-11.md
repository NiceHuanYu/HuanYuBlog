---
title: MySQL 学习笔记 11：存储过程
description: MySQL 学习笔记第十一篇：存储过程（Stored Procedures）的概念、创建与调用、带参数的写法，以及优缺点。
date: 2026-10-10
category: 学习
tags:
    - SQL
    - MySQL
    - 学习笔记
series: SQL 学习笔记
seriesOrder: 11
---

> 本文是《SQL 学习笔记》系列的一篇：示例数据和 SQL 都是我整理并在 MySQL 8 上跑过的，讲解部分按自己的理解写的。

# 14 存储过程 (Stored Procedures)

## 14.0 示例数据

### Customers 表

| Id  | Name  | Race | Age |
| ---:| ----- | ---- | ---:|
| 1   | Chia  | CN   | 22  |
| 2   | Tom   | ML   | 18  |
| 3   | Alice | IND  | 25  |

### Books 表

| BookId | Title  | Rating | TotalStock |
| -------:| ------ | ------ | ----------:|
| 1       | Effective Java | G      | 10         |
| 2       | Clean Code | PG     | 5          |
| 3       | Refactoring | G      | 3          |

### Accounts 表

| AccountID | Balance |
| ---------:| -------:|
| 101       | 1000.00 |
| 202       | 500.00  |

### Products 表

| ProductID | Stock |
| ---------:| -----:|
| 1         | 20    |
| 2         | 15    |

### Orders 表

| OrderId | CustomerID | OrderDate  |
| -------:| ----------:| ---------- |
| 1001    | 1          | 2026-10-01 |

### Users 表

| UserId | Username | Password |
| ------:| -------- | -------- |
| 1      | john     | 1234     |
| 2      | alice    | abcd     |

---

## 14.1 存储过程概念

- 一组 SQL 语句和过程逻辑，编译后存储在数据库中。

注释：

- 存储过程（Stored Procedure）是数据库中的一段可执行程序。
- 它可以包含多条 SQL 语句、变量、条件判断、循环、事务控制等。
- 存储过程在数据库服务器端执行，客户端只需要调用它。
- 存储过程有名称，可以带参数。

示例：

```text
存储过程 = 数据库里的“函数”或“脚本”。
一次定义，多次调用。
```

作用：

- 封装复杂逻辑。
- 减少应用层与数据库之间的往返。
- 提高安全性和可重用性。

---

## 14.2 创建存储过程

```sql
DELIMITER $$
CREATE PROCEDURE sp_list_customers()
BEGIN
  SELECT * FROM Customers;
  statement2;
  statement3;
END $$
DELIMITER ;
```

注释：

- `DELIMITER $$`：把语句结束符从 `;` 临时改成 `$$`。
- 原因：存储过程体内有多条 SQL，每条以 `;` 结尾。如果不改结束符，数据库会在第一条 `;` 处误认为存储过程结束。
- `CREATE PROCEDURE sp_list_customers()`：创建名为 `sp_list_customers` 的存储过程，无参数。
- `BEGIN ... END`：过程体，包含多条语句。
- `statement2;`、`statement3;`：占位，实际使用时替换为具体 SQL。
- `END $$`：用 `$$` 结束存储过程定义。
- `DELIMITER ;`：把结束符恢复为 `;`。

执行效果：

```sql
-- 调用无参存储过程
CALL sp_list_customers();
```

结果：执行过程体内的 `SELECT * FROM Customers;`，返回 Customers 全部行。

作用：

- 把多条 SQL 打包成一个过程。
- 通过 `CALL 过程名()` 调用。
- 避免每次重复写相同 SQL。

注意：

- `DELIMITER` 是 MySQL 客户端命令，不是标准 SQL。
- 其他数据库（如 SQL Server、PostgreSQL）语法不同，不使用 `DELIMITER`。

---

## 14.3 带参数的存储过程

```sql
DELIMITER //
CREATE PROCEDURE MyProcedure (var1 CHAR(2), var2 INTEGER)
BEGIN
  SELECT * FROM Books WHERE Rating = var1 AND TotalStock > var2;
END //
DELIMITER ;

CALL MyProcedure(val1, val2);
```

注释：

- `var1 CHAR(2)`：第一个参数，字符类型，长度 2。
- `var2 INTEGER`：第二个参数，整数类型。
- 参数在过程体内可以像普通列一样使用。
- `CALL MyProcedure(val1, val2);`：用实际值调用存储过程。

示例调用：

```sql
CALL MyProcedure('G', 5);
```

执行效果：

- `var1 = 'G'`，`var2 = 5`。
- 等价于执行：

```sql
SELECT * FROM Books WHERE Rating = 'G' AND TotalStock > 5;
```

结果：

| BookId | Title  | Rating | TotalStock |
| -------:| ------ | ------ | ----------:|
| 1       | Effective Java | G      | 10         |

再调用：

```sql
CALL MyProcedure('PG', 0);
```

结果：

| BookId | Title  | Rating | TotalStock |
| -------:| ------ | ------ | ----------:|
| 2       | Clean Code | PG     | 5          |

作用：

- 同一个存储过程可以根据不同参数返回不同结果。
- 提高复用性。
- 避免把过滤条件硬编码在过程体内。

---

## 14.4 存储过程示例

### 14.4.1 银行转账

```sql
DELIMITER $$
CREATE PROCEDURE TransferMoney(
  fromAccount INT,
  toAccount INT,
  amount DECIMAL(10,2)
)
BEGIN
  START TRANSACTION;
  UPDATE Accounts SET Balance = Balance - amount WHERE AccountID = fromAccount;
  UPDATE Accounts SET Balance = Balance + amount WHERE AccountID = toAccount;
  COMMIT;
END $$
DELIMITER ;

CALL TransferMoney(101, 202, 500.00);
```

注释：

- `fromAccount`：转出账户 ID。
- `toAccount`：转入账户 ID。
- `amount`：转账金额，`DECIMAL(10,2)` 精确数值，适合金额。
- `START TRANSACTION`：开始事务。
- 第一条 `UPDATE`：转出账户减钱。
- 第二条 `UPDATE`：转入账户加钱。
- `COMMIT`：提交事务，两步同时生效。
- 如果中途出错，可以回滚，保证两步要么都成功，要么都不做。

执行效果：

调用前：

| AccountID | Balance |
| ---------:| -------:|
| 101       | 1000.00 |
| 202       | 500.00  |

调用：

```sql
CALL TransferMoney(101, 202, 500.00);
```

调用后：

| AccountID | Balance |
| ---------:| -------:|
| 101       | 500.00  |
| 202       | 1000.00 |

作用：

- 保证转账的原子性：要么两边都改，要么都不改。
- 封装转账逻辑，应用层只需调用 `CALL TransferMoney(...)`。
- 避免应用层写多条 SQL 导致不一致。

---

### 14.4.2 下订单

```sql
DELIMITER $$
CREATE PROCEDURE PlaceOrder(
  customerId INT,
  productId INT,
  quantity INT
)
BEGIN
  INSERT INTO Orders(CustomerID, OrderDate) VALUES(customerId, NOW());
  UPDATE Products SET Stock = Stock - quantity WHERE ProductID = productId;
END $$
```

注释：

- `customerId`：下单客户 ID。
- `productId`：下单产品 ID。
- `quantity`：购买数量。
- 第一步：向 `Orders` 表插入一条订单记录。
- `NOW()`：返回当前时间。
- 第二步：从 `Products` 表中扣减对应产品库存。

执行效果：

调用前：

Products：

| ProductID | Stock |
| ---------:| -----:|
| 1         | 20    |

调用：

```sql
CALL PlaceOrder(1, 1, 3);
```

调用后：

Orders 新增一行：

| OrderId | CustomerID | OrderDate  |
| -------:| ----------:| ---------- |
| 1002    | 1          | 2026-10-10 |

Products：

| ProductID | Stock |
| ---------:| -----:|
| 1         | 17    |

作用：

- 把“创建订单 + 扣库存”封装成一个操作。
- 应用层只需一次调用。
- 可以在过程体内进一步加事务控制，保证一致性。

---

### 14.4.3 验证用户

```sql
DELIMITER $$
CREATE PROCEDURE ValidateUser(
  inputUsername VARCHAR(50),
  inputPassword VARCHAR(50)
)
BEGIN
  SELECT * FROM Users WHERE Username = inputUsername AND Password = inputPassword;
END $$
DELIMITER ;

CALL ValidateUser('john', '1234');
```

注释：

- `inputUsername`：用户输入的用户名。
- `inputPassword`：用户输入的密码。
- 过程体执行查询，返回匹配的用户行。

执行效果：

```sql
CALL ValidateUser('john', '1234');
```

结果：

| UserId | Username | Password |
| ------:| -------- | -------- |
| 1      | john     | 1234     |

```sql
CALL ValidateUser('john', 'wrong');
```

结果：空结果集，表示用户名或密码错误。

作用：

- 封装登录验证逻辑。
- 应用层调用即可，不用写 SQL。
- 实际生产环境应对密码加密存储，不直接存明文。

---

## 14.5 存储过程的优点

原笔记列出：

```text
- Transaction control（事务控制）
- Enhanced security（增强安全性）：用户调用存储过程而非直接访问表
- Better performance（更好性能）：存储过程在执行前预编译
- Reusability（可重用性）
```

扩展注释：

### 14.5.1 Transaction control（事务控制）

```sql
START TRANSACTION;
UPDATE Accounts SET Balance = Balance - amount WHERE AccountID = fromAccount;
UPDATE Accounts SET Balance = Balance + amount WHERE AccountID = toAccount;
COMMIT;
```

- 多条 SQL 可以放在同一事务中。
- 保证要么全部成功，要么全部失败。
- 银行转账、下订单是典型例子。

### 14.5.2 Enhanced security（增强安全性）

```sql
-- 只给用户 EXECUTE 权限，不给表 SELECT 权限
GRANT EXECUTE ON PROCEDURE ValidateUser TO 'app_user'@'%';
```

- 用户只能调用存储过程，不能直接查表。
- 可以隐藏表名、列名和 SQL 逻辑。
- 减少 SQL 注入风险。

### 14.5.3 Better performance（更好性能）

- 存储过程在首次执行时编译，之后复用执行计划。
- 减少网络传输：一次调用，代替多条 SQL。
- 减少 SQL 解析次数。

### 14.5.4 Reusability（可重用性）

```sql
CALL TransferMoney(101, 202, 500.00);
CALL TransferMoney(202, 101, 100.00);
CALL PlaceOrder(1, 1, 3);
```

- 同一段逻辑，多次调用，不同参数。
- 应用层代码更简洁。
- 修改逻辑时只需改存储过程。

---

## 14.6 常见坑总结

1. `DELIMITER` 是 MySQL 客户端命令，不是标准 SQL。
2. `DELIMITER` 只在当前会话有效，创建完应恢复为 `;`。
3. 存储过程体内的 `;` 不会提前结束定义，因为已经改了结束符。
4. 参数类型要和实际数据类型匹配。
5. 事务中如果出错，应 `ROLLBACK`，而不是直接 `COMMIT`。
6. 存储过程可以包含多条 SQL，但不要写得太长，难以维护。
7. 存储过程在数据库中编译，不同数据库语法差异较大。
8. 生产环境应控制存储过程权限，避免滥用。
9. 密码等敏感数据不应明文存储或比较。
10. 存储过程不适合所有场景，简单查询可以直接写 SQL。

核心记忆点：

```text
存储过程 = 一组 SQL 语句 + 逻辑，编译后存储在数据库中。
DELIMITER 用于改变语句结束符，方便定义过程体。
CALL 过程名(参数) 调用存储过程。
存储过程可包含事务控制、参数、多条 SQL。
优点：事务控制、安全性、性能、可重用性。
```
