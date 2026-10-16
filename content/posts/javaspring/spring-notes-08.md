---
title: Spring 学习笔记 08：HTTP Session 与会话状态管理
description: HTTP 无状态带来的问题，Cookie 与 Session 怎么分工，Spring 里读写会话的几种方式，以及会话固定、超时、多实例共享这些必须想清楚的事。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Session
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 8
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档与 Spring Session 官方文档。理解有偏差的地方欢迎指出。

## 0 「登录了」这件事存在哪里

一个绕不开的需求：用户登录一次，后续每个请求都算已登录。可是 **HTTP 是无状态的**——每个请求
都是独立的，服务端从请求本身看不出「这两个请求来自同一个浏览器」。

解决办法就在 Cookie 与 Session 的分工上：

| 放哪   | 存什么                          | 为什么                                       |
| ------ | ------------------------------- | -------------------------------------------- |
| 浏览器 | 一个会话标识（如 `JSESSIONID`） | 客户端只拿着一个「号码牌」，不接触真实数据   |
| 服务端 | 这个标识对应的数据              | 数据留在服务端，客户端改不了，也不会泄露内容 |

流程是：第一次请求时服务端创建会话，把标识通过 `Set-Cookie` 下发；之后浏览器每次请求自动带上
这个 Cookie；服务端用它查出对应的会话数据。**数据放服务端、标识放客户端**，这就是会话机制的
核心。

顺带一个结论：客户端只能改那个标识，没法伪造会话内容——但**可以偷别人的标识**。这是后面要谈的
会话固定问题。

## 1 在 Spring 里读写会话

Servlet 容器管理着 `HttpSession`。Spring MVC 允许直接把它注入方法参数：

```java
package com.example.library.web;

import com.example.library.domain.User;
import com.example.library.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttribute;

@Controller
@RequestMapping("/account")
public class AccountController {

    private final UserService userService;

    public AccountController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public String loginForm() {
        return "account/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        HttpServletRequest request) {
        User user = userService.authenticate(username, password);

        // 防会话固定攻击：登录成功后换一个会话标识，原有数据保留
        request.changeSessionId();
        request.getSession().setAttribute("loginUser", user);

        return "redirect:/books";
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();       // 整个会话作废，不只是删一个属性
        return "redirect:/books";
    }
}
```

注意这里方法参数从 `HttpSession` 换成了 `HttpServletRequest`——因为 `changeSessionId()` 是
request 上的方法（import 也要相应加上 `jakarta.servlet.http.HttpServletRequest`）。
`changeSessionId()` 在第 6.1 节还会展开讲。

这个控制器用到的 `User` 与 `UserService`，这一篇之前没出现过，完整定义如下：

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

@Entity
@Table(name = "app_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60, unique = true)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(length = 80)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.MEMBER;

    protected User() {
    }

    public User(String username, String password, String displayName, UserRole role) {
        this.username = username;
        this.password = password;
        this.displayName = displayName;
        this.role = role;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getDisplayName() {
        return displayName;
    }

    public UserRole getRole() {
        return role;
    }
}
```

```java
package com.example.library.domain;

public enum UserRole {

    MEMBER,
    LIBRARIAN,
    ADMIN
}
```

```java
package com.example.library.repository;

import com.example.library.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}
```

```java
package com.example.library.service;

import com.example.library.domain.User;

public interface UserService {

    User authenticate(String username, String password);

    User findByUsername(String username);
}
```

```java
package com.example.library.service;

import com.example.library.domain.User;
import com.example.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("用户不存在：" + username));
        // 示例工程为了简单直接比对明文；真实项目必须用 BCrypt 之类的哈希比对
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("用户名或密码不正确");
        }
        return user;
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("用户不存在：" + username));
    }
}
```

四个基本操作：

| 操作       | 方法                                                   |
| ---------- | ------------------------------------------------------ |
| 写入/覆盖  | `session.setAttribute("key", value)`                   |
| 读取       | `session.getAttribute("key")`（返回 `Object`，要强转） |
| 删除某一项 | `session.removeAttribute("key")`                       |
| 作废会话   | `session.invalidate()`                                 |

读取时更推荐用 `@SessionAttribute`，省掉强转，也把「这个参数来自会话」写在了签名上：

```java
@GetMapping
public String list(@SessionAttribute(name = "loginUser", required = false) User user,
                   Model model) {
    model.addAttribute("user", user);
    return "books/list";
}
```

**`required = false` 很关键**：没登录时该属性不存在，不写这个参数会直接 400。注意
`@SessionAttribute` 只读不写，与后面要讲的 `@SessionAttributes` 是两回事（名字太像，容易混淆）。

## 2 模板里怎么用会话数据

Thymeleaf 里，会话属性可以直接通过 `session` 前缀访问：

```html
<p th:if="${session.loginUser != null}">
    欢迎，<span th:text="${session.loginUser.name}">张三</span>
</p>
<p th:unless="${session.loginUser != null}">
    <a th:href="@{/account/login}">登录</a>
</p>
```

`${session.xxx}` 等价于 `session.getAttribute("xxx")`。但**不要在模板里做权限判断**——模板只
负责显示，能不能访问由服务端决定（见下一篇的拦截器）。

## 3 两种「会话级数据」的写法

### 3.1 @SessionAttributes：多步表单

分几步填的表单（先填基本信息，再填详情，最后确认），每步的数据要暂存在会话里：

```java
package com.example.library.web;

import com.example.library.dto.BookDraft;
import com.example.library.dto.BookForm;
import com.example.library.service.BookService;
import com.example.library.service.CategoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;

@Controller
@RequestMapping("/books/wizard")
@SessionAttributes("draft")
public class BookWizardController {

    private final BookService bookService;
    private final CategoryService categoryService;

    public BookWizardController(BookService bookService, CategoryService categoryService) {
        this.bookService = bookService;
        this.categoryService = categoryService;
    }

    @ModelAttribute("draft")
    public BookDraft draft() {
        return new BookDraft();          // 第一次进入时创建
    }

    @GetMapping
    public String start(Model model) {
        model.addAttribute("categories", categoryService.findAll());
        return "books/wizard-step1";
    }

    @PostMapping("/step1")
    public String step1(@ModelAttribute("draft") BookDraft draft, Model model) {
        model.addAttribute("categories", categoryService.findAll());
        return "books/wizard-step2";
    }

    @PostMapping("/finish")
    public String finish(@ModelAttribute("draft") BookDraft draft, SessionStatus sessionStatus) {
        BookForm form = new BookForm();      // 草稿转成 06 篇的表单对象，交给同一个 Service
        form.setTitle(draft.getTitle());
        form.setAuthor(draft.getAuthor());
        form.setCategoryId(draft.getCategoryId());
        bookService.create(form);

        sessionStatus.setComplete();     // 用完必须清掉，否则会话里一直留着
        return "redirect:/books";
    }
}
```

`BookDraft` 就是三个字段加 getter/setter 的普通类（和第 06 篇的 `BookForm` 一个路子）：

```java
package com.example.library.dto;

public class BookDraft {

    private String title;

    private String author;

    private Long categoryId;

    // 省略的部分就是这三个字段的 getter / setter，表单绑定必须要有
}
```

`@SessionAttributes("draft")` 的含义是：**这个模型属性同时放进会话**，跨请求保留。要点：

- 名字要与 `@ModelAttribute("draft")` 一致；
- 流程结束（或用户取消）时**调用 `SessionStatus.setComplete()`**，否则数据一直占着会话内存；
- 它作用于整个控制器，判断「这一步该不该读旧数据」比较绕。多步流程不多时，直接用
  `HttpSession` 反而更直白；
- **路径不能和已有页面撞车**：多步表单最初也挂在 `/books/new` 上，而第 05 篇的
  `BookViewController` 已经有一个 `@GetMapping("/new")`，应用启动时直接失败——
  `Ambiguous mapping. Cannot map 'bookWizardController' method`。把这里改成 `/books/wizard`
  就好了。这类错误在启动期就暴露，比 404 好查得多：**看到 Ambiguous mapping，就去查两个
  控制器是不是映射了同一个「方法 + 路径」**。

### 3.2 @Scope("session")：会话级 Bean

```java
@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class Cart {
    private final List<CartItem> items = new ArrayList<>();
    // ...
}
```

每个会话一个 `Cart` 实例，直接注入到单例的 Service/Controller 里也不会有状态串台的问题——
`proxyMode` 让注入的是一个代理，实际调用时才解析到当前会话的实例。

它写起来优雅，但**生命周期不容易看清**（什么时候创建、什么时候销毁都很隐式）。除非对象确实
是「会话级领域对象」，用显式的 `HttpSession` 通常更好维护。

## 4 会话数据的边界：什么不该放

会话是有成本、也有风险的地方：

- **别放大对象**。会话默认存在服务端内存里，几千个并发会话各挂一个完整对象清单，内存很快就
  吃紧；
- **别放敏感信息**（密码、完整证件号）。会话标识一旦泄露，里面的内容就成了攻击者的资产；
- **别放临时计算结果**，那些该留在请求范围内；
- **能放数据库就放数据库**。购物车这类需要长期保留、还要跨设备一致的数据，更适合落库（用
  用户 id 关联），会话里只留标识。

一个简单的判断标准：**这条数据是不是「这个浏览器会话期间才有意义」**？是，才放会话。

## 5 会话的存储与「重启就掉线」

默认情况下会话存在**单个应用进程的内存**里。这带来三个现实问题：

1. **重启即失效**：所有用户都被强制下线；
2. **多实例不共享**：负载均衡到另一台机器时，用户「莫名掉线」；
3. **无法水平扩容**：会话状态绑在了具体进程上。

**Spring Session** 的思路是把会话数据从容器内存里搬出去，交给外部存储（JDBC、Redis 等），
应用侧仍然用标准的 `HttpSession` API，代码基本不用改。

用数据库存的话，加一个依赖：

```xml
<dependency>
    <!-- Boot 4 有专门的 starter；Boot 3 里要写 org.springframework.session:spring-session-jdbc -->
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-session-jdbc</artifactId>
</dependency>
```

```properties
# 首次运行时自动建 spring_session / spring_session_attributes 表
spring.session.jdbc.initialize-schema=always
# 表建好之后改成 never，交给迁移脚本管理
# spring.session.jdbc.initialize-schema=never
```

两点版本差异要注意：

- **`spring.session.store-type` 从 Boot 3 起就移除了**（Boot 2.x 时代要写
  `spring.session.store-type=jdbc`），现在根据类路径上的实现自动判断——照抄老教程会直接报
  「未知属性」；
- **依赖名在 Boot 4 变成了 `spring-boot-starter-session-jdbc`**，不再直接引 Spring Session 的
  `spring-session-jdbc`。依赖一加就自动配置，不需要额外的开关。

多实例部署还有两件必须配套的事：

- **负载均衡的会话粘滞**（同一浏览器始终落到同一实例）：不解决共享问题，只是缓解，节点故障时
  会话还是丢；
- **会话超时与清理**：`server.servlet.session.timeout=30m`，数据库存储时还要有定时任务清理过期
  会话，否则表会一直涨。

## 6 会话相关的安全配置

```properties
# 会话 30 分钟无操作过期
server.servlet.session.timeout=30m
# 会话标识只放 Cookie，禁止被 JavaScript 读取（防 XSS 窃取）
server.servlet.session.cookie.http-only=true
# 只在 HTTPS 下发送（本地开发关闭，生产必须开）
server.servlet.session.cookie.secure=true
# 跨站请求不携带（缓解 CSRF）
server.servlet.session.cookie.same-site=lax
# 自定义 Cookie 名，避免暴露技术栈
server.servlet.session.cookie.name=SESSION
```

### 6.1 会话固定攻击

攻击套路是：攻击者先拿到一个会话标识（比如诱导用户访问带 `?jsessionid=...` 的链接），等用户
在这个会话上登录后，攻击者用同一个标识就成了「已登录用户」。

防范手段是**登录成功后更换会话标识，保留会话数据**：

```java
@PostMapping("/login")
public String login(@RequestParam String username,
                    @RequestParam String password,
                    HttpServletRequest request) {
    userService.authenticate(username, password);        // 校验通过
    request.changeSessionId();                           // 换掉标识，数据保留
    request.getSession().setAttribute("loginUser", username);
    return "redirect:/books";
}
```

如果项目用了 Spring Security，这一步它已经替你做了，不需要手写。

### 6.2 登出要作废整个会话

```java
session.invalidate();
```

只 `removeAttribute("loginUser")` 是不够的：会话里其他残留数据、以及那个仍然有效的会话标识都还
在。**登出 = 作废会话**，同时记得清理相关的 Cookie。

## 7 容易踩的坑

| 现象                                     | 原因                                                   | 处理                                                           |
| ---------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| 没登录就访问页面，直接 400               | `@SessionAttribute` 默认 `required = true`，属性不存在 | 加 `required = false`，或用 `session.getAttribute`             |
| 读会话属性报 `ClassCastException`        | `getAttribute` 返回 `Object`，存的类型与取的不一致     | 用 `@SessionAttribute` 让框架做类型转换，存的对象类型保持稳定  |
| 应用重启用户全部掉线                     | 会话默认存在进程内存里                                 | 引入 Spring Session（JDBC / Redis）把会话外置                  |
| 多实例部署下用户时而「掉线」             | 会话不共享                                             | 会话外置 + 负载均衡策略；不要只靠节点粘滞                      |
| 会话数据越来越大，内存上涨               | 往会话里塞了大对象或长列表                             | 只放必要的标识数据，大对象落库                                 |
| 登录后仍能从旧链接以同一会话进入         | 没有更换会话标识，存在会话固定风险                     | 登录成功后 `request.changeSessionId()`（或用 Spring Security） |
| 登出后仍能访问受限页面                   | 只删了某个属性，没有作废会话                           | `session.invalidate()`，并清理 Cookie                          |
| 多步表单第二次打开表单时带着上次的旧数据 | `@SessionAttributes` 没有清空                          | 流程结束调用 `SessionStatus.setComplete()`                     |
| `spring.session.store-type` 报未知属性   | Boot 3 已移除该配置项                                  | 去掉它，改为通过依赖自动配置                                   |
| 本地 HTTP 下会话 Cookie 不生效           | 设了 `cookie.secure=true` 但走的是 HTTP                | 本地开发关闭 `secure`，生产（HTTPS）再打开                     |

## 8 小结

- HTTP 无状态，会话机制靠 **服务端存数据 + 客户端只存标识**；
- 读写会话：`HttpSession` 的 `setAttribute` / `getAttribute` / `removeAttribute` / `invalidate`，
  读取更推荐 `@SessionAttribute(required = false)`；
- 模板里用 `${session.xxx}` 显示，但**权限判断必须在服务端做**；
- 多步流程可以用 `@SessionAttributes` + `SessionStatus.setComplete()`，会话级对象用
  `@Scope("session")`，但两者都比显式的 `HttpSession` 隐晦；
- **会话默认在单个进程内存里**，重启丢、多实例不共享；生产要把会话外置（Spring Session）
  并配好超时与清理；
- 安全三件事：`HttpOnly` / `Secure` / `SameSite` 的 Cookie 属性、登录后
  `changeSessionId()`、登出 `invalidate()`。

会话里存了登录状态，接下来就要回答「怎么在每个请求上检查它」。下一篇讲**拦截器**：比在
每个控制器里写一遍登录判断更合适的做法。
