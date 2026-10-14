---
title: Java 面向对象笔记：类、继承、多态与异常
description: 学习 Java 面向对象编程时的个人笔记：类与对象、封装与访问修饰符、继承与多态、集合、抽象类与接口、异常处理。示例代码均为自写，运行结果来自本地实测。
date: 2026-10-06
category: 学习
tags:
    - Java
    - 面向对象
    - 学习笔记
series: Java 学习笔记
seriesOrder: 2
---

> 这是一份个人学习笔记：概念部分是我按自己的理解写的，示例代码也都是自己写的，输出结果是本地跑出来的。参考主要是 Oracle 的 Java 官方文档和语言规范，理解有偏差的地方欢迎指出。

# 0 知识回顾

## 0.0 数据类型（Data Type）

每个 variable（变量）都具有 data type（数据类型），该类型决定了变量可包含的值（values）以及可执行的操作（operations）。不同类型之间不能随意赋值或操作，例如不能将字符串赋值给 int，也不能对 String 使用 `++`。

```java
int number = 10; 
number++; // 合法
String course = "java"; 
course = course.toUpperCase(); // 合法
```

### 0.0.0 基本数据类型（Primitive Type）

存储 real values（真实值）。共有8种：`byte`, `short`, `int`, `long`, `float`, `double`, `bool`, `char`。

```java
int number1 = 10;
double number2 = 2.1;
```

### 0.0.1 引用数据类型（Reference Type）

存储 references（引用），而非真实值。`String` 和所有 objects（对象）都属于引用类型。

```java
String str1 = "dog";
String str2 = "cat";
```

## 0.1 赋值（Assignment）

### 0.1.0 基本数据类型的赋值

使用 operator `=` 时，会直接复制变量的真实值。

```java
int num1 = 5;
int num2 = 12;
num2 = num1; // num2 变为 5，num1 保持 5
```

### 0.1.1 引用数据类型的赋值

使用 operator `=` 时，复制的是 references（引用），而非对象的值。

```java
Book book1 = new Book("Java 编程思想", "Bruce Eckel");
Book book2 = new Book("代码大全", "Steve McConnell");
book2 = book1; // book2 和 book1 指向同一个 Book 对象
```

## 0.2 对象实例化与访问

使用关键字 `new` 来 instantiate（实例化） objects（对象）。通常需要一个 reference variable（引用变量）来指向该对象，并通过该变量来访问对象。

```java
Book myBook = new Book();
System.out.println(myBook.getTitle());
```

## 0.3 别名（Alias）与内存分析

当多个 references（引用）指向同一个 object（对象）时，这些引用被称为该对象的 alias（别名）。通过任何一个 alias（别名）修改对象的 state（状态），都会影响其他所有别名。

```java
Book book1 = new Book("Java 编程思想");
Book book2 = new Book("代码大全");
book2 = book1;
book2.setTitle("重构");
System.out.println(book1.getTitle()); // 输出 "重构"
System.out.println(book2.getTitle()); // 输出 "重构"
```

失去所有引用的对象（如原名为「代码大全」的那个 Book 对象）将成为 garbage（垃圾），由 Garbage Collector（垃圾回收器）自动回收。

---

# 1 类与对象

## 1.0 初识面向对象（Introduction to OOP）

- Object-Oriented Programming (OOP，面向对象编程) 是建立在 Classes (类) 和 Objects (对象) 概念上的 Programming Paradigm (编程范式)，而非 Functions (函数)。
- OOP 中 Classes 和 Objects 用于 Model Real-World Entities (建模现实世界实体)。
- Object (对象) 由 Data (数据，定义 State 状态) 和 Methods (方法，定义 Behavior 行为) 组成。
- OOP 最早用于 Simulation Programs (仿真程序)，如 Simula, 1967。

## 1.1 类与对象（Classes and Objects）

- Class (类) 是建模 Real-World Entity (现实世界实体) 的 Blueprint (蓝图)。
- Class 定义 Object 的 Attributes (属性/数据) 和 Methods (方法/行为) 以操作这些 Attributes。
- Object (对象) 是 Class 的 Instance (实例)。
- 示例：Book 类有 Attributes `title`, `author`；Methods `info()`, `borrow()`。
- Book 类定义 Attributes `title`, `author`, `pages`, `price`；Method `info()`。
- 《Java 编程思想》《代码大全》《重构》这些具体书目，就是这个类的 Object。
- Objects 存储各自 Unique Data (唯一数据)，但 Share (共享) Class 的 Methods。

```java
public class Book {
    String title = "Java 编程思想";
    String author = "Bruce Eckel";
    int pages = 850;
    double price = 108.0;

    public void info() {
        System.out.println("书名：" + title);
        System.out.println("作者：" + author);
        System.out.println("页数：" + pages);
        System.out.println("定价：" + price);
    }
}
```

## 1.2 Java 程序结构（Java Program Structure）

- 每个 Java Console Program (控制台程序) 都有 Main Method (主方法)，作为 Execution (执行) 的 Entry Point (入口点)。
- Main Method 通常位于名为 Program 的 Class 中。
- 每个 Java Class 位于独立文件中，Classname 与 Filename (以 `.java` 结尾) 必须相同。
- `.java` 文件编译为 `.class` 文件。
- 编译：`javac *.java`；运行：`java Program`。
- `args` Array 包含程序的 Inputs (输入)。

```java
public class Program {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

## 1.3 使用 Book 类

- 从 Book Class Instantiate (实例化) 一个 Book Object，然后调用其 Methods。

```java
public class Program {
    public static void main(String[] args) {
        Book firstBook = new Book();
        firstBook.info();
    }
}
```

输出：

```text
书名：Java 编程思想
作者：Bruce Eckel
页数：850
定价：108.0
```

## 1.4 设计练习：先从需求里找出「类」

- 拿到一个需求，先把里面的名词列出来，它们通常就是候选的 Class (类)，比如账单、会员、购物车。
- 再给每个类定下它的 Attributes (属性) 和 Methods (方法)，然后造两个具体的 Object (对象) 出来验证设计是否说得通。
- Java Class Name 规则：
  - 不能有 Spaces (空格)。
  - 多词名称每个词首字母大写，如 `MyClassName`。
  - 使用 Descriptive Names (描述性名称)，如 `Customer` 而非 `C` 或 `temp`。
  - 不能与 Keywords/Reserved Words (关键字/保留字) 匹配。
  - 公开类必须与 Java File Name 相同。
  - 示例：`Order`, `OrderSummary`, `Order_Summary`。

## 1.5 构造器（Constructor）

- Constructor (构造器/构造方法) 是与 Class 同名的方法，在 Object-Instantiation (对象实例化) 时第一个自动执行。
- Constructor 可接受 Inputs 来初始化 Object。
- 下面这个 Book 类用 Constructor 设置 Instance Variables (实例变量)。

```java
public class Book {
    private String title;
    private String author;
    private int pages;
    private double price;

    public Book(String title, String author, int pages, double price) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.price = price;
    }

    public void info() {
        System.out.println("书名：" + title);
        System.out.println("作者：" + author);
        System.out.println("页数：" + pages);
        System.out.println("定价：" + price);
    }
}
```

使用：

```java
Book b1 = new Book("Java 编程思想", "Bruce Eckel", 850, 108.0);
Book b2 = new Book("代码大全", "Steve McConnell", 900, 128.0);
Book b3 = new Book("重构", "Martin Fowler", 448, 89.0);
Book b4 = new Book("深入理解 Java 虚拟机", "周志明", 520, 129.0);

b1.info();
b2.info();
b3.info();
b4.info();
```

## 1.6 组合（Composition）

- Composition (组合) 指一个 Class 包含 Objects 作为 Instance Variables (实例变量)。
- Class 可通过这些 Objects 的 Public Attributes 和 Methods 进行交互。
- 下面这个 Bookshelf 类就把 4 个 Book Object 当作自己的 Instance Variables。

```java
public class Bookshelf {
    private Book top;
    private Book second;
    private Book third;
    private Book bottom;

    public Bookshelf(Book top, Book second, Book third, Book bottom) {
        this.top = top;
        this.second = second;
        this.third = third;
        this.bottom = bottom;
    }

    public void listAll() {
        System.out.println("这一格书架上的书：");
        top.info();
        second.info();
        third.info();
        bottom.info();
    }
}
```

## 1.7 作用域（Scope）

- Scope (作用域) 是 Variable (变量) 的 Visibility (可见性)，由声明位置决定。
- Local Variable (局部变量) 在 Method 中声明，仅对该 Method 可见。
- Instance Variable (实例变量) 在 Class 中声明，对该 Class 的所有 Methods 可见。

```java
public class Counter {
    private String label = "总计数器";

    public void increaseByTen() {
        int step = 10; // local variable：只在这个方法里存在
        System.out.println("step = " + step);
        System.out.println("label = " + label);
    }

    public void increaseByTwenty() {
        int step = 20; // 另一个方法里的局部变量，与上面互不相干
        System.out.println("step = " + step);
        System.out.println("label = " + label);
    }
}
```

## 1.8 作用域里的就近原则（Proximity）

- 在 Block of Code (代码块) 内，Variable Names 必须唯一。
- Block 位于 `{` 和 `}` 之间，总是看到 Nearest (最近的) Variable。
- Local Variable 会 Overshadow (遮蔽) 同名的 Instance Variable。

```java
public class Shadow {
    private String label = "实例属性";

    public void shadowed() {
        String label = "局部变量"; // local variable：遮蔽了同名的实例属性
        System.out.println("label = " + label);
    }

    public void notShadowed() {
        System.out.println("label = " + label);
    }
}
```

输出：

```text
label = 局部变量
label = 实例属性
```

## 1.9 this 关键字

- `this` Keyword (this 关键字) 引用 Current Object (当前对象)，用于访问该 Object 中的 Instance Variables。
- 可用于访问被 Local Variable 遮蔽的 Instance Variable。

```java
public class ThisDemo {
    private String label = "实例属性";

    public void withThis() {
        String label = "局部变量";
        System.out.println("label = " + this.label); // this.label 明确指向实例属性
    }

    public void withoutThis() {
        System.out.println("label = " + label);
    }
}
```

输出：

```text
label = 实例属性
label = 实例属性
```

## 1.10 动手示例：给一盏台灯建模

- 需求：一盏台灯，有颜色，有开和关两种状态。
  - Attributes：`color` (String)，`isOn` (boolean)。
  - Methods：`turnOn()`, `turnOff()`, `getColor()`, `isOn()`。
  - Constructor 接受一个颜色字符串（如 `"white"`）。

```java
public class DeskLamp {
    private boolean isOn;
    public String color;

    public DeskLamp(String color) {
        isOn = false;
        this.color = color;
    }

    public String getColor() {
        return color;
    }

    public boolean isOn() {
        return isOn;
    }

    public void turnOn() {
        if (!isOn())
            isOn = true;
    }

    public void turnOff() {
        if (isOn())
            isOn = false;
    }
}
```

使用：

```java
public class Program_DeskLamp {
    public static void main(String[] args) {
        DeskLamp readingLamp = new DeskLamp("white");

        System.out.println("台灯颜色：" + readingLamp.getColor());

        readingLamp.turnOn();
        System.out.println("台灯状态：" + (readingLamp.isOn() ? "开" : "关"));

        readingLamp.turnOff();
        System.out.println("台灯状态：" + (readingLamp.isOn() ? "开" : "关"));
    }
}
```

输出：

```text
台灯颜色：white
台灯状态：开
台灯状态：关
```

---

# 2 访问修饰符与包

## 2.0 访问修饰符（Access Modifiers）

- 控制外部对 Class（类）的 Attributes（属性）和 Methods（方法）的访问。
- 在 Class 内部无效果。
- 三种：`public`, `private`, `protected`。

### 2.0.0 公有访问修饰符（public）

- 访问级别为 everywhere（任何地方）。
- 可修饰 classes, methods, fields。
- 在类内、类外、包内、包外均可访问。

```java
public class MyClass {
    public int number; // 外部可读写
    public void display() { // 外部可调用
        System.out.println(number);
    }
}
```

### 2.0.1 私有访问修饰符（private）

- 访问级别仅 within the class（类内）。
- `private` attribute：只能被类内代码读写。
- `private` method：只能被类内代码调用。
- 仅供类自身使用，外部（包括 Main 程序）不可访问。
- 代码里的 `reset()` 声明为 private，外部只能通过 `doReset()` 间接调用它。

```java
public class MyClass {
    private int number; // 仅类内可读写
    private void reset() { // 仅类内可调用
        number = 0;
    }
    public void doReset() {
        reset(); // 类内可调用
    }
}
```

### 2.0.2 受保护访问修饰符（protected）

- 仅在 Java Packages（包）和 Inheritance（继承）上下文中有效。
- 子类可继承父类的 `public` 和 `protected` 属性和方法。
- `private` 属性和方法对子类也不可访问。
- 示例：子类访问父类的 `protected` 方法。

```java
public class Parent {
    protected int value;
    protected void show() {
        System.out.println(value);
    }
}
public class Child extends Parent {
    public void display() {
        show(); // 子类可访问 protected 方法
    }
}
```

## 2.1 包（Packages）

- Java package 是 namespace（命名空间），组织一组相关的 classes 和 interfaces。
- 防止命名冲突，允许控制访问。
- 实现为 directory structures（目录结构），每个包有唯一名称。
- 示例：把表格格式化代码放进 `format` 包，主程序放在 `app` 包，`app` 里的类用 import 引入 `format` 包。

```text
.
├── format
│   └── TableFormatter.java
└── app
    └── Program.java
```

## 2.2 继承（Inheritance）简介

- OOP 中，child class（子类）可 extend（扩展）parent class（父类），继承 `public` 和 `protected` 属性和方法。
- Java 关键字 `super` 指代子类的父类。
- 子类调用 `super()` 调用父类的 constructor（构造器）。
- 子类可访问父类的 `protected` 属性。
- 示例：子类调用 `super()` 并访问父类 `protected` 属性。

```java
public class Parent {
    protected String name;
    public Parent(String name) {
        this.name = name;
    }
}
public class Child extends Parent {
    public Child(String name) {
        super(name); // 调用父类构造器
    }
    public void printName() {
        System.out.println(name); // 访问 protected 属性
    }
}
```

---

# 3 继承（Inheritance）

## 3.0 重复代码问题

- 需求：算两种人的月收入。
  - `FullTimer`：属性 `name`, `staffId`, `baseSalary`, `bonus`；方法 `monthlyPay()` 返回 `baseSalary + bonus`。
  - `Contractor`：属性 `name`, `staffId`, `baseSalary`, `bonus`, `hours`, `hourlyRate`；方法 `monthlyPay()` 返回 `baseSalary + bonus + hours * hourlyRate`。
- 两个类的字段和公式大面积重复。Duplicate code（重复代码）导致维护复杂，是 Bad（不好的）。
- 需要一种方式避免重复：Inheritance（继承）。

```java
public class FullTimer {
    private String name;
    private String staffId;
    private double baseSalary;
    private double bonus;

    public FullTimer(String name, String staffId,
                     double baseSalary, double bonus) {
        this.name = name;
        this.staffId = staffId;
        this.baseSalary = baseSalary;
        this.bonus = bonus;
    }

    public double monthlyPay() {
        return baseSalary + bonus;
    }
}

public class Contractor {
    private String name;
    private String staffId;
    private double baseSalary;
    private double bonus;
    private int hours;
    private double hourlyRate;

    public Contractor(String name, String staffId,
                      double baseSalary, double bonus,
                      int hours, double hourlyRate) {
        this.name = name;
        this.staffId = staffId;
        this.baseSalary = baseSalary;
        this.bonus = bonus;
        this.hours = hours;
        this.hourlyRate = hourlyRate;
    }

    public double monthlyPay() {
        return baseSalary + bonus + hours * hourlyRate;
    }
}
```

## 3.1 Inheritance（继承）概念

- Inheritance（继承）：定义 general class（一般类，即 parent class / base class / superclass，父类/基类/超类），并 extend（扩展）为更 specific classes（具体类，即 child class / derived class / subclass，子类/派生类）。
- 子类继承父类的 states（状态）和 behaviours（行为）。
- 用关键字 `extends` 实现子类。

```java
class Parent {
    // Class body
}

class Child extends Parent {
    // Class body
}
```

- 示例：`Vehicle` 为父类，有 `maker` 属性和 `getMaker()` 方法；`Bicycle`, `Truck`, `Ferry` 为子类，各自增加自己的属性和方法。

## 3.2 重新设计

- 把公共部分上提到 superclass（超类）`Staff` 中：`name`, `staffId`, `baseSalary`, `bonus`。
- 差异放在 subclasses（子类）中：
  - `FullTimer` 复用父类的字段来算月收入。
  - `Contractor` 自己加 `hours`, `hourlyRate`，并重写 `monthlyPay()`。

```java
public class Staff {
    private String name;
    private String staffId;
    private double baseSalary;
    private double bonus;
    // 构造器省略
}

public class FullTimer extends Staff {
    // 构造器省略
    public double monthlyPay() {
        return baseSalary + bonus;
    }
}

public class Contractor extends Staff {
    private int hours;
    private double hourlyRate;
    // 构造器省略
    public double monthlyPay() {
        return baseSalary + bonus + hours * hourlyRate;
    }
}
```

- 问题：`baseSalary` 和 `bonus` 是 `private`，子类访问不到。想让子类读到父类的属性，可以改成 `protected`，也可以在父类提供 getter/setter。

## 3.3 Inheritance（继承）的好处

- Software re-use（软件复用）：子类无需重复祖先已定义的公共描述。
- Ease of maintenance（易维护）：修改父类一处，所有子类自动继承新定义。
- 但以上两个好处也可通过 Object Composition（对象组合，has-a 关系）实现，且在许多情况下组合优于继承。
- Inheritance 最重要的好处是 Polymorphism（多态）。

---

# 4 重载、集合与多态

## 4.0 重载（Overloading）

- Overloading（重载）允许在同一个类中定义多个 members（成员，包括 constructors 或 methods），它们共享相同名称但 parameters（参数）不同。
- 区分依据：参数的数量和类型。方法的 return type（返回类型）不能作为重载的区分依据。
- Constructor Overloading（构造器重载）：一个类可以有多个构造器，参数不同。
- Method Overloading（方法重载）：同名方法，参数不同（数量或类型），调用时根据提供的参数选择合适版本。

```java
public class Constr_Overload {
    public Constr_Overload() { }
    public Constr_Overload(int value) { }
}

public class Method_Overload {
    public void display(int number) { }
    public void display(String text) { }
}
```

## 4.1 传参：值传递与引用传递

- Java 中，当变量作为参数传递给方法时，采用 Pass By Value（值传递）。方法接收的是变量值的副本，而非变量本身的引用。
- 对于 primitive types（基本类型），方法内对副本的修改不影响外部原变量。
- 对于 objects（对象），传递的是 object reference（对象引用）的副本。方法接收的引用副本与外部引用指向同一对象。因此，方法内修改对象的 state（状态），外部可见。但若方法内重新赋值引用副本指向新对象，外部引用不受影响。
- 对象传递称为 Pass By Reference（引用传递），强调方法内修改对象状态会影响原对象。

```java
// Pass By Value 示例
public void modify(int x) {
    x = 100; // 不影响外部
}

// 对象引用传递示例
public void modify(Car car) {
    car.setColor("blue"); // 影响外部对象
}
```

## 4.2 集合（Collections）

- Java Collections 提供分组和组织数据的方式，允许在单一实体下存储和操作多个对象。
- 提供迭代、搜索、添加、删除等操作。
- 只能存储 objects（对象），不能存储 primitive data types（基本数据类型，如 int, char, double）。
- 类型检查在编译时进行，减少运行时类型错误。

### 4.2.0 ArrayList<T>

- 动态数组，大小可增长或缩小。
- 元素按顺序存储，可通过整数索引（从0开始）访问。
- `T` 指定列表可包含的对象类型，在实例化时确定。

```java
List<Integer> list = new ArrayList<Integer>();
list.add(10);
int value = list.get(0);
list.remove(0);
for (Integer item : list) {
    System.out.println(item);
}
```

### 4.2.1 HashMap<K, V>

- 用于存储 key-value pairs（键值对）。
- key（键）和 value（值）都是对象。
- 通过 key 存储和检索 value。

```java
HashMap<String, Integer> map = new HashMap<String, Integer>();
map.put("Monday", 1);
int day = map.get("Monday");
```

## 4.3 多态（Polymorphism）

- Polymorphism（多态）是 OOP 的关键特性，允许通过父类型引用操作子类型对象，执行时根据实际对象类型调用相应方法。
- 核心：manipulate objects with similar interface subset（操作具有相似接口子集的对象）。

### 4.3.0 对象引用与继承

- 引用类型变量可以引用同类型对象，也可以引用其 sub-types（子类型）对象。
- 例如，`Animal myCat = new Cat();` 合法，因为 Cat 是 Animal 的子类。
- 反之，子类型变量不能引用父类型对象，如 `Cat myAnimal = new Animal();` 非法。
- 引用类型与对象类型可以不同。

```java
Cat myCat1 = new Cat();
Animal myCat2 = new Cat(); // 合法
```

### 4.3.1 引用类型与对象类型的作用

- **Reference Type（引用类型）** 决定哪些 methods 和 data members 可以被调用或使用。
- **Object Type（对象类型）** 决定当调用被 overridden（重写）的方法时，执行哪个版本。
- 示例：`Animal` 有 `makeNoise()`, `eat()`, `sleep()`；`Cat` 重写 `makeNoise()`, `eat()`，并新增 `catchMouse()`。
  - `Cat myCat1 = new Cat();` 可调用 `makeNoise()`, `eat()`, `sleep()`, `catchMouse()`。
  - `Animal myCat2 = new Cat();` 只能调用 `makeNoise()`, `eat()`, `sleep()`，不能调用 `catchMouse()`。
  - 当 `myCat2.makeNoise()` 执行时，实际执行 Cat 中重写的版本。

```java
Animal myAni = new Animal();
myAni.makeNoise(); // 调用 Animal 版本
myAni = new Cat();
myAni.makeNoise(); // 调用 Cat 版本
```

- 由于引用可以在不同时间引用不同对象类型，称为 polymorphic reference（多态引用）。
- 编译器使用 dynamic binding（动态绑定）在运行时确定执行哪个版本。

### 4.3.2 多态的三种应用形式

- **Polymorphic Arrays/Collections（多态数组/集合）**：可以混合存放父类型及其子类型的对象。

```java
Animal[] myAnimals = new Animal[4];
myAnimals[0] = new Cat();
myAnimals[1] = new Cow();
myAnimals[2] = new Pig();
myAnimals[3] = new Cow();

for (Animal myAnimal : myAnimals) {
    myAnimal.sound(); // 根据对象类型输出 Meow, Moo, Oink, Moo
}
```

- **Polymorphic Arguments（多态参数）**：方法参数为父类型，可接受任意子类型对象。

```java
public static void makeManySound(Animal myAnimal, int times) {
    for (int i = 0; i < times; i++) {
        myAnimal.sound();
    }
}
makeManySound(new Cat(), 3); // Meow Meow Meow
makeManySound(new Cow(), 2); // Moo Moo
```

- **Polymorphic Return Type（多态返回类型）**：方法返回父类型，可返回任意子类型对象。

```java
public static Animal createAnimal(String type) {
    switch (type) {
        case "cat": return new Cat();
        case "pig": return new Pig();
        case "cow": return new Cow();
        default: return null;
    }
}
Animal myAnimal1 = createAnimal("cat");
myAnimal1.sound(); // Meow
```

### 4.3.3 多态的好处

- 编写代码时无需随着新子类型的引入而修改。
- 框架可以在不知道具体子类的情况下实现。
- 示例：Shape 层次中，Drawing 类使用 `List<Shape>` 和 `draw()` 方法，新增 Triangle 子类时，Drawing 类无需修改。

```java
class Drawing {
    List<Shape> allshapes = new ArrayList<Shape>();
    public void add(Shape s) { allshapes.add(s); }
    public void draw() {
        for (Shape s : allshapes) {
            s.draw();
        }
    }
}
```

## 4.4 类型转换（Casting）

- 引用类型变量可以赋值给同类型或子类型对象（upcasting，向上转型，自动）。
- 子类型变量不能直接引用父类型对象，需要 explicit casting（显式类型转换，downcasting，向下转型）。

```java
EBook myEBook = new EBook("深入理解 Java 虚拟机", "epub");
Book myBook = myEBook; // 向上转型，自动
// ...
EBook backToEBook = (EBook) myBook; // 向下转型，强制
```

- 如果对象实际类型不是要转换的类型，会抛出 `ClassCastException`。
- 使用 `instanceof` 在转换前检查对象类型。

```java
if (myBook instanceof EBook) {
    EBook backToEBook = (EBook) myBook;
}
```

- 示例：实现 `equals()` 方法，比较两个 Circle 的 radius。

```java
@Override
public boolean equals(Object anotherObj) {
    if (!(anotherObj instanceof Circle)) {
        return false;
    }
    Circle anotherCircle = (Circle) anotherObj;
    return anotherCircle.radius == this.radius;
}
```

## 4.5 多态解决方案

- 反例：给每种人各写一个类、各存一个数组来算总额，代码重复，加一种人就要改一遍。
- 用 Inheritance 和 Polymorphism 重新设计：
  - 父类 `Staff` 有 `name` 和 `monthlyPay()` 方法。
  - 子类 `FullTimer`, `Contractor` 各自重写 `monthlyPay()`。
  - `Payroll` 只持有 `Staff[]`，循环里统一调用 `monthlyPay()`，具体执行哪个版本交给动态绑定。

```java
public class Payroll {
    private Staff[] staff;
    public Payroll(Staff[] staff) { this.staff = staff; }
    public double totalPay() {
        double total = 0;
        for (Staff s : staff) {
            total += s.monthlyPay();
        }
        return total;
    }
}
```

- 再加一种人的时候，只要新写一个子类并重写 `monthlyPay()`，`Payroll` 完全不用动。

---

# 5 抽象类、接口与异常处理

## 5.0 松耦合的软件设计

- 目标是设计 loosely-coupled（松耦合）的软件，组件边界清晰。
- Tightly-coupled（紧耦合）情况下，组件 A 的变化要求组件 B 也变化才能协同工作。
- 组件仍需紧密协作以保证系统高效有用。
- Abstract Class（抽象类）和 Interface（接口）是两种语言构造，使组件紧密协作的同时保持松耦合，便于维护和升级。

## 5.1 抽象类（Abstract Class）

- 类似普通类，但有一个或多个 abstract methods（抽象方法，无实现）。
- 不能 instantiated（实例化），设计为被继承或子类化。
- 继承抽象类的类必须实现该抽象类中定义的所有抽象方法。
- 示例：Shape 抽象类提供核心功能，将面积计算留给子类 Circle 和 Rectangle。

```java
abstract class Shape {
    abstract double area();
}
class Circle extends Shape {
    double radius;
    Circle(double radius) { this.radius = radius; }
    @Override
    double area() { return Math.PI * radius * radius; }
}
```

## 5.2 接口（Interface）

- 作为软件组件之间的 contract（契约），定义一个或多个 interface methods（接口方法），必须被实现。
- 接口方法定义系统中交互组件预期的行为。
- 接口方法无实现，因此接口不能实例化。
- 实现接口的类必须提供该接口定义的所有接口方法的实现。
- 一个类可以实现一个或多个接口。
- 示例：`Logger` 并不关心传进来的是什么类，只要它实现了 `ILoggable`（能给出自己的日志文本）就能被记录下来。

```java
interface ILoggable {
    String getLogMessage();
}
class Logger {
    void log(ILoggable obj) {
        System.out.println(obj.getLogMessage());
    }
}
```

## 5.3 抽象类与接口的对比

| Feature              | Abstract Class                       | Interface                                |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| Constructors         | 可以有构造器                         | 不能有构造器                             |
| Implementation       | 可以有抽象方法和具体方法             | 方法隐式为抽象（无方法体）               |
| Variables            | 可以有实例变量、static 和 final 字段 | 变量隐式为 public, static, final（常量） |
| Inheritance keyword  | 类使用 `extends` 继承抽象类          | 类使用 `implements` 实现接口             |
| Multiple Inheritance | 一个类只能继承一个抽象类             | 一个类可以实现多个接口                   |
| Access Modifiers     | 可以使用 public, protected, private  | 所有成员隐式为 public                    |

## 5.4 异常处理（Exception Handling）

- 运行时错误场景：除零、输入非整数、文件写入、从互联网下载图片等。
- Runtime vs Compile-time Errors：
  - Compile-time errors（编译时错误）：编译期间发生，必须修正才能运行。
  - Runtime errors（运行时错误）：程序运行期间发生，难以确定预测。
- 应由 programmers（程序员）处理异常。

## 5.5 什么是异常

- Java 异常处理是 object-oriented（面向对象的）。
- 运行时错误发生时，JRE 生成（throws，抛出）一个 Exception 对象。
- Exception 对象嵌入异常信息：异常类型、原因、程序当前状态。
- JRE 停止执行后续未处理的代码。

```java
int quotient = 10 / divisor;
System.out.println(quotient);
```

## 5.6 怎么处理异常

- 处理方式：
  - Option A：Ignore it（忽略），由默认异常处理器处理。
  - Option B1：Handle it where it occurs（在发生处处理）。
  - Option B2：Handle it in another place（在其他地方处理）。
- 处理异常的方式是重要的设计考虑。

### 5.6.0 try-catch

- try 块包含可能抛出异常的语句。
- 异常在 try 块中抛出后，可在 catch 块中捕获和处理。
- 异常对象 `e` 及所有信息由 JRE 提供。
- 可以有多个 catch 块处理不同异常类型，抛出异常时调用第一个兼容的 catch 块。
- 若 try 块成功执行无异常，后续 catch 块不执行，流程继续到最后一个 catch 块之后。
- 若异常被抛出，程序流进入相应 catch 块。执行完 catch 块后，不会返回 try 块，而是继续到最后一个 catch 块之后的语句，程序继续运行不终止。

```java
try {
    int divisor = scanner.nextInt();
    int quotient = 10 / divisor;
    System.out.println(quotient);
} catch (InputMismatchException e) {
    System.err.println("输入的不是整数");
} catch (ArithmeticException e) {
    System.err.println("除数不能为 0");
}
```

### 5.6.1 finally

- finally 块总是执行，无论是否发生异常。
- 通常用于清理已分配资源，如文件、互联网连接。
- 执行时机：
  1. 无异常生成：try 块语句完成后执行 finally 块语句。
  2. 异常生成：相应 catch 块语句完成后执行 finally 块语句。
  3. 异常未捕获：finally 块仍会执行。

```java
try {
    // Main logic code
} catch (Exception_Type1 e1) {
    // Exception handling code
} catch (Exception_Type2 e2) {
    // Exception handling code
} finally {
    // Clean up code
}
```

## 5.7 异常类的继承层次

- 异常对象由类定义，根类为 Exception。
- 层次结构：Exception -> IOException, ClassNotFoundException, RuntimeException -> ArithmeticException, InputMismatchException, IndexOutOfBoundsException -> ArrayIndexOutOfBoundsException, StringIndexOutOfBoundsException。
- RuntimeException 及其子类为 unchecked exceptions（非受检异常）。
- 其他为 checked exceptions（受检异常）。
- 捕获父类异常可捕获其所有派生类异常。
- 最好为每个预期异常指定 catch 块，并添加通用 Exception 类捕获其他异常。

```java
try {
    // ...
} catch (InputMismatchException e) {
    // ...
} catch (ArithmeticException e) {
    // ...
} catch (Exception e) {
    System.err.println("出现了没有预料到的异常");
} finally {
    scanner.close();
}
```

### 5.7.0 Exception 类

- 构造器：`Exception()` 无额外信息；`Exception(String message)` 指定详细消息。
- 方法：`getMessage()` 获取详细消息字符串；`printStackTrace()` 打印 throwable 及其 backtrace 到标准错误流。

```java
catch (Exception e) {
    System.err.println(e.getMessage());
    e.printStackTrace();
}
```

## 5.8 自定义异常

- 可通过继承 Exception 或其子类创建自己的异常类。
- 通常实现一两个构造器，调用 `super()` 初始化异常信息。
- Checked exception（受检异常）：继承 Exception，方法若不处理必须声明 `throws`。
- Unchecked exception（非受检异常）：继承 RuntimeException，方法若不处理无需声明 `throws`。

```java
class BookingException extends Exception {
    public BookingException() { super(); }
    public BookingException(String message) { super(message); }
}

public static String pickSeat(String[] seats, int index) throws BookingException {
    if (index < 0 || index >= seats.length) {
        throw new BookingException("座位号超出范围：" + index);
    }
    return seats[index];
}
```

- 非受检自定义异常：

```java
public class BookingException extends RuntimeException {
    public BookingException() { super(); }
    public BookingException(String message) { super(message); }
}

public static String pickSeat(String[] seats, int index) {
    if (index < 0 || index >= seats.length) {
        throw new BookingException("座位号超出范围：" + index);
    }
    return seats[index];
}
```

## 5.9 异常的传播（Propagation）

- 若方法不捕获抛出的异常，异常传播到调用方法。
- 传播持续直到异常被捕获，或到达最外层由默认异常处理器处理。
- 好处：分离错误识别/报告与对错误的反应，可能在不同类中。错误在一处识别，异常处理器在另一处，通过抛出的异常对象链接。增加程序健壮性而不使代码逻辑复杂。

```java
static void loadConfig() {
    throw new RuntimeException("配置文件读取失败");
}
static void startApp() {
    loadConfig();
}
public static void main(String[] args) {
    try {
        startApp();
    } catch (RuntimeException e) {
        System.out.println(e.getMessage());
    }
}
```

---
