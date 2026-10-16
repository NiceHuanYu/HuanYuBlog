---
title: Spring 学习笔记 09：拦截器 HandlerInterceptor
description: 登录检查、权限判断、请求耗时统计这类横切逻辑该放哪：HandlerInterceptor 的三个回调各在什么时机执行，怎么注册与排除路径，以及它和过滤器的分工。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - Spring MVC
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 9
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档。理解有偏差的地方欢迎指出。

## 0 每个控制器都抄一遍的检查

登录之后，很多页面要「只有登录用户能看」。最笨的做法是在每个方法开头写：

```java
@GetMapping("/{id}")
public String detail(@PathVariable Long id, @SessionAttribute(name = "loginUser", required = false) User user,
                     Model model) {
    if (user == null) {
        return "redirect:/account/login";
    }
    // ...
}
```

两个问题：**重复**（几十个方法都要抄）、**容易漏**（新加一个接口忘了加判断，就是一个漏洞）。
这类「和业务无关、但每个请求都要做」的逻辑，需要一个集中入口。

Spring MVC 给的入口是 **`HandlerInterceptor`**。

## 1 拦截器与过滤器的分工

先在概念上分清两个容易混的东西：

| 对比项           | 拦截器 `HandlerInterceptor`            | 过滤器 `Filter`                  |
| ---------------- | -------------------------------------- | -------------------------------- |
| 归属             | Spring MVC 的组件                      | Servlet 容器的组件               |
| 作用范围         | **只作用于交给 Controller 的请求**     | 所有经过容器的请求（含静态资源） |
| 能拿到的东西     | 处理方法、注解、`ModelAndView`         | 只有原始请求与响应               |
| 是否 Spring Bean | 是，可以注入其他 Bean                  | 注册为 Bean 时可以，否则不能     |
| 典型用途         | 登录校验、权限、埋点、给视图塞公共数据 | 字符编码、CORS、请求体日志、压缩 |

判断标准很简单：**需要知道「哪个处理方法」的信息，用拦截器；只想在 Servlet 层做点事，用过滤器。**

## 2 三个回调，三种时机

![拦截器执行顺序：preHandle 按注册顺序执行，Controller 之后 postHandle 逆序执行，视图渲染完成后 afterCompletion 再逆序执行](/images/spring-notes-09-interceptor-flow.svg)

```java
public interface HandlerInterceptor {

    default boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception { return true; }

    default void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
                            ModelAndView modelAndView) throws Exception { }

    default void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                 Exception ex) throws Exception { }
}
```

| 回调              | 时机                                 | 能做什么                                              |
| ----------------- | ------------------------------------ | ----------------------------------------------------- |
| `preHandle`       | 交给 Controller **之前**             | 校验、拦截、放数据到请求属性；**返回 `false` 即中断** |
| `postHandle`      | Controller 返回后、**视图渲染之前**  | 往 `ModelAndView` 里加公共数据                        |
| `afterCompletion` | **视图渲染之后**（无论成功还是异常） | 记录耗时、清理资源；异常会通过 `ex` 传进来            |

两个必须记住的性质：

- **顺序不对称**：`preHandle` 按注册顺序执行（A → B → C），`postHandle` 与 `afterCompletion`
  按相反顺序执行（C → B → A）。原因是它们构成「进栈、出栈」的结构，最先进入的最晚收尾；
- **中断规则**：某个 `preHandle` 返回 `false`，后面的拦截器与控制器都不会执行，但**已经返回过
  `true` 的拦截器的 `afterCompletion` 仍会被调用**。所以清理逻辑放 `afterCompletion` 里最安全。

## 3 实战一：登录拦截

```java
package com.example.library.web.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {

        // 静态资源等非控制器请求走的是别的 Handler，直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HttpSession session = request.getSession(false);   // 不要创建新会话
        if (session != null && session.getAttribute("loginUser") != null) {
            return true;
        }

        response.sendRedirect(request.getContextPath() + "/account/login");
        return false;    // 中断请求，别往下走
    }
}
```

三个细节都能决定这个拦截器是否可用：

1. **`handler instanceof HandlerMethod` 的判断**：静态资源的请求交给的不是控制器方法，没有这层
   判断时，拦截器会把图片、样式也一起拦下来重定向——页面会莫名样式全丢；
2. **`request.getSession(false)`**：`getSession()` 在没有会话时会**创建一个新的**，等于给每个
   匿名访问者都建会话，白白占内存；
3. **`response.sendRedirect(...)` 之后必须 `return false`**。忘了返回，请求会继续走到控制器，
   重定向之后又渲染了一遍页面，行为完全错乱。

## 4 实战二：请求耗时统计

```java
package com.example.library.web.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TimingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(TimingInterceptor.class);
    private static final String START = TimingInterceptor.class.getName() + ".start";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START, System.nanoTime());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        Object start = request.getAttribute(START);
        if (start != null) {
            // 注意：Object 不能直接强转成基本类型，要先转成 Long 再自动拆箱；
            // 写成 (long) start 是编译不过的
            long costMillis = (System.nanoTime() - (Long) start) / 1_000_000;
            log.info("{} {} 状态 {} 耗时 {} ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), costMillis);
        }
    }
}
```

放在 `afterCompletion` 里而不是 `postHandle` 里，是因为**渲染模板的时间也要算进去**——只统计
控制器耗时会低估响应时间。

## 5 注册拦截器

拦截器只标 `@Component` **不会生效**，必须在 `WebMvcConfigurer` 里注册，并指定路径模式：

```java
package com.example.library.config;

import com.example.library.web.interceptor.AdminInterceptor;
import com.example.library.web.interceptor.LoginInterceptor;
import com.example.library.web.interceptor.TimingInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.util.Locale;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;
    private final AdminInterceptor adminInterceptor;
    private final TimingInterceptor timingInterceptor;

    public WebConfig(LoginInterceptor loginInterceptor,
                     AdminInterceptor adminInterceptor,
                     TimingInterceptor timingInterceptor) {
        this.loginInterceptor = loginInterceptor;
        this.adminInterceptor = adminInterceptor;
        this.timingInterceptor = timingInterceptor;
    }

    /** 语言解析器（第 07 篇的 WhitelistLocaleResolver） */
    @Bean
    public LocaleResolver localeResolver() {
        WhitelistLocaleResolver resolver = new WhitelistLocaleResolver();
        resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
        return resolver;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 先注册的先执行
        registry.addInterceptor(timingInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/css/**", "/js/**", "/images/**", "/error", "/h2-console/**");

        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/account/**", "/api/**", "/error", "/h2-console/**");

        // 权限拦截器只对带 @RequireAdmin 的方法生效，所以路径不用排除
        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/**");

        // 支持 ?lang=en 切换语言（第 07 篇）
        LocaleChangeInterceptor localeChangeInterceptor = new LocaleChangeInterceptor();
        localeChangeInterceptor.setParamName("lang");
        registry.addInterceptor(localeChangeInterceptor).addPathPatterns("/**");
    }
}
```

**注册顺序就是执行顺序**，这一点在多个拦截器有依赖关系时必须留意（比如「记录操作日志」要依赖
「已经解析出当前用户」）。

路径模式的坑：

- 模式是 Ant 风格：`/books/*` 只匹配一级（`/books/1`），`/books/**` 匹配多级
  （`/books/1/chapters`）；
- **模式是从应用路径之后开始匹配的**，不含 context path；
- `excludePathPatterns` 的优先级高于 `addPathPatterns`，排除写全了比写包含更保险；
- **排除静态资源路径后，还需要 `handler` 类型判断**兜底：`/error` 这类内部跳转、以及一些没被
  路径模式覆盖的资源请求，仍可能走进拦截器。

## 6 拦截器与控制器之间传数据

`preHandle` 里查到的数据放在**请求属性**里，控制器用 `@RequestAttribute` 取：

```java
// preHandle 中
request.setAttribute("currentUser", user);

// 控制器中
@GetMapping
public String list(@RequestAttribute("currentUser") User user, Model model) {
    model.addAttribute("user", user);
    return "books/list";
}
```

注意区别：**请求属性（`request.setAttribute`）只在本次请求内有效**，会话属性（`session.setAttribute`）
跨请求存在。拦截器里放临时数据用请求属性，别往会话里塞。

## 7 用注解驱动拦截逻辑

拦截器能拿到 `HandlerMethod`，因此可以读取方法上的注解，把「哪些接口要检查什么」交给注解声明：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAdmin {
}
```

```java
package com.example.library.web.interceptor;

import com.example.library.domain.User;
import com.example.library.web.RequireAdmin;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {

        if (handler instanceof HandlerMethod method
                && method.getMethodAnnotation(RequireAdmin.class) != null
                && !isAdmin(request)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }
        return true;
    }

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object loginUser = session == null ? null : session.getAttribute("loginUser");
        return loginUser instanceof User user && user.isAdmin();
    }
}
```

注册时不用排除任何路径：没标 `@RequireAdmin` 的方法会被直接放行（见第 5 节的 `WebConfig`）。

```java
@RequireAdmin
@PostMapping("/{id}/delete")
public String delete(@PathVariable Long id) {
    // ...
}
```

这套「注解 + 拦截器」的组合比在拦截器里硬编码路径列表更好维护：**规则写在方法自己身上**，
新增接口时不容易漏。这也是很多框架（包括 Spring Security 的方法级注解）的思路。

## 8 什么时候改用过滤器

过滤器的场景更贴近 Servlet 层：

```java
package com.example.library.web.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long costMillis = (System.nanoTime() - start) / 1_000_000;
            log.info("{} {} 耗时 {} ms", request.getMethod(), request.getRequestURI(), costMillis);
        }
    }
}
```

常见的过滤器需求：

- **字符编码**（Boot 已经配好 `CharacterEncodingFilter`，一般不用自己写）；
- **CORS 预检**（虽有 `WebMvcConfigurer#addCorsMappings`，但跨服务场景常用过滤器）；
- **请求体/响应体日志**（需要包装 `HttpServletRequest`，这是过滤器才方便做的事）；
- **响应压缩、安全响应头**（如 Content-Security-Policy）。

**`OncePerRequestFilter` 是首选基类**：它保证一次请求只执行一次（转发、`include` 时不会重复进入），
手写 `Filter` 很容易在这里出错。

## 9 容易踩的坑

| 现象                                      | 原因                                                | 处理                                                                     |
| ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| 拦截器完全不生效                          | 只标了 `@Component`，没在 `WebMvcConfigurer` 里注册 | 实现 `addInterceptors` 并注册                                            |
| 页面样式和图片全丢，被重定向到登录页      | 拦截器把静态资源请求也拦了                          | `excludePathPatterns` 排除，并用 `handler instanceof HandlerMethod` 兜底 |
| 重定向后页面又渲染了一遍，或响应内容错乱  | `preHandle` 里重定向了但没 `return false`           | 拦截并处理完必须 `return false`                                          |
| 匿名访问也创建了一堆会话                  | 用了 `request.getSession()`                         | 只读场景用 `getSession(false)`                                           |
| 拦截器里注入的 Bean 是 `null`             | 用 `new` 手动创建拦截器，没交给容器                 | 让拦截器成为 Spring Bean，注册时注入实例                                 |
| 耗时统计总是偏小                          | 在 `postHandle` 里统计，没算模板渲染                | 放到 `afterCompletion` 里                                                |
| 多个拦截器执行顺序不符合预期              | 注册顺序决定顺序                                    | 按依赖关系调整注册顺序                                                   |
| 抛异常时 `afterCompletion` 里的资源没释放 | 清理逻辑写在了 `postHandle`                         | `afterCompletion` 无论成功失败都会调用                                   |
| 权限判断写在模板里被绕过                  | 模板只负责显示，不负责授权                          | 服务端拦截（拦截器或安全框架）才是防线                                   |

## 10 小结

- 横切逻辑用 **`HandlerInterceptor`** 集中处理，别在每个控制器里抄；
- 三个回调：**`preHandle`（可中断，正序）→ Controller → `postHandle`（逆序）→ 视图渲染 →
  `afterCompletion`（逆序，必调用）**；
- 登录拦截要写对三处：**`handler` 类型判断、`getSession(false)`、重定向后 `return false`**；
- 拦截器**必须注册**（`WebMvcConfigurer#addInterceptors`），顺序即注册顺序，静态资源要排除；
- 拦截器与控制器传数据用**请求属性** + `@RequestAttribute`；
- 规则会变的权限检查，用**注解 + `HandlerMethod.getMethodAnnotation`** 声明在方法上；
- 需要操作 Servlet 层（编码、CORS、请求体日志）时用 **`Filter` / `OncePerRequestFilter`**。

到这里请求的「横向」问题基本解决：谁都能访问、访问顺序、进入前检查什么。接下来回到业务层，
处理另一个维度的横切问题——**事务**：一组数据库操作要么全成功，要么全失败。
