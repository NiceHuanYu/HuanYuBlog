---
title: Java 函数式编程笔记：Lambda、函数式接口与 Streams
description: 学习 Java 函数式编程时的个人笔记：Lambda 表达式的五步简写与方法引用、常见函数式接口、Stream 流水线与惰性求值，以及创建流、中间操作、终止操作与收集器的用法。示例代码均为自写，运行结果来自本地实测。
date: 2026-10-13
category: 学习
tags:
    - Java
    - 函数式编程
    - Lambda
    - Stream
    - 学习笔记
series: Java 学习笔记
seriesOrder: 4
---

> 这是一份个人学习笔记：讲解部分是我按自己的理解写的，示例代码也都是自己写的，输出结果是本地跑出来的。参考主要是 Oracle 的 Java 官方文档与语言规范，理解有偏差的地方欢迎指出。

# 0.1 开篇问题：打印最年轻的 3 个人的全名

## 0.1.1 数据

假设有一个 `Person` 类的列表：

```java
class Person {
    private String firstName;
    private String lastName;
    private String gender;
    private int age;
    private int kids;
    // 构造函数与 getter 省略
}
```

```java
static List<Person> people() {
    return new ArrayList<>(List.of(
            new Person("Alice", "Wong", "F", 31, 2),
            new Person("Bryan", "Chua", "M", 24, 0),
            new Person("Cindy", "Tay", "F", 45, 3),
            new Person("Daniel", "Koh", "M", 38, 2),
            new Person("Ethan", "Goh", "M", 27, 2)));
}
```

要回答的问题是：**怎么打印这 5 个人里最年轻的 3 个人的全名？**

思路可以用一句话说清：先按年龄升序排好，再取前 3 个，最后把每个人转成全名打印出来。下面看两种实现方式。

## 0.1.2 命令式（Imperative）写法

按老办法，排序、取前 3、拼全名要分别写出来：

```java
List<Person> persons = people();

// 1. 按年龄升序排序（冒泡排序）
for (int i = 0; i < persons.size(); i++) {
    for (int j = i + 1; j < persons.size(); j++) {
        if (persons.get(j).getAge() < persons.get(i).getAge()) {
            Person temp = persons.get(i);
            persons.set(i, persons.get(j));
            persons.set(j, temp);
        }
    }
}

// 2. 取前 3 个人，3. 拼成全名
for (int i = 0; i < 3; i++) {
    System.out.println(persons.get(i).getFullName());
}
```

```text
Bryan Chua
Ethan Goh
Alice Wong
```

代码能跑，但要读的人先得看懂双重循环是在排序，再看懂后面在取前 3 个——「想做什么」被埋在「怎么做」里面。

## 0.1.3 SQL 的思路

如果数据在 MySQL 里，同一件事一句话就写完了：

```sql
SELECT name
FROM persons
ORDER BY age
LIMIT 3
```

只描述结果的样子：按 `age` 排序、只要 3 条。Java 里能不能也这么写？可以，这就是 Streams（流）。

## 0.1.4 Stream 写法

```java
people().stream()
        .sorted(Comparator.comparing(Person::getAge))
        .limit(3)
        .map(Person::getFullName)
        .forEach(System.out::println);
```

```text
Bryan Chua
Ethan Goh
Alice Wong
```

和上面交给命令式的输出完全一致，但代码几乎能和 SQL 一句句对上：`sorted` 对应 `ORDER BY`、`limit` 对应 `LIMIT`、`map` 是把每个元素换成一个新值、`forEach` 是逐个处理。

这份链式调用里有 `->` 和 `::` 这两种没见过的写法，后面几节就按「Lambda → 函数式接口 → Streams」的顺序把它们拆开。

# 0.2 Lambda 表达式（Lambda Expressions）

## 0.2.1 从方法定义说起

一个方法定义由五部分组成：方法名、参数、返回类型、方法体、返回值。

```java
int max(int num1, int num2) {
    if (num1 > num2) {
        return num1;
    }
    return num2;
}
```

在 Stream 的链式调用里，很多「方法」其实只在这一个地方用一次，专门为它取个名字、写个类显得多余。Lambda 表达式（Lambda Expression）就是**匿名方法（Anonymous Method）的简写形式**：把方法名和返回类型去掉，只留下参数和体。

```java
(num1, num2) -> {
    if (num1 > num2) {
        return num1;
    }
    return num2;
}
```

## 0.2.2 语法与五步简化

基本语法是「参数列表 + 箭头（`->`） + 方法体」：

```java
(parameter list) -> { statements }
```

从完整的方法定义到最短的 lambda，一共可以省五样东西：

| 步骤 | 去掉什么 | 例子 |
| --- | --- | --- |
| 1 | 方法名与返回类型（变成匿名方法） | `int add(int e1, int e2) { return e1 + e2; }` → `(e1, e2) -> { return e1 + e2; }` |
| 2 | 参数类型 | `(int e1, int e2) -> ...` → `(e1, e2) -> ...` |
| 3 | 方法体只有一个表达式时，省掉 `return` 和 `{}` | `(e1, e2) -> { return e1 + e2; }` → `(e1, e2) -> e1 + e2` |
| 4 | 只有一个参数时，省掉参数括号 `()` | `(message) -> System.out.println(message)` → `message -> System.out.println(message)` |
| 5 | 只调用一个已有方法时，改写成方法引用（Method Reference） | `message -> System.out.println(message)` → `System.out::println` |

## 0.2.3 省略参数类型

参数类型通常都可以省略，由编译器（Compiler）根据 lambda 所在的位置推断（Infer）。例如：

```java
people().stream()
        .filter(p -> p.getKids() == 2)
        .forEach(System.out::println);
```

`filter()` 要求传入的是一个「接收元素、返回布尔值」的方法，而这个流里的元素是 `Person`，所以 `p` 一定是 `Person`，`p.getKids()` 才能调用。**lambda 本身提供不了类型信息，是它的使用位置提供了。**

## 0.2.4 省略 `return` 与花括号

方法体只有一个表达式（Expression）时，`return` 关键字和 `{}` 都可以省掉：

```java
(num1, num2) -> num1 + num2
```

但方法体里有多条语句（比如包含 `if`）时不能省，因为这时候必须明确「返回什么」：

```java
(num1, num2) -> {
    if (num1 > num2) {
        return num1;
    }
    return num2;
}
```

返回类型也一样是从上下文推断出来的，lambda 自己不用写。

## 0.2.5 只有一个参数时可以省括号

参数列表只有一个参数时，参数括号也可以省：

```java
message -> System.out.println(message)
```

没有参数时括号不能省，要写成 `() -> ...`。

## 0.2.6 方法引用（Method Reference）

如果 lambda 什么都没做，只是把参数原样传给另一个已有的方法，就可以直接引用那个方法，写成 `ClassName::methodName`：

```java
// 原来
message -> System.out.println(message)
// 方法引用
System.out::println
```

```java
// 原来
p -> p.getFirstName()
// 方法引用
Person::getFirstName
```

```java
// 原来
(a, b) -> a.compareByAge(b)
// 方法引用
Person::compareByAge
```

## 0.2.7 练习：把方法改写成最短形式

**题目**：把下面几个方法改写成最短形态的 lambda 或方法引用。

```java
int pow(int base, int exp) {
    int res = 1;
    for (int i = 0; i < exp; i++) {
        res *= base;
    }
    return res;
}
```

方法体是多条语句，所以 `{}` 和 `return` 不能省：

```java
(base, exp) -> {
    int res = 1;
    for (int i = 0; i < exp; i++) {
        res *= base;
    }
    return res;
}
```

```java
boolean isPrime(int num) {
    for (int divisor = 2; divisor < num - 1; divisor++) {
        if (num % divisor == 0) {
            return false;
        }
    }
    return true;
}
```

```java
num -> {
    for (int divisor = 2; divisor < num - 1; divisor++) {
        if (num % divisor == 0) {
            return false;
        }
    }
    return true;
}
```

```java
String getFullName(Person p) {
    return p.getFirstName() + " " + p.getLastName();
}

void printFullName(Person p) {
    System.out.println(p.getFirstName() + " " + p.getLastName());
}

String getFirstName(Person p) {
    return p.getFirstName();
}
```

```java
p -> p.getFirstName() + " " + p.getLastName()
p -> System.out.println(p.getFirstName() + " " + p.getLastName())
Person::getFirstName
```

最后一个能改成方法引用，是因为它只做了「调用一个已有方法，并把结果返回」这一件事。

# 0.3 函数式接口（Functional Interfaces）

## 0.3.1 概念

Lambda 交给编译器之后，编译器得知道「这个方法的参数是什么类型、返回什么、是几个参数」，否则没法检查代码。这个信息由**函数式接口（Functional Interface）**提供：它规定了这个位置该传一个什么样子的方法。

> 函数式接口是**有且仅有一个抽象方法（Abstract Method）**的接口。这个方法叫函数式方法（Functional Method）。

为什么必须只有一个？因为 lambda 省掉了方法名，如果接口里有两个抽象方法，编译器就无法判断这份 lambda 是在实现哪一个。反过来，只要接口只有一个抽象方法，lambda 就能被映射（Map）到它上面。

看那个链式调用，每个方法要什么，其实都被对应的函数式接口写死了：

```java
people().stream()
        .sorted(Comparator.comparing(Person::getAge)) // 需要一个能比较两个元素的方法
        .limit(3)
        .map(Person::getFullName)                     // 需要一个有返回值（非 void）的方法
        .forEach(System.out::println);                 // 需要一个返回 void 的方法
```

## 0.3.2 常见函数式接口一览

| 接口（Interface） | 方法（Method） | 参数（Argument） | 返回（Return） | 用途 |
| --- | --- | --- | --- | --- |
| `Consumer<T>` | `accept` | `T` | `void` | 对 `T` 执行一个动作，例如打印 |
| `Function<T,R>` | `apply` | `T` | `R` | 对 `T` 调用方法并把结果返回 |
| `Predicate<T>` | `test` | `T` | `boolean` | 判断 `T` 是否满足条件 |
| `Supplier<T>` | `get` | 无 | `T` | 产生一个 `T` 类型的值 |
| `UnaryOperator<T>` | `apply` | `T` | `T` | 对 `T` 做运算并返回同类型的值 |
| `BinaryOperator<T>` | `apply` | `T, T` | `T` | 对两个 `T` 做运算并返回同类型的值 |
| `Comparator<T>` | `compare` | `T, T` | `int` | 规定两个对象的先后顺序 |

接口的声明都很短，例如：

```java
interface Consumer<T> {
    void accept(T t);
}

interface Predicate<T> {
    boolean test(T t);
}

interface BinaryOperator<T> {
    T apply(T t1, T t2);
}
```

## 0.3.3 用匿名内部类实例化

函数式接口也是接口，所以老办法依然可用：用 `new` 实例化，并当场实现它的抽象方法——这叫匿名内部类（Anonymous Inner Class）。

```java
Consumer<Integer> anonymous = new Consumer<Integer>() {
    @Override
    public void accept(Integer num) {
        System.out.println("anonymous inner class: " + num);
    }
};
Stream.of(1, 2).forEach(anonymous);
```

```text
anonymous inner class: 1
anonymous inner class: 2
```

写法上的三个要点：`new` 后面跟接口名；`Consumer<T>` 是泛型接口，实例化时要指定 `T`（这里是 `Integer`）；实现的 `accept(T)` 在指定 `T` 之后变成 `accept(Integer)`。

## 0.3.4 用 lambda 或方法引用实例化

因为 `Consumer<T>` 只有一个抽象方法，上面那个匿名内部类可以一路简化成 lambda，再简化成方法引用，效果一样：

```java
Consumer<Integer> lambda = num -> System.out.println("lambda: " + num);
Consumer<Integer> methodRef = System.out::println;

Stream.of(1, 2).forEach(lambda);
Stream.of(3).forEach(methodRef);
```

```text
lambda: 1
lambda: 2
3
```

反过来说，看到 `num -> System.out.println(num)` 这样的 lambda，编译器要判断它对应哪个接口，靠的也是「哪个函数式接口的参数个数、参数类型和返回类型对得上」。这也是为什么前面说函数式接口是「模板」。

## 0.3.5 把实例作为方法参数

函数式接口最常见的用法就是当方法参数。比如 `forEach()` 要的就是一个 `Consumer<T>` 实例，所以下面两种写法完全等价：

```java
Integer[] arr = {1, 2, 3, 4};

Arrays.stream(arr).forEach(new Consumer<Integer>() {
    @Override
    public void accept(Integer num) {
        System.out.println(num);
    }
});

Arrays.stream(arr).forEach(num -> System.out.println(num));
```

既然 lambda 更短，日常就只用 lambda 或方法引用的写法。

## 0.3.6 练习：lambda 能映射到哪个函数式接口

**题目**：下列 lambda 分别可以映射到哪个（些）函数式接口？

| lambda | 答案 | 理由 |
| --- | --- | --- |
| `e -> e > 3 && e % 2 == 0` | `Predicate<T>` | 一个参数、返回 `boolean` |
| `e -> System.out.println(e.getFullName())` | `Consumer<T>` | 一个参数、返回 `void` |
| `x -> x.length()` | `Function<T,R>` | 一个参数、返回非 void |
| `(x, y) -> x + ", " + y` | `BinaryOperator<T>` | 两个参数、返回与参数同类型 |
| `() -> LocalDateTime.now()` | `Supplier<T>` | 无参数、有返回值 |
| `e -> e.toString()` | `Function<T,R>` 或 `UnaryOperator<T>` | 接收 `T` 返回 `String`，若 `T` 就是 `String` 则两者都对得上 |
| `x -> x * x` | `UnaryOperator<T>` | 参数与返回值同类型 |
| `Math::abs` | `UnaryOperator<T>` | 一个参数、返回同类型 |
| `() -> { List<Integer> l = new ArrayList<>(); l.add(1); return l; }` | `Supplier<T>` | 无参数、有返回值 |

判断方法是固定的三连问：**几个参数？返回不返回（`void` 还是非 `void`）？参数和返回值的类型是什么？**

# 0.4 Streams（流）

## 0.4.1 从 for 循环到流

处理集合的老套路是「遍历元素 + 对每个元素做点事」：

```java
public static int sumOfEven(int[] arr) {
    int sum = 0;
    for (int num : arr) {
        if (num % 2 == 0) {
            sum += num;
        }
    }
    return sum;
}
```

用 Stream（流）改写，只描述想要什么：

```java
public static int sumOfEven2(int[] arr) {
    return IntStream.of(arr)
            .filter(x -> x % 2 == 0)
            .sum();
}
```

> Streams（流）是一串元素序列，我们对这串元素执行任务。**只写要做什么（what to do），至于怎么做（how to do）交给流去处理。**

## 0.4.2 流流水线（Stream Pipeline）

一次完整的流操作由三段组成：

```text
Source（源） -> Create Stream（创建流） -> Intermediate Operations（中间操作） -> Terminal Operation（终止操作） -> Result（结果）
```

| 阶段 | 内容 | 作用 |
| --- | --- | --- |
| 源（Source） | 通常是一个数组或一个集合 | 提供元素 |
| 中间操作（Intermediate Operations） | 过滤、排序、类型转换、映射…… | 描述对元素做哪些处理，可以有 N 个 |
| 终止操作（Terminal Operation） | 汇总结果，例如计数、求和、收集成集合 | 产生结果，只能有一个 |

对照着看那段求和代码：`IntStream.of(arr)` 是创建流，`filter(...)` 是中间操作，`sum()` 是终止操作（把流聚合成了一个值）。

## 0.4.3 惰性 vs 急切（Lazy vs Eager）

- **中间操作是惰性的（Lazy）**：定义它的那一刻什么都不做，要等到终止操作被调用才真正执行。
- **终止操作是急切的（Eager）**：一调用就立即执行。

可以留个「脚印」来验证这一点——在 `filter` 里打印：

```java
System.out.println("pipeline built, but nothing printed yet");
Stream<Integer> filtered = IntStream.of(2, 7, 4).boxed()
        .filter(n -> {
            System.out.println("checking " + n);
            return n % 2 == 0;
        });
System.out.println("terminal operation starts");
filtered.forEach(n -> System.out.println("kept " + n));
```

```text
pipeline built, but nothing printed yet
terminal operation starts
checking 2
kept 2
checking 7
checking 4
kept 4
```

从输出位置能看出两件事：`filter` 是在 `forEach` 那一行才开始执行的；而且执行顺序是**每个元素依次走完整条流水线**（`2` 被检查后立刻被消费，然后才轮到 `7`），并不是「先把所有元素过滤完，再遍历结果」。

## 0.4.4 优点与并行（Parallelism）

流的三个好处：

- 写法更声明式（Declarative）、更简洁。
- 关注问题本身，而不是实现细节。
- 便于并行化。

在中间操作前调用 `parallel()` 就会改成并行处理：

```java
int evenSumParallel = IntStream.of(3, 8, 5, 12)
        .parallel()
        .filter(n -> n % 2 == 0)
        .sum();
System.out.println("sum of even numbers (parallel): " + evenSumParallel);
```

```text
sum of even numbers (parallel): 20
```

串行版本的结果一样。值得注意的是，`parallel()` 背后有线程管理（Thread Management）、任务拆分（Task Splitting）等额外开销，**数据量小时并行反而可能比串行更慢**，所以默认还是用串行，确实有大数据量和性能需求时再考虑。

# 0.5 创建流（Creating Streams）

## 0.5.1 从数组创建

```java
int[] numbers = {3, 10, 6, 1};
IntStream.of(numbers).forEach(e -> System.out.print(e + " "));
System.out.println();

Integer[] boxed = {2, 9, 5};
Arrays.stream(boxed).forEach(e -> System.out.print(e + " "));
System.out.println();
```

```text
3 10 6 1 
2 9 5 
```

两种方法的区别在参数：`IntStream.of()` 接收 `int[]` 这类基本类型数组，得到的是 `IntStream`；`Arrays.stream()` 接收引用类型数组（如 `Integer[]`），得到的是 `Stream<Integer>`。选哪个取决于手上是哪种数组。

## 0.5.2 从集合创建

任何实现了 `Collection` 接口的类（`List`、`Set`……）都有 `stream()` 方法：

```java
List<String> list = new ArrayList<>();
list.add("first");
list.add("second");
list.stream().forEach(System.out::println);
```

```text
first
second
```

集合家族的常见实现：`List` 有 `ArrayList`、`LinkedList`；`Map` 有 `HashMap`；`Set` 有 `HashSet`。

## 0.5.3 创建有序整数流

`IntStream.range()` 与 `IntStream.rangeClosed()` 用来生成一段连续的整数：

```java
IntStream.range(1, 5).forEach(e -> System.out.print(e + " "));
System.out.println();
IntStream.rangeClosed(1, 5).forEach(e -> System.out.print(e + " "));
System.out.println();
```

```text
1 2 3 4 
1 2 3 4 5 
```

**区别只在结尾**：`range(1, 5)` 是左闭右开，含 1 不含 5；`rangeClosed(1, 5)` 两端都含。

**练习**：打印 1 到 100 的每个整数，一行一个。

```java
IntStream.rangeClosed(1, 100).forEach(System.out::println);
```

# 0.6 中间操作（Intermediate Operations）

## 0.6.1 常见方法

| 方法 | 参数（函数式接口） | 说明 |
| --- | --- | --- |
| `filter` | `Predicate<T>` | 只保留满足条件的元素 |
| `sorted` | `Comparator<T>` | 按给定的比较器排序 |
| `map` | `Function<T,R>` | 把每个元素替换成另一个值（类型可以变） |
| `distinct` | 无 | 按 `Object.equals(Object)` 去重 |
| `limit` | `long` | 只取前 n 个元素 |
| `skip` | `long` | 丢掉前 n 个元素，返回剩下的部分（不足 n 个则返回空流） |

注意 `limit(long num)`、`skip(long num)` 的参数不是函数式接口，而是一个普通的基本类型数字——看方法签名就能分清：**参数写着函数式接口的地方，才需要传 lambda**。

## 0.6.2 `filter(Predicate<T>)`

```java
people().stream()
        .filter(p -> p.getKids() == 2)
        .forEach(System.out::println);
```

```text
Alice Wong, 31, 2
Daniel Koh, 38, 2
Ethan Goh, 27, 2
```

调用流方法的思路可以拆成六步：想要过滤元素 → 那就调 `filter()` → 它要求给一个 `Predicate` → `Predicate` 的实例可以写成 lambda，左边的名字随便起（这里叫 `p`）→ `p` 的类型是流里的元素类型 `Person`，所以能用 `Person` 的任何方法 → 右边写出条件表达式，返回 `boolean`。

其他方法也都类似，只是第 2、4、6 步不同。`Predicate` 的其他常见写法还有 `x -> x % 2 == 0`、`amount -> amount > 10`。

**练习**：用流打印小于 100 的所有偶数自然数。

```java
IntStream.range(1, 100)
        .filter(number -> number % 2 == 0)
        .forEach(number -> System.out.print(number + " "));
```

## 0.6.3 `sorted(Comparator<T>)`

`Comparator<T>` 决定两个对象的先后顺序，它的抽象方法是 `compare(T o1, T o2)`，约定是：`o1 < o2` 返回负数、`o1 > o2` 返回正数、相等返回 0。

```java
interface Comparator<T> {
    int compare(T o1, T o2);
}
```

所以一个比较器可以直接写成 lambda。下面按名升序排序：

```java
people().stream()
        .sorted((p1, p2) -> p1.getFirstName().compareTo(p2.getFirstName()))
        .forEach(System.out::println);
```

```text
Alice Wong, 31, 2
Bryan Chua, 24, 0
Cindy Tay, 45, 3
Daniel Koh, 38, 2
Ethan Goh, 27, 2
```

这里借用了 `String` 自带的 `compareTo()`：它已经按「字母顺序在前返回负数、在后返回正数、相同返回 0」的约定实现好了，正好满足 `Comparator` 要求的返回值语义。（`Integer`、`Double` 等包装类也都有可用的 `compareTo()`。）

因为「取某个属性来比较」太常用，`Comparator` 提供了 `comparing()` 工厂方法，等价且更短：

```java
.sorted(Comparator.comparing(Person::getFirstName))
```

它接收一个 `Function<T,R>`（一个参数、有非 void 返回值），流里每个元素经过这个函数取出的键值，会被当作比较依据。

多个字段、倒序也都支持：

```java
people().stream()
        .sorted(Comparator.comparing(Person::getKids)
                .thenComparing(Person::getAge)
                .reversed())
        .forEach(System.out::println);
```

```text
Cindy Tay, 45, 3
Daniel Koh, 38, 2
Alice Wong, 31, 2
Ethan Goh, 27, 2
Bryan Chua, 24, 0
```

链条读作：先按 `kids` 升序，`kids` 相同时按 `age` 升序（`thenComparing`），最后把整体顺序反过来（`reversed`）。所以 `kids` 最多的 `Cindy` 在最前，`kids` 为 0 的 `Bryan` 排在最后；中间三个人 `kids` 都是 2，被 `reversed` 反成了按年龄递减。

**练习**：先按名、再按姓排序。

```java
people().stream()
        .sorted(Comparator.comparing(Person::getFirstName)
                .thenComparing(Person::getLastName))
        .forEach(p -> System.out.println(p.getFullName()));
```

## 0.6.4 `map(Function<T,R>)`

`map()` 接收一个 `Function<T,R>`，把每个元素**转换成另一个值**，类型也可以变：

```java
people().stream()
        .sorted(Comparator.comparing(Person::getAge))
        .map(Person::getFullName)
        .forEach(System.out::println);
```

```text
Bryan Chua
Ethan Goh
Alice Wong
Daniel Koh
Cindy Tay
```

同一个流表面上只是「拿着元素」，但其实每个操作都会改变「流里的元素是什么类型」，写代码时最好对每一步的输入输出都有数：

| 方法 | 输入 | 输出 |
| --- | --- | --- |
| `sorted(...)` | `Person` | `Person` |
| `map(Person::getFullName)` | `Person` | `String` |
| `forEach(System.out::println)` | `String` | `void` |

弄混了很容易出问题，例如把 `sorted()` 放到 `map()` 后面，就比较不了 `Person` 的属性了，得改成比较字符串。

`map` 对基本类型流和引用类型流都能用：

```java
int[] numbers = {0, 1, 2, 3, 4, 5};
IntStream.of(numbers)
        .map(number -> number * 2)
        .forEach(number -> System.out.print(number + " "));
System.out.println();

String[] words = {"kiwi", "banana", "pear"};
Arrays.stream(words)
        .map(String::toUpperCase)
        .forEach(w -> System.out.print(w + " "));
System.out.println();
```

```text
0 2 4 6 8 10 
KIWI BANANA PEAR 
```

## 0.6.5 `map` 与 `mapToInt` 的区别

要把一个对象流转成数字流，用 `mapToInt()`：

```java
String[] names = {"Alice", "Bryan", "Cindy", "Daniel", "Ethan"};
int maxLength = Stream.of(names)
        .mapToInt(name -> name.length())
        .max()
        .getAsInt();
System.out.println("longest first name has " + maxLength + " letters");
```

```text
longest first name has 6 letters
```

为什么不能直接 `map()`？因为两者返回的流不同：

```java
// mapToInt() 返回 IntStream，可以用 IntStream 的 max()
Stream.of(names).mapToInt(name -> name.length()).max().getAsInt();

// map() 返回 Stream<Integer>，只能用带 Comparator 的 Stream.max()
Stream.of(names).map(name -> name.length()).max(Integer::compareTo).get();
```

`IntStream.max()` 不需要参数，返回 `OptionalInt`，用 `getAsInt()` 取值；`Stream.max(Comparator<T>)` 需要一个比较器，返回 `Optional`，用 `get()` 取值。**用方法之前先看清它返回的是什么流。**

## 0.6.6 `distinct` / `limit` / `skip`

```java
int[] dup = {4, 4, 1, 9, 1, 7, 3};
IntStream.of(dup).distinct().forEach(e -> System.out.print(e + " "));
IntStream.of(dup).sorted().forEach(e -> System.out.print(e + " "));
IntStream.of(dup).limit(3).forEach(e -> System.out.print(e + " "));
IntStream.of(dup).skip(3).forEach(e -> System.out.print(e + " "));
```

```text
distinct: 4 1 9 7 3 
sorted:   1 1 3 4 4 7 9 
limit(3): 4 4 1 
skip(3):  9 1 7 3 
```

`distinct` 保留第一次出现的顺序，`limit` 和 `skip` 都是按流的顺序数的。

# 0.7 终止操作（Terminal Operations）

## 0.7.1 常见方法

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `forEach` | `Consumer<T>` | 对每个元素执行一个动作 |
| `reduce` | `T, BinaryOperator<T>` | 带着初值（identity）做归约，返回归约后的值 |
| `reduce` | `BinaryOperator<T>` | 不带初值做归约，返回 `Optional` |
| `min` | `Comparator<T>` | 按比较器取最小元素 |
| `max` | `Comparator<T>` | 按比较器取最大元素 |
| `average` | 无 | 求数字流所有元素的平均值 |
| `sum` | 无 | 求数字流的和 |
| `collect` | `Collector` | 把元素收集进容器（List、Set、Map……） |

## 0.7.2 `forEach` 与 `Map.forEach`

`forEach(Consumer<T>)` 就是「遍历每个元素并做点什么」：

```java
List<String> list = new ArrayList<>();
list.add("first");
list.add("second");
list.forEach(e -> System.out.print(e + " "));
```

顺带一提：**不是所有场合都需要流**。集合自己也有 `forEach()`，行为和流的一样。

这是这一节里唯一一个不用流、而是**直接用在 `Map` 上**的方法——`Map` 的 `forEach(BiConsumer<K,V>)` 接收两个参数：

```java
Map<String, Integer> nameToLength = new HashMap<>();
nameToLength.put("Alice", 5);
nameToLength.put("Bryan", 5);
nameToLength.put("Daniel", 6);

nameToLength.forEach((name, length) -> System.out.print(name + "=" + length + " "));
```

```text
Bryan=5 Alice=5 Daniel=6 
```

注意参数的**位置**才是有意义的：第一个参数是键（Key）、第二个是值（Value），字母叫什么无所谓。反过来写成 `(v, k)` 不会报错，但含义就全反了。

## 0.7.3 `reduce()`：带初值和不带初值

归约（Reduce）指「把流里所有元素合并成单个值/对象」。两个重载的签名不同，用法也不同。

带初值的版本 `reduce(T identity, BinaryOperator<T>)`，两个参数分别叫累加器（Accumulator）和当前元素，而**参数类型与返回值类型必须相同**：

```java
double[] decimals = {1.1, 2.2, 3.3};
double sum1 = Arrays.stream(decimals)
        .reduce(0, (subtotal, e) -> subtotal + e);
System.out.println(sum1);
```

```text
6.6
```

不带初值的版本 `reduce(BinaryOperator<T>)` 只是把那两个参数直接当成两个元素来合并，因为流可能为空，所以返回的是 `Optional`：

```java
double sum2 = Arrays.stream(decimals)
        .reduce((n1, n2) -> n1 + n2)
        .getAsDouble();
System.out.println(sum2);
```

```text
6.6
```

**练习**：求一个整数数组里所有元素的乘积。

```java
int product = IntStream.of(1, 2, 3, 4)
        .reduce(1, (subproduct, e) -> subproduct * e);
System.out.println(product);
```

```text
24
```

初值写 `1` 而不是 `0`：乘法里 `1` 是「什么都不改」的中性值，写 `0` 结果永远是 0。

## 0.7.4 对引用类型做归约

`reduce` 同样适用于对象。例如找出孩子最多的人：

```java
Person mostKids = people().stream()
        .reduce((p1, p2) -> p1.getKids() > p2.getKids() ? p1 : p2)
        .get();
System.out.println(mostKids);
```

```text
Cindy Tay, 45, 3
```

不带初值时，归约的初值就是流里的第一个元素（相当于 `persons.get(0)`），然后逐个和后面的元素比较。对象上的 `toString()` 我实现成 `getFullName() + ", " + age + ", " + kids`，所以打印成这样。

## 0.7.5 `min` / `max` / `average` / `sum`

对数字流来说，这几个聚合函数非常好用：

```java
int[] values = {3, 1, 4, 2, 5};
System.out.println("min: " + IntStream.of(values).min().getAsInt()
        + ", max: " + IntStream.of(values).max().getAsInt()
        + ", average: " + IntStream.of(values).average().getAsDouble()
        + ", sum: " + IntStream.of(values).sum());
```

```text
min: 1, max: 5, average: 3.0, sum: 15
```

`min()`/`max()` 返回 `OptionalInt`，`average()` 返回 `OptionalDouble`（流为空时它们没有值可给），`sum()` 直接返回数字。

对引用类型，`min()`/`max()` 就必须自己提供 `Comparator<T>`——可以写成 lambda：

```java
String minName = people().stream()
        .map(Person::getFirstName)
        .min((s1, s2) -> s1.compareToIgnoreCase(s2))
        .get();
String maxName = people().stream()
        .map(Person::getFirstName)
        .max(String::compareToIgnoreCase)
        .get();
System.out.println("first name min: " + minName + ", max: " + maxName);
```

```text
first name min: Alice, max: Ethan
```

也可以用之前见过的 `Comparator.comparing()`：

```java
Person oldest = people().stream()
        .max(Comparator.comparing(Person::getAge))
        .get();
System.out.println("oldest: " + oldest.getFullName());
```

```text
oldest: Cindy Tay
```

**练习**：用 `max()` 打印孩子最多的人的名字。除了 `Comparator.comparing(Person::getKids)`，也可以手写比较逻辑，只要遵守「大于返回正数、小于返回负数、相等返回 0」：

```java
.max((p1, p2) -> {
    if (p1.getKids() > p2.getKids()) {
        return 1;
    } else if (p1.getKids() < p2.getKids()) {
        return -1;
    } else {
        return 0;
    }
})
```

在 `kids` 这种 `int` 属性上，这段逻辑可以简写成 `(p1, p2) -> p1.getKids() - p2.getKids()`。

## 0.7.6 `collect()` 与 `Collectors`

`collect(Collector)` 把流里的元素归约进可变容器（Mutable Container），例如 List、Set、Map。

收集成 `List`：

```java
String[] names = {"Alice", "Bryan", "Cindy", "Daniel", "Ethan"};
List<String> longNames = Arrays.stream(names)
        .filter(name -> name.length() >= 6)
        .collect(Collectors.toList());
System.out.println(longNames);
```

```text
[Daniel]
```

收集成 `Set`（可以去重）：

```java
Set<String> upperNames = Arrays.stream(names)
        .map(String::toUpperCase)
        .collect(Collectors.toSet());
System.out.println(upperNames);
```

```text
[ETHAN, ALICE, DANIEL, BRYAN, CINDY]
```

`Set` 是 `HashSet`，**不保证顺序**，所以输出顺序和原数组不一致是正常的，不必按顺序去对。

收集成 `Map`，用 `Collectors.toMap()`，要回答两个问题：键是什么、值是什么：

```java
Map<String, Integer> nameToLength = Arrays.stream(names)
        .collect(Collectors.toMap(
                name -> name,
                name -> name.length()));
System.out.println(nameToLength);
```

```text
{Ethan=5, Bryan=5, Alice=5, Daniel=6, Cindy=5}
```

第一个 lambda 说明键就是元素本身，第二个说明值是这个元素的长度。

## 0.7.7 分组：`groupingBy`

`Collectors.groupingBy()` 按某个属性把元素分组，得到「属性值 → 该组元素列表」的 `Map`：

```java
Map<String, List<Person>> genderToPersons = people().stream()
        .collect(Collectors.groupingBy(Person::getGender));
System.out.println(genderToPersons);
```

```text
{F=[Alice Wong, 31, 2, Cindy Tay, 45, 3], M=[Bryan Chua, 24, 0, Daniel Koh, 38, 2, Ethan Goh, 27, 2]}
```

同样地，`HashMap` 不保证组的顺序。

## 0.7.8 分组后再汇总

分组的第二个参数可以再给一个收集器，用来对每组做汇总。例如统计每个性别的孩子总数：

```java
Map<String, Integer> genderToTotalKids = people().stream()
        .collect(Collectors.groupingBy(
                Person::getGender,
                Collectors.summingInt(Person::getKids)));
System.out.println(genderToTotalKids);
```

```text
{F=5, M=4}
```

`F` 组是 `Alice(2) + Cindy(3) = 5`，`M` 组是 `Bryan(0) + Daniel(2) + Ethan(2) = 4`。第二个参数换成分组里的其他汇总收集器（求平均、计数、取最大……）就能做别的统计。

# 0.8 函数式接口与流方法的对应关系

把前面出现过的函数式接口和它们服务的流方法对起来看，整个体系就清楚了：

| 函数式接口 | 出现的方法 | 例子 |
| --- | --- | --- |
| `Predicate<T>` | `filter` | `.filter(x -> x % 2 == 0)`、`.filter(p -> p.getAge() > 40)` |
| `Function<T,R>` | `map`、`Comparator.comparing` | `.map(p -> p.getFirstName() + " " + p.getLastName())`、`.map(String::toUpperCase)` |
| `Comparator<T>` | `sorted`、`min`、`max` | `.sorted((p1, p2) -> p1.getFirstName().compareTo(p2.getFirstName()))` |
| `Consumer<T>` | `forEach` | `.forEach(e -> System.out.print(e + " "))` |
| `BinaryOperator<T>` | `reduce` | `.reduce((n1, n2) -> n1 + n2)` |

也可以反过来记：**每个函数式接口都在回答三个问题——几个参数？返回什么？参数和返回值的类型是什么？**

- `Predicate<T>`：1 个参数，返回 `boolean`。
- `Function<T,R>`：1 个参数，返回非 void 的值。
- `Comparator<T>`：2 个参数，返回正数/负数/0。
- `Consumer<T>`：1 个参数，返回 `void`。
- `BinaryOperator<T>`：2 个参数，参数类型与返回类型相同。

# 0.9 回到开篇问题

```java
people().stream()
        .sorted(Comparator.comparing(Person::getAge))
        .limit(3)
        .map(Person::getFullName)
        .forEach(System.out::println);
```

```text
Bryan Chua
Ethan Goh
Alice Wong
```

现在这份代码里的每个部分都能解释了：`sorted` 要一个 `Comparator`，`Comparator.comparing` 用一个 `Function` 取排序依据；`limit` 是个普通数字参数；`map` 要一个 `Function`，把 `Person` 变成 `String`；`forEach` 要一个 `Consumer`，而 `System.out::println` 是方法引用。

和最初的命令式版本相比，这里没有下标、没有临时变量、也没有显写的循环——命令式的循环被换成了声明式的聚合操作（Aggregate Operations）：**说清楚要什么，让流去算。**
