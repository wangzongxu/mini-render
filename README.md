## 一个轻量的模板引擎

### 开始
- 安装
```bash
npm install mini-render --save
// 或者
<script src='miniRender.js'></script>
```

- 定义一些数据
```js
var data = {
    gt: 7,
    lt: 6,
    first: 'first',
    array: [1,2,3],
    object: {
         key1: 'value1',
        key2: 'value2'
    },
    word: 'aaaaa',
    empty: undefined
}
// 渲染元素模板
miniRender.renderElement('#box', data)

// 也可以返回渲染结果
var str = miniRender.renderString('<div>{{word}}</div>', data)
console.log(str)

```

### 渲染
```html
<p>{{ first }}</p>
<!--结果:
    <p>first</p>
-->
```

- 支持三元运算
```html
<p>{{ gt > 8 ? gt : 8 }}</p>
<!--结果:
    <p>8</p>
-->

```

### 过滤
```html
<p>{{ word | toUpperCase }}</p>
<!--结果: 
    <p>AAAAA</p>
-->

<script>
// 注册过滤器
miniRender.filter('toUpperCase', function(val){
    return val.toUpperCase()
})
// 移除过滤器
miniRender.removeFilter('toUpperCase')
</script>
```
> 过滤器仅可用在上边这种普通的取值中

### 判断
```html
{{IF gt > lt}}
    <p>gt比较大:{{gt}}</p>
{{ELSEIF lt < gt}}
    <p>lt比较小:{{lt}}</p>
{{ELSE}}
    <p>都不成立</p>
{{/IF}}
<!--结果:
    <p>gt比较大:7</p>
-->
```

### 循环
```html
<!--数组-->
{{EACH array}}
    <p>索引:{{$key}}  值:{{$value}}</p>
{{/EACH}}
<!--结果:
    <p>索引:0  值:1</p>
    <p>索引:1  值:2</p>
    <p>索引:2  值:3</p>
-->

<!--对象-->
{{EACH object}}
    <p>属性名:{{$key}}  属性值:{{$value}}</p>
{{/EACH}}
<!--结果:
    <p>属性名:key1  属性值:value1</p>
    <p>属性名:key2  属性值:value2</p>
-->
```