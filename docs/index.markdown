---
layout: doc_page
title: "Docs"
menu_type: main
---
# Documentation
## Getting started
### Installation
To make use of Generated within your project, simply add the maven dependency available from Maven Central repository, like so:
```xml
<dependency>
   <groupId>tech.generated</groupId>
   <artifactId>common</artifactId>
   <version>1.0.4</version> <!-- or latest version -->
</dependency>
```
<div class="alert alert-block alert-danger">
<b>Please verify the latest version</b>
</div>

### HelloWorld sample
It is required to get [ObjectFactory]({{site.source_base}}common/src/main/java/tech/generated/common/ObjectFactory.java) firstly to start using **Generated**.
It is possible to use default configuration for generating values for your project.
```java
GeneratedEngine engine = GeneratedEngineFactory.newInstance(null);
ObjectFactory objectFactory = engine.objectFactory();
```

All java object are based on simple types as ``long``, ``int``, ``String`` and etc
(all simple types description is [here](topic_100_simple_types)).
There is [default configuration](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/DefaultConfiguration.java)
for generating all such types. And your can use simple code for produce new object:
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
That abount complex object? It is very simple! All complex object consist of [simple types](topic_100_simple_types) as ``long``, ``int``, ``String``
and/or another complext objects. And Generated engine can automatically produce such objects:
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
#### @InstanceBuilder
To create perfect object instance use
[``@Instancebuilder``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/InstanceBuilder.java)
annotation:
```java
public class Person {
   ...
}

public class CustomConfiguration extends DefaultConfiguration {
    @InstanceBuilder
    public Person personInstance(Context ctx) {
        return new Person();
    }
    
    // Or simply if aditional information about context not required.
    @InstanceBuilder
    public Person personInstance() { 
        return new Person();
    }
    
    // Or use java.util.function.Supplier class as return type
    public Supplier<Person> personInstance(Context ctx) {
        return () -> new Person();
    }
}
```
In this case, custom configuration provides creation of object instance and fills all fields of object automatically
by using [``DefaultFiller``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/DefaultFiller.java).

#### @InstanceBuilder - simple object generation
``simple = true`` attribute (by default is ``false``) of
[``@InstanceBuilder``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/InstanceBuilder.java)
annotation can be used to skip filling stage of object generation.
Such code is usefull if object have constructor with arguments.
```java
public class Person {
   public Person(String name, String LastName) {
        ...
   }
}

public class CustomConfiguration extends DefaultConfiguration {
   @InstanceBuilder(simple = true)
   public Person personInstance(){
      return new Person("John", "Smith");
   }
}
```
#### Custom fillers by @Filler annotation
Custom fillers can be used for populate object fields.
```java

public class CustomConfiguration extends DefaultConfiguration {
    @InstanceBuilder
    public Person personInstance(Context ctx) {
        return new Person();
    }

    @Filler
    public Person personFiller(Person object) {
        object.setName("Name");
        object.setMiddleName("MiddleName");
        object.setLastName("LastName");
        object.setBirthday(new Date());

        return object;
    }
}

GeneratedEngine engine = GeneratedEngineFactory.newInstance(
    null,
    new CustomConfiguration()
);
ObjectFactory objectFactory = engine.objectFactory();
Person object = objectFactory.build(Person.class);
```
#### Specify class by @ForClass annotation
Return type of the method is used for selecting object class which will be produced by
[``@InstanceBuilder``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/InstanceBuilder.java)
annotaion, or type of the method parameter is used for selecting class witch will be filled by
[``@Filler``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/Filler.java)
annotation.
It is possible specify class by using
[``@ForClass``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/ForClass.java)
annotation directly.
```java
public class CustomConfiguration extends DefaultConfiguration {
    @InstanceBuilder
    @ForClass(Person.class)
    public Object personInstance(Context ctx) {
        return new Person();
    }

    @Filler
    @ForClass(Person.class)
    public Object personFiller(Object object) {
        object.setName("Name");
        object.setMiddleName("MiddleName");
        object.setLastName("LastName");
        object.setBirthday(new Date());

        return object;
    }
}
```

#### Recursion
That will happen if there is a recursion in the object structure?
```java
class WithRecursion {
    private WithRecursion parent;
    ...
}
```
Of couse ``java.lang.StackOverflowError`` will be generated!
To avoid this custom configuration cant be used. Next sample show generating object with 10 deep.
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