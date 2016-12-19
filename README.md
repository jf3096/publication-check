# publication-check
[![NPM](https://nodei.co/npm/tinypng-loader-cli.png)](https://www.npmjs.com/package/tinypng-loader-cli)

## 简介
publication-check 顾名思义, 一个用于为发布包而开发的校验工具。项目开发完成后，项目可以使用gulp，fis，webpack等构建工具打包成zip，tar
等存档包并上传到自己的而是环境或正式环境。但在前后端分离的情况下，项目可变性是很大的。例如：后端接口重构，需要对所有前端请求API接口做相应
更新，我们通过自动化工具甚至全局替换的方式去更新，但是往往这会导致替换错误，漏替换等不稳定的场景发生。又例如，在开发环境和正式环境的部署过程中，
由于环境不同我们往往需要定制不同的配置文件从而达到切换开发环境和正式环境的效果。而这里在日常部署环节下仍出现不小心部署错误的或旧版的配置文件导致
正式环境崩溃。这并不能怪程序员，因为在多次版本迭代变更等不稳定因素下，出错是难免的。 所以publication-check就是编写一个部署的环节，从而大大减少甚至
杜绝不稳定变更下部署出错。

### 安装
```bash
npm install publication-check -g
```

### 环境
* NodeJS

### 如何使用

打开命令行工具键入:

`publication-check -z <你的压缩文件路径> -m <你的manifest配置文件路径>`

```
  Usage: index [options]

  Options:

    -h, --help            输出命令帮助信息
    -V, --version         输出版本号
    -z, --zip <value>     输入压缩文件路径
    -m, --dest <value>    输入manifest配置文件路径
```
#### manifest文件配置
配置文件<b>必须包含</b>:
    > checkList
    > blackList

checkList在这里表示当前发布包的某文件下<b>必须包含</b> <某字段> 或 <某正则>
blackList在这里表示当前发布包的某文件下<b>禁止包含</b> <某字段> 或 <某正则>

例子#1 - 空manifest配置文件:
```json
    {
      "checkList": {

      },
      "blackList": {

      }
    }
```

例子#2 - 所有js文件必须包含<Author:Ailun She>:
```json
    {
      "checkList": {
        "**/*.js": [
          "Author:Ailun She"
        ]
      },
      "blackList": {

      }
    }
```

例子#3 - 所有js文件必须包含<Author:Ailun She>, 且不能出现console.log等关键字:
```json
    {
      "Web.config": {
        "**/*.js": [
          "Author:Ailun She"
        ]
      },
      "blackList": {
        "**/*.js": [
          "console.log"
        ]
      }
    }
```

例子#4 - 确保Web.config中不能出现kph.开头若干字符.com的关键字, 且必须出现taobao.com的关键字
```json
    {
      "checkList": {
        "**/*.js": [
          "taobao.com"
        ]
      },
      "blackList": {
        "**/*.js": [
          "/kph\..*?\.com/"
        ]
      }
    }
```

### Screenshot
Here is a normal case if you use this library correctly
![alt tag](/git-img/success.png)