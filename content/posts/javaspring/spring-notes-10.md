---
title: Spring 学习笔记 10：Service 层与事务
description: 一组数据库操作要么全成功要么全失败，靠 @Transactional 怎么做到；传播行为、隔离级别、回滚规则怎么选，以及自调用失效、乐观锁悲观锁这些实战里的坑。
date: 2026-10-15
category: 学习
tags:
    - Spring
    - 事务
    - 学习笔记
series: Spring 学习笔记
seriesOrder: 10
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码都是自己敲的，参考的是
> Spring 官方文档与 Jakarta Persistence 规范。理解有偏差的地方欢迎指出。

## 0 借一本书，涉及三次写库

「借书」这个操作，业务上是一件事，落到数据库上却是三步：

1. 插入一条借阅记录（`loan`）；
2. 把这本书的状态改成「已借出」；
3. 把这位会员的借阅次数加一。

如果第 2 步成功、第 3 步失败，数据库里就留下了一条**自相矛盾的数据**：书显示已借出，但借阅
记录没建立，或者次数没算上。这类「必须一起成功」的操作，就是事务要解决的问题。

## 1 事务的基本语义

事务（Transaction）把若干数据库操作合成一个原子单元，具备四个性质（ACID）：

| 性质               | 含义                                                     |
| ------------------ | -------------------------------------------------------- |
| 原子性 Atomicity   | 要么全部生效，要么全部不生效                             |
| 一致性 Consistency | 事务前后数据都满足业务约束                               |
| 隔离性 Isolation   | 并发事务之间互相看不到中间状态（具体程度由隔离级别决定） |
| 持久性 Durability  | 提交后的结果不会因为故障丢失                             |

在 SQL 层面的表现就是：`BEGIN` 开启，做若干读写，`COMMIT` 提交或 `ROLLBACK` 回滚。

## 2 事务该写在哪一层

**写在 Service 层**，理由有三条：

- **业务边界在 Service**。「借书」这件事由 Service 定义，事务边界自然与它对齐；
- **Controller 不该管事务**。把 `@Transactional` 加到 Controller 上，事务会跨越视图渲染阶段，
  数据库连接被占用的时间被无谓拉长；
- **Repository 太细**。单个 `save` 本来就是一个事务，多个 Repository 调用的组合才需要事务，
  而组合发生在 Service。

因此 Service 的典型形态是：**接口定义业务能力，实现类负责编排多个 Repository 并声明事务边界**。

```java
public interface LoanService {

    Loan borrow(Long bookId, Long memberId);

    List<Loan> findByMember(Long memberId);
}
```

```java
package com.example.library.service;

import com.example.library.domain.Book;
import com.example.library.domain.BookStatus;
import com.example.library.domain.Loan;
import com.example.library.domain.Member;
import com.example.library.repository.BookRepository;
import com.example.library.repository.LoanRepository;
import com.example.library.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)        // 整个类的默认：查询型方法
public class LoanServiceImpl implements LoanService {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;

    public LoanServiceImpl(BookRepository bookRepository,
                           MemberRepository memberRepository,
                           LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    @Transactional                    // 写方法单独覆盖：方法级注解优先于类级
    public Loan borrow(Long bookId, Long memberId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NoSuchElementException("图书不存在：" + bookId));
        if (book.getStatus() != BookStatus.AVAILABLE) {
            throw new IllegalStateException("这本书当前不可借");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NoSuchElementException("会员不存在：" + memberId));

        book.markBorrowed();
        member.increaseActiveLoans();

        return loanRepository.save(new Loan(book, member, LocalDate.now()));
    }

    @Override
    public List<Loan> findByMember(Long memberId) {
        return loanRepository.findByMemberId(memberId);   // 用类级 readOnly=true
    }
}
```

**「类上 `readOnly = true` + 写方法上 `@Transactional` 覆盖」** 是很常见的组合：查询方法默认按
只读优化，写方法显式声明。方法级注解的优先级高于类级。

## 3 @Transactional 为什么能生效

![Service 层的事务边界由 Spring 代理开启与提交；Spring Bean 内部自调用绕开代理，因此 @Transactional 不生效](/images/spring-notes-10-transaction-proxy.svg)

`@Transactional` 是**声明式事务**：你不写 `BEGIN` / `COMMIT`，由 Spring 在运行时用 AOP 代理
包一层。得到这个代理有一个前提：**调用必须从代理外部进来**。

由此推出四条硬性要求，违反任何一条，事务都不生效（而且是静默失效）：

| 要求                 | 说明                                                  |
| -------------------- | ----------------------------------------------------- |
| 方法必须是 `public`  | 非 public 方法代理不拦截                              |
| 必须是外部调用       | 同类内部 `this.method()` 不经过代理                   |
| Bean 必须由容器管理  | 自己 `new` 出来的对象没有代理                         |
| 异常必须抛出方法边界 | 在方法内部 catch 掉且不重抛，代理看不到异常，不会回滚 |

最后一条特别容易忽略：

```java
@Transactional
public void doSomething() {
    try {
        riskyOperation();
    } catch (Exception e) {
        log.warn("出错了", e);       // 吞掉异常
    }
    // 事务照样提交，前面的写操作留下了
}
```

## 4 传播行为：内部方法要不要用同一个事务

当**事务方法调用另一个事务方法**时，第二个方法该怎么处理事务，就是传播行为（propagation）
决定的。七种取值，实际用的主要是前两个：

| 传播行为           | 行为                                                      | 典型用途                         |
| ------------------ | --------------------------------------------------------- | -------------------------------- |
| `REQUIRED`（默认） | 有事务就加入，没有就新建                                  | 绝大多数业务方法                 |
| `REQUIRES_NEW`     | **总是新建独立事务**，外层事务挂起，内层提交/回滚互不影响 | 审计日志：主业务失败也要留下记录 |
| `NESTED`           | 在当前事务里开一个保存点，内层失败可单独回滚到保存点      | 分批处理，允许部分回滚           |
| `SUPPORTS`         | 有事务就加入，没有就以非事务方式执行                      | 只读辅助方法                     |
| `NOT_SUPPORTED`    | 挂起当前事务，以非事务方式执行                            | 明确不希望被事务包裹的操作       |
| `MANDATORY`        | 必须在事务中调用，否则抛异常                              | 强制约定：只能在事务内被调用     |
| `NEVER`            | 必须在无事务环境下调用，否则抛异常                        | 强制约定：不允许被事务包裹       |

两个实战要点：

- **`REQUIRES_NEW` 会占用一条额外连接**。外层事务占用连接不释放，内层又要一条新连接，连接池
  小的时候（比如只有 5 条）嵌套几层就可能**互相等待而死锁**。用之前先看连接池配置；
- **`REQUIRES_NEW` 只对「从代理外部进来的调用」有效**。同类内部调用同样不生效，需要把内层方法
  放到另一个 Bean 里。

## 5 隔离级别：并发事务之间看到什么

隔离级别管的是**并发读写时的可见性**，从弱到强：

| 级别               | 能防住           | 挡不住                           | 说明                       |
| ------------------ | ---------------- | -------------------------------- | -------------------------- |
| `READ_UNCOMMITTED` | 无               | 脏读、不可重复读、幻读           | 现实中基本不用             |
| `READ_COMMITTED`   | 脏读             | 不可重复读、幻读                 | Oracle、PostgreSQL 默认    |
| `REPEATABLE_READ`  | 脏读、不可重复读 | 幻读（MySQL 的 InnoDB 基本挡住） | MySQL 默认                 |
| `SERIALIZABLE`     | 全部             | —                                | 并发性能最差，只在必要时用 |

选择原则是**用能满足业务的最弱级别**：越强越容易发生锁等待与超时。

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public ReportSummary buildSummary(Long memberId) { ... }
```

不写 `isolation` 时用**数据库自己的默认级别**——这也是为什么同一个 `@Transactional` 在 MySQL
和 PostgreSQL 上表现不同。

## 6 回滚规则：默认只回滚运行时异常

Spring 的默认规则是：

| 抛出的异常                                                    | 默认行为   |
| ------------------------------------------------------------- | ---------- |
| `RuntimeException` 及其子类                                   | 回滚       |
| `Error`                                                       | 回滚       |
| **受检异常（`Exception` 的子类但不继承 `RuntimeException`）** | **不回滚** |

业务里常把「余额不足」「库存不足」定义成受检异常，然后发现**事务没回滚**。解决办法是显式声明：

```java
@Transactional(rollbackFor = Exception.class)
public Loan borrow(Long bookId, Long memberId) throws BusinessException { ... }
```

需要注意它的**反方向用力**：`rollbackFor = Exception.class` 会让所有异常都回滚，如果想「某类
异常不回滚」，用 `noRollbackFor`：

```java
@Transactional(noRollbackFor = NotificationFailedException.class)
```

## 7 只读与超时

```java
@Transactional(readOnly = true, timeout = 5)
public List<BookTitleDto> search(String keyword) { ... }
```

- **`readOnly = true`** 是给提供者的提示：Hibernate 会跳过脏检查（不再为每个实体保存快照），
  查询型方法因此更快。**别用在写方法上**，轻则无效，重则异常；
- **`timeout` 是秒数**：超时后事务被回滚并抛异常。它是**兜底**而不是精度控制，适合给
  外部依赖不可控的查询加一层保护。

## 8 并发冲突：悲观锁与乐观锁

两个管理员同时编辑同一本书的库存，或者秒杀场景下多人抢同一本库存为 1 的书，都会撞上并发竞争。

### 8.1 悲观锁：先锁住再操作

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Book b where b.id = :id")
    Optional<Book> findByIdForUpdate(@Param("id") Long id);
}
```

`PESSIMISTIC_WRITE` 会生成 `select ... for update`，把这一行锁到事务结束：

```java
@Transactional
public Loan borrow(Long bookId, Long memberId) {
    Book book = bookRepository.findByIdForUpdate(bookId).orElseThrow();
    // 期间别人拿不到这行的写锁，只能等
}
```

适用场景：**竞争激烈、失败代价高**（库存扣减、账号余额）。
代价：**锁定期间别的请求排队**，锁范围大时容易连锁导致超时；锁必须在事务内才有意义。

### 8.2 乐观锁：先干，提交时检查版本

```java
@Entity
public class Book {

    @Version
    private Long version;

    // ...
}
```

Hibernate 在 `update` 时自动带上版本条件：`where id = ? and version = ?`。若版本已变，更新影响
0 行，抛 `OptimisticLockingFailureException`（JPA 层是 `OptimisticLockException`）。

适用场景：**冲突概率低**的编辑类操作（后台管理表单）。
代价：冲突时**必须由调用方重试或提示用户**，写代码时要处理这个异常，否则用户会看到 500。

两者怎么选：

| 对比     | 悲观锁           | 乐观锁                       |
| -------- | ---------------- | ---------------------------- |
| 冲突假设 | 假设会冲突，先锁 | 假设不冲突，提交时检查       |
| 性能影响 | 锁等待，吞吐下降 | 无锁开销，冲突时要重试       |
| 适合场景 | 强竞争、必须成功 | 低竞争、可重试               |
| 实现成本 | 加一行 `@Lock`   | 加 `@Version` + 处理冲突异常 |

## 9 编程式事务：需要精确控制边界时

声明式搞不定的场景（一个方法里有几段要各自独立提交的逻辑），用 `TransactionTemplate`：

```java
@Service
public class BookImportService {

    private static final Logger log = LoggerFactory.getLogger(BookImportService.class);

    private final BookRepository bookRepository;
    private final TransactionTemplate transactionTemplate;

    public BookImportService(BookRepository bookRepository,
                             PlatformTransactionManager transactionManager) {
        this.bookRepository = bookRepository;
        // 也可以把 TransactionTemplate 声明成 @Bean 注入，这里为了看清依赖关系直接 new
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    /** 每本书一个独立事务：某一本 ISBN 重复时只跳过这一本，其余照常导入 */
    public int importBooks(List<BookForm> forms) {
        int imported = 0;
        for (BookForm form : forms) {
            Integer result = transactionTemplate.execute(status -> {
                try {
                    Book book = new Book(form.getTitle(), form.getAuthor());
                    book.setIsbn(form.getIsbn());
                    bookRepository.saveAndFlush(book);   // 立刻 flush，唯一约束冲突在这里就暴露
                    return 1;
                } catch (DataIntegrityViolationException e) {
                    status.setRollbackOnly();
                    log.warn("跳过 ISBN 重复的《{}》", form.getTitle());
                    return 0;
                }
            });
            imported += result == null ? 0 : result;
        }
        return imported;
    }
}
```

这里用到的 `BookForm` 是第 06 篇那个表单对象；`saveAndFlush` 的作用是**立刻把语句发到数据库**，
让唯一约束冲突在这个 `try` 里就暴露出来（否则要等整个事务提交时才知道是哪一条出的问题）。

**默认用声明式，编程式只在边界必须逐个控制时使用**——它把事务语义写进了业务代码里，可读性会下降。

## 10 事务里不该做的事

- **远程调用**（HTTP、消息推送）：网络抖动会让事务一直开着，数据库连接被长期占用；
- **文件与 IO 操作**：同理，而且它本来就无法回滚；
- **循环里逐条 `save`**：N 次数据库往返，考虑批量写（`saveAll`、JDBC 批处理）；
- **等待用户输入**：事务不能跨请求；
- **吞异常**（第 3 节已提过）。

原则是**事务尽量短**：进入事务前把外部数据准备好，事务里只做数据库读写。

## 11 容易踩的坑

| 现象                                           | 原因                                                    | 处理                                                              |
| ---------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| `@Transactional` 完全没生效                    | 同类自调用、方法不是 public、对象不是容器管理的         | 把事务方法拆到另一个 Bean，或用编程式事务；检查修饰符             |
| 抛了异常但数据没回滚                           | 抛的是受检异常，或异常在方法内被 catch 掉               | `rollbackFor = Exception.class`，或把异常抛出去                   |
| 内层方法失败，外层事务也被回滚                 | 用了默认的 `REQUIRED`，内层加入的是同一个事务           | 需要互不影响就用 `REQUIRES_NEW`，并确认内层是外部调用             |
| 用了 `REQUIRES_NEW` 之后偶发卡死               | 嵌套事务各占一条连接，连接池不够                        | 检查连接池大小与事务嵌套层数，尽量避免多层嵌套                    |
| `REQUIRES_NEW` 没起作用                        | 内层方法是同类中的内部调用                              | 内层方法移到另一个 Bean                                           |
| 事务提交了但实体没写入                         | 只有查询方法加了 `readOnly`，或者根本没事务，靠自动提交 | 写方法显式 `@Transactional`（不带 readOnly）                      |
| 写方法上写了 `readOnly = true`，偶尔报错       | 提供者在只读事务里拒绝了写操作                          | 写方法覆盖为 `@Transactional`（默认 `readOnly = false`）          |
| 并发下库存扣成负数                             | 读-判断-写之间没有保护                                  | 悲观锁（`@Lock(PESSIMISTIC_WRITE)`）或乐观锁（`@Version` + 重试） |
| 优化后偶发 `OptimisticLockingFailureException` | 乐观锁检测到并发修改                                    | 捕获并重试/提示用户，别让它变成 500                               |
| 事务开着做远程调用，接口变慢导致连接耗尽       | 事务里做了 IO 或网络操作                                | 把远程调用移到事务外，事务只包数据库操作                          |
| 事务里查出的关联在事务外访问报错               | 延迟加载需要活动事务或打开的会话                        | 在事务内取够数据（`join fetch` / 投影），别把实体带出事务边界     |

## 12 小结

- **事务边界放在 Service 层**，用接口定义业务能力，实现类声明事务；
- 常用组合：**类上 `@Transactional(readOnly = true)` + 写方法上 `@Transactional`**；
- `@Transactional` 靠 AOP 代理生效，**自调用、非 public、自建对象、吞异常**四种情况会静默失效；
- 传播行为先记住 `REQUIRED`（默认，共用事务）与 `REQUIRES_NEW`（独立事务），并留意它多占一条
  连接的风险；
- 隔离级别**够用就好**，不写就用数据库默认值；
- **默认只回滚运行时异常**，业务异常要 `rollbackFor`；
- 并发竞争用悲观锁或乐观锁，前者适合强竞争，后者适合低冲突 + 可重试；
- 事务要短：**别在事务里做远程调用、文件 IO 和用户交互**。

到这里，服务端的读写、页面、会话、事务都齐了。接下来是另一个方向：**把服务暴露成 REST API**，
让前端框架、移动端、第三方都能用。下一篇从 HTTP 方法与状态码开始。
