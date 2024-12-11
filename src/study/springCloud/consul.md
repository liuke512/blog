---
icon: pen-to-square
date: 2024-12-07
category:
  - SpringCloud
tag:
  - spring
  - SpringCloud
  - Java
---

# Spring Cloud Consul

## 文献
[官网地址](https://consul.io)

[Spring社区](https://docs.spring.io/spring-cloud-consul/reference/)

[GitHub](https://github.com/spring-cloud/spring-cloud-consul)

[下载](https://developer.hashicorp.com/consul/install)

## 下载安装

### 下载安装
[下载地址](https://developer.hashicorp.com/consul/install#windows)
下载后解压即可！

### 启动
启动命令, 进入解压包目录，开发者模式运行
```
consul agent -dev
```
### 持久化
添加启动命令，持久化consul配置，后台启动
```
@echo.服务启动.......
chcp 65001
@echo off
@sc create Consul binpath="D:\install\consul\consul.exe agent -server -ui -bind=127.0.0.1 -client=0.0.0.0 -bootstrap-expect 1 -data-dir D:\install\consul\mydata "
@net start Consul
@sc config Consul start=AUTO
@echo.Consul start is OK ...... success
@pause
```

::: tip
- D:\install\consul\consul.exe 替换成你的 consul 目录
- D:\install\consul\mydata 替换成你的 consul 数据保存的目录
:::


### 访问
http://localhost:8500


## 集成到Springboot

### 添加依赖

```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-consul-discovery</artifactId>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 添加配置
```
spring:
  application: 
    name: my-project-name
  cloud:
    consul:
      host: localhost
      port: 8500
      discovery:
        service-name: ${spring.application.name}
```

### 主启动类
添加注解 @EnableDiscoveryClient
```
@SpringBootApplication
@EnableDiscoveryClient
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### tip
consul 默认是集群环境。
如果要使用 RestTemplate 调用集成到consul 中的其他微服务需要负载均衡
```
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}
``` 

## 其他
### CAP理论
CAP理论： 一致性，可用性 和 分区容错性
- CA: 单点集群，满足一致性，可用性的系统，扩展性不强
- CP: 满足一致性，分区容错性的系统， 性能不高
- AP:满足可用性，分区容错性， 对一致性的要求低一些

###  对比
| 组件 | Eureka | Consul | Zoopeeper | 
| --- | --- | --- | --- |
|语言 |JAVA | Go | JAVA | 
|CAP |AP |CP |CP | 
|服务健康检查 |可配支持 |支持 |支持 | 
|对外暴露接口 |HTTP |HTTP/DNS |客户端 | 
|SpringCloud |已集成 |已集成 |已集成 | 