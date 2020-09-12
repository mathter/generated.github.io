---
layout: doc_page
title: Docs
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
   <version>1.0.6</version> <!-- or latest version -->
</dependency>
```
<div class="alert alert-block alert-danger">
<b>Please verify the latest version</b>
</div>
### Sources
There are source codes at [github.com](https://github.com/mathter/generated)
### HelloWorld sample
It is required to get [ObjectFactory]({{site.source_base}}common/src/main/java/tech/generated/common/ObjectFactory.java) firstly to start using **Generated Tech Project**.
It is possible to use a default configuration for generating values for your project.
```java
GeneratedEngine engine = GeneratedEngineFactory.newInstance(null);
ObjectFactory objectFactory = engine.objectFactory();
```

All java objects are based on simple types such as ``long``, ``int``, ``String`` and etc
(all simple types description is [here](topic_100_simple_types)).
There is [default configuration](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/DefaultConfiguration.java)
for generating all such types. And you can use a simple code to produce a new object:
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
What about complex objects? It is very simple! All complex objects consist of [simple types](topic_100_simple_types) such as ``long``, ``int``, ``String``
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
[In this section](topic_00_110_custom_configuration.html) you can get detailed information.
#### @InstanceBuilder
To create a class instance use
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
In this case, custom configuration provides creation of class instance and fills all the fields of the object automatically
by using [``DefaultFiller``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/DefaultFiller.java).

#### @InstanceBuilder - simple object generation
``simple = true`` attribute (by default is ``false``) of
[``@InstanceBuilder``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/InstanceBuilder.java)
annotation can be used to skip filling stage of object generation.
Such code is usefull if object has got a constructor with arguments.
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
Custom fillers can be used to populate object fields.
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
annotation, or type of the method parameter is used for selecting class witch will be filled by
[``@Filler``](https://github.com/mathter/generated/blob/master/common/src/main/java/tech/generated/common/annotation/Filler.java)
annotation.
It is possible to specify the class by using
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
What will happen if there is a recursion in the object structure?
```java
class WithRecursion {
    private WithRecursion parent;
    ...
}
```
Of couse ``java.lang.StackOverflowError`` will be generated!
To avoid this custom configuration can't be used. Next sample shows generating the object with 10 deep.
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

#### @Path selector
It is possible to specify custom ``@InstanceBuilder`` or ``@Filler`` for selected object fields. Next example shows custom filler
for field ``name`` of ``Persone`` class.
```java
public class CustomConfiguration extends DefaultConfiguration {
    @Filler
    @Path(value = "name")
    public String name(String name) {
        return "Alex";
    }
}
```
It is possible to specify the nesting level of the field.
```java
public class Family {
    private Person father;
}
public class CustomConfiguration extends DefaultConfiguration {
    // 'name' is the field of root object
    @Filler
    @Path(value = "/name")
    public String name(String name) {
        return "Alex";
    }
    
    // 'name' is second field. For example 'name' field of 'father' one of the Family class.
    @Filler
    @Path(value = "/../name")
    public String name(String name) {
        return "Alex"; 
    }
}
```
You can use the ``*`` character to specify any valid characters in the field name.
```java
public class CustomConfiguration extends DefaultConfiguration {
    @Filler
    @Path(value = "/fa*/name")
    public String name(String name) {
        return "Alex";
    }
}
```