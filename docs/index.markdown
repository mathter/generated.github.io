---
layout: doc_page
title: "Docs"
menu_type: main
---
# Documentation
## Getting started
### Installation
Simply add the maven dependency available from central Maven repositories:
```xml
<dependency>
   <groupId>tech.generated</groupId>
   <artifactId>common</artifactId>
   <version>1.0.0</version> <!-- or latest version -->
</dependency>
```

### HelloWorld sample
It is required to get [ObjectFactory]({{site.source_base}}common/src/main/java/tech/generated/common/ObjectFactory.java) firstly.
You can use default configuration for generating values for your project.
```java
GeneratedEngine engine = GeneratedEngineFactory.newInstance(null);
ObjectFactory objectFactory = engine.objectFactory();
...
```
All java object are based on simple type as ``long``, ``int``, ``String`` and etc
(all simple types description is [here](topic_100_simple_types)).
There is default configuration for generating all such types. And your can use simple code for produce new object:
```java
GeneratedEngine engine = GeneratedEngineFactory.newInstance(null);
ObjectFactory objectFactory = engine.objectFactory();

String value = objectFactory.build(String.class);
// Or more complexity
String value = objectFactory.build(
    Init.builder(String.class).build()
);
```

### Complex object generation
That abount complex object? It is very simple! All complex object consist of another complext objects and they are based
on [simple objects](topic_100_simple_types). And Generated engine can automatically produce such objects:
```java
class MyComplexClass {
    private Integer index;
    private String name;
    ...
}

GeneratedEngine engine = GeneratedEngineFactory.newInstance(null);
ObjectFactory objectFactory = engine.objectFactory();

MyComplexClass object = objectFactory.build(MyComplexClass.class);
// Or more complexity
MyComplexClass object = objectFactory.build(
    Init.builder(MyComplexClass.class).build()
);
```
### Custom object generation
It is possible to use own custom configuration for object generation.
[In this section](topic_00_110_custom_configuration.html) you can get detailed informaion.

To create perfect object instance use
[``@Instancebuilder``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/InstanceBuilder.java)
annotation:
```java
public class Person {
   ...
}

public class CustomConfiguration extends DefaultConfiguration {
   @InstanceBuilder
   public Person personInstance(Context ctx){
      return new Person();
   }

   // Or simply
   @InstanceBuilder
   public Person personInstance(){ 
      return new Person();
   }
}
```
In this case, custom code provides creation of object instance and Generated framework fills all fields of class automatically
by using [``DefaultFiller``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/DefaultFiller.java).

### Recursion
That will happen if there is a recursion in the object structure?
```java
class WithRecursion {
    private WithRecursion parent;
    ...
}
```
Of couse ``java.lang.StackOverflowError`` will be generated!
To avoid this you can use custom object generation. For example to generate objects with 10 deep use next configuration.
```java
public class CustomConfiguration extends DefaultConfiguration {
    private static final int DEEP = 10;

    @Filler
    public WithRecursion filler(WithRecursion object,ValueContext<WithRecursion> context) {
        if (context.stream().count() < DEEP) {
            new DefaultFiller<>(context).apply(object);
        }
        return object;
    }
}

GeneratedEngine engine = GeneratedEngineFactory.newInstance(new CustomConfiguration());
ObjectFactory objectFactory = engine.objectFactory();
WithRecursion object = objectFactory.build(WithRecursion.class);
```