---
title: Spring 学习笔记 12：REST 进阶——版本、更新、跨域与文档化
description: 接口能跑通之后要处理的几件事：URL 与响应结构怎么定、版本怎么演进、更新怎么做到可安全重试、CORS 怎么配、HATEOAS 与 Spring Data REST 该不该用。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - REST
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 12
---

> 这是一份个人学习笔记：概念与配置是我按自己的理解整理的，标了「实测」的代码在示例工程里
> 跑过测试，参考的是 Spring 官方文档与 RFC 9110（HTTP 语义）、RFC 7807（问题详情）。

## 0 「能跑」和「好用」差在哪

第 11 篇的接口已经能用了，但它离「别人愿意对接、半年后自己还看得懂」还有距离：

- URL 起名随意，半年后分不清 `/books/search` 和 `/books/find` 有什么区别；
- 改一个字段名就把已有客户端全弄坏；
- 更新接口重试一次就多写一条数据；
- 前端在 `localhost:5173` 上跑，浏览器直接拦掉了请求；
- 接口文档靠口口相传。

这一篇按这五件事的顺序处理。

## 1 URL 与响应结构的约定

**路径用复数名词表示资源集合**，层级最多两层，再深就该用查询参数：

| 想要的东西     | 推荐写法                                       | 别这样写                          |
| -------------- | ---------------------------------------------- | --------------------------------- |
| 图书集合       | `GET /api/books`                               | `GET /api/getAllBooks`            |
| 单本图书       | `GET /api/books/42`                            | `GET /api/book?id=42`             |
| 过滤           | `GET /api/books?author=余华&status=AVAILABLE`  | `GET /api/books/author/余华`      |
| 某本书的标签   | `GET /api/books/42/tags`                       | `GET /api/books/42/tags/list`     |
| 改状态（动作） | `PATCH /api/books/42/status`                   | `POST /api/books/42/changeStatus` |
| 分页           | `GET /api/books?page=0&size=10&sort=title,asc` | `GET /api/books/page/0`           |

两条容易被忽略的规则：

- **过滤、排序、分页一律用查询参数**，不要把条件写进路径。路径只用来定位资源，参数才用来
  筛选与分页；
- **动作尽量用方法表达**（`PATCH`、`DELETE`），实在没法用名词表达的状态迁移，才退而用
  `POST /资源/{id}/动作`（比如 `POST /api/books/42/reserve`），并且要接受「这就是个过程式接口」
  的事实。

响应结构上，约定两件事：

| 场景       | 建议                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 集合       | 统一返回分页结构（`content`、`totalElements`、`totalPages`…），别一会儿数组一会儿对象                |
| 字段命名   | 全站统一 camelCase 或 snake_case，别混用；Java 侧默认 camelCase 最省事                               |
| 是否包一层 | 简单项目可以直接返回分页结构；要加 `traceId`、`meta` 之类再考虑包一层 `{ "data": ..., "meta": ... }` |

示例工程的 `GET /api/books` 返回的是 Spring Data 的 `Page` 序列化结果：

```json
{
  "content": [
    { "title": "重构", "author": "Martin Fowler" }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 10 },
  "totalElements": 5,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

## 2 版本怎么演进

只要接口对外了，**任何一次字段改名都是一次破坏性变更**。要不要加版本号，看对接方有多少：

| 方式                 | 例子                                      | 优点                   | 缺点                             |
| -------------------- | ----------------------------------------- | ---------------------- | -------------------------------- |
| 路径里带版本         | `/api/v1/books`                           | 最直观、最好路由与缓存 | URL 变长；"版本"与资源耦合在一起 |
| 查询参数             | `/api/books?version=1`                    | 改动最小               | 容易被漏掉；缓存不友好           |
| 请求头               | `X-Api-Version: 1`                        | URL 干净               | 调试时不直观                     |
| 媒体类型（内容协商） | `Accept: application/vnd.library.v1+json` | 最"REST"               | 客户端支持成本高、调试麻烦       |

实践中的建议：

- **内部接口先不加版本**，等有外部对接方再考虑。加版本意味着维护多套代码；
- 要加就**用路径版本**（`/api/v1/...`），配 Nginx 与网关最方便，调试时肉眼可见；
- **非破坏性变更不用新版本**：加可选字段、加新端点都属于兼容改动；
- 真正破坏性的字段语义变更，与其加版本号，不如**直接加一个新字段**（`status` 保留，
  新增 `statusDetail`），老客户端继续工作。这通常比维护两套 API 便宜得多。

## 3 更新与并发：怎么做到可安全重试

第 11 篇那张方法表里提过：`PUT` 幂等、`POST` 不幂等、`PATCH` 通常不幂等。落到「同时有人改同一
本书」上，还有并发问题——两个管理员同时编辑，后提交的会**覆盖**前一个的修改（丢失更新）。

第 10 篇给过乐观锁的做法，这里补上它在 HTTP 层的样子：

```java
@Entity
public class Book {

    @Version
    private Long version;

    // 其余字段与 getter / setter 见第 02、04 篇
}
```

Hibernate 在 `update` 时自动带上版本条件（`where id = ? and version = ?`）。**把这个版本号暴露给
客户端**，就变成了可用的并发控制手段：

| 步骤 | 客户端                              | 服务端                                       |
| ---- | ----------------------------------- | -------------------------------------------- |
| 1    | `GET /api/books/42`                 | 返回数据 + 响应头 `ETag: "3"`（版本号）      |
| 2    | 修改后带 `If-Match: "3"` 提交 `PUT` | 校验版本；一致才更新，并把 `version` 加一    |
| 3    | 若拿到 412 Precondition Failed      | 说明别人先改过，客户端重新拉取再决定是否覆盖 |

Spring 侧的做法是让更新方法接收 `@RequestHeader(value = "If-Match", required = false) String ifMatch`，
与实体上的 `@Version` 比对；不一致就返回 `412`。**不比对也不会丢数据**——乐观锁本身会抛
`OptimisticLockingFailureException`——但**主动比对能给客户端一个明确的 412**，而不是含糊的 500。

不打算实现 ETag 时，至少做到两件事：

1. **把 `@Version` 的冲突异常映射成 409**（我们的 `ApiExceptionHandler` 已经处理
   `IllegalStateException`，可以再加一条 `ObjectOptimisticLockingFailureException`）；
2. **别把 PUT 做成「整体覆盖」**。客户端只发自己想改的字段（`PATCH` 语义），服务端只更新
   非空字段，能避免把别人刚改的字段顺手抹掉。

顺带一个真实教训：`POST` 不幂等，客户端超时重试就会重复创建。要支持重试，可以让客户端带一个
`Idempotency-Key` 请求头，服务端把它和结果一起落库，重复的 key 直接返回上次的结果。这在支付、
下单类接口里几乎是标配。

## 4 CORS：浏览器为什么拦你的请求

前端跑在 `http://localhost:5173`，接口在 `http://localhost:8080`，**端口不同就算跨域**。同源策略
是浏览器强制的：请求可能发出去了，但**响应会被浏览器丢掉**，控制台报 CORS 错误。

两种配置方式，选一种即可：

```java
// 方式一：全局配置（示例工程用的这种，已实测）
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PATCH", "DELETE")
            .allowedHeaders("Content-Type", "Authorization")
            .allowCredentials(false)
            .maxAge(3600);
}
```

```java
// 方式二：单个接口或控制器上加注解
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/books")
public class BookController { ... }
```

几个必须知道的点：

- **别用 `allowedOrigins("*")` 图省事**，尤其不能和 `allowCredentials(true)` 一起用（浏览器会
  直接拒绝）。要支持凭证就列出具体来源；
- **预检请求（OPTIONS）是浏览器自动发的**，不会进入你的控制器方法。带自定义头（比如
  `Authorization`）或非简单方法（`PATCH`、`DELETE`）时都会先发预检；`maxAge` 就是缓存预检结果的
  秒数；
- CORS 是**浏览器**的限制，`curl`、Postman、移动端都不会受影响——所以「本地测试好好的，
  前端一调就报错」很常见；
- 生产环境通常由网关或 Nginx 统一加 CORS 头，与代码里的配置**二选一**，两处都配容易重复头。

实测的验证方式是直接断言响应头：

```java
@Test
@DisplayName("来自允许来源的跨域请求会带上 CORS 响应头")
void allowsConfiguredOrigin() throws Exception {
    mockMvc.perform(get("/api/books").header("Origin", "http://localhost:5173"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
}
```

## 5 校验失败的响应长什么样

请求体校验失败默认会抛 `MethodArgumentNotValidException`，如果不处理，客户端拿到的是一段默认
错误 JSON，字段级信息不好用。**实测**的处理方式（第 11 篇的 `ApiExceptionHandler` 里加一段）：

```java
/** @RequestBody 上的 @Valid 校验失败时，把字段级错误一并返回 */
@ExceptionHandler(MethodArgumentNotValidException.class)
public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
    ProblemDetail detail = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "请求参数校验未通过");
    detail.setTitle("校验失败");

    List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(error -> Map.of(
                    "field", error.getField(),
                    "message", Optional.ofNullable(error.getDefaultMessage()).orElse("非法值")))
            .toList();
    detail.setProperty("errors", errors);
    return detail;
}
```

请求体里的 record 加注解，配合控制器上的 `@Valid`：

```java
public record CreateBookRequest(
        @NotBlank(message = "书名不能为空") String title,
        @NotBlank(message = "作者不能为空") String author) {
}
```

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public BookResponse add(@Valid @RequestBody CreateBookRequest request) {
    Book book = bookService.add(request.title(), request.author());
    return bookService.toResponse(book);
}
```

提交 `{"title":"","author":""}` 会拿到：

```json
{
  "title": "校验失败",
  "status": 400,
  "detail": "请求参数校验未通过",
  "errors": [
    { "field": "title", "message": "书名不能为空" },
    { "field": "author", "message": "作者不能为空" }
  ]
}
```

**字段名和消息都结构化返回**，前端可以直接把 `message` 显示在对应输入框下面。

## 6 分页与排序的两道闸

`Pageable` 能被自动装配是方便，也是风险——`?size=100000` 和 `?sort=` 任意字段都能被客户端控制。
两道闸一定要加：

```properties
# 单页最大条数，超过会被夹到这个值
spring.data.web.pageable.max-page-size=50
# 默认单页条数
spring.data.web.pageable.default-page-size=10
```

排序字段的白名单要在代码里限制（配置项管不了具体字段名）：

```java
private static final Set<String> SORTABLE = Set.of("title", "author", "publishedYear", "id");

private void checkSort(Pageable pageable) {
    pageable.getSort().forEach(order -> {
        if (!SORTABLE.contains(order.getProperty())) {
            throw new IllegalArgumentException("不支持的排序字段：" + order.getProperty());
        }
    });
}
```

在 `list` 方法开头调用它，非法参数会被映射成 400。**为什么必须做**：允许按任意字段排序，
意味着数据库可能对没有索引的大字段（长文本、JSON 列）做全表排序，一个参数就能把库拖慢。

翻页方式上，返回类型也可以再选一次：

| 场景                 | 返回类型 / 方式                       | 原因                               |
| -------------------- | ------------------------------------- | ---------------------------------- |
| 带页码跳转的后台列表 | `Page<T>`                             | 需要总页数；代价是额外的 count     |
| 无限滚动、移动端列表 | `Slice<T>`，或游标分页（`?after=id`） | 不需要总数，游标分页在深翻页时更稳 |

**深翻页（`page=10000`）在 `OFFSET` 实现下会越来越慢**，游标分页（按 `id > 上次最后一条`）没有这个
问题——数据量大时值得早点改成游标。

## 7 HATEOAS 与 Spring Data REST：两个"可选件"

这两个都在 Boot 4 的依赖清单里（`spring-boot-starter-hateoas`、`spring-boot-starter-data-rest`），
但**示例工程没有启用**，因为它们的收益与代价都必须先想清楚。

**HATEOAS**（Hypermedia as the Engine of Application State）是在响应里带上「接下来能做什么」的
链接：

```json
{
  "id": 42,
  "title": "重构",
  "_links": {
    "self":   { "href": "/api/books/42" },
    "author": { "href": "/api/books/42/author" },
    "borrow": { "href": "/api/books/42/borrow" }
  }
}
```

- **适合**：状态机式的业务（订单从「待付款」到「已支付」到「已发货」，客户端靠链接导航）、
  接口长期演进且客户端很多；
- **不适合**：内部简单 CRUD、前端页面已经写死了调用路径。此时 `_links` 只是让响应变大、
  让测试断言更啰嗦。

**Spring Data REST** 更进一步：给仓储接口加一行注解，就自动生成一套 CRUD API：

```java
// 需要 spring-boot-starter-data-rest；本工程未启用
@RepositoryRestResource(path = "books")
public interface BookRepository extends JpaRepository<Book, Long> { ... }
```

- **适合**：内部工具、后台管理、原型，能省掉大量样板代码；
- **风险**：它**默认把你的实体结构直接暴露成 API**，包括关联字段和写入路径；分页、排序、
  过滤语义都由框架决定；想加业务校验、权限、DTO 都要绕。**对外的接口不建议直接这样暴露**，
  示例工程里手写的那层薄适配（`BookController` + DTO）就是它的替代方案。

一句话取舍：**先手写一层适配，等确认「这层就是纯样板」再考虑用自动生成**。

## 8 安全上的几条硬要求

- **认证与授权分开**：401 是「你是谁不知道」，403 是「知道你是谁但不许」。别用 404 掩盖 403
  当成常规做法（除非刻意隐藏资源存在性）；
- **不要用实体接收入参**：只接收允许的字段（用 record/DTO），否则客户端能顺手改 `id`、
  `status`、`role`，这类问题叫批量赋值（mass assignment）；
- **别把内部异常信息原样返回**：`ex.getMessage()` 里可能带表名、SQL 片段。给客户端看的
  `detail` 要是业务语言，堆栈只进日志；
- **密码永远不要出现在响应里**：`BookResponse` 这种做法值得推广到所有 DTO；
- **写接口考虑限流与幂等键**，尤其是第三方可调用的接口；
- **开启 HTTPS 之后**，把响应头补齐（`Strict-Transport-Security` 等），这些通常在网关统一做。

## 9 测试策略：三层各测什么

| 层次     | 用什么                                                       | 测什么                            | 成本 |
| -------- | ------------------------------------------------------------ | --------------------------------- | ---- |
| 仓储层   | `@DataJpaTest`（第 04 篇）                                   | 查询方法写对没有、映射对不对      | 低   |
| MVC 层   | `@WebMvcTest` + `MockMvc`（第 11 篇）                        | 路由、状态码、JSON 结构、参数校验 | 低   |
| 端到端   | `@SpringBootTest` + `@AutoConfigureMockMvc`（第 11 篇）      | 拦截器、事务、序列化一起是否协调  | 中   |
| 业务逻辑 | `@SpringBootTest`（第 10 篇的 `LoanServiceTransactionTest`） | 事务边界与回滚                    | 中   |

原则是**能测小就不测大**：一条派生查询用 `@DataJpaTest` 就够了；只有「拦截器 + 控制器 + 数据库
一起」才值得上端到端。示例工程 18 条测试基本就是这个分布（7 条仓储、3 条事务、5 条端到端、
1 条切片、2 条其他）。

对外提供的接口还值得补一层**契约测试**（把 OpenAPI 文档作为契约，客户端与服务端各自校验），
但那需要引入 springdoc 之类的工具，超出本系列范围。

## 10 容易踩的坑

| 现象                                          | 原因                                     | 处理                                                      |
| --------------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| 前端报 CORS 错误，`curl` 却正常               | 同源策略是浏览器行为，且响应被浏览器丢掉 | 配 `addCorsMappings` 或 `@CrossOrigin`，别用 `"*"` 配凭证 |
| 带 `Authorization` 的请求总是先发一次 OPTIONS | 自定义头触发预检请求                     | 正常现象；用 `maxAge` 缓存预检结果                        |
| CORS 头在响应里出现两次                       | 网关和代码同时配了                       | 二选一，统一在一处配                                      |
| 接口改了字段名，老客户端全挂                  | 破坏性变更没走版本或没做兼容             | 优先新增字段而不是改语义；必须改就开 `/api/v2`            |
| 两个人同时编辑，后提交的覆盖了前一个          | 丢失更新                                 | `@Version` + ETag/`If-Match`，冲突返回 409/412            |
| 客户端超时重试造成重复数据                    | `POST` 不幂等                            | 业务唯一键 + 唯一约束兜底，或加幂等键                     |
| 有人用 `?size=100000` 拉库                    | 分页参数没有上限                         | `spring.data.web.pageable.max-page-size`                  |
| 有人用 `?sort=` 按大字段排序拖慢数据库        | 排序字段客户端可控                       | 排序字段白名单（第 6 节）                                 |
| 校验失败只返回一句「400 Bad Request」         | 没处理 `MethodArgumentNotValidException` | 统一映射成带 `errors` 数组的 `ProblemDetail`              |
| 响应里带出 `password`、内部主键等敏感字段     | 直接序列化实体                           | 用 DTO / 投影响应                                         |
| 客户端把 `id` 传进来改了主键                  | 用实体接收入参（批量赋值）               | 用专门的请求 record，只放允许字段                         |

## 11 小结与本系列收尾

- URL 用**复数名词 + 查询参数**，动作交给 HTTP 方法；
- 版本优先**不加**，要加就加在路径上；能用「加新字段」解决的，不要开新版本；
- 更新要考虑并发与重试：**`@Version` + ETag/`If-Match`**，冲突返回 409/412，
  非幂等写操作考虑幂等键；
- CORS 是浏览器行为，**只允许具体来源**，注意预检与「网关/代码二选一」；
- 校验失败要返回**字段级错误**（`ProblemDetail` + `errors`），别只给一句 400；
- 分页排序**两道闸**：`max-page-size` 与排序字段白名单；
- HATEOAS 与 Spring Data REST 是**可选件**，先想清收益与暴露面；
- 安全底线：认证与授权分开、不要用实体收参数、错误信息不暴露内部细节。

《Spring 学习笔记》到这里十二篇走完，正好覆盖了从「容器怎么装 Bean」到「接口怎么对外」的
完整链路：

| 阶段 | 篇目  | 关键收获                                   |
| ---- | ----- | ------------------------------------------ |
| 起步 | 01    | IoC 容器、依赖注入、Spring Boot 项目骨架   |
| 数据 | 02–04 | 实体映射、查询、关联与仓储测试             |
| Web  | 05–07 | MVC 请求流程、表单与校验、模板复用与国际化 |
| 状态 | 08–09 | 会话、拦截器（谁能访问、什么时候检查）     |
| 事务 | 10    | `@Transactional` 的边界、传播与并发控制    |
| 对外 | 11–12 | REST 接口、状态码、版本与跨域              |

后面想继续深入，按性价比排序大概是：**Spring Security**（认证授权的标准做法，替代手写拦截器）、
**测试**（Testcontainers 用真实数据库跑集成测试）、**可观测性**（Actuator + Micrometer）、
**缓存与消息**（Spring Cache、Spring for Apache Kafka）。这几个主题都不会推翻前面学到的东西，
而是在同一套容器与分层之上继续加能力。
