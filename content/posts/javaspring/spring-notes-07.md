---
title: Spring 学习笔记 07：Thymeleaf 片段复用与国际化
description: 用 th:fragment 与 th:insert/th:replace 把导航栏、页脚抽成片段，页面套用统一布局，再用 messages.properties 与 LocaleResolver 做中英文切换。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Thymeleaf
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 7
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Thymeleaf 官方文档与 Spring 官方文档。理解有偏差的地方欢迎指出。

## 0 从「每个页面抄一份导航栏」说起

页面一多，公共部分的复制粘贴就开始反咬：

- 改一行导航栏，要翻所有模板文件；
- 某个页面的页脚忘了改，样式在页面之间不一致；
- 想加一种语言，页面文字全都硬编码在 HTML 里，没有下手的地方。

Thymeleaf 对此给了两件事：**片段（fragment）** 解决复用，**消息表达式**解决文案与语言的分离。

## 1 定义与使用片段

把公共部分抽到一个单独的文件里：

```html
<!-- templates/fragments/layout.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="zh">
<head th:fragment="head(title)">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title th:text="${title}">图书借阅</title>
    <link rel="stylesheet" th:href="@{/css/site.css}">
</head>
<body>

<header th:fragment="header">
    <nav>
        <a th:href="@{/books}" th:text="#{nav.books}">图书</a>
        <a th:href="@{/categories}" th:text="#{nav.categories}">分类</a>
        <a th:href="@{/books/new}" th:text="#{nav.newBook}">新增图书</a>
    </nav>
</header>

<footer th:fragment="footer">
    <p th:text="#{app.footer}">个人学习项目</p>
</footer>

</body>
</html>
```

页面里引用它：

```html
<!-- templates/books/list.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="zh">
<head th:replace="~{fragments/layout :: head('图书列表')}"></head>
<body>

<header th:replace="~{fragments/layout :: header}"></header>

<main>
    <h1 th:text="#{book.list.title}">图书列表</h1>
    <!-- 列表内容见第 05 篇 -->
</main>

<footer th:replace="~{fragments/layout :: footer}"></footer>

</body>
</html>
```

片段表达式的写法是 `~{模板路径 :: 片段名}`，参数写在片段名后面：

- `~{fragments/layout :: head('图书列表')}`：带一个参数调用 `head`；
- `~{fragments/layout :: header}`：无参数；
- `~{this :: footer}`：引用**当前文件**里的片段；
- 片段名也可以不是 `th:fragment`，而是任意选择器：`~{:: #main-content}`、`~{:: .card}`。

`th:fragment="head(title)"` 的括号里声明参数，片段内部用 `${title}` 取——**和调用方传参的名字
必须一致**，这是最常见的报错来源（Thymeleaf 会说找不到变量，但不会直接说「参数名写错」）。

## 2 三种插入方式

| 属性         | 行为                                       | 结果                                 |
| ------------ | ------------------------------------------ | ------------------------------------ |
| `th:insert`  | 把片段**插入**宿主标签内部                 | 宿主标签保留，片段成为它的子元素     |
| `th:replace` | 用片段**替换**整个宿主标签                 | 宿主标签消失，片段原样出现在那个位置 |
| `th:include` | 插入片段内容但不含片段根标签（**已废弃**） | Thymeleaf 3.1 起移除了 `th:include`  |

**`th:include` 在 Thymeleaf 3.1 里已经被移除**（Spring Boot 3 用的就是 3.1），旧的教程里还在用
它，照抄会报错。它的作用可以用带选择器的 `th:insert` 达到。

`th:insert` 和 `th:replace` 怎么选，看宿主标签有没有用处：

- 写成 `<div th:insert="~{fragments/layout :: header}"></div>`，外面会多一层没用的 `<div>`；
- 写成 `<header th:replace="~{fragments/layout :: header}"></header>`，片段自己的 `<header>` 会
  出现在原处，结构干净。

所以**通常用 `th:replace`**。

## 3 页面级布局：把「内容」插进骨架

上面的写法让每个页面自己拼 `<head>`、`<header>`、`<footer>`，页数多了也是重复。更省事的做法是
反过来：**由布局片段留出内容占位，页面只提供内容**。

```html
<!-- templates/fragments/layout.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="zh">
<head th:fragment="page(title, content)">
    <meta charset="UTF-8">
    <title th:text="${title}">图书借阅</title>
    <link rel="stylesheet" th:href="@{/css/site.css}">
</head>
<body>
<header th:replace="~{fragments/layout :: header}"></header>

<main th:replace="${content}">
    <p>这里会被页面自己的内容替换</p>
</main>

<footer th:replace="~{fragments/layout :: footer}"></footer>
</body>
</html>
```

页面变成这样：

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="zh">
<head th:replace="~{fragments/layout :: page(#{book.list.title}, ~{:: #content})}"></head>
<body>
<div id="content">
    <h1 th:text="#{book.list.title}">图书列表</h1>
    <!-- 页面内容 -->
</div>
</body>
</html>
```

两个要点：

- 传给布局的内容参数本身是一个**片段表达式**：`~{:: #content}` 表示「当前文件里 id 为 content
  的那一段」；
- 布局里用 `th:replace="${content}"` 把它放进来。`${...}` 求值得到的就是片段对象。

这套写法不用引入额外依赖。生态里还有个 Thymeleaf Layout Dialect（提供 `layout:decorate`），
写法更接近「继承模板」，但要额外加依赖，属于项目级选择，这里不展开。

## 4 国际化的两条线

### 4.1 消息文件

在 `src/main/resources/` 下按「基名 + 语言」命名：

```properties
# messages.properties —— 默认（找不到具体语言时用它）
nav.books=图书
nav.categories=分类
nav.newBook=新增图书
book.list.title=图书列表
app.footer=个人学习项目
welcome=欢迎，{0}！
```

```properties
# messages_en.properties
nav.books=Books
nav.categories=Categories
nav.newBook=New Book
book.list.title=Book List
app.footer=A personal learning project
welcome=Welcome, {0}!
```

配置：

```properties
spring.messages.basename=messages
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
```

`fallback-to-system-locale=false` 这一句值得单独说：默认情况下，找不到匹配语言时会退回**系统
区域**，于是同一份代码在开发机上跑出中文、在服务器上跑出英文。关掉它，退回行为就只由
`messages.properties` 决定，可预期得多。

### 4.2 模板里用消息

| 写法                                 | 说明                           |
| ------------------------------------ | ------------------------------ |
| `th:text="#{book.list.title}"`       | 简单取一条消息                 |
| `th:text="#{welcome(${user.name})}"` | 带参数，`{0}` 依次被替换       |
| `${#messages.msg('some.key')}`       | 在表达式里取消息（很少直接用） |

页面标题、按钮文字、提示语都走消息键，页面上就不该再出现硬编码的文案。**键名建议按模块
前缀**（`nav.*`、`book.*`、`error.*`），文件变大后还能找得到。

### 4.3 语言是怎么被选中的

Spring 用 `LocaleResolver` 决定每次请求用哪个 Locale。默认实现看 **`Accept-Language` 请求头**，
也就是浏览器语言设置——所以只要你把 `messages_en.properties` 放好，英文浏览器访问就自动是英文。

想在页面上手动切换（`?lang=en`），加一个拦截器和解析器：

```java
package com.example.library.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import java.util.Locale;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public LocaleResolver localeResolver() {
        WhitelistLocaleResolver resolver = new WhitelistLocaleResolver();   // 见下
        resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
        return resolver;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        registry.addInterceptor(interceptor).addPathPatterns("/**");
    }
}
```

`SessionLocaleResolver` 把语言记在会话里，`LocaleChangeInterceptor` 负责在每次请求里读 `?lang=`。
不想依赖会话也可以换成 `CookieLocaleResolver`。（工程里这个配置类还注册了第 09 篇的三个拦截器，
完整版本在那一篇。）

**这里有个安全细节**：`LocaleChangeInterceptor` 会把请求参数直接转成 `Locale` 对象，而 Locale
是消息文件的查找键之一。不加限制的话，攻击者可以不断换 `?lang=` 的值，让每一次请求都触发一轮
失败的消息查找——这是已知的一类资源耗尽问题。**生产环境必须加白名单**。

最省事的做法是继承 `SessionLocaleResolver`，覆写 `setLocale` 做校验（拦截器正是通过
`setLocale` 把解析出的语言交给解析器的）：

```java
package com.example.library.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import java.util.Locale;
import java.util.Set;

public class WhitelistLocaleResolver extends SessionLocaleResolver {

    private static final Set<String> ALLOWED_LANGUAGES = Set.of("zh", "en");

    @Override
    public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
        if (locale == null || !ALLOWED_LANGUAGES.contains(locale.getLanguage())) {
            return;   // 不在白名单里就忽略，保持当前语言
        }
        super.setLocale(request, response, locale);
    }
}
```

然后把 `WebConfig` 里的解析器换成它：

```java
@Bean
public LocaleResolver localeResolver() {
    WhitelistLocaleResolver resolver = new WhitelistLocaleResolver();
    resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
    return resolver;
}
```

## 5 顺手记住几个工具对象

| 对象         | 常用方法                                             | 用在                       |
| ------------ | ---------------------------------------------------- | -------------------------- |
| `#strings`   | `isEmpty`、`toUpperCase`、`abbreviate`、`startsWith` | 字符串处理                 |
| `#numbers`   | `formatDecimal(value, '0.00')`                       | 金额、比率格式化           |
| `#temporals` | `format(ldt, 'yyyy-MM-dd HH:mm')`                    | `java.time` 类型日期格式化 |
| `#dates`     | `format(date, ...)`                                  | 老式 `java.util.Date`      |
| `#lists`     | `isEmpty`、`size`、`contains`                        | 集合判断                   |
| `#fields`    | `hasErrors`、`errors`、`globalErrors`                | 表单错误（见第 06 篇）     |
| `#ids`       | `next('id')`、`seq('id')`                            | 循环里生成唯一 id          |

日期格式化的对象别用错：**`java.time` 系列（`LocalDate`、`LocalDateTime`）用 `#temporals`**，
用 `#dates` 会报错——这是从老项目迁移过来时最常撞的一下。

## 6 容易踩的坑

| 现象                                                  | 原因                                                    | 处理                                                    |
| ----------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| 报 `TemplateInputException: Error resolving fragment` | 片段路径或片段名写错，或漏了 `~{}`                      | 对照 `模板路径 :: 片段名` 逐字检查                      |
| 片段里 `${title}` 取不到值                            | 调用时参数名与 `th:fragment` 声明的名字不一致           | 两边名字严格一致                                        |
| 用 `th:include` 直接报错                              | Thymeleaf 3.1 已移除该属性                              | 改用 `th:insert` / `th:replace`                         |
| 页面里多出一层没用的 `<div>`                          | 用了 `th:insert` 而宿主标签是包装用的 div               | 换 `th:replace`，或把内容直接写在宿主标签里             |
| 片段改动后页面没变化                                  | 模板缓存                                                | 开发期 `spring.thymeleaf.cache=false`                   |
| 消息显示成 `??book.list.title_zh_CN??`                | 键不存在，或消息文件不在 `messages.basename` 覆盖范围内 | 核对键名与文件名；中文 properties 用 UTF-8 保存         |
| 中文消息变乱码                                        | properties 文件编码不是 UTF-8                           | 文件保存为 UTF-8，并设 `spring.messages.encoding=UTF-8` |
| 服务器上语言和本地不一致                              | 回退到了系统区域                                        | `spring.messages.fallback-to-system-locale=false`       |
| `?lang=en` 没反应                                     | 没注册 `LocaleChangeInterceptor`，或参数名不是 `lang`   | 注册拦截器并统一参数名                                  |
| 日志里大量 Locale 解析失败                            | 语言参数没有白名单限制                                  | 限制允许的语言列表（见第 4.3 节）                       |

## 7 小结

- 公共部分抽成 **`th:fragment`**，用 **`~{模板 :: 片段(参数)}`** 引用；
- **`th:replace` 用得最多**，`th:include` 在 Thymeleaf 3.1 已移除；
- 页面级布局可以**传片段表达式**（`~{:: #content}`）给布局留出内容位；
- 文案一律走 **`#{key}` + `messages*.properties`**，键名按模块加前缀；
- `spring.messages.fallback-to-system-locale=false` 让语言行为可预期；
- 手动切语言用 `LocaleResolver` + `LocaleChangeInterceptor`，**务必限制允许的语言**；
- 日期格式化区分 `#temporals`（`java.time`）与 `#dates`（旧 API）。

页面能看了，但只要涉及「登录状态」这类跨请求的数据，就绕不开会话。下一篇讲 **HTTP Session**
在 Spring 里的用法，以及哪些东西不该放进会话。
