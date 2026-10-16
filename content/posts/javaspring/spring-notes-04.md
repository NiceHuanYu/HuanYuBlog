---
title: Spring 学习笔记 04：JPA 关联映射与仓储测试
description: 一对多、多对多怎么映射，谁负责维护外键，FetchType 与 CascadeType 该怎么选，顺带用 @DataJpaTest 与 AssertJ 把仓储层测起来。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Spring Data JPA
    - 测试
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 4
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档与 Jakarta Persistence 规范。理解有偏差的地方欢迎指出。

## 0 单表模型很快就到头了

「图书」和「分类」天然有关联：一个分类下有好多本书，一本书属于一个分类。用两张互相不知道
对方存在的表存这些数据也能跑，但每次查「某分类下的书」都得手写两段查询再在 Java 里拼起来。

JPA 的做法是在实体之间直接把引用建起来。代价是**关联映射是 JPA 里最容易出错的部分**——
映射没写错也能启动成功，跑起来却在延迟加载、级联删除或 JSON 序列化上爆掉。这一篇把它一层层
拆开。

## 1 先回到数据库：外键放哪一侧

对象模型和关系模型的根本差别是：**对象可以有双向引用，数据库的外键只能在一侧**。

| 关系   | 数据库里的表现                                      |
| ------ | --------------------------------------------------- |
| 一对多 | 外键放在「多」的那一侧（`book` 表放 `category_id`） |
| 一对一 | 外键放在任意一侧，通常放在「主要」的那一侧          |
| 多对多 | 双方都放不下，需要一张**中间表**                    |

把这个事实记住，后面所有注解都能推出为什么这么写。

## 2 维护方（owning side）：谁写得进数据库

JPA 规定：**一次关联里只有一个维护方，只有维护方负责把外键写进数据库**。另一侧是「反方」
（inverse side），它只读、也**不可写**。

- 维护方：用 `@JoinColumn` 指定外键列名；
- 反方：用 `mappedBy = "对方实体里的字段名"`。

`mappedBy` 的值写的是**对方的字段名，不是表名也不是列名**，这是最常写错的地方。它写错了
通常启动就能报错，还算幸运；真正难查的是「两边都写了 `@JoinColumn`」，启动一切正常，只是
数据偶尔少写一条——因为两边都想当维护方，实际行为由 Hibernate 决定。

判断维护方的经验法则：**外键在哪张表上，哪个实体就是维护方**。

## 3 一对多 / 多对一

「一个分类下有多本书，一本书属于一个分类」，数据库里外键在 `book` 表，所以 `Book` 是维护方：

在 02 篇那个 `Book` 实体上，只加一个关联字段和几处配套改动，其余字段原样不动（新增的 import
是 `jakarta.persistence.FetchType`、`JoinColumn`、`ManyToOne`）：

```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // 构造器多一个「带分类」的版本，原来那个 (title, author) 保留
    public Book(String title, Category category) {
        this.title = title;
        this.category = category;
    }

    /** 关联只能从维护方这一侧改 */
    public void changeCategory(Category category) {
        this.category = category;
    }

    public Category getCategory() {
        return category;
    }
```

**要不要写成 `optional = false` / `nullable = false`**，取决于「书能不能没有分类」。写成非空
更严谨，但代价是**所有创建书的代码路径都必须给分类**：示例工程里最初写成非空，而另一条路径
`new Book(title, author)` 没给分类，插入时直接报 `NULL not allowed for column "CATEGORY_ID"`。
所以要么让构造器强制传入分类（把不带分类的构造器删掉），要么就明确允许为空，两头不要不一致。

反方：

```java
package com.example.library.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Book> books = new ArrayList<>();

    protected Category() {
    }

    public Category(String name) {
        this.name = name;
    }

    /** 双向关联要两边都改，交给实体自己的方法保证一致性 */
    public void addBook(Book book) {
        books.add(book);
        book.changeCategory(this);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<Book> getBooks() {
        return List.copyOf(books);
    }
}
```

几个要点：

- **反方的集合字段要初始化**（`new ArrayList<>()`），否则延迟加载时容易碰到
  `NullPointerException`；
- **不要给反方的集合提供 public setter**。外部替换整个集合，会绕过维护方的逻辑；
- **双向关联用一个方法同时改两边**（`addBook`），这是保持内存中对象图一致的关键；
- `getBooks()` 返回只读副本，避免调用方直接改内部集合。

## 4 多对多

「一本书可以有多个标签，一个标签可以贴在多本书上」。数据库里没有地方放这个关系，得建中间表：

```java
package com.example.library.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    /** 反方：维护方在上面那侧，这里只读 */
    @ManyToMany(mappedBy = "tags")
    private Set<Book> books = new LinkedHashSet<>();

    protected Tag() {
    }

    public Tag(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Book> getBooks() {
        return Set.copyOf(books);
    }
}
```

选择 `Book` 作为维护方：

```java
@ManyToMany
@JoinTable(
        name = "book_tags",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"))
private Set<Tag> tags = new LinkedHashSet<>();
```

`Tag` 侧则是反方：

```java
@ManyToMany(mappedBy = "tags")
private Set<Book> books = new LinkedHashSet<>();
```

要点：

- **用 `Set` 而不是 `List`**。中间表没有主键去重，用 `List` 时重复删改容易产生重复行；
- `@JoinTable` 里 `joinColumns` 指**本实体**在中间表里的列，`inverseJoinColumns` 指**对方**
  的列，写反了不会报错，只会关联错数据；
- 多对多**不适合带额外字段的关系**（比如「借阅」还带借出日期、归还日期）。这种关系要用
  「两个一对多 + 一个显式中间实体」来表达，中间实体就是那个业务对象（如 `Loan`）。

最后这条经验很重要：只要关系本身有业务属性，它就该是一个实体，而不是一个 `@ManyToMany`。

## 5 一对多反向来写：多对一优先

实际项目里更常用的写法是**只在多的一侧建 `@ManyToOne`，不要反方的集合**：

```java
@Entity
public class Book {
    // ...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}
```

要查「这个分类下的书」，用仓储方法就行：

```java
List<Book> findByCategoryId(Long categoryId);
```

**单向关联的问题更少**：不用担心双向一致性、不用担心序列化成环、不用担心集合被误改。只有当
「从一的一侧遍历到多的一侧」真的是高频操作，才值得加上集合这一侧。

## 6 FetchType：延迟加载与 N+1

| 取值              | 行为                             | JPA 默认用在                |
| ----------------- | -------------------------------- | --------------------------- |
| `FetchType.LAZY`  | 用到时才去查（拿到的往往是代理） | `@OneToMany`、`@ManyToMany` |
| `FetchType.EAGER` | 查主实体时顺便全查出来           | `@ManyToOne`、`@OneToOne`   |

**默认值是个陷阱**：`@ManyToOne` 默认是 `EAGER`。一个列表页查 100 本书，如果每本书都 `EAGER`
带出分类，就会产生额外查询。所以示例里我给每个 `@ManyToOne` 都显式写了 `LAZY`。

### 6.1 N+1 是怎么来的

```java
List<Book> books = bookRepository.findAll();        // 1 条 SQL
for (Book book : books) {
    System.out.println(book.getCategory().getName()); // 每条再补 1 条 SQL
}
```

一共 1 + N 条 SQL，N 稍大就明显变慢。三种应对：

1. **JPQL 用 `join fetch`**（明确要一起取回来）：

   ```java
   @Query("select distinct b from Book b join fetch b.category where b.category.id = :categoryId")
   List<Book> findByCategoryWithCategory(@Param("categoryId") Long categoryId);
   ```

   `distinct` 在这里是必要的：join 之后主实体行会重复。

2. **用 `@EntityGraph` 声明式地指定要一并加载的关联**：

   ```java
   @EntityGraph(attributePaths = "category")
   List<Book> findByTitleContaining(String keyword);
   ```

3. **投影/ DTO 查询**，只取需要的那几个字段（上一篇讲的投影）。

还有一个连带问题：**延迟加载必须在事务内**。Service 方法的事务结束后再去访问没加载的关联，
会抛 `LazyInitializationException`。解决办法是**在事务内取够数据**（join fetch / EntityGraph /
投影），而不是把 `@Transactional` 加到 Controller 上。

## 7 CascadeType 与 orphanRemoval

级联把对父实体的操作传播到子实体：

| 取值                  | 传播的操作                 |
| --------------------- | -------------------------- |
| `CascadeType.PERSIST` | 保存父实体时一起保存子     |
| `CascadeType.MERGE`   | 更新父实体时一起更新子     |
| `CascadeType.REMOVE`  | 删除父实体时一起删除子     |
| `CascadeType.REFRESH` | 从数据库刷新父时一起刷新子 |
| `CascadeType.DETACH`  | 从持久化上下文摘除         |
| `CascadeType.ALL`     | 以上全部                   |

`orphanRemoval = true` 是另一个维度：**子实体从父的集合里被移除时，直接删掉它**（而不是把外键
置空）。

用法上的建议：

- **级联只用在真正的父子聚合关系**上（订单与订单明细），别为了省一次 `save` 到处写
  `CascadeType.ALL`——尤其是 `REMOVE`：删一个分类顺手删掉这个分类下所有书，往往不是你要的；
- 关联是「引用」而非「拥有」（书属于分类，但书不因分类被删而消失）时，**不要加 `REMOVE`**；
  删除父实体时要么先把子实体转移，要么在数据库层用 `ON DELETE SET NULL` / 限制删除。

## 8 序列化成 JSON 时的循环引用

双向关联直接交给 Jackson 序列化会无限递归：`category.books[i].category.books...`。
三种处理方式，推荐最后一种：

1. 反方字段加 `@JsonIgnore`——简单，但等于把「哪边不输出」写死在实体里；
2. 用 `@JsonManagedReference` / `@JsonBackReference` 配对；
3. **别直接输出实体**，在 Controller 层转成 DTO。实体是持久化模型，本来就不该承担 API 契约的
   职责，这也能顺手回避延迟加载字段在序列化时的意外触发。

## 9 把仓储层测起来：@DataJpaTest

仓储的查询方法（尤其是派生查询和 JPQL）值得自动测试，因为写错时通常到运行时才发现。
`@DataJpaTest` 是专门给这层用的切片测试。**Boot 4 里它的包路径变了**：Boot 3 是
`org.springframework.boot.test.autoconfigure.orm.jpa`，现在在
`org.springframework.boot.data.jpa.test.autoconfigure`；依赖也从 `spring-boot-starter-test`
换成了专门的 `spring-boot-starter-data-jpa-test`：

```java
package com.example.library.repository;

import com.example.library.domain.Book;
import com.example.library.domain.BookStatus;
import com.example.library.domain.Category;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("按分类查书：只返回该分类下的书，并按书名排序")
    void findsBooksByCategoryOrderedByTitle() {
        // given
        Category novel = categoryRepository.save(new Category("小说"));
        Category tech = categoryRepository.save(new Category("技术"));

        bookRepository.save(new Book("活着", novel));
        bookRepository.save(new Book("许三观卖血记", novel));
        bookRepository.save(new Book("重构", tech));

        // when
        List<Book> books = bookRepository.findByCategoryIdOrderByTitleAsc(novel.getId());

        // then
        assertThat(books)
                .hasSize(2)
                .extracting(Book::getTitle)
                .containsExactlyInAnyOrder("活着", "许三观卖血记");
    }

    @Test
    @DisplayName("Containing 会自动补通配符，Like 不会")
    void containingVersusLike() {
        bookRepository.save(new Book("重构：改善既有代码的设计", "Martin Fowler"));

        assertThat(bookRepository.findByTitleContaining("重构")).hasSize(1);
        assertThat(bookRepository.findByTitleLike("重构%")).hasSize(1);
        assertThat(bookRepository.findByTitleLike("重构")).isEmpty();   // 没带通配符就等同于完全相等
    }

    @Test
    @DisplayName("@Modifying 更新之后，同一个事务里读到的是新值")
    void updatesStatusInPlace() {
        Book book = bookRepository.save(new Book("重构", "Martin Fowler"));

        int updated = bookRepository.markStatus(book.getId(), BookStatus.BORROWED);

        assertThat(updated).isEqualTo(1);
        assertThat(bookRepository.findById(book.getId()).orElseThrow().getStatus())
                .isEqualTo(BookStatus.BORROWED);
    }
}
```

`@DataJpaTest` 帮你做了这些事：

- **只加载 JPA 相关的部分**（实体、Repository、`DataSource`、`EntityManager`），不启动整个
  Web 环境，所以很快；
- **默认把测试包在事务里**，每个测试方法结束后回滚，测试之间互不污染，不用手动清库；
- **`@Transactional` 已包含**，所以测试里可以直接调仓储方法，不会有
  `LazyInitializationException`；
- 默认会把配置的数据源替换成内嵌库。项目里已经有 H2 依赖时开箱可用；想在测试里用别的库，
  用 `@AutoConfigureTestDatabase(replace = Replace.NONE)` 关掉替换。

### 9.1 和 @SpringBootTest 的区别

| 注解              | 加载范围                                 | 启动速度 | 用在哪                   |
| ----------------- | ---------------------------------------- | -------- | ------------------------ |
| `@DataJpaTest`    | 只 JPA 层                                | 快       | 仓储查询、实体映射       |
| `@WebMvcTest`     | 只 MVC 层（Controller），外部依赖要 Mock | 快       | 控制器、参数校验、状态码 |
| `@SpringBootTest` | 整个应用上下文                           | 慢       | 端到端集成测试           |

原则是**用能验证问题的最小切片**：测一条派生查询有没有写对，没必要起整个应用。

### 9.2 断言用 AssertJ

Spring Boot 的测试起步依赖已经包含 AssertJ，链式写法比 JUnit 自带的断言更易读：

```java
assertThat(books).hasSize(2);
assertThat(book.getTitle()).isEqualTo("重构");
assertThat(book.getTitle()).startsWith("重");
assertThat(optional).isEmpty();
assertThat(books).extracting(Book::getAuthor).containsOnly("Martin Fowler");
```

`extracting` + `containsExactly` 这一组特别适合验证「查出来的集合内容对不对」。

## 10 容易踩的坑

| 现象                                              | 原因                                        | 处理                                                          |
| ------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| 关联改了但数据库没变                              | 改的是反方（`mappedBy` 那一侧），维护方没动 | 只从维护方改，或用封装方法两边一起改                          |
| 两边都写 `@JoinColumn`                            | 出现两个「维护方」，行为不可预期            | 反方必须用 `mappedBy`                                         |
| `mappedBy` 启动报错，说找不到属性                 | 写成了表名或列名                            | 它要的是对方的**字段名**                                      |
| 报 `LazyInitializationException`                  | 事务结束后才访问未加载的关联                | 在事务内用 `join fetch` / `@EntityGraph` / 投影取够数据       |
| 列表页变慢，日志里一堆同构 SQL                    | `@ManyToOne` 默认 `EAGER` 造成的 N+1        | 显式 `fetch = FetchType.LAZY`，按需加载                       |
| `join fetch` 查出的条数比预期多                   | 一对多 join 导致主实体行重复                | 加 `distinct`                                                 |
| 删除父实体时子实体被「顺手删了」或外键置空        | 级联与 `orphanRemoval` 的作用范围没想清楚   | 只在真正的聚合关系上用 `CascadeType.REMOVE` / `orphanRemoval` |
| JSON 序列化无限递归，或输出里带一堆不该暴露的字段 | 直接把实体返回给客户端                      | 转 DTO 输出，或用 `@JsonIgnore` 控制                          |
| 多对多表里出现重复行                              | 集合用了 `List`                             | 用 `Set`                                                      |
| 测试之间数据互相影响                              | 自己 `new` 了上下文或关掉了回滚             | `@DataJpaTest` 默认回滚，别关；需要提交的场景单独处理         |

## 11 小结

- **外键在哪张表，哪边就是维护方**；维护方用 `@JoinColumn`，反方用 `mappedBy = "对方字段名"`；
- 一对多优先**只写 `@ManyToOne` 这一侧**，要遍历再考虑加集合；
- 集合字段初始化、不暴露 setter、用封装方法保持双向一致；
- **`@ManyToOne` 的默认 `EAGER` 是坑，显式改成 `LAZY`**，再用 `join fetch` / `@EntityGraph` /
  投影解决 N+1；
- 级联只在真正的父子关系上用；关系带业务字段时，用「两个一对多 + 中间实体」替掉多对多；
- 仓储层用 **`@DataJpaTest`**（快、默认回滚）+ **AssertJ** 断言来测。

到这里，数据层能跑、能查、能测了。接下来进入 Web 层：下一篇讲 Spring MVC 的请求流程和
Thymeleaf 模板，把数据呈现在页面上。
