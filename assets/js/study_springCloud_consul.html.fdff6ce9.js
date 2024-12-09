"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[6601],{6262:(n,s)=>{s.A=(n,s)=>{const e=n.__vccOpts||n;for(const[n,a]of s)e[n]=a;return e}},950:(n,s,e)=>{e.r(s),e.d(s,{comp:()=>l,data:()=>t});var a=e(641);const i={},l=(0,e(6262).A)(i,[["render",function(n,s){return(0,a.uX)(),(0,a.CE)("div",null,s[0]||(s[0]=[(0,a.Fv)('<h1 id="spring-cloud-consul" tabindex="-1"><a class="header-anchor" href="#spring-cloud-consul"><span>Spring Cloud Consul</span></a></h1><h2 id="文献" tabindex="-1"><a class="header-anchor" href="#文献"><span>文献</span></a></h2><p><a href="https://consul.io" target="_blank" rel="noopener noreferrer">官网地址</a></p><p><a href="https://docs.spring.io/spring-cloud-consul/reference/" target="_blank" rel="noopener noreferrer">Spring社区</a></p><p><a href="https://github.com/spring-cloud/spring-cloud-consul" target="_blank" rel="noopener noreferrer">GitHub</a></p><p><a href="https://developer.hashicorp.com/consul/install" target="_blank" rel="noopener noreferrer">下载</a></p><h2 id="下载安装" tabindex="-1"><a class="header-anchor" href="#下载安装"><span>下载安装</span></a></h2><h3 id="下载安装-1" tabindex="-1"><a class="header-anchor" href="#下载安装-1"><span>下载安装</span></a></h3><p><a href="https://developer.hashicorp.com/consul/install#windows" target="_blank" rel="noopener noreferrer">下载地址</a> 下载后解压即可！</p><h3 id="启动" tabindex="-1"><a class="header-anchor" href="#启动"><span>启动</span></a></h3><p>启动命令, 进入解压包目录，开发者模式运行</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span>consul agent -dev</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="持久化" tabindex="-1"><a class="header-anchor" href="#持久化"><span>持久化</span></a></h3><p>添加启动命令，持久化consul配置，后台启动</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span>@echo.服务启动.......</span></span>\n<span class="line"><span>chcp 65001</span></span>\n<span class="line"><span>@echo off</span></span>\n<span class="line"><span>@sc create Consul binpath=&quot;D:\\install\\consul\\consul.exe agent -server -ui -bind=127.0.0.1 -client=0.0.0.0 -bootstrap-expect 1 -data-dir D:\\install\\consul\\mydata &quot;</span></span>\n<span class="line"><span>@net start Consul</span></span>\n<span class="line"><span>@sc config Consul start=AUTO</span></span>\n<span class="line"><span>@echo.Consul start is OK ...... success</span></span>\n<span class="line"><span>@pause</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="访问" tabindex="-1"><a class="header-anchor" href="#访问"><span>访问</span></a></h3><p>http://localhost:8500</p><h2 id="集成到springboot" tabindex="-1"><a class="header-anchor" href="#集成到springboot"><span>集成到Springboot</span></a></h2><h3 id="添加依赖" tabindex="-1"><a class="header-anchor" href="#添加依赖"><span>添加依赖</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span>&lt;dependency&gt;</span></span>\n<span class="line"><span>    &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;</span></span>\n<span class="line"><span>    &lt;artifactId&gt;spring-cloud-starter-consul-discovery&lt;/artifactId&gt;</span></span>\n<span class="line"><span>    &lt;exclusions&gt;</span></span>\n<span class="line"><span>        &lt;exclusion&gt;</span></span>\n<span class="line"><span>            &lt;groupId&gt;commons-logging&lt;/groupId&gt;</span></span>\n<span class="line"><span>            &lt;artifactId&gt;commons-logging&lt;/artifactId&gt;</span></span>\n<span class="line"><span>        &lt;/exclusion&gt;</span></span>\n<span class="line"><span>    &lt;/exclusions&gt;</span></span>\n<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="添加配置" tabindex="-1"><a class="header-anchor" href="#添加配置"><span>添加配置</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span>spring:</span></span>\n<span class="line"><span>  application: </span></span>\n<span class="line"><span>    name: my-project-name</span></span>\n<span class="line"><span>  cloud:</span></span>\n<span class="line"><span>    consul:</span></span>\n<span class="line"><span>      host: localhost</span></span>\n<span class="line"><span>      port: 8500</span></span>\n<span class="line"><span>      discovery:</span></span>\n<span class="line"><span>        service-name: ${spring.application.name}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="主启动类" tabindex="-1"><a class="header-anchor" href="#主启动类"><span>主启动类</span></a></h3><p>添加注解 @EnableDiscoveryClient</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span>@SpringBootApplication</span></span>\n<span class="line"><span>@EnableDiscoveryClient</span></span>\n<span class="line"><span>public class Application {</span></span>\n<span class="line"><span>    public static void main(String[] args) {</span></span>\n<span class="line"><span>        SpringApplication.run(Application.class, args);</span></span>\n<span class="line"><span>    }</span></span>\n<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="tip" tabindex="-1"><a class="header-anchor" href="#tip"><span>tip</span></a></h3><p>consul 默认是集群环境。 如果要使用 RestTemplate 调用集成到consul 中的其他微服务需要负载均衡</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span>@Bean</span></span>\n<span class="line"><span>@LoadBalanced</span></span>\n<span class="line"><span>public RestTemplate restTemplate() {</span></span>\n<span class="line"><span>    return new RestTemplate();</span></span>\n<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="其他" tabindex="-1"><a class="header-anchor" href="#其他"><span>其他</span></a></h2><h3 id="cap理论" tabindex="-1"><a class="header-anchor" href="#cap理论"><span>CAP理论</span></a></h3><p>CAP理论： 一致性，可用性 和 分区容错性</p><ul><li>CA: 单点集群，满足一致性，可用性的系统，扩展性不强</li><li>CP: 满足一致性，分区容错性的系统， 性能不高</li><li>AP:满足可用性，分区容错性， 对一致性的要求低一些</li></ul><h3 id="对比" tabindex="-1"><a class="header-anchor" href="#对比"><span>对比</span></a></h3><table><thead><tr><th>组件</th><th>Eureka</th><th>Consul</th><th>Zoopeeper</th></tr></thead><tbody><tr><td>语言</td><td>JAVA</td><td>Go</td><td>JAVA</td></tr><tr><td>CAP</td><td>AP</td><td>CP</td><td>CP</td></tr><tr><td>服务健康检查</td><td>可配支持</td><td>支持</td><td>支持</td></tr><tr><td>对外暴露接口</td><td>HTTP</td><td>HTTP/DNS</td><td>客户端</td></tr><tr><td>SpringCloud</td><td>已集成</td><td>已集成</td><td>已集成</td></tr></tbody></table>',34)]))}]]),t=JSON.parse('{"path":"/study/springCloud/consul.html","title":"Spring Cloud Consul","lang":"zh-CN","frontmatter":{"icon":"pen-to-square","date":"2024-12-07T00:00:00.000Z","category":["SpringCloud"],"tag":["spring","SpringCloud","Java"],"description":"Spring Cloud Consul 文献 官网地址 Spring社区 GitHub 下载 下载安装 下载安装 下载地址 下载后解压即可！ 启动 启动命令, 进入解压包目录，开发者模式运行 持久化 添加启动命令，持久化consul配置，后台启动 访问 http://localhost:8500 集成到Springboot 添加依赖 添加配置 主启动类...","head":[["meta",{"property":"og:url","content":"https://liuke512.github.io/blog/blog/study/springCloud/consul.html"}],["meta",{"property":"og:site_name","content":"koko博客"}],["meta",{"property":"og:title","content":"Spring Cloud Consul"}],["meta",{"property":"og:description","content":"Spring Cloud Consul 文献 官网地址 Spring社区 GitHub 下载 下载安装 下载安装 下载地址 下载后解压即可！ 启动 启动命令, 进入解压包目录，开发者模式运行 持久化 添加启动命令，持久化consul配置，后台启动 访问 http://localhost:8500 集成到Springboot 添加依赖 添加配置 主启动类..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-12-09T01:41:16.000Z"}],["meta",{"property":"article:tag","content":"spring"}],["meta",{"property":"article:tag","content":"SpringCloud"}],["meta",{"property":"article:tag","content":"Java"}],["meta",{"property":"article:published_time","content":"2024-12-07T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-12-09T01:41:16.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Spring Cloud Consul\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-12-07T00:00:00.000Z\\",\\"dateModified\\":\\"2024-12-09T01:41:16.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Mr.Liu\\",\\"url\\":\\"https://liuke512.github.io/blog/\\"}]}"]]},"headers":[{"level":2,"title":"文献","slug":"文献","link":"#文献","children":[]},{"level":2,"title":"下载安装","slug":"下载安装","link":"#下载安装","children":[{"level":3,"title":"下载安装","slug":"下载安装-1","link":"#下载安装-1","children":[]},{"level":3,"title":"启动","slug":"启动","link":"#启动","children":[]},{"level":3,"title":"持久化","slug":"持久化","link":"#持久化","children":[]},{"level":3,"title":"访问","slug":"访问","link":"#访问","children":[]}]},{"level":2,"title":"集成到Springboot","slug":"集成到springboot","link":"#集成到springboot","children":[{"level":3,"title":"添加依赖","slug":"添加依赖","link":"#添加依赖","children":[]},{"level":3,"title":"添加配置","slug":"添加配置","link":"#添加配置","children":[]},{"level":3,"title":"主启动类","slug":"主启动类","link":"#主启动类","children":[]},{"level":3,"title":"tip","slug":"tip","link":"#tip","children":[]}]},{"level":2,"title":"其他","slug":"其他","link":"#其他","children":[{"level":3,"title":"CAP理论","slug":"cap理论","link":"#cap理论","children":[]},{"level":3,"title":"对比","slug":"对比","link":"#对比","children":[]}]}],"git":{"createdTime":1733708476000,"updatedTime":1733708476000,"contributors":[{"name":"刘科","email":"liuke@jizhibao.com.cn","commits":1}]},"readingTime":{"minutes":1.36,"words":408},"filePathRelative":"study/springCloud/consul.md","localizedDate":"2024年12月7日","excerpt":"\\n<h2>文献</h2>\\n<p><a href=\\"https://consul.io\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">官网地址</a></p>\\n<p><a href=\\"https://docs.spring.io/spring-cloud-consul/reference/\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Spring社区</a></p>\\n<p><a href=\\"https://github.com/spring-cloud/spring-cloud-consul\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">GitHub</a></p>","autoDesc":true}')}}]);