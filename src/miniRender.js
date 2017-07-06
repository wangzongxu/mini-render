;(function(name, factory){
    var root = typeof window === 'object'
               ? window 
               : global;
    if (typeof root.define === 'function') {
        define(factory)
    } else if (typeof root.module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        root[name] = factory()
    }
}('miniRender', function() {
    var tools = {
        extends: function(source, target) {
            for (var k in target) {
                if (target.hasOwnProperty(k)) {
                    source[k] = target[k]
                }
            }
        },
        isEmpty: function(target) {
            var count = 0
            this.each(target, function(){
                count ++
            })
            return count === 0
        },
        is: function(target, type) {
            var reg = new RegExp('\\s' + type + ']')
            return reg.test(
                Object.prototype.toString.call(target)
            )
        },
        each: function(target, cb) {
            if (this.is(target, 'Array')) {
                for (var i = 0; i < target.length; i ++) {
                    var item = target[i]
                    cb(item, i, target)
                }
            } else if (this.is(target, 'Object')) {
                 for (var k in target) {
                    if (target.hasOwnProperty(k)) {
                        cb(target[k], k, target)
                    }
                }
            } else {
                throw new Error('"EACH" params must be Array or Object')
            }
        },
        decode: function(str) {
            var map = {
                "&lt;": "<",
                "&gt;": ">",
                "&nbsp;": " ",
                "&quot;": "\"",
                "&amp;": "&"
            }
            this.each(map, function(val, k) {
                str = str.replace(new RegExp(k, 'g'), val)
            })
            return str
        }
    }
    function Render() {
        this.startFlag = '{{'
        this.endFlag = '}}'
        this.commentsReg = /<!--[\s\S]*?-->/g
        this.flagTrimReg = /\{\{\s*?(\S(\s*\S+)*?)\s*?\}\}/g
        this.ifReg = /^\s*IF\s+/
        this.endIfReg = /^\s*\/IF\s*$/
        this.elseIfReg = /^\s*ELSEIF\s+/
        this.elseReg = /^\s*ELSE\s*$/
        this.eachReg = /^\s*EACH\s+/
        this.endEachReg = /^\s*\/EACH\s*$/
        this.filterReg = /\s*[^\|]\|[^\|]\s*/
        this.filterMap = {}
    }
    Render.prototype = {
        tools: tools,
        config: function(config) { // 自定义配置
            tools.extends(this, config)
        },
        handleSpecialSymbols: function(str) { // 处理特殊字符
            return str.replace(this.commentsReg, '')
                      .replace(this.flagTrimReg, this.startFlag + '$1' + this.endFlag)
                      .replace(/\n/g, '\\n')
                      .replace(/\r/g, '\\r')
                      .replace(/\t/g, '\\t')
                      .replace(/\f/g, '\\f')
                      .replace(/\v/g, '\\v')
                      .trim()
        },
        makeVariableSet: function(data) { // 制作变量名序列
            var set = []
            tools.each(data, function(val, k) {
                set.push(k)
            })
            return set
        },
        replaceVariable: function(str, arr) { // 将变量添加‘__MINI_RENDER__.’
            tools.each(arr, function(item) {
                var reg = new RegExp('(^|[^."\'\w])(' + item + ')([^"\'\w]|$)', 'g')
                str = str.replace(reg, '$1__MINI_RENDER__.$2$3')
            })
            return str
        },
        filter: function(name, cb) {
            this.filterMap[name] = cb
        },
        removeFilter: function(name) {
            delete this.filterMap[name]
        },
        renderString: function(str, data) {
            if (!tools.is(str, 'String')) return ''
            if (!data) return str
            var fn = this.render(str, data)
            return fn(data)
        },
        renderElement: function(selector, data) {
            var el = document.querySelector(selector)

            if (!el) return ''
            if (!data) return false

            var fn = this.render(el.innerHTML, data)
            el.innerHTML = fn(data)
            return true
        },
        render: function(content, data) {
            
            content = this.handleSpecialSymbols(content)
            var splitStartArr = content.split(this.startFlag)
            var variableSet = this.makeVariableSet(data)

            var code = 'var output = "";'
            code += 'var filters = {'
            // add filters
            if (!tools.isEmpty(this.filterMap)) {
                tools.each(this.filterMap, function(val, k) {
                    code += k + ': ' + val + ','
                })
            }
            code += '};'
            for (var i = 0; i < splitStartArr.length; i++) {
                var item =splitStartArr[i]

                var splitEndArr = item.split(this.endFlag)

                var coding,
                    str
                
                if (splitEndArr.length > 1) {
                    coding =splitEndArr[0]
                    str =splitEndArr[1]
                } else {
                    str =splitEndArr[0]
                }
                // handle code
                if (coding) {

                    coding = tools.decode(coding)
                    coding = this.replaceVariable(coding, variableSet)
                     // if
                    if (this.ifReg.test(coding)) {
                        coding = coding.replace(this.ifReg, '')
                        code += 'if (' + coding + ') {'
                    } else if (this.elseIfReg.test(coding)) {
                        coding = coding.replace(this.elseIfReg, '')
                        code += '} else if (' + coding + ') {'
                    } else if (this.elseReg.test(coding)) {
                        code += '} else {'
                    } else if (this.endIfReg.test(coding)) {
                        code += '}'
                     // each
                    } else if (this.eachReg.test(coding)) {
                        coding = coding.replace(this.eachReg, '')
                        code += 'miniRender.tools.each('+ coding +', function($value, $key) {'
                    } else if (this.endEachReg.test(coding)) {
                        code += '});'
                    } else {
                        // filter
                        if (this.filterReg.test(coding)) {
                            if (coding.split('|').length !== 2) {
                                throw new Error('Filter used incorrectly')
                            }
                            var temp = coding.split(/\s*\|\s*/)
                            var filterName = temp[1]
                            coding = temp[0]
                            code += 'var handleCoding = ' + coding + ';'
                            if (filterName) {
                                code += 'if (filters["'+ filterName +'"]) {'
                                code += '   handleCoding = filters["'+ filterName +'"](handleCoding)'
                                code += '}'
                            }
                        } else {
                            // normal
                            code += 'var handleCoding = ' + coding + ';'
                        }
                        code += 'if (miniRender.tools.is(handleCoding, "Array") || miniRender.tools.is(handleCoding, "Object")) {'
                        code += '   output += JSON.stringify(handleCoding)'
                        code += '} else if (miniRender.tools.is(handleCoding, "Null") || miniRender.tools.is(handleCoding, "Undefined")) {'
                        code += '   output += ""'
                        code += '} else {'
                        code += '   output += (handleCoding)'
                        code += '}'
                    }
                }
                code += "output +='" + str + "';"
            }
            code +='return output'
            // return render Function
            return new Function('__MINI_RENDER__', code)
        }
    }
    return new Render()
}));