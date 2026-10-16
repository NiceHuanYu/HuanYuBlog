---
title: Spring 学习笔记 01：IoC、依赖注入与第一个 Spring Boot 应用
description: 从「手写 new 出来的三层结构」的痛点讲起，说清 IoC 容器、Bean 与依赖注入是怎么回事，再用 Maven 与 Spring Initializr 跑起第一个能返回 JSON 的应用。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Spring Boot
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 1
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档。理解有偏差的地方欢迎指出。

## 0 从一个真实的麻烦说起

假设要写一个「按 id 查图书」的功能，很自然会长成这样：

```java
public class BookService {

    private final BookRepository repository = new MysqlBookRepository();

    public Book findById(Long id) {
        return repository.findById(id).orElseThrow();
    }
}
```

三层结构搭起来了，但有几个问题会随着项目变大而越来越疼：

- `BookService` 里写死了 `MysqlBookRepository`。想换成内存实现跑单元测试，只能改源码；
- 每个类都自己 `new` 依赖，依赖链一长，构造顺序、共享实例、配置来源全散落在各处；
- 换数据库、换实现，要翻遍所有 `new` 的地方。

把这几条归成一句：**「谁创建对象、谁提供依赖」这件事，被耦合进了业务代码里**。

Spring 的做法是把这件事拿出去，交给一个容器统一做。这一篇就把这个容器讲清楚，然后跑起
第一个应用。

## 1 Spring 是什么

Spring Framework 是一个面向 Java 生态的通用应用框架，它的定位不是「帮你写业务」，而是
**管应用的整体架构和内部结构**。它的核心是一个容器加一套依赖注入机制，围绕这个核心，
再提供数据访问、Web、AOP、测试等模块。

官方文档把模块分成几组，值得先有个整体印象：

| 分组       | 模块                                                                 | 作用                                     |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------- |
| 核心容器   | `spring-core`、`spring-beans`、`spring-context`、`spring-expression` | IoC 容器、Bean 工厂、上下文、SpEL 表达式 |
| AOP 与织入 | `spring-aop`、`spring-aspects`、`spring-instrument`                  | 方法拦截、切面编程、类加载期织入         |
| 数据访问   | `spring-jdbc`、`spring-tx`、`spring-orm`、`spring-jms`、`spring-oxm` | JDBC 抽象、事务管理、ORM 集成、消息      |
| Web        | `spring-web`、`spring-webmvc`、`spring-webflux`、`spring-websocket`  | MVC 框架、WebFlux 响应式、WebSocket      |
| 测试       | `spring-test`                                                        | 应用上下文加载、Mock、集成测试支持       |

**按需选模块**是它的设计原则：不是每个应用都要全装，只需要容器的程序可以不引入 Web。

### 1.1 版本这一关要先过

本系列的代码在 **Spring Boot 4.1.1 + Java 17** 上编译并跑过测试（`mvnw test` 全绿），
所以依赖名与包路径以 Boot 4 为准。Boot 4 相对 3.x 有两处会让人对不上网上教程：**starter
被拆细了**，以及**切片测试注解换了包**。先记住这张对照表，后面各篇遇到时不再重复解释：

| 用途           | Boot 4（本系列用）                                            | Boot 3 里原本叫                                        |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| Web MVC        | `spring-boot-starter-webmvc`                                  | `spring-boot-starter-web`                              |
| Web 层切片测试 | `spring-boot-starter-webmvc-test`                             | 混在 `spring-boot-starter-test` 里                     |
| JPA            | `spring-boot-starter-data-jpa`                                | 同名                                                   |
| JPA 切片测试   | `spring-boot-starter-data-jpa-test`                           | 混在 `spring-boot-starter-test` 里                     |
| 参数校验       | `spring-boot-starter-validation`                              | 同名                                                   |
| 会话外置       | `spring-boot-starter-session-jdbc`                            | `org.springframework.session:spring-session-jdbc`      |
| H2 控制台      | `spring-boot-h2console`（独立模块）                           | 内置在 `spring-boot-autoconfigure` 里                  |
| `@DataJpaTest` | `org.springframework.boot.data.jpa.test.autoconfigure`        | `org.springframework.boot.test.autoconfigure.orm.jpa`  |
| `@WebMvcTest`  | `org.springframework.boot.webmvc.test.autoconfigure`          | `org.springframework.boot.test.autoconfigure.web.servlet` |
| `@MockitoBean` | `org.springframework.test.context.bean.override.mockito.MockitoBean` | 对应 `@MockBean`（已被移除）                    |

其余几条不变的底线：

- Spring Framework 6.x 起把 `javax.*` 全面换成 **`jakarta.*`**：Web 相关写
  `jakarta.servlet.*`，JPA 注解写 `jakarta.persistence.*`，校验注解写 `jakarta.validation.*`；
- Spring Boot 4 的基线是 **Java 17**（示例用 17，不是 21）；
- 具体小版本以 [start.spring.io](https://start.spring.io) 给出的稳定版为准。

### 1.2 系列示例工程

后面每篇都围绕同一个「图书借阅」示例，包名统一 `com.example.library`。完整工程长这样，
每一篇讲到的文件都在这棵树上：

```
library/
├── mvnw / mvnw.cmd
├── pom.xml
└── src
    ├── main
    │   ├── java/com/example/library/
    │   │   ├── LibraryApplication.java              ← 主类
    │   │   ├── config/
    │   │   │   ├── AppConfig.java                   ← @Bean 声明（第 01 篇）
    │   │   │   ├── DataInitializer.java             ← CommandLineRunner 灌数据（第 02 篇）
    │   │   │   ├── WebConfig.java                   ← 拦截器与语言解析器（第 07、09 篇）
    │   │   │   └── WhitelistLocaleResolver.java     ← 语言白名单（第 07 篇）
    │   │   ├── domain/
    │   │   │   ├── Book.java / BookStatus.java      ← 实体（第 02、04 篇）
    │   │   │   ├── Category.java / Tag.java         ← 关联实体（第 04 篇）
    │   │   │   ├── Member.java / Loan.java          ← 借阅（第 10 篇）
    │   │   │   └── User.java / UserRole.java        ← 登录用户（第 08 篇）
    │   │   ├── dto/
    │   │   │   ├── BookForm.java / BookDraft.java   ← 表单对象（第 06、08 篇）
    │   │   │   ├── BookResponse.java / BookTitleDto.java ← 对外表示（第 03、11 篇）
    │   │   ├── repository/                          ← 第 02–04 篇
    │   │   │   ├── BookRepository.java / BookSummary.java
    │   │   │   ├── CategoryRepository.java / TagRepository.java
    │   │   │   └── MemberRepository.java / LoanRepository.java / UserRepository.java
    │   │   ├── service/                             ← 第 02、03、08、10 篇
    │   │   ├── validation/                          ← 自定义校验（第 06 篇）
    │   │   └── web/                                 ← 第 05、06、08、09、11、12 篇
    │   │       ├── BookViewController.java / BookController.java
    │   │       ├── AccountController.java / BookWizardController.java
    │   │       ├── GlobalExceptionHandler.java / ApiExceptionHandler.java
    │   │       ├── RequireAdmin.java
    │   │       ├── interceptor/                     ← 第 09 篇
    │   │       └── filter/                          ← 第 09 篇
    │   └── resources/
    │       ├── application.properties / application-mysql.properties
    │       ├── messages.properties / messages_en.properties   ← 第 07 篇
    │       └── templates/                           ← 第 05–08 篇
    └── test/java/com/example/library/
        ├── MockitoSmokeTest.java                    ← 环境自检
        ├── repository/BookRepositoryTest.java       ← @DataJpaTest（第 04 篇）
        ├── service/LoanServiceTransactionTest.java  ← 事务回滚（第 10 篇）
        └── web/BookControllerTest.java / BookControllerSliceTest.java ← 第 11、12 篇
```

启动与测试：

```bash
./mvnw spring-boot:run     # 启动，默认用 H2 内存库
./mvnw test                # 编译 + 跑测试
```

Windows 上把 `./mvnw` 换成 `mvnw.cmd`。

**先把一个环境坑记下来**：JDK 17 下 Mockito 5 会在第一次创建 mock 时报
`MockitoInitializationException`——它的 inline mock maker 需要把自己作为 agent 附加到当前
JVM，而 JDK 17 默认禁止自附加。在 `pom.xml` 的 surefire 里加一行即可（示例工程里已经加了）：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <argLine>-Djdk.attach.allowAttachSelf=true</argLine>
    </configuration>
</plugin>
```

JDK 21 及以上换成 `-XX:+EnableDynamicAgentLoading` 也行。少了这个参数，所有用到
`@MockitoBean` 的切片测试都会在启动阶段直接失败，而不是某条断言失败——排查时容易误判成
「Mockito 版本坏了」。

## 2 IoC 与依赖注入

### 2.1 两个词的关系

- **IoC（Inversion of Control，控制反转）**：创建对象、装配依赖的控制权，从业务代码反转
  到容器手里。这是一条设计原则。
- **DI（Dependency Injection，依赖注入）**：实现 IoC 的具体手段——容器把依赖**注入**给对象，
  而不是对象自己去找（对比「服务定位器」那种主动查表的方式）。
- **Bean**：由容器创建、装配并管理生命周期的对象，都叫 Bean。
- **容器**：`ApplicationContext`。它读取配置、实例化 Bean、解析依赖关系、管理生命周期，
  并提供事件、国际化、资源加载等能力。

三者关系：容器是执行者，IoC 是原则，DI 是手段。

### 2.2 依赖怎么注进去

三种写法，官方推荐**构造器注入**：

| 方式        | 写法                         | 评价                                                        |
| ----------- | ---------------------------- | ----------------------------------------------------------- |
| 构造器注入  | 依赖作为构造器参数           | 推荐。依赖不可变、必填依赖一目了然、脱离容器也能 new 出来测 |
| Setter 注入 | `setXxx()` 上标 `@Autowired` | 适合可选依赖或需要重新配置的场景                            |
| 字段注入    | 字段上标 `@Autowired`        | 代码最短，但不便于测试，也掩盖了「依赖过多」的信号          |

```java
package com.example.library.service;

import com.example.library.repository.BookRepository;
import org.springframework.stereotype.Service;

@Service
public class BookService {

    private final BookRepository repository;

    // 只有一个构造器时，@Autowired 可以省略
    public BookService(BookRepository repository) {
        this.repository = repository;
    }
}
```

最后那句注释值得单独记一下：**类里只有一个构造器时，Spring 会自动用它注入**，不需要
`@Autowired`。这也解释了为什么构造器注入的代码看起来「什么都没声明却能用」。

### 2.3 Bean 是从哪来的

两条路。

**第一条：组件扫描。** 在类上标 `@Component`，或者用它的语义化派生注解：

| 注解              | 用在哪                  |
| ----------------- | ----------------------- |
| `@Component`      | 通用组件                |
| `@Service`        | 业务层（Service）       |
| `@Repository`     | 数据访问层（DAO）       |
| `@Controller`     | MVC 控制器（返回视图）  |
| `@RestController` | REST 控制器（返回数据） |

它们功能上等价，区别在语义和少数附加行为（比如 `@Repository` 会参与持久层异常转换）。

**第二条：`@Configuration` + `@Bean`。** 要装配的不是自己写的类（第三方库的对象、
`DataSource` 之类），扫描扫不到，就用方法显式声明：

```java
package com.example.library.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class AppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
```

方法名默认就是 Bean 的名字，返回值类型就是它的类型，之后任何地方都能注入 `Clock`。

## 3 Spring Boot 又补了什么

Spring Framework 本身要手写不少配置。Spring Boot 是在它之上的封装，主要补四件事：

1. **starter 依赖**：一个 starter 把一组配合好版本的依赖打包好。比如
   `spring-boot-starter-webmvc` 一引入，Web MVC、JSON、内嵌 Tomcat 就都到位了（Boot 3 里这个
   starter 叫 `spring-boot-starter-web`）；
2. **自动配置**：根据类路径上有什么、你已经定义了哪些 Bean，推断出该怎么配。这些配置类
   的源码在 `spring-boot-autoconfigure` 里，条件注解（`@ConditionalOnClass`、
   `@ConditionalOnMissingBean` 之类）是它的判断依据；
3. **内嵌服务器与可执行 jar**：`package` 打出的是一个能 `java -jar` 直接跑的 jar，里面按
   `BOOT-INF/classes`（自己的类）和 `BOOT-INF/lib`（依赖）组织；
4. **外部化配置**：`application.properties` / `application.yaml`、命令行参数、环境变量、
   Profile，都能覆盖默认值。

一句话概括：**Boot 不替代 Spring，它只是把 Spring 的常规配置替你写好了。**

## 4 动手：生成项目骨架

用 [start.spring.io](https://start.spring.io)（IDE 里的 Spring Initializr 是同一套东西）：
选 Maven 工程、Java 17、Spring Boot 4.x，依赖先勾 **Spring Web**（生成出来就是
`spring-boot-starter-webmvc`）。生成后解开就是标准的 Maven 结构：

```
library/
├── mvnw / mvnw.cmd              ← Maven Wrapper，没装 Maven 也能构建
├── pom.xml                      ← 构建与依赖描述
├── src
│   ├── main
│   │   ├── java/com/example/library/
│   │   │   └── LibraryApplication.java    ← 主类
│   │   └── resources/
│   │       └── application.properties     ← 配置写在这里
│   └── test/java/com/example/library/
│       └── LibraryApplicationTests.java
└── target/                      ← 构建产物（默认不进版本库）
```

`pom.xml` 里关键的三处：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
    <relativePath/>
</parent>

<properties>
    <java.version>17</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

写 Web 应用不需要额外的 JSON 库或服务器：`spring-boot-starter-webmvc` 已经把 Spring MVC、
Jackson、内嵌 Tomcat 一起带进来。测试那个 starter 提供 JUnit、AssertJ、Mockito 和
`MockMvc`。**这两个名字是 Boot 4 的新叫法**，Boot 3 里分别对应 `spring-boot-starter-web`
和 `spring-boot-starter-test`（那时切片测试的依赖都挤在后者里）。

`spring-boot-starter-parent` 管住了所有依赖的版本，所以下面引入的东西**基本都不用写
`<version>`**——这是 Boot 项目里依赖能保持整齐的原因。构建插件
`spring-boot-maven-plugin` 负责把 jar 打成可执行形式，Initializr 已经加好了。

主类：

```java
package com.example.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LibraryApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibraryApplication.class, args);
    }
}
```

`@SpringBootApplication` 是三个注解的合集：

- `@SpringBootConfiguration`（本质是 `@Configuration`）：声明这是配置类；
- `@EnableAutoConfiguration`：打开自动配置；
- `@ComponentScan`：扫描**本类所在包及其子包**。

最后一条决定了一个非常常见的坑：**自己写的 Bean 必须放在主类所在的包下面**，放在外面
扫描不到。

## 5 第一个 Bean 与第一个接口

接下来写一个最小可跑的「图书」例子，包名统一用 `com.example.library`。这一篇先用内存实现
存数据，后面几篇再换成 JPA + 数据库。

### 5.1 模型

```java
package com.example.library.domain;

public record Book(Long id, String title, String author) {
}
```

### 5.2 数据访问层

```java
package com.example.library.repository;

import com.example.library.domain.Book;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class InMemoryBookRepository {

    private final Map<Long, Book> books = new ConcurrentHashMap<>();
    private final AtomicLong sequencer = new AtomicLong();

    public Book save(String title, String author) {
        long id = sequencer.incrementAndGet();
        Book book = new Book(id, title, author);
        books.put(id, book);
        return book;
    }

    public Optional<Book> findById(Long id) {
        return Optional.ofNullable(books.get(id));
    }

    public List<Book> findAll() {
        return List.copyOf(books.values());
    }
}
```

### 5.3 业务层

业务层不关心数据存在哪，它只认接口：

```java
package com.example.library.service;

import com.example.library.domain.Book;

import java.util.List;

public interface BookService {

    Book add(String title, String author);

    Book findById(Long id);

    List<Book> findAll();
}
```

```java
package com.example.library.service;

import com.example.library.domain.Book;
import com.example.library.repository.InMemoryBookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BookServiceImpl implements BookService {

    private final InMemoryBookRepository repository;

    public BookServiceImpl(InMemoryBookRepository repository) {
        this.repository = repository;
    }

    @Override
    public Book add(String title, String author) {
        return repository.save(title, author);
    }

    @Override
    public Book findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("找不到图书：" + id));
    }

    @Override
    public List<Book> findAll() {
        return repository.findAll();
    }
}
```

### 5.4 Web 层

```java
package com.example.library.web;

import com.example.library.domain.Book;
import com.example.library.service.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> list() {
        return bookService.findAll();
    }

    @GetMapping("/{id}")
    public Book get(@PathVariable Long id) {
        return bookService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book add(@RequestBody CreateBookRequest request) {
        return bookService.add(request.title(), request.author());
    }

    public record CreateBookRequest(String title, String author) {
    }
}
```

注意这里没有出现 `BookServiceImpl`——控制器注入的是 `BookService` 接口，具体给哪个实现
由容器决定。**这就是把 `new` 换成注入之后拿到的灵活性**：以后换实现，业务代码一个字不用改。

### 5.5 跑起来看看

```bash
./mvnw spring-boot:run
```

Windows 上把 `./mvnw` 换成 `mvnw.cmd`（或 `.\mvnw`）。启动日志最后会看到 Tomcat 监听
8080 端口。另开一个终端试两个请求：

```bash
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"重构","author":"Martin Fowler"}'

curl http://localhost:8080/api/books
```

PowerShell 里可以这样代替 `curl`：

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/api/books `
  -ContentType "application/json; charset=utf-8" `
  -Body '{"title":"\u91cd\u6784","author":"Martin Fowler"}'

Invoke-RestMethod http://localhost:8080/api/books
```

返回的 JSON 大致是：

```json
[{ "id": 1, "title": "重构", "author": "Martin Fowler" }]
```

回头看这个过程，只写了业务代码和一个 `main`，没有 web.xml、没有注册 `DispatcherServlet`、
没有配置 JSON 转换器——这些都是自动配置补上的。

## 6 自动配置到底做了什么

想弄清「它到底替我配了什么」，最直接的办法是打开调试日志：

```properties
# application.properties
debug=true
```

启动时会打出自动配置报告，分 Positive matches（生效的）和 Negative matches（没生效的）
两类，每条都写明原因，是排查「为什么这个功能没自动启用」的第一手材料。

想覆盖默认行为，有两条路：

1. 自己定义同类型的 Bean（自动配置里的 `@ConditionalOnMissingBean` 会让位）；
2. 写配置项，比如 `server.port=8081`、`spring.application.name=library`。

## 7 容易踩的坑

| 现象                                                | 原因                                              | 处理                                                        |
| --------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| 启动就报找不到 `ServletWebServerFactory`            | 少了 Web starter（Boot 4 里叫 `spring-boot-starter-webmvc`） | 补上 starter，重新导入依赖                     |
| 编译器报 `javax.servlet` 不存在                     | Spring 6 起已改用 `jakarta.*`                     | 改成 `jakarta.servlet.*` 等 Jakarta 命名                    |
| 启动报找不到要注入的 Bean（`NoSuchBeanDefinition`） | 类不在主类所在包及子包内，`@ComponentScan` 扫不到 | 挪回包内，或用 `@ComponentScan` 显式指定基础包              |
| 循环依赖，构造器注入直接启动失败                    | 两个 Bean 互相依赖                                | 通常是设计问题，抽公共依赖或调整职责，别急着用 `@Lazy` 掩盖 |
| 改了类名或包名后访问 404                            | 没重新构建，跑的还是旧 class                      | 停掉进程重新 `spring-boot:run`                              |
| 端口被占用                                          | 8080 上有别的服务                                 | 用 `server.port=8081` 改端口                                |

## 8 小结

- Spring 的核心是**容器 + 依赖注入**：IoC 是原则，DI 是手段，Bean 是被管理的对象；
- 用**构造器注入**，只有一个构造器时 `@Autowired` 可以省略；
- Bean 要么靠**组件扫描**（`@Component` 及其派生注解），要么靠 `@Configuration` + `@Bean`
  显式声明；
- Spring Boot 的价值在 **starter、自动配置、内嵌服务器、可执行 jar、外部化配置**，
  而 `@SpringBootApplication` 就是「配置类 + 开启自动配置 + 组件扫描」三合一；
- 出问题先看**自动配置报告**（`debug=true`），再确认 Bean 是否在扫描范围内。

这一篇的数据还放在内存里，重启就没了。下一篇进入 **Spring Data JPA**：把实体映射到数据库
表，用接口自动生成 CRUD，先跑通 H2，再切到 MySQL。
