---
title: Java 基础语法笔记：从环境安装到方法与数组
description: 学习 Java 基础语法时的个人笔记：JDK 安装、输入输出、变量与运算符、条件与循环、字符串、数组与方法。示例代码均为自写，运行结果来自本地实测。
date: 2026-10-05
category: 学习
tags:
    - Java
    - 基础语法
    - 学习笔记
series: Java 学习笔记
seriesOrder: 1
---

> 这是一份个人学习笔记：讲解部分是我按自己的理解写的，示例代码也都是自己写的，输出结果是本地跑出来的。参考主要是 Oracle 的 Java 官方文档与语言规范，理解有偏差的地方欢迎指出。

# 0.0 Java的安装

Java需要理解JDK\JRE\JVM的概念，JDK是Java Development Kit用于开发，其中包含了Jre

而Jre则只包含了运行java程序最小的运行环境，不能用于编译开发；JVM是JAVA虚拟机的意思，它是JAVA程序能够跨平台使用的基础。

## 0.1 下载Java JDK：

Oracle官网: http://www.oracle.com/technetwork/java/javase/downloads/

这里选择

```bash
 JDK 17, for Windows, download x64 Installer.
```

也可以选择更新版本

## 0.2 配置安装环境

较高版本的java会自动设置环境变量，可以根据验证[安装章节](#023-检查安装是否成功)是否成功进行验证。

### 0.2.1 Windows下配置环境

第一步：打开系统设置中的“环境变量”并编辑“系统变量”

第二步: 点击”环境变量“按钮，并点击”高级“

第三步: 新建并设置`JAVA_HOME` 的值为Java安装的路径. 默认情况下, 安装路径是：

```bash
 C:\Program Files\Java\jdk-17
```

第四步：在系统变量中找到`Path`，然后在Path中添加：

```bash
%JAVA_HOME%\bin
```

### 0.2.2 Linux（Ubuntu）下安装并配置环境

~~自己去查AI吧哈哈。~~还没写呢。

### 0.2.3 检查安装是否成功。

打开cmd或终端，输入:

```bash
java -version
```

```bash
javac -version
```

得到类似以下输出，即可视为安装成功了：

```bash
java version "17.0.16" 2025-07-15 LTS
Java(TM) SE Runtime Environment (build 17.0.16+12-LTS-247)
Java HotSpot(TM) 64-Bit Server VM (build 17.0.16+12-LTS-247, mixed mode, sharing)
```

```bash
javac 17.0.16
```

## 0.3 安装IDE

IDE可以理解成多功能方便编辑和调试代码的记事本。

欧洲人最爱用的IDE Eclipse： https://www.eclipse.org/downloads/

JerBrain 出品的IDEA（网址是CN区的，可以快速下载）: https://www.jetbrains.com/zh-cn/idea/download/

微软出品的VS code也不错，这个基本都会下载了，不带链接了。

# 1.认识JAVA

## 1.1 JAVA的分类

Java 按运行环境分成三个版本：

- **Java SE（Standard Edition）**：标准版，桌面和命令行程序用的基础组件都在这里，JVM、JRE、JDK 都属于它。
- **Java EE（Enterprise Edition）**：企业版，在 SE 之上加了一批面向服务端的 API，适合做需要扩展的大型应用，通常部署在应用服务器里。它后来交给 Eclipse 基金会维护，现在叫 Jakarta EE。
- **Java ME（Micro Edition）**：微型版，目标是很小的嵌入式和早期的移动设备，现在这块基本被 Android 接过去了。

## 1.2 JAVA的文档（来自于甲骨文Oracle)

JAVA最新文档：

http://www.oracle.com/technetwork/java/javase/documentation/

The Java Tutorials (from Oracle)

http://docs.oracle.com/javase/tutorial/

Java SE API(链接中17意思是Java 17的SE官方文档)

http://docs.oracle.com/javase/17/docs/api/

## 1.3 JAVA程序的编译与使用

### 1.3.1 Java源代码

后缀名为 `.java` 的文件就是 Java 源代码。下面这段例子保存为 `HelloWorld.java`：

```java
public class HelloWorld {
    // 实例方法：要先创建对象才能调用
    public void printMessage() {
        System.out.println("Hello, world!");
    }

    // 类方法（static）：JVM 从 main 开始执行
    public static void main(String[] args) {
        HelloWorld app = new HelloWorld();
        app.printMessage();
    }
}
```

你可以从代码和命名方式中发现：

1. 文件名与类名相同

2. 一个类中可以有多个方法，其中可以包含一个main方法，有了main方法后，main方法中的代码会在程序中执行，其他方法则需要在main中调用才能执行。

## 1.3.2 Java源代码的编译

在命令行中，使用`javac`命令对java源代码进行编译，得到.class文件

```bash
javac HelloWorld.java
```

class文件可以使用Java命令执行，不要带后缀名

```bash
java HelloWorld
```

输出结果:

```context
Hello World!
```

---

# 2.认识IDE

## 2.1认识eclipse

eclipse是一款老牌编译器，其开源小巧，功能简单而全面，配置没有那么复杂，适合新手深入学习。

具体使用可以查找网上教程，不在此赘述。

## 2.1.1 Debug步骤

1. 在怀疑出问题的行上点一下，下个断点。
2. 用 Debug 模式启动（不是 Run），程序会停在断点处。
3. 用 Step-over 一行行往下走，同时盯住 Variables 面板里各个变量的值。
4. 想跳过不关心的代码就 Resume，想让程序停在某一行就用 Run-to-Line，查完直接 Terminate。

---

# 3.Java的输入与输出

## 3.1 Java程序的输出

### 3.1.1常用输出指令

- `System.out.println();`换行输出

- `System.out.print();`不换行输出

- `System.out.printf(formatString,v1,v2);`按格式输出

### 3.1.2 formatString的使用

我们使用`System.out.printf("姓名：%s，年龄：%d，成绩：%.2f%n", "张三", 20, 92.345);`时，会得到这样的结果。

```context
姓名：张三，年龄：20，成绩：92.35
```

实际上，`%s`这种属于格式说明符，其格式为：

`%[argument_index$][flags][width][.precision]conversion`

各部分含义：

| 部分              | 说明                         | 示例                |
| ----------------- | ---------------------------- | ------------------- |
| `%`               | 格式说明符开始               | `%d`                |
| `argument_index$` | 参数索引，从 1 开始          | `%2$s`              |
| `flags`           | 标志，控制符号、对齐、补零等 | `-`、`+`、`0`、`,`  |
| `width`           | 最小宽度                     | `%10d`              |
| `.precision`      | 精度                         | `%.2f`、`%.5s`      |
| `conversion`      | 转换类型                     | `d`、`f`、`s`、`tY` |

默认情况下，格式说明符按顺序使用参数：

```java
System.out.printf("%s 和 %s%n", "A", "B");
// A 和 B
```

也可以显式指定参数索引，格式为 `%n$`，其中 `n` 从 1 开始：

```java
System.out.printf("%2$s 和 %1$s，再次 %2$s%n", "A", "B");
// B 和 A，再次 B
```

建议不要混用显式索引和普通顺序参数，容易混乱。

3.1.3 DecimalFormat

实际上，Java已经提供了很多已有的工具，我们可以通过[API网站](https://docs.oracle.com/javase/17/docs/api/)查询java的方法和特性，然后通过导入获取其信息。

需要按固定格式输出数字时，`DecimalFormat` 比手写拼接省事，用之前先 `import java.text.DecimalFormat;`。完整的构造器与方法列表以官方文档为准：[DecimalFormat（Java SE 17 API）](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/DecimalFormat.html)。

先跑一段看看效果（下面表格里的输出都是我在 JDK 21 上跑出来的）：

```java
double amount = 6543.21;
DecimalFormat formatter = new DecimalFormat("#.##");
System.out.println(formatter.format(amount)); // 6543.21
```

pattern 里的 `0` 表示这一位必须显示（不够就补 0），`#` 表示这一位有值才显示：

| pattern      | 6543.21 的结果 | 7 的结果 | 说明                         |
| ------------ | -------------- | -------- | ---------------------------- |
| `"#.#"`      | 6543.2         | 7        | 最多一位小数                 |
| `"#.###"`    | 6543.21        | 7        | 最多三位小数，末尾 0 不补    |
| `"0.0"`      | 6543.2         | 7.0      | 至少一位小数                 |
| `"0.000"`    | 6543.210       | 7.000    | 至少三位小数，不够补 0       |
| `"0,000.00"` | 6,543.21       | 0,007.00 | 千分位分组                   |
| `"0"`        | 6543           | 7        | 只保留整数部分               |
| `"000"`      | 6543           | 007      | 整数部分至少三位，不够补 0   |
| `"###"`      | 6543           | 7        | 最多三位整数位，超出则全显示 |

## 3.2 Java程序的输入

### 3.2.1 Scanner

Scanner是java传统输入方式，注意，使用`close`方法后再使用scanner输入会报错。

```java
import java.util.Scanner; //Import Scanner class
Scanner scanner = new Scanner(System.in); //Create a Scanner object
String name = scanner.nextLine(); //Read a String input
int age = scanner.nextInt(); //Read a int input
double salary = scanner.nextDouble(); //Read a double input
scanner.close() //Close the scanner
```

## 3.3 IO类-JAVA 25的新特性

**Java 25 正式引入了一个全新的 `java.lang.IO` 类**，专门用于简化控制台交互，旨在取代繁琐的 `System.out.println()` 和`Scanner`。



这个类是 Java 25 “**Paving the On-Ramp**”（铺设入门之路）计划的一部分，目的是让初学者和从其他语言转来的开发者能更轻松地编写 Java 程序。

`IO` 类提供了一组静态方法，并且因为它位于 `java.lang` 包下，所以**无需显式导入**即可直接使用。其主要方法对比如下：

| 新方法 (`java.lang.IO`) | 传统方法                                                        | 说明                                   |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------- |
| `IO.println("Hello")`   | `System.out.println("Hello")`                                   | 输出并换行                             |
| `IO.print("Hello")`     | `System.out.print("Hello")`                                     | 输出但不换行                           |
| `IO.println()`          | `System.out.println()`                                          | 输出一个空行                           |
| `IO.readln("Prompt: ")` | `System.out.print("Prompt: ");``String s = scanner.nextLine();` | **读取一行输入，并可同时显示提示信息** |

### 3.3.1. 输出：告别 `System.out`

现在，你可以用更短的 `IO.println()` 来代替 `System.out.println()`。

```java
// 旧方式
System.out.println("Hello, world!");
// 新方式（Java 25+）
IO.println("Hello, world!");
```

如果使用静态导入，代码甚至可以简化为 `println("Hello, world!");`。

### 3.3.2. 输入：`IO.readln()` 一步到位

这是最显著的改进。`IO.readln(String prompt)` 方法**将“显示提示”和“读取输入”两个步骤合二为一**，代码更简洁直观。

```java
// 旧方式（用 Scanner）
System.out.print("请输入您的姓名：");
Scanner scanner = new Scanner(System.in);
String name = scanner.nextLine();
*// 新方式 (Java 25+)*
String name = IO.readln("请输入您的姓名：");
```

> 补充一句来源：`IO` 类是 Java 25 引入的，属于「Paving the On-Ramp」这一批改进（见 JEP 512）。我本地装的是 JDK 21，所以这段只是先把用法记下来，还没实际跑过。

---

# 4  Java中的变量与运算

## 4.1. 变量 Variables

- **定义**：变量是命名的存储位置，包含名称、类型和值；值可以修改。
- **使用前必须先声明**：`类型 变量名;`
- **赋值**：用 `=`，如 `radius = 5;`
- **常量**：用 `final` 声明，只能赋值一次，命名习惯全大写加下划线，如 `MAX_VALUE`。

### 4.1.1变量命名规则 Identifier

- 只能包含字母、数字、下划线 `_`、美元符号 `$`。
- 不能以数字开头。
- 不能包含空格、连字符 `-`。
- 不能使用 Java 关键字或保留字。
- 区分大小写。

### 4.1.2命名约定

- 变量名以小写开头，使用驼峰命名，如 `numberOfStudents`。
- 常量用全大写加下划线，如 `MAX_VALUE`。
- 名字应具有描述性，避免 `a`、`b`、`x` 等无意义名称。

### 4.1.3变量声明

- 可声明单个变量：`int sum;`
- 可一次声明多个同类型变量：`int number, count;`
- 可声明并初始化：`int magicNumber = 99;`
- 类型一旦声明不能改变，Java 是静态类型语言。

---

## 4.2. 数据类型 Data Types

Java 数据类型分两大类：

- **基本类型 Primitive Types**
- **引用类型 Reference Types**，如对象、数组、String

### 4.2.1 八种基本类型

| 类型      | 说明                                       |
| --------- | ------------------------------------------ |
| `byte`    | 8 位有符号整数，范围 -128 到 127           |
| `short`   | 16 位有符号整数                            |
| `int`     | 32 位有符号整数，常用                      |
| `long`    | 64 位有符号整数                            |
| `float`   | 32 位单精度浮点数                          |
| `double`  | 64 位双精度浮点数，常用                    |
| `char`    | 16 位 Unicode 字符，可参与整数运算         |
| `boolean` | 只能为 `true` 或 `false`，不能参与算术运算 |

### 4.2.2 String

- `String` 不是基本类型，而是引用类型。
- `char` 用单引号，如 `'A'`；`String` 用双引号，如 `"Hello"`。

### 4.2.3 类型选择

- 整数一般用 `int`，小数一般用 `double`。
- `char` 用于单个字符，`String` 用于文本，`boolean` 用于真假判断。

---

## 4.3. 类型转换 Type Casting

- **自动类型转换 / 拓宽转换 Widening Casting**  
  小类型自动转大类型：`byte → short → char → int → long → float → double`  
  如 `int` 赋给 `double` 可以自动完成。

- **强制类型转换 / 窄化转换 Narrowing Casting**  
  大类型转小类型需显式加 `(类型)`，如 `(int) 68.2`，结果会截断为 `68`。

- `boolean` 不能进行类型转换。

### 4.3.1 String 与基本类型转换

- String 转基本类型：
  - `Integer.parseInt("1234")`
  - `Double.parseDouble("1.2345")`
  - `Float.parseFloat(...)`
  - `Boolean.parseBoolean(...)`
- 基本类型转 String：
  - 用 `+ ""`
  - `String.valueOf(...)`
  - `Integer.toString(...)`、`Double.toString(...)` 等

---

## 4. 4表达式与运算符 Expressions and Operators

表达式由运算符和操作数组成，求值后得到一个值。

### 4.4.1 数学运算符

| 运算符 | 含义                     |
| ------ | ------------------------ |
| `+`    | 加法，也可用于字符串拼接 |
| `-`    | 减法                     |
| `*`    | 乘法                     |
| `/`    | 除法；整数除法会截断     |
| `%`    | 取余                     |

注意：

- Java 没有 `^` 幂运算符，求幂要用 `Math.pow(x, y)`。
- 如果操作数类型不同，会按 `int → long → float → double` 自动提升。
- 字符串与 `+` 一起使用时表示拼接。

### 4.4.2 一元运算符

- 一元正号 `+`、一元负号 `-`
- 自增 `++`、自减 `--`
- 前缀与后缀有区别：
  - `y = ++x;` 先加，再赋值
  - `y = x++;` 先赋值，再加

### 4.4.3 运算符优先级

1. 一元运算符：`+`、`-`、`++`、`--`
2. 乘除取余：`*`、`/`、`%`
3. 加减：`+`、`-`
- 同级从左到右，可用括号改变优先级。

### 4.4.4 比较运算符

`<`、`>`、`<=`、`>=`、`==`、`!=`  
结果都是 `true` 或 `false`。

### 4.4.5 逻辑运算符

- `&&` 与
- `||` 或
- `!` 非
  用于组合多个条件，操作数为布尔值。

---

## 4.5. Math 类

- `Math` 类位于 `java.lang`，所有方法都是 `static`。
- 直接通过 `Math.方法名(...)` 调用。
- 常量：`Math.PI`、`Math.E`。

常用方法：

- `abs(x)` 绝对值
- `sqrt(x)` 平方根
- `pow(x, y)` x 的 y 次方
- `exp(x)` e 的 x 次方
- `log(x)` 自然对数
- `log10(x)` 以 10 为底对数
- `ceil(x)` 向上取整
- `floor(x)` 向下取整
- `round(x)` 四舍五入
- `max(x, y)`、`min(x, y)`
- `sin(x)`、`cos(x)`、`tan(x)` 等三角函数

使用形式：

```java
变量 = Math.方法名(参数);
```

---

## 4.6. 其他重点

- **初始化**：Java 要求变量在使用前必须有确定的值，否则可能编译错误。
- **溢出 Overflow**：整数超过范围会回绕，如 `int` 最大值加 1 变成最小值。
- **总结**：本讲覆盖了变量、字面量、表达式、八种基本类型、String、类型转换、赋值、数学运算符、自增自减、比较运算符、逻辑运算符以及 Math 类。

---

# 5. 基础条件控制语句

## 5.1 三种基本流程控制

Java中有三种基本控制结构：

1. **顺序 Sequential**：语句从上到下依次执行，最常见、最直接。
2. **条件 Conditional / Decision**：根据条件判断，选择执行某条路径。
3. **循环 Loop / Iteration**：重复执行某段代码。

本讲重点是第二种：条件控制。

---

## 5.2 条件语句的定义

- 条件语句允许程序**有选择地执行代码**。
- 判断依据是一个**比较表达式**或更复杂的**逻辑表达式**。
- 当条件为 `true` 时，执行选定的代码块。
- 有些形式还允许：条件为 `true` 执行一段代码，为 `false` 执行另一段代码。

---

## 5.3 `if` 语句

### 语法

```java
if (condition) {
    // 条件为 true 时执行
}
// 条件为 false 时，这里照常执行
```

- 如果只有一条语句，可以省略大括号，但建议始终使用大括号。
- 条件为 `false` 时，`if` 块内的语句不会执行，但后面的语句继续执行。

### 例子

```java
if (grade >= 80)
    letter_grade = "A";
```

如果 `grade` 大于等于 80，则把 `letter_grade` 设为 `"A"`。

另一个例子：

```java
if (hours >= 24) {
    days = days + 1;
    hours = hours - 24;
}
```

### 想一想

```java
int score = 60;
if (score > 60) {
    System.out.println(score);
}
```

条件 `score > 60` 是 `false`，所以**什么都不会输出**。把 `>` 换成 `>=` 才会打印 60。

---

## 5.4 `if...else` 语句

### 语法

```java
if (condition) {
    // 条件为 true 时执行
} else {
    // 条件为 false 时执行
}
```

- 两个分支互斥，只会执行其中一个。
- 适合“二选一”的情况。

### 5.4.1 例子

**猜 PI 值**：

```java
if ((PI > 3.1414) && (PI < 3.1416)) {
    System.out.println("Very good!");
} else {
    System.out.println("Sorry, the answer is approximately 3.1415");
}
```

**求一元二次方程根**：

```java
D = Math.pow(b, 2) - 4 * a * c;
if (D < 0) {
    System.out.println("The roots are imaginary");
} else {
    r1 = (-b + Math.sqrt(D)) / (2 * a);
    r2 = (-b - Math.sqrt(D)) / (2 * a);
    System.out.printf("The roots are %.2f and %.2f%n", r1, r2);
}
```

判别式 `D < 0` 时无实根，否则用公式求根。

---

## 5.5 嵌套 `if`

- `if` 可以放在另一个 `if` 里面。
- 嵌套多个 `if` 相当于把所有条件用 `&&` 连接起来。
- 例如：

```java
if (X < Y)
    if (X < Z)
        if (X < A)
            X = 0;
```

只有 `X < Y && X < Z && X < A` 时，`X = 0` 才会执行。

### 5.5.1 `else` 的绑定问题

- `else` 默认与**最近的、未匹配的 `if`** 配对。
- 如果希望 `else` 属于外层 `if`，需要用大括号把内层 `if` 包起来。
- 例如：

```java
if (X < Y) {
    if (X < Z) {
        if (X < A)
            X = 0;
        else
            X = 1;
    }
}
```

这里的 `else` 属于 `if (X < A)`。

---

## 5.6 多分支与 `else if`

### 5.6.1 用多个独立 `if` 的问题

例如根据 `Day` 打印星期：

```java
if (Day == 1) System.out.println("Mon");
if (Day == 2) System.out.println("Tue");
...
if (Day == 7) System.out.println("Sun");
```

效率低，因为每个 `if` 都会判断一次。

### 5.6.2 改进：`else if` 链

```java
if (Day == 1)
    System.out.println("Mon");
else if (Day == 2)
    System.out.println("Tue");
else if (Day == 3)
    System.out.println("Wed");
...
else
    System.out.println("Out of Range");
```

一旦匹配成功，后面的条件不再判断，效率更高。

---

## 5.7 `switch-case` 语句

当需要在**多个相等条件**中选择时，`switch-case` 比 `if...else if` 更清晰。

### 5.7.1 语法

```java
switch (测试表达式) {
    case 值1:
        // 语句块
        break;
    case 值2:
        // 语句块
        break;
    ...
    default:
        // 默认语句块
}
```

### 5.7.2 要点

- 测试表达式可以是：`int`、`byte`、`short`、`char`，JDK 1.7 起也可以是 `String`。
- `case` 后面是**值**，不是条件。
- 每个 `case` 通常需要 `break`，否则会发生“贯穿 fall-through”，继续执行后面的 `case`。
- `default` 可选，用于处理所有未匹配的情况。

### 5.7.3 例子

```java
int number = 3;
switch (number) {
    case 1:
        System.out.println("ONE");
        break;
    case 2:
        System.out.println("TWO");
        break;
    case 3:
        System.out.println("THREE");
        break;
    default:
        System.err.println("OTHER");
}
```

另一个例子：根据运算符做算术运算。

```java
char operator = '*';
switch (operator) {
    case '+': result = num1 + num2; break;
    case '-': result = num1 - num2; break;
    case '*': result = num1 * num2; break;
    case '/': result = num1 / num2; break;
    default: System.out.println("Unknown operator");
}
```

---

# 6. 循环结构

循环用于重复执行一段代码，直到满足某个条件为止。

## 6.1 `while` 循环

**语法：**

```java
while (条件) {
    // 条件为 true 时重复执行
}
```

**特点：**

- 先判断条件，再执行循环体。
- 如果一开始条件就为 `false`，循环体一次也不会执行。
- 适合循环次数不确定、可能为 0 次的情况。

**示例：求 1 到 UPPERBOUND 的和**

```java
int sum = 0;
final int UPPERBOUND = 10;
int number = 1;
while (number <= UPPERBOUND) {
    sum += number;
    ++number;
}
System.out.println("Sum is: " + sum); // 55
```

**示例：输入直到用户输入 "Quit"**

```java
String a = "None";
while (!a.equals("Quit")) {
    System.out.println("Type a Name: ");
    a = scanner.nextLine();
    System.out.println("You wrote: " + a);
}
```

---

## 6.2 `do...while` 循环

**语法：**

```java
do {
    // 循环体
} while (条件);
```

**特点：**

- 先执行一次循环体，再判断条件。
- 循环体至少执行一次，即使条件一开始为 `false`。
- 条件在循环末尾检查。

**示例：求 1 到上界之和**

```java
int sum = 0;
final int UPPERBOUND = 10;
int number = 1;
do {
    sum += number;
    ++number;
} while (number <= UPPERBOUND);
System.out.println("Sum is: " + sum);
```

---

## 6.3 `for` 循环

**语法：**

```java
for (初始化; 布尔测试; 更新) {
    // 循环体
}
```

**执行流程：**

1. 执行初始化，只执行一次。
2. 判断布尔测试，为 `true` 则执行循环体。
3. 执行更新表达式。
4. 再次判断布尔测试，重复以上过程，直到测试为 `false`。

**特点：**

- 适合循环次数已知或可预先确定的情况。
- 初始化、条件、更新都可以省略，但分号不能省略。
- 循环变量通常声明在 `for` 内部，作用域仅限于循环内。

**示例：打印 1 到 5**

```java
for (int c = 1; c <= 5; c++) {
    System.out.println(c);
}
```

**示例：求 1 到 k 的和**

```java
int k = scanner.nextInt();
int sum = 0;
for (int i = 1; i <= k; i++) {
    sum = sum + i;
}
```

**示例：打印所有偶数到 10**

```java
for (int j = 2; j <= 10; j = j + 2) {
    System.out.println(j + " is an even number");
}
```

**示例：使用 `double` 作为计数器**

```java
for (double i = 0.0; i <= 10.0; i = i + 0.5) {
    System.out.println("i:" + i);
}
```

---

## 6.4 `for-each` 循环

JDK 5 引入，用于遍历数组或集合。

**语法：**

```java
for (类型 变量 : 数组或集合) {
    // 使用变量
}
```

**示例：**

```java
int[] numbers = {2, 1, 2, 6, 3};
for (int number : numbers) {
    System.out.println(number);
}
```

---

## 6.5 嵌套循环

一个循环内部可以再包含另一个循环。

**示例：**

```java
for (int j = 1; j <= 3; j++) {
    System.out.println("** " + j + " **");
    for (int i = 1; i <= j; i++) {
        System.out.println(j + "\t" + i);
    }
}
```

---

## 6.6 `break` 语句

用于立即退出当前循环。

**示例：**

```java
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println("i: " + i);
}
System.out.println("Loop terminated.");
```

---

## 6.7 无限循环

如果 `for` 循环的条件永远为 `true`，或者省略条件，就会形成无限循环。

**示例：**

```java
for (int i = 5; i > 4; i++) {
    System.out.println("Value of i: " + i);
}
```

也可以用：

```java
for (;;) {
    // 无限循环
}
```

---

## 6.8 循环控制变量与布尔标志

- `for` 循环中声明的索引变量只在循环内有效，循环结束后销毁。
- `while` / `do...while` 中使用的索引变量通常在循环外声明，循环结束后仍可访问。
- 除了索引变量，还可以用布尔标志控制循环。

**布尔标志示例：**

```java
boolean gameOver = false;
while (!gameOver) {
    // 游戏逻辑
    if (某些条件) {
        gameOver = true;
    }
}
```

---

## 6.9 循环选择对比

| 循环类型     | 判断时机 | 最少执行次数 | 适用场景               |
| ------------ | -------- | ------------ | ---------------------- |
| `while`      | 先判断   | 0 次         | 次数不确定，可能不执行 |
| `do...while` | 后判断   | 1 次         | 至少执行一次           |
| `for`        | 先判断   | 0 次         | 次数固定或已知         |
| `for-each`   | 遍历     | 取决于集合   | 数组、集合遍历         |

原则上，任何 `while` 循环都可以转换为 `for` 循环。

---

# 7. 随机数生成

## 7.1 使用 `Random` 类

`Random` 类位于 `java.util` 包中，可以生成 `int`、`double`、`float` 等类型的随机值。

**常用方法：**

- `nextInt()`：生成一个随机整数，范围是 `int` 的全部可能值。
- `nextInt(N)`：生成 `0`（含）到 `N`（不含）之间的随机整数。
- `nextDouble()`：生成 `[0.0, 1.0)` 之间的随机 `double`。
- `nextFloat()`：生成 `[0.0, 1.0)` 之间的随机 `float`。

**示例：**

```java
import java.util.Random;

Random rand = new Random();
int randomInt = rand.nextInt();
int randomIntInRange = rand.nextInt(100); // 0 到 99
double randomDouble = rand.nextDouble(); // 0.0 到 1.0
```

**生成指定范围的 `double`：**

```java
double lowerBound = 5.0;
double upperBound = 10.0;
double randomValue = lowerBound + (upperBound - lowerBound) * rand.nextDouble();
```

---

## 7.2  使用 `Math.random()`

`Math.random()` 返回 `[0.0, 1.0)` 之间的 `double`。

**示例：**

```java
double randomDouble = Math.random(); // 0.0 到 1.0
int randomIntInRange = (int)(Math.random() * 100); // 0 到 99
```

---

# 8. 类与对象基础

## 8.1  类与对象的概念

- 类是对象的蓝图或模板。
- 对象是类的一个实例，使用 `new` 关键字创建。
- 例如：

```java
Random rand = new Random();
```

这里 `Random` 是类，`rand` 是对象变量，它引用一个 `Random` 实例。

- 类可以表示概念、分类或单例事物，如 `Math`、`Console`。
- 对象可以拥有属性来存储信息，同一个类的不同对象可以有不同的属性值。
- 类可以有方法：
  - 静态方法：属于类，通过类名调用。
  - 非静态方法：属于对象，必须先创建对象，再通过对象调用。

## 8.2  静态方法与非静态方法的区别

- `Math.sqrt(2)`：`sqrt` 是静态方法，直接通过类名 `Math` 调用。
- `rand.nextInt()`：`nextInt` 是非静态方法，必须先创建 `Random` 对象，再通过对象变量调用。

```java
Random rand = new Random();
int randomInt = rand.nextInt();
```

---

## 8.3 访问修饰符

访问修饰符控制类、方法、字段的可见性。

| 修饰符         | 同类 | 同包子类 | 同包非子类 | 不同包子类 | 不同包非子类 |
| -------------- | ---- | -------- | ---------- | ---------- | ------------ |
| `public`       | 是   | 是       | 是         | 是         | 是           |
| `protected`    | 是   | 是       | 是         | 是         | 否           |
| 默认（包私有） | 是   | 是       | 是         | 否         | 否           |
| `private`      | 是   | 否       | 否         | 否         | 否           |

说明：

- 类级别：`public` 类可被任何其他类访问；默认类只能被同包访问；`protected` 和 `private` 不适用于顶层类。
- 成员级别：
  - `public`：任何类都可访问。
  - `protected`：同包及子类可访问。
  - 默认：同包可访问。
  - `private`：仅本类可访问。

---

## 8.4  非访问修饰符 `static`

- 不加 `static`：成员基于实例，必须先有对象，代码中可自动访问实例成员和静态成员。
- 加 `static`：成员不基于实例，无需创建对象即可调用；代码中只能自动访问静态成员。
- `public static`：表示该静态方法可被外部调用者访问。

---

# 9.字符串基础

- **字符串**是一系列字符的集合，使用双引号表示，如 `"Hello"`。

- 字符串可以声明为变量：

  ```java
  String country;
  ```

- **字符串不可变**：一旦创建了 `String` 对象，它的内容就不能被修改。任何看似修改字符串的操作，实际上都会创建一个新的 `String` 对象。

- 字符串字面量本身也是对象，可以不声明变量直接用，比如 `"Hello".length()` 直接就能拿到 5。

---

## 9.1 字符串连接

- 使用 `+` 运算符可以将两个字符串连接起来：

  ```java
  "Hello, " + "world"  // 结果是 "Hello, world"
  ```

- 也可以使用 `concat(String)` 方法：

  ```java
  String str1 = "Hello, ";
  String str2 = "world";
  System.out.println(str1.concat(str2)); // Hello, world
  ```

---

## 9.2 常用字符串方法

### 9.2.1 `length()`

返回字符串的长度（字符个数）。

```java
String s = "666";
System.out.println(s.length()); // 3
```

### 9.2.2 `trim()`

去除字符串开头和结尾的空白字符，不处理中间的空格。

```java
String s = " abc ";
System.out.println(s.trim()); // "abc"
```

### 9.2.3 `substring(int beginIndex, int endIndex)`

返回从 `beginIndex` 到 `endIndex - 1` 的子串。如果只给一个参数，则从该索引一直到末尾。

```java
String s = "fundamental";
System.out.println(s.substring(4, 7)); // "ame"
System.out.println(s.substring(0));    // "fundamental"
```

### 9.2.4 `equals(String)`

比较两个字符串的内容是否完全相同，返回 `true` 或 `false`。

```java
String s = "abc";
String r = "xyz";
System.out.println(s.equals(r));     // false
System.out.println(s.equals("abc")); // true
```

### 9.2.5`compareTo(String)`

按字典序（Unicode 值）比较两个字符串：

- 若当前字符串大于参数，返回正数；
- 若小于参数，返回负数；
- 若相等，返回 0。
- 区分大小写，且短字符串是长字符串的前缀时，短字符串被认为更小。

```java
"apple".compareTo("banana"); // 负数
"apple".compareTo("apple");  // 0
"apple".compareTo("Apple");  // 正数
"apple".compareTo("apples"); // 负数
```

### 9.2.6 `toLowerCase()` 与 `toUpperCase()`

将字符串全部转换为小写或大写。

```java
String s = "A Nice Dog";
System.out.println(s.toLowerCase()); // a nice dog
System.out.println(s.toUpperCase()); // A NICE DOG
```

### 9.2.7`split(String regex)`

根据指定的正则表达式将字符串分割成字符串数组。

```java
String authors = "Alice, Bob, Carol";
String[] authorsList = authors.split(",");
// authorsList[0] = "Alice"
// authorsList[1] = " Bob"
// authorsList[2] = " Carol"
```

### 9.2.8 `contains(CharSequence s)`

检查字符串是否包含指定的字符序列，返回 `true` 或 `false`。
如果参数为 `null`，会抛出 `NullPointerException`。

```java
"Hello, World!".contains("Hello"); // true
"Hello, World!".contains("Java");  // false
```

### 9.2.9 `charAt(int index)`

返回指定索引处的字符。索引从 0 开始，到 `length() - 1` 结束。

```java
String str = "Police";
System.out.println(str.charAt(0)); // 'P'
System.out.println(str.charAt(2)); // 'l'
```

### 9.2.10 `replace(char oldChar, char newChar)` 与 `replace(CharSequence target, CharSequence replacement)`

将字符串中指定的字符或字符序列替换为新的字符或序列。

```java
"Hello, World!".replace('o', '0');          // "Hell0, W0rld!"
"Hello, World!".replace("World", "Java");   // "Hello, Java!"
```

---

## 9.3 StringBuffer 类（可选）

- `StringBuffer` 用于创建**可变的字符串对象**，内容可以修改。
- 与 `String` 不同，`StringBuffer` 修改后不会创建新对象。

### 9.3.1 构造方法

- `StringBuffer()`：创建空缓冲区，初始容量 16。
- `StringBuffer(String str)`：用指定字符串初始化。
- `StringBuffer(int capacity)`：指定初始容量。

```java
StringBuffer srb1 = new StringBuffer();
StringBuffer srb2 = new StringBuffer("This is a StringBuffer");
StringBuffer srb3 = new StringBuffer(12);
```

### 9.3.2 常用方法

- `append(String str)`：追加字符串。
- `insert(int offset, String str)`：在指定位置插入字符串。
- `replace(int beginIndex, int endIndex, String str)`：替换指定范围的子串。
- `delete(int beginIndex, int endIndex)`：删除指定范围的子串。
- `reverse()`：反转字符串。

```java
StringBuffer sbr = new StringBuffer("Hello ");
sbr.append("Java");                // "Hello Java"
sbr.insert(6, "welcome to ");      // "Hello welcome to Java"
sbr.delete(0, 6);                  // "welcome to Java"
```

---

## 9.4 字符串与字符

- `String` 存储零个或多个字符，用双引号，如 `"abc"`。

- `char` 存储**单个字符**，用单引号，如 `'a'`。

- `s.charAt(3)` 返回 `char` 类型，`s.substring(3, 4)` 返回 `String` 类型，但内容可能相同。

  ```java
  String s = "Hello";
  char c = s.charAt(3);           // 'l'
  String sub = s.substring(3, 4); // "l"
  ```

- 字符串中的字符可以单独读取，但不能直接修改，因为 `String` 不可变。如果需要修改字符，可以使用 `StringBuffer`。

### 9.4.1 char 的整数特性

- `char` 可以隐式转换为 `int`，也可以参与算术运算。
- 字符在计算机内部以数值形式存储（Unicode 码点）。

```java
char x = 'a';
System.out.println(x);        // a
int y = x;
System.out.println(y);        // 97
System.out.println((char) y); // a
System.out.println('9' - '0'); // 9
System.out.println('z' - 'a'); // 25
```

---

# 10. 数组的概念

- 数组用于存储**同一类型**的多个值，这些值在内存中**连续存放**。
- 数组通过**索引**访问元素，索引从 `0` 开始，到 `长度 - 1` 结束。
- 使用索引变量可以方便地表示一组相关的数据，例如：
  - `Sales[Month]` 表示各月销售额；
  - `Marks[Student][Subject]` 表示学生各科成绩，是一个二维数组。

**为什么使用数组：**

- 用一个变量名加不同索引代替多个独立变量，便于统一管理和循环处理。
- 计算机为数组分配连续内存，通过起始地址和偏移量定位元素。

---

## 10.1一维数组

### 10.1.1  声明与实例化

Java 数组的声明方式有三种写法，推荐第一种：

```java
int[] marks;        // 推荐
int []grade;
int gpa[];
```

实例化数组需要指定大小：

```java
marks = new int[5];  // 长度为 5，索引 0 到 4
```

也可以声明和实例化合并：

```java
int[] marks = new int[5];
```

### 10.1.2 初始化

可以在声明时直接给出初始值，此时不需要指定长度：

```java
int[] A = new int[] {12, 3, 8, 45, 2};
double[] E = new double[] {10.0, 5.3, 6.9, 0.0, 2};
String[] EmpName = new String[] {"Chris", "John", "Sabina"};
```

也可以简写为：

```java
int[] A = {12, 3, 8, 45, 2};
```

注意：如果已经写了初始化列表，就不能再在 `new` 中指定长度，例如 `new int[5]{1,2,3,4,5}` 是错误的。

### 10.1.3 访问与修改

通过索引访问和赋值：

```java
marks[0] = 35;
int first = marks[0];
```

数组长度用 `length` 属性获取，不是方法：

```java
for (int i = 0; i < marks.length; i++) {
    System.out.println(marks[i]);
}
```

### 10.1.4 数组的特性

- 数组是**对象**，具有 `length` 属性。

- 数组可以存储**基本类型**（`int`、`char`、`double` 等）或**对象**（如 `String`）。

- 数组一旦创建，**长度固定**，不能改变。

- **匿名数组**：创建数组但不赋给变量，常用于直接传递给方法：

  ```java
  printArray(new int[]{1, 2, 3, 4, 5});
  ```

### 10.1.5 示例：存储学生姓名和成绩

```java
int[] Marks = new int[3];
String[] StudentName = new String[3];

StudentName[0] = "Chris";
StudentName[1] = "John";
StudentName[2] = "Sabina";

Marks[0] = 35;
Marks[1] = 82;
Marks[2] = 67;

double ClassAvg = (Marks[0] + Marks[1] + Marks[2]) / 3.0;

for (int i = 0; i <= 2; i++) {
    System.out.println(i + "\t" + StudentName[i] + "\t" + Marks[i]);
}
System.out.println("Average Marks for Class is " + ClassAvg);
```

---

## 10.2 多维数组

### 10.2.1  二维数组的声明与实例化

```java
double[][] Marks;
Marks = new double[5][6];   // 5 行 6 列
```

也可以合并：

```java
double[][] Marks = new double[5][6];
```

### 10.2.2 初始化

方式一：先实例化，再逐个赋值。

```java
int[][] Marks = new int[3][2];
Marks[0][0] = 35;
Marks[0][1] = 82;
// ...
```

方式二：声明、实例化、初始化一次完成。

```java
int[][] Marks = new int[][] {
    {35, 82},
    {67, 45},
    {62, 77}
};
```

简写：

```java
int[][] Marks = {
    {35, 82},
    {67, 45},
    {62, 77}
};
```

### 10.2.3 访问与长度

- `array.length` 返回第一维的长度，即行数。
- `array[i].length` 返回第 `i` 行的列数。

```java
int[][] twoDimArray = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println("Number of rows: " + twoDimArray.length);       // 3
System.out.println("Length of first row: " + twoDimArray[0].length); // 3
```

### 10.2.4 锯齿数组

Java 的多维数组本质是“数组的数组”，每一行的长度可以不同。

```java
int[][] jagged = new int[3][];
jagged[0] = new int[2];
jagged[1] = new int[4];
jagged[2] = new int[3];
```

---

## 10.3 选择排序算法

选择排序的基本思想：每一轮从未排序部分中选出最小元素，放到已排序部分的末尾。

### 10.3.1 简化版选择排序

- 从第一个元素开始，假设它是最小的。
- 与后面所有元素比较，如果发现更小的，就交换。
- 一轮结束后，第一个位置就是当前最小值。
- 对第二个、第三个位置重复，直到整个数组有序。

### 10.3.2 优化版选择排序

- 每一轮只记录最小元素的**索引**，不立即交换。
- 一轮结束后，再将最小元素与当前位置交换。
- 减少交换次数，效率更高。

### 10.3.3 伪代码

```text
for i = 从数组开头到末尾
    寻找最小元素，并记录其索引
    for j = i 到数组末尾
        if (第 i 个元素 > 第 j 个元素) then
            记录 j 为当前最小索引
    end for
    交换第 i 个元素与最小索引处的元素
end for
```

### 10.3.4 排序过程示例

以数组 `[3, 2, 1, 4, 0, 5]` 为例：

- 第 1 轮：找到最小值 `0`，与第一个元素 `3` 交换，得到 `[0, 2, 1, 4, 3, 5]`。
- 第 2 轮：在剩余部分找到最小值 `1`，与第二个元素 `2` 交换，得到 `[0, 1, 2, 4, 3, 5]`。
- 第 3 轮：`2` 已在正确位置，无需交换。
- 第 4 轮：找到 `3`，与第四个元素 `4` 交换，得到 `[0, 1, 2, 3, 4, 5]`。
- 第 5 轮：数组已有序。

---

# 11 模块化编程

## 11.1程序设计方式的发展

### 11.1.1 非结构化编程

- 程序只有一个主程序，数据通常是全局的。
- 缺点：
  - 相同语句序列需要重复复制。
  - 出错时每个副本都要修改，维护困难。
  - 只适合非常小的程序。

### 11.1.2 过程式编程

- 把重复的语句序列提取为过程，并给过程命名。
- 通过过程调用执行，执行完后回到调用位置继续。
- 可以带参数，也可以有子过程。
- 程序可看作一系列过程调用，数据在过程间传递。
- 缺点：
  - 函数可重用性较差。
  - 函数容易依赖全局变量和其他函数，封装性不足。

### 11.1.3 模块化编程

- 把功能相近的过程组织到独立模块中。
- 程序由多个较小部分组成，模块之间通过过程调用交互。
- 主程序负责协调调用，并传递适当数据。
- 每个模块可以有自己的数据，维护内部状态。
- 但每个模块只有一个状态，且在整个程序中最多存在一次。

### 11.1.4 面向对象编程

- 使用类和对象来设计程序。
- 以对象为基本单位，关注用户感知的组件。
- 把数据和操作数据的方法放在一起。
- 优点：
  - 更易于软件设计，可以用高层概念思考问题。
  - 更易于维护、测试、调试。
  - 可重用已有代码，避免重复造轮子。

---

## 11.2 类与对象

### 11.2.1 对象

- 对象是拥有状态和行为的实体。
- 可以是物理的，如椅子、汽车；也可以是逻辑的，如银行系统。

### 11.2.2 类

- 类是创建对象的模板或蓝图。
- 对象是类的一个实例。
- 例如：定义 `Book` 类，就可以创建出《代码大全》《重构》等一个个对象。

### 11.2.3 类的组成

- **名称**：标识类。
- **变量**：属性、状态、字段。
- **方法**：行为、功能、操作。

示例：

- `Book` 类：变量 `title`、`price`，方法 `getTitle()`、`getPrice()`。
- `Car` 类：变量 `brand`、`model`、`year`，方法 `displayInfo()`。

### 11.2.4 类定义语法

```java
public class Book {
    String title;
    double price;

    String getTitle() {
        // ...
    }

    double getPrice() {
        // ...
    }
}
```

`public` 是访问控制修饰符。

---

## 11.3 方法

### 11.3.1 方法的概念

- 方法相当于传统语言中的函数。
- 方法声明指定调用时执行的代码。
- 调用方法时，控制流跳转到方法内部执行，执行完返回调用处继续。
- 方法可以返回值，也可以不返回值。

### 11.3.2 标准库方法与用户定义方法

- 标准库方法：Java 类库中已定义的方法，如 `length()`、`equals()`、`compareTo()`、`sqrt()`。
- 用户定义方法：程序员根据需求自己编写的方法。

### 11.3.3 方法声明结构

```java
<访问修饰符> <返回类型> <方法名>(参数列表) {
    // 方法体
    return 值;
}
```

- **访问修饰符**：如 `public`、`private`、`protected`、默认。
- **返回类型**：方法返回的数据类型；不返回值时用 `void`。
- **方法名**：遵循 Java 命名规范，通常小写开头，多词用驼峰，如 `areaOfCircle()`。
- **参数列表**：逗号分隔，包含类型和变量名；无参数则留空。
- **方法签名**：方法名 + 参数列表。

### 11.3.4 方法体与 `return`

- 方法体放在花括号 `{}` 中。
- 方法体包含程序逻辑，可看作一个小程序。
- `return` 标记方法逻辑结束，并返回一个值。
- 返回值类型必须与方法头声明的返回类型一致。
- 若返回类型为 `void`，可以写 `return;` 或不写。
- 建议把 `return` 放在方法末尾，结构更清晰。

### 11.3.5 示例：判断奇偶

方式一：

```java
public static String numberType(int num) {
    if (num % 2 == 0) {
        return "Even";
    } else {
        return "Odd";
    }
}
```

方式二：

```java
public static String numberType(int num) {
    String s = "";
    if (num % 2 == 0) {
        s = "Even";
    } else {
        s = "Odd";
    }
    return s;
}
```

方式一效率较高，但多个出口；方式二结构更清晰，推荐使用。

### 11.3.6 示例：`void` 方法

```java
public static void centredPrint(String s) {
    int totLen = ((80 - s.length()) / 2) + s.length();
    String r = String.format("%" + totLen + "s", s);
    System.out.println(r);
}
```

该方法居中打印字符串，不返回值。

---

## 11.4 方法的调用

- 方法通常从另一个方法中调用，最常见的是从 `main` 方法调用。

- 静态方法调用形式：

  ```java
  ClassName.MethodName(args)
  ```

- 如果调用同类中的方法，可以省略类名：

  ```java
  MethodName(args)
  ```

- 方法返回值可用于：

  - 赋给变量；
  - 作为表达式的一部分；
  - 作为另一个方法的参数。

- `void` 方法通常作为独立语句调用。

示例：

```java
public class MyFirstProgram {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            System.out.println(i + "\t" + numberType(i));
        }
    }

    public static String numberType(int num) {
        if (num % 2 == 0)
            return "Even";
        else
            return "Odd";
    }
}
```

---

## 11.5 参数传递

### 11.5.1 基本数据类型

- 传递的是值的副本。
- 方法内修改参数，不影响原变量。

```java
public static void modifyPrimitive(int num) {
    num = 20;
}
```

调用后原变量仍为原值。

### 11.5.2 引用数据类型

- 传递的是对象的引用。
- 方法内修改对象内容，会影响原对象。
- 常见引用类型：类、接口、数组、字符串、集合、枚举。

```java
public static void modifyArray(int[] array) {
    if (array.length > 0) {
        array[0] = 99;
    }
}
```

原数组第一个元素会被修改。

---

## 11.6 变量作用域

变量只在特定区域内可见，这个区域称为作用域。

### 11.6.1 局部变量

- 在方法、构造器或代码块内声明。
- 只在声明它的块内可访问。
- 使用后离开作用域，内存释放。
- 使用前必须初始化，否则编译错误。

### 11.6.2  实例变量

- 在类内、方法外声明。
- 类的所有方法都可访问。
- 属于对象实例。
- 有默认值：
  - 数值类型为 `0`；
  - `boolean` 为 `false`；
  - 对象引用为 `null`。
- 实例销毁前一直保留值。

### 11.6.3  类变量（静态变量）

- 用 `static` 声明，在类内、方法外。
- 属于类，不属于某个实例。
- 所有实例共享。
- 可通过类名访问。
- 也有默认值，程序结束前一直保留。

### 11.6.4  方法参数

- 调用方法时传入的变量。
- 作用域限于所在方法，属于局部变量。

---

## 11.7 面向对象示例：Car 类

```java
class Car {
    String brand;
    String model;
    int year;

    public void displayInfo() {
        System.out.println("车型：" + brand + " " + model + "（" + year + " 年）");
    }

    public static void main(String[] args) {
        Car car1 = new Car();
        car1.brand = "BYD";
        car1.model = "Seal";
        car1.year = 2023;

        Car car2 = new Car();
        car2.brand = "Volvo";
        car2.model = "XC40";
        car2.year = 2021;

        car1.displayInfo();
        car2.displayInfo();
    }
}
```

- `Car` 是类，包含实例变量和方法。
- `car1`、`car2` 是 `Car` 的对象。
- 每个对象有自己的属性值。
- 通过对象调用方法：`car1.displayInfo()`。

---

## 11.8 补充：基本类型与引用类型

- **基本类型**：`boolean`、`byte`、`short`、`int`、`long`、`float`、`double`、`char`。
- **引用类型**：类、接口、数组、枚举等。
- 引用类型存储的是对象的地址或引用。

### 11.8.1 工具类

- Java 中的“utility”通常指工具类。
- 工具类提供一组静态方法，用于常见任务。
- 例如字符串操作、数学运算、输入输出等。
- 工具类封装可重用代码，不属于特定对象实例。

---

## 11.9 核心要点

- 模块化编程把程序分解为多个模块，便于管理和重用。
- 面向对象编程以类和对象为基础，类封装数据和方法。
- 方法是组织程序、实现代码复用的基本单位。
- 方法由方法头和方法体组成，可返回值或 `void`。
- 静态方法通过类名调用，同类中可省略类名。
- 基本类型传值，引用类型传引用。
- 变量作用域决定变量的可见范围，包括局部变量、实例变量、类变量和方法参数。
- 合理使用方法、类和对象，可以写出结构清晰、易维护、可重用的程序。
