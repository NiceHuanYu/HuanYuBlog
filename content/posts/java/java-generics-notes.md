---
title: Java 泛型笔记：泛型方法、有界类型与泛型类
description: 学习 Java 泛型时的个人笔记：从重复的重载方法与多态尝试讲起，再到泛型方法与类型推断、有界泛型类型、Comparable 与 Number 边界，以及泛型类在集合中的用法。示例代码均为自写，运行结果来自本地实测。
date: 2026-10-13
category: 学习
tags:
    - Java
    - 泛型
    - 学习笔记
series: Java 学习笔记
seriesOrder: 3
---

> 这是一份个人学习笔记：讲解部分是我按自己的理解写的，示例代码也都是自己写的，输出结果是本地跑出来的。参考主要是 Oracle 的 Java 官方文档与语言规范，理解有偏差的地方欢迎指出。

# 0.1 重复代码与多态（Polymorphism）尝试

## 0.1.1 靠重载（Overloading）堆出来的重复代码

要给不同类型的数组求和，用重载（Overloading）写出来就是三个几乎一样的方法：

```java
static double sum(int[] arr) {
    double total = 0;
    for (int e : arr) {
        total += e;
    }
    return total;
}

static double sum(float[] arr) {
    double total = 0;
    for (float e : arr) {
        total += e;
    }
    return total;
}

static double sum(double[] arr) {
    double total = 0;
    for (double e : arr) {
        total += e;
    }
    return total;
}
```

三个方法只有数组类型不同，循环体和累加逻辑完全一样。类型越多，复制粘贴的次数就越多，改一处逻辑要改好几份——这就是泛型（Generics）想解决的问题。

## 0.1.2 换成 `Object[]` 行不行？

一个自然的想法是「用多态（Polymorphism）把参数提升为 `Object[]`」，这样只需要一个方法：

```java
static double sum(Object[] arr) {
    double total = 0;
    for (Object e : arr) {
        total += e;
    }
    return total;
}
```

编译这段代码，编译器直接报错：

```text
PolymorphismAttempt.java:5: error: bad operand types for binary operator '+'
            total += e;
                  ^
  first type:  double
  second type: Object
1 error
```

报错的原因是变量 `e` 的编译期类型是 `Object`，而 `+` 运算符知道怎么处理 `double`，却不知道该怎么处理一个 `Object`。想把值取出来就得显式做强制类型转换（Explicit Type Casting），而且转错了要到运行期才炸。

就算转换的问题绕过去了，还有第二个隐患：`Object[]` 什么都能装，`{1, 2, "three"}` 这样的数组能顺利通过编译，求和时才在运行期出错。也就是说，**类型安全（Type Safety）在编译期就丢掉了**。

两类问题的共同点是：写方法的时候我就已经知道数组里装的是什么类型了，可编译器不知道。要解决它，需要一种「类型先留空、调用时再填」的写法。

# 0.2 泛型（Generics）是什么

## 0.2.1 参数化类型（Parameterized Types）

泛型（Generics）允许在定义类或方法时使用泛型类型（Generic Types），也就是**参数化类型（Parameterized Types）**：先写一个类型占位符（例如 `T`），具体是什么类型留到使用的时候再指定，用尖括号 `<>` 写出来。

用一句话概括：**把「类型」变成可以传入的参数**。方法参数传的是值，泛型参数传的是类型。

## 0.2.2 两个核心好处

| 好处 | 含义 |
| --- | --- |
| 类型安全（Type Safety） | 编译器（Compiler）在编译期就检查类型用得对不对，错误提前暴露，而不是拖到运行期 |
| 复用（Reusability） | 一份泛型算法或数据结构就能处理多种类型，调用方也不需要写显式类型转换（Explicit Type Casting） |

# 0.3 泛型方法（Generic Methods）

## 0.3.1 声明位置与命名习惯

泛型类型声明在**修饰符（Modifier）与返回类型之间**，用尖括号包起来：

```java
static <T> void printAll(T[] arr) {
    for (int i = 0; i < arr.length; i++) {
        T cur = arr[i];
        System.out.print(cur + " ");
    }
    System.out.println();
}
```

拆开看这行声明：`static` 是修饰符，`<T>` 是声明的泛型类型，`void` 是返回类型，`printAll` 是方法名，`T[] arr` 是使用了泛型类型的参数。

占位符本身的名字随意，但社区有约定俗成的习惯：

- `T` — Type（类型）
- `E` — Element（元素）
- `K` — Key（键）
- `V` — Value（值）

一旦声明了 `T`，它就能用在三个地方：参数类型（`T[] arr`）、局部变量类型（`T cur`），以及后面会讲的返回类型。

调用同一份方法，传入三种不同类型的数组：

```java
Integer[] intArr = {5, 8, 1};
Double[] doubleArr = {2.5, 0.5, 3.5};
String[] wordArr = {"kiwi", "banana", "pear"};
printAll(intArr);
printAll(doubleArr);
printAll(wordArr);
```

```text
5 8 1 
2.5 0.5 3.5 
kiwi banana pear 
```

## 0.3.2 调用时的类型推断（Type Inference）

调用 `printAll(intArr)` 时并没有写 `<Integer>`，编译器是从**实参的类型**推断（Type Inference）出 `T` 就是 `Integer` 的。

推断依据是实参，所以同一份泛型方法也不排斥显式指定：

```java
GenericsDemo.<String>printAll(wordArr);
GenericsDemo.<Integer>printAll(intArr);
```

这种写法用得很少，一般只在编译器没法从实参推断出类型时才需要。

## 0.3.3 编译器背后做了什么：类型擦除（Type Erasure）

有一种常见的说法是「编译器会为每种用到的类型各生成一个版本，类似重载」。从**调用点的行为**看确实像：`printAll(intArr)` 里的 `T` 就是 `Integer`，`printAll(wordArr)` 里的 `T` 就是 `String`，各自都受编译期检查。

但 Java 的实现方式并不是复制多份方法体，而是**类型擦除（Type Erasure）**：泛型只存在于编译期，编译出来的字节码里 `T` 会被擦除成它的边界（没有边界时擦除成 `Object`），编译器在需要的地方插入强制类型转换，必要时还会生成桥方法（Bridge Method）。

可以亲手验证一下擦除的结果——两个泛型参数不同、元素类型也不同的 `ArrayList`，运行期是同一个类：

```java
List<String> names = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();
System.out.println(names.getClass() == numbers.getClass());
System.out.println(names.getClass().getName());
```

```text
true
java.util.ArrayList
```

这也解释了两件事：为什么泛型参数只能是引用类型（下一节），以及为什么**运行时拿不到泛型的实际类型参数**（`List<String>` 在运行期没法问出「你的元素是 String」）。

## 0.3.4 泛型可以作返回类型

把 `T` 写在返回类型的位置，方法就返回一个「调用时确定的类型」：

```java
static <T> T elementAt(T[] arr, int index) {
    if (index >= 0 && index < arr.length) {
        return arr[index];
    }
    return null;
}
```

调用 `elementAt(wordArr, 1)` 时，编译器根据 `wordArr` 是 `String[]` 推断出 `T` 为 `String`，所以返回值可以直接赋给 `String` 变量，不需要强制转换：

```java
System.out.println(elementAt(wordArr, 1));
System.out.println(elementAt(wordArr, 5));
```

```text
banana
null
```

两个约束值得注意：

- **所有 `return` 语句返回的都必须是 `T` 类型的引用**，返回别的东西编译不过。
- 越界时返回 `null` 是可行的写法，因为 `T` 一定是引用类型，可以是 `null`。调用方拿到 `null` 之后要自己处理。

## 0.3.5 泛型只能代表引用类型（Reference Type）

`static <T> void printAll(T[] arr)` 只能接收 `Integer[]`、`String[]` 这类引用类型的数组。把泛型参数写成基本类型，编译器会直接拒绝：

```java
List<int> numbers = new ArrayList<>();
```

```text
PrimitiveTypeArg.java:6: error: unexpected type
        List<int> numbers = new ArrayList<>();
             ^
  required: reference
  found:    int
1 error
```

需要装基本类型时用对应的包装类（Wrapper Class）：`Integer`、`Double`、`Character`……自动装箱（Autoboxing）会让 `list.add(1)` 这样的写法照常工作。

## 0.3.6 练习：判断数组是否包含某个元素

**题目**：写一个方法，判断数组中是否包含指定元素，要求同时支持 `Integer[]`、`Double[]`、`String[]` 等多种数组类型。

用泛型方法只需要一份实现：

```java
static <T> boolean contains(T[] arr, T target) {
    for (T cur : arr) {
        if (cur.equals(target)) {
            return true;
        }
    }
    return false;
}
```

```java
System.out.println(contains(intArr, 8));
System.out.println(contains(wordArr, "mango"));
```

```text
true
false
```

这里用的是 `equals()` 而不是 `==`：`==` 比较的是两个引用是否指向同一个对象，判断「值是否相等」要用 `equals()`，这也是泛型代码里判断元素相等的标准做法。

# 0.4 有界泛型类型（Bounded Generic Types）

## 0.4.1 无界泛型能做的事很有限

`<T>` 里的 `T` 没有边界，编译器就只把它当成 `Object` 看待（擦除也擦到 `Object`），因此方法体里只能调用 `Object` 上有的方法：`equals()`、`toString()`、`hashCode()`。想调用别的就编译不过：

```java
// 编译错误：找不到符号 makeSound()
static <T> void makeNoiseNTimes(T animal, int n) {
    for (int i = 0; i < n; i++) {
        animal.makeSound();
    }
}
```

可是方法本身可能明明只想处理「动物」。把这种限制说出来，就是**有界泛型类型（Bounded Generic Types）**：声明 `T` 时顺便规定它必须是某个类型的子类型。一旦有了边界，编译器就知道 `T` 至少具备哪些方法，方法体里就能放心调用。

## 0.4.2 上界是一个类

```java
static <T extends Animal> void makeSoundNTimes(T animal, int n) {
    for (int i = 0; i < n; i++) {
        animal.makeSound();
    }
}
```

`<T extends Animal>` 读作「`T` 是 `Animal` 或 `Animal` 的子类型」，于是 `animal.makeSound()` 合法——`Animal` 上声明的 `makeSound()`，所有子类型都继承到了。

哪些实参可以传进来？`Animal` 自己、子类 `Cat`、子类 `Baby` 都满足 `T extends Animal`：

```java
Cat cat = new Cat("Mimi");
makeSoundNTimes(cat, 2);
makeSoundNTimes(new Animal("Generic"), 1);
```

```text
Mimi says meow
Mimi says meow
Generic makes a sound
```

注意这里的「子类型」不只有继承一种来源：实现某个接口（Implements）的类型同样算子类型，所以下面这种把接口当边界的写法也成立。

## 0.4.3 上界是一个接口：`Comparable<T>`

`Comparable<T>` 是一个泛型接口（Generic Interface），它规定实现类的对象怎么互相比较大小：

```java
interface Comparable<T> {
    // 比较 this 与 another 的顺序：
    // this < another 返回负数
    // this > another 返回正数
    // 两者相等返回 0
    int compareTo(T another);
}
```

Java 里所有数字包装类（`Integer`、`Float`、`Double`……）和 `String` 都已经实现了这个接口，所以它们自带 `compareTo()`。

有了这个边界，就能写出「比较三个同类型对象取最大」的泛型方法：

```java
static <T extends Comparable<T>> T max3(T a, T b, T c) {
    T max = a;
    if (b.compareTo(max) > 0) {
        max = b;
    }
    if (c.compareTo(max) > 0) {
        max = c;
    }
    return max;
}
```

```java
System.out.println(max3(4, 9, 2));
System.out.println(max3(1.5, 3.5, 2.5));
System.out.println(max3("pear", "apple", "plum"));
```

```text
9
3.5
plum
```

三点说明：

- 因为 `T` 实现了 `Comparable<T>`，方法体里才能调用 `compareTo()`。如果没有这个边界，`max3` 连比较都没法写。
- **接口在泛型里也用 `extends`，不用 `implements`**。`<T extends Comparable<T>>` 的意思是「`T` 是 `Comparable<T>` 的子类型」，可能是继承来的，也可能是实现来的。
- 边界的写法是 `T extends Comparable<T>` 而不是 `T extends Comparable`：既然现在有泛型，就顺手把「和谁比较」也说清楚，编译器检查得更严。

## 0.4.4 多重边界（Multiple Bounds）

一个泛型类型可以同时满足多个上界，语法是 `<T extends SuperClass & Interface1 & Interface2>`：

```java
static <T extends Number & Comparable<T>> T maxOfNumber(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}
```

```java
System.out.println(maxOfNumber(12, 7));
```

```text
12
```

两个细节：

- **类必须写在第一位**，接口跟在后面，`&` 连接；多个上界里最多只有一个类。
- 有了 `Number` 边界，方法体里可以调用 `doubleValue()` 之类的方法；有了 `Comparable<T>` 边界，还能调 `compareTo()`。

## 0.4.5 借助多态把方法体写简单

`Number` 是所有数字包装类的父类，它定义了 `doubleValue()`，把值以 `double` 返回。于是「求一串数字的和」可以这样写：

```java
static <T extends Number> double sum(List<T> list) {
    double total = 0;
    for (Number e : list) {
        total += e.doubleValue();
    }
    return total;
}
```

```java
List<Integer> intList = new ArrayList<>();
intList.add(1);
intList.add(2);
intList.add(3);
List<Double> doubleList = new ArrayList<>();
doubleList.add(1.1);
doubleList.add(2.2);
System.out.println(sum(intList));
System.out.println(sum(doubleList));
```

```text
6.0
3.3000000000000003
```

`for` 循环里声明的是 `Number e` 而不是 `T e`：既然 `T` 的上界已经是 `Number`，直接用父类型接收更省事，`doubleValue()` 照样能调——这是多态在泛型方法体里的用法。第二个输出也顺便暴露了浮点数精度问题：`1.1 + 2.2` 在 `double` 下并不精确等于 `3.3`。

那这里还需要 `T` 吗？方法体里其实没用到 `T`，只用到「元素是 `Number` 的子类型」。这种情况下更好的写法是用通配符（Wildcard）表达同样的约束：

```java
static double sum(List<? extends Number> list) {
    double total = 0;
    for (Number e : list) {
        total += e.doubleValue();
    }
    return total;
}
```

`List<? extends Number>` 读作「元素类型是 `Number` 或其子类型的任意 `List`」，`List<Integer>`、`List<Double>` 都能传进来，而且不需要在方法名前面再声明一个只用一次的类型参数。通配符是泛型里另一个独立话题，这里先知道「约束参数、而不是约束自己声明的类型变量」时它更合适就够了。

# 0.5 泛型类（Generic Classes）

## 0.5.1 定义与实例化

泛型类型同样可以先写在**类名后面**，然后在类里到处使用：

```java
class Box<T> {
    private T value;

    Box() {
    }

    Box(T value) {
        this.value = value;
    }

    void set(T newValue) {
        this.value = newValue;
    }

    T get() {
        return value;
    }
}
```

跟泛型方法不同的是，泛型类的类型参数在**创建对象时**指定，之后类里所有的 `T` 都被替换成那个类型：

```java
Box<String> strBox = new Box<>("a string");
Box<Integer> intBox = new Box<>(10);
System.out.println(strBox.get());
System.out.println(intBox.get());
```

```text
a string
10
```

几点：

- `Box<String>` 里的 `T` 变成 `String` 之后，`set(T)` 就等价于 `set(String)`，往里塞别的类型编译不过。
- 等号右边的 `new Box<>()` 用了菱形运算符（Diamond Operator），尖括号里可以不写类型，编译器从左边 `Box<String>` 推断。写成 `new Box<String>()` 也完全合法。
- 泛型类里 `T` 能出现的位置和泛型方法一样：实例属性（Instance Attribute）的类型、方法参数（Method Arguments）的类型、方法返回值（Return Type）的类型。

## 0.5.2 集合框架（Collections Framework）中的泛型类

Java 集合框架里到处是泛型类，`ArrayList<E>`、`HashMap<K,V>` 的类名后面就带着类型参数。它们的声明大致是：

```java
class ArrayList<E> {
    ArrayList() {}
    // 其余代码省略
    void add(int index, E element) { /* 方法体省略 */ }
    boolean add(E e) { /* 方法体省略 */ }
}
```

读这种声明的方法是「**先看类名后面有几个类型参数，再去找方法签名里它们出现在哪**」。`add(int index, E element)` 里的 `E` 就是 `ArrayList<E>` 的 `E`，所以创建 `ArrayList<String>` 之后，第二个实参必须是 `String`：

```java
ArrayList<String> nameList = new ArrayList<>();
nameList.add(0, "Grace Hopper");
nameList.add(0, "Alan Turing");
System.out.println(nameList);
```

```text
[Alan Turing, Grace Hopper]
```

**练习**：`HashMap<K,V>` 的 `put(K key, V value)` 里，键和值分别是哪个类型参数？用「名字 → 名字长度」建一个映射。

对上面这份签名来说，`K` 决定键、`V` 决定值，所以声明成 `HashMap<String, Integer>` 即可：

```java
Map<String, Integer> nameToLength = new HashMap<>();
nameToLength.put("Grace Hopper", "Grace Hopper".length());
nameToLength.put("Alan Turing", "Alan Turing".length());
System.out.println(nameToLength);
```

```text
{Alan Turing=11, Grace Hopper=12}
```

`put("Grace Hopper", ...)` 能编译通过是因为第二个实参 `"Grace Hopper".length()` 的类型是 `int`，自动装箱成 `Integer` 之后正好匹配 `V`。

# 0.6 小结

| 概念 | 写法 | 关键点 |
| --- | --- | --- |
| 泛型方法 | `static <T> void m(T[] arr)` | 类型参数写在修饰符与返回类型之间，`T` 能用作参数、变量、返回类型 |
| 类型推断 | `m(intArr)` | 从实参推断 `T`，一般不用手写尖括号 |
| 实现机制 | — | 编译期检查 + 类型擦除（Type Erasure），运行期拿不到实际类型参数 |
| 泛型只能装引用类型 | `List<Integer>` | 基本类型要装箱，`List<int>` 编译不过 |
| 有界泛型 | `<T extends Animal>` | 接口也用 `extends`；有边界才能调用边界上的方法 |
| 多重边界 | `<T extends Number & Comparable<T>>` | 类写在第一位，多个上界最多一个类 |
| 通配符 | `List<? extends Number>` | 只约束「传进来的参数」时，比额外声明一个类型参数更合适 |
| 泛型类 | `class Box<T>` | 类型参数在创建对象时指定，集合框架普遍这么用 |
