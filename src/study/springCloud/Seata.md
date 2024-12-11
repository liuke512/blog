---
icon: pen-to-square
date: 2024-12-11
category:
  - SpringCloudAlibaba
tag:
  - Java
  - spring
  - SpringCloud
  - SpringCloudAlibaba
---

# Seata

## 文献
- [官网](https://seata.apache.org/zh-cn/)
- [官网下载](https://seata.apache.org/zh-cn/unversioned/download/seata-server)
- [Github](https://github.com/apache/incubator-seata)
- [Github下载](https://github.com/apache/incubator-seata/releases)

## Seata 是什么？
Seata 是一款开源的分布式事务解决方案，致力于提供高性能和简单易用的分布式事务服务。Seata 将为用户提供了 AT、TCC、SAGA 和 XA 事务模式，为用户打造一站式的分布式解决方案。

### Seata 术语
- TC (Transaction Coordinator) - 事务协调者
维护全局和分支事务的状态，驱动全局事务提交或回滚。

- TM (Transaction Manager) - 事务管理器
定义全局事务的范围：开始全局事务、提交或回滚全局事务。

- RM (Resource Manager) - 资源管理器
管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

### 事务模式
- Seata AT 模式

  AT 模式是 Seata 创新的一种非侵入式的分布式事务解决方案，Seata 在内部做了对数据库操作的代理层，我们使用 Seata AT 模式时，实际上用的是 Seata 自带的数据源代理 DataSourceProxy，Seata 在这层代理中加入了很多逻辑，比如插入回滚 undo_log 日志，检查全局锁等。

- Seata TCC 模式

  TCC 模式是 Seata 支持的一种由业务方细粒度控制的侵入式分布式事务解决方案，是继 AT 模式后第二种支持的事务模式，最早由蚂蚁金服贡献。其分布式事务模型直接作用于服务层，不依赖底层数据库，可以灵活选择业务资源的锁定粒度，减少资源锁持有时间，可扩展性好，可以说是为独立部署的 SOA 服务而设计的。

- Seata Saga 模式

  Saga 模式是 SEATA 提供的长事务解决方案，在 Saga 模式中，业务流程中每个参与者都提交本地事务，当出现某一个参与者失败则补偿前面已经成功的参与者，一阶段正向服务和二阶段补偿服务都由业务开发实现。

- Seata XA 模式

  XA 模式是从 1.2 版本支持的事务模式。XA 规范 是 X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准。Seata XA 模式是利用事务资源（数据库、消息服务等）对 XA 协议的支持，以 XA 协议的机制来管理分支事务的一种事务模式。


### 事务模式对比

| 事务模式 | 代码侵入性 | 数据库依赖 | 缺点 | 适用场景 | 
| --- | --- | --- | --- |--- |
| AT | 无| 本地 ACID 事务 | 弱一致性；隔离级别限制；容错性和恢复性 | 适用大部份场景|
| TCC |有 | 无 | TCC 是一种侵入式的分布式事务解决方案，需要业务系统自行实现 Try，Confirm，Cancel 三个操作，对业务系统有着非常大的入侵性，设计相对复杂。| TCC 模式是高性能分布式事务解决方案，适用于核心系统等对性能有很高要求的场景。|
| Saga | 有| 无| 不保证隔离性| 业务流程长、业务流程多；参与者包含其它公司或遗留系统服务，无法提供 TCC 模式要求的三个接口|
| XA |无 | 无| XA prepare 后，分支事务进入阻塞阶段，收到 XA commit 或 XA rollback 前必须阻塞等待。事务资源长时间得不到释放，锁定周期长，而且在应用层上面无法干预，性能差。| 适用于想要迁移到 Seata 平台基于 XA 协议的老应用，使用 XA 模式将更平滑，还有 AT 模式未适配的数据库应用。|

### AT模式详解
#### 整体机制
两阶段提交协议的演变：
- 一阶段：业务数据和回滚日志记录在同一个本地事务中提交，释放本地锁和连接资源。
- 二阶段：
  - 提交异步化，非常快速地完成。
  - 回滚通过一阶段的回滚日志进行反向补偿。
::: important
> 工作机制
##### 一阶段
  1. 解析 SQL：得到 SQL 的类型，表，条件等相关的信息。
  2. 查询前镜像：根据解析得到的条件信息，生成查询语句，定位数据。
  3. 执行业务 SQL
  4. 查询后镜像：根据前镜像的结果，通过 主键 定位数据。
  5. 插入回滚日志：把前后镜像数据以及业务 SQL 相关的信息组成一条回滚日志记录，插入到 UNDO_LOG 表中。
  6. 提交前，向 TC 注册分支：申请业务表中对应记录 全局锁 。
  7. 本地事务提交：业务数据的更新和前面步骤中生成的 UNDO LOG 一并提交
  8. 将本地事务提交的结果上报给 TC
##### 二阶段
  1. 回滚
     1. 收到 TC 的分支回滚请求，开启一个本地事务，执行如下操作
     2. 通过 XID 和 Branch ID 查找到相应的 UNDO LOG 记录
     3. 数据校验：拿 UNDO LOG 中的后镜与当前数据进行比较，如果有不同，说明数据被当前全局事务之外的动作做了修改，这种情况，需要根据配置策略来做处理
          1. 方案1： 在其他修改操作的地方都加上 @GlobalTransactional 全局锁
          2. 方案2： 在其他修改操作的地方都加上 @GlobalLock + select for update
     4. 根据 UNDO LOG 中的前镜像和业务 SQL 的相关信息生成并执行回滚的语句
     5. 提交本地事务。并把本地事务的执行结果（即分支事务回滚的结果）上报给 TC
  2. 提交
       1. 收到 TC 的分支提交请求，把请求放入一个异步任务的队列中，马上返回提交成功的结果给 TC
       2. 异步任务阶段的分支提交请求将异步和批量地删除相应 UNDO LOG 记录
:::

## 下载安装
### 下载地址
[官网下载](https://seata.apache.org/zh-cn/unversioned/download/seata-server)
下载二进制包后解压！

![解压后文件](/assets/images/seata/seata1.jpg)

### 修改配置文件
![conf目录](/assets/images/seata/seata2.png)

修改配置文件 application.yml
```yml
server:
  port: 7091

spring:
  application:
    name: seata-server

logging:
  config: classpath:logback-spring.xml
  file:
    path: ${log.home:${user.home}/logs/seata}
  extend:
    logstash-appender:
      destination: 127.0.0.1:4560
    kafka-appender:
      bootstrap-servers: 127.0.0.1:9092
      topic: logback_to_logstash
console:
  user:
    username: seata
    password: seata

seata:
  config:
    # support: nacos 、 consul 、 apollo 、 zk  、 etcd3
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace:
      group: SEATA_GROUP
      context-path:
      ##1.The following configuration is for the open source version of Nacos
      username: nacos
      password: nacos
  registry:
    # support: nacos 、 eureka 、 redis 、 zk  、 consul 、 etcd3 、 sofa 、 seata
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace:
      cluster: default
      context-path:
      ##1.The following configuration is for the open source version of Nacos
      username: nacos
      password: nacos

  store:
    # support: file 、 db 、 redis 、 raft
    mode: db
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://192.168.0.80:3306/seata?rewriteBatchedStatements=true
      user: root
      password: 123456
      min-conn: 10
      max-conn: 100
      global-table: global_table
      branch-table: branch_table
      lock-table: lock_table
      distributed-lock-table: distributed_lock
      vgroup-table: vgroup_table
      query-limit: 1000
      max-wait: 5000

  security:
    secretKey: SeataSecretKey0c382ef121d778043159209298fd40bf3850a017
    tokenValidityInMilliseconds: 1800000
    csrf-ignore-urls: /metadata/v1/**
    ignore:
      urls: /,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.jpeg,/**/*.ico,/api/v1/auth/login,/version.json,/health,/error
```
### 创建seata数据库和表
[脚本链接](https://github.com/apache/incubator-seata/blob/2.x/script/server/db/mysql.sql)

上面下载的包里也有  D:\koko\seata\seata-server\script\server\db


```sql
create DATABASE seata;
use seata;

-- -------------------------------- The script used when storeMode is 'db' --------------------------------
-- the table to store GlobalSession data
CREATE TABLE IF NOT EXISTS `global_table`
(
    `xid`                       VARCHAR(128) NOT NULL,
    `transaction_id`            BIGINT,
    `status`                    TINYINT      NOT NULL,
    `application_id`            VARCHAR(32),
    `transaction_service_group` VARCHAR(32),
    `transaction_name`          VARCHAR(128),
    `timeout`                   INT,
    `begin_time`                BIGINT,
    `application_data`          VARCHAR(2000),
    `gmt_create`                DATETIME,
    `gmt_modified`              DATETIME,
    PRIMARY KEY (`xid`),
    KEY `idx_status_gmt_modified` (`status` , `gmt_modified`),
    KEY `idx_transaction_id` (`transaction_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- the table to store BranchSession data
CREATE TABLE IF NOT EXISTS `branch_table`
(
    `branch_id`         BIGINT       NOT NULL,
    `xid`               VARCHAR(128) NOT NULL,
    `transaction_id`    BIGINT,
    `resource_group_id` VARCHAR(32),
    `resource_id`       VARCHAR(256),
    `branch_type`       VARCHAR(8),
    `status`            TINYINT,
    `client_id`         VARCHAR(64),
    `application_data`  VARCHAR(2000),
    `gmt_create`        DATETIME(6),
    `gmt_modified`      DATETIME(6),
    PRIMARY KEY (`branch_id`),
    KEY `idx_xid` (`xid`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- the table to store lock data
CREATE TABLE IF NOT EXISTS `lock_table`
(
    `row_key`        VARCHAR(128) NOT NULL,
    `xid`            VARCHAR(128),
    `transaction_id` BIGINT,
    `branch_id`      BIGINT       NOT NULL,
    `resource_id`    VARCHAR(256),
    `table_name`     VARCHAR(32),
    `pk`             VARCHAR(36),
    `status`         TINYINT      NOT NULL DEFAULT '0' COMMENT '0:locked ,1:rollbacking',
    `gmt_create`     DATETIME,
    `gmt_modified`   DATETIME,
    PRIMARY KEY (`row_key`),
    KEY `idx_status` (`status`),
    KEY `idx_branch_id` (`branch_id`),
    KEY `idx_xid` (`xid`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS `distributed_lock`
(
    `lock_key`       CHAR(20) NOT NULL,
    `lock_value`     VARCHAR(20) NOT NULL,
    `expire`         BIGINT,
    primary key (`lock_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('AsyncCommitting', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryCommitting', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryRollbacking', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('TxTimeoutCheck', ' ', 0);

CREATE TABLE IF NOT EXISTS `vgroup_table`
(
    `vGroup`    VARCHAR(255),
    `namespace` VARCHAR(255),
    `cluster`   VARCHAR(255),
  UNIQUE KEY `idx_vgroup_namespace_cluster` (`vGroup`,`namespace`,`cluster`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;
```

### 启动
![bin目录](/assets/images/seata/seata3.png)

双击  seata-server.bat 即可启动！

### 访问
http://localhost:7091/  

账号密码见[修改配置文件](#修改配置文件)中的 console:user:username 和 console:user:password（seata）

![seata管理页](/assets/images/seata/seata_fangwen.png)

## 使用seata

### 创建订单， 账户， 库存 数据库和对应表
```sql
create DATABASE seata_order;
use seata_order;
DROP TABLE IF EXISTS `undo_log`;
CREATE TABLE `undo_log`  (
  `branch_id` bigint NOT NULL COMMENT 'branch transaction id',
  `xid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'global transaction id',
  `context` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'undo_log context,such as serialization',
  `rollback_info` longblob NOT NULL COMMENT 'rollback info',
  `log_status` int NOT NULL COMMENT '0:normal status,1:defense status',
  `log_created` datetime(6) NOT NULL COMMENT 'create datetime',
  `log_modified` datetime(6) NOT NULL COMMENT 'modify datetime',
  UNIQUE INDEX `ux_undo_log`(`xid`, `branch_id`) USING BTREE,
  INDEX `ix_log_created`(`log_created`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'AT transaction mode undo table' ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `t_order`;
CREATE TABLE `t_order`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `product_id` bigint NULL DEFAULT NULL COMMENT '产品ID',
  `count` int NULL DEFAULT NULL COMMENT '数量',
  `money` decimal(11, 2) NULL DEFAULT NULL COMMENT '金额',
  `status` tinyint NULL DEFAULT NULL COMMENT '状态(0-创建中,1-已完结)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic COMMENT='订单表';


create DATABASE seata_account;
use seata_account;
DROP TABLE IF EXISTS `undo_log`;
CREATE TABLE `undo_log`  (
  `branch_id` bigint NOT NULL COMMENT 'branch transaction id',
  `xid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'global transaction id',
  `context` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'undo_log context,such as serialization',
  `rollback_info` longblob NOT NULL COMMENT 'rollback info',
  `log_status` int NOT NULL COMMENT '0:normal status,1:defense status',
  `log_created` datetime(6) NOT NULL COMMENT 'create datetime',
  `log_modified` datetime(6) NOT NULL COMMENT 'modify datetime',
  UNIQUE INDEX `ux_undo_log`(`xid`, `branch_id`) USING BTREE,
  INDEX `ix_log_created`(`log_created`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'AT transaction mode undo table' ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `t_account`;
CREATE TABLE `t_account`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '账户ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `total` decimal(11, 2) NULL DEFAULT NULL COMMENT '总额度',
  `used` decimal(11, 2) NULL DEFAULT NULL COMMENT '已用账户额度',
  `residue` decimal(11, 2) NULL DEFAULT NULL COMMENT '剩余可用额度',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic  COMMENT='账户表';
INSERT INTO `t_account` VALUES (1, 1, 1000.00, 0.00, 1000.00);

create DATABASE seata_storage;
use seata_storage;
DROP TABLE IF EXISTS `undo_log`;
CREATE TABLE `undo_log`  (
  `branch_id` bigint NOT NULL COMMENT 'branch transaction id',
  `xid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'global transaction id',
  `context` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'undo_log context,such as serialization',
  `rollback_info` longblob NOT NULL COMMENT 'rollback info',
  `log_status` int NOT NULL COMMENT '0:normal status,1:defense status',
  `log_created` datetime(6) NOT NULL COMMENT 'create datetime',
  `log_modified` datetime(6) NOT NULL COMMENT 'modify datetime',
  UNIQUE INDEX `ux_undo_log`(`xid`, `branch_id`) USING BTREE,
  INDEX `ix_log_created`(`log_created`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'AT transaction mode undo table' ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `t_storage`;
CREATE TABLE `t_storage`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '库存ID',
  `product_id` bigint NULL DEFAULT NULL COMMENT '产品ID',
  `total` int NULL DEFAULT NULL COMMENT '总库存',
  `used` int NULL DEFAULT NULL COMMENT '已用库存',
  `residue` int NULL DEFAULT NULL COMMENT '剩余库存',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic  COMMENT='库存表';
INSERT INTO `t_storage` VALUES (1, 1, 100, 0, 100);
```

### 订单服务
::: tabs#service

@tab application.yml
```yml  
server:
  port: 2001
spring:
  application:
    name: seata-order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://192.168.0.80:3306/seata_order?useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&tinyInt1isBit=false&useLegacyDatetimeCode=false&serverTimezone=Asia/Shanghai&useSSL=false&zeroDateTimeBehavior=CONVERT_TO_NULL
    username: root
    password: 123456
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.cloud.entity
  configuration:
    map-underscore-to-camel-case: true
seata:
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: ""
      group: SEATA_GROUP
      application: seata-server
  # 事务组， 由它获得 TC 服务的集群名称
  tx-service-group: default_tx_group
  service:
    vgroup-mapping:
      # 事务组与 TC 服务集群的映射关系
      default_tx_group: default
  data-source-proxy-mode: AT
logging:
  level:
    io:
      seata: info
```

@tab 主启动类
```java
package org.example.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import tk.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@MapperScan("org.example.cloud.mapper")
public class SeataOrder2001 {
    public static void main(String[] args) {
        SpringApplication.run(SeataOrder2001.class, args);
    }
}
```

@tab Controller

```java
package org.example.cloud.controller;

import jakarta.annotation.Resource;
import org.example.cloud.entity.Order;
import org.example.cloud.service.OrderService;
import org.example.cloud.web.ResultData;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    @Resource
    private OrderService orderService;


    @PostMapping("/order/create")
    public ResultData<Order> create (@RequestBody Order order) {
        orderService.create(order);
        return ResultData.success(order);
    }
}

```

@tab Service
```java
package org.example.cloud.service;

import org.example.cloud.entity.Order;

public interface OrderService {
    /**
     * 创建订单
     * @param order
     */
    void create(Order order);
}

```
```java
package org.example.cloud.service.impl;

import io.seata.core.context.RootContext;
import io.seata.spring.annotation.GlobalTransactional;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.example.cloud.apis.AccountFeignApi;
import org.example.cloud.apis.StorageFeignApi;
import org.example.cloud.entity.Order;
import org.example.cloud.mapper.OrderMapper;
import org.example.cloud.service.OrderService;
import org.springframework.stereotype.Service;
import tk.mybatis.mapper.entity.Example;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

    @Resource
    private OrderMapper orderMapper;
    @Resource
    private AccountFeignApi accountFeignApi;
    @Resource
    private StorageFeignApi storageFeignApi;

    @Override
    @GlobalTransactional(name = "global-create-order", rollbackFor = Exception.class)
    public void create(Order order) {
        // xid 全局事务id的检查
        String xid = RootContext.getXID();
        // 新建订单
        log.info("------------开始新建订单， xid= {}", xid);
        order.setStatus(0);
        int result = orderMapper.insertSelective(order);
        Order orderFromDB = null;
        if (result > 0) {
            orderFromDB = orderMapper.selectOne(order);
            log.info("----> 新建订单成功， orderFromDB= {}", orderFromDB.toString());
            System.out.println();
            // 2. 扣减库存
            log.info("----> 开始扣减库存， productId: {}, count={}", orderFromDB.getProductId(), orderFromDB.getCount());
            storageFeignApi.decrease(orderFromDB.getProductId(), orderFromDB.getCount());
            log.info("----> 扣减库存完成 -----");
            System.out.println();
            // 3. 扣减账户余额
            log.info("----> 开始扣减账户余额存， userId: {}, money={}", orderFromDB.getUserId(), orderFromDB.getMoney());
            accountFeignApi.decrease(orderFromDB.getUserId(), orderFromDB.getMoney());
            log.info("----> 扣减账户余额成功 -----");

            System.out.println();
            log.info("----> 开始修改订单状态");
            // 4. 修改订单状态
            orderFromDB.setStatus(1);

            Example condition = new Example(Order.class);
            Example.Criteria criteria = condition.createCriteria();
            criteria.andEqualTo("userId", orderFromDB.getUserId());
            criteria.andEqualTo("status", 0);
            orderMapper.updateByExampleSelective(orderFromDB, condition);
            log.info("----> 修改订单状态完成  ---------- orderFromDB = {}", orderFromDB.toString());

        }
        log.info("结束新建订单， xid= {}", xid);
    }
}
```
@tab Mapper
```java
package org.example.cloud.mapper;

import org.example.cloud.entity.Order;
import tk.mybatis.mapper.common.Mapper;

public interface OrderMapper extends Mapper<Order> {
}
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.example.cloud.mapper.OrderMapper">
  <resultMap id="BaseResultMap" type="org.example.cloud.entity.Order">
    <!--
      WARNING - @mbg.generated
    -->
    <id column="id" jdbcType="BIGINT" property="id" />
    <result column="user_id" jdbcType="BIGINT" property="userId" />
    <result column="product_id" jdbcType="BIGINT" property="productId" />
    <result column="count" jdbcType="INTEGER" property="count" />
    <result column="money" jdbcType="DECIMAL" property="money" />
    <result column="status" jdbcType="TINYINT" property="status" />
  </resultMap>
</mapper>
```

@tab Entity
```java
package org.example.cloud.entity;

import lombok.Data;
import lombok.ToString;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
/**
 * 表名：t_order
 * 表注释：订单表
*/
@Data
@Table(name = "t_order")
@ToString
public class Order implements Serializable {
    /**
     * 订单ID
     */
    @Id
    @GeneratedValue(generator = "JDBC")
    private Long id;
    /**
     * 用户ID
     */
    @Column(name = "user_id")
    private Long userId;
    /**
     * 产品ID
     */
    @Column(name = "product_id")
    private Long productId;
    /**
     * 数量
     */
    private Integer count;
    /**
     * 金额
     */
    private BigDecimal money;
    /**
     * 状态(0-创建中,1-已完结)
     */
    private Integer status;

}
```

@tab MAVEN依赖
```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    <dependency>
        <groupId>org.example.cloud</groupId>
        <artifactId>common</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    </dependency>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <!-- 持久化 -->
    <dependency>
        <groupId>javax.persistence</groupId>
        <artifactId>persistence-api</artifactId>
    </dependency>
    <dependency>
        <groupId>tk.mybatis</groupId>
        <artifactId>mapper</artifactId>
    </dependency>
    <dependency>
        <groupId>cn.hutool</groupId>
        <artifactId>hutool-all</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```
:::

::: important
 @GlobalTransactional(name = "global-create-order", rollbackFor = Exception.class)

 加上 @GlobalTransactional 注解， 标识开启分布式全局事务
:::


### 账户服务
::: tabs#service

@tab application.yml
```yml
server:
  port: 2003

spring:
  application:
    name: seata-account-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://192.168.0.80:3306/seata_account?useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&tinyInt1isBit=false&useLegacyDatetimeCode=false&serverTimezone=Asia/Shanghai&useSSL=false&zeroDateTimeBehavior=CONVERT_TO_NULL
    username: root
    password: 123456

mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.cloud.entity
  configuration:
    map-underscore-to-camel-case: true

seata:
  registry:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP
      application: seata-server
  # 事务组， 由它获得 TC 服务的集群名称
  tx-service-group: default_tx_group
  service:
    vgroup-mapping:
      # 事务组与 TC 服务集群的映射关系
      default_tx_group: default
  data-source-proxy-mode: AT

logging:
  level:
    io:
      seata: info
```

@tab 主启动类
```java
package org.example.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import tk.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@MapperScan("org.example.cloud.mapper")
public class SeataAccount2003 {
    public static void main(String[] args) {
        SpringApplication.run(SeataAccount2003.class, args);
    }
}
```

@tab Controller
```java
package org.example.cloud.controller;

import jakarta.annotation.Resource;
import org.example.cloud.service.AccountService;
import org.example.cloud.web.ResultData;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
public class AccountController {

    @Resource
    private AccountService accountService;
    /**
     * 扣减账户余额
     * @param userId 用户ID
     * @param money 金额
     * @return
     */
    @PostMapping(value = "/account/decrease")
    public ResultData decrease(@RequestParam("userId") Long userId, @RequestParam("money") BigDecimal money) {
        accountService.decrease(userId, money);
        return ResultData.success("扣减账户余额成功");
    }
}
```
@tab Service
```java
package org.example.cloud.service;
import java.math.BigDecimal;

public interface AccountService {

    void decrease(Long userId,  BigDecimal money);
}
```
```java
package org.example.cloud.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.example.cloud.mapper.AccountMapper;
import org.example.cloud.service.AccountService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AccountServiceImpl implements AccountService {

    @Resource
    private AccountMapper accountMapper;

    @Override
    public void decrease(Long userId, BigDecimal money) {
        log.info(" account-service decrease account 扣减账户余额开始");
        accountMapper.decrease(userId, money);
        // 用于模拟异常情况，回滚
//        myTimeOut();
//        int age = 10/0;
        log.info(" account-service decrease account 扣减账户余额结束");
    }

    private static void myTimeOut () {
        try {
            TimeUnit.SECONDS.sleep(65);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```
@tab Mapper
```java
package org.example.cloud.mapper;

import org.apache.ibatis.annotations.Param;
import org.example.cloud.entity.Account;
import tk.mybatis.mapper.common.Mapper;

import java.math.BigDecimal;

public interface AccountMapper extends Mapper<Account> {

    void decrease(@Param("userId") Long userId,@Param("money") BigDecimal money);
}
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.example.cloud.mapper.AccountMapper">
  <resultMap id="BaseResultMap" type="org.example.cloud.entity.Account">
    <!--
      WARNING - @mbg.generated
    -->
    <id column="id" jdbcType="BIGINT" property="id" />
    <result column="user_id" jdbcType="BIGINT" property="userId" />
    <result column="total" jdbcType="DECIMAL" property="total" />
    <result column="used" jdbcType="DECIMAL" property="used" />
    <result column="residue" jdbcType="DECIMAL" property="residue" />
  </resultMap>

  <update id="decrease">
    update t_account
    set used = used + #{money},
        residue = residue - #{money}
    where user_id = #{userId}
  </update>
</mapper>
```
@tab Entity
```java
package org.example.cloud.entity;

import lombok.Data;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
/**
 * 表名：t_account
 * 表注释：账户表
*/
@Data
@Table(name = "t_account")
@ToString
public class Account implements Serializable {
    /**
     * 账户ID
     */
    @Id
    @GeneratedValue(generator = "JDBC")
    private Long id;
    /**
     * 用户ID
     */
    @Column(name = "user_id")
    private Long userId;
    /**
     * 总额度
     */
    private BigDecimal total;
    /**
     * 已用账户额度
     */
    private BigDecimal used;
    /**
     * 剩余可用额度
     */
    private BigDecimal residue;
}
```

@tab MAVEN依赖
```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    <dependency>
        <groupId>org.example.cloud</groupId>
        <artifactId>common</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    </dependency>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <!-- 持久化 -->
    <dependency>
        <groupId>javax.persistence</groupId>
        <artifactId>persistence-api</artifactId>
    </dependency>
    <dependency>
        <groupId>tk.mybatis</groupId>
        <artifactId>mapper</artifactId>
    </dependency>
    <dependency>
        <groupId>cn.hutool</groupId>
        <artifactId>hutool-all</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```
:::

### 库存服务
::: tabs#service

@tab application.yml
```yml
server:
  port: 2002

spring:
  application:
    name: seata-storage-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://192.168.0.80:3306/seata_storage?useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&tinyInt1isBit=false&useLegacyDatetimeCode=false&serverTimezone=Asia/Shanghai&useSSL=false&zeroDateTimeBehavior=CONVERT_TO_NULL
    username: root
    password: 123456

mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.cloud.entity
  configuration:
    map-underscore-to-camel-case: true

seata:
  registry:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace: ""
      group: SEATA_GROUP
      application: seata-server
  # 事务组， 由它获得 TC 服务的集群名称
  tx-service-group: default_tx_group
  service:
    vgroup-mapping:
      # 事务组与 TC 服务集群的映射关系
      default_tx_group: default
  data-source-proxy-mode: AT

logging:
  level:
    io:
      seata: info
```

@tab 主启动类
```java
package org.example.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import tk.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@MapperScan("org.example.cloud.mapper")
public class SeataStorage2002 {
    public static void main(String[] args) {
        SpringApplication.run(SeataStorage2002.class, args);
    }
}
```

@tab Controller
```java
package org.example.cloud.controller;

import jakarta.annotation.Resource;
import org.example.cloud.mapper.StorageMapper;
import org.example.cloud.service.StorageService;
import org.example.cloud.web.ResultData;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StorageController {

    @Resource
    private StorageService storageService;

    /**
     * 扣减库存
     * @param productId 产品ID
     * @param count 数量
     * @return
     */
    @PostMapping(value = "/storage/decrease")
    public ResultData decrease(@RequestParam("productId") Long productId, @RequestParam("count")  Integer count) {
        storageService.decrease(productId, count);
        return ResultData.success("扣减库存成功");
    }
}
```
@tab Service
```java
package org.example.cloud.service;

public interface StorageService {

    void decrease(Long productId, Integer count);

}
```
```java
package org.example.cloud.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.example.cloud.mapper.StorageMapper;
import org.example.cloud.service.StorageService;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class StorageServiceImpl implements StorageService {
    @Resource
    private StorageMapper storageMapper;
    @Override
    public void decrease(Long productId, Integer count) {
        log.info(" storage-service decrease storage 扣减库存开始");
        storageMapper.decrease(productId, count);
        log.info(" storage-service decrease storage 扣减库存结束");
    }
}
```
@tab Mapper
```java
package org.example.cloud.mapper;

import org.apache.ibatis.annotations.Param;
import org.example.cloud.entity.Storage;
import tk.mybatis.mapper.common.Mapper;

public interface StorageMapper extends Mapper<Storage> {

    void decrease (@Param("productId") Long productId, @Param("count") Integer count);
}
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.example.cloud.mapper.StorageMapper">
  <resultMap id="BaseResultMap" type="org.example.cloud.entity.Storage">
    <!--
      WARNING - @mbg.generated
    -->
    <id column="id" jdbcType="BIGINT" property="id" />
    <result column="product_id" jdbcType="BIGINT" property="productId" />
    <result column="total" jdbcType="INTEGER" property="total" />
    <result column="used" jdbcType="INTEGER" property="used" />
    <result column="residue" jdbcType="INTEGER" property="residue" />
  </resultMap>

  <update id="decrease">
    update t_storage
    set used = used + #{count},
        residue = residue - #{count}
    where product_id = #{productId}
  </update>
</mapper>
```
@tab Entity
```java
package org.example.cloud.entity;

import lombok.Data;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
/**
 * 表名：t_storage
 * 表注释：库存表
*/
@Data
@Table(name = "t_storage")
@ToString
public class Storage implements Serializable {
    /**
     * 库存ID
     */
    @Id
    @GeneratedValue(generator = "JDBC")
    private Long id;
    /**
     * 产品ID
     */
    @Column(name = "product_id")
    private Long productId;
    /**
     * 总库存
     */
    private Integer total;
    /**
     * 已用库存
     */
    private Integer used;
    /**
     * 剩余库存
     */
    private Integer residue;

}
```

@tab MAVEN依赖
```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    <dependency>
        <groupId>org.example.cloud</groupId>
        <artifactId>common</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    </dependency>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <!-- 持久化 -->
    <dependency>
        <groupId>javax.persistence</groupId>
        <artifactId>persistence-api</artifactId>
    </dependency>
    <dependency>
        <groupId>tk.mybatis</groupId>
        <artifactId>mapper</artifactId>
    </dependency>
    <dependency>
        <groupId>cn.hutool</groupId>
        <artifactId>hutool-all</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```
:::


### 运行中
![运行时](/assets/images/seata/seata_running.png)