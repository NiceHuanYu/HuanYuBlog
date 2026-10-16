---
title: Spring 学习笔记 02：Spring Data JPA 基础——实体映射与 Repository
description: 用 ORM 把类映射到表：@Entity、@Id、@GeneratedValue 怎么用，CrudRepository 三层接口怎么选，H2 与 MySQL 怎么配，以及 ddl-auto 到底该写哪个值。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Spring Data JPA
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 2
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档与 Jakarta Persistence 规范。理解有偏差的地方欢迎指出。

## 0 内存实现撑不了太久

上一篇的 `InMemoryBookRepository` 用 `Map` 存数据，好处是跑起来什么都不用配，坏处也很明显：

- 进程一重启，数据全没了；
- 想按条件查询，只能自己写循环过滤；
- 并发、事务、分页这些迟早要面对的问题，一个都躲不掉。

换成真的数据库，绕不开一个矛盾：**Java 里是对象和引用，数据库里是表和行**。`Book` 对象有
`author` 字段，数据库里可能就是 `authors` 表加一个外键。谁来做这层翻译？

## 1 ORM、JPA、Hibernate、Spring Data JPA

这四个词经常被混着说，先分清它们的位置：

| 名词            | 是什么                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------ |
| ORM             | 一种思路：把对象模型和关系模型对应起来，省掉手写 SQL 搬运数据                              |
| JPA             | 一套**规范**（Jakarta Persistence），定义了 `@Entity`、`EntityManager`、JPQL 等 API 与语义 |
| Hibernate       | JPA 的具体**实现**之一，那些注解最终是它在干活                                             |
| Spring Data JPA | 站在 JPA 之上的**封装**，负责按接口自动生成 Repository 实现                                |

所以写代码时：注解来自 JPA 规范，运行时是 Hibernate 在翻译 SQL，而帮你省掉 `EntityManager`
那一堆模板代码的是 Spring Data JPA。

顺带解决一个上一篇留下的问题：**实体不能是 `record`**。JPA 要求实体类有可访问的无参构造器、
字段可变（要能被代理和填充），`record` 的 final 字段两条都不满足。领域模型用 `record` 没问题，
**被 JPA 管理的实体要用普通 class**。

## 2 引入依赖与配置数据源

### 2.1 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

`spring-boot-starter-data-jpa` 会带进 Spring Data JPA、Hibernate、JDBC 与事务管理，版本仍然
由 parent 统一管。两个驱动都用 `runtime` 作用域：编译时不需要它们，运行时才加载。

### 2.2 H2：先跑通，再换库

H2 是个内存数据库，进程结束数据就没了——这正是它适合开发和测试的原因：**不用装数据库、
不用清数据、每次启动都是干净状态**。

```properties
# application.properties
spring.datasource.url=jdbc:h2:mem:librarydb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
```

关于 H2 的 URL：`jdbc:h2:mem:<名字>` 是内存库，`jdbc:h2:file:./data/librarydb` 会把数据写到
磁盘文件，两者其余用法一致。

**注意 `spring.h2.console.enabled` 在 Boot 4 里光写属性不够**：H2 控制台的自动配置已经拆成
独立模块，只有驱动不会启用它，还要加一个依赖（Boot 3 里内置在 `spring-boot-autoconfigure`，
写属性即可）：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-h2console</artifactId>
</dependency>
```

判断方法：加完依赖启动，日志里会出现 `/h2-console` 的映射；没加依赖时它安静地不生效，
很容易误判成「H2 控制台坏了」。

### 2.3 MySQL：换 profile 而不是改代码

用 Profile 把两套配置分开放，切换时只换一个参数：

```properties
# application-mysql.properties
spring.datasource.url=jdbc:mysql://localhost:3306/library?useSSL=false&serverTimezone=Asia/Singapore
spring.datasource.username=library_user
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=validate
```

需要说明的几点：

- 密码不要写死在文件里，用 `${DB_PASSWORD:}` 从环境变量取；
- `serverTimezone` 建议显式写，避免本地时区与驱动推断不一致导致时间字段偏移；
- 数据库和账号要先手动建好，`library` 这个库得自己 `CREATE DATABASE`；
- **生产环境用 `validate`**：只检查实体与表是否一致，不改表结构。

启动时指定：`./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql`，或者打包后
`java -jar library.jar --spring.profiles.active=mysql`。

## 3 把类映射到表

### 3.1 最基本的实体

```java
package com.example.library.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "books",
        uniqueConstraints = @UniqueConstraint(name = "uk_books_isbn", columnNames = "isbn"))
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    private String author;

    @Column(length = 13)
    private String isbn;

    @Column(name = "published_year")
    private Integer publishedYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookStatus status = BookStatus.AVAILABLE;

    /** JPA 需要无参构造器，设为 protected 既满足要求又不暴露给业务代码 */
    protected Book() {
    }

    public Book(String title, String author) {
        this.title = title;
        this.author = author;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public Integer getPublishedYear() {
        return publishedYear;
    }

    public void setPublishedYear(Integer publishedYear) {
        this.publishedYear = publishedYear;
    }

    public BookStatus getStatus() {
        return status;
    }

    public void setStatus(BookStatus status) {
        this.status = status;
    }
}
```

它引用到的 `BookStatus` 也得有定义（枚举带一个用于页面显示的 `label`）：

```java
package com.example.library.domain;

public enum BookStatus {

    AVAILABLE("可借"),
    BORROWED("已借出"),
    RESERVED("已预约"),
    LOST("遗失");

    private final String label;

    BookStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
```

几个关键点：

- **`@Entity` 的类名默认就是表名**（`Book` → `book`）。想换名字用 `@Table(name = "books")`；
- **必须有 `@Id`**，否则启动就报错；
- **`id` 通常不提供 setter**：主键由数据库生成，让外部随便改主键是麻烦的开始；
- 字段名默认就是列名，`author` → `author`。驼峰字段（如 `publishedYear`）默认映射成
  `published_year`；
- 包名必须是 `jakarta.persistence.*`——`javax.persistence.*` 从 Spring Boot 3 起就已经不存在；
- **实体不要用 `record`**（01 篇留的坑）：JPA 需要无参构造器和可变字段，`record` 两个都不满足。

### 3.2 主键生成策略怎么选

| 策略                      | 行为                                           | 用在哪                               |
| ------------------------- | ---------------------------------------------- | ------------------------------------ |
| `GenerationType.IDENTITY` | 交给数据库自增列（MySQL 的 `AUTO_INCREMENT`）  | MySQL 项目里最常用，简单直观         |
| `GenerationType.SEQUENCE` | 用数据库序列（Oracle、PostgreSQL），可批量预取 | 支持序列的数据库，批量插入性能更好   |
| `GenerationType.TABLE`    | 用一张额外的表记录下一个 id                    | 兼容性最好但性能最差，现在基本不用   |
| `GenerationType.AUTO`     | 由提供者决定（Hibernate 6 默认走序列）         | 想省事，但换数据库时行为会变         |
| `@UuidGenerator`          | Hibernate 提供的 UUID 主键                     | 需要分布式友好、不暴露连续 id 的场景 |

一个常被忽略的点：**`IDENTITY` 会让 Hibernate 不能用批量插入**，因为必须逐条拿回自增值。
批量导入场景要留意这一点。

### 3.3 表和列的自定义

上面那个实体里已经用到了三种自定义，逐条说明：

| 写法                                                 | 作用                                             |
| ---------------------------------------------------- | ------------------------------------------------ |
| `@Table(name = "books")`                             | 显式指定表名，不再依赖类名推断                   |
| `@Column(name = "published_year")`                   | 显式指定列名；驼峰字段最好都写，避免依赖命名策略 |
| `@Table(uniqueConstraints = @UniqueConstraint(...))` | 声明唯一约束，`ddl-auto` 建表时会带上            |
| `@Enumerated(EnumType.STRING)`                       | 枚举存名字而不是序号                             |
| `@Column(length = 13, nullable = false)`             | 长度与是否允许为空                               |

要特别提醒的两条：

- **枚举字段务必写 `@Enumerated(EnumType.STRING)`**。默认的 `ORDINAL` 存序号，枚举顺序一变，
  历史数据的意思就全错了；
- 时间字段用 `LocalDate` / `LocalDateTime`（`java.time`），不要用已经过时的 `java.util.Date`。

想把多个字段合成一个可复用的值对象（比如「地址」），用 `@Embeddable` + `@Embedded`，
那是另一个话题，这里不展开。

## 4 Repository：一个空接口就够了

### 4.1 三层接口

Spring Data 提供了三个常用层级的接口，层层继承：

| 接口                                | 提供的能力                                              |
| ----------------------------------- | ------------------------------------------------------- |
| `CrudRepository<T, ID>`             | `save`、`findById`、`findAll`、`count`、`deleteById` 等 |
| `PagingAndSortingRepository<T, ID>` | 在 CRUD 之上加 `findAll(Pageable)`、`findAll(Sort)`     |
| `JpaRepository<T, ID>`              | 再加刷新、批量删除、`saveAndFlush` 等 JPA 特有的操作    |

**日常用 `JpaRepository`**：它能力最全，而且下面那些方法你都用得到。

### 4.2 定义与使用

```java
package com.example.library.repository;

import com.example.library.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}
```

**没有实现类**。写成接口，继承 `JpaRepository`，指定实体类型和主键类型，Spring 在启动时为它
生成代理实现并注册成 Bean——这就是「零样板代码」的具体含义。

注入方式和普通 Bean 一样。`BookService` 接口在 01 篇已经定义（`add`、`findById`、`findAll`），
把实现换成 JPA 版本，整个类是完整的：

```java
package com.example.library.service;

import com.example.library.domain.Book;
import com.example.library.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional
    public Book add(String title, String author) {
        return bookRepository.save(new Book(title, author));
    }

    @Override
    public Book findById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("找不到图书：" + id));
    }

    @Override
    public List<Book> findAll() {
        return bookRepository.findAll();
    }
}
```

对比 01 篇的内存实现，业务代码只改了「用哪个 Repository」——**接口没动，Controller 一个字
没改**，这就是把依赖交给容器管之后拿到的收益。后面各篇会往这个接口里继续加方法
（03 篇加分页查询、06 篇加表单新增）。

`save` 的语义要注意：**主键为空是插入，主键有值（且已存在）是更新**。它是
`persist` 与 `merge` 的合并入口。

## 5 启动时初始化数据：CommandLineRunner

```java
package com.example.library;

import com.example.library.domain.Book;
import com.example.library.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner loadSampleData(BookRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            repository.saveAll(List.of(
                    new Book("重构", "Martin Fowler"),
                    new Book("代码大全", "Steve McConnell"),
                    new Book("设计模式", "Erich Gamma")
            ));
        };
    }
}
```

`CommandLineRunner` 是 Boot 提供的钩子，应用启动完成后执行一次，常用来灌测试数据。参数由容器
注入——这里又见到依赖注入了。

生产数据初始化，官方更推荐 `spring.sql.init.mode=always` 配合 `schema.sql` / `data.sql`，
但要注意它和 `ddl-auto` 的执行顺序，两者混用容易把表建两次。

## 6 ddl-auto 该写哪个值

| 值            | 行为                                     | 用在                     |
| ------------- | ---------------------------------------- | ------------------------ |
| `none`        | 什么都不做（H2 这类内嵌库默认值之一）    | 表由脚本或 DBA 管理      |
| `validate`    | 启动时校验实体与表是否一致，不一致就报错 | **生产环境推荐**         |
| `update`      | 缺的列/表补上，但从不删除多余结构        | 本地开发方便，改动不可控 |
| `create`      | 每次启动删表重建，关闭时保留             | 临时调试                 |
| `create-drop` | 每次启动建表，关闭时删表                 | 单元测试、内存库开发     |

几个提醒：

- **`update` 不是迁移工具**。改字段名、删列它都不管，时间长了数据库结构和实体就对不上；
- 真实项目里的结构变更要靠迁移工具（Flyway、Liquibase）管理，`ddl-auto` 在非内嵌数据库上
  设成 `validate`；
- 用 H2 跑测试时配 `create-drop`，每次都是干净库，测试之间不会互相污染。

## 7 H2 控制台：不用装客户端就能看表

`spring.h2.console.enabled=true` 之后，加上第 2.2 节说的 `spring-boot-h2console` 依赖，
启动应用访问 `/h2-console` 就能用网页版客户端连进内存库，看表、跑 SQL 都行。连接信息就填
`application.properties` 里那段 URL（`jdbc:h2:mem:librarydb`）和用户名 `sa`。

一个细节：控制台的页面是自带框架画的，如果项目里配了安全框架，记得把 `/h2-console/**` 放行，
否则会一直跳登录页。

## 8 容易踩的坑

| 现象                                   | 原因                                                     | 处理                                                       |
| -------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| 启动报 `Not a managed type`            | 实体类不在主类所在包的扫描范围内，或忘了 `@Entity`       | 挪进扫描范围，检查注解                                     |
| 启动报找不到 `javax.persistence.*`     | Boot 3 已改用 `jakarta.*`                                | 全部换成 `jakarta.persistence.*`                           |
| 报错提示实体没有默认构造器             | 只写了有参构造器                                         | 补一个 `protected` 无参构造器（JPA 需要它）                |
| 实体用了 `record` 导致启动失败         | JPA 不支持 final 字段与不可变实体                        | 实体改用普通 class，`record` 留给 DTO 和领域值对象         |
| 表名/列名和预期不一致                  | 默认命名策略是「驼峰转下划线、类名小写」                 | 用 `@Table(name = ...)`、`@Column(name = ...)` 显式指定    |
| 枚举字段存进去的是数字                 | 默认 `EnumType.ORDINAL`                                  | 加 `@Enumerated(EnumType.STRING)`                          |
| MySQL 连不上，报时区或 SSL 错          | 连接串缺少必要参数                                       | URL 里加 `serverTimezone`，本地可加 `useSSL=false`         |
| 数据重启就没了                         | 用的是 `jdbc:h2:mem:` 内存库                             | 改 `jdbc:h2:file:...`，或换 MySQL                          |
| 写属性了但打不开 `/h2-console`         | Boot 4 里 H2 控制台要额外加 `spring-boot-h2console` 依赖 | 补依赖重启；日志里会有 `/h2-console` 映射                  |
| 保存时报 `NULL not allowed for column` | 关联字段声明了非空，但代码路径没给它赋值                 | 让必填关联在构造器里就传入，或把字段改成可空（见第 04 篇） |

## 9 小结

- **ORM 是思路，JPA 是规范，Hibernate 是规范的一种实现，Spring Data JPA 是更高一层的封装**；
- 实体用普通 class，标注 `@Entity` 与 `@Id`，需要无参构造器；枚举用 `@Enumerated(STRING)`；
- Repository **只要一个继承 `JpaRepository<实体, 主键类型>` 的空接口**，实现由容器生成；
- H2 用来跑通流程和写测试，MySQL 通过 Profile 切换，密码从环境变量取；
- `ddl-auto` 在开发环境用 `update`/`create-drop`，**生产环境只信任 `validate`**；
- 数据初始化可以用 `CommandLineRunner`，也可以用 `schema.sql` / `data.sql`，但别混着来。

到这一步只能按主键查。下一篇写**查询**：怎么用方法名派生查询、怎么用 `@Query` 写 JPQL，
以及分页排序怎么落地。
