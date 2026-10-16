---
title: Spring 学习笔记 11：REST API 基础——把 Service 暴露成接口
description: 同一套 Service 怎么同时服务页面和客户端：@RestController 的路由与方法语义、状态码怎么给、DTO 怎么定，以及 MockMvc 端到端和切片测试的两种写法与各自的坑。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - REST
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 11
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，并跑过测试，
> 参考的是 Spring 官方文档与 RFC 9110（HTTP 语义）。理解有偏差的地方欢迎指出。

## 0 同一份业务，多一种出口

前面的页面型应用只服务浏览器：服务端渲染 HTML，数据留在服务器上。但只要出现下面任何一种
需求，这条路就不够了：

- 手机 App 要数据，不想要 HTML；
- 前端换成 React/Vue，渲染在客户端做；
- 第三方系统要对接，需要一份稳定的接口约定。

**服务端渲染和 REST API 不是二选一**。注意示例工程的结构：`BookService` 一个都没改，
`BookViewController` 继续渲染页面，新加的 `BookController` 只是又一层薄薄的适配。**业务逻辑
只写一遍**——这才是分层的回报。

## 1 REST 的四条约定

REST 不是某个框架，而是一组设计约定。落到代码上，主要看这四条：

| 约定             | 说明                                                       |
| ---------------- | ---------------------------------------------------------- |
| 用名词表示资源   | `/api/books`、`/api/books/1`，而不是 `/getBookById`        |
| 用 HTTP 方法表意 | GET 查、POST 建、PUT/PATCH 改、DELETE 删，路径里不出现动词 |
| 状态码表达结果   | 200/201/204/400/404/409，别用「200 + 自定义 code」糊过去   |
| 无状态           | 每个请求自带全部信息，服务端不靠会话维持客户端状态         |

第四点和第 08 篇的会话是两种思路：页面应用靠会话记住「谁登录了」，REST 接口通常要求每个请求
自带凭证（比如 `Authorization` 头）。**别把会话里的登录态当成 API 的认证方式**——那样接口就
不无状态了，也解释不了移动端为什么不带 Cookie 也能用。

## 2 方法与幂等

先记住「安全」和「幂等」这两个词，接口设计时反复用到：

| 方法     | 用途     | 安全（不改数据） | 幂等（调 N 次等于调 1 次） |
| -------- | -------- | ---------------- | -------------------------- |
| `GET`    | 查询     | 是               | 是                         |
| `POST`   | 新建     | 否               | 否（重复提交会多建一条）   |
| `PUT`    | 整体替换 | 否               | 是                         |
| `PATCH`  | 局部修改 | 否               | 通常不是（除非设计成幂等） |
| `DELETE` | 删除     | 否               | 是（删两次结果一样）       |

**幂等这件事直接影响线上行为**：写操作不是幂等的时候，客户端超时重试就会重复下单。第 12 篇
会讲怎么用版本号/ETag 把更新做成可安全重试的。

## 3 @RestController 与路由

回到代码。`@RestController` 就是 `@Controller` + `@ResponseBody`，方法返回值**直接写进响应体**
（对象由 Jackson 序列化成 JSON），不经过视图解析：

```java
package com.example.library.web;

import com.example.library.domain.Book;
import com.example.library.domain.BookStatus;
import com.example.library.dto.BookResponse;
import com.example.library.dto.BookTitleDto;
import com.example.library.service.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public Page<BookTitleDto> list(@RequestParam(name = "keyword", required = false) String keyword,
                                   Pageable pageable) {
        return bookService.searchTitles(keyword, pageable);
    }

    @GetMapping("/{id}")
    public BookResponse get(@PathVariable Long id) {
        return bookService.toResponse(bookService.findById(id));
    }

    @GetMapping("/summaries")
    public List<BookTitleDto> summaries() {
        return bookService.availableSummaries();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse add(@RequestBody CreateBookRequest request) {
        Book book = bookService.add(request.title(), request.author());
        return bookService.toResponse(book);
    }

    @PatchMapping("/{id}/status")
    public BookResponse changeStatus(@PathVariable Long id, @RequestBody ChangeStatusRequest request) {
        bookService.markStatus(id, request.status());
        return bookService.toResponse(bookService.findById(id));
    }

    public record CreateBookRequest(String title, String author) {
    }

    public record ChangeStatusRequest(BookStatus status) {
    }
}
```

几处设计选择：

- **路径统一带前缀 `/api`**。这样后面加 Nginx 路由、区分页面与接口、给接口单独配认证都方便；
- **类级别 `@RequestMapping` 写资源，方法级别写动作**：`/api/books` + `GET`，不要再出现
  `getBookById` 这种名字；
- **请求体用小 `record`**（`CreateBookRequest`、`ChangeStatusRequest`），声明即文档，
  也不用为它写 setter。**不要直接拿实体当请求体**——客户端就能改到 `id`、`status` 这些
  不该由它决定的字段（第 12 篇展开「批量赋值」风险）；
- **返回 DTO 而不是实体**：`BookResponse` / `BookTitleDto` 只带该给的字段，顺带绕开延迟加载
  字段被序列化时的意外触发。

那两个 DTO 长这样：

```java
package com.example.library.dto;

import com.example.library.domain.Book;
import com.example.library.domain.BookStatus;

/** 对外返回的图书表示：不用把实体直接暴露给客户端 */
public record BookResponse(Long id, String title, String author, BookStatus status, String categoryName) {

    public static BookResponse of(Book book) {
        String categoryName = book.getCategory() == null ? null : book.getCategory().getName();
        return new BookResponse(book.getId(), book.getTitle(), book.getAuthor(), book.getStatus(), categoryName);
    }
}
```

```java
package com.example.library.dto;

/** DTO 构造表达式需要它在 JPQL 里写成全限定类名（见第 03 篇） */
public record BookTitleDto(String title, String author) {
}
```

`BookResponse.of(book)` 在 Service 的事务里调用（`BookServiceImpl.toResponse`），这样访问
`book.getCategory().getName()` 时事务还在，不会撞上 `LazyInitializationException`。

## 4 状态码怎么给

三种写法，按需要选：

| 场景                       | 写法                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| 固定返回某个状态码         | 方法上 `@ResponseStatus(HttpStatus.CREATED)`                     |
| 状态码要按运行时情况决定   | 返回 `ResponseEntity<T>`，`ResponseEntity.status(...).body(...)` |
| 出错了要返回结构化错误信息 | 抛异常 + `@RestControllerAdvice`（见下节）                       |

常用状态码对照：

| 码                | 含义           | 常见场景                               |
| ----------------- | -------------- | -------------------------------------- |
| 200 OK            | 成功           | GET、PATCH 成功                        |
| 201 Created       | 已创建         | POST 成功；配合 `Location` 头更规范    |
| 204 No Content    | 成功但无响应体 | DELETE 成功                            |
| 400 Bad Request   | 请求不合法     | 参数格式错、校验不通过                 |
| 401 Unauthorized  | 未认证         | 没带或带了无效凭证                     |
| 403 Forbidden     | 已认证但无权限 | 普通用户调管理员接口                   |
| 404 Not Found     | 资源不存在     | id 查不到                              |
| 409 Conflict      | 与当前状态冲突 | 重复创建、状态不允许（书已借出）       |
| 422 Unprocessable | 语义有误       | 有些团队用它区分「格式对但业务不合法」 |
| 500               | 服务端错误     | 未捕获异常，**不该暴露堆栈给客户端**   |

## 5 错误响应用 ProblemDetail

错误信息最忌讳一个接口一套格式。Spring 6 提供了对应 RFC 7807 的 `ProblemDetail`，
配合 `@RestControllerAdvice` 就能统一：

```java
package com.example.library.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

/** REST 接口的统一异常处理：返回 RFC 7807 风格的问题详情 */
@RestControllerAdvice(assignableTypes = BookController.class)
public class ApiExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ProblemDetail handleNotFound(NoSuchElementException ex) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        detail.setTitle("资源不存在");
        return detail;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        detail.setTitle("请求参数不合法");
        return detail;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleConflict(IllegalStateException ex) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        detail.setTitle("当前状态不允许该操作");
        return detail;
    }
}
```

返回体长这样（字段名是规范的固定部分）：

```json
{
  "type": "about:blank",
  "title": "资源不存在",
  "status": 404,
  "detail": "找不到图书：999"
}
```

**`assignableTypes = BookController.class` 这个限定很重要**。不加限定的话，所有控制器（包括
页面型的 `BookViewController`）的异常都会被这个 advice 接走，返回 JSON 给浏览器——用户看到的
就不是错误页面而是一段 JSON 了。第 06 篇的 `GlobalExceptionHandler` 用 `assignableTypes`
限定在页面控制器上，两者各管一段，互不干扰。

## 6 MockMvc：把接口测起来

接口的价值在于「行为契约」，所以最值得写的就是这种端到端测试——真实上下文、真实拦截器、
真实数据库：

```java
package com.example.library.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** 端到端：真实上下文 + 真实拦截器 + 真实数据库 */
@SpringBootTest
@AutoConfigureMockMvc
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/books 返回分页 JSON，并且不被登录拦截器拦下")
    void listsBooks() throws Exception {
        mockMvc.perform(get("/api/books").param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    @DisplayName("POST /api/books 返回 201 与新建的图书")
    void createsBook() throws Exception {
        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                 {"title":"重构","author":"Martin Fowler"}
                                 """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("重构"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("查询不存在的图书返回 404 与 ProblemDetail")
    void returnsProblemDetailForMissingBook() throws Exception {
        mockMvc.perform(get("/api/books/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("资源不存在"))
                .andExpect(jsonPath("$.status").value(404));
    }
}
```

三条测试分别盯住三件事：**返回结构**（分页字段）、**写操作的状态码与响应体**、**错误契约**。
它们同时在验证第 09 篇那个登录拦截器的 `excludePathPatterns("/api/**")` 有没有配对——第一个
测试没带任何会话，能返回 200 就说明接口没被页面那套拦截挡住。

`@AutoConfigureMockMvc` 在 Boot 4 里也从 `org.springframework.boot.test.autoconfigure.web.servlet`
搬到了 `org.springframework.boot.webmvc.test.autoconfigure`。

## 7 切片测试：快，但有两个坑

只测 MVC 层（不启动数据库、不启动整个应用）用 `@WebMvcTest`，依赖换成
`spring-boot-starter-webmvc-test`：

```java
@WebMvcTest(BookController.class)
class BookControllerSliceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService bookService;

    @MockitoBean
    private LoginInterceptor loginInterceptor;

    @MockitoBean
    private AdminInterceptor adminInterceptor;

    @MockitoBean
    private TimingInterceptor timingInterceptor;

    @BeforeEach
    void allowAllRequestsThrough() throws Exception {
        // Mock 出来的拦截器 preHandle 默认返回 false，会让所有请求中断，必须显式放行
        given(loginInterceptor.preHandle(any(), any(), any())).willReturn(true);
        given(adminInterceptor.preHandle(any(), any(), any())).willReturn(true);
        given(timingInterceptor.preHandle(any(), any(), any())).willReturn(true);
    }

    @Test
    @DisplayName("切片测试：返回图书 JSON")
    void returnsBookJson() throws Exception {
        Book book = new Book("重构", "Martin Fowler");
        given(bookService.findById(1L)).willReturn(book);
        given(bookService.toResponse(book)).willReturn(
                new BookResponse(1L, "重构", "Martin Fowler", BookStatus.AVAILABLE, "技术"));

        mockMvc.perform(get("/api/books/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("重构"))
                .andExpect(jsonPath("$.categoryName").value("技术"));
    }
}
```

两个坑都在上面这段代码里留了痕迹：

1. **`WebConfig` 会被一起加载**。它也是 `WebMvcConfigurer`，属于 MVC 层的一部分，所以
   `@WebMvcTest` 会把它装上；而它构造器依赖三个拦截器 Bean（`@Component`，切片测试**不**
   扫描），于是上下文启动失败。解法就是给这三个拦截器提供替身（或者把 `WebConfig` 从切片里
   排除掉）；
2. **替身的 `preHandle` 默认返回 `false`**。Mockito 对返回 `boolean` 的方法默认给 `false`，
   于是每个请求都被判成「未登录」——测试表现是 403/302 而不是断言失败，很容易看错方向。
   所以 `@BeforeEach` 里必须显式 `willReturn(true)`。

`@MockitoBean` 在 Boot 4 里位于 `org.springframework.test.context.bean.override.mockito.MockitoBean`，
它取代了已被移除的 `@MockBean`。另外别忘了第 01 篇那个环境坑：JDK 17 下跑任何 Mockito 测试
`surefire` 都需要 `-Djdk.attach.allowAttachSelf=true`。

## 8 容易踩的坑

| 现象                                                       | 原因                                                             | 处理                                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 启动直接失败：`Ambiguous mapping`                          | 两个控制器映射到了同一个「方法 + 路径」                          | 改路径。示例工程里 `/books/new` 同时被页面控制器和多步表单控制器占用，把后者挪到了 `/books/wizard` |
| GET 请求返回 405                                           | 路径对了但请求方法不在映射里（只有 `@PostMapping`）              | 补上对应的映射，或用 `@RequestMapping` 放开方法                                                    |
| 客户端收到的是 HTML 错误页而不是 JSON                      | 异常被页面型的 `@ControllerAdvice` 接管了                        | 两个 advice 都用 `assignableTypes` 限定各自的范围                                                  |
| 接口返回里出现一堆意外的字段（甚至报延迟加载异常）         | 直接把实体当响应体返回                                           | 用 DTO / 投影返回                                                                                  |
| 客户端能改到不该改的字段（比如 `status`、`id`）            | 用实体接收 `@RequestBody`                                        | 用专门的请求 record，只放允许的字段                                                                |
| `POST` 重复调用产生重复数据                                | 写操作本来就不幂等                                               | 用业务唯一键 + 唯一约束兜底；或改设计（第 12 篇）                                                  |
| 分页接口被 `?sort=` 拖慢                                   | 排序字段客户端可控                                               | 限制 `spring.data.web.pageable.max-page-size`，并做字段白名单                                      |
| 切片测试启动就失败，报找不到拦截器 Bean                    | `@WebMvcTest` 会加载 `WebMvcConfigurer`，却不会扫描 `@Component` | 给拦截器提供 `@MockitoBean` 替身                                                                   |
| 切片测试里每个请求都被判未登录                             | 替身的 `preHandle` 默认返回 `false`                              | `@BeforeEach` 里显式 `willReturn(true)`                                                            |
| 所有 Mockito 测试启动时报 `MockitoInitializationException` | JDK 17 默认禁止 agent 自附加                                     | surefire 加 `-Djdk.attach.allowAttachSelf=true`（第 01 篇）                                        |

## 9 小结

- **Service 不动，加一层薄薄的 `@RestController`** 就能同时服务页面与客户端；
- REST 的四条约定：**名词资源、方法表意、状态码表意、无状态**；记住方法与「安全/幂等」的对应；
- 请求体与响应体都用 **DTO**（record 最省事），不要直接暴露实体；
- **状态码**用 `@ResponseStatus` / `ResponseEntity` / 异常映射三种方式表达；
- 错误统一用 **`ProblemDetail` + `@RestControllerAdvice(assignableTypes = ...)`**，并用
  `assignableTypes` 与页面型的 advice 隔开；
- 测试优先写 **`@SpringBootTest` + `@AutoConfigureMockMvc`** 的端到端断言；
  `@WebMvcTest` 切片更快，但要处理 `WebMvcConfigurer` 依赖与替身 `preHandle` 这两个坑。

接口能跑通了，但「能用的接口」和「好用的接口」之间还有距离：URL 怎么设计、怎么演进版本、
怎么让更新可以安全重试、跨域怎么办。下一篇集中处理这些。
