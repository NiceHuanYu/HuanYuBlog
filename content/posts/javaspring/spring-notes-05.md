---
title: Spring 学习笔记 05：Spring MVC 与 Thymeleaf 入门
description: 一次页面请求在 Spring MVC 里走了哪几步，@Controller 怎么把数据交给模板，@PathVariable 与 @RequestParam 怎么取参数，以及控制器为什么必须是无状态的。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Spring MVC
    - Thymeleaf
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 5
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档与 Thymeleaf 官方文档。理解有偏差的地方欢迎指出。

## 0 从「返回 JSON」到「返回页面」

前面几篇的 `@RestController` 直接把对象序列化成 JSON 交给客户端。但很多场景要的是**服务端
渲染出 HTML**：浏览器拿到的是完整页面，搜索引擎能读懂，也不用把数据结构和渲染逻辑都塞进
前端。

Spring MVC 就是干这件事的。它把一次请求拆成三块职责：

| 角色       | 职责                               | 你写的东西                  |
| ---------- | ---------------------------------- | --------------------------- |
| Model      | 应用状态与数据                     | 往 `Model` 里放的对象       |
| View       | 把数据渲染成响应（这里是 HTML）    | Thymeleaf 模板              |
| Controller | 接收请求、调用业务、决定下一步去哪 | 一个带 `@GetMapping` 的方法 |

除了这三块，还有一个你不写、但每次请求都会经过的角色：**前端控制器**。

## 1 一次请求的完整流程

![Spring MVC 请求处理流程：浏览器请求经 DispatcherServlet 分发到处理方法，再由 ViewResolver 与 Thymeleaf 渲染成 HTML 返回](/images/spring-notes-05-mvc-flow.svg)

对照这张图，把每一步落到代码上：

1. **浏览器发起请求**到 `/books`；
2. **`DispatcherServlet` 接住**。它是前端控制器，被自动配置注册并映射到 `/`，是唯一需要
   对外暴露的 Servlet；
3. **`HandlerMapping` 找出该谁处理**：扫描所有带 `@RequestMapping` 的方案，按 URL、请求方法、
   参数条件匹配，得到一个「处理方法 + 拦截器链」；
4. **处理你的方法**：框架先解析方法参数（`@PathVariable`、`@RequestParam`、`Model` 等），
   再执行方法体，最后拿到返回值——这里是视图名 `books/list`；
5. **`ViewResolver` 把视图名翻译成模板**：Thymeleaf 的默认前缀是 `classpath:/templates/`、
   后缀是 `.html`，所以 `books/list` → `templates/books/list.html`；
6. **渲染**：Thymeleaf 处理模板里的 `th:*` 属性，把 `${...}` 换成真实数据，输出 HTML；
7. **响应写回**客户端。

整条链路里你只写第 4 步。**理解这条链路的价值在于判断问题出在哪一环**：404 通常是第 3 步
（映射没匹配上），500 报模板解析失败是第 5 步，页面里数据是空的则多半是第 4 步没往 `Model`
里放东西。

## 2 依赖与目录约定

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

这个 starter 已经包含 Spring MVC，不用再单独引 `spring-boot-starter-webmvc`（Boot 3 里叫
`spring-boot-starter-web`）。目录约定是固定的：

```
src/main/resources/
├── templates/          ← Thymeleaf 模板（默认前缀）
│   └── books/
│       ├── list.html
│       └── detail.html
├── static/             ← 静态资源：css、js、图片，按原路径直接访问
│   └── css/site.css
└── application.properties
```

`templates/` 下的文件**不能**通过 URL 直接访问，必须经过控制器；`static/` 下的文件正好相反，
`static/css/site.css` 对应 `/css/site.css`。

## 3 第一个页面：@Controller

页面型控制器返回**视图名**，不返回数据：

```java
package com.example.library.web;

import com.example.library.service.BookService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/books")
public class BookViewController {

    private final BookService bookService;

    public BookViewController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public String list(@RequestParam(name = "keyword", required = false) String keyword,
                       @RequestParam(defaultValue = "0") int page,
                       Model model) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), 10, Sort.by("title").ascending());
        model.addAttribute("page", bookService.search(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "books/list";        // → templates/books/list.html
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        model.addAttribute("book", bookService.findById(id));
        return "books/detail";
    }
}
```

这里用到的 `bookService.search(keyword, pageable)` 是 03 篇加到 `BookService` 接口里的方法
（`Page<Book> search(String keyword, Pageable pageable)` 的实现：关键词为空就查全部，有值就按
书名模糊匹配，排序由 `Pageable` 决定）。

和 `@RestController` 的差别只有一处：**`@Controller` 的返回值被当作视图名**。`@RestController`
等价于 `@Controller` + `@ResponseBody`，注解在类上时，所有方法的返回值都直接写进响应体，
跳过视图解析。

两者可以混着用：类上写 `@Controller`，某个方法上单独加 `@ResponseBody`。

## 4 模板：Thymeleaf 的第一批语法

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="zh">
<head>
    <meta charset="UTF-8">
    <title>图书列表</title>
    <link rel="stylesheet" th:href="@{/css/site.css}">
</head>
<body>
<h1>图书列表</h1>

<form th:action="@{/books}" method="get">
    <input type="text" name="keyword" th:value="${keyword}" placeholder="按书名搜索">
    <button type="submit">搜索</button>
</form>

<table>
    <thead>
    <tr>
        <th>#</th>
        <th>书名</th>
        <th>作者</th>
        <th>分类</th>
        <th>状态</th>
    </tr>
    </thead>
    <tbody>
    <tr th:each="book, stat : ${page.content}">
        <td th:text="${stat.count}">1</td>
        <td>
            <a th:href="@{/books/{id}(id=${book.id})}" th:text="${book.title}">重构</a>
        </td>
        <td th:text="${book.author}">Martin Fowler</td>
        <td th:text="${book.category != null} ? ${book.category.name} : '—'">技术</td>
        <td th:text="${book.status.label}">可借</td>
    </tr>
    <tr th:if="${page.totalElements == 0}">
        <td colspan="5">暂无图书</td>
    </tr>
    </tbody>
</table>

<div th:if="${page.totalPages > 1}">
    <a th:if="${page.hasPrevious()}"
       th:href="@{/books(page=${page.number - 1}, keyword=${keyword})}">上一页</a>
    <span th:text="|${page.number + 1} / ${page.totalPages}|">1 / 3</span>
    <a th:if="${page.hasNext()}"
       th:href="@{/books(page=${page.number + 1}, keyword=${keyword})}">下一页</a>
</div>
</body>
</html>
```

这里把 `Page` 对象整体传给了模板（键名 `page`），模板里用 `page.content` 拿当前页数据。
`page.status.label` 用的是 `BookStatus` 枚举自带的 `getLabel()`（02 篇定义的那个）。

要点：

- **`xmlns:th="http://www.thymeleaf.org"` 要写在 `<html>` 上**，否则编辑器不认 `th:*` 属性
  （不影响运行，只是 IDE 提示会变红）；
- **标签里保留一份示例文本**（`重构`、`1`）。Thymeleaf 的主张是「自然模板」：模板本身就是合法
  HTML，直接用浏览器打开也能看到一个像样的静态页面，方便前端先做样式；
- `th:text` 默认对内容做 HTML 转义，能防住用户输入里的脚本——**不要图省事改用 `th:utext`**，
  那是直接输出原始 HTML；
- `th:each="book, stat : ${books}"` 的第二个变量是状态对象，常用 `stat.index`（从 0 开始）、
  `stat.count`（从 1 开始）、`stat.first` / `stat.last`；
- `@{...}` 是链接表达式，**写 URL 一律用它**，不要手写字符串拼接：`@{/books/{id}(id=${book.id})}`
  会自动带上应用上下文路径；
- `#lists`、`#strings`、`#numbers` 这些是 Thymeleaf 内置的工具对象。

常用语法先记这几个就够撑起一个列表页：

| 写法                              | 作用                     |
| --------------------------------- | ------------------------ |
| `th:text="${...}"`                | 输出文本（转义）         |
| `th:each="item : ${items}"`       | 循环                     |
| `th:if` / `th:unless`             | 条件渲染                 |
| `th:href="@{...}"`                | 链接地址                 |
| `th:classappend="${cond} ? 'on'"` | 按条件追加 class         |
| `${...}` / `#{...}` / `@{...}`    | 变量 / 国际化消息 / 链接 |

后面第 06 篇讲表单绑定，第 07 篇讲片段复用与国际化。

## 5 从请求里取参数

### 5.1 @PathVariable：参数是路径的一部分

```java
@GetMapping("/{id}")
public String detail(@PathVariable Long id, Model model) {
    model.addAttribute("book", bookService.findById(id));
    return "books/detail";
}
```

`/books/42` → `id = 42`，并且**自动做了类型转换**：路径里的字符串 `42` 转成 `Long`，转不动会
直接返回 400，不会变成 `null` 传进方法。

规则是**占位符名要和参数名一致**；不一致时必须显式指定 `@PathVariable("id") Long bookId`。

### 5.2 @RequestParam：参数在查询串或表单里

```java
@GetMapping("/search")
public String search(@RequestParam(name = "keyword", required = false) String keyword,
                     @RequestParam(defaultValue = "0") int page,
                     Model model) {
    model.addAttribute("keyword", keyword);
    model.addAttribute("books", bookService.search(keyword, page));
    return "books/list";
}
```

- 默认 `required = true`，**参数缺失会返回 400**。查询条件这类可有可无的参数要写
  `required = false` 或用 `defaultValue`；
- 基本类型（`int`）没有 `null`，缺参数时又没给默认值会直接报错——**基本类型参数一定要配
  `defaultValue`**，或者用包装类型 `Integer`；
- 想让整个表单对象一次绑定进来（而不是逐个参数取），用对象参数，见第 06 篇。

### 5.3 分页参数可以自动装配

```java
@GetMapping
public String list(Pageable pageable, Model model) {
    model.addAttribute("page", bookService.findAll(pageable));
    return "books/list";
}
```

框架会把 `?page=1&size=10&sort=title,desc` 组装成 `Pageable`。**但要注意两点**：

- 请求参数**直接控制了排序字段**，生产环境要在配置里限制允许排序的字段，否则可能被拼成按
  大字段排序的慢查询；
- 需要 `spring.data.web.pageable.*` 一组配置项来约束默认值和上限。

## 6 控制器返回值：决定请求去哪

| 返回值                       | 行为                                         |
| ---------------------------- | -------------------------------------------- |
| `"books/list"`               | 走 ViewResolver，渲染模板                    |
| `"redirect:/books"`          | 302 重定向，浏览器会再发一次请求，地址栏会变 |
| `"forward:/books/1"`         | 服务端内部转发，地址栏不变，**同一个请求**   |
| `ModelAndView`               | 视图名和数据一起返回                         |
| 对象（配合 `@ResponseBody`） | 直接序列化成 JSON/XML                        |

### 6.1 重定向 vs 转发

| 对比项             | `redirect:`                         | `forward:`                   |
| ------------------ | ----------------------------------- | ---------------------------- |
| 发生位置           | 浏览器                              | 服务器内部                   |
| 请求次数           | 2 次（地址栏会变）                  | 1 次（地址栏不变）           |
| 能否共享请求域数据 | 不能，要靠 Flash 属性或查询参数     | 可以                         |
| 典型用途           | 表单提交后跳转（Post-Redirect-Get） | 内部把请求交给另一个处理方法 |

**表单提交成功后一定要用 `redirect:`**（PRG 模式）：如果直接渲染页面，用户按 F5 会把表单再提交
一次，重复下单、重复扣库存这类事故就是这么来的。

重定向后要传一次性提示信息，用 `RedirectAttributes`：

```java
@PostMapping
public String create(@Valid @ModelAttribute("form") BookForm form,
                     BindingResult bindingResult,
                     RedirectAttributes redirectAttributes) {
    if (bindingResult.hasErrors()) {
        return "books/form";
    }
    bookService.create(form);
    redirectAttributes.addFlashAttribute("message", "新增成功");
    return "redirect:/books";
}
```

`addFlashAttribute` 把数据暂存到会话里，**只在下一次请求有效**，重定向后的页面读到就删掉。

## 7 控制器为什么必须是无状态的

Spring 容器里 Bean 默认是**单例**：整个应用只有一个控制器实例，所有请求共用它。所以下面这种
写法是危险的：

```java
@Controller
public class BadController {

    private List<Book> books;    // 会被多个请求同时读写

    @GetMapping("/books")
    public String list() {
        this.books = bookService.findAll();   // 并发下互相覆盖
        return "books/list";
    }
}
```

单例不是缺陷，是**为了省掉每个请求创建一个对象**。要守住一条规则：**控制器不保存请求相关的
状态**。每个请求的数据放在方法参数（`Model`、`@RequestParam`、`@ModelAttribute`）里，
方法内部用完即弃，这样单例就是安全的。

如果确实需要按请求存在的对象（比如一次表单流程的状态），才考虑 `@Scope("request")`，但绝大多数
情况有更好的做法（会话或数据库）。

## 8 开发期两个方便的设置

```properties
# 模板改动后立即生效，不用重启
spring.thymeleaf.cache=false
# 打开 MVC 的详细日志，排查 404 有用
logging.level.org.springframework.web=DEBUG
```

**`spring.thymeleaf.cache=false` 只在开发用**。生产上要开着缓存，否则每次请求都重新解析模板。

## 9 容易踩的坑

| 现象                                             | 原因                                                              | 处理                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------- |
| 访问返回 404，日志显示没有匹配的 handler         | 类上的 `@RequestMapping` 与方法上的路径拼起来不对，或方法不是 GET | 核对完整路径和 `@GetMapping`；打开 web 的 DEBUG 日志 |
| 报「找不到模板」，`TemplateInputException`       | 视图名与文件路径不匹配，或文件放到了 `static/` 下                 | 视图名 `books/list` 对应 `templates/books/list.html` |
| 页面里 `${book}` 渲染成空                        | 忘了 `model.addAttribute(...)`，或键名不一致                      | 键名与模板里的 `${...}` 逐字对齐                     |
| 模板里改的东西刷新没变化                         | 模板缓存还开着                                                    | 开发期设 `spring.thymeleaf.cache=false`              |
| 表单提交后按 F5 又提交一次                       | 直接返回视图名，没有走重定向                                      | 提交成功后 `redirect:`（PRG 模式）                   |
| `@RequestParam int page` 缺参数时 400            | 基本类型没有 `null`，且没给默认值                                 | 写 `defaultValue` 或改成 `Integer`                   |
| 模板里出现 `??book.title??`                      | 键名写错或被拼错（`${..}` 里名字不对）                            | 对照 `Model` 里的键名检查                            |
| 直接访问 `/templates/books/list.html` 拿不到页面 | `templates/` 不是静态资源目录                                     | 模板必须经控制器返回；能直接访问的只有 `static/`     |
| 用户输入的 HTML 被当成标签执行                   | 用了 `th:utext`                                                   | 默认用 `th:text`，除非内容是你自己彻底信任的富文本   |
| 单例控制器里存了请求数据，偶发串数据             | 控制器有可变字段                                                  | 请求数据只放方法参数里                               |

## 10 小结

- 一次请求的链路是 **DispatcherServlet → HandlerMapping → 你的方法 → ViewResolver →
  模板渲染 → 响应**，你只负责中间那一步；
- `@Controller` 返回视图名，`@RestController` = `@Controller` + `@ResponseBody`；
- 模板放在 `templates/`，静态资源放在 `static/`；
- 参数三条路：**路径上的用 `@PathVariable`，查询串里的用 `@RequestParam`，表单对象用对象参数**；
- 表单提交成功后用 **`redirect:`（PRG）**，一次性提示用 `RedirectAttributes.addFlashAttribute`；
- **控制器是无状态单例**，请求数据只放方法参数里。

下一篇专门讲表单那半条链路：怎么把表单字段绑到对象上、怎么在服务端校验并把错误信息显示回
用户刚才填的那一页。
