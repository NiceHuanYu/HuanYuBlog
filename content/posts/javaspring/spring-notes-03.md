---
title: Spring 学习笔记 03：JPA 查询——派生方法、JPQL 与分页排序
description: Repository 自带的方法只够按主键查，这篇讲三种自己造查询的方式：方法名派生、@Query 写 JPQL、原生 SQL，以及 Pageable 分页排序和投影返回。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Spring Data JPA
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 3
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档与 Jakarta Persistence 规范。理解有偏差的地方欢迎指出。

## 0 只有 save 和 findById 是不够的

上一篇的 `BookRepository` 继承了 `JpaRepository`，白拿到一堆方法，但真实需求很快会超出它们：

- 按作者查这个人的书；
- 按书名模糊搜索；
- 查某年之后出版的、且状态是「可借」的书；
- 分页展示，每页 10 条按书名排序。

这些方法 `JpaRepository` 都没有。有三条路可走：**方法名派生查询**、**`@Query` 写 JPQL**、
**原生 SQL**。优先顺序也基本是这个顺序——能用方法名表达的，不要写查询语句。

## 1 派生查询：把意图写进方法名

Spring Data JPA 会解析方法名，从中拆出查询意图。只写一个方法签名就够了：

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByAuthor(String author);

    List<Book> findByAuthorIgnoreCase(String author);

    List<Book> findByPublishedYearGreaterThanEqual(int year);

    List<Book> findByTitleContainingIgnoreCaseOrderByTitleAsc(String keyword);

    long countByStatus(BookStatus status);

    boolean existsByIsbn(String isbn);

    List<Book> findByAuthorIn(Collection<String> authors);

    List<Book> findByPublishedYearBetween(int from, int to);

    Optional<Book> findFirstByOrderByPublishedYearDesc();
}
```

方法名由「**前缀 + 条件 + 排序/限制**」组成。

### 1.1 前缀

| 前缀                                      | 作用                                                 |
| ----------------------------------------- | ---------------------------------------------------- |
| `findBy` / `readBy` / `queryBy` / `getBy` | 查询，返回实体或集合（`getBy` 是 Boot 3 新增的别名） |
| `countBy`                                 | 返回条数（`long`）                                   |
| `existsBy`                                | 返回是否存在（`boolean`）                            |
| `deleteBy` / `removeBy`                   | 删除匹配的记录                                       |

### 1.2 条件关键字

| 关键字                                       | 生成的 SQL 片段               | 例子                               |
| -------------------------------------------- | ----------------------------- | ---------------------------------- |
| `And` / `Or`                                 | `and` / `or`                  | `findByAuthorAndStatus(...)`       |
| `Is` / `Equals`                              | `=`                           | `findByStatus(...)`                |
| `IsNot` / `Not`                              | `<>`                          | `findByStatusNot(...)`             |
| `LessThan` / `LessThanEqual`                 | `<` / `<=`                    | `findByPublishedYearLessThan(...)` |
| `GreaterThan` / `GreaterThanEqual`           | `>` / `>=`                    | 同上                               |
| `Between`                                    | `between ? and ?`             | `findByPublishedYearBetween(...)`  |
| `Like` / `NotLike`                           | `like`（要自己带 `%`）        | `findByTitleLike("重构%")`         |
| `Containing` / `StartingWith` / `EndingWith` | 自动补 `%`，更省事            | `findByTitleContaining("重构")`    |
| `In` / `NotIn`                               | `in (...)`                    | `findByAuthorIn(List.of(...))`     |
| `IsNull` / `IsNotNull`                       | `is null` / `is not null`     | `findByAuthorIsNull()`             |
| `True` / `False`                             | 布尔字段                      | `findByAvailableTrue()`            |
| `IgnoreCase`                                 | 忽略大小写（后缀）            | `findByAuthorIgnoreCase(...)`      |
| `OrderBy`                                    | 排序，后面可跟 `Asc` / `Desc` | `...OrderByTitleAsc()`             |
| `Distinct`                                   | 去重（放在 `find` 后面）      | `findDistinctBy...`                |
| `First` / `Top`                              | 限制条数，可带数字            | `findTop3By...`                    |

**`Containing` 和 `Like` 的区别最容易搞混**：`Containing` 由框架帮你补 `%`，`Like` 要求参数里
自带通配符。用错了会查不到数据，但不报错——这类问题最费时间。

### 1.3 边界在哪

派生查询适合简单条件。方法名一旦长成
`findByAuthorAndStatusAndPublishedYearGreaterThanEqualAndIsbnIsNotNull`，就已经比 SQL 更难读了。
而且它表达不了分组、聚合、多表连接、子查询。这时候换 `@Query`。

## 2 @Query：自己写 JPQL

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("select b from Book b where lower(b.title) like lower(concat('%', :keyword, '%'))")
    List<Book> searchByTitle(@Param("keyword") String keyword);

    @Query("select b from Book b where b.publishedYear >= :year and b.status = :status order by b.title asc")
    List<Book> findByYearAndStatus(@Param("year") int year, @Param("status") BookStatus status);

    @Query("select count(b) from Book b where b.author = ?1")
    long countByAuthor(String author);
}
```

### 2.1 JPQL 和 SQL 的两个关键差别

- **JPQL 操作的是实体和字段**（`Book b where b.title = ...`），不是表和列。所以这里写 `Book`
  和 `title`，即使表名叫 `books`、列名被 `@Column` 改过；
- **不能 `select *`，要写 `select b`**。查询「所有字段」是 `select b from Book b`。

这两条是初学时写得最多的错，报错信息通常很长但不难懂——看到 `books is not mapped` 之类的提示，
先检查是不是把表名当实体名用了。

### 2.2 参数绑定

两种写法：

| 写法             | 例子                       | 特点                                              |
| ---------------- | -------------------------- | ------------------------------------------------- |
| 位置参数         | `where b.author = ?1`      | 简洁，但参数一多就对不上号                        |
| 命名参数（推荐） | `where b.author = :author` | 配合 `@Param("author")`，可读性好，增删参数不易错 |

**命名参数建议一律加 `@Param`**。虽然编译时保留了参数名（Boot 的 parent 已开启 `-parameters`）
可以省略，但依赖编译配置能让代码「突然找不到参数」，显式写最稳。

## 3 返回类型怎么选

| 场景                   | 返回类型                  | 说明                                        |
| ---------------------- | ------------------------- | ------------------------------------------- |
| 固定查一条             | `Optional<Book>`          | 查不到是正常情况时用，调用方显式处理空值    |
| 确定存在（否则是 bug） | `Book`                    | 查不到会抛 `EmptyResultDataAccessException` |
| 多条                   | `List<Book>`、`Set<Book>` | 最常用                                      |
| 只要条数               | `long`                    | 配合 `countBy` 或 `select count(b)`         |
| 只要部分字段           | 投影接口 / DTO            | 见下                                        |
| 分页                   | `Page<Book>`              | 见第 4 节                                   |

### 3.1 投影：只要两个字段就别查整行

```java
package com.example.library.repository;

public interface BookSummary {

    String getTitle();

    String getAuthor();
}
```

```java
@Query("select b.title as title, b.author as author from Book b where b.status = :status")
List<BookSummary> findSummaries(@Param("status") BookStatus status);
```

接口式投影靠方法名匹配别名，写起来最省事。另一种是 DTO 构造表达式，**必须写全限定类名**：

```java
package com.example.library.dto;

public record BookTitleDto(String title, String author) {
}
```

```java
@Query("""
       select new com.example.library.dto.BookTitleDto(b.title, b.author)
       from Book b
       where b.status = :status
       """)
List<BookTitleDto> findDtoByStatus(@Param("status") BookStatus status);
```

投影的价值不只是少查几列，还在于**避免把实体交给前端**——实体带着延迟加载的关联，序列化时
很容易踩坑。

## 4 排序与分页

### 4.1 Sort

```java
List<Book> books = repository.findAll(Sort.by("publishedYear").descending().and(Sort.by("title")));
```

`Sort.by` 里的名称是**实体字段名**，不是列名。

### 4.2 Pageable 与 Page

```java
Pageable pageable = PageRequest.of(0, 10, Sort.by("title").ascending());
Page<Book> page = repository.findByStatus(BookStatus.AVAILABLE, pageable);
```

页码**从 0 开始**，第二个参数是每页条数。`Page` 拿到手后常用这些：

| 方法                          | 含义                                 |
| ----------------------------- | ------------------------------------ |
| `getContent()`                | 当前页的数据                         |
| `getTotalElements()`          | 总条数                               |
| `getTotalPages()`             | 总页数                               |
| `getNumber()`                 | 当前页码                             |
| `hasNext()` / `hasPrevious()` | 有没有下一页/上一页                  |
| `map(Function)`               | 把当前页实体映射成 DTO，翻页信息保留 |

```java
Page<BookTitleDto> dtoPage = page.map(b -> new BookTitleDto(b.getTitle(), b.getAuthor()));
```

`map` 这个方法很实用：**翻页信息（总页数、页码）自动带过来**，不用自己算。

### 4.3 Page 与 Slice 的取舍

| 返回类型   | 额外做的事                               | 适用场景                   |
| ---------- | ---------------------------------------- | -------------------------- |
| `Page<T>`  | 额外跑一条 `count` 查询算总条数          | 需要「第 3 页 / 共 12 页」 |
| `Slice<T>` | 不多查，靠「多取一条」判断还有没有下一页 | 无限滚动、只要上下页       |

**总数查询不便宜**。数据量大又不需要精确总页数时，`Slice` 能省掉一次全表 count。

分页参数直接来自请求时，别自己从 `page`/`size` 字符串拼，Spring 的
`Pageable` 参数可以被 MVC 自动装配（详见后面 Web 部分）：

```java
@GetMapping
public Page<Book> list(Pageable pageable) {
    return bookService.findAll(pageable);
}
```

注意：这样直接暴露 `Pageable` 时，**排序字段是客户端可控的**，要限制在白名单内，否则可能被
构造成按不可索引的列排序，拖慢数据库。

## 5 @Modifying：更新与删除

`@Query` 默认只读。要写 `update` / `delete`，得加 `@Modifying`：

```java
@Modifying
@Query("update Book b set b.status = :status where b.id = :id")
int markStatus(@Param("id") Long id, @Param("status") BookStatus status);
```

两个必须注意的点，都是在真实测试里撞出来的：

1. **它必须在事务里调用**。少了事务会直接抛
   `TransactionRequiredException: No EntityManager with actual transaction available`。
   典型场景是在测试方法里直接调仓储：`@DataJpaTest` 默认带事务所以没事，而 `@SpringBootTest`
   的测试方法没有事务，同样的调用就会失败；生产代码里要把 `@Transactional` 加在调用它的
   Service 方法上（第 10 篇展开）；
2. **`clearAutomatically` / `flushAutomatically`**：这类更新会绕过持久化上下文，同一个事务里
   再查同一批数据可能拿到旧值。

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
```

`deleteBy` 这类派生删除方法同理。

## 6 什么时候才用原生 SQL

```java
@Query(value = "select * from books where author = :author", nativeQuery = true)
List<Book> findByAuthorNative(@Param("author") String author);
```

`nativeQuery = true` 之后写的就是数据库方言的 SQL，**表名、列名都要用数据库里的真实名字**
（上面这段里 `books`、`author` 都是表/列名，而不是属性路径）。它适合：

- 数据库特有语法：全文索引（MySQL 的 `MATCH ... AGAINST`）、窗口函数、`ON DUPLICATE KEY UPDATE`；
- 已经手工调优过的复杂报表查询。

代价有两条：**丢掉数据库无关性**（换库就得改 SQL），以及**丢掉启动期校验**——JPQL 写错启动
就报，原生 SQL 写错要等运行时才知道。另外原生查询若要分页，`count` 语句得用 `countQuery`
单独给，框架推断不出来。

## 7 容易踩的坑

| 现象                                                   | 原因                                             | 处理                                                               |
| ------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------ |
| 启动直接失败，报 `No property xxx found for type Book` | 方法名里的字段拼错了                             | 按实体字段名逐字核对（`title` 写成 `titel` 也会这样）              |
| JPQL 报 `books is not mapped`                          | 把表名当实体名写了                               | JPQL 里用实体名与字段名                                            |
| JPQL 里 `select *` 报错                                | JPQL 不支持 `select *`                           | 写 `select b from Book b`                                          |
| `Containing` 查不出结果                                | 参数里又自己加了 `%`，变成 `%%重构%%` 之外的情况 | 用 `Containing` 时参数保持纯文本；要自己控制通配符就用 `Like`      |
| 命名参数报找不到                                       | 参数名与 `:xxx` 对不上，或编译没保留参数名       | 一律显式加 `@Param("xxx")`                                         |
| `@Modifying` 调用时抛 `TransactionRequiredException`   | 没有事务上下文                                   | 在 Service 方法上加 `@Transactional`                               |
| 更新后同一事务里查到旧数据                             | 持久化上下文里还是旧对象                         | `@Modifying(clearAutomatically = true, flushAutomatically = true)` |
| 只返回一条却用 `Book` 接，数据不存在时抛异常           | `EmptyResultDataAccessException`                 | 换成 `Optional<Book>`                                              |
| 分页时 SQL 执行了两条，一条 count 很慢                 | `Page` 需要总数                                  | 不需要总数就用 `Slice`，或给 `@Query` 提供精简的 `countQuery`      |
| 生产分页接口被改成按大字段排序导致慢查询               | 排序字段由客户端传入且未校验                     | 只允许白名单字段                                                   |

## 8 小结

- **三种查询方式，按需升级**：方法名派生 → JPQL（`@Query`）→ 原生 SQL；
- 派生查询的关键字要背一些，其中 `Containing` 与 `Like` 的区别最容易踩；
- **JPQL 用实体名和字段名**，`select` 要写 `select b`；
- 命名参数 + `@Param` 最稳；
- 分页用 `PageRequest.of(页码从 0 开始, 每页条数, Sort)`，`Page` 会多跑一次 count，不需要总数
  时用 `Slice`；
- 写操作要 `@Modifying`（配合事务），并考虑 `clearAutomatically`；
- 只要部分字段就**用投影或 DTO**，别把实体直接吐给前端。

现在所有实体还是孤立的。下一篇讲 JPA 里最费思量的部分：**关联映射**——一对多、多对多怎么写，
谁是「维护方」，`FetchType` 与 `CascadeType` 又该怎么选，顺带把测试（`@DataJpaTest`）补上。
